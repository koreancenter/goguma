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
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

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
        pageStructure: updatedPages.map((p) => ({
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
      setNoticeMessage('최소 1개 이상의 메인 화면이 필요합니다.');
      setTimeout(() => setNoticeMessage(null), 2500);
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

  const getTypeLabel = (type: 'page' | 'modal' | 'drawer') => {
    switch (type) {
      case 'page':
        return <span className="text-[14px] font-mono font-bold text-[#52524E]">PAGE</span>;
      case 'modal':
        return <span className="text-[14px] font-mono font-bold text-[#000000]">MODAL</span>;
      case 'drawer':
        return <span className="text-[14px] font-mono font-bold text-[#000000]">DRAWER</span>;
    }
  };

  return (
    <div className="space-y-10 text-[#111111] font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#000000]">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[16px] sm:text-[18px] font-extrabold tabular-nums text-[#52524E] tracking-[0.08em]">
              03
            </span>
            <h3 className="font-extrabold text-[#000000] text-[22px] sm:text-[26px] tracking-[-0.02em]">
              화면 구조 및 내비게이션 아키텍처
            </h3>
            <span className="text-[15px] font-bold text-[#52524E] tabular-nums">
              {pages.length}개 화면 연동
            </span>
          </div>
          <p className="text-[17px] sm:text-[19px] text-[#52524E] leading-[1.7] pl-8">
            서비스에 필요한 핵심 화면을 정의하고 이용 동선(Happy Path Flow)을 연결합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleAddPage()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] text-[16px] font-bold transition-colors cursor-pointer self-start shrink-0 whitespace-nowrap"
        >
          <Plus size={16} />
          <span>화면 추가</span>
        </button>
      </div>

      {noticeMessage && (
        <div className="px-5 py-3.5 rounded-none bg-[#F6F5F1] border border-[#000000] text-[#DC2626] text-[16px] font-bold">
          {noticeMessage}
        </div>
      )}

      {/* 1. Interactive Page Cards List */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[17px] sm:text-[18px]">
          <div className="flex items-center gap-2 font-extrabold text-[#000000]">
            <Layers size={18} className="text-[#000000]" />
            <span>화면 및 모달 목록 (Information Architecture)</span>
          </div>
          <span className="text-[15px] text-[#787772]">
            편집 아이콘을 눌러 세부 수정 가능
          </span>
        </div>

        <div className="space-y-4">
          {pages.map((p, idx) => {
            const isEditing = editingId === p.id;
            return (
              <div
                key={p.id}
                className={`p-6 rounded-none border transition-colors ${
                  isEditing 
                    ? 'bg-[#FFFFFF] border-2 border-[#000000]' 
                    : 'bg-[#F6F5F1] border-[#E4E2DC] hover:border-[#000000]'
                }`}
              >
                {isEditing ? (
                  // Edit Mode
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-1 space-y-2">
                        <span className="text-[15px] font-bold text-[#000000] block">화면 명칭</span>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-[#FFFFFF] border border-[#E4E2DC] focus:border-[#000000] rounded-none px-4 py-3 text-[17px] text-[#000000] outline-none transition-colors"
                          placeholder="예: 메인 관리 대시보드"
                        />
                      </div>
                      <div className="sm:col-span-1 space-y-2">
                        <span className="text-[15px] font-bold text-[#000000] block">경로 (URL Slug)</span>
                        <input
                          type="text"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className="w-full bg-[#FFFFFF] border border-[#E4E2DC] focus:border-[#000000] rounded-none px-4 py-3 text-[17px] font-mono text-[#000000] outline-none transition-colors"
                          placeholder="/records"
                        />
                      </div>
                      <div className="sm:col-span-1 space-y-2">
                        <span className="text-[15px] font-bold text-[#000000] block">화면 유형</span>
                        <select
                          value={editType}
                          onChange={(e) => setEditType(e.target.value as any)}
                          className="w-full bg-[#FFFFFF] border border-[#E4E2DC] focus:border-[#000000] rounded-none px-4 py-3 text-[17px] text-[#000000] outline-none transition-colors cursor-pointer"
                        >
                          <option value="page">단일 페이지 (Page)</option>
                          <option value="modal">팝업 모달 (Modal)</option>
                          <option value="drawer">사이드 서랍 (Drawer)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[15px] font-bold text-[#000000] block">핵심 기능 및 역할 요약</span>
                      <input
                        type="text"
                        value={editScript}
                        onChange={(e) => setEditScript(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#E4E2DC] focus:border-[#000000] rounded-none px-4 py-3 text-[17px] text-[#000000] outline-none transition-colors"
                        placeholder="이 화면에서 수행할 작업이나 기능 요약"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-5 py-2.5 rounded-none border border-[#E4E2DC] text-[16px] font-bold text-[#52524E] hover:text-[#000000] hover:border-[#000000] cursor-pointer bg-[#FFFFFF]"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(p.id)}
                        className="px-5 py-2.5 rounded-none bg-[#000000] text-[#FFE600] text-[16px] font-bold hover:bg-[#DC2626] cursor-pointer transition-colors"
                      >
                        수정 저장
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-bold tabular-nums text-[16px] text-[#52524E]">
                          0{idx + 1}.
                        </span>
                        <span className="font-extrabold text-[18px] sm:text-[19px] text-[#000000]">{p.name}</span>
                        <span className="font-mono text-[15px] text-[#52524E] font-bold">
                          {p.slug}
                        </span>
                        <span className="text-[#CBC8BF]">·</span>
                        {getTypeLabel(p.type)}
                      </div>
                      <p className="text-[16px] sm:text-[17px] text-[#52524E] leading-[1.65]">
                        {p.script}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(p)}
                        className="inline-flex items-center justify-center h-10 w-10 rounded-none border border-[#E4E2DC] bg-[#FFFFFF] text-[#52524E] hover:text-[#000000] hover:border-[#000000] transition-colors cursor-pointer"
                        title="화면 정보 수정"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePage(p.id)}
                        className="inline-flex items-center justify-center h-10 w-10 rounded-none border border-[#E4E2DC] bg-[#FFFFFF] text-[#52524E] hover:text-[#FFE600] hover:bg-[#DC2626] hover:border-[#DC2626] transition-colors cursor-pointer"
                        title="화면 삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Add Suggested Pages */}
        <div className="pt-3 flex flex-wrap items-center gap-2.5">
          <span className="text-[16px] font-bold text-[#000000]">추천 화면:</span>
          {SUGGESTED_PAGES.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAddPage(s)}
              className="px-4 py-2 rounded-none bg-[#F6F5F1] border border-[#E4E2DC] hover:bg-[#000000] text-[15px] text-[#111111] hover:text-[#FFE600] hover:border-[#000000] transition-colors cursor-pointer flex items-center gap-2 font-bold"
            >
              <span>+</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Navigation Flow & Pattern Selection */}
      <div className="space-y-4 pt-6 border-t border-[#E4E2DC]">
        <label className="text-[17px] sm:text-[18px] font-extrabold text-[#000000] flex items-center gap-2">
          <MoveRight size={17} className="text-[#000000]" />
          <span>화면 간 이동 및 인터랙션 방식</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handlePatternChange('modal_flow')}
            className={`p-5 rounded-none text-left transition-colors cursor-pointer space-y-2 border ${
              navPattern === 'modal_flow'
                ? 'bg-[#FFFFFF] border-2 border-[#000000]'
                : 'bg-[#F6F5F1] border-[#E4E2DC] hover:border-[#000000]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-extrabold text-[16px] text-[#000000]">모달 기반 팝업 워크플로우</span>
              {navPattern === 'modal_flow' && <Check size={16} className="text-[#000000] shrink-0" />}
            </div>
            <p className="text-[15px] text-[#52524E] leading-relaxed">
              화면 전환 없이 현재 뷰 위에서 모달로 빠르게 등록 및 확인
            </p>
          </button>

          <button
            type="button"
            onClick={() => handlePatternChange('sidebar_flow')}
            className={`p-5 rounded-none text-left transition-colors cursor-pointer space-y-2 border ${
              navPattern === 'sidebar_flow'
                ? 'bg-[#FFFFFF] border-2 border-[#000000]'
                : 'bg-[#F6F5F1] border-[#E4E2DC] hover:border-[#000000]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-extrabold text-[16px] text-[#000000]">사이드바 + 상세 드로어</span>
              {navPattern === 'sidebar_flow' && <Check size={16} className="text-[#000000] shrink-0" />}
            </div>
            <p className="text-[15px] text-[#52524E] leading-relaxed">
              사이드바 메뉴 ➔ 중앙 데이터 그리드 ➔ 우측 슬라이드 서랍 형태
            </p>
          </button>

          <button
            type="button"
            onClick={() => handlePatternChange('tab_flow')}
            className={`p-5 rounded-none text-left transition-colors cursor-pointer space-y-2 border ${
              navPattern === 'tab_flow'
                ? 'bg-[#FFFFFF] border-2 border-[#000000]'
                : 'bg-[#F6F5F1] border-[#E4E2DC] hover:border-[#000000]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-extrabold text-[16px] text-[#000000]">상단 탭 바 이동</span>
              {navPattern === 'tab_flow' && <Check size={16} className="text-[#000000] shrink-0" />}
            </div>
            <p className="text-[15px] text-[#52524E] leading-relaxed">
              상단 탭으로 전체/오늘/완료 상태를 빠르게 넘겨보는 직관적 뷰
            </p>
          </button>
        </div>
      </div>

      {/* 3. Visual Connection Flow Diagram */}
      <div className="p-6 bg-[#F6F5F1] border border-[#E4E2DC] rounded-none space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[16px]">
          <span className="font-extrabold text-[#000000]">실시간 화면 동선 시각화</span>
          <span className="font-mono text-[15px] text-[#52524E]">
            04_SPEC.md 자동 동기화
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {pages.map((p, idx) => (
            <React.Fragment key={p.id}>
              <div className="flex items-center gap-2 px-4 py-2 rounded-none bg-[#FFFFFF] border border-[#E4E2DC] text-[15px]">
                <span className="tabular-nums text-[#52524E] font-bold">0{idx + 1}.</span>
                <span className="text-[#000000] font-bold">{p.name}</span>
                <span className="font-mono text-[14px] text-[#52524E] font-bold">
                  {p.slug}
                </span>
              </div>
              {idx < pages.length - 1 && (
                <ArrowRight size={15} className="text-[#787772] shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
