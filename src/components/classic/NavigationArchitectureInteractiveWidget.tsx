import React, { useState } from 'react';
import { 
  Network, Plus, Trash2, Edit3, Check, X, 
  Layers, ArrowRight, Monitor, Smartphone, 
  ExternalLink, Sparkles, MoveRight, Eye
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
    name: '메인 장부 대시보드', 
    slug: '/', 
    type: 'page', 
    script: '실시간 장부 목록 조회, 키워드 검색, 주요 일정 및 상태 칩 요약' 
  },
  { 
    id: 'p2', 
    name: '신규 데이터 등록 모달', 
    slug: '/new', 
    type: 'modal', 
    script: '1초 빠른 신규 입력 팝업 (이름, 연락처, 일정, 상태)' 
  },
  { 
    id: 'p3', 
    name: '상세 이력 및 수정 팝업', 
    slug: '/detail', 
    type: 'drawer', 
    script: '과거 방문 및 상담 이력 타임라인, 상태 변경([대기]➔[완료])' 
  },
];

const SUGGESTED_PAGES = [
  { name: '월간 일정 캘린더', slug: '/calendar', type: 'page' as const, script: '날짜별 예약 및 일정 달력 뷰' },
  { name: '월말 매출 정산 보드', slug: '/settlement', type: 'page' as const, script: '미수금 및 월별 총 매출 자동 합산 차트' },
  { name: '고객 알림 및 발송 설정', slug: '/settings', type: 'modal' as const, script: '예약 확인 문자 및 템플릿 설정 팝업' },
];

