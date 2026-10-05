import React, { useState, useCallback, useMemo } from 'react';
import { SitePlan } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Save,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Globe,
  Search,
  Settings,
  ArrowRight,
  FileCode,
  HelpCircle,
  Briefcase,
  MessageSquare,
  Network,
  Layout,
  PenTool,
  Check,
  Link,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import beautifier from 'js-beautify';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { translateToEnglishSlug, refinePageScript, generateSEOData, generateSingleSEOField } from '../../services/geminiService';
import { compileLocalSEOData } from '../../lib/deterministicArchitect';
import { useLanguage } from '../../contexts/LanguageContext';
import { generateSlug } from '../../lib/utils';
import VisualSitemap from '../preview/VisualSitemap';
import { IconButton, Tooltip } from '../guide/Tooltip';
import { useSitePlan } from '../../contexts/SitePlanContext';
import { StepHeader } from './StepHeader';

const PAGE_TEMPLATES = [
  {
    id: 'standard',
    name: 'template_standard',
    icon: FileText,
    script: `// Standard Content Page Template
<header>
  <h1>Welcome to [Page Name]</h1>
  <p>Providing excellence and quality in every detail.</p>
</header>

<section id="features">
  <h2>Our Core Values</h2>
  <ul>
    <li>Transparency and Trust</li>
    <li>Customer-Centric Innovation</li>
    <li>Professionalism & Expertise</li>
  </ul>
</section>

<section id="content">
  <article>
    <h3>Our Story</h3>
    <p>Established with a vision to redefine the industry, [Page Name] has been at the forefront of innovation...</p>
  </article>
</section>

<footer>
  <p>&copy; ${new Date().getFullYear()} [Site Name]. All rights reserved.</p>
</footer>`
  },
  {
    id: 'contact',
    name: 'template_contact',
    icon: Globe,
    script: `// Contact Form Page Template
<section id="contact-info">
  <h1>Get in Touch</h1>
  <p>We'd love to hear from you. Please reach out with any questions or feedback.</p>
  <ul>
    <li>Email: info@example.com</li>
    <li>Phone: +1 (555) 000-0000</li>
    <li>Office: 123 Vision Street, Seoul, South Korea</li>
  </ul>
</section>

<section id="form">
  <h2>Send us a Message</h2>
  <form>
    <div class="field">
      <label>Name</label>
      <input type="text" placeholder="Your Name" />
    </div>
    <div class="field">
      <label>Email</label>
      <input type="email" placeholder="Email Address" />
    </div>
    <div class="field">
      <label>Message</label>
      <textarea placeholder="How can we help?"></textarea>
    </div>
    <button type="submit">Submit Message</button>
  </form>
</section>`
  },
  {
    id: 'blog',
    name: 'template_blog',
    icon: FileCode,
    script: `// Blog Post Page Template
<article class="post">
  <header>
    <h1 class="post-title">[Post Title Goes Here]</h1>
    <div class="meta">
      <span class="author">By Admin</span>
      <span class="date">${new Date().toLocaleDateString()}</span>
      <span class="category">Technology</span>
    </div>
  </header>

  <div class="post-body">
    <p class="lead">Introduction to the fascinating world of [Topic]...</p>
    
    <h2>The Main Content</h2>
    <p>Detailed analysis and insights into the current trends...</p>

    <blockquote>
      "The future of [Topic] is shaped by the decisions we make today."
    </blockquote>

    <p>Closing thoughts on how to leverage these insights...</p>
  </div>

  <footer class="post-footer">
    <div class="tags">
      <span>#WebDesign</span> <span>#AI</span> <span>#Planning</span>
    </div>
  </footer>
</article>`
  },
  {
    id: 'faq',
    name: 'template_faq',
    icon: HelpCircle,
    script: `// FAQ Page Template
<section id="faq">
  <h1>Frequently Asked Questions</h1>
  <p>Find answers to common questions about our services and policies.</p>

  <div class="faq-item">
    <h3>Q: What is the turnaround time for a project?</h3>
    <p>A: Most standard projects are completed within 2-4 weeks, depending on complexity.</p>
  </div>

  <div class="faq-item">
    <h3>Q: Do you offer ongoing support?</h3>
    <p>A: Yes, we provide various maintenance plans to ensure your site stays updated and secure.</p>
  </div>

  <div class="faq-item">
    <h3>Q: Can I request custom features?</h3>
    <p>A: Absolutely! We specialize in tailored solutions to meet your specific business needs.</p>
  </div>
</section>`
  },
  {
    id: 'portfolio',
    name: 'template_portfolio',
    icon: Briefcase,
    script: `// Portfolio Page Template
<section id="portfolio-header">
  <h1>Our Work</h1>
  <p>Explore our recent projects and success stories.</p>
</section>

<div class="project-grid">
  <article class="project-card">
    <div class="project-image">[Project Screenshot Placeholder]</div>
    <h3>Eco-Friendly E-commerce</h3>
    <p>A complete redesign focused on sustainability and user experience.</p>
    <a href="#">View Details</a>
  </article>

  <article class="project-card">
    <div class="project-image">[Project Screenshot Placeholder]</div>
    <h3>AI-Powered Analytics Dashboard</h3>
    <p>Real-time data visualization tool for enterprise-level decision making.</p>
    <a href="#">View Details</a>
  </article>

  <article class="project-card">
    <div class="project-image">[Project Screenshot Placeholder]</div>
    <h3>Corporate Identity Rebranding</h3>
    <p>Modernizing a legacy brand for the digital age.</p>
    <a href="#">View Details</a>
  </article>
</div>`
  },
  {
    id: 'testimonial',
    name: 'template_testimonial',
    icon: MessageSquare,
    script: `// Testimonial Page Template
<section id="testimonials">
  <h1>What Our Clients Say</h1>
  <p>Hear from the people we've had the pleasure of working with.</p>

  <div class="testimonial-list">
    <blockquote class="testimonial">
      <p>"The team delivered beyond our expectations. Their attention to detail is unmatched."</p>
      <footer>- Jane Doe, CEO of TechCorp</footer>
    </blockquote>

    <blockquote class="testimonial">
      <p>"A seamless experience from start to finish. Highly recommended for any serious business."</p>
      <footer>- John Smith, Founder of StartupX</footer>
    </blockquote>

    <blockquote class="testimonial">
      <p>"Innovative solutions and exceptional professionalism. We couldn't be happier."</p>
      <footer>- Sarah Lee, Marketing Director</footer>
    </blockquote>
  </div>
</section>`
  }
];

