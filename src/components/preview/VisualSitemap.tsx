import React, { useState } from 'react';
import { SitePlan, FormInputEntity } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, ChevronRight, ChevronDown, Network, GitGraph, ListTree } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { IconButton } from '../guide/Tooltip';
import { useSitePlan } from '../../contexts/SitePlanContext';
import { getIconForLabel } from '../../lib/utils';
import D3SitePlanTree from './D3SitePlanTree';

type PageItem = SitePlan['navigation']['pageStructure'][0];

interface TreeNode extends PageItem {
  children: TreeNode[];
}

export interface VisualSitemapProps {
  plan?: SitePlan;
  formInputs?: Record<string, FormInputEntity>;
  onSelectChapter?: (chapterId: number) => void;
  onSelectSection?: (sectionKey: string) => void;
  onPageClick?: (id: string) => void;
}

export default function VisualSitemap({ 
  plan: propPlan,
  formInputs,
  onSelectChapter,
  onSelectSection,
  onPageClick 
}: VisualSitemapProps) {
  const context = useSitePlan();
  const plan = propPlan || context.plan;
  const pages = plan?.navigation?.pageStructure || [];
  const targetUrl = plan.metadata?.projectOverview?.targetUrl;
  const { t } = useLanguage();
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [displayMode, setDisplayMode] = useState<'d3' | 'list'>('d3');

  const BottomTabIcon = ({ label }: { label: string; index: number }) => {
    const Icon = getIconForLabel(label);
    return <Icon size={14} />;
  };

  // Build tree from flat structure with depth for list view
  const buildTree = (items: SitePlan['navigation']['pageStructure']): TreeNode[] => {
    const tree: TreeNode[] = [];
    const stack: { node: TreeNode; depth: number }[] = [];

    items.forEach(item => {
      const node: TreeNode = { ...item, children: [] };
      
      while (stack.length > 0 && stack[stack.length - 1].depth >= (node.depth || 1)) {
        stack.pop();
      }

      if (stack.length === 0) {
        tree.push(node);
      } else {
        stack[stack.length - 1].node.children.push(node);
      }

      stack.push({ node, depth: node.depth || 1 });
    });

    return tree;
  };

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const tree = buildTree(pages);

  const renderNode = (node: TreeNode, index: number) => {
    const isExpanded = expandedNodes[node.id || ''] !== false;
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.id || index} className="relative">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          className="flex items-center gap-3 mb-3 relative z-10"
        >
          {/* Connector Line for children */}
          {(node.depth || 1) > 1 && (
            <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-5 h-px bg-stone-300" />
          )}
          
          <div 
            onClick={() => onPageClick?.(node.id || '')}
            className="shrink-0 w-8 h-8 rounded-[2px] bg-amber-50 text-[#D97706] flex items-center justify-center border border-amber-200/80 cursor-pointer hover:bg-amber-100 transition-colors shadow-2xs"
          >
            <FileText size={14} />
          </div>
          
          <div 
            onClick={() => onPageClick?.(node.id || '')}
            className="bg-white px-4 py-2.5 rounded-[2px] border border-stone-200 hover:border-[#D97706] transition-all group cursor-pointer min-w-[200px] shadow-2xs"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-sans font-semibold text-stone-900 tracking-tight truncate max-w-[160px]">
                  {node.name || t('untitled_page')}
                </h4>
                <p className="text-[10px] font-mono text-stone-500 mt-0.5 truncate max-w-[220px]">
                  {targetUrl ? (
                    `${targetUrl.replace(/\/$/, '')}${typeof node.slug === 'string' ? (node.slug.startsWith('/') ? node.slug : `/${node.slug}`) : '/'}`
                  ) : (
                    node.slug || '/'
                  )}
                </p>
              </div>
              {hasChildren && (
                <IconButton
                  onClick={() => toggleNode(node.id || '')}
                  icon={isExpanded ? ChevronDown : ChevronRight}
                  tooltip={isExpanded ? t('collapse') : t('expand')}
                  variant="ghost"
                  size="sm"
                  className="!p-1 text-stone-400 hover:text-stone-900"
                />
              )}
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-8 pl-5 border-l border-stone-300 mt-1 overflow-hidden"
            >
              {node.children.map((child, idx) => 
                renderNode(child, idx)
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden text-stone-900 bg-[#FBFBFA]">
      {/* View Switcher Sub-header */}
      <div className="px-3.5 py-1.5 bg-white border-b border-stone-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#D97706] text-white rounded-[2px] flex items-center justify-center font-bold text-[10px] shadow-2xs">
            <Network size={11} />
          </div>
          <span className="text-xs font-sans font-bold text-stone-900 tracking-tight">
            사이트 구조도 (SitePlan Tree)
          </span>
          <span className="hidden sm:inline text-[10px] font-mono text-stone-500">
            · 실시간 기획 연계 시각화
          </span>
        </div>

        {/* Display Mode Toggle */}
        <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-[2px] border border-stone-200 text-xs">
          <button
            onClick={() => setDisplayMode('d3')}
            className={`px-2 py-0.5 rounded-[2px] text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
              displayMode === 'd3'
                ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
            title="D3.js 인터랙티브 기획 연결 트리 보기"
          >
            <GitGraph size={12} className="text-[#D97706]" />
            <span>D3 트리</span>
          </button>
          <button
            onClick={() => setDisplayMode('list')}
            className={`px-2 py-0.5 rounded-[2px] text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
              displayMode === 'list'
                ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
            title="목록형 사이트맵 계층 보기"
          >
            <ListTree size={12} />
            <span>목록형</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {displayMode === 'd3' ? (
        <div className="flex-1 w-full h-full overflow-hidden relative">
          <D3SitePlanTree
            plan={plan}
            formInputs={formInputs}
            onSelectChapter={onSelectChapter}
            onSelectSection={onSelectSection}
            onPageClick={onPageClick}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FBFBFA]">
          <div className="flex items-center gap-3 mb-6 border-b border-stone-200 pb-4">
            <div className="w-8 h-8 bg-[#D97706] text-white rounded-[2px] flex items-center justify-center font-bold shadow-2xs">
              <Network size={16} />
            </div>
            <div>
              <h3 className="text-sm font-sans font-bold text-stone-900 tracking-tight">{t('visual_sitemap')}</h3>
              <p className="text-[11px] text-stone-500 mt-0.5">{t('sitemap_desc')}</p>
            </div>
          </div>

          <div className="relative overflow-x-auto pb-4">
            <div className="min-w-max space-y-2">
              {tree.map((node, idx) => renderNode(node, idx))}
            </div>
          </div>

          {plan.metadata.platform === 'APP' && plan.design.mobileConfig?.bottomNav && plan.design.mobileConfig.bottomTabItems && (
            <div className="mt-8 pt-6 border-t border-stone-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-mono tracking-widest text-stone-500">{t('bottom_tab_config')}</span>
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {plan.design.mobileConfig.bottomTabItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center gap-2 p-3 bg-white border border-stone-200 rounded-[2px] min-w-[90px] hover:border-[#D97706] transition-all shadow-2xs"
                  >
                    <div className="w-8 h-8 bg-amber-50 text-[#D97706] rounded-[2px] flex items-center justify-center border border-amber-200/60">
                      <BottomTabIcon label={item.label} index={i} />
                    </div>
                    <span className="text-[10px] font-mono text-stone-800 truncate max-w-[70px]">{item.label || `Tab ${i+1}`}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
