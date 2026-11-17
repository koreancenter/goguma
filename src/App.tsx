import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Domain Types strictly matching docs/06_DATA_SCHEMA.md
import { ProjectEntity, FormInputEntity, DomainBusinessRule, SitePlan } from './types';
import { INITIAL_SITE_PLAN } from './lib/initialPlan';
import { GOGUMA_CHAPTERS } from './lib/chapterData';
import { normalizeBusinessRules, hasMeaningfulRuleContent } from './lib/businessRulesSerializer';
import { db, doc, setDoc, getDoc } from './lib/localDb';
import { auth, LocalUser } from './lib/localAuth';

// Contexts
import { SitePlanProvider } from './contexts/SitePlanContext';
import { StudioHeaderProvider } from './contexts/StudioHeaderContext';
import { useLanguage } from './contexts/LanguageContext';

// Navigation Layout
import Navbar from './components/classic/layout/Navbar';
import Footer from './components/classic/layout/Footer';

// Code-split routes & heavy dialogs for optimal First Contentful Paint and deferred script loading
const WorkspaceView = lazy(() => import('./components/workspace/WorkspaceView'));
const LandingPage = lazy(() => import('./components/classic/LandingPage'));
const LoginGateway = lazy(() => import('./components/auth/LoginGateway'));
const MyAccount = lazy(() => import('./components/classic/profile/MyAccount'));
const TermsOfService = lazy(() => import('./components/classic/legal/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./components/classic/legal/PrivacyPolicy'));
const OpenSourceLicensePage = lazy(() => import('./components/classic/legal/OpenSourceLicensePage'));
const AIPolicyPage = lazy(() => import('./components/classic/legal/AIPolicyPage'));
const CommunityTermsPage = lazy(() => import('./components/classic/legal/CommunityTermsPage'));
const CookiePolicyPage = lazy(() => import('./components/classic/legal/CookiePolicyPage'));
const PreferencesPage = lazy(() => import('./components/pages/PreferencesPage'));
const TemplatesPage = lazy(() => import('./components/pages/TemplatesPage'));
const BackupPage = lazy(() => import('./components/pages/BackupPage'));
const ExportSpecPage = lazy(() => import('./components/pages/ExportSpecPage'));
const CreateAccountPage = lazy(() => import('./components/pages/CreateAccountPage'));
const LogoutPage = lazy(() => import('./components/pages/LogoutPage'));
const About = lazy(() => import('./components/classic/company/About'));
const Contact = lazy(() => import('./components/classic/company/Contact'));
const CustomerService = lazy(() => import('./components/classic/company/CustomerService'));
const Community = lazy(() => import('./components/classic/company/Community'));
const OnboardingTutorial = lazy(() =>
  import('./components/guide/OnboardingTutorial').then(m => ({ default: m.OnboardingTutorial }))
);

// Fallback loader in Gallery White & Sejong Sumi Ink
const PageLoader = () => (
  <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center gap-3">
    <div className="w-7 h-7 border-2 border-[#E4E2DC] border-t-[#111111] rounded-full animate-spin" />
    <span className="text-[11px] font-sans tracking-[0.2em] text-[#111111] uppercase font-medium">GOGUMA STUDIO</span>
  </div>
);

// Default initial project entity
const createInitialProject = (): ProjectEntity => {
  const now = new Date().toISOString();
  return {
    id: 'proj_default_local',
    name: '모던 웹 서비스 기획서',
    slug: 'modern-web-service-spec',
    createdAt: now,
    updatedAt: now,
    currentChapter: 1,
    currentSection: 'project_name',
    lockedChapters: [],
  };
};