export const NavigationArchitectureInteractiveWidget: React.FC<NavigationArchitectureInteractiveWidgetProps> = ({
  plan,
  setPlan,
  onInputChange,
}) => {
  // Parse existing pages from plan.navigation.pageStructure or fallback to DEFAULT_PAGES
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

  // Flow navigation pattern
  const [navPattern, setNavPattern] = useState<'modal_flow' | 'sidebar_flow' | 'tab_flow'>('modal_flow');

  const syncChanges = (updatedPages: PageItem[], pattern: 'modal_flow' | 'sidebar_flow' | 'tab_flow') => {
    setPages(updatedPages);

    // 1. Update plan.navigation.pageStructure
    const newPageStructure = updatedPages.map((p, i) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      depth: p.type === 'page' ? 1 : 2,
      script: p.script,
      analyzedScript: p.script
    }));

    setPlan({
      ...plan,
      navigation: {
        ...plan.navigation,
        pageStructure: newPageStructure
      }
    });

    // 2. Sync with natural language Chapter 6 sections
    const pagesSummary = updatedPages
      .map((p, idx) => `${idx + 1}. ${p.name} (${p.slug}) [${p.type.toUpperCase()}]: ${p.script}`)
      .join('\n');
    onInputChange(6, 'pages_structure', pagesSummary);

    const patternText = pattern === 'modal_flow'
      ? '모달 기반 팝업 입력 (화면 이동 없이 현재 장부 위에서 즉시 작성 및 반영)'
      : pattern === 'sidebar_flow'
        ? '좌측 사이드바 메뉴 ➔ 중앙 장부 목록 ➔ 우측 상세 서랍(Drawer) 뷰'
        : '상단 탭 바 (전체보기 / 오늘 일정 / 대기 건) + 하단 빠른 액션 바';
    onInputChange(6, 'nav_hierarchy', `${patternText}\n동선 흐름: ${updatedPages.map(p => p.name).join(' ➔ ')}`);
  };

  const handleStartEdit = (p: PageItem) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditSlug(p.slug);
    setEditType(p.type);
    setEditScript(p.script);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    const cleanSlug = (editSlug || '').trim();
    const updated = pages.map(p => {
      if (p.id === id) {
        return {
          ...p,
          name: editName.trim(),
          slug: cleanSlug.startsWith('/') ? cleanSlug : `/${cleanSlug}`,
          type: editType,
          script: (editScript || '').trim() || '주요 기능 화면'
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
        return <span className="text-xs font-mono text-blue-400">Page</span>;
      case 'modal':
        return <span className="text-xs font-mono text-purple-400">Modal</span>;
      case 'drawer':
        return <span className="text-xs font-mono text-amber-400">Drawer</span>;
    }
  };

  return (
    <div className="bg-[#13181F] rounded-[3px] p-5 sm:p-6 border border-white/7 space-y-6 text-[#F0F3F6]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/7 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[2px] bg-[#18202A] text-[#C5A880] border border-white/10">
              <Network size={16} />
            </span>
            <h3 className="font-bold text-[#F0F3F6] text-base sm:text-lg">
              화면 구조 및 내비게이션 아키텍처 (IA)
            </h3>
            <span className="text-xs font-mono text-[#5C6675]">
              {pages.length}개 화면 연동
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#9AA5B5] mt-1 font-sans leading-relaxed">
            서비스에 필요한 핵심 화면을 정의하고 이용 동선(Happy Path Flow)을 연결합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleAddPage()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#C5A880] hover:bg-[#D4AF37] text-[#0B0C10] text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>+ 화면 추가</span>
        </button>
      </div>

      {/* 1. Interactive Page Cards List */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-[#F0F3F6] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers size={14} className="text-[#C5A880]" />
            <span>화면 및 모달 목록 (Information Architecture)</span>
          </div>
          <span className="text-xs text-[#5C6675]">
            클릭하여 세부 수정 가능
          </span>
        </label>

        <div className="space-y-2">
          {pages.map((p, idx) => {
            const isEditing = editingId === p.id;
            return (
              <div
                key={p.id}
                className={`p-3.5 rounded-[3px] border transition-colors ${
                  isEditing 
                    ? 'border-[#C5A880] bg-[#18202A]' 
                    : 'border-white/5 bg-[#18202A]/50 hover:bg-[#18202A] hover:border-white/10'
                }`}
              >
                {isEditing ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-1 space-y-1">
                        <span className="text-xs text-[#9AA5B5]">화면 명칭</span>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-[#13181F] border border-white/10 rounded-[2px] px-2.5 py-1.5 text-xs text-[#F0F3F6] outline-none focus:border-[#C5A880]"
                          placeholder="예: 메인 장부 대시보드"
                        />
                      </div>
                      <div className="sm:col-span-1 space-y-1">
                        <span className="text-xs text-[#9AA5B5]">경로 (URL Slug)</span>
                        <input
                          type="text"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className="w-full bg-[#13181F] border border-white/10 rounded-[2px] px-2.5 py-1.5 text-xs font-mono text-[#F0F3F6] outline-none focus:border-[#C5A880]"
                          placeholder="/records"
                        />
                      </div>
                      <div className="sm:col-span-1 space-y-1">
                        <span className="text-xs text-[#9AA5B5]">화면 유형</span>
                        <select
                          value={editType}
                          onChange={(e) => setEditType(e.target.value as any)}
                          className="w-full bg-[#13181F] border border-white/10 rounded-[2px] px-2.5 py-1.5 text-xs text-[#F0F3F6] outline-none focus:border-[#C5A880]"
                        >
                          <option value="page">단일 페이지 (Page)</option>
                          <option value="modal">팝업 모달 (Modal)</option>
                          <option value="drawer">사이드 서랍 (Drawer)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-[#9AA5B5]">핵심 기능 및 역할 요약</span>
                      <input
                        type="text"
                        value={editScript}
                        onChange={(e) => setEditScript(e.target.value)}
                        className="w-full bg-[#13181F] border border-white/10 rounded-[2px] px-2.5 py-1.5 text-xs text-[#F0F3F6] outline-none focus:border-[#C5A880]"
                        placeholder="이 화면에서 수행할 작업이나 기능 요약"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-[2px] border border-white/10 text-xs text-[#9AA5B5] hover:text-[#F0F3F6] cursor-pointer"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(p.id)}
                        className="px-3.5 py-1.5 rounded-[2px] bg-[#C5A880] text-[#0B0C10] text-xs font-semibold hover:bg-[#D4AF37] cursor-pointer"
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
                        <span className="font-mono text-[#5C6675]">
                          0{idx + 1}.
                        </span>
                        <span className="font-semibold text-sm text-[#F0F3F6]">{p.name}</span>
                        <span className="font-mono text-xs text-[#C5A880]">
                          {p.slug}
                        </span>
                        <span className="text-white/20">·</span>
                        {getTypeBadge(p.type)}
                      </div>
                      <p className="text-xs text-[#9AA5B5] font-sans leading-relaxed">
                        {p.script}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(p)}
                        className="p-1.5 rounded-[2px] text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/5 transition-colors cursor-pointer"
                        title="화면 정보 수정"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePage(p.id)}
                        className="p-1.5 rounded-[2px] text-[#5C6675] hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
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
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-[#9AA5B5]">
          <span className="text-[#5C6675]">추천 화면:</span>
          {SUGGESTED_PAGES.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAddPage(s)}
              className="px-2.5 py-1 rounded-[2px] bg-[#18202A] hover:bg-white/10 text-xs text-[#F0F3F6] transition-colors cursor-pointer border border-white/5 flex items-center gap-1"
            >
              <span>+</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Navigation Flow & Pattern Selection */}
      <div className="space-y-3 pt-4 border-t border-white/7">
        <label className="text-xs font-semibold text-[#F0F3F6] flex items-center gap-1.5">
          <MoveRight size={14} className="text-[#C5A880]" />
          <span>화면 간 이동 및 인터랙션 방식 (Navigation Pattern)</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handlePatternChange('modal_flow')}
            className={`p-3.5 rounded-[3px] border text-left transition-colors cursor-pointer space-y-1.5 ${
              navPattern === 'modal_flow'
                ? 'border-[#C5A880] bg-[#18202A]'
                : 'border-white/5 bg-[#13181F] hover:bg-[#18202A]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#F0F3F6]">모달 기반 팝업 입력</span>
              {navPattern === 'modal_flow' && <Check size={14} className="text-[#C5A880]" />}
            </div>
            <p className="text-xs text-[#9AA5B5] leading-relaxed">
              화면 전환 없이 장부 위에서 팝업으로 빠르게 등록 및 확인
            </p>
          </button>

          <button
            type="button"
            onClick={() => handlePatternChange('sidebar_flow')}
            className={`p-3.5 rounded-[3px] border text-left transition-colors cursor-pointer space-y-1.5 ${
              navPattern === 'sidebar_flow'
                ? 'border-[#C5A880] bg-[#18202A]'
                : 'border-white/5 bg-[#13181F] hover:bg-[#18202A]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#F0F3F6]">사이드바 + 상세 서랍</span>
              {navPattern === 'sidebar_flow' && <Check size={14} className="text-[#C5A880]" />}
            </div>
            <p className="text-xs text-[#9AA5B5] leading-relaxed">
              사이드바 메뉴 ➔ 중앙 장부 ➔ 우측 슬라이드 서랍 형태
            </p>
          </button>

          <button
            type="button"
            onClick={() => handlePatternChange('tab_flow')}
            className={`p-3.5 rounded-[3px] border text-left transition-colors cursor-pointer space-y-1.5 ${
              navPattern === 'tab_flow'
                ? 'border-[#C5A880] bg-[#18202A]'
                : 'border-white/5 bg-[#13181F] hover:bg-[#18202A]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#F0F3F6]">상단 탭 바 이동</span>
              {navPattern === 'tab_flow' && <Check size={14} className="text-[#C5A880]" />}
            </div>
            <p className="text-xs text-[#9AA5B5] leading-relaxed">
              상단 탭으로 전체/오늘/완료 상태를 빠르게 넘겨보는 직관적 뷰
            </p>
          </button>
        </div>
      </div>

      {/* 3. Visual Connection Flow Diagram */}
      <div className="p-4 bg-[#0E1217] rounded-[3px] border border-white/7 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#F0F3F6]">실시간 화면 동선 시각화</span>
          <span className="font-mono text-[#5C6675]">
            04_SPEC.md 자동 동기화
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {pages.map((p, idx) => (
            <React.Fragment key={p.id}>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#18202A] border border-white/10 text-xs font-sans">
                <span className="font-mono text-[#C5A880]">0{idx + 1}.</span>
                <span className="text-[#F0F3F6] font-medium">{p.name}</span>
                <span className="font-mono text-[11px] text-[#5C6675]">
                  {p.slug}
                </span>
              </div>
              {idx < pages.length - 1 && (
                <ArrowRight size={12} className="text-[#5C6675] shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
