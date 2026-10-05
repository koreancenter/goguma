import React, { useState, useEffect } from 'react';
import { ScreenNode } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  Monitor, 
  Sparkles, 
  Loader2, 
  Edit3, 
  Check, 
  X, 
  Layout, 
  Plus, 
  Trash2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { IconButton, Tooltip } from '../guide/Tooltip';
import { useLanguage } from '../../contexts/LanguageContext';
import { analyzeScreenStructure } from '../../services/geminiService';
import { decomposeLocalScreenStructure } from '../../lib/deterministicArchitect';
import { StepHeader } from './StepHeader';

import { useSitePlan } from '../../contexts/SitePlanContext';

export default function ArchitectureMapForm({ onBack, onSave }: { onBack: () => void; onSave: () => void }) {
  const { plan, setPlan: onChange } = useSitePlan();
  const { t, language } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingNode, setEditingNode] = useState<{ pageId: string, screenId?: string, label: string, description: string, screenIdText?: string } | null>(null);

  useEffect(() => {
    // Automatically generate/update screens for pages where script has changed compared to last analysis
    const pagesToAnalyze = plan.navigation.pageStructure.filter(p => 
      p.script.trim() && 
      (p.script !== p.analyzedScript || !p.screenStructure || p.screenStructure.length === 0)
    );
    
    if (pagesToAnalyze.length > 0 && !isGenerating) {
      // 1. Immediately apply local deterministic decomposition (instant, zero network wait)
      const instantPageStructure = plan.navigation.pageStructure.map(page => {
        const shouldAnalyze = page.script.trim() && (page.script !== page.analyzedScript || !page.screenStructure || page.screenStructure.length === 0);
        if (shouldAnalyze) {
          return {
            ...page,
            screenStructure: decomposeLocalScreenStructure(page.name, page.script, language, plan.metadata?.platform),
            analyzedScript: page.script
          };
        }
        return page;
      });

      onChange({
        ...plan,
        navigation: {
          ...plan.navigation,
          pageStructure: instantPageStructure
        }
      });
    }
  }, [plan.navigation.pageStructure, isGenerating, plan, onChange, language]);

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    try {
      // 1. Instantly apply deterministic decomposition
      const newPageStructure = plan.navigation.pageStructure.map(page => {
        if (page.script.trim()) {
          return {
            ...page,
            screenStructure: decomposeLocalScreenStructure(page.name, page.script, language, plan.metadata?.platform),
            analyzedScript: page.script
          };
        }
        return page;
      });
      
      onChange({ 
        ...plan, 
        navigation: {
          ...plan.navigation,
          pageStructure: newPageStructure 
        }
      });

      // 2. Optionally refine via AI if available, falling back gracefully
      for (let i = 0; i < newPageStructure.length; i++) {
        const page = newPageStructure[i];
        if (page.script.trim()) {
          const screens = await analyzeScreenStructure(page.name, page.script, language, undefined, plan.deploymentProfile?.mode, plan.metadata?.platform);
          newPageStructure[i] = {
            ...page,
            screenStructure: screens,
            analyzedScript: page.script
          };
        }
      }
      
      onChange({ 
        ...plan, 
        navigation: {
          ...plan.navigation,
          pageStructure: newPageStructure 
        }
      });
    } catch (error) {
      console.error("Failed to generate architecture map:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateScreen = (pageId: string, screenId: string, updates: Partial<ScreenNode>) => {
    const newPageStructure = (plan?.navigation?.pageStructure || []).map(p => {
      if (p.id === pageId) {
        const newScreens = (p.screenStructure || []).map(s => 
          s.id === screenId ? { ...s, ...updates } : s
        );
        return { ...p, screenStructure: newScreens };
      }
      return p;
    });
    onChange({ 
      ...plan, 
      navigation: {
        ...plan.navigation,
        pageStructure: newPageStructure 
      }
    });
  };

  const deleteScreen = (pageId: string, screenId: string) => {
    const newPageStructure = (plan?.navigation?.pageStructure || []).map(p => {
      if (p.id === pageId) {
        const newScreens = (p.screenStructure || []).filter(s => s.id !== screenId);
        return { ...p, screenStructure: newScreens };
      }
      return p;
    });
    onChange({ 
      ...plan, 
      navigation: {
        ...plan.navigation,
        pageStructure: newPageStructure 
      }
    });
  };

  const addScreen = (pageId: string) => {
    const page = plan.navigation.pageStructure.find(p => p.id === pageId);
    if (!page) return;

    const currentScreens = page.screenStructure || [];
    const nextIdNum = currentScreens.length + 1;
    const newId = `SCR-${String(nextIdNum).padStart(3, '0')}`;
    const newScreen: ScreenNode = { id: newId, label: 'New Section', description: '' };
    
    const newPageStructure = plan.navigation.pageStructure.map(p => {
      if (p.id === pageId) {
        return { ...p, screenStructure: [...currentScreens, newScreen] };
      }
      return p;
    });

    onChange({ 
      ...plan, 
      navigation: {
        ...plan.navigation,
        pageStructure: newPageStructure 
      }
    });
    
    // Automatically open the edit modal for the new screen
    setEditingNode({
      pageId,
      screenId: newId,
      label: newScreen.label,
      description: newScreen.description,
      screenIdText: newId
    });
  };

  return (
    <div className="space-y-8 w-full">
      <div className="border-b border-slate-200/80 pb-6">
        <StepHeader 
          title={t('functional_arch_title')} 
          subtitle={t('functional_arch_subtitle')} 
          icon={Network} 
          badge="PHASE 07"
          color="goguma"
        />
        <div className="flex justify-start mt-4">
          <IconButton
            onClick={handleGenerateAll}
            isLoading={isGenerating}
            icon={Sparkles}
            label={t('generate_arch_map')}
            tooltip={t('generate_arch_map')}
            variant="ai"
            size="sm"
          />
        </div>
      </div>

      <div className="relative overflow-x-auto pb-20 pt-10">
        <div className="min-w-[1000px] flex justify-center">
          <div className="flex flex-col items-center gap-20">
            {/* Root Node */}
            <div className="relative group">
              <div className="px-10 py-5 bg-slate-900 text-white rounded-[32px] shadow-2xl ring-8 ring-slate-50 border-4 border-white transition-all group-hover:scale-105">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 leading-none">Project Root</span>
                  <p className="text-2xl font-black tracking-tighter uppercase">
                    {plan.metadata?.projectOverview?.targetUrl ? (
                      plan.metadata.projectOverview.targetUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
                    ) : (
                      plan.metadata?.projectName || 'Untitled'
                    )}
                  </p>
                </div>
              </div>
              {/* Vertical Connector */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-[2px] h-20 bg-gradient-to-b from-slate-200 to-transparent" />
            </div>

            {/* Page Nodes Container */}
            <div className="flex items-start gap-12 pt-10">
              {plan.navigation.pageStructure.map((page, pIdx) => (
                <div 
                  key={page.id} 
                  className="relative flex flex-col items-center gap-12 group"
                  style={{ marginTop: `${page.depth * 60}px` }}
                >
                  {/* Vertical line for sub-pages to show hierarchy from top */}
                  {page.depth > 0 && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[2px] h-10 bg-goguma-light" />
                  )}
                  
                  <div className={`w-[280px] bg-white rounded-[40px] p-6 border-2 shadow-xl group-hover:shadow-goguma-light transition-all flex flex-col gap-4 relative ${
                    page.depth === 0 ? 'border-slate-100 group-hover:border-goguma' : 'border-slate-50 group-hover:border-goguma-light'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          page.depth === 0 ? 'bg-goguma-light text-goguma' : 'bg-slate-50 text-slate-400'
                        }`}>
                          <Layout size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {page.depth === 0 ? 'Primary' : `Level ${page.depth}`}
                          </p>
                          <h4 className="font-black text-slate-900 tracking-tight">{page.name}</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconButton
                          onClick={() => addScreen(page.id)}
                          icon={Plus}
                          tooltip={t('add_screen')}
                          variant="primary"
                          size="sm"
                          className="bg-goguma/10 !text-goguma hover:bg-goguma hover:!text-white border border-goguma-light"
                        />
                      </div>
                    </div>
                    
                    {page.script ? (
                      <p className="text-[11px] text-slate-400 font-medium line-clamp-2 italic leading-relaxed">
                        {page.script}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-500 bg-amber-50 px-3 py-2 rounded-xl text-[10px] font-bold">
                        <AlertCircle size={12} />
                        No Script - AI analysis unavailable
                      </div>
                    )}
                  </div>

                  {/* Screens Container */}
                  <div className="flex flex-col gap-4 w-full">
                    {page.screenStructure?.map((screen, sIdx) => (
                      <motion.div
                        key={screen.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: sIdx * 0.1 }}
                        className="relative group/screen"
                      >
                        {/* Horizontal Connector */}
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-[2px] bg-slate-100 group-hover/screen:bg-goguma-light transition-colors" />
                        
                        <div className="bg-slate-50 hover:bg-white rounded-2xl p-4 border border-slate-100 hover:border-goguma-light shadow-sm hover:shadow-xl hover:shadow-goguma/10 transition-all">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-goguma shadow-sm">
                                {screen.id}
                              </div>
                              <div>
                                <h5 className="text-[11px] font-black text-slate-800 tracking-tight uppercase leading-none">{screen.label}</h5>
                                <p className="text-[10px] text-slate-400 font-medium mt-1 line-clamp-1">{screen.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover/screen:opacity-100 transition-opacity">
                              <IconButton
                                onClick={() => setEditingNode({ 
                                  pageId: page.id, 
                                  screenId: screen.id, 
                                  label: screen.label, 
                                  description: screen.description,
                                  screenIdText: screen.id
                                })}
                                icon={Edit3}
                                tooltip={t('edit')}
                                variant="ghost"
                                size="sm"
                              />
                              <IconButton
                                onClick={() => deleteScreen(page.id, screen.id)}
                                icon={Trash2}
                                tooltip={t('delete')}
                                variant="ghost"
                                size="sm"
                                className="hover:text-red-500 hover:bg-red-50"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingNode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingNode(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white"
            >
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-goguma rounded-2xl flex items-center justify-center text-white shadow-xl shadow-goguma/20">
                    <Edit3 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase">{t('edit_node_title')}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Configuring Screen Node</p>
                  </div>
                </div>
                <IconButton
                  onClick={() => setEditingNode(null)}
                  icon={X}
                  tooltip={t('close')}
                  variant="ghost"
                  size="sm"
                />
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Screen ID</label>
                  <input
                    type="text"
                    value={editingNode.screenIdText}
                    onChange={(e) => setEditingNode({ ...editingNode, screenIdText: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-goguma focus:bg-white focus:ring-4 focus:ring-goguma-light focus:border-goguma outline-none transition-all uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('node_label')}</label>
                  <input
                    type="text"
                    value={editingNode.label}
                    onChange={(e) => setEditingNode({ ...editingNode, label: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-goguma-light focus:border-goguma outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('node_description')}</label>
                  <textarea
                    rows={4}
                    value={editingNode.description}
                    onChange={(e) => setEditingNode({ ...editingNode, description: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-600 focus:bg-white focus:ring-4 focus:ring-goguma-light focus:border-goguma outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
                <IconButton
                  onClick={() => setEditingNode(null)}
                  icon={X}
                  tooltip={t('cancel')}
                  variant="secondary"
                />
                <IconButton
                  onClick={() => {
                    if (editingNode.screenId) {
                      updateScreen(editingNode.pageId, editingNode.screenId, {
                        id: editingNode.screenIdText,
                        label: editingNode.label,
                        description: editingNode.description
                      });
                    }
                    setEditingNode(null);
                  }}
                  icon={Check}
                  tooltip={t('confirm')}
                  variant="primary"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