function ProtectedRoute({ user, children }: { user: LocalUser | null; children: React.ReactElement }) {
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

export default function App() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  // --------------------------------------------------------------------------
  // Local-First Auth State (Zero Server Independent Session)
  // --------------------------------------------------------------------------
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(() => auth.currentUser);

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login', { replace: true, state: null });
  };

  // --------------------------------------------------------------------------
  // 1. Unidirectional Local-First State (docs/06_DATA_SCHEMA.md)
  // --------------------------------------------------------------------------
  const [project, setProject] = useState<ProjectEntity>(createInitialProject);
  const [plan, setPlan] = useState<SitePlan>(INITIAL_SITE_PLAN);
  const [formInputs, setFormInputs] = useState<Record<string, FormInputEntity>>({});
  const [updatedChapters, setUpdatedChapters] = useState<Set<number>>(() => new Set());

  // --------------------------------------------------------------------------
  // 2. UI Layout & Viewport Ergonomics State
  // --------------------------------------------------------------------------

  // Large-text accessibility mode (50+ ergonomics)
  const [largeTextMode, setLargeTextMode] = useState<boolean>(() => {
    return localStorage.getItem('goguma_large_text') === 'true';
  });

  const toggleLargeTextMode = () => {
    setLargeTextMode(prev => {
      const next = !prev;
      localStorage.setItem('goguma_large_text', String(next));
      return next;
    });
  };

  // --------------------------------------------------------------------------
  // 3. Persistence Indicator State (Clean UX: Saving... -> Saved at hh:mm:ss)
  // --------------------------------------------------------------------------
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  // Ref tracking for shortcut handlers
  const planRef = useRef(plan);
  planRef.current = plan;
  const formInputsRef = useRef(formInputs);
  formInputsRef.current = formInputs;
  const projectRef = useRef(project);
  projectRef.current = project;

  // --------------------------------------------------------------------------
  // 4. Initial Local Storage (IndexedDB) Hydration
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    async function hydrateFromLocalDb() {
      try {
        // Load active project doc (backward-compatible: default lockedChapters to [] if undefined)
        const projSnap = await getDoc(doc(db, 'projects', 'active_project'));
        if (projSnap.exists() && isMounted) {
          const loadedProj = projSnap.data() as ProjectEntity;
          setProject({
            ...loadedProj,
            lockedChapters: Array.isArray(loadedProj.lockedChapters) ? loadedProj.lockedChapters : [],
          });
        }

        // Load active plan doc
        const planSnap = await getDoc(doc(db, 'plans', 'active_plan'));
        if (planSnap.exists() && isMounted) {
          const loadedPlan = planSnap.data() as SitePlan;
          setPlan(loadedPlan);
        }

        // Load form inputs map (backward-compatible: default businessRules to [] & isLocked to false if undefined)
        const inputsSnap = await getDoc(doc(db, 'form_inputs', 'active_inputs'));
        if (inputsSnap.exists() && isMounted) {
          const loadedInputs = (inputsSnap.data() || {}) as Record<string, FormInputEntity>;
          const normalizedInputs: Record<string, FormInputEntity> = {};
          for (const [k, entry] of Object.entries(loadedInputs)) {
            if (!entry || typeof entry !== 'object') continue;
            normalizedInputs[k] = {
              ...entry,
              businessRules: normalizeBusinessRules(entry.businessRules),
              isLocked: Boolean(entry.isLocked),
            };
          }
          setFormInputs(normalizedInputs);
        }
      } catch (err) {
        console.warn('Local database hydration notice (first load or fresh browser session):', err);
      }
    }

    hydrateFromLocalDb();

    return () => {
      isMounted = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // --------------------------------------------------------------------------
  // 5. Auto-persistence Debounce (300ms) with Zero-Flicker Status Feedback
  // --------------------------------------------------------------------------
  const schedulePersistence = useCallback(() => {
    setSaveStatus('saving');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(async () => {
      try {
        await Promise.all([
          setDoc(doc(db, 'projects', 'active_project'), projectRef.current),
          setDoc(doc(db, 'plans', 'active_plan'), planRef.current),
          setDoc(doc(db, 'form_inputs', 'active_inputs'), formInputsRef.current),
        ]);

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        setLastSavedTime(timeStr);
        setSaveStatus('saved');
      } catch (e) {
        console.error('Failed to save state to local IndexedDB:', e);
        setSaveStatus('idle');
      }
    }, 300);
  }, []);

  // --------------------------------------------------------------------------
  // 6. User Action Handlers (Chapter/Section Navigation, Text Sync)
  // --------------------------------------------------------------------------
  const handleSelectChapter = useCallback((chapterId: number) => {
    const ch = GOGUMA_CHAPTERS.find(c => c.id === chapterId);
    if (!ch) return;
    const firstSectionKey = ch.sections[0]?.key || 'overview';
    setProject(prev => ({
      ...prev,
      currentChapter: chapterId,
      currentSection: firstSectionKey,
      updatedAt: new Date().toISOString(),
    }));
    schedulePersistence();
  }, [schedulePersistence]);

  const handleSelectSection = useCallback((sectionKey: string) => {
    setProject(prev => ({
      ...prev,
      currentSection: sectionKey,
      updatedAt: new Date().toISOString(),
    }));
    schedulePersistence();
  }, [schedulePersistence]);

  const handleInputChange = useCallback((chapterId: number, sectionKey: string, text: string) => {
    const key = `${chapterId}_${sectionKey}`;
    if (projectRef.current.lockedChapters?.includes(chapterId) || formInputsRef.current[key]?.isLocked) {
      return;
    }

    const now = new Date().toISOString();

    setFormInputs(prev => {
      const existing = prev[key];
      return {
        ...prev,
        [key]: {
          ...(existing || {}),
          id: existing?.id || `input_${key}`,
          projectId: existing?.projectId || projectRef.current.id,
          chapterId,
          sectionKey,
          userRawInput: text,
          businessRules: normalizeBusinessRules(existing?.businessRules),
          isLocked: Boolean(existing?.isLocked),
          lastSavedAt: now,
        }
      };
    });

    setUpdatedChapters(prev => {
      if (prev.has(chapterId)) return prev;
      const next = new Set(prev);
      next.add(chapterId);
      return next;
    });

    // Auto-reflect to high-level SitePlan properties for immediate prototype responsiveness
    if (chapterId === 1 && sectionKey === 'project_name' && text.trim()) {
      setPlan(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          projectName: text.trim(),
          title: text.trim(),
        }
      }));
      setProject(prev => ({ ...prev, name: text.trim() }));
    } else if (chapterId === 1 && sectionKey === 'target_user' && text.trim()) {
      setPlan(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          targetAudience: text.trim(),
        }
      }));
    } else if (chapterId === 1 && sectionKey === 'primary_goal' && text.trim()) {
      setPlan(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          description: text.trim(),
        }
      }));
    }

    schedulePersistence();
  }, [schedulePersistence]);

  const handleBusinessRulesChange = useCallback((chapterId: number, sectionKey: string, businessRules: DomainBusinessRule[]) => {
    const key = `${chapterId}_${sectionKey}`;
    if (projectRef.current.lockedChapters?.includes(chapterId) || formInputsRef.current[key]?.isLocked) {
      return;
    }

    const now = new Date().toISOString();

    setFormInputs(prev => {
      const existing = prev[key];
      return {
        ...prev,
        [key]: {
          ...(existing || {}),
          id: existing?.id || `input_${key}`,
          projectId: existing?.projectId || projectRef.current.id,
          chapterId,
          sectionKey,
          userRawInput: existing?.userRawInput || '',
          businessRules: normalizeBusinessRules(businessRules),
          isLocked: Boolean(existing?.isLocked),
          lastSavedAt: now,
        }
      };
    });

    setUpdatedChapters(prev => {
      if (prev.has(chapterId)) return prev;
      const next = new Set(prev);
      next.add(chapterId);
      return next;
    });

    schedulePersistence();
  }, [schedulePersistence]);

  const handleToggleChapterLock = useCallback((chapterId: number) => {
    const currentLocked = Array.isArray(projectRef.current.lockedChapters)
      ? projectRef.current.lockedChapters
      : [];
    const nextLocked = !currentLocked.includes(chapterId);
    const now = new Date().toISOString();

    setProject(prev => {
      const prevList = Array.isArray(prev.lockedChapters) ? prev.lockedChapters : [];
      const updatedList = nextLocked
        ? Array.from(new Set([...prevList, chapterId])).sort((a, b) => a - b)
        : prevList.filter(id => id !== chapterId);
      return {
        ...prev,
        lockedChapters: updatedList,
        updatedAt: now,
      };
    });

    const chapterDef = GOGUMA_CHAPTERS.find(c => c.id === chapterId);
    if (chapterDef) {
      setFormInputs(prev => {
        const nextInputs = { ...prev };
        for (const sec of chapterDef.sections) {
          const key = `${chapterId}_${sec.key}`;
          const existing = nextInputs[key];
          nextInputs[key] = {
            ...(existing || {}),
            id: existing?.id || `input_${key}`,
            projectId: existing?.projectId || projectRef.current.id,
            chapterId,
            sectionKey: sec.key,
            userRawInput: existing?.userRawInput || '',
            businessRules: normalizeBusinessRules(existing?.businessRules),
            isLocked: nextLocked,
            lastSavedAt: now,
          };
        }
        return nextInputs;
      });
    }

    if (nextLocked) {
      setUpdatedChapters(prev => {
        if (!prev.has(chapterId)) return prev;
        const next = new Set(prev);
        next.delete(chapterId);
        return next;
      });
    }

    schedulePersistence();
  }, [schedulePersistence]);

  // Navigate next / prev section
  const handleNavigateSection = useCallback((direction: 'prev' | 'next') => {
    const currentCh = GOGUMA_CHAPTERS.find(c => c.id === project.currentChapter) || GOGUMA_CHAPTERS[0];
    const currentIndex = currentCh.sections.findIndex(s => s.key === project.currentSection);

    if (direction === 'next') {
      if (currentIndex < currentCh.sections.length - 1) {
        handleSelectSection(currentCh.sections[currentIndex + 1].key);
      } else {
        const nextChapterId = project.currentChapter + 1;
        if (nextChapterId <= GOGUMA_CHAPTERS.length) {
          handleSelectChapter(nextChapterId);
        }
      }
    } else {
      if (currentIndex > 0) {
        handleSelectSection(currentCh.sections[currentIndex - 1].key);
      } else {
        const prevChapterId = project.currentChapter - 1;
        if (prevChapterId >= 1) {
          const prevCh = GOGUMA_CHAPTERS.find(c => c.id === prevChapterId);
          if (prevCh) {
            setProject(prev => ({
              ...prev,
              currentChapter: prevChapterId,
              currentSection: prevCh.sections[prevCh.sections.length - 1].key,
              updatedAt: new Date().toISOString(),
            }));
            schedulePersistence();
          }
        }
      }
    }
  }, [project.currentChapter, project.currentSection, handleSelectSection, handleSelectChapter, schedulePersistence]);

  // Global Ergonomic Shortcuts (Cmd+Enter: next, Cmd+E: export zip)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key === 'Enter') {
        e.preventDefault();
        handleNavigateSection('next');
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        import('./lib/bundleZipDownloader').then(({ downloadBlueprintZip }) => {
          downloadBlueprintZip(planRef.current, formInputsRef.current, projectRef.current.lockedChapters);
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNavigateSection]);

  // Completed chapters computation for visual checkmarks
  const completedChapters = React.useMemo(() => {
    const set = new Set<number>();
    for (const ch of GOGUMA_CHAPTERS) {
      const allFilled = ch.sections.every(s => {
        const entry = formInputs[`${ch.id}_${s.key}`];
        const val = entry?.userRawInput || '';
        const hasRules = normalizeBusinessRules(entry?.businessRules).some(hasMeaningfulRuleContent);
        return val.trim().length > 0 || hasRules;
      });
      if (allFilled) set.add(ch.id);
    }
    return set;
  }, [formInputs]);

  const handleApplyPrdTemplate = useCallback((template: any) => {
    const newName = template.plan?.metadata?.projectName || template.name;
    setProject(prev => ({
      ...prev,
      name: newName,
      slug: template.id,
      updatedAt: new Date().toISOString(),
    }));

    setPlan(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        ...template.plan.metadata,
        projectName: newName,
        title: newName,
      },
      design: {
        ...prev.design,
        ...template.plan.design,
      },
      navigation: {
        ...prev.navigation,
        ...template.plan.navigation,
      },
    }));

    if (template.formInputs) {
      Object.entries(template.formInputs).forEach(([key, val]) => {
        handleInputChange(1, key, val as string);
      });
    }

    schedulePersistence();
  }, [handleInputChange, schedulePersistence]);

  const handleUpdateProjectName = useCallback((newName: string) => {
    setProject(prev => ({ ...prev, name: newName }));
    setPlan(prev => ({
      ...prev,
      metadata: { ...prev.metadata, projectName: newName, title: newName },
    }));
    schedulePersistence();
  }, [schedulePersistence]);

  return (
    <SitePlanProvider plan={plan} onChange={setPlan}>
      <StudioHeaderProvider
        value={{
          projectName: project.name,
          currentChapter: project.currentChapter,
          currentSection: project.currentSection,
          formInputs,
          completedChapters,
          currentUser,
          onUpdateProjectName: handleUpdateProjectName,
          onSelectChapter: handleSelectChapter,
          onSelectSection: handleSelectSection,
        }}
      >
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Local-First Authentication Gateway */}
          <Route path="/login" element={<LoginGateway />} />

          {/* Workspace: The 4-Column Root Orchestrator (Protected) */}
          <Route 
            path="/workspace" 
            element={
              <ProtectedRoute user={currentUser}>
                <WorkspaceView
                  project={project}
                  setProject={setProject}
                  plan={plan}
                  setPlan={setPlan}
                  formInputs={formInputs}
                  saveStatus={saveStatus}
                  lastSavedTime={lastSavedTime}
                  largeTextMode={largeTextMode}
                  toggleLargeTextMode={toggleLargeTextMode}
                  completedChapters={completedChapters}
                  updatedChapters={updatedChapters}
                  handleToggleChapterLock={handleToggleChapterLock}
                  handleSelectChapter={handleSelectChapter}
                  handleSelectSection={handleSelectSection}
                  handleInputChange={handleInputChange}
                  handleBusinessRulesChange={handleBusinessRulesChange}
                  handleNavigateSection={handleNavigateSection}
                  schedulePersistence={schedulePersistence}
                  currentUser={currentUser}
                />
              </ProtectedRoute>
            } 
          />

          {/* Profile & Settings (Protected) */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute user={currentUser}>
                <div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col font-sans">
                  <Navbar />
                  <main className="flex-1">
                    <MyAccount />
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            } 
          />

          {/* Workspace & Utility Full-Page Views (Replacing All Modals) */}
          <Route
            path="/settings"
            element={
              <div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col font-sans">
                <Navbar />
                <main className="flex-1">
                  <PreferencesPage
                    largeTextMode={largeTextMode}
                    onToggleLargeTextMode={toggleLargeTextMode}
                    currentUser={currentUser}
                  />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/templates"
            element={
              <div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col font-sans">
                <Navbar />
                <main className="flex-1">
                  <TemplatesPage onApplyTemplate={handleApplyPrdTemplate} />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/backup"
            element={
              <div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col font-sans">
                <Navbar />
                <main className="flex-1">
                  <BackupPage formInputs={formInputs} lockedChapters={project.lockedChapters} />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/export"
            element={
              <div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col font-sans">
                <Navbar />
                <main className="flex-1">
                  <ExportSpecPage
                    plan={plan}
                    formInputs={formInputs}
                    lockedChapters={project.lockedChapters}
                    updatedChapters={updatedChapters}
                  />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/create-account"
            element={
              <div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col font-sans">
                <Navbar />
                <main className="flex-1">
                  <CreateAccountPage />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/logout"
            element={
              <ProtectedRoute user={currentUser}>
                <div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col font-sans">
                  <Navbar />
                  <main className="flex-1">
                    <LogoutPage currentUser={currentUser} onConfirmLogout={handleLogout} />
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Legal & Informational Pages */}
          <Route path="/terms" element={<div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col font-sans"><Navbar /><main className="flex-1"><TermsOfService /></main><Footer /></div>} />
          <Route path="/license" element={<div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col font-sans"><Navbar /><main className="flex-1"><OpenSourceLicensePage /></main><Footer /></div>} />
          <Route path="/privacy" element={<div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col font-sans"><Navbar /><main className="flex-1"><PrivacyPolicy /></main><Footer /></div>} />
          <Route path="/ai-policy" element={<div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col font-sans"><Navbar /><main className="flex-1"><AIPolicyPage /></main><Footer /></div>} />
          <Route path="/community-terms" element={<div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col font-sans"><Navbar /><main className="flex-1"><CommunityTermsPage /></main><Footer /></div>} />
          <Route path="/cookies" element={<div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col font-sans"><Navbar /><main className="flex-1"><CookiePolicyPage /></main><Footer /></div>} />
          <Route path="/about" element={<div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col font-sans"><Navbar /><main className="flex-1"><About /></main><Footer /></div>} />
          <Route path="/contact" element={<div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col font-sans"><Navbar /><main className="flex-1"><Contact /></main><Footer /></div>} />
          <Route path="/support" element={<div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col font-sans"><Navbar /><main className="flex-1"><CustomerService /></main><Footer /></div>} />
          <Route path="/community" element={<div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col font-sans"><Navbar /><main className="flex-1"><Community /></main><Footer /></div>} />
          <Route path="/welcome" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />

          {/* Fallbacks: Root access checks session */}
          <Route path="/" element={currentUser ? <Navigate to="/workspace" replace /> : <Navigate to="/login" replace />} />
          <Route path="*" element={currentUser ? <Navigate to="/workspace" replace /> : <Navigate to="/login" replace />} />
        </Routes>
      </Suspense>

      <Suspense fallback={null}>
        <OnboardingTutorial />
      </Suspense>
      </StudioHeaderProvider>
    </SitePlanProvider>
  );
}
