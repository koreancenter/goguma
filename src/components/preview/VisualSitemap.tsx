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
  const { t, pick } = useLanguage();
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
            <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-5 h-px bg-[var(--theme-border-hairline)]" />
          )}
          
          <div 
            onClick={() => onPageClick?.(node.id || '')}
            className="shrink-0 w-8 h-8 rounded-[2px] bg-[var(--theme-subtle)] text-[var(--theme-ink-strong)] border border-[var(--theme-border-hairline)] flex items-center justify-center cursor-pointer hover:bg-[var(--theme-active-bg)] hover:text-[var(--theme-active-text)] transition-colors"
          >
            <FileText size={14} />
          </div>
          
          <div 
            onClick={() => onPageClick?.(node.id || '')}
            className="bg-[var(--theme-stage)] px-4 py-2.5 rounded-[2px] border border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)] transition-all group cursor-pointer min-w-[200px]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-sans font-semibold text-[var(--theme-ink-strong)] tracking-tight truncate max-w-[160px]">
                  {node.name || t('untitled_page')}
                </h4>
                <p className="text-[10px] font-sans text-[var(--theme-ink-secondary)] mt-0.5 truncate max-w-[220px]">
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
                  className="!p-1 text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)]"
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
              className="ml-8 pl-5 border-l border-[var(--theme-border-hairline)] mt-1 overflow-hidden"
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
    <div className="w-full h-full flex flex-col overflow-hidden text-[var(--theme-ink-primary)] bg-[var(--theme-canvas)]">
      {/* Compact View Switcher Bar */}
      <div className="px-5 py-2.5 bg-[var(--theme-stage)] border-b border-[var(--theme-border-hairline)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[var(--theme-subtle)] text-[var(--theme-ink-strong)] rounded-[2px] flex items-center justify-center font-bold text-[10px]">
            <Network size={12} />
          </div>
          <span className="text-xs font-sans font-semibold text-[var(--theme-ink-strong)] tracking-tight">
            {pick({ ko: '사이트 구조도 (SitePlan Tree)', en: 'Site Structure (SitePlan Tree)', ja: 'サイト構造図 (SitePlan Tree)', id: 'Struktur Situs (SitePlan Tree)' })}
          </span>
          <span className="hidden sm:inline text-[11px] font-sans text-[var(--theme-ink-secondary)]">
            · {pick({ ko: '실시간 기획 연계 시각화', en: 'Live Spec Traceability Map', ja: 'リアルタイム企画連携可視化', id: 'Visualisasi Keterkaitan Spek Langsung' })}
          </span>
        </div>

        {/* Display Mode Toggle */}
        <div className="flex items-center gap-1 bg-[var(--theme-canvas)] p-0.5 rounded-[2px] border border-[var(--theme-border-hairline)] text-xs">
          <button
            onClick={() => setDisplayMode('d3')}
            className={`px-2.5 py-1 rounded-[2px] text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
              displayMode === 'd3'
                ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] font-semibold'
                : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)]'
            }`}
            title={pick({ ko: 'D3.js 인터랙티브 기획 연결 트리 보기', en: 'View interactive D3.js spec tree', ja: 'D3.js インタラクティブ企画連携ツリーを表示', id: 'Lihat pohon spek interaktif D3.js' })}
          >
            <GitGraph size={12} />
            <span>{pick({ ko: 'D3 트리', en: 'D3 Tree', ja: 'D3 ツリー', id: 'Pohon D3' })}</span>
          </button>
          <button
            onClick={() => setDisplayMode('list')}
            className={`px-2.5 py-1 rounded-[2px] text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
              displayMode === 'list'
                ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] font-semibold'
                : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)]'
            }`}
            title={pick({ ko: '목록형 사이트맵 계층 보기', en: 'View hierarchical list sitemap', ja: 'リスト形式サイトマップ階層を表示', id: 'Lihat daftar hierarki peta situs' })}
          >
            <ListTree size={12} />
            <span>{pick({ ko: '목록형', en: 'List View', ja: 'リスト表示', id: 'Tampilan Daftar' })}</span>
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
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[var(--theme-canvas)] custom-scroll">
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--theme-border-hairline)] pb-4">
            <div className="w-8 h-8 bg-[var(--theme-subtle)] text-[var(--theme-ink-strong)] rounded-[2px] flex items-center justify-center font-bold">
              <Network size={16} />
            </div>
            <div>
              <h3 className="text-sm font-sans font-semibold text-[var(--theme-ink-strong)] tracking-tight">{t('visual_sitemap')}</h3>
              <p className="text-xs text-[var(--theme-ink-secondary)] mt-0.5">{t('sitemap_desc')}</p>
            </div>
          </div>

          <div className="relative overflow-x-auto pb-4">
            <div className="min-w-max space-y-2">
              {tree.map((node, idx) => renderNode(node, idx))}
            </div>
          </div>

          {plan.metadata.platform === 'APP' && plan.design.mobileConfig?.bottomNav && plan.design.mobileConfig.bottomTabItems && (
            <div className="mt-8 pt-6 border-t border-[var(--theme-border-hairline)]">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-sans font-semibold tracking-widest text-[var(--theme-ink-secondary)]">{t('bottom_tab_config')}</span>
              </div>
              
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                {plan.design.mobileConfig.bottomTabItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center gap-2 p-3 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] rounded-[2px] min-w-[90px] hover:border-[var(--theme-ink-strong)] transition-all"
                  >
                    <div className="w-8 h-8 bg-[var(--theme-subtle)] text-[var(--theme-ink-strong)] rounded-[2px] flex items-center justify-center">
                      <BottomTabIcon label={item.label} index={i} />
                    </div>
                    <span className="text-[10px] font-sans text-[var(--theme-ink-primary)] truncate max-w-[70px]">{item.label || `Tab ${i+1}`}</span>
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
