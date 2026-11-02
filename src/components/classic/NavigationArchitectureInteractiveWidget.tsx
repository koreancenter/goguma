import React, { useState } from 'react';
import { 
  Network, Plus, Trash2, Edit3, Check, 
  Layers, ArrowRight, MoveRight
} from 'lucide-react';
import { SitePlan } from '../../types';

interface PageItem {
  id: string;
  name: string;
  slug: string;
  type: 'page' | 'modal' | 'drawer';
  script: string;
}

interface NavigationArchitectureInteractiveWidgetProps {
  plan: SitePlan;
  setPlan: (plan: SitePlan) => void;
  onInputChange: (chapterId: number, sectionKey: string, text: string) => void;
}

const DEFAULT_PAGES: PageItem[] = [
  { 
    id: 'p1', 
    name: '메인 관리 대시보드', 
    slug: '/', 
    type: 'page', 
    script: '실시간 리소스 현황 조회, 키워드 검색, 주요 상태 지표 요약' 
  },
  { 
    id: 'p2', 
    name: '신규 리소스 등록 모달', 
    slug: '/new', 
    type: 'modal', 
    script: '빠른 신규 레코드 생성 폼 (제목, 분류, 담당자, 상태)' 
  },
  { 
    id: 'p3', 
    name: '상세 정보 및 편집 드로어', 
    slug: '/detail', 
    type: 'drawer', 
    script: '상세 속성 및 변경 이력 타임라인, 상태 전이 제어' 
  },
];

const SUGGESTED_PAGES = [
  { name: '데이터 분석 대시보드', slug: '/analytics', type: 'page' as const, script: '핵심 지표, 실시간 통계 및 시각화 리포트' },
  { name: '리소스 관리 테이블', slug: '/resources', type: 'page' as const, script: '전체 데이터 그리드, 다중 필터 및 일괄 처리' },
  { name: '시스템 환경 설정', slug: '/settings', type: 'modal' as const, script: '권한, API 연동 및 환경 구성 모달' },
];

