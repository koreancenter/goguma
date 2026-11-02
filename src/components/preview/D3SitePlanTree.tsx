import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { 
  Network, Search, ZoomIn, ZoomOut, Maximize2, 
  ChevronRight, ChevronDown, Sparkles, FileText, 
  ExternalLink, Layers, ArrowRight, Download, Eye,
  CheckCircle2, Clock, Cpu, Users, Database, Shield, Palette
} from 'lucide-react';
import { SitePlan, FormInputEntity } from '../../types';
import { GOGUMA_CHAPTERS } from '../../lib/chapterData';

export type SitePlanNodeType = 
  | 'root'               // 최상위 서비스/프로젝트
  | 'category'           // 대분류 (화면 구조, 핵심 기능, 타깃 페르소나, 데이터 모델, 아키텍처)
  | 'page'               // 사이트맵 페이지 (Route)
  | 'subpage'            // 서브페이지/모달/드로어
  | 'feature'            // 핵심 기능 (매핑된 화면 연결)
  | 'flow_step'          // 유저 플로우 단계
  | 'user_input'         // 사용자 직접 작성 기획 입력 내용
  | 'data_entity'        // 데이터베이스 엔터티
  | 'tech_token';        // 기술 스택 및 디자인 토큰

export interface SitePlanTreeNode {
  id: string;
  name: string;
  type: SitePlanNodeType;
  badge?: string;
  badgeColor?: string;
  route?: string;
  chapterId?: number;
  sectionKey?: string;
  chapterTitle?: string;
  sourceText?: string;
  isUserInput?: boolean;
  charCount?: number;
  details?: Record<string, any>;
  children?: SitePlanTreeNode[];
  _children?: SitePlanTreeNode[]; // For collapsing
}

interface D3SitePlanTreeProps {
  plan: SitePlan;
  formInputs?: Record<string, FormInputEntity>;
  onSelectChapter?: (chapterId: number) => void;
  onSelectSection?: (sectionKey: string) => void;
  onPageClick?: (id: string) => void;
}

