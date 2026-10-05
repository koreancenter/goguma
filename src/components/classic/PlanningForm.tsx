import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DesignConfig } from '../../types';
import { 
  Layout, Palette, Type, List, FileText, Info, Save, 
  ArrowLeft, Sparkles, Loader2, Copy, Check, Menu, Bell, User,
  ShieldAlert, X
} from 'lucide-react';
import { recommendMenus, recommendSectionGrid, recommendBottomTabs } from '../../services/geminiService';
import { useLanguage } from '../../contexts/LanguageContext';
import { generateSlug } from '../../lib/utils';
import { IconButton, Tooltip } from '../guide/Tooltip';
import { useSitePlan } from '../../contexts/SitePlanContext';
import { StepHeader } from './StepHeader';

const ColorPicker = ({ 
  label, 
  name, 
  value, 
  palette, 
  onChange 
}: { 
  label: string; 
  name: keyof DesignConfig; 
  value: string; 
  palette?: string[]; 
  onChange: (name: keyof DesignConfig, value: string) => void 
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5 group-focus-within:text-goguma transition-colors">
        <Palette size={16} />
        {label}
      </label>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            className="w-10 h-10 rounded-lg border-2 border-white shadow-sm cursor-pointer overflow-hidden shrink-0"
          />
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
            <input
              type="text"
              value={value.toUpperCase()}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9A-F]{0,6}$/i.test(val)) {
                  onChange(name, val);
                }
              }}
              className="flex-1 bg-transparent text-xs font-mono font-bold text-slate-700 outline-none"
            />
            <IconButton
              onClick={handleCopy}
              icon={copied ? Check : Copy}
              tooltip={copied ? t('copied') : t('copy')}
              variant="ghost"
              size="sm"
              className={copied ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}
            />
          </div>
        </div>
        
        {palette && palette.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {palette.map((color, i) => (
              <Tooltip key={i} content={color}>
                <button
                  onClick={() => onChange(name, color)}
                  className={`w-6 h-6 rounded-full border transition-all hover:scale-110 ${
                    value === color ? 'border-goguma scale-110 shadow-sm' : 'border-slate-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              </Tooltip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ColorPreview = ({ design }: { design: DesignConfig }) => {
  const { t } = useLanguage();
  return (
    <div className="mt-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Palette size={14} className="text-slate-400" />
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('design_system_preview')}</h4>
      </div>
      <div 
        className="p-6 rounded-xl space-y-4 border border-slate-100 transition-all duration-500"
        style={{ backgroundColor: design.themeColor + '08' }} // Very light version of theme color for bg
      >
        <div className="flex items-center justify-between">
          <h5 className="text-base font-black" style={{ color: design.bodyTextColor }}>{t('sample_heading')}</h5>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: design.themeColor }} title={t('theme')} />
            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: design.accentColor }} title={t('accent')} />
          </div>
        </div>
        
        <p className="text-xs leading-relaxed" style={{ color: design.bodyTextColor }}>
          {t('color_check_desc')}
        </p>
        
        <div className="flex gap-2.5 pt-2">
          <button 
            className="px-4 py-2 rounded-lg text-[11px] font-bold text-white transition-all shadow-sm"
            style={{ backgroundColor: design.buttonColor }}
          >
            {t('main_button')}
          </button>
          <button 
            className="px-4 py-2 rounded-lg text-[11px] font-bold border transition-all"
            style={{ borderColor: design.accentColor, color: design.accentColor }}
          >
            {t('accent_action')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PlanningForm({ onBack, onSave }: { onBack?: () => void; onSave?: () => void }) {
  const { plan, setPlan: onChange } = useSitePlan();
  const { t, language } = useLanguage();
  const topMenus = (plan?.navigation?.pageStructure || []).filter(p => p.depth === 0).map(p => p.name);
  const [menuInput, setMenuInput] = useState(topMenus.join(', '));
  const [isRecommending, setIsRecommending] = useState(false);
  const [isRecommendingGrid, setIsRecommendingGrid] = useState(false);
  const [isRecommendingTabs, setIsRecommendingTabs] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [hasAutoRecommendedGrid, setHasAutoRecommendedGrid] = useState(false);

  useEffect(() => {
    // Auto-recommend grid if purpose is present and we haven't done it yet this session
    // and the grid is still at its default "Home" state.
    if (plan.metadata?.projectOverview?.purpose && 
        !hasAutoRecommendedGrid && 
        plan.design.sectionTitles.length === 1 && 
        plan.design.sectionTitles[0] === 'Home' &&
        !isRecommendingGrid) {
      handleRecommendGrid();
      setHasAutoRecommendedGrid(true);
    }
  }, [plan.metadata?.projectOverview?.purpose]);

  useEffect(() => {
    const currentTopMenus = (plan?.navigation?.pageStructure || []).filter(p => p.depth === 0).map(p => p.name);
    const joined = currentTopMenus.join(', ');
    
    // Check if the joined model state actually matches the user's parsed input
    // This avoids resetting the input while user is typing (e.g., trailing spaces/commas)
    const inputMenus = menuInput.split(',').map(m => m.trim()).filter(m => m !== '');
    const inputJoined = inputMenus.join(', ');
    
    if (joined !== inputJoined) {
      setMenuInput(joined);
    }
  }, [plan?.navigation?.pageStructure]);

  const handleRecommendMenus = async () => {
    if (isRecommending) return;
    setIsRecommending(true);
    setAiError(null);
    try {
      const context = `
        Purpose: ${plan.metadata?.projectOverview?.purpose || ''}
        Target Audience: ${plan.metadata?.projectOverview?.target || ''}
        Design Tone & Manner: ${plan.metadata?.projectOverview?.toneAndManner || ''}
      `;
      const recommended = await recommendMenus(context, language, undefined, plan.deploymentProfile?.mode, plan.metadata?.platform);
      if (recommended.length > 0) {
        const menuString = recommended.join(', ');
        setMenuInput(menuString);
        updateMenus(menuString);
      }
    } catch (error: any) {
      console.error("Failed to recommend menus:", error);
      if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') {
        setAiError(t('gemini_rate_limit'));
      } else {
        setAiError(t('common_error'));
      }
    } finally {
      setIsRecommending(false);
    }
  };

  const handleRecommendGrid = async () => {
    if (isRecommendingGrid) return;
    setIsRecommendingGrid(true);
    setAiError(null);
    try {
      const context = `
        Title: ${plan.metadata?.title || ''}
        Slogan: ${plan.metadata?.slogan || ''}
        Purpose: ${plan.metadata?.projectOverview?.purpose || ''}
        Target Audience: ${plan.metadata?.projectOverview?.target || ''}
        Features: ${plan.metadata?.projectOverview?.features || ''}
        Tone & Manner: ${plan.metadata?.projectOverview?.toneAndManner || ''}
      `;
      const result = await recommendSectionGrid(context, language, undefined, plan.deploymentProfile?.mode, plan.metadata?.platform);
      if (result.titles.length > 0) {
        onChange({
          ...plan,
          design: {
            ...plan.design,
            sectionTitles: result.titles,
            sectionColumns: result.columns,
            sectionContentTypes: result.contentTypes as ('text' | 'image')[][]
          }
        });
      }
    } catch (error: any) {
      console.error("Failed to recommend grid:", error);
      if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') {
        setAiError(t('gemini_rate_limit'));
      } else {
        setAiError(t('common_error'));
      }
    } finally {
      setIsRecommendingGrid(false);
    }
  };

  const handleRecommendTabs = async () => {
    if (isRecommendingTabs) return;
    setIsRecommendingTabs(true);
    setAiError(null);
    try {
      const context = `
        Title: ${plan.metadata?.title || ''}
        Purpose: ${plan.metadata?.projectOverview?.purpose || ''}
        Target Audience: ${plan.metadata?.projectOverview?.target || ''}
        Features: ${plan.metadata?.projectOverview?.features || ''}
      `;
      const tabCount = plan.design.mobileConfig?.bottomTabItems?.length || 5;
      const recommended = await recommendBottomTabs(context, language, tabCount, undefined, plan.deploymentProfile?.mode, plan.metadata?.platform);
      if (recommended.length > 0) {
        onChange({
          ...plan,
          design: {
            ...plan.design,
            mobileConfig: {
              ...plan.design.mobileConfig!,
              bottomTabItems: recommended
            }
          }
        });
      }
    } catch (error: any) {
      console.error("Failed to recommend tabs:", error);
      if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') {
        setAiError(t('gemini_rate_limit'));
      } else {
        setAiError(t('common_error'));
      }
    } finally {
      setIsRecommendingTabs(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name in plan.metadata) {
      onChange({ ...plan, metadata: { ...plan.metadata, [name]: value } });
    } else if (name in plan.design) {
      onChange({ ...plan, design: { ...plan.design, [name]: value } });
    }
  };

  const handleFooterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...plan,
      metadata: {
        ...plan.metadata,
        footerInfo: {
          ...plan.metadata.footerInfo,
          [name]: value
        }
      }
    });
  };

  const updateMenus = (value: string) => {
    const menus = value.split(',').map(m => m.trim()).filter(m => m !== '');
    
    // Synchronize with Page Structure
    const nonTopPages = (plan?.navigation?.pageStructure || []).filter(p => p.depth !== 0);
    const currentTopPages = (plan?.navigation?.pageStructure || []).filter(p => p.depth === 0);

    const newTopPages = menus.map((menu, idx) => {
      const existing = currentTopPages[idx];
      if (existing) {
        return { ...existing, name: menu, slug: generateSlug(menu) };
      }
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: menu,
        slug: generateSlug(menu),
        depth: 0,
        script: ''
      };
    });

    onChange({ 
      ...plan, 
      navigation: {
        ...plan.navigation,
        pageStructure: [...newTopPages, ...nonTopPages]
      }
    });
  };

  const handleMenuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMenuInput(value);
    updateMenus(value);
  };

  const handleColorChange = (name: keyof DesignConfig, value: string) => {
    onChange({ ...plan, design: { ...plan.design, [name]: value } });
  };

  return (
    <div className="space-y-16">
      <AnimatePresence>
        {aiError && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between gap-4 overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <ShieldAlert size={18} className="text-rose-500" />
              <span className="text-xs font-bold text-rose-700">{aiError}</span>
            </div>
            <button onClick={() => setAiError(null)}>
              <X size={16} className="text-rose-400 hover:text-rose-600" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl">
        <div className="space-y-12">
        <div className="group">
          <label className="flex items-center gap-3 text-xs font-black text-goguma uppercase tracking-[0.2em] mb-3 transition-colors">
            <Type size={14} />
            {t('title_slogan')}
          </label>
          <div className="space-y-4">
            <input
              type="text"
              name="title"
              value={plan.metadata.title}
              onChange={handleChange}
              placeholder={t('enter_site_name')}
              className="w-full text-lg font-black text-slate-800 outline-none placeholder:text-slate-200 bg-transparent border-b-2 border-transparent focus:border-goguma transition-all pb-2"
            />
            <input
              type="text"
              name="slogan"
              value={plan.metadata.slogan}
              onChange={handleChange}
              placeholder={t('write_first_impression')}
              className="w-full text-sm font-bold text-slate-500 outline-none placeholder:text-slate-200 bg-transparent"
            />
          </div>
        </div>

        <div className="group">
          <label className="flex items-center gap-3 text-xs font-black text-goguma uppercase tracking-[0.2em] mb-3 transition-colors">
            <FileText size={14} />
            {t('description_label')}
          </label>
          <textarea
            name="description"
            value={plan.metadata.description}
            onChange={handleChange}
            placeholder={t('provide_detailed_desc')}
            rows={4}
            className="w-full px-8 py-6 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-goguma-light transition-all text-sm font-medium leading-relaxed"
          />
        </div>

        <div className="group">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-3 text-xs font-black text-goguma uppercase tracking-[0.2em] transition-colors">
              <List size={14} />
              {t('nav_menus')}
            </label>
            <IconButton
              onClick={handleRecommendMenus}
              isLoading={isRecommending}
              icon={Sparkles}
              tooltip={t('ai_recommend')}
              variant="ai"
              size="sm"
              disabled={!plan.metadata?.projectOverview?.purpose}
            />
          </div>
          <input
            type="text"
            value={menuInput}
            onChange={handleMenuChange}
            placeholder="Home, About, Services, Contact"
            className="w-full px-8 py-6 bg-white border border-slate-200 rounded-[24px] outline-none focus:ring-4 focus:ring-goguma-light transition-all text-sm font-bold"
          />
        </div>

        <div className="space-y-6">
          <label className="flex items-center gap-3 text-xs font-black text-goguma uppercase tracking-[0.2em] transition-colors">
            <Palette size={14} />
            {t('color_palette')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ColorPicker label={t('theme')} name="themeColor" value={plan.design.themeColor} palette={plan.design.logoPalette} onChange={handleColorChange} />
            <ColorPicker label={t('accent')} name="accentColor" value={plan.design.accentColor} palette={plan.design.logoPalette} onChange={handleColorChange} />
            <ColorPicker label={t('body_text_color')} name="bodyTextColor" value={plan.design.bodyTextColor} palette={plan.design.logoPalette} onChange={handleColorChange} />
            <ColorPicker label={t('link')} name="linkColor" value={plan.design.linkColor} palette={plan.design.logoPalette} onChange={handleColorChange} />
          </div>
          <ColorPreview design={plan.design} />
        </div>

        <div className="group">
          <label className="flex items-center gap-3 text-xs font-black text-goguma uppercase tracking-[0.2em] mb-4 transition-colors">
            <Layout size={14} />
            {plan.metadata.platform === 'APP' ? t('mobile_dashboard_title') : t('layout_structure')}
          </label>
          
          {plan.metadata.platform === 'APP' ? (
            <div className="space-y-6">
              <div className="p-8 bg-goguma-light rounded-[32px] border-2 border-goguma-light shadow-xl shadow-goguma-light space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-goguma rounded-2xl flex items-center justify-center text-white shadow-lg shadow-goguma/20">
                    <Layout size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-goguma tracking-tight">Personalized Dashboard</h4>
                    <p className="text-xs font-medium text-goguma/70">{t('app_vibe_desc')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('card_count')}</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" min="1" max="12" 
                        value={plan.design.mobileConfig?.widgetCount || 6}
                        onChange={(e) => {
                          const newCount = parseInt(e.target.value);
                          let newCols = plan.design.mobileConfig?.columns || 2;
                          let newRows = plan.design.mobileConfig?.rows || 3;

                          // If columns is 1, keep it a list view (rows matches count)
                          if (newCols === 1) {
                            newRows = newCount;
                          } else {
                            // Clamp outputs to satisfy cols * rows <= count
                            if (newCols > newCount) newCols = newCount;
                            if (newCols * newRows > newCount) {
                              newRows = Math.floor(newCount / newCols);
                            }
                            if (newRows < 1) newRows = 1;
                          }

                          onChange({ 
                            ...plan, 
                            design: { 
                              ...plan.design, 
                              mobileConfig: { 
                                ...plan.design.mobileConfig!, 
                                widgetCount: newCount,
                                columns: newCols,
                                rows: newRows
                              } 
                            } 
                          });
                        }}
                        className="flex-1 accent-goguma"
                      />
                      <span className="w-12 text-center text-sm font-black text-goguma">{plan.design.mobileConfig?.widgetCount || 6}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('columns_rows')}</label>
                    <div className="flex gap-4">
                      <div className="flex-1 flex items-center gap-3 bg-white p-3 rounded-2xl border border-goguma-light focus-within:border-goguma transition-colors">
                        <span className="text-[10px] font-bold text-slate-400">Cols</span>
                        <input 
                          type="number" min="1" 
                          max={plan.design.mobileConfig?.widgetCount || 12}
                          value={plan.design.mobileConfig?.columns || 2}
                          onChange={(e) => {
                            const widgetCount = plan.design.mobileConfig?.widgetCount || 6;
                            const val = parseInt(e.target.value) || 1;
                            const finalCols = Math.min(val, widgetCount);
                            
                            let finalRows = plan.design.mobileConfig?.rows || 3;
                            // Ensure constraint: cols * rows <= count
                            if (finalCols * finalRows > widgetCount) {
                              finalRows = Math.floor(widgetCount / finalCols);
                            }
                            
                            // Specific list view sync
                            if (finalCols === 1) {
                              finalRows = widgetCount;
                            }
                            if (finalRows < 1) finalRows = 1;
                            
                            onChange({ 
                              ...plan, 
                              design: { 
                                ...plan.design, 
                                mobileConfig: { 
                                  ...plan.design.mobileConfig!, 
                                  columns: finalCols,
                                  rows: finalRows
                                } 
                              } 
                            });
                          }}
                          className="w-full text-sm font-black text-goguma outline-none text-center"
                        />
                      </div>
                      <div className="flex-1 flex items-center gap-3 bg-white p-3 rounded-2xl border border-goguma-light focus-within:border-goguma transition-colors">
                        <span className="text-[10px] font-bold text-slate-400">Rows</span>
                        <input 
                          type="number" min="1" 
                          max={plan.design.mobileConfig?.widgetCount || 12}
                          value={plan.design.mobileConfig?.rows || 3}
                          onChange={(e) => {
                            const widgetCount = plan.design.mobileConfig?.widgetCount || 6;
                            const val = parseInt(e.target.value) || 1;
                            const finalRows = Math.min(val, widgetCount);
                            
                            let finalCols = plan.design.mobileConfig?.columns || 2;
                            // Ensure constraint: cols * rows <= count
                            if (finalCols * finalRows > widgetCount) {
                                finalCols = Math.floor(widgetCount / finalRows);
                            }

                            if (finalCols < 1) finalCols = 1;

                            onChange({ 
                              ...plan, 
                              design: { 
                                ...plan.design, 
                                mobileConfig: { 
                                  ...plan.design.mobileConfig!, 
                                  rows: finalRows,
                                  columns: finalCols
                                } 
                              } 
                            });
                          }}
                          className="w-full text-sm font-black text-goguma outline-none text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-goguma-light space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('widget_name')} Configuration</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from({ length: plan.design.mobileConfig?.widgetCount || 6 }).map((_, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="w-10 h-10 rounded-xl bg-goguma-light text-goguma flex items-center justify-center text-[10px] font-black shrink-0">#{i + 1}</div>
                        <input
                          type="text"
                          value={plan.design.mobileConfig?.widgetNames?.[i] || `Widget ${i + 1}`}
                          onChange={(e) => {
                            const newNames = [...(plan.design.mobileConfig?.widgetNames || Array.from({ length: 12 }, (_, j) => `Widget ${j + 1}`))];
                            newNames[i] = e.target.value;
                            onChange({
                              ...plan,
                              design: {
                                ...plan.design,
                                mobileConfig: {
                                  ...plan.design.mobileConfig!,
                                  widgetNames: newNames
                                }
                              }
                            });
                          }}
                          className="flex-1 bg-white border border-goguma-light rounded-xl px-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-goguma-light transition-all"
                          placeholder={`${t('widget_name')} ${i + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hamburger menu configuration moved to preview as fixed icon */}

                {(plan.design.mobileConfig?.bottomNav) && (
                  <div className="pt-6 border-t border-goguma-light space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('bottom_tab_config')}</label>
                        <IconButton
                          onClick={handleRecommendTabs}
                          isLoading={isRecommendingTabs}
                          icon={Sparkles}
                          tooltip={t('ai_tab_recommend')}
                          variant="ai"
                          size="sm"
                          disabled={!plan.metadata?.projectOverview?.purpose}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase">{t('tab_count')}</span>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={plan.design.mobileConfig?.bottomTabItems?.length || 5}
                          onChange={(e) => {
                            const count = Math.min(5, Math.max(1, parseInt(e.target.value) || 1));
                            const currentItems = [...(plan.design.mobileConfig?.bottomTabItems || Array.from({ length: 5 }, (_, j) => ({ label: `Tab ${j + 1}`, icon: 'Home' })))];
                            
                            let newItems = [];
                            if (count > currentItems.length) {
                              newItems = [...currentItems];
                              for (let i = currentItems.length; i < count; i++) {
                                newItems.push({ label: `Tab ${i + 1}`, icon: 'Home' });
                              }
                            } else {
                              newItems = currentItems.slice(0, count);
                            }
                            
                            onChange({
                              ...plan,
                              design: {
                                ...plan.design,
                                mobileConfig: {
                                  ...plan.design.mobileConfig!,
                                  bottomTabItems: newItems
                                }
                              }
                            });
                          }}
                          className="w-16 px-3 py-1.5 bg-white border border-goguma-light rounded-xl outline-none font-bold text-center text-xs text-goguma"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(plan.design.mobileConfig?.bottomTabItems || Array.from({ length: 5 }, (_, j) => ({ label: `Tab ${j + 1}`, icon: 'Home' }))).map((item, i) => (
                        <div key={i} className="flex gap-2">
                          <div className="w-10 h-10 rounded-xl bg-goguma-light text-goguma flex items-center justify-center text-[10px] font-black shrink-0">#{i + 1}</div>
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => {
                                const newItems = [...(plan.design.mobileConfig?.bottomTabItems || [])];
                                newItems[i] = { ...newItems[i], label: e.target.value };
                                onChange({
                                  ...plan,
                                  design: { ...plan.design, mobileConfig: { ...plan.design.mobileConfig!, bottomTabItems: newItems } }
                                });
                              }}
                              className="flex-1 bg-white border border-goguma-light rounded-xl px-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-goguma-light transition-all"
                              placeholder={`Tab ${i + 1} Name`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(plan.design.mobileConfig?.showMenuDrawer) && (
                  <div className="pt-4 flex items-center gap-2 px-6 py-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <Check size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-700">{t('sync_nav_menus')}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onChange({ ...plan, design: { ...plan.design, layout: 'standard' } })}
                className={`p-6 rounded-3xl border-2 transition-all text-left group/layout ${
                  plan.design.layout === 'standard' ? 'border-goguma bg-goguma-light' : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 mb-4 flex items-center justify-center text-slate-400 group-hover/layout:text-goguma transition-colors">
                  <Layout size={24} />
                </div>
                <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">{t('standard_layout')}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{t('centered_layout_desc')}</p>
              </button>
              <button
                onClick={() => onChange({ ...plan, design: { ...plan.design, layout: 'sidebar' } })}
                className={`p-6 rounded-3xl border-2 transition-all text-left group/layout ${
                  plan.design.layout === 'sidebar' ? 'border-goguma bg-goguma-light' : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 mb-4 flex items-center justify-center text-slate-400 group-hover/layout:text-goguma transition-colors pt-1">
                  <List size={22} />
                </div>
                <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">{t('sidebar_layout')}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{t('sidebar_layout_desc')}</p>
              </button>
            </div>
          )}
        </div>

        {plan.metadata.platform === 'WEB' && (
          <div className="p-8 bg-goguma-light/30 rounded-[32px] border border-goguma-light/10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="text-xs font-black text-goguma uppercase tracking-widest">{t('grid_system')}</label>
                <IconButton
                  onClick={handleRecommendGrid}
                  isLoading={isRecommendingGrid}
                  icon={Sparkles}
                  tooltip={t('recommend_grid')}
                  variant="ai"
                  size="sm"
                  disabled={!plan.metadata?.projectOverview?.purpose}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase">{t('sections_count')}</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={plan.design.sectionTitles.length}
                  onChange={(e) => {
                    const count = Math.max(1, parseInt(e.target.value) || 1);
                    const newTitles = [...plan.design.sectionTitles];
                    const newColumns = [...(plan.design.sectionColumns || [])];
                    const newContentTypes = [...(plan.design.sectionContentTypes || [])];
                    
                    if (count > newTitles.length) {
                      for (let i = newTitles.length; i < count; i++) {
                        newTitles.push(`Section ${i + 1}`);
                        newColumns.push(1);
                        newContentTypes.push(['text']);
                      }
                    } else {
                      newTitles.splice(count);
                      newColumns.splice(count);
                      newContentTypes.splice(count);
                    }
                    onChange({ 
                      ...plan, 
                      design: {
                        ...plan.design,
                        sectionTitles: newTitles, 
                        sectionColumns: newColumns,
                        sectionContentTypes: newContentTypes
                      }
                    });
                  }}
                  className="w-16 px-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-center"
                />
              </div>
            </div>

            <div className="space-y-4">
              {plan.design.sectionTitles.map((title, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl border border-goguma-light shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-goguma text-white flex items-center justify-center text-[10px] font-black">{index + 1}</div>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        const newTitles = [...plan.design.sectionTitles];
                        newTitles[index] = e.target.value;
                        onChange({ 
                          ...plan, 
                          design: {
                            ...plan.design,
                            sectionTitles: newTitles 
                          }
                        });
                      }}
                      className="flex-1 bg-transparent border-none outline-none font-black text-slate-800 placeholder:text-slate-200"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 ml-12">
                     <div className="space-y-4">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Columns</label>
                         <div className="flex gap-1.5">
                           {[1, 2, 3, 4].map((num) => (
                             <Tooltip key={num} content={`${num} ${t('columns')}`}>
                               <button
                                 onClick={() => {
                                   const newColumns = [...(plan.design.sectionColumns || [])];
                                   const newContentTypes = [...(plan.design.sectionContentTypes || [])];
                                   newColumns[index] = num;
                                   const currentTypes = [...(newContentTypes[index] || [])];
                                   if (num > currentTypes.length) {
                                     for (let i = currentTypes.length; i < num; i++) currentTypes.push('text');
                                   } else {
                                     currentTypes.splice(num);
                                   }
                                   newContentTypes[index] = currentTypes;
                                   onChange({ 
                                     ...plan, 
                                     design: {
                                       ...plan.design,
                                       sectionColumns: newColumns, 
                                       sectionContentTypes: newContentTypes 
                                     }
                                   });
                                 }}
                                 className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                                   (plan.design.sectionColumns?.[index] || 1) === num
                                     ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                                     : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                 }`}
                               >
                                 {num}
                               </button>
                             </Tooltip>
                           ))}
                         </div>
                     </div>
 
                     <div className="space-y-4">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Content Types</label>
                        <div className="flex flex-wrap gap-2">
                          {Array.from({ length: plan.design.sectionColumns?.[index] || 1 }).map((_, colIdx) => (
                            <div key={colIdx} className="flex flex-col gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="text-[8px] font-black text-slate-400 uppercase text-center">Col {colIdx + 1}</span>
                               <div className="flex gap-1">
                                 <Tooltip content={t('text')}>
                                   <button
                                     onClick={() => {
                                       const newContentTypes = [...(plan.design.sectionContentTypes || [])];
                                       const currentTypes = [...(newContentTypes[index] || [])];
                                       currentTypes[colIdx] = 'text';
                                       newContentTypes[index] = currentTypes;
                                       onChange({ 
                                         ...plan, 
                                         design: {
                                           ...plan.design,
                                           sectionContentTypes: newContentTypes 
                                         }
                                       });
                                     }}
                                     className={`px-2 py-1 rounded text-[8px] font-black transition-all ${
                                       (plan.design.sectionContentTypes?.[index]?.[colIdx] || 'text') === 'text'
                                         ? 'bg-goguma text-white'
                                         : 'bg-white text-slate-400 font-bold'
                                     }`}
                                   >
                                     T
                                   </button>
                                 </Tooltip>
                                 <Tooltip content={t('image')}>
                                   <button
                                     onClick={() => {
                                       const newContentTypes = [...(plan.design.sectionContentTypes || [])];
                                       const currentTypes = [...(newContentTypes[index] || [])];
                                       currentTypes[colIdx] = 'image';
                                       newContentTypes[index] = currentTypes;
                                       onChange({ 
                                         ...plan, 
                                         design: {
                                           ...plan.design,
                                           sectionContentTypes: newContentTypes 
                                         }
                                       });
                                     }}
                                     className={`px-2 py-1 rounded text-[8px] font-black transition-all ${
                                       (plan.design.sectionContentTypes?.[index]?.[colIdx] || 'text') === 'image'
                                         ? 'bg-goguma text-white'
                                         : 'bg-white text-slate-400 font-bold'
                                     }`}
                                   >
                                     I
                                   </button>
                                 </Tooltip>
                               </div>
                            </div>
                          ))}
                        </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {plan.metadata.platform === 'WEB' && (
          <div className="p-10 bg-slate-900 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-goguma/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-goguma/40 transition-all duration-1000" />
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 relative z-10">
              <Info size={24} className="text-goguma" />
              {t('footer_branding')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('company_label')}</label>
                  <input
                    type="text"
                    name="companyName"
                    value={plan.metadata.footerInfo.companyName}
                    onChange={handleFooterChange}
                    className="w-full bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-goguma/50"
                    placeholder={t('company_label')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('address_label')}</label>
                  <input
                    type="text"
                    name="address"
                    value={plan.metadata.footerInfo.address}
                    onChange={handleFooterChange}
                    className="w-full bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-goguma/50"
                    placeholder={t('address_label')}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('representative_label')}</label>
                  <input
                    type="text"
                    name="representative"
                    value={plan.metadata.footerInfo.representative}
                    onChange={handleFooterChange}
                    className="w-full bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-goguma/50"
                    placeholder={t('representative_label')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('email')}</label>
                  <input
                    type="text"
                    name="email"
                    value={plan.metadata.footerInfo.email}
                    onChange={handleFooterChange}
                    className="w-full bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-goguma/50"
                    placeholder="contact@email.com"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