export const NavigationArchitectureInteractiveWidget: React.FC<NavigationArchitectureInteractiveWidgetProps> = ({
  plan,
  setPlan,
  onInputChange,
}) => {
  const rawPageStructure = plan.navigation?.pageStructure;
  const initialPages: PageItem[] = (rawPageStructure && rawPageStructure.length > 0)
    ? rawPageStructure.map((p, idx) => {
        const slugStr = p.slug || '';
        const nameStr = p.name || `화면 ${idx + 1}`;
        return {
          id: p.id || `p_${idx}_${Date.now()}`,
          name: nameStr,
          slug: slugStr.startsWith('/') ? slugStr : `/${slugStr}`,
          type: slugStr.includes('modal') || nameStr.includes('모달') 
            ? 'modal' 
            : slugStr.includes('detail') || nameStr.includes('상세') 
              ? 'drawer' 
              : 'page',
          script: p.script || '주요 기능 화면'
        };
      })
    : DEFAULT_PAGES;

  const [pages, setPages] = useState<PageItem[]>(initialPages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editType, setEditType] = useState<'page' | 'modal' | 'drawer'>('page');
  const [editScript, setEditScript] = useState('');

  const [navPattern, setNavPattern] = useState<'modal_flow' | 'sidebar_flow' | 'tab_flow'>('modal_flow');

  const syncChanges = (updatedPages: PageItem[], pattern: 'modal_flow' | 'sidebar_flow' | 'tab_flow') => {
    setPages(updatedPages);

    const patternText = pattern === 'modal_flow' 
      ? '모달 기반 팝업 워크플로우' 
      : pattern === 'sidebar_flow' 
        ? '사이드바 + 상세 드로어 복합 레이아웃' 
        : '상단 탭 바 이동 내비게이션';

    const pageListSummary = updatedPages.map((p, idx) => 
      `${idx + 1}. [${p.type.toUpperCase()}] ${p.name} (${p.slug})\n   - 기능: ${p.script}`
    ).join('\n\n');

    onInputChange(4, 'screen_list', pageListSummary);
    onInputChange(4, 'interaction_flow', `내비게이션 패턴: ${patternText}\n총 ${updatedPages.length}개 화면 간 유기적 전환 플로우`);

    setPlan({
      ...plan,
      navigation: {
        ...plan.navigation,
        pageStructure: updatedPages.map((p, idx) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          depth: p.type === 'page' ? 1 : 2,
          script: p.script,
          route: p.slug,
          purpose: p.script,
        })),
        menus: updatedPages.filter(p => p.type === 'page').map(p => p.name)
      }
    });
  };

  const handleStartEdit = (p: PageItem) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditSlug(p.slug);
    setEditType(p.type);
    setEditScript(p.script);
  };

  const handleSaveEdit = (id: string) => {
    const updated = pages.map(p => {
      if (p.id === id) {
        return {
          ...p,
          name: editName.trim() || p.name,
          slug: editSlug.trim().startsWith('/') ? editSlug.trim() : `/${editSlug.trim()}`,
          type: editType,
          script: editScript.trim() || p.script,
        };
      }
      return p;
    });

    setEditingId(null);
    syncChanges(updated, navPattern);
  };

  const handleDeletePage = (id: string) => {
    if (pages.length <= 1) {
      alert('최소 1개 이상의 메인 화면이 필요합니다.');
      return;
    }
    const updated = pages.filter(p => p.id !== id);
    syncChanges(updated, navPattern);
  };

  const handleAddPage = (suggested?: { name: string; slug: string; type: 'page' | 'modal' | 'drawer'; script: string }) => {
    const newPage: PageItem = suggested ? {
      id: `p_${Date.now()}`,
      name: suggested.name,
      slug: suggested.slug,
      type: suggested.type,
      script: suggested.script
    } : {
      id: `p_${Date.now()}`,
      name: `새 화면 ${pages.length + 1}`,
      slug: `/screen-${pages.length + 1}`,
      type: 'page',
      script: '신규 기능 화면'
    };

    const updated = [...pages, newPage];
    syncChanges(updated, navPattern);
  };

  const handlePatternChange = (pattern: 'modal_flow' | 'sidebar_flow' | 'tab_flow') => {
    setNavPattern(pattern);
    syncChanges(pages, pattern);
  };

  const getTypeBadge = (type: 'page' | 'modal' | 'drawer') => {
    switch (type) {
      case 'page':
        return <span className="text-[10px] font-mono text-[#F5F3ED] px-1.5 py-0.5 rounded-[2px] bg-[#1A1A22] border border-[#2A2A38]">PAGE</span>;
      case 'modal':
        return <span className="text-[10px] font-mono text-[#C5A880] px-1.5 py-0.5 rounded-[2px] bg-[#C5A880]/15 border border-[#C5A880]/30">MODAL</span>;
      case 'drawer':
        return <span className="text-[10px] font-mono text-[#A87948] px-1.5 py-0.5 rounded-[2px] bg-[#A87948]/15 border border-[#A87948]/30">DRAWER</span>;
    }
  };

  return (
    <div className="bg-[#121216] rounded-[2px] p-5 sm:p-6 border border-[#23232A] space-y-6 text-[#F5F3ED] font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#23232A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[2px] bg-[#181820] text-[#C5A880] border border-[#282834]">
              <Network size={16} />
            </span>
            <h3 className="font-sans font-bold text-[#F5F3ED] text-base sm:text-lg tracking-tight">
              화면 구조 및 내비게이션 아키텍처 (IA)
            </h3>
            <span className="text-xs font-mono text-[#78756E]">
              {pages.length}개 화면 연동
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#B8B5AC] mt-1 font-sans leading-relaxed">
            서비스에 필요한 핵심 화면을 정의하고 이용 동선(Happy Path Flow)을 연결합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleAddPage()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#C5A880] hover:bg-[#D4B896] text-[#0A0A0C] text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Plus size={14} />
          <span>+ 화면 추가</span>
        </button>
      </div>

      {/* 1. Interactive Page Cards List */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-[#F5F3ED] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers size={14} className="text-[#C5A880]" />
            <span className="font-sans font-semibold">화면 및 모달 목록 (Information Architecture)</span>
          </div>
          <span className="text-xs text-[#78756E]">
            클릭하여 세부 수정 가능
          </span>
        </label>

        <div className="space-y-2">
          {pages.map((p, idx) => {
            const isEditing = editingId === p.id;
            return (
              <div
                key={p.id}
                className={`p-3.5 rounded-[2px] border transition-colors ${
                  isEditing 
                    ? 'border-[#C5A880] bg-[#181820] shadow-xs' 
                    : 'border-[#23232A] bg-[#16161C] hover:bg-[#1A1A22]'
                }`}
              >
                {isEditing ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-1 space-y-1">
                        <span className="text-xs text-[#B8B5AC]">화면 명칭</span>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-[#121216] border border-[#23232A] rounded-[2px] px-2.5 py-1.5 text-xs text-[#F5F3ED] outline-none focus:border-[#C5A880]"
                          placeholder="예: 메인 관리 대시보드"
                        />
                      </div>
                      <div className="sm:col-span-1 space-y-1">
                        <span className="text-xs text-[#B8B5AC]">경로 (URL Slug)</span>
                        <input
                          type="text"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className="w-full bg-[#121216] border border-[#23232A] rounded-[2px] px-2.5 py-1.5 text-xs font-mono text-[#F5F3ED] outline-none focus:border-[#C5A880]"
                          placeholder="/records"
                        />
                      </div>
                      <div className="sm:col-span-1 space-y-1">
                        <span className="text-xs text-[#B8B5AC]">화면 유형</span>
                        <select
                          value={editType}
                          onChange={(e) => setEditType(e.target.value as any)}
                          className="w-full bg-[#121216] border border-[#23232A] rounded-[2px] px-2.5 py-1.5 text-xs text-[#F5F3ED] outline-none focus:border-[#C5A880] cursor-pointer"
                        >
                          <option value="page" className="bg-[#121216] text-[#F5F3ED]">단일 페이지 (Page)</option>
                          <option value="modal" className="bg-[#121216] text-[#F5F3ED]">팝업 모달 (Modal)</option>
                          <option value="drawer" className="bg-[#121216] text-[#F5F3ED]">사이드 서랍 (Drawer)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-[#B8B5AC]">핵심 기능 및 역할 요약</span>
                      <input
                        type="text"
                        value={editScript}
                        onChange={(e) => setEditScript(e.target.value)}
                        className="w-full bg-[#121216] border border-[#23232A] rounded-[2px] px-2.5 py-1.5 text-xs text-[#F5F3ED] outline-none focus:border-[#C5A880]"
                        placeholder="이 화면에서 수행할 작업이나 기능 요약"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-[2px] border border-[#23232A] text-xs text-[#B8B5AC] hover:text-[#F5F3ED] cursor-pointer"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(p.id)}
                        className="px-3.5 py-1.5 rounded-[2px] bg-[#C5A880] text-[#0A0A0C] text-xs font-semibold hover:bg-[#D4B896] cursor-pointer shadow-xs"
                      >
                        수정 저장
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono text-[#78756E]">
                          0{idx + 1}.
                        </span>
                        <span className="font-sans font-semibold text-sm text-[#F5F3ED]">{p.name}</span>
                        <span className="font-mono text-xs text-[#C5A880]">
                          {p.slug}
                        </span>
                        <span className="text-[#383844]">·</span>
                        {getTypeBadge(p.type)}
                      </div>
                      <p className="text-xs text-[#B8B5AC] font-sans leading-relaxed">
                        {p.script}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(p)}
                        className="p-1.5 rounded-[2px] text-[#78756E] hover:text-[#F5F3ED] hover:bg-[#1E1E26] transition-colors cursor-pointer"
                        title="화면 정보 수정"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePage(p.id)}
                        className="p-1.5 rounded-[2px] text-[#78756E] hover:text-[#C5A880] hover:bg-[#1E1E26] transition-colors cursor-pointer"
                        title="화면 삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Add Suggested Pages */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-[#78756E]">
          <span className="text-[#78756E]">추천 화면:</span>
          {SUGGESTED_PAGES.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAddPage(s)}
              className="px-2.5 py-1 rounded-[2px] bg-[#16161C] hover:bg-[#1E1E28] text-xs text-[#B8B5AC] hover:text-[#F5F3ED] transition-colors cursor-pointer border border-[#23232A] flex items-center gap-1"
            >
              <span className="text-[#C5A880] font-mono">+</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Navigation Flow & Pattern Selection */}
      <div className="space-y-3 pt-4 border-t border-[#23232A]">
        <label className="text-xs font-semibold text-[#F5F3ED] flex items-center gap-1.5">
          <MoveRight size={14} className="text-[#C5A880]" />
          <span className="font-sans">화면 간 이동 및 인터랙션 방식 (Navigation Pattern)</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handlePatternChange('modal_flow')}
            className={`p-3.5 rounded-[2px] border text-left transition-colors cursor-pointer space-y-1.5 ${
              navPattern === 'modal_flow'
                ? 'border-[#C5A880] bg-[#181820] shadow-xs'
                : 'border-[#23232A] bg-[#16161C] hover:bg-[#1A1A22]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-sans font-semibold text-xs text-[#F5F3ED]">모달 기반 팝업 워크플로우</span>
              {navPattern === 'modal_flow' && <Check size={14} className="text-[#C5A880]" />}
            </div>
            <p className="text-xs text-[#B8B5AC] leading-relaxed">
              화면 전환 없이 현재 뷰 위에서 모달로 빠르게 등록 및 확인
            </p>
          </button>

          <button
            type="button"
            onClick={() => handlePatternChange('sidebar_flow')}
            className={`p-3.5 rounded-[2px] border text-left transition-colors cursor-pointer space-y-1.5 ${
              navPattern === 'sidebar_flow'
                ? 'border-[#C5A880] bg-[#181820] shadow-xs'
                : 'border-[#23232A] bg-[#16161C] hover:bg-[#1A1A22]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-sans font-semibold text-xs text-[#F5F3ED]">사이드바 + 상세 드로어</span>
              {navPattern === 'sidebar_flow' && <Check size={14} className="text-[#C5A880]" />}
            </div>
            <p className="text-xs text-[#B8B5AC] leading-relaxed">
              사이드바 메뉴 ➔ 중앙 데이터 그리드 ➔ 우측 슬라이드 서랍 형태
            </p>
          </button>

          <button
            type="button"
            onClick={() => handlePatternChange('tab_flow')}
            className={`p-3.5 rounded-[2px] border text-left transition-colors cursor-pointer space-y-1.5 ${
              navPattern === 'tab_flow'
                ? 'border-[#C5A880] bg-[#181820] shadow-xs'
                : 'border-[#23232A] bg-[#16161C] hover:bg-[#1A1A22]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-sans font-semibold text-xs text-[#F5F3ED]">상단 탭 바 이동</span>
              {navPattern === 'tab_flow' && <Check size={14} className="text-[#C5A880]" />}
            </div>
            <p className="text-xs text-[#B8B5AC] leading-relaxed">
              상단 탭으로 전체/오늘/완료 상태를 빠르게 넘겨보는 직관적 뷰
            </p>
          </button>
        </div>
      </div>

      {/* 3. Visual Connection Flow Diagram */}
      <div className="p-4 bg-[#16161C] rounded-[2px] border border-[#23232A] space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-sans font-semibold text-[#F5F3ED]">실시간 화면 동선 시각화</span>
          <span className="font-mono text-[#78756E]">
            04_SPEC.md 자동 동기화
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {pages.map((p, idx) => (
            <React.Fragment key={p.id}>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#121216] border border-[#23232A] text-xs font-sans shadow-2xs">
                <span className="font-mono text-[#78756E]">0{idx + 1}.</span>
                <span className="text-[#F5F3ED] font-medium">{p.name}</span>
                <span className="font-mono text-[11px] text-[#C5A880]">
                  {p.slug}
                </span>
              </div>
              {idx < pages.length - 1 && (
                <ArrowRight size={12} className="text-[#78756E] shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
