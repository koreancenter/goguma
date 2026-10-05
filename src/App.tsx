import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

// Domain Types strictly matching docs/06_DATA_SCHEMA.md
import { ProjectEntity, FormInputEntity, SitePlan } from './types';
import { INITIAL_SITE_PLAN } from './lib/initialPlan';
import { GOGUMA_CHAPTERS } from './lib/chapterData';
import { db, doc, setDoc, getDoc } from './lib/localDb';
import { auth, LocalUser } from './lib/localAuth';

// Contexts
import { SitePlanProvider } from './contexts/SitePlanContext';
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
const About = lazy(() => import('./components/classic/company/About'));
const Contact = lazy(() => import('./components/classic/company/Contact'));
const CustomerService = lazy(() => import('./components/classic/company/CustomerService'));
const Community = lazy(() => import('./components/classic/company/Community'));
const LogoutConfirmModal = lazy(() => import('./components/auth/LogoutConfirmModal'));
const OnboardingTutorial = lazy(() =>
  import('./components/guide/OnboardingTutorial').then(m => ({ default: m.OnboardingTutorial }))
);

// Fallback loader
const PageLoader = () => (
  <div className="min-h-screen bg-[#0B0C10] flex flex-col items-center justify-center gap-3">
    <div className="w-8 h-8 border-2 border-white/10 border-t-[#C5A880] rounded-full animate-spin" />
    <span className="text-xs font-mono text-[#9AA5B5]">GOGUMA</span>
  </div>
);

// Default initial project entity
const createInitialProject = (): ProjectEntity => {
  const now = new Date().toISOString();
  return {
    id: 'proj_default_local',
    name: '우리동네 동물병원 예약장부',
    slug: 'vet-appointment-book',
    createdAt: now,
    updatedAt: now,
    currentChapter: 1,
    currentSection: 'project_name',
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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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

  // --------------------------------------------------------------------------
  // 2. UI Layout & Viewport Ergonomics State
  // --------------------------------------------------------------------------
  const [isCol1Collapsed, setIsCol1Collapsed] = useState(false);
  const [isCol2Collapsed, setIsCol2Collapsed] = useState(false);
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);

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

  const togglePreviewCollapsed = () => {
    setIsPreviewCollapsed(prev => !prev);
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
        // Load active project doc
        const projSnap = await getDoc(doc(db, 'projects', 'active_project'));
        if (projSnap.exists() && isMounted) {
          const loadedProj = projSnap.data() as ProjectEntity;
          setProject(loadedProj);
        }

        // Load active plan doc
        const planSnap = await getDoc(doc(db, 'plans', 'active_plan'));
        if (planSnap.exists() && isMounted) {
          const loadedPlan = planSnap.data() as SitePlan;
          setPlan(loadedPlan);
        }

        // Load form inputs map
        const inputsSnap = await getDoc(doc(db, 'form_inputs', 'active_inputs'));
        if (inputsSnap.exists() && isMounted) {
          const loadedInputs = inputsSnap.data() as Record<string, FormInputEntity>;
          setFormInputs(loadedInputs);
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
    const now = new Date().toISOString();

    setFormInputs(prev => ({
      ...prev,
      [key]: {
        id: `input_${key}`,
        projectId: projectRef.current.id,
        chapterId,
        sectionKey,
        userRawInput: text,
        lastSavedAt: now,
      }
    }));

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

  // Global Ergonomic Shortcuts (Cmd+Enter: next, Cmd+E: export zip, Esc: toggle bar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key === 'Enter') {
        e.preventDefault();
        handleNavigateSection('next');
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        import('./lib/bundleZipDownloader').then(({ downloadBlueprintZip }) => {
          downloadBlueprintZip(planRef.current, formInputsRef.current);
        });
      } else if (e.key === 'Escape') {
        setIsCol1Collapsed(prev => !prev);
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
        const val = formInputs[`${ch.id}_${s.key}`]?.userRawInput || '';
        return val.trim().length > 0;
      });
      if (allFilled) set.add(ch.id);
    }
    return set;
  }, [formInputs]);

  return (
    <SitePlanProvider plan={plan} onChange={setPlan}>
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
                  isPreviewCollapsed={isPreviewCollapsed}
                  togglePreviewCollapsed={togglePreviewCollapsed}
                  isCol1Collapsed={isCol1Collapsed}
                  setIsCol1Collapsed={setIsCol1Collapsed}
                  isCol2Collapsed={isCol2Collapsed}
                  setIsCol2Collapsed={setIsCol2Collapsed}
                  completedChapters={completedChapters}
                  handleSelectChapter={handleSelectChapter}
                  handleSelectSection={handleSelectSection}
                  handleInputChange={handleInputChange}
                  handleNavigateSection={handleNavigateSection}
                  schedulePersistence={schedulePersistence}
                  currentUser={currentUser}
                  onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
                />
              </ProtectedRoute>
            } 
          />

          {/* Profile & Settings (Protected) */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute user={currentUser}>
                <div className="min-h-screen bg-[#0B0C10] text-[#F0F3F6] flex flex-col font-sans">
                  <header className="h-14 px-6 bg-[#0E1217] border-b border-white/7 flex items-center justify-between">
                    <button
                      onClick={() => navigate('/workspace')}
                      className="flex items-center gap-2 text-xs font-medium text-[#9AA5B5] hover:text-[#F0F3F6] transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                      <span>작업실로 복귀</span>
                    </button>
                    <span className="font-semibold text-xs text-[#F0F3F6]">사용자 설정 및 통계</span>
                  </header>
                  <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
                    <MyAccount />
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            } 
          />

          {/* Legal & Informational Pages */}
          <Route path="/terms" element={<div className="min-h-screen bg-[#F8F4EB] flex flex-col"><Navbar /><main className="flex-1"><TermsOfService /></main><Footer /></div>} />
          <Route path="/license" element={<Navigate to="/terms" replace />} />
          <Route path="/privacy" element={<div className="min-h-screen bg-[#F8F4EB] flex flex-col"><Navbar /><main className="flex-1"><PrivacyPolicy /></main><Footer /></div>} />
          <Route path="/about" element={<div className="min-h-screen bg-[#F8F4EB] flex flex-col"><Navbar /><main className="flex-1"><About /></main><Footer /></div>} />
          <Route path="/contact" element={<div className="min-h-screen bg-[#F8F4EB] flex flex-col"><Navbar /><main className="flex-1"><Contact /></main><Footer /></div>} />
          <Route path="/support" element={<div className="min-h-screen bg-[#F8F4EB] flex flex-col"><Navbar /><main className="flex-1"><CustomerService /></main><Footer /></div>} />
          <Route path="/community" element={<div className="min-h-screen bg-[#F8F4EB] flex flex-col"><Navbar /><main className="flex-1"><Community /></main><Footer /></div>} />
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

      {isLogoutModalOpen && (
        <Suspense fallback={null}>
          <LogoutConfirmModal
            isOpen={isLogoutModalOpen}
            onClose={() => setIsLogoutModalOpen(false)}
            onConfirm={handleLogout}
            userName={currentUser?.displayName}
          />
        </Suspense>
      )}
    </SitePlanProvider>
  );
}