interface SortableItemProps {
  key?: string | number;
  id: string;
  page: SitePlan['navigation']['pageStructure'][0];
  onDepthChange?: (id: string, delta: number) => void;
  onMoveOrder?: (id: string, delta: number) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string | null) => void;
  isActive?: boolean;
  isOverlay?: boolean;
}

function SortableItem({ id, page, onDepthChange, onMoveOrder, onDelete, onEdit, isActive, isOverlay }: SortableItemProps) {
  const { t } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 0 : (isOverlay ? 100 : 1),
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isOverlay ? 'cursor-grabbing' : ''}`}
    >
      <motion.div
        layout
        initial={false}
        animate={{ 
          paddingLeft: `${page.depth * 32}px`,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 1 }}
        className="relative"
      >
        {/* Depth Guides */}
        {page.depth > 0 && Array.from({ length: page.depth }).map((_, i) => (
          <div 
            key={i}
            className="absolute top-0 bottom-0 border-l-2 border-slate-100"
            style={{ left: `${(i * 32) + 16}px` }}
          />
        ))}

        <div className={`group relative flex items-center gap-4 p-5 bg-white border-2 rounded-[24px] transition-all duration-300 ${
          isOverlay ? 'shadow-2xl border-goguma scale-105 rotate-1 ring-4 ring-goguma-light' : 
          (isDragging ? 'border-dashed border-slate-200' : 'shadow-sm border-slate-100 hover:border-goguma-light hover:shadow-md')
        } ${isActive ? 'ring-4 ring-goguma-light border-goguma shadow-lg' : ''}`}>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 text-slate-300 hover:text-goguma transition-colors"
          >
            <GripVertical size={20} />
          </div>

          <div 
            onClick={() => onEdit?.(id)}
            className="flex-1 flex items-center gap-4 cursor-pointer min-w-0"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden transition-all shadow-sm flex-shrink-0 ${
              page.image ? '' : (
                page.depth === 0 ? 'bg-goguma text-white' : 
                page.depth === 1 ? 'bg-goguma-light text-goguma' : 'bg-slate-900 text-white'
              )
            }`}>
              {page.image ? (
                <img src={page.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <FileText size={20} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-black text-slate-900 truncate">{page.name || t('untitled_page')}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">
                {t('level_node', { level: (page.depth + 1).toString() })}
              </p>
            </div>
          </div>

          <div className={`flex items-center justify-end flex-wrap gap-1 transition-all duration-300 ml-auto flex-shrink-0 max-w-[120px] ${isOverlay ? 'hidden' : 'opacity-0 group-hover:opacity-100'}`}>
            <IconButton
              onClick={(e) => { e.stopPropagation(); onMoveOrder?.(id, -1); }}
              icon={ArrowUp}
              tooltip={t('move_up')}
              variant="ghost"
              size="sm"
            />
            <IconButton
              onClick={(e) => { e.stopPropagation(); onMoveOrder?.(id, 1); }}
              icon={ArrowDown}
              tooltip={t('move_down')}
              variant="ghost"
              size="sm"
            />
            <IconButton
              onClick={(e) => { e.stopPropagation(); onDepthChange?.(id, -1); }}
              disabled={page.depth === 0}
              icon={ChevronLeft}
              tooltip={t('outdent')}
              variant="ghost"
              size="sm"
            />
            <IconButton
              onClick={(e) => { e.stopPropagation(); onDepthChange?.(id, 1); }}
              disabled={page.depth === 5}
              icon={ChevronRight}
              tooltip={t('indent')}
              variant="ghost"
              size="sm"
            />
            <IconButton
              onClick={(e) => { e.stopPropagation(); onEdit?.(id); }}
              icon={Settings}
              tooltip={t('page_details')}
              variant="ghost"
              size="sm"
              className={isActive ? 'text-goguma !opacity-100' : 'text-slate-400'}
            />
            <IconButton
              onClick={(e) => { e.stopPropagation(); onDelete?.(id); }}
              icon={Trash2}
              tooltip={t('delete')}
              variant="ghost"
              size="sm"
              className="hover:text-red-500 hover:bg-red-50"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function PageStructureForm({ onBack, onSave }: { onBack?: () => void; onSave?: () => void }) {
  const { plan, setPlan: onChange } = useSitePlan();
  const { t, language } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [isGeneratingField, setIsGeneratingField] = useState<Record<string, boolean>>({});
  const [refineStatus, setRefineStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [scriptUrl, setScriptUrl] = useState('');
  const [isFetchingScript, setIsFetchingScript] = useState(false);

  const handleLoadFromUrl = async () => {
    if (!scriptUrl.trim() || !editingId) return;

    setIsFetchingScript(true);
    setRefineStatus(null);

    try {
      // Basic URL validation
      try {
        new URL(scriptUrl);
      } catch (e) {
        throw new Error(t('invalid_url'));
      }

      // Optional: Check if content is already present and prompt
      const page = plan.navigation.pageStructure.find(p => p.id === editingId);
      if (page && page.script.trim()) {
        if (!confirm(t('confirm_changes') + "?\n\n" + t('empty_script_warn'))) {
          setIsFetchingScript(false);
          return;
        }
      }

      const response = await fetch(scriptUrl);
      if (!response.ok) throw new Error(t('fetch_error'));
      
      const content = await response.text();
      
      if (!content.trim()) {
        throw new Error(t('common_error'));
      }

      onChange({
        ...plan,
        navigation: {
          ...plan.navigation,
          pageStructure: plan.navigation.pageStructure.map((p) =>
            p.id === editingId ? { ...p, script: content } : p
          ),
        }
      });
      
      setRefineStatus({ type: 'success', message: t('success') });
      setScriptUrl('');
    } catch (error) {
      console.error('Fetch error:', error);
      setRefineStatus({ type: 'error', message: error instanceof Error ? error.message : t('common_error') });
    } finally {
      setIsFetchingScript(false);
      setTimeout(() => setRefineStatus(null), 4000);
    }
  };

  const scrollToEditor = () => {
    const editor = document.getElementById('page-editor');
    if (editor) {
      editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleEdit = (id: string | null) => {
    setEditingId(id);
    if (id) {
      // Small timeout to allow DOM to update if needed before scrolling
      setTimeout(scrollToEditor, 100);
    }
  };

  const handleRefineScript = async (forceGenerate = false) => {
    if (!editingId || isRefining) return;
    const page = plan.navigation.pageStructure.find(p => p.id === editingId);
    if (!page) return;

    setIsRefining(true);
    setRefineStatus(null);
    try {
      const context = `
        Page Name: ${page.name}
        Page URL: ${page.slug}
        Purpose: ${plan.metadata?.projectOverview?.purpose || ''}
        Target Audience: ${plan.metadata?.projectOverview?.target || ''}
        Design Tone & Manner: ${plan.metadata?.projectOverview?.toneAndManner || ''}
      `;
      const refined = await refinePageScript(forceGenerate ? '' : page.script, context, language, undefined, plan.deploymentProfile?.mode, plan.metadata?.platform);
      
      if (refined === page.script && page.script.trim() !== '') {
        setRefineStatus({ type: 'error', message: t('common_error') });
      } else {
        onChange({
          ...plan,
          navigation: {
            ...plan.navigation,
            pageStructure: plan.navigation.pageStructure.map((p) =>
              p.id === editingId ? { ...p, script: refined } : p
            ),
          }
        });
        setRefineStatus({ type: 'success', message: forceGenerate ? t('success') : t('script_refined') });
      }
    } catch (error: any) {
      console.error("Failed to refine script:", error);
      const message = error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED' ? t('gemini_rate_limit') : t('common_error');
      setRefineStatus({ type: 'error', message });
    } finally {
      setIsRefining(false);
      setTimeout(() => setRefineStatus(null), 4000);
    }
  };

  const handleFormatScript = () => {
    if (!editingId) return;
    const page = plan.navigation.pageStructure.find(p => p.id === editingId);
    if (!page || !page.script.trim()) return;

    try {
      let formatted = page.script;
      
      // Basic detection: if it contains HTML-like tags, use html beautifier
      const isHtml = /<[a-z][\s\S]*>/i.test(page.script);
      
      if (isHtml) {
        formatted = beautifier.html(page.script, {
          indent_size: 2,
          wrap_line_length: 0,
          preserve_newlines: true,
          max_preserve_newlines: 2,
          indent_inner_html: true,
          extra_liners: []
        });
      } else {
        formatted = beautifier.js(page.script, {
          indent_size: 2,
          wrap_line_length: 0,
          preserve_newlines: true,
          max_preserve_newlines: 2,
          space_in_empty_paren: true
        });
      }

      if (formatted !== page.script) {
        onChange({
          ...plan,
          navigation: {
            ...plan.navigation,
            pageStructure: plan.navigation.pageStructure.map((p) =>
              p.id === editingId ? { ...p, script: formatted } : p
            ),
          }
        });
        setRefineStatus({ type: 'success', message: t('script_formatted') });
        setTimeout(() => setRefineStatus(null), 3000);
      }
    } catch (error) {
      console.error("Failed to format script:", error);
    }
  };

  const handleGenerateSEO = async () => {
    if (!editingId || isGeneratingSEO) return;
    const page = plan.navigation.pageStructure.find(p => p.id === editingId);
    if (!page) return;

    // Apply local deterministic SEO immediately (instant feedback, zero-wait, privacy-first)
    const context = `
      Purpose: ${plan.metadata?.projectOverview?.purpose || ''}
      Target Audience: ${plan.metadata?.projectOverview?.target || ''}
      Design Tone & Manner: ${plan.metadata?.projectOverview?.toneAndManner || ''}
    `;
    const localSEO = compileLocalSEOData(page.name, page.script, context, language, plan.metadata?.platform);
    onChange({
      ...plan,
      navigation: {
        ...plan.navigation,
        pageStructure: plan.navigation.pageStructure.map((p) =>
          p.id === editingId ? { ...p, seoTitle: localSEO.title, seoDescription: localSEO.description, metaDescription: localSEO.description, seoKeywords: localSEO.keywords } : p
        ),
      }
    });

    setIsGeneratingSEO(true);
    setRefineStatus(null);
    try {
      const seoData = await generateSEOData(page.name, page.script, context, language, undefined, plan.deploymentProfile?.mode, plan.metadata?.platform);
      
      onChange({
        ...plan,
        navigation: {
          ...plan.navigation,
          pageStructure: plan.navigation.pageStructure.map((p) =>
            p.id === editingId ? { ...p, seoTitle: seoData.title, seoDescription: seoData.description, metaDescription: seoData.description, seoKeywords: seoData.keywords } : p
          ),
        }
      });
      setRefineStatus({ type: 'success', message: t('seo_recommended') });
    } catch (error: any) {
      console.error("Failed to generate SEO data:", error);
      // Even if AI call fails, local deterministic SEO was already applied!
      setRefineStatus({ type: 'success', message: t('seo_recommended') });
    } finally {
      setIsGeneratingSEO(false);
      setTimeout(() => setRefineStatus(null), 4000);
    }
  };

  const handleGenerateSingleSEO = async (field: 'title' | 'description' | 'keywords' | 'metaDescription') => {
    if (!editingId || isGeneratingField[field]) return;
    const page = plan.navigation.pageStructure.find(p => p.id === editingId);
    if (!page) return;

    setIsGeneratingField(prev => ({ ...prev, [field]: true }));
    try {
      const context = `
        Purpose: ${plan.metadata?.projectOverview?.purpose || ''}
        Target Audience: ${plan.metadata?.projectOverview?.target || ''}
        Design Tone & Manner: ${plan.metadata?.projectOverview?.toneAndManner || ''}
      `;
      const suggestion = await generateSingleSEOField(field, page.name, page.script, context, language, undefined, plan.deploymentProfile?.mode, plan.metadata?.platform);
      
      const fieldMap = {
        title: 'seoTitle',
        description: 'seoDescription',
        keywords: 'seoKeywords',
        metaDescription: 'metaDescription'
      };

      onChange({
        ...plan,
        navigation: {
          ...plan.navigation,
          pageStructure: plan.navigation.pageStructure.map((p) =>
            p.id === editingId ? { ...p, [fieldMap[field]]: suggestion } : p
          ),
        }
      });
    } catch (error) {
      console.error(`Failed to generate SEO ${field}:`, error);
    } finally {
      setIsGeneratingField(prev => ({ ...prev, [field]: false }));
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeIdx = plan.navigation.pageStructure.findIndex((p) => p.id === active.id);
      const overIdx = plan.navigation.pageStructure.findIndex((p) => p.id === over.id);

      if (activeIdx === -1 || overIdx === -1) return;

      const activeItem = plan.navigation.pageStructure[activeIdx];
      
      // Find all descendants of the active item to move them as a block
      const descendants: SitePlan['navigation']['pageStructure'][0][] = [];
      const itemsToMoveIds = [activeItem.id];
      
      for (let i = activeIdx + 1; i < plan.navigation.pageStructure.length; i++) {
        if (plan.navigation.pageStructure[i].depth > activeItem.depth) {
          descendants.push(plan.navigation.pageStructure[i]);
          itemsToMoveIds.push(plan.navigation.pageStructure[i].id);
        } else {
          break;
        }
      }

      const itemsToMove = [activeItem, ...descendants];

      // Remove items to move from current structure
      const remainingItems = plan.navigation.pageStructure.filter(p => !itemsToMoveIds.includes(p.id));

      // Determine where to insert in the remaining list
      let targetIdx = remainingItems.findIndex(p => p.id === over.id);
      if (targetIdx === -1) return; 
      
      // If moving down, we usually want to place it after the 'over' item
      // dnd-kit standard sortable behavior is usually to put it exactly at the index of 'over'
      // but if we are moving a parent, we probably want to place the whole block after/before based on position
      if (overIdx > activeIdx) {
        targetIdx += 1;
      }

      const newPageStructure = [...remainingItems];
      newPageStructure.splice(targetIdx, 0, ...itemsToMove);

      // Re-calculate all slugs to ensure hierarchy consistency
      const syncedStructure = newPageStructure.map((p, idx, arr) => ({
        ...p,
        slug: getFullSlug(p.name, p.depth, idx, arr)
      }));

      onChange({
        ...plan,
        navigation: {
          ...plan.navigation,
          pageStructure: syncedStructure,
        }
      });
    }
    setActiveId(null);
  };

  const handleMoveOrder = (id: string, delta: number) => {
    const pageIdx = plan.navigation.pageStructure.findIndex(p => p.id === id);
    if (pageIdx === -1) return;
    
    const newIdx = pageIdx + delta;
    if (newIdx < 0 || newIdx >= plan.navigation.pageStructure.length) return;
    
    const newPageStructure = arrayMove(plan.navigation.pageStructure, pageIdx, newIdx);
    
    // Re-calculate all slugs to ensure hierarchy consistency
    const syncedStructure = newPageStructure.map((p: any, idx: number, arr: any[]) => ({
      ...p,
      slug: getFullSlug(p.name, p.depth, idx, arr)
    }));

    onChange({
      ...plan,
      navigation: {
        ...plan.navigation,
        pageStructure: syncedStructure,
      }
    });
  };

  const handleDepthChange = (id: string, delta: number) => {
    const pageIdx = plan.navigation.pageStructure.findIndex(p => p.id === id);
    if (pageIdx === -1) return;
    
    // Allow depth up to 5
    const newDepth = Math.max(0, Math.min(5, plan.navigation.pageStructure[pageIdx].depth + delta));
    
    // Use the current structure to calculate names/slugs
    const currentStructure = [...plan.navigation.pageStructure];
    const item = currentStructure[pageIdx];
    
    // Update the item
    currentStructure[pageIdx] = { ...item, depth: newDepth };
    
    // Update its slug based on new depth
    currentStructure[pageIdx].slug = getFullSlug(item.name, newDepth, pageIdx, currentStructure);

    // If it's a parent, we might want to also adjust children?
    // Usually we just let the parent move and children follow relatively?
    // But hierarchical slug logic handles it on save or on change.
    
    // Trigger update for all descendants to fix their slugs too
    for (let i = pageIdx + 1; i < currentStructure.length; i++) {
      if (currentStructure[i].depth > (delta > 0 ? newDepth - delta : newDepth + Math.abs(delta))) {
        currentStructure[i].slug = getFullSlug(currentStructure[i].name, currentStructure[i].depth, i, currentStructure);
      } else {
        break;
      }
    }

    onChange({
      ...plan,
      navigation: {
        ...plan.navigation,
        pageStructure: currentStructure,
      }
    });
  };

  const handleDelete = (id: string) => {
    const newPageStructure = plan.navigation.pageStructure.filter((p) => p.id !== id);

    const newMenus = newPageStructure.filter(p => p.depth === 0).map(p => p.name);

    onChange({
      ...plan,
      navigation: {
        ...plan.navigation,
        menus: Array.from(new Set(newMenus)),
        pageStructure: newPageStructure,
      }
    });
    if (editingId === id) setEditingId(null);
  };

  const getFullSlug = useCallback((name: string, depth: number, idx: number, items: SitePlan['navigation']['pageStructure'] = plan.navigation.pageStructure) => {
    const rawBase = generateSlug(name) || '';
    const base = rawBase.startsWith('/') ? rawBase.substring(1) : rawBase;
    
    if (depth > 0) {
      let parentSlugValue = '';
      for (let i = idx - 1; i >= 0; i--) {
        if (items[i].depth < depth) {
          parentSlugValue = items[i].slug;
          break;
        }
      }
      
      const parentPart = parentSlugValue ? parentSlugValue.replace(/^\/|\/$/g, '') : '';
      
      if (parentPart && base) return `/${parentPart}/${base}`;
      if (parentPart) return `/${parentPart}`;
      if (base) return `/${base}`;
      return '/';
    }
    
    return base ? `/${base}` : '/';
  }, [plan.navigation.pageStructure]);

  const handleAddPage = (templateId?: string) => {
    const newId = Math.random().toString(36).substr(2, 9);
    let initialScript = '';
    let initialName = t('new_page');

    if (templateId) {
      const template = PAGE_TEMPLATES.find(t => t.id === templateId);
      if (template) {
        initialScript = template.script;
        initialName = t(template.name);
      }
    }

    // Ensure unique name and slug
    let finalName = initialName;
    let counter = 1;
    while (plan.navigation.pageStructure.some(p => p.name === finalName)) {
      finalName = `${initialName} ${counter++}`;
    }

    const newPage = { 
      id: newId, 
      name: finalName, 
      slug: getFullSlug(finalName, 0, plan.navigation.pageStructure.length, plan.navigation.pageStructure), 
      depth: 0, 
      script: initialScript 
    };
    
    onChange({
      ...plan,
      navigation: {
        ...plan.navigation,
        pageStructure: [
          ...plan.navigation.pageStructure,
          newPage,
        ],
      }
    });
    setEditingId(newId);
    setShowTemplateMenu(false);
  };

  // AI-driven English slug translation and update
  React.useEffect(() => {
    if (!editingId) return;
    const page = plan.navigation.pageStructure.find(p => p.id === editingId);
    if (!page || !page.name || !/[\u3131-\uD79D]/.test(page.name)) return;

    const timer = setTimeout(async () => {
      try {
        const english = await translateToEnglishSlug(page.name, undefined, plan.deploymentProfile?.mode, plan.metadata?.platform);
        if (!english) return;

        const currentIdx = plan.navigation.pageStructure.findIndex(p => p.id === editingId);
        if (currentIdx === -1) return;
        
        const currentPage = plan.navigation.pageStructure[currentIdx];
        const oldGeneratedSlug = getFullSlug(currentPage.name, currentPage.depth, currentIdx);
        
        // Only update if current slug is still the auto-generated one from the Korean name
        if (currentPage.slug === oldGeneratedSlug || currentPage.slug === '/') {
          const aiSlug = getFullSlug(english, currentPage.depth, currentIdx);
          
          onChange({
            ...plan,
            navigation: {
              ...plan.navigation,
              pageStructure: plan.navigation.pageStructure.map(p => 
                p.id === editingId ? { ...p, slug: aiSlug } : p
              )
            }
          });
        }
      } catch (e) {
        console.warn("Local slug generation notice:", e);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [editingId, plan.navigation.pageStructure]);

  const editingPage = useMemo(() => plan.navigation.pageStructure.find((p) => p.id === editingId), [plan.navigation.pageStructure, editingId]);

  return (
    <div className="space-y-8">
      <StepHeader 
        title={t('navigation_architecture')} 
        subtitle={t('nav_arch_subtitle')} 
        icon={Layout} 
        badge="PHASE 06"
        color="goguma"
      />
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
        {/* Left: Structure Editor */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-xs border border-slate-200/80 min-h-[480px]">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-0.5">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">{t('nav_arch_title')}</h3>
                <p className="text-[11px] text-slate-400 font-medium">{t('drag_drop_organize')}</p>
              </div>
              <div className="flex items-center gap-3">
                {editingId && (
                  <IconButton
                    onClick={scrollToEditor}
                    icon={ArrowRight}
                    tooltip={t('page_details')}
                    variant="secondary"
                  />
                )}
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={plan.navigation.pageStructure.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3 relative">
                  {plan.navigation.pageStructure.map((page) => (
                    <SortableItem
                      key={page.id}
                      id={page.id}
                      page={page}
                      onDepthChange={handleDepthChange}
                      onMoveOrder={handleMoveOrder}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                      isActive={editingId === page.id}
                    />
                  ))}
                </div>
              </SortableContext>

              <div className="mt-6">
                <button
                  onClick={() => handleAddPage()}
                  className="w-full flex items-center justify-center gap-2 p-5 border-2 border-dashed border-slate-100 rounded-[24px] text-slate-400 font-black uppercase tracking-widest hover:border-goguma-light hover:text-goguma hover:bg-goguma-light transition-all group"
                >
                  <Plus size={20} className="group-hover:scale-125 transition-transform" />
                  <span className="text-xs">{t('add_page')}</span>
                </button>
              </div>
              
              <DragOverlay
                dropAnimation={{
                  sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                      active: {
                        opacity: '0.3',
                      },
                    },
                  }),
                }}
              >
                {activeId ? (
                  <SortableItem
                    id={activeId}
                    page={plan.navigation.pageStructure.find((p) => p.id === activeId)!}
                    isOverlay
                  />
                ) : null}
              </DragOverlay>
            </DndContext>

            {plan.navigation.pageStructure.length === 0 && (
              <div className="flex flex-col items-center justify-center h-96 text-slate-200 space-y-4">
                <Network size={64} strokeWidth={1} />
                <p className="text-sm font-black uppercase tracking-widest">{t('no_pages_defined')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Script Editor */}
        <div className="lg:col-span-7" id="page-editor">
          <div className="sticky top-28 space-y-6">
            <AnimatePresence mode="wait">
              {editingPage ? (
                <motion.div
                  key={editingId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-100 space-y-8"
                >
                  <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900">{t('page_details')}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('config_script')}</p>
                      </div>
                    </div>
                    <IconButton
                      onClick={() => setEditingId(null)}
                      icon={X}
                      tooltip={t('close')}
                      variant="ghost"
                      size="sm"
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-goguma uppercase tracking-widest">{t('page_name_label')}</label>
                      <input
                        type="text"
                        value={editingPage.name}
                        onChange={(e) => {
                          const newName = e.target.value;
                          const currentPlan = plan; // Capture current state
                          const pageIdx = currentPlan.navigation.pageStructure.findIndex(p => p.id === editingId);
                          if (pageIdx === -1) return;

                          const oldName = currentPlan.navigation.pageStructure[pageIdx].name;
                          const currentSlug = currentPlan.navigation.pageStructure[pageIdx].slug;
                          
                          // Immediate sync logic
                          const newPageStructure = [...currentPlan.navigation.pageStructure];
                          
                          // Determine if we should auto-update the slug
                          // We update if: it's empty, it's just '/', or it matched the old name's slug
                          const oldGeneratedSlug = getFullSlug(oldName, newPageStructure[pageIdx].depth, pageIdx);
                          const shouldAutoSlug = !currentSlug || currentSlug === '/' || currentSlug === oldGeneratedSlug;

                          let updatedSlug = currentSlug;
                          if (shouldAutoSlug) {
                            updatedSlug = getFullSlug(newName, newPageStructure[pageIdx].depth, pageIdx);
                          }
                          
                          newPageStructure[pageIdx] = { ...newPageStructure[pageIdx], name: newName, slug: updatedSlug };

                          const newMenus = newPageStructure.filter(p => p.depth === 0).map(p => p.name);

                          onChange({
                            ...currentPlan,
                            navigation: {
                              ...currentPlan.navigation,
                              menus: Array.from(new Set(newMenus)),
                              pageStructure: newPageStructure
                            }
                          });
                        }}
                        className="w-full text-2xl font-black text-slate-800 outline-none placeholder:text-slate-200 bg-transparent border-b-2 border-transparent focus:border-goguma transition-all pb-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-goguma uppercase tracking-widest">{t('slug')} (URL)</label>
                        <span className="text-[9px] font-bold text-goguma-light opacity-60 truncate max-w-[180px]">
                          {plan.metadata?.projectOverview?.targetUrl ? plan.metadata.projectOverview.targetUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'domain.com'}
                        </span>
                      </div>
                      {(() => {
                        const slugErrors: string[] = [];
                        const isDuplicate = plan.navigation.pageStructure.some(p => p.id !== editingId && p.slug === editingPage.slug);
                        if (isDuplicate) slugErrors.push(t('duplicate_slug'));
                        
                        const isValidFormat = editingPage.slug === '/' || /^\/[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(editingPage.slug) || /^https?:\/\//.test(editingPage.slug);
                        if (editingPage.slug && !isValidFormat) slugErrors.push(t('invalid_slug_format'));
                        
                        const hasError = slugErrors.length > 0;

                        return (
                          <div className={`flex flex-col gap-1 transition-all`}>
                            <div className={`flex items-center gap-2 px-6 py-4 bg-slate-50 border rounded-2xl focus-within:ring-4 transition-all ${hasError ? 'border-red-500 ring-4 ring-red-50' : 'border-slate-200 focus-within:ring-goguma-light'}`}>
                              <input
                                type="text"
                                value={editingPage.slug}
                                onChange={(e) => {
                                  // Only allow alphanumeric, hyphens, slashes, and basic URL characters
                                  let newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9\-\/\.\:]/g, '-');
                                  
                                  if (newSlug && !newSlug.startsWith('/') && !newSlug.startsWith('http')) {
                                    newSlug = '/' + newSlug;
                                  }
                                  
                                  onChange({
                                    ...plan,
                                    navigation: {
                                      ...plan.navigation,
                                      pageStructure: plan.navigation.pageStructure.map((p) =>
                                        p.id === editingId ? { ...p, slug: newSlug } : p
                                      ),
                                    }
                                  });
                                }}
                                className={`flex-1 bg-transparent border-none outline-none text-sm font-mono font-bold uppercase transition-colors ${hasError ? 'text-red-500' : 'text-goguma'}`}
                              />
                              {hasError ? (
                                <AlertCircle size={16} className="text-red-500 animate-pulse" />
                              ) : (
                                <CheckCircle2 size={16} className="text-green-500" />
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Meta Description Field */}
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-goguma uppercase tracking-widest">{t('seo_desc_label')}</label>
                       <div className="relative group/seo">
                         <textarea
                           value={editingPage.metaDescription || ''}
                           onChange={(e) => {
                             onChange({
                               ...plan,
                               navigation: {
                                 ...plan.navigation,
                                 pageStructure: plan.navigation.pageStructure.map((p) =>
                                   p.id === editingId ? { ...p, metaDescription: e.target.value } : p
                                 ),
                               }
                             });
                           }}
                           placeholder={t('seo_desc_placeholder')}
                           rows={2}
                           className="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-goguma-light transition-all text-xs font-medium leading-relaxed resize-none"
                         />
                         <div className="absolute right-3 top-2">
                           <IconButton
                             onClick={() => handleGenerateSingleSEO('metaDescription')}
                             isLoading={isGeneratingField.metaDescription}
                             icon={Sparkles}
                             tooltip={t('recommend_seo')}
                             variant="ai"
                             size="sm"
                           />
                         </div>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe size={14} className="text-goguma" />
                          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{t('seo_settings')}</h4>
                        </div>
                        <button
                          onClick={handleGenerateSEO}
                          disabled={isGeneratingSEO}
                          className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isGeneratingSEO ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                          {t('recommend_seo')}
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('seo_title_label')}</label>
                          <div className="relative group/seo">
                            <input
                              type="text"
                              value={editingPage.seoTitle || ''}
                              onChange={(e) => {
                                onChange({
                                  ...plan,
                                  navigation: {
                                    ...plan.navigation,
                                    pageStructure: plan.navigation.pageStructure.map((p) =>
                                      p.id === editingId ? { ...p, seoTitle: e.target.value } : p
                                    ),
                                  }
                                });
                              }}
                              placeholder={t('seo_title_placeholder')}
                              className="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-goguma-light transition-all text-xs font-medium"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <IconButton
                                onClick={() => handleGenerateSingleSEO('title')}
                                isLoading={isGeneratingField.title}
                                icon={Sparkles}
                                tooltip={t('recommend_seo')}
                                variant="ai"
                                size="sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('seo_keywords_label')}</label>
                          <div className="relative group/seo">
                            <Search size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input
                              type="text"
                              value={editingPage.seoKeywords || ''}
                              onChange={(e) => {
                                onChange({
                                  ...plan,
                                  navigation: {
                                    ...plan.navigation,
                                    pageStructure: plan.navigation.pageStructure.map((p) =>
                                      p.id === editingId ? { ...p, seoKeywords: e.target.value } : p
                                    ),
                                  }
                                });
                              }}
                              placeholder={t('seo_keywords_placeholder')}
                              className="w-full pl-10 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-goguma-light transition-all text-xs font-medium"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <IconButton
                                onClick={() => handleGenerateSingleSEO('keywords')}
                                isLoading={isGeneratingField.keywords}
                                icon={Sparkles}
                                tooltip={t('recommend_seo')}
                                variant="ai"
                                size="sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t('visual_content')}</label>
                        <AnimatePresence>
                          {uploadStatus && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${
                                uploadStatus.type === 'success' ? 'text-green-600' : 'text-red-500'
                              }`}
                            >
                              {uploadStatus.type === 'success' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                              {uploadStatus.message}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="space-y-4">
                        {editingPage.image ? (
                          <div className="relative group aspect-[1.91/1] rounded-3xl overflow-hidden border border-slate-100 shadow-lg">
                            <img 
                              src={editingPage.image} 
                              alt="Page preview" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                              <IconButton
                                onClick={() => {
                                  onChange({
                                    ...plan,
                                    navigation: {
                                      ...plan.navigation,
                                      pageStructure: plan.navigation.pageStructure.map((p) =>
                                        p.id === editingId ? { ...p, image: undefined } : p
                                      ),
                                    }
                                  });
                                }}
                                icon={Trash2}
                                tooltip={t('delete')}
                                variant="secondary"
                                className="!bg-white !text-slate-900 shadow-xl"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className={`flex flex-col items-center justify-center aspect-[1.91/1] bg-slate-50 border-2 border-dashed rounded-3xl group transition-all cursor-pointer relative ${isUploading ? 'border-goguma bg-goguma-light' : 'border-slate-200 hover:border-goguma'}`}>
                            {isUploading ? (
                              <div className="flex flex-col items-center gap-4 text-goguma">
                                <Loader2 size={32} className="animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">{t('uploading_image')}</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-4 text-slate-300 group-hover:text-goguma transition-colors">
                                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-goguma-light transition-all">
                                  <ImageIcon size={32} />
                                </div>
                                <div className="text-center">
                                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">{t('upload_cover_image')}</p>
                                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">1200 x 630 pixels</p>
                                </div>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploading}
                              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setIsUploading(true);
                                  setUploadStatus(null);
                                  
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    // Simulate a small network delay for visual feedback
                                    setTimeout(() => {
                                      onChange({
                                        ...plan,
                                        navigation: {
                                          ...plan.navigation,
                                          pageStructure: plan.navigation.pageStructure.map((p) =>
                                            p.id === editingId ? { ...p, image: reader.result as string } : p
                                          ),
                                        }
                                      });
                                      setIsUploading(false);
                                      setUploadStatus({ type: 'success', message: t('image_uploaded') });
                                      setTimeout(() => setUploadStatus(null), 3000);
                                    }, 1000);
                                  };
                                  reader.onerror = () => {
                                    setIsUploading(false);
                                    setUploadStatus({ type: 'error', message: t('image_upload_failed') });
                                    setTimeout(() => setUploadStatus(null), 3000);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="flex gap-4">
                          <input
                            type="text"
                            placeholder={t('paste_image_url')}
                            value={editingPage.image || ''}
                            onChange={(e) => {
                              onChange({
                                ...plan,
                                navigation: {
                                  ...plan.navigation,
                                  pageStructure: plan.navigation.pageStructure.map((p) =>
                                    p.id === editingId ? { ...p, image: e.target.value } : p
                                  ),
                                }
                              });
                            }}
                            className="flex-1 px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-bold outline-none focus:ring-4 focus:ring-goguma-light transition-all"
                          />
                          {!editingPage.image && (
                            <IconButton
                              onClick={() => {
                                const randomId = Math.floor(Math.random() * 1000);
                                const randomImg = `https://picsum.photos/seed/${randomId}/1200/630`;
                                onChange({
                                  ...plan,
                                  navigation: {
                                    ...plan.navigation,
                                    pageStructure: plan.navigation.pageStructure.map((p) =>
                                      p.id === editingId ? { ...p, image: randomImg } : p
                                    ),
                                  }
                                });
                              }}
                              icon={ImageIcon}
                              tooltip={t('random')}
                              variant="primary"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-goguma uppercase tracking-widest">{t('page_script_content')}</label>
                        <div className="flex items-center gap-3">
                          <AnimatePresence>
                            {refineStatus && (
                              <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${
                                  refineStatus.type === 'success' ? 'text-green-600' : 'text-red-500'
                                }`}
                              >
                                {refineStatus.type === 'success' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                                {refineStatus.message}
                              </motion.div>
                            )}
                          </AnimatePresence>
                            <IconButton
                              onClick={handleFormatScript}
                              icon={FileCode}
                              tooltip={t('format')}
                              variant="secondary"
                              size="sm"
                            />
                            <IconButton
                              onClick={() => handleRefineScript(true)}
                              isLoading={isRefining}
                              icon={PenTool}
                              tooltip={t('ai_generate_script')}
                              variant="ai"
                              size="sm"
                            />
                            <IconButton
                              onClick={() => handleRefineScript(false)}
                              isLoading={isRefining}
                              icon={Sparkles}
                              tooltip={t('ai_refine_tooltip')}
                              variant="primary"
                              size="sm"
                              className={!editingPage.script.trim() ? 'animate-bounce shadow-lg shadow-goguma-light' : ''}
                            />
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="relative flex-1 group/url">
                          <Link size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/url:text-goguma transition-colors" />
                          <input
                            type="text"
                            placeholder={t('paste_script_url')}
                            value={scriptUrl}
                            onChange={(e) => setScriptUrl(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleLoadFromUrl();
                              }
                            }}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-bold outline-none focus:ring-4 focus:ring-goguma-light focus:border-goguma transition-all"
                          />
                        </div>
                        <IconButton
                          onClick={handleLoadFromUrl}
                          isLoading={isFetchingScript}
                          icon={Upload}
                          label={t('load_content')}
                          tooltip={t('load_content')}
                          variant="secondary"
                        />
                      </div>

                      <div className="relative group overflow-hidden rounded-3xl border border-slate-200 focus-within:border-goguma focus-within:ring-4 focus-within:ring-goguma-light transition-all">
                        <CodeMirror
                          value={editingPage.script}
                          height="400px"
                          theme="light"
                          extensions={[editingPage.script.includes('<') ? html() : javascript()]}
                          onChange={(value) => {
                            onChange({
                              ...plan,
                              navigation: {
                                ...plan.navigation,
                                pageStructure: plan.navigation.pageStructure.map((p) =>
                                  p.id === editingId ? { ...p, script: value } : p
                                ),
                              }
                            });
                          }}
                          className="text-sm font-medium leading-relaxed"
                          basicSetup={{
                            lineNumbers: true,
                            foldGutter: true,
                            highlightActiveLine: true,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <IconButton
                    onClick={() => {
                      const isDuplicate = plan.navigation.pageStructure.some(p => p.id !== editingId && p.slug === editingPage.slug);
                      const isValidFormat = editingPage.slug === '/' || /^\/[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(editingPage.slug) || /^https?:\/\//.test(editingPage.slug);
                      const isScriptEmpty = !editingPage.script.trim();

                      if (isDuplicate || !isValidFormat) {
                        alert(t('check_slug_settings'));
                        return;
                      }

                      if (isScriptEmpty) {
                        if (confirm(t('empty_script_warn') + '\n\n' + "Would you like to confirm without script?")) {
                          setEditingId(null);
                        }
                        return;
                      }

                      setEditingId(null);
                    }}
                    icon={Check}
                    label={t('confirm_changes')}
                    tooltip={t('confirm_changes')}
                    variant={(plan.navigation.pageStructure.some(p => p.id !== editingId && p.slug === editingPage.slug) || !(editingPage.slug === '/' || /^\/[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(editingPage.slug) || /^https?:\/\//.test(editingPage.slug)) || !editingPage.script.trim()) ? 'secondary' : 'primary'}
                    className={`w-full py-6 !rounded-[32px] ${
                      (plan.navigation.pageStructure.some(p => p.id !== editingId && p.slug === editingPage.slug) || !(editingPage.slug === '/' || /^\/[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(editingPage.slug) || /^https?:\/\//.test(editingPage.slug)) || !editingPage.script.trim())
                      ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-50' 
                      : ''
                    }`}
                  />
                </motion.div>
              ) : (
                <VisualSitemap 
                  onPageClick={handleEdit} 
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>

      {(onBack || onSave) && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold text-xs transition-all shadow-xs"
            >
              <ChevronLeft size={16} />
              {t('back')}
            </button>
          ) : <div />}
          {onSave && (
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-goguma text-white font-black text-xs hover:bg-goguma-dark transition-all shadow-md shadow-goguma/20"
            >
              {t('next_step')}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
