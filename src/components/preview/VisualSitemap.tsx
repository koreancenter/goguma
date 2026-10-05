import React, { useState } from 'react';
import { SitePlan } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, ChevronRight, ChevronDown, Network } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { IconButton } from '../guide/Tooltip';

type PageItem = SitePlan['navigation']['pageStructure'][0];

interface TreeNode extends PageItem {
  children: TreeNode[];
}

import { useSitePlan } from '../../contexts/SitePlanContext';
import { getIconForLabel } from '../../lib/utils';

export default function VisualSitemap({ onPageClick }: { onPageClick?: (id: string) => void }) {
  const { plan } = useSitePlan();
  const pages = plan?.navigation?.pageStructure || [];
  const targetUrl = plan.metadata?.projectOverview?.targetUrl;
  const { t } = useLanguage();
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const BottomTabIcon = ({ label, index }: { label: string, index: number }) => {
    const Icon = getIconForLabel(label);
    return <Icon size={16} />;
  };

  // Build tree from flat structure with depth
  const buildTree = (items: SitePlan['navigation']['pageStructure']): TreeNode[] => {
    const tree: TreeNode[] = [];
    const stack: { node: TreeNode; depth: number }[] = [];

    items.forEach(item => {
      const node: TreeNode = { ...item, children: [] };
      
      while (stack.length > 0 && stack[stack.length - 1].depth >= node.depth) {
        stack.pop();
      }

      if (stack.length === 0) {
        tree.push(node);
      } else {
        stack[stack.length - 1].node.children.push(node);
      }

      stack.push({ node, depth: node.depth });
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

  const renderNode = (node: TreeNode, index: number, isLast: boolean) => {
    const colors = [
      'bg-goguma',
      'bg-goguma-light',
      'bg-slate-900',
      'bg-emerald-600'
    ];
    const currentColor = colors[node.depth % colors.length];
    const isExpanded = expandedNodes[node.id] !== false; // Default to expanded
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.id} className="relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-4 mb-4 relative z-10"
        >
          {/* Connector Line for children */}
          {node.depth > 0 && (
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-[2px] bg-slate-200" />
          )}
          
          <div 
            onClick={() => onPageClick?.(node.id)}
            className={`shrink-0 w-12 h-12 rounded-2xl ${currentColor} text-white flex items-center justify-center shadow-lg shadow-slate-200 cursor-pointer hover:scale-110 active:scale-95 transition-all`}
          >
            <FileText size={20} />
          </div>
          
          <div 
            onClick={() => onPageClick?.(node.id)}
            className="bg-white px-6 py-4 rounded-[24px] border-2 border-slate-100 shadow-sm min-w-[200px] hover:border-goguma transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-black text-slate-900 truncate max-w-[150px]">{node.name || t('untitled_page')}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate max-w-[200px]">
                  {targetUrl ? (
                    `${targetUrl.replace(/\/$/, '')}${typeof node.slug === 'string' ? (node.slug.startsWith('/') ? node.slug : `/${node.slug}`) : '/'}`
                  ) : (
                    node.slug || '/'
                  )}
                </p>
              </div>
              {hasChildren && (
                <IconButton
                  onClick={() => toggleNode(node.id)}
                  icon={isExpanded ? ChevronDown : ChevronRight}
                  tooltip={isExpanded ? t('collapse') : t('expand')}
                  variant="ghost"
                  size="sm"
                  className="!p-2"
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
              className="ml-12 pl-6 border-l-2 border-slate-100 mt-2 overflow-hidden"
            >
              {node.children.map((child, idx) => 
                renderNode(child, idx, idx === node.children.length - 1)
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="p-10 bg-slate-50/50 rounded-[48px] border border-slate-100 overflow-hidden">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
          <Network size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('visual_sitemap')}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('sitemap_desc')}</p>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-8">
        <div className="min-w-max space-y-4">
          {tree.map((node, idx) => renderNode(node, idx, idx === tree.length - 1))}
        </div>
      </div>

      {plan.metadata.platform === 'APP' && plan.design.mobileConfig?.bottomNav && plan.design.mobileConfig.bottomTabItems && (
        <div className="mt-12 pt-12 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-goguma rounded-lg flex items-center justify-center text-white shadow-lg">
              <ChevronDown size={16} />
            </div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t('bottom_tab_config')}</h4>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {plan.design.mobileConfig.bottomTabItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-slate-100 rounded-3xl shadow-sm min-w-[100px] hover:border-goguma transition-all"
              >
                <div className="w-10 h-10 bg-goguma-light text-goguma rounded-xl flex items-center justify-center">
                  <BottomTabIcon label={item.label} index={i} />
                </div>
                <span className="text-[11px] font-black text-slate-900 truncate max-w-[80px]">{item.label || `Tab ${i+1}`}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