export const D3SitePlanTree: React.FC<D3SitePlanTreeProps> = ({
  plan,
  formInputs = {},
  onSelectChapter,
  onSelectSection,
  onPageClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // View mode
  const [viewMode, setViewMode] = useState<'all' | 'pages' | 'traceability'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<SitePlanTreeNode | null>(null);
  const [isLivePulse, setIsLivePulse] = useState(false);
  const [matchedCount, setMatchedCount] = useState<number>(0);

  // Trigger pulse effect when inputs or plan changes
  useEffect(() => {
    setIsLivePulse(true);
    const timer = setTimeout(() => setIsLivePulse(false), 1200);
    return () => clearTimeout(timer);
  }, [plan, formInputs]);

  // 1. Build Tree Data linking user inputs to SitePlan in real time
  const treeData = useMemo<SitePlanTreeNode>(() => {
    const rawProjectName = formInputs['1_project_name']?.userRawInput?.trim() 
      || plan.metadata?.projectName 
      || 'GOGUMA 웹 서비스';
    const rawPlatform = plan.metadata?.platform === 'APP' ? 'PWA Mobile App' : 'Responsive Web';
    const isProjectCustom = Boolean(formInputs['1_project_name']?.userRawInput?.trim());

    // --- Branch 1: Site Pages & Screen Structure (Ch. 6 + SitePlan.navigation) ---
    const pageStructure = plan.navigation?.pageStructure || [];
    const pageChildren: SitePlanTreeNode[] = [];

    // Parse features from Ch. 3 to attach to pages
    const featureText = formInputs['3_key_features']?.userRawInput || '';
    const parsedFeaturesList: { name: string; targetScreen?: string; priority?: string }[] = [];
    if (plan.features?.list && plan.features.list.length > 0) {
      plan.features.list.forEach(f => {
        parsedFeaturesList.push({
          name: f.name,
          priority: f.priority,
          targetScreen: f.mappedScreens?.[0]
        });
      });
    } else if (featureText) {
      featureText.split('\n').filter(Boolean).forEach((line, idx) => {
        parsedFeaturesList.push({
          name: line.replace(/^[-*•\d.]\s*/, '').trim(),
          priority: idx === 0 ? 'P0 필수' : 'P1 중요'
        });
      });
    }

    const defaultPages = [
      { id: 'p1', name: '메인 관리 대시보드', slug: '/', script: '실시간 리소스 현황 조회, 키워드 검색, 주요 상태 지표 요약', depth: 1 },
      { id: 'p2', name: '신규 리소스 등록 모달', slug: '/new', script: '빠른 신규 레코드 생성 폼 (제목, 분류, 담당자, 상태)', depth: 2 },
      { id: 'p3', name: '상세 정보 및 편집 드로어', slug: '/detail', script: '상세 속성 및 변경 이력 타임라인, 상태 전이 제어', depth: 2 },
    ];

    const pagesToRender = pageStructure.length > 0 ? pageStructure : defaultPages;

    pagesToRender.forEach((p, pIdx) => {
      const pageSlug = p.slug || (pIdx === 0 ? '/' : `/${p.name.toLowerCase().replace(/\s+/g, '-')}`);
      const pageScript = p.script || formInputs['6_pages_structure']?.userRawInput || '주요 기능 렌더링 화면';
      const pageType: SitePlanNodeType = (p.depth && p.depth > 1) || pageSlug.includes('modal') || pageSlug.includes('detail') 
        ? 'subpage' 
        : 'page';

      // Find any features mapped to this page
      const mappedFeatures = parsedFeaturesList.filter(f => 
        (f.targetScreen && (f.targetScreen.includes(p.name) || f.targetScreen.includes(pageSlug))) ||
        (pIdx === 0 && f.name.includes('대시보드')) ||
        (pageSlug.includes('new') && f.name.includes('등록')) ||
        (pageSlug.includes('detail') && f.name.includes('테이블'))
      );

      const pageNodeChildren: SitePlanTreeNode[] = [];

      // Add mapped feature nodes
      if (mappedFeatures.length > 0) {
        mappedFeatures.forEach((mf, mfIdx) => {
          pageNodeChildren.push({
            id: `page_${p.id || pIdx}_feature_${mfIdx}`,
            name: `매핑 기능: ${mf.name}`,
            type: 'feature',
            badge: mf.priority || '연동 기능',
            badgeColor: 'terracotta',
            chapterId: 3,
            sectionKey: 'key_features',
            chapterTitle: '제3장: 핵심 기능 명세',
            sourceText: `화면 [${p.name}]에 직접 마운트된 기능: ${mf.name}`,
            isUserInput: true,
          });
        });
      }

      // Add user input script / requirements node if available
      if (p.script) {
        pageNodeChildren.push({
          id: `page_${p.id || pIdx}_script`,
          name: `화면 요구스펙: ${p.script.slice(0, 24)}...`,
          type: 'user_input',
          badge: '기획 스펙',
          badgeColor: 'emerald',
          chapterId: 6,
          sectionKey: 'pages_structure',
          chapterTitle: '제6장: 사이트맵 및 화면 정의',
          sourceText: p.script,
          charCount: p.script.length,
          isUserInput: true,
        });
      }

      // Add connected data entity for main pages
      if (pIdx === 0 || pageSlug === '/') {
        pageNodeChildren.push({
          id: `page_${p.id || pIdx}_entity_proj`,
          name: '연동 데이터: ProjectEntity',
          type: 'data_entity',
          badge: 'DB 스키마',
          badgeColor: 'indigo',
          chapterId: 4,
          sectionKey: 'data_columns',
          chapterTitle: '제4장: 데이터 모델 & 엔터티',
          sourceText: 'ProjectEntity { id: UUID, name: string, plan: SitePlan, updatedAt: ISO8601 }',
          isUserInput: true,
        });
      } else if (pageSlug.includes('new') || pageSlug.includes('detail')) {
        pageNodeChildren.push({
          id: `page_${p.id || pIdx}_entity_target`,
          name: '연동 데이터: TargetAppItem (CRUD)',
          type: 'data_entity',
          badge: 'LocalStore',
          badgeColor: 'indigo',
          chapterId: 4,
          sectionKey: 'data_columns',
          chapterTitle: '제4장: 데이터 모델 & 엔터티',
          sourceText: 'TargetAppItem { id: string, title: string, status: PENDING | CONFIRMED, createdAt: ISO8601 }',
          isUserInput: true,
        });
      }

      pageChildren.push({
        id: `page_${p.id || pIdx}`,
        name: p.name,
        type: pageType,
        route: pageSlug,
        badge: pageSlug,
        badgeColor: 'emerald',
        chapterId: 6,
        sectionKey: 'pages_structure',
        chapterTitle: '제6장: 사이트맵 및 화면 정의',
        sourceText: pageScript,
        charCount: pageScript.length,
        isUserInput: true,
        children: pageNodeChildren.length > 0 ? pageNodeChildren : undefined,
      });
    });

    // --- Branch 2: Core Features & User Flows (Ch. 3) ---
    const featureChildren: SitePlanTreeNode[] = [];
    const happyPathRaw = formInputs['3_happy_path']?.userRawInput || '';

    // Add Key Features
    const defaultFeatureItems = [
      { name: '사용자 인증 및 세션 관리 (JWT & SSO)', priority: 'P0 필수', route: '/auth/login' },
      { name: '실시간 메트릭 대시보드 (KPI Overview)', priority: 'P0 필수', route: '/' },
      { name: '고성능 데이터 테이블 & 스마트 검색', priority: 'P1 중요', route: '/detail' },
    ];
    const featuresSource = parsedFeaturesList.length > 0 ? parsedFeaturesList : defaultFeatureItems;

    featuresSource.forEach((f, idx) => {
      const targetRoute = f.targetScreen || (idx === 0 ? '/auth/login' : idx === 1 ? '/' : '/detail');
      featureChildren.push({
        id: `feat_${idx}`,
        name: f.name,
        type: 'feature',
        badge: f.priority || 'P0 필수',
        badgeColor: 'terracotta',
        route: targetRoute,
        chapterId: 3,
        sectionKey: 'key_features',
        chapterTitle: '제3장: 핵심 기능 명세',
        sourceText: `[기능 명세] ${f.name} ➔ 대상 화면: ${targetRoute}`,
        isUserInput: Boolean(formInputs['3_key_features']?.userRawInput),
        children: [
          {
            id: `feat_${idx}_link`,
            name: `연결 대상 화면 ➔ [${targetRoute}]`,
            type: 'page',
            badge: '화면 바인딩',
            badgeColor: 'emerald',
            route: targetRoute,
            chapterId: 6,
            sectionKey: 'pages_structure',
            chapterTitle: '제6장: 사이트맵 연결',
            sourceText: `기능 [${f.name}]은 라우트 [${targetRoute}]에서 실행됩니다.`,
          }
        ]
      });
    });

    // Add User Flow (Happy Path)
    if (happyPathRaw) {
      const steps = happyPathRaw.split('\n').filter(Boolean).slice(0, 4);
      const flowStepChildren: SitePlanTreeNode[] = steps.map((st, sIdx) => ({
        id: `flow_step_${sIdx}`,
        name: `Step ${sIdx + 1}: ${st.slice(0, 26)}...`,
        type: 'flow_step',
        badge: `Flow ${sIdx + 1}`,
        badgeColor: 'terracotta',
        chapterId: 3,
        sectionKey: 'happy_path',
        chapterTitle: '제3장: 유저 플로우 (Happy Path)',
        sourceText: st,
        charCount: st.length,
        isUserInput: true,
      }));

      featureChildren.push({
        id: 'feat_happy_path_group',
        name: '엔드투엔드 유저 플로우 (Happy Path)',
        type: 'flow_step',
        badge: `${steps.length}단계 흐름`,
        badgeColor: 'terracotta',
        chapterId: 3,
        sectionKey: 'happy_path',
        chapterTitle: '제3장: 유저 플로우',
        sourceText: happyPathRaw,
        isUserInput: true,
        children: flowStepChildren,
      });
    }

    // --- Branch 3: Target Persona & Needs (Ch. 2 & Ch. 1) ---
    const targetPersonaRaw = formInputs['2_target_persona']?.userRawInput || '';
    const userProblemsRaw = formInputs['2_user_problems']?.userRawInput || '';
    const problemBackgroundRaw = formInputs['1_problem_background']?.userRawInput || '';

    const personaChildren: SitePlanTreeNode[] = [
      {
        id: 'persona_target',
        name: targetPersonaRaw ? `타깃: ${targetPersonaRaw.split('\n')[0].slice(0, 25)}...` : '타깃 페르소나 (B2B SaaS PM & 개발자)',
        type: 'user_input',
        badge: '주요 사용자군',
        badgeColor: 'amber',
        chapterId: 2,
        sectionKey: 'target_persona',
        chapterTitle: '제2장: 타깃 사용자 명세',
        sourceText: targetPersonaRaw || '서비스 주 사용자 및 지원 환경 정의',
        charCount: targetPersonaRaw.length,
        isUserInput: Boolean(targetPersonaRaw),
      },
      {
        id: 'persona_problem',
        name: userProblemsRaw ? `해결 과제: ${userProblemsRaw.split('\n')[0].slice(0, 24)}...` : '사용자 Pain Points & 결핍 해소',
        type: 'user_input',
        badge: 'Pain Point',
        badgeColor: 'amber',
        chapterId: 2,
        sectionKey: 'user_problems',
        chapterTitle: '제2장: 사용자 요구사항',
        sourceText: userProblemsRaw || '해결하고자 하는 사용자의 핵심 결핍 사항',
        charCount: userProblemsRaw.length,
        isUserInput: Boolean(userProblemsRaw),
      },
      {
        id: 'persona_goal',
        name: problemBackgroundRaw ? `개발 배경: ${problemBackgroundRaw.split('\n')[0].slice(0, 24)}...` : '개발 목표 및 기대 효과',
        type: 'user_input',
        badge: '기술 목표',
        badgeColor: 'amber',
        chapterId: 1,
        sectionKey: 'problem_background',
        chapterTitle: '제1장: 개발 배경 및 기술 목표',
        sourceText: problemBackgroundRaw || '시스템 구축 배경 및 11종 사양서 사출 목표',
        charCount: problemBackgroundRaw.length,
        isUserInput: Boolean(problemBackgroundRaw),
      }
    ];

    // --- Branch 4: Data Models & Business Rules (Ch. 4) ---
    const dataColumnsRaw = formInputs['4_data_columns']?.userRawInput || '';
    const businessRulesRaw = formInputs['4_business_rules']?.userRawInput || '';

    const dataChildren: SitePlanTreeNode[] = [
      {
        id: 'data_entity_project',
        name: 'ProjectEntity (SSOT)',
        type: 'data_entity',
        badge: 'UUID v4',
        badgeColor: 'indigo',
        chapterId: 4,
        sectionKey: 'data_columns',
        chapterTitle: '제4장: 데이터 모델 & 엔터티',
        sourceText: 'ProjectEntity { id: UUID, name: string, plan: SitePlan, currentChapter: number, updatedAt: ISO8601 }',
        isUserInput: true,
      },
      {
        id: 'data_entity_target_crud',
        name: 'TargetAppItem (LocalStore CRUD)',
        type: 'data_entity',
        badge: 'IndexedDB',
        badgeColor: 'indigo',
        chapterId: 4,
        sectionKey: 'data_columns',
        chapterTitle: '제4장: 데이터 모델 & 엔터티',
        sourceText: dataColumnsRaw || 'TargetAppItem { id: string, title: string, status: PENDING | CONFIRMED, createdAt: ISO8601 }',
        charCount: dataColumnsRaw.length,
        isUserInput: Boolean(dataColumnsRaw),
      },
      {
        id: 'data_business_rules',
        name: businessRulesRaw ? `유효성 규칙: ${businessRulesRaw.split('\n')[0].slice(0, 22)}...` : '비즈니스 로직 & 300ms 디바운스',
        type: 'user_input',
        badge: '무결성 규칙',
        badgeColor: 'indigo',
        chapterId: 4,
        sectionKey: 'business_rules',
        chapterTitle: '제4장: 비즈니스 규칙 & 유효성 검증',
        sourceText: businessRulesRaw || '모든 데이터 300ms 디바운스 및 브라우저 온디바이스 무손실 영속성',
        charCount: businessRulesRaw.length,
        isUserInput: Boolean(businessRulesRaw),
      }
    ];

    // --- Branch 5: Architecture & Design System (Ch. 5 & Ch. 7) ---
    const brandMoodRaw = formInputs['5_brand_mood']?.userRawInput || '';
    const stackReqRaw = formInputs['7_stack_requirements']?.userRawInput || '';

    const techChildren: SitePlanTreeNode[] = [
      {
        id: 'tech_design_token',
        name: `비주얼 테마: ${brandMoodRaw ? brandMoodRaw.split('\n')[0].slice(0, 22) : 'Archival Paper & Sumuk Ink'}`,
        type: 'tech_token',
        badge: plan.design?.themeColor || '#23392D',
        badgeColor: 'slate',
        chapterId: 5,
        sectionKey: 'brand_mood',
        chapterTitle: '제5장: 비주얼 테마 및 컬러 토큰',
        sourceText: brandMoodRaw || '모노크롬 테마 토큰, 1px 헤어라인 테두리 (#E5E0D8), 제로 필 규약',
        charCount: brandMoodRaw.length,
        isUserInput: Boolean(brandMoodRaw),
      },
      {
        id: 'tech_stack',
        name: `기술 스택: ${stackReqRaw ? stackReqRaw.split('\n')[0].slice(0, 24) : 'React 19 + TypeScript + Vite + Tailwind'}`,
        type: 'tech_token',
        badge: 'React 19',
        badgeColor: 'slate',
        chapterId: 7,
        sectionKey: 'stack_requirements',
        chapterTitle: '제7장: 기술 스택 및 프레임워크',
        sourceText: stackReqRaw || 'React 19 + TypeScript + Tailwind CSS + IndexedDB Local-First',
        charCount: stackReqRaw.length,
        isUserInput: Boolean(stackReqRaw),
      },
      {
        id: 'tech_export_bundle',
        name: '산출물: 11종 기술 사양서 + prototype.html',
        type: 'tech_token',
        badge: '11 Docs ZIP',
        badgeColor: 'emerald',
        chapterId: 8,
        sectionKey: 'export_summary',
        chapterTitle: '제8장: 최종 개발 명세서 번들',
        sourceText: 'docs/ 디렉터리 11개 마크다운 문서 및 단일 파일 독립 프로토타입 패키지',
        isUserInput: true,
      }
    ];

    // Mode-specific tree building:
    if (viewMode === 'pages') {
      // Screen & Feature focused tree
      return {
        id: 'root_pages_focus',
        name: rawProjectName,
        type: 'root',
        badge: rawPlatform,
        badgeColor: 'sumuk',
        chapterId: 1,
        sectionKey: 'project_name',
        chapterTitle: '제1장: 서비스 개요',
        sourceText: formInputs['1_project_name']?.userRawInput || rawProjectName,
        isUserInput: isProjectCustom,
        children: pageChildren,
      };
    }

    if (viewMode === 'traceability') {
      // Linear Traceability Pipeline Tree
      return {
        id: 'root_traceability',
        name: `${rawProjectName} (기획 요구사항 추적 매트릭스)`,
        type: 'root',
        badge: 'Traceability Flow',
        badgeColor: 'sumuk',
        chapterId: 1,
        sectionKey: 'project_name',
        sourceText: '요구사항(문제) ➔ 페르소나 ➔ 핵심 기능 ➔ 화면 ➔ 데이터 모델 파이프라인',
        children: [
          {
            id: 'trace_problems',
            name: '1단계: 해결 과제 및 문제 정의 (Ch. 1 & 2)',
            type: 'category',
            badge: 'Problem',
            badgeColor: 'amber',
            children: personaChildren,
          },
          {
            id: 'trace_features',
            name: '2단계: 핵심 기능 및 유저 플로우 (Ch. 3)',
            type: 'category',
            badge: 'Feature',
            badgeColor: 'terracotta',
            children: featureChildren,
          },
          {
            id: 'trace_pages',
            name: '3단계: 화면 구조 및 라우팅 (Ch. 6)',
            type: 'category',
            badge: 'Page Structure',
            badgeColor: 'emerald',
            children: pageChildren,
          },
          {
            id: 'trace_data',
            name: '4단계: 데이터 모델 및 배포 산출물 (Ch. 4, 7, 8)',
            type: 'category',
            badge: 'Schema & Release',
            badgeColor: 'indigo',
            children: [...dataChildren, ...techChildren],
          }
        ]
      };
    }

    // Default 'all' - Complete SitePlan & Planning Tree
    return {
      id: 'root_service',
      name: rawProjectName,
      type: 'root',
      badge: rawPlatform,
      badgeColor: 'sumuk',
      chapterId: 1,
      sectionKey: 'project_name',
      chapterTitle: '제1장: 서비스 명칭 및 정의',
      sourceText: formInputs['1_project_name']?.userRawInput || rawProjectName,
      isUserInput: isProjectCustom,
      children: [
        {
          id: 'cat_pages',
          name: '사이트맵 및 화면 구조 (Site Pages & IA)',
          type: 'category',
          badge: `${pagesToRender.length}개 화면`,
          badgeColor: 'emerald',
          chapterId: 6,
          sectionKey: 'pages_structure',
          chapterTitle: '제6장: 정보구조 및 화면 정의서',
          sourceText: formInputs['6_pages_structure']?.userRawInput || '전체 화면 목록 및 라우팅 경로',
          children: pageChildren,
        },
        {
          id: 'cat_features',
          name: '핵심 기능 및 유저 플로우 (Features & Flow)',
          type: 'category',
          badge: `${featuresSource.length}개 기능`,
          badgeColor: 'terracotta',
          chapterId: 3,
          sectionKey: 'key_features',
          chapterTitle: '제3장: 핵심 기능 명세 및 플로우',
          sourceText: formInputs['3_key_features']?.userRawInput || '필수 기능 요구사항 및 엔드투엔드 동선',
          children: featureChildren,
        },
        {
          id: 'cat_persona',
          name: '타깃 페르소나 및 요구사항 (Persona & Needs)',
          type: 'category',
          badge: '목표 & 결핍',
          badgeColor: 'amber',
          chapterId: 2,
          sectionKey: 'target_persona',
          chapterTitle: '제2장: 타깃 사용자 및 요구사항',
          sourceText: formInputs['2_target_persona']?.userRawInput || '사용자 그룹 및 디바이스 환경 명세',
          children: personaChildren,
        },
        {
          id: 'cat_data',
          name: '데이터 모델 및 비즈니스 규칙 (Data & Rules)',
          type: 'category',
          badge: 'DB 스키마',
          badgeColor: 'indigo',
          chapterId: 4,
          sectionKey: 'data_columns',
          chapterTitle: '제4장: 데이터 모델 & 엔터티 명세',
          sourceText: formInputs['4_data_columns']?.userRawInput || '엔터티 구조 및 비즈니스 무결성 규칙',
          children: dataChildren,
        },
        {
          id: 'cat_tech',
          name: '디자인 시스템 및 기술 스택 (Tokens & Tech)',
          type: 'category',
          badge: '아키텍처',
          badgeColor: 'slate',
          chapterId: 7,
          sectionKey: 'stack_requirements',
          chapterTitle: '제7장: 기술 스택 및 프레임워크 규약',
          sourceText: formInputs['7_stack_requirements']?.userRawInput || 'React 19 + TypeScript + Tailwind CSS',
          children: techChildren,
        }
      ]
    };
  }, [plan, formInputs, viewMode]);

  // Collapsed state store: id -> boolean
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});

  const toggleNodeCollapse = useCallback((nodeId: string) => {
    setCollapsedMap(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  }, []);

  const expandAllNodes = useCallback(() => {
    setCollapsedMap({});
  }, []);

  const collapseToCategories = useCallback(() => {
    // Collapse all category children
    const newMap: Record<string, boolean> = {};
    if (treeData.children) {
      treeData.children.forEach(cat => {
        if (cat.children && cat.children.length > 0) {
          cat.children.forEach(c => {
            if (c.children && c.children.length > 0) {
              newMap[c.id] = true;
            }
          });
        }
      });
    }
    setCollapsedMap(newMap);
  }, [treeData]);

  // Color mapping helper
  const getNodeColor = (type: SitePlanNodeType, badgeColor?: string) => {
    switch (badgeColor || type) {
      case 'sumuk':
      case 'root':
        return { bg: '#16161C', border: '#C5A880', text: '#F5F3ED', badgeBg: '#C5A880', badgeText: '#0A0A0C' };
      case 'emerald':
      case 'page':
      case 'subpage':
        return { bg: '#131317', border: '#2D3D32', text: '#F5F3ED', badgeBg: '#1C2E24', badgeText: '#A3E635' };
      case 'terracotta':
      case 'feature':
      case 'flow_step':
        return { bg: '#131317', border: '#4A3225', text: '#F5F3ED', badgeBg: '#382216', badgeText: '#FDBA74' };
      case 'amber':
        return { bg: '#131317', border: '#4A3B1C', text: '#F5F3ED', badgeBg: '#362810', badgeText: '#FCD34D' };
      case 'indigo':
      case 'data_entity':
        return { bg: '#131317', border: '#2D3358', text: '#F5F3ED', badgeBg: '#1E2344', badgeText: '#A5B4FC' };
      case 'slate':
      case 'tech_token':
        return { bg: '#131317', border: '#33333E', text: '#F5F3ED', badgeBg: '#202028', badgeText: '#D4D4D8' };
      default:
        return { bg: '#131317', border: '#262630', text: '#F5F3ED', badgeBg: '#1C1C24', badgeText: '#8E8B82' };
    }
  };

  // Node Icon Helper
  const getNodeIcon = (type: SitePlanNodeType) => {
    switch (type) {
      case 'root': return '🏛️';
      case 'category': return '📂';
      case 'page': return '📄';
      case 'subpage': return '📑';
      case 'feature': return '⚡';
      case 'flow_step': return '➔';
      case 'user_input': return '✍️';
      case 'data_entity': return '🗄️';
      case 'tech_token': return '⚙️';
      default: return '•';
    }
  };

  // 2. Render D3 Tree on SVG
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerRect = containerRef.current.getBoundingClientRect();
    const width = Math.max(containerRect.width || 800, 600);
    const height = Math.max(containerRect.height || 640, 480);

    // Create Main Zoomable Group
    const g = svg.append('g').attr('class', 'main-tree-group');

    // Zoom setup
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Filter & Apply Collapse status to hierarchy
    const cloneTreeWithCollapse = (node: SitePlanTreeNode): SitePlanTreeNode => {
      const isCollapsed = Boolean(collapsedMap[node.id]);
      const copy: SitePlanTreeNode = { ...node };

      if (node.children && node.children.length > 0) {
        if (isCollapsed) {
          copy._children = node.children.map(cloneTreeWithCollapse);
          copy.children = undefined;
        } else {
          copy.children = node.children.map(cloneTreeWithCollapse);
          copy._children = undefined;
        }
      }
      return copy;
    };

    const rootHierarchyData = cloneTreeWithCollapse(treeData);
    const root = d3.hierarchy<SitePlanTreeNode>(rootHierarchyData);

    // Compute tree layout
    // Dynamic node height separation: 62px, horizontal separation: 260px
    const treeLayout = d3.tree<SitePlanTreeNode>()
      .nodeSize([68, 270])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.25));

    treeLayout(root);

    // Count search matches
    let matchCount = 0;
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      root.descendants().forEach(d => {
        const n = d.data;
        if (
          n.name.toLowerCase().includes(query) ||
          n.badge?.toLowerCase().includes(query) ||
          n.route?.toLowerCase().includes(query) ||
          n.sourceText?.toLowerCase().includes(query)
        ) {
          matchCount++;
        }
      });
    }
    setMatchedCount(matchCount);

    // 1. Draw Links
    const linkGenerator = d3.linkHorizontal<any, d3.HierarchyPointNode<SitePlanTreeNode>>()
      .x(d => d.y)
      .y(d => d.x);

    g.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(root.links())
      .enter()
      .append('path')
      .attr('d', linkGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        const isMatched = query && (
          d.target.data.name.toLowerCase().includes(query) ||
          d.source.data.name.toLowerCase().includes(query)
        );
        return isMatched ? '#C5A880' : '#262632';
      })
      .attr('stroke-width', (d) => {
        const isMatched = query && (
          d.target.data.name.toLowerCase().includes(query) ||
          d.source.data.name.toLowerCase().includes(query)
        );
        return isMatched ? 2 : 1.2;
      })
      .attr('stroke-dasharray', (d) => {
        return d.target.data.type === 'user_input' ? '4,4' : 'none';
      })
      .attr('opacity', 0.85);

    // 2. Draw Nodes
    const nodeCardWidth = 224;
    const nodeCardHeight = 52;

    const nodeSelection = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d.data);
      });

    // Node Cards via ForeignObject for crisp React/HTML rendering inside SVG
    nodeSelection.each(function(d) {
      const nodeG = d3.select(this);
      const data = d.data;
      const isMatched = query && (
        data.name.toLowerCase().includes(query) ||
        data.badge?.toLowerCase().includes(query) ||
        data.route?.toLowerCase().includes(query) ||
        data.sourceText?.toLowerCase().includes(query)
      );
      const isSelected = selectedNode?.id === data.id;
      const hasChildren = (data.children && data.children.length > 0) || (data._children && data._children.length > 0);
      const isCollapsed = Boolean(data._children && data._children.length > 0);
      const colors = getNodeColor(data.type, data.badgeColor);

      // Card Background Box
      nodeG.append('rect')
        .attr('x', -10)
        .attr('y', -nodeCardHeight / 2)
        .attr('width', nodeCardWidth)
        .attr('height', nodeCardHeight)
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('fill', colors.bg)
        .attr('stroke', isSelected ? '#C5A880' : isMatched ? '#C5A880' : colors.border)
        .attr('stroke-width', isSelected ? 2 : isMatched ? 1.8 : 1)
        .style('filter', isSelected ? 'drop-shadow(0 4px 12px rgba(197,168,128,0.18))' : 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))')
        .on('mouseenter', function() {
          d3.select(this).attr('stroke', '#C5A880').attr('stroke-width', 1.8);
        })
        .on('mouseleave', function() {
          if (!isSelected) {
            d3.select(this).attr('stroke', isMatched ? '#C5A880' : colors.border).attr('stroke-width', isMatched ? 1.8 : 1);
          }
        });

      // Left Accent Color Bar
      nodeG.append('rect')
        .attr('x', -10)
        .attr('y', -nodeCardHeight / 2)
        .attr('width', 3)
        .attr('height', nodeCardHeight)
        .attr('rx', 1.5)
        .attr('fill', isSelected ? '#C5A880' : colors.border);

      // Node Icon Emoji
      nodeG.append('text')
        .attr('x', 0)
        .attr('y', -4)
        .attr('font-size', '13px')
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'middle')
        .text(getNodeIcon(data.type));

      // Node Title
      nodeG.append('text')
        .attr('x', 22)
        .attr('y', -10)
        .attr('fill', colors.text)
        .attr('font-size', '11px')
        .attr('font-weight', data.type === 'root' || data.type === 'category' ? 'bold' : '600')
        .attr('font-family', 'Pretendard Variable, -apple-system, BlinkMacSystemFont, system-ui, sans-serif')
        .attr('dominant-baseline', 'middle')
        .text(() => {
          const maxLen = 17;
          return data.name.length > maxLen ? `${data.name.slice(0, maxLen)}…` : data.name;
        })
        .append('title')
        .text(data.name);

      // Node Subtitle / Route or Details snippet
      nodeG.append('text')
        .attr('x', 22)
        .attr('y', 8)
        .attr('fill', data.type === 'root' ? '#F5F3ED' : '#8E8B82')
        .attr('font-size', '9.5px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('dominant-baseline', 'middle')
        .text(() => {
          if (data.route) return data.route;
          if (data.sourceText) return data.sourceText.slice(0, 22) + (data.sourceText.length > 22 ? '…' : '');
          return data.badge || '';
        });

      // Node Badge on right top
      if (data.badge) {
        const badgeG = nodeG.append('g')
          .attr('transform', `translate(${nodeCardWidth - 20}, -${nodeCardHeight / 2 - 10})`);

        const badgeText = data.badge.length > 10 ? `${data.badge.slice(0, 10)}…` : data.badge;

        badgeG.append('rect')
          .attr('x', -badgeText.length * 6 - 8)
          .attr('y', -4)
          .attr('width', badgeText.length * 6 + 10)
          .attr('height', 14)
          .attr('rx', 2)
          .attr('fill', colors.badgeBg)
          .attr('opacity', 0.95);

        badgeG.append('text')
          .attr('x', -badgeText.length * 3 - 3)
          .attr('y', 4)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', colors.badgeText)
          .attr('font-size', '8.5px')
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('font-weight', 'bold')
          .text(badgeText);
      }

      // Live user input checkmark badge
      if (data.isUserInput) {
        nodeG.append('circle')
          .attr('cx', nodeCardWidth - 18)
          .attr('cy', nodeCardHeight / 2 - 12)
          .attr('r', 3)
          .attr('fill', '#C5A880')
          .append('title')
          .text('사용자 기획 입력 실시간 연동됨');
      }

      // Expand / Collapse Circle Toggle
      if (hasChildren) {
        const toggleG = nodeG.append('g')
          .attr('transform', `translate(${nodeCardWidth - 10}, 0)`)
          .style('cursor', 'pointer')
          .on('click', (event) => {
            event.stopPropagation();
            toggleNodeCollapse(data.id);
          });

        toggleG.append('circle')
          .attr('r', 8)
          .attr('fill', '#16161C')
          .attr('stroke', colors.border)
          .attr('stroke-width', 1.2)
          .style('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))');

        toggleG.append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('fill', '#F5F3ED')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .text(isCollapsed ? '+' : '−');
      }
    });

    // Center and Fit to view initially
    const bounds = g.node()?.getBBox();
    if (bounds) {
      const fullWidth = bounds.width;
      const fullHeight = bounds.height;
      const midX = bounds.x + fullWidth / 2;
      const midY = bounds.y + fullHeight / 2;

      const scale = Math.min(
        1.1,
        Math.max(0.4, 0.85 / Math.max(fullWidth / width, fullHeight / height))
      );
      const translate = [width / 2 - scale * midX, height / 2 - scale * midY];

      svg.call(
        zoom.transform as any,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
    }

  }, [treeData, collapsedMap, searchQuery, selectedNode, viewMode, toggleNodeCollapse]);

  // Zoom control handlers
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 1.25);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 0.8);
  };

  const handleFitView = () => {
    if (!svgRef.current || !zoomBehaviorRef.current || !containerRef.current) return;
    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>('g.main-tree-group');
    const bounds = g.node()?.getBBox();
    if (!bounds) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const width = containerRect.width || 800;
    const height = containerRect.height || 600;

    const scale = Math.min(
      1.1,
      Math.max(0.4, 0.85 / Math.max(bounds.width / width, bounds.height / height))
    );
    const midX = bounds.x + bounds.width / 2;
    const midY = bounds.y + bounds.height / 2;
    const translate = [width / 2 - scale * midX, height / 2 - scale * midY];

    svg.transition().duration(350).call(
      zoomBehaviorRef.current.transform,
      d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
    );
  };

  // Export SVG Snapshot
  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const svgString = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.metadata?.projectName || 'siteplan'}_d3_tree.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Direct Jump to Editor Chapter/Section
  const handleJumpToEditor = (chapterId?: number, sectionKey?: string) => {
    if (!chapterId) return;
    onSelectChapter?.(chapterId);
    if (sectionKey) {
      onSelectSection?.(sectionKey);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0A0A0C] relative select-none overflow-hidden text-[#F5F3ED]">
      {/* Top D3 Toolbar */}
      <div className="bg-[#0E0E12] px-3.5 py-2 border-b border-[#23232A] flex flex-wrap items-center justify-between gap-2 shrink-0 z-10 shadow-2xs">
        {/* Left: View Mode Tabs & Live Sync indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#141418] p-0.5 rounded-[2px] border border-[#23232A] text-xs">
            <button
              onClick={() => setViewMode('all')}
              className={`px-2 py-1 rounded-[2px] font-medium text-xs transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'all'
                  ? 'bg-[#22222B] text-[#F5F3ED] font-semibold shadow-2xs'
                  : 'text-[#8E8B82] hover:text-[#F5F3ED]'
              }`}
              title="사이트 구조와 8개 챕터 기획 전체 연결망"
            >
              통합 기획 연계
            </button>
            <button
              onClick={() => setViewMode('pages')}
              className={`px-2 py-1 rounded-[2px] font-medium text-xs transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'pages'
                  ? 'bg-[#22222B] text-[#F5F3ED] font-semibold shadow-2xs'
                  : 'text-[#8E8B82] hover:text-[#F5F3ED]'
              }`}
              title="화면(Site Pages) 중심 기획 및 기능 바인딩"
            >
              화면-기획 매핑
            </button>
            <button
              onClick={() => setViewMode('traceability')}
              className={`px-2 py-1 rounded-[2px] font-medium text-xs transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'traceability'
                  ? 'bg-[#22222B] text-[#F5F3ED] font-semibold shadow-2xs'
                  : 'text-[#8E8B82] hover:text-[#F5F3ED]'
              }`}
              title="문제 ➔ 타깃 ➔ 기능 ➔ 화면 ➔ 데이터 추적 파이프라인"
            >
              요구사항 추적
            </button>
          </div>

          {/* Real-time Sync Pulse Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-[#141418] rounded-[2px] border border-[#23232A] text-[10px] font-mono text-[#8E8B82]">
            <span className={`w-1.5 h-1.5 rounded-full ${isLivePulse ? 'bg-[#C5A880] animate-ping' : 'bg-[#C5A880]'}`} />
            <span>실시간 연동</span>
          </div>
        </div>

        {/* Right: Search, Zoom Controls & Export */}
        <div className="flex items-center gap-1.5">
          {/* Search Input */}
          <div className="relative w-36 sm:w-44">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#706E66]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="노드 / 라우트 검색..."
              className="w-full pl-7 pr-2 py-1 text-xs font-mono bg-[#141418] border border-[#23232A] rounded-[2px] text-[#F5F3ED] placeholder-[#706E66] focus:outline-none focus:border-[#C5A880]"
            />
            {searchQuery && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-[#C5A880]">
                {matchedCount}개
              </span>
            )}
          </div>

          {/* Expand / Collapse All */}
          <div className="hidden md:flex items-center gap-1 border-l border-[#23232A] pl-1.5">
            <button
              onClick={expandAllNodes}
              className="px-2 py-1 rounded-[2px] bg-[#141418] border border-[#23232A] text-[11px] text-[#8E8B82] hover:text-[#F5F3ED] hover:bg-[#1A1A22] transition-colors cursor-pointer"
              title="모든 노드 펼치기"
            >
              모두 펼치기
            </button>
            <button
              onClick={collapseToCategories}
              className="px-2 py-1 rounded-[2px] bg-[#141418] border border-[#23232A] text-[11px] text-[#8E8B82] hover:text-[#F5F3ED] hover:bg-[#1A1A22] transition-colors cursor-pointer"
              title="하위 노드 접기"
            >
              접기
            </button>
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-0.5 border-l border-[#23232A] pl-1.5">
            <button
              onClick={handleZoomIn}
              className="p-1 min-h-[28px] min-w-[28px] flex items-center justify-center rounded-[2px] bg-[#141418] border border-[#23232A] hover:bg-[#1A1A22] text-[#8E8B82] hover:text-[#F5F3ED] transition-colors cursor-pointer"
              title="확대 (+)"
            >
              <ZoomIn size={13} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 min-h-[28px] min-w-[28px] flex items-center justify-center rounded-[2px] bg-[#141418] border border-[#23232A] hover:bg-[#1A1A22] text-[#8E8B82] hover:text-[#F5F3ED] transition-colors cursor-pointer"
              title="축소 (-)"
            >
              <ZoomOut size={13} />
            </button>
            <button
              onClick={handleFitView}
              className="p-1 min-h-[28px] min-w-[28px] flex items-center justify-center rounded-[2px] bg-[#141418] border border-[#23232A] hover:bg-[#1A1A22] text-[#8E8B82] hover:text-[#F5F3ED] transition-colors cursor-pointer"
              title="화면 맞춤"
            >
              <Maximize2 size={13} />
            </button>
            <button
              onClick={handleExportSvg}
              className="p-1 min-h-[28px] min-w-[28px] flex items-center justify-center rounded-[2px] bg-[#141418] border border-[#23232A] hover:bg-[#1A1A22] text-[#8E8B82] hover:text-[#F5F3ED] transition-colors cursor-pointer"
              title="SVG 다운로드"
            >
              <Download size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* D3 Canvas Mount */}
      <div 
        ref={containerRef} 
        className="flex-1 w-full h-full relative overflow-hidden bg-[#0A0A0C]"
        style={{
          backgroundImage: 'radial-gradient(#1E1E26 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <svg 
          ref={svgRef} 
          className="w-full h-full block cursor-grab active:cursor-grabbing outline-none" 
        />

        {/* Floating Mini Legend */}
        <div className="absolute bottom-3 left-3 pointer-events-none bg-[#0E0E12]/90 backdrop-blur-xs border border-[#23232A] rounded-[2px] p-2 text-[10px] font-mono text-[#8E8B82] flex flex-wrap gap-2 shadow-xs">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1C2E24] border border-[#2D3D32]" />
            <span>화면 및 사이트맵</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#382216] border border-[#4A3225]" />
            <span>핵심 기능 및 플로우</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#362810] border border-[#4A3B1C]" />
            <span>사용자 기획 입력</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E2344] border border-[#2D3358]" />
            <span>데이터 모델</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
            <span>입력 연동됨</span>
          </div>
        </div>
      </div>

      {/* Selected Node Details Drawer / Inspection Panel */}
      {selectedNode && (
        <div className="border-t border-[#23232A] bg-[#0E0E12] p-3.5 sm:p-4 text-xs shrink-0 flex flex-col gap-2.5 shadow-md animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">{getNodeIcon(selectedNode.type)}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-sans font-bold text-sm text-[#F5F3ED] truncate tracking-tight">
                    {selectedNode.name}
                  </h4>
                  {selectedNode.badge && (
                    <span className="text-[10px] font-mono bg-[#141418] border border-[#23232A] px-1.5 py-0.5 rounded-[2px] text-[#C5A880] font-semibold">
                      {selectedNode.badge}
                    </span>
                  )}
                  {selectedNode.route && (
                    <span className="text-[10px] font-mono text-[#C5A880] bg-[#C5A880]/15 px-1.5 py-0.5 rounded-[2px]">
                      경로: {selectedNode.route}
                    </span>
                  )}
                </div>
                {selectedNode.chapterTitle && (
                  <p className="text-[11px] text-[#8E8B82] mt-0.5 font-mono">
                    연동 출처: {selectedNode.chapterTitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {selectedNode.chapterId && (
                <button
                  onClick={() => handleJumpToEditor(selectedNode.chapterId, selectedNode.sectionKey)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#C5A880] text-[#0A0A0C] text-xs font-semibold hover:bg-[#D4B992] transition-colors cursor-pointer"
                  title="이 기획 내용을 편집할 수 있는 워크스페이스 섹션으로 이동"
                >
                  <FileText size={12} />
                  <span>기획 편집기로 이동</span>
                </button>
              )}
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-[2px] text-[#8E8B82] hover:text-[#F5F3ED] hover:bg-[#1A1A22] transition-colors"
                title="닫기"
              >
                ✕
              </button>
            </div>
          </div>

          {/* User Input or Source Text */}
          {selectedNode.sourceText && (
            <div className="bg-[#141418] p-2.5 rounded-[2px] border border-[#23232A] text-[11px] font-mono text-[#F5F3ED] leading-relaxed max-h-24 overflow-y-auto select-text">
              <span className="text-[#8E8B82] block mb-1 text-[10px]">기획 사양 내용:</span>
              {selectedNode.sourceText}
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] font-mono text-[#8E8B82]">
            <span>
              {selectedNode.isUserInput ? '✓ 사용자가 입력한 기획과 실시간 동기화 완료' : '표준 템플릿 기본 정의'}
            </span>
            {selectedNode.charCount !== undefined && (
              <span>작성 글자 수: {selectedNode.charCount}자</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default D3SitePlanTree;
