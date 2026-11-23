import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { 
  Network, Search, ZoomIn, ZoomOut, Maximize2, 
  ChevronRight, ChevronDown, Sparkles, FileText, 
  ExternalLink, Layers, ArrowRight, Download, Eye,
  CheckCircle2, Clock, Cpu, Users, Database, Shield, Palette
} from 'lucide-react';
import { SitePlan, FormInputEntity } from '../../types';
import { getSectionBusinessRules, hasMeaningfulRuleContent, serializeRulesToMarkdown } from '../../lib/businessRulesSerializer';
import { getChapters } from '../../lib/chapterData';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

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
  const { theme } = useTheme();
  const { language, pick } = useLanguage();
  const chapters = useMemo(() => getChapters(language), [language]);
  const chTitle = useCallback((id: number, fallback: string) => {
    const ch = chapters.find(c => c.id === id);
    return ch ? `Ch.${String(ch.id).padStart(2, '0')} ${ch.title}` : fallback;
  }, [chapters]);
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
      {
        id: 'p1',
        name: pick({ ko: '메인 관리 대시보드', en: 'Main Management Dashboard', ja: 'メイン管理ダッシュボード', id: 'Dasbor Manajemen Utama' }),
        slug: '/',
        script: pick({ ko: '실시간 리소스 현황 조회, 키워드 검색, 주요 상태 지표 요약', en: 'Live resource status, keyword search, and key metrics summary', ja: 'リアルタイムリソース状況照会・検索・主要指標サマリー', id: 'Status sumber daya real-time, pencarian kata kunci, ringkasan metrik' }),
        depth: 1,
      },
      {
        id: 'p2',
        name: pick({ ko: '신규 리소스 등록 모달', en: 'New Resource Modal', ja: '新規リソース登録モーダル', id: 'Modal Sumber Daya Baru' }),
        slug: '/new',
        script: pick({ ko: '빠른 신규 레코드 생성 폼 (제목, 분류, 담당자, 상태)', en: 'Quick record creation form (title, category, assignee, status)', ja: '新規レコード作成フォーム（タイトル・分類・担当・状態）', id: 'Formulir buat catatan cepat (judul, kategori, penanggung jawab, status)' }),
        depth: 2,
      },
      {
        id: 'p3',
        name: pick({ ko: '상세 정보 및 편집 드로어', en: 'Detail & Edit Drawer', ja: '詳細・編集ドロワー', id: 'Laci Detail & Edit' }),
        slug: '/detail',
        script: pick({ ko: '상세 속성 및 변경 이력 타임라인, 상태 전이 제어', en: 'Detailed properties, change history timeline, and state transition controls', ja: '詳細属性・変更履歴タイムライン・状態遷移制御', id: 'Properti detail, linimasa perubahan, & kontrol transisi status' }),
        depth: 2,
      },
    ];

    const pagesToRender = pageStructure.length > 0 ? pageStructure : defaultPages;

    pagesToRender.forEach((p, pIdx) => {
      const pageSlug = p.slug || (pIdx === 0 ? '/' : `/${p.name.toLowerCase().replace(/\s+/g, '-')}`);
      const pageScript = p.script || formInputs['6_pages_structure']?.userRawInput || pick({ ko: '주요 기능 렌더링 화면', en: 'Primary feature rendering screen', ja: '主要機能レンダリング画面', id: 'Layar rendering fitur utama' });
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
            name: `${pick({ ko: '매핑 기능', en: 'Mapped Feature', ja: 'マップ機能', id: 'Fitur Terpetakan' })}: ${mf.name}`,
            type: 'feature',
            badge: mf.priority || pick({ ko: '연동 기능', en: 'Linked', ja: '連携機能', id: 'Terhubung' }),
            badgeColor: 'terracotta',
            chapterId: 3,
            sectionKey: 'key_features',
            chapterTitle: chTitle(3, 'Ch.3'),
            sourceText: `${p.name} ➔ ${mf.name}`,
            isUserInput: true,
          });
        });
      }

      // Add user input script / requirements node if available
      if (p.script) {
        pageNodeChildren.push({
          id: `page_${p.id || pIdx}_script`,
          name: `${pick({ ko: '화면 스펙', en: 'Screen Spec', ja: '画面仕様', id: 'Spek Layar' })}: ${p.script.slice(0, 24)}...`,
          type: 'user_input',
          badge: pick({ ko: '기획 스펙', en: 'Spec', ja: '企画仕様', id: 'Spek' }),
          badgeColor: 'emerald',
          chapterId: 6,
          sectionKey: 'pages_structure',
          chapterTitle: chTitle(6, 'Ch.6'),
          sourceText: p.script,
          charCount: p.script.length,
          isUserInput: true,
        });
      }

      // Add connected data entity for main pages
      if (pIdx === 0 || pageSlug === '/') {
        pageNodeChildren.push({
          id: `page_${p.id || pIdx}_entity_proj`,
          name: `${pick({ ko: '연동 데이터', en: 'Linked Entity', ja: '連携データ', id: 'Entitas Terkait' })}: ProjectEntity`,
          type: 'data_entity',
          badge: pick({ ko: 'DB 스키마', en: 'DB Schema', ja: 'DB スキーマ', id: 'Skema DB' }),
          badgeColor: 'indigo',
          chapterId: 4,
          sectionKey: 'data_columns',
          chapterTitle: chTitle(4, 'Ch.4'),
          sourceText: 'ProjectEntity { id: UUID, name: string, plan: SitePlan, updatedAt: ISO8601 }',
          isUserInput: true,
        });
      } else if (pageSlug.includes('new') || pageSlug.includes('detail')) {
        pageNodeChildren.push({
          id: `page_${p.id || pIdx}_entity_target`,
          name: `${pick({ ko: '연동 데이터', en: 'Linked Entity', ja: '連携データ', id: 'Entitas Terkait' })}: TargetAppItem (CRUD)`,
          type: 'data_entity',
          badge: 'LocalStore',
          badgeColor: 'indigo',
          chapterId: 4,
          sectionKey: 'data_columns',
          chapterTitle: chTitle(4, 'Ch.4'),
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
        chapterTitle: chTitle(6, 'Ch.6'),
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
      { name: pick({ ko: '사용자 인증 및 세션 관리 (JWT & SSO)', en: 'User Auth & Session Management (JWT & SSO)', ja: 'ユーザー認証＆セッション管理 (JWT & SSO)', id: 'Autentikasi & Manajemen Sesi (JWT & SSO)' }), priority: 'P0', route: '/auth/login' },
      { name: pick({ ko: '실시간 메트릭 대시보드 (KPI Overview)', en: 'Live Metrics Dashboard (KPI Overview)', ja: 'リアルタイム指標ダッシュボード (KPI)', id: 'Dasbor Metrik Langsung (KPI)' }), priority: 'P0', route: '/' },
      { name: pick({ ko: '고성능 데이터 테이블 & 스마트 검색', en: 'High-Speed Data Table & Smart Search', ja: '高速データテーブル＆スマート検索', id: 'Tabel Data Cepat & Pencarian Pintar' }), priority: 'P1', route: '/detail' },
    ];
    const featuresSource = parsedFeaturesList.length > 0 ? parsedFeaturesList : defaultFeatureItems;

    featuresSource.forEach((f, idx) => {
      const targetRoute = f.targetScreen || (idx === 0 ? '/auth/login' : idx === 1 ? '/' : '/detail');
      featureChildren.push({
        id: `feat_${idx}`,
        name: f.name,
        type: 'feature',
        badge: f.priority || 'P0',
        badgeColor: 'terracotta',
        route: targetRoute,
        chapterId: 3,
        sectionKey: 'key_features',
        chapterTitle: chTitle(3, 'Ch.3'),
        sourceText: `${f.name} ➔ ${targetRoute}`,
        isUserInput: Boolean(formInputs['3_key_features']?.userRawInput),
        children: [
          {
            id: `feat_${idx}_link`,
            name: `${pick({ ko: '연결 화면', en: 'Bound Screen', ja: '連携画面', id: 'Layar Terikat' })} ➔ [${targetRoute}]`,
            type: 'page',
            badge: pick({ ko: '화면 바인딩', en: 'Screen Bind', ja: '画面バインド', id: 'Ikat Layar' }),
            badgeColor: 'emerald',
            route: targetRoute,
            chapterId: 6,
            sectionKey: 'pages_structure',
            chapterTitle: chTitle(6, 'Ch.6'),
            sourceText: `${f.name} ➔ [${targetRoute}]`,
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
        chapterTitle: chTitle(3, 'Ch.3'),
        sourceText: st,
        charCount: st.length,
        isUserInput: true,
      }));

      featureChildren.push({
        id: 'feat_happy_path_group',
        name: pick({ ko: '엔드투엔드 유저 플로우 (Happy Path)', en: 'End-to-End User Flow (Happy Path)', ja: 'E2E ユーザーフロー (Happy Path)', id: 'Alur Pengguna E2E (Happy Path)' }),
        type: 'flow_step',
        badge: `${steps.length} ${pick({ ko: '단계', en: 'steps', ja: '段階', id: 'langkah' })}`,
        badgeColor: 'terracotta',
        chapterId: 3,
        sectionKey: 'happy_path',
        chapterTitle: chTitle(3, 'Ch.3'),
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
        name: targetPersonaRaw ? `${pick({ ko: '타깃', en: 'Target', ja: '対象', id: 'Target' })}: ${targetPersonaRaw.split('\n')[0].slice(0, 25)}...` : pick({ ko: '타깃 페르소나 (B2B SaaS PM & 개발자)', en: 'Target Persona (PM & Engineers)', ja: 'ターゲットペルソナ (PM・開発者)', id: 'Persona Target (PM & Engineer)' }),
        type: 'user_input',
        badge: pick({ ko: '주요 사용자', en: 'Audience', ja: '主要ユーザー', id: 'Audiens' }),
        badgeColor: 'amber',
        chapterId: 2,
        sectionKey: 'target_persona',
        chapterTitle: chTitle(2, 'Ch.2'),
        sourceText: targetPersonaRaw || pick({ ko: '서비스 주 사용자 및 지원 환경 정의', en: 'Primary user segments and target devices', ja: '主要ユーザーと利用環境の定義', id: 'Segmen pengguna utama dan perangkat target' }),
        charCount: targetPersonaRaw.length,
        isUserInput: Boolean(targetPersonaRaw),
      },
      {
        id: 'persona_problem',
        name: userProblemsRaw ? `${pick({ ko: '해결 과제', en: 'Pain Point', ja: '課題', id: 'Masalah' })}: ${userProblemsRaw.split('\n')[0].slice(0, 24)}...` : pick({ ko: '사용자 Pain Points & 결핍 해소', en: 'User Pain Points & Core Needs', ja: 'ユーザーペインポイント解消', id: 'Masalah Pengguna & Kebutuhan Inti' }),
        type: 'user_input',
        badge: 'Pain Point',
        badgeColor: 'amber',
        chapterId: 2,
        sectionKey: 'user_problems',
        chapterTitle: chTitle(2, 'Ch.2'),
        sourceText: userProblemsRaw || pick({ ko: '해결하고자 하는 사용자의 핵심 결핍 사항', en: 'Key user bottlenecks this product resolves', ja: '解決すべきユーザーの主要課題', id: 'Hambatan utama pengguna yang diselesaikan' }),
        charCount: userProblemsRaw.length,
        isUserInput: Boolean(userProblemsRaw),
      },
      {
        id: 'persona_goal',
        name: problemBackgroundRaw ? `${pick({ ko: '개발 배경', en: 'Goal', ja: '開発背景', id: 'Tujuan' })}: ${problemBackgroundRaw.split('\n')[0].slice(0, 24)}...` : pick({ ko: '개발 목표 및 기대 효과', en: 'Project Goals & Impact', ja: '開発目標と期待効果', id: 'Tujuan Proyek & Dampak' }),
        type: 'user_input',
        badge: pick({ ko: '기술 목표', en: 'Objective', ja: '技術目標', id: 'Objektif' }),
        badgeColor: 'amber',
        chapterId: 1,
        sectionKey: 'problem_background',
        chapterTitle: chTitle(1, 'Ch.1'),
        sourceText: problemBackgroundRaw || pick({ ko: '시스템 구축 배경 및 11종 사양서 사출 목표', en: 'System rationale and 11-spec extraction goals', ja: 'システム構築背景と11種仕様書出力目標', id: 'Latar belakang sistem & target ekspor 11 spek' }),
        charCount: problemBackgroundRaw.length,
        isUserInput: Boolean(problemBackgroundRaw),
      }
    ];

    // --- Branch 4: Data Models & Business Rules (Ch. 4) ---
    const dataColumnsRaw = formInputs['4_data_columns']?.userRawInput || '';
    const businessRulesRaw = formInputs['4_business_rules']?.userRawInput || '';
    const ch4Rules = getSectionBusinessRules(formInputs['4_business_rules']).filter(hasMeaningfulRuleContent);
    const ch4RulesSummary = ch4Rules.length > 0 ? serializeRulesToMarkdown(ch4Rules) : '';
    const combinedRulesText = [businessRulesRaw, ch4RulesSummary].filter(Boolean).join('\n\n');

    const dataChildren: SitePlanTreeNode[] = [
      {
        id: 'data_entity_project',
        name: 'ProjectEntity (SSOT)',
        type: 'data_entity',
        badge: 'UUID v4',
        badgeColor: 'indigo',
        chapterId: 4,
        sectionKey: 'data_columns',
        chapterTitle: chTitle(4, 'Ch.4'),
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
        chapterTitle: chTitle(4, 'Ch.4'),
        sourceText: dataColumnsRaw || 'TargetAppItem { id: string, title: string, status: PENDING | CONFIRMED, createdAt: ISO8601 }',
        charCount: dataColumnsRaw.length,
        isUserInput: Boolean(dataColumnsRaw),
      },
      {
        id: 'data_business_rules',
        name: businessRulesRaw
          ? `${pick({ ko: '유효성 규칙', en: 'Validation', ja: '検証ルール', id: 'Validasi' })}: ${businessRulesRaw.split('\n')[0].slice(0, 22)}...`
          : ch4Rules.length > 0
          ? pick({ ko: `도메인 규칙 ${ch4Rules.length}건 정의됨`, en: `${ch4Rules.length} Domain Rules Defined`, ja: `ドメイン規則 ${ch4Rules.length}件定義済`, id: `${ch4Rules.length} Aturan Domain Ditentukan` })
          : pick({ ko: '비즈니스 로직 & 300ms 디바운스', en: 'Business Logic & 300ms Debounce', ja: 'ビジネスロジック＆300ms デバウンス', id: 'Logika Bisnis & Debounce 300ms' }),
        type: 'user_input',
        badge: ch4Rules.length > 0 ? `${ch4Rules.length} ${pick({ ko: '건', en: 'rules', ja: '件', id: 'aturan' })}` : pick({ ko: '무결성 규칙', en: 'Integrity', ja: '整合性', id: 'Integritas' }),
        badgeColor: 'indigo',
        chapterId: 4,
        sectionKey: 'business_rules',
        chapterTitle: chTitle(4, 'Ch.4'),
        sourceText: combinedRulesText || pick({ ko: '모든 데이터 300ms 디바운스 및 브라우저 온디바이스 무손실 영속성', en: '300ms debounced writes with lossless browser IndexedDB persistence', ja: '全データの 300ms デバウンス＆端末内 IndexedDB 永続化', id: 'Penulisan debounce 300ms & persistensi IndexedDB lokal' }),
        charCount: combinedRulesText.length,
        isUserInput: Boolean(combinedRulesText),
      }
    ];

    // --- Branch 5: Architecture & Design System (Ch. 5 & Ch. 7) ---
    const brandMoodRaw = formInputs['5_brand_mood']?.userRawInput || '';
    const stackReqRaw = formInputs['7_stack_requirements']?.userRawInput || '';

    const techChildren: SitePlanTreeNode[] = [
      {
        id: 'tech_design_token',
        name: `${pick({ ko: '비주얼 테마', en: 'Visual Theme', ja: 'テーマ', id: 'Tema Visual' })}: ${brandMoodRaw ? brandMoodRaw.split('\n')[0].slice(0, 22) : 'Archival Paper & Sumuk Ink'}`,
        type: 'tech_token',
        badge: plan.design?.themeColor || '#23392D',
        badgeColor: 'slate',
        chapterId: 5,
        sectionKey: 'brand_mood',
        chapterTitle: chTitle(5, 'Ch.5'),
        sourceText: brandMoodRaw || pick({ ko: '모노크롬 테마 토큰, 1px 헤어라인 테두리, 제로 필 규약', en: 'Editorial theme tokens, 1px hairline borders, zero-pill discipline', ja: 'テーマトークン・1px ヘアライン境界線・ゼロピル規約', id: 'Token tema editorial, garis batas 1px, disiplin zero-pill' }),
        charCount: brandMoodRaw.length,
        isUserInput: Boolean(brandMoodRaw),
      },
      {
        id: 'tech_stack',
        name: `${pick({ ko: '기술 스택', en: 'Tech Stack', ja: '技術スタック', id: 'Tech Stack' })}: ${stackReqRaw ? stackReqRaw.split('\n')[0].slice(0, 24) : 'React 19 + TypeScript + Vite + Tailwind'}`,
        type: 'tech_token',
        badge: 'React 19',
        badgeColor: 'slate',
        chapterId: 7,
        sectionKey: 'stack_requirements',
        chapterTitle: chTitle(7, 'Ch.7'),
        sourceText: stackReqRaw || 'React 19 + TypeScript + Tailwind CSS + IndexedDB Local-First',
        charCount: stackReqRaw.length,
        isUserInput: Boolean(stackReqRaw),
      },
      {
        id: 'tech_export_bundle',
        name: pick({ ko: '산출물: 11종 기술 사양서 + prototype.html', en: 'Output: 11 Tech Specs + prototype.html', ja: '成果物: 11種技術仕様書 + prototype.html', id: 'Keluaran: 11 Spek Teknis + prototype.html' }),
        type: 'tech_token',
        badge: '11 Docs ZIP',
        badgeColor: 'emerald',
        chapterId: 8,
        sectionKey: 'export_summary',
        chapterTitle: chTitle(8, 'Ch.8'),
        sourceText: pick({ ko: 'docs/ 디렉터리 11개 마크다운 문서 및 단일 파일 독립 프로토타입 패키지', en: '11 Markdown documents in docs/ plus standalone prototype.html bundle', ja: 'docs/ フォルダ内の11種マークダウン＆独立プロトタイプバンドル', id: '11 dokumen Markdown di docs/ dan bundel prototipe mandiri' }),
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
        chapterTitle: chTitle(1, 'Ch.1'),
        sourceText: formInputs['1_project_name']?.userRawInput || rawProjectName,
        isUserInput: isProjectCustom,
        children: pageChildren,
      };
    }

    if (viewMode === 'traceability') {
      // Linear Traceability Pipeline Tree
      return {
        id: 'root_traceability',
        name: `${rawProjectName} (${pick({ ko: '요구사항 추적 매트릭스', en: 'Requirements Traceability Matrix', ja: '要件トレーサビリティマトリクス', id: 'Matriks Pelacakan Kebutuhan' })})`,
        type: 'root',
        badge: 'Traceability Flow',
        badgeColor: 'sumuk',
        chapterId: 1,
        sectionKey: 'project_name',
        sourceText: pick({ ko: '요구사항(문제) ➔ 페르소나 ➔ 핵심 기능 ➔ 화면 ➔ 데이터 모델 파이프라인', en: 'Problem ➔ Persona ➔ Core Features ➔ Screens ➔ Data Model Pipeline', ja: '課題 ➔ ペルソナ ➔ 主要機能 ➔ 画面 ➔ データモデル', id: 'Masalah ➔ Persona ➔ Fitur Inti ➔ Layar ➔ Model Data' }),
        children: [
          {
            id: 'trace_problems',
            name: pick({ ko: '1단계: 해결 과제 및 문제 정의 (Ch. 1 & 2)', en: 'Step 1: Problem & Persona Definition (Ch. 1 & 2)', ja: '第1段階: 課題・ペルソナ定義 (Ch. 1 & 2)', id: 'Tahap 1: Definisi Masalah & Persona (Bab 1 & 2)' }),
            type: 'category',
            badge: 'Problem',
            badgeColor: 'amber',
            children: personaChildren,
          },
          {
            id: 'trace_features',
            name: pick({ ko: '2단계: 핵심 기능 및 유저 플로우 (Ch. 3)', en: 'Step 2: Core Features & User Flows (Ch. 3)', ja: '第2段階: 主要機能・ユーザーフロー (Ch. 3)', id: 'Tahap 2: Fitur Inti & Alur Pengguna (Bab 3)' }),
            type: 'category',
            badge: 'Feature',
            badgeColor: 'terracotta',
            children: featureChildren,
          },
          {
            id: 'trace_pages',
            name: pick({ ko: '3단계: 화면 구조 및 라우팅 (Ch. 6)', en: 'Step 3: Screen Structure & Routing (Ch. 6)', ja: '第3段階: 画面構成・ルーティング (Ch. 6)', id: 'Tahap 3: Struktur Layar & Rute (Bab 6)' }),
            type: 'category',
            badge: 'Page Structure',
            badgeColor: 'emerald',
            children: pageChildren,
          },
          {
            id: 'trace_data',
            name: pick({ ko: '4단계: 데이터 모델 및 배포 산출물 (Ch. 4, 7, 8)', en: 'Step 4: Data Model & Release Artifacts (Ch. 4, 7, 8)', ja: '第4段階: データモデル＆出力成果物 (Ch. 4, 7, 8)', id: 'Tahap 4: Model Data & Artefak Rilis (Bab 4, 7, 8)' }),
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
      chapterTitle: chTitle(1, 'Ch.1'),
      sourceText: formInputs['1_project_name']?.userRawInput || rawProjectName,
      isUserInput: isProjectCustom,
      children: [
        {
          id: 'cat_pages',
          name: pick({ ko: '사이트맵 및 화면 구조 (Site Pages & IA)', en: 'Sitemap & Screen Structure (Site Pages & IA)', ja: 'サイトマップ・画面構成 (Site Pages & IA)', id: 'Peta Situs & Struktur Layar (IA)' }),
          type: 'category',
          badge: `${pagesToRender.length} ${pick({ ko: '화면', en: 'pages', ja: '画面', id: 'hal' })}`,
          badgeColor: 'emerald',
          chapterId: 6,
          sectionKey: 'pages_structure',
          chapterTitle: chTitle(6, 'Ch.6'),
          sourceText: formInputs['6_pages_structure']?.userRawInput || pick({ ko: '전체 화면 목록 및 라우팅 경로', en: 'Full screen directory and routing paths', ja: '全画面一覧およびルーティング経路', id: 'Daftar lengkap layar dan rute navigasi' }),
          children: pageChildren,
        },
        {
          id: 'cat_features',
          name: pick({ ko: '핵심 기능 및 유저 플로우 (Features & Flow)', en: 'Core Features & User Flows (Features & Flow)', ja: '主要機能＆ユーザーフロー (Features & Flow)', id: 'Fitur Inti & Alur Pengguna' }),
          type: 'category',
          badge: `${featuresSource.length} ${pick({ ko: '기능', en: 'feats', ja: '機能', id: 'fitur' })}`,
          badgeColor: 'terracotta',
          chapterId: 3,
          sectionKey: 'key_features',
          chapterTitle: chTitle(3, 'Ch.3'),
          sourceText: formInputs['3_key_features']?.userRawInput || pick({ ko: '필수 기능 요구사항 및 엔드투엔드 동선', en: 'Essential feature specs and end-to-end journeys', ja: '必須機能要件およびE2E導線', id: 'Kebutuhan fitur inti dan alur end-to-end' }),
          children: featureChildren,
        },
        {
          id: 'cat_persona',
          name: pick({ ko: '타깃 페르소나 및 요구사항 (Persona & Needs)', en: 'Target Persona & Needs', ja: 'ターゲットペルソナ＆要望', id: 'Persona Target & Kebutuhan' }),
          type: 'category',
          badge: pick({ ko: '목표 & 결핍', en: 'Goals & Needs', ja: '目標＆課題', id: 'Tujuan & Masalah' }),
          badgeColor: 'amber',
          chapterId: 2,
          sectionKey: 'target_persona',
          chapterTitle: chTitle(2, 'Ch.2'),
          sourceText: formInputs['2_target_persona']?.userRawInput || pick({ ko: '사용자 그룹 및 디바이스 환경 명세', en: 'Target user cohorts and device environments', ja: '対象ユーザー群および利用端末仕様', id: 'Kelompok pengguna & lingkungan perangkat' }),
          children: personaChildren,
        },
        {
          id: 'cat_data',
          name: pick({ ko: '데이터 모델 및 비즈니스 규칙 (Data & Rules)', en: 'Data Model & Business Rules', ja: 'データモデル＆ビジネス規則', id: 'Model Data & Aturan Bisnis' }),
          type: 'category',
          badge: pick({ ko: 'DB 스키마', en: 'DB Schema', ja: 'DB スキーマ', id: 'Skema DB' }),
          badgeColor: 'indigo',
          chapterId: 4,
          sectionKey: 'data_columns',
          chapterTitle: chTitle(4, 'Ch.4'),
          sourceText: formInputs['4_data_columns']?.userRawInput || pick({ ko: '엔터티 구조 및 비즈니스 무결성 규칙', en: 'Entity schemas and business integrity rules', ja: 'エンティティ構造および整合性ルール', id: 'Struktur entitas dan aturan integritas bisnis' }),
          children: dataChildren,
        },
        {
          id: 'cat_tech',
          name: pick({ ko: '디자인 시스템 및 기술 스택 (Tokens & Tech)', en: 'Design System & Tech Stack', ja: 'デザインシステム＆技術スタック', id: 'Sistem Desain & Tech Stack' }),
          type: 'category',
          badge: pick({ ko: '아키텍처', en: 'Architecture', ja: 'アーキテクチャ', id: 'Arsitektur' }),
          badgeColor: 'slate',
          chapterId: 7,
          sectionKey: 'stack_requirements',
          chapterTitle: chTitle(7, 'Ch.7'),
          sourceText: formInputs['7_stack_requirements']?.userRawInput || 'React 19 + TypeScript + Tailwind CSS',
          children: techChildren,
        }
      ]
    };
  }, [plan, formInputs, viewMode, language, chTitle]);

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

  // Color mapping helper (5-Theme Reactive Editorial Palette)
  const getNodeColor = useCallback((type: SitePlanNodeType, badgeColor?: string) => {
    const t = theme.tokens;
    switch (badgeColor || type) {
      case 'sumuk':
      case 'root':
        return { bg: t.stage, border: t.inkStrong, text: t.inkStrong, badgeBg: t.activeBg, badgeText: t.activeText };
      case 'emerald':
      case 'page':
      case 'subpage':
        return { bg: t.elevated, border: t.success, text: t.inkPrimary, badgeBg: t.successBg, badgeText: t.success };
      case 'terracotta':
      case 'feature':
      case 'flow_step':
        return { bg: t.elevated, border: t.seal, text: t.inkPrimary, badgeBg: t.dangerBg, badgeText: t.seal };
      case 'amber':
        return { bg: t.elevated, border: t.warning, text: t.inkPrimary, badgeBg: t.warningBg, badgeText: t.warning };
      case 'indigo':
      case 'data_entity':
        return { bg: t.elevated, border: t.inkStrong, text: t.inkPrimary, badgeBg: t.subtle, badgeText: t.inkStrong };
      case 'slate':
      case 'tech_token':
        return { bg: t.stage, border: t.borderStrong, text: t.inkPrimary, badgeBg: t.elevated, badgeText: t.inkSecondary };
      default:
        return { bg: t.elevated, border: t.borderHairline, text: t.inkPrimary, badgeBg: t.stage, badgeText: t.inkSecondary };
    }
  }, [theme]);

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
        return isMatched ? theme.tokens.seal : theme.tokens.d3Link;
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
      .attr('opacity', 0.9);

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

    // Node Cards via SVG elements
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
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('fill', colors.bg)
        .attr('stroke', isSelected ? theme.tokens.seal : isMatched ? theme.tokens.seal : colors.border)
        .attr('stroke-width', isSelected ? 2 : isMatched ? 1.8 : 1)
        .style('filter', isSelected ? 'drop-shadow(0 6px 16px rgba(0,0,0,0.16))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.06))')
        .on('mouseenter', function() {
          d3.select(this).attr('stroke', theme.tokens.inkStrong).attr('stroke-width', 1.8);
        })
        .on('mouseleave', function() {
          if (!isSelected) {
            d3.select(this).attr('stroke', isMatched ? theme.tokens.seal : colors.border).attr('stroke-width', isMatched ? 1.8 : 1);
          }
        });

      // Left Accent Color Bar
      nodeG.append('rect')
        .attr('x', -10)
        .attr('y', -nodeCardHeight / 2)
        .attr('width', 3.5)
        .attr('height', nodeCardHeight)
        .attr('rx', 1)
        .attr('fill', isSelected ? theme.tokens.seal : colors.border);

      // Node Icon Emoji
      nodeG.append('text')
        .attr('x', 2)
        .attr('y', -4)
        .attr('font-size', '13px')
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'middle')
        .text(getNodeIcon(data.type));

      // Node Title
      nodeG.append('text')
        .attr('x', 24)
        .attr('y', -10)
        .attr('fill', colors.text)
        .attr('font-size', '11px')
        .attr('font-weight', data.type === 'root' || data.type === 'category' ? 'bold' : '600')
        .attr('font-family', "'DM Sans', 'SUIT Variable', -apple-system, BlinkMacSystemFont, sans-serif")
        .attr('dominant-baseline', 'middle')
        .text(() => {
          const maxLen = 17;
          return data.name.length > maxLen ? `${data.name.slice(0, maxLen)}…` : data.name;
        })
        .append('title')
        .text(data.name);

      // Node Subtitle / Route or Details snippet
      nodeG.append('text')
        .attr('x', 24)
        .attr('y', 8)
        .attr('fill', data.type === 'root' ? theme.tokens.seal : theme.tokens.inkSecondary)
        .attr('font-size', '9.5px')
        .attr('font-family', "'DM Sans', 'SUIT Variable', -apple-system, BlinkMacSystemFont, sans-serif")
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
          .attr('font-family', "'DM Sans', 'SUIT Variable', -apple-system, BlinkMacSystemFont, sans-serif")
          .attr('font-weight', '600')
          .text(badgeText);
      }

      // Live user input checkmark badge
      if (data.isUserInput) {
        nodeG.append('circle')
          .attr('cx', nodeCardWidth - 18)
          .attr('cy', nodeCardHeight / 2 - 12)
          .attr('r', 3)
          .attr('fill', theme.tokens.seal)
          .append('title')
          .text(pick({ ko: '사용자 기획 입력 실시간 연동됨', en: 'Synced with user spec input', ja: 'ユーザー企画入力とリアルタイム連携中', id: 'Tersinkron dengan input spek pengguna' }));
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
          .attr('fill', theme.tokens.elevated)
          .attr('stroke', colors.border)
          .attr('stroke-width', 1.2)
          .style('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.12))');

        toggleG.append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('fill', colors.text)
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

  }, [treeData, collapsedMap, searchQuery, selectedNode, viewMode, toggleNodeCollapse, theme, getNodeColor]);

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
    <div className="w-full h-full flex flex-col bg-[var(--theme-canvas)] relative select-none overflow-hidden text-[var(--theme-ink-primary)]">
      {/* Top D3 Toolbar */}
      <div className="bg-[var(--theme-canvas)] px-4 py-2.5 border-b border-[var(--theme-border-hairline)] flex flex-wrap items-center justify-between gap-2 shrink-0 z-10">
        {/* Left: View Mode Tabs & Live Sync indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[var(--theme-stage)] p-0.5 rounded-[2px] border border-[var(--theme-border-hairline)] text-xs">
            <button
              onClick={() => setViewMode('all')}
              className={`px-2.5 py-1 rounded-[2px] font-medium text-xs transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'all'
                  ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] font-semibold'
                  : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)]'
              }`}
              title={pick({ ko: '사이트 구조와 8개 챕터 기획 전체 연결망', en: 'Full map across sitemap & 8 chapters', ja: 'サイト構造と全8章の連携マップ', id: 'Peta lengkap struktur situs & 8 bab' })}
            >
              {pick({ ko: '통합 기획 연계', en: 'Full Traceability', ja: '統合企画連携', id: 'Keterkaitan Penuh' })}
            </button>
            <button
              onClick={() => setViewMode('pages')}
              className={`px-2.5 py-1 rounded-[2px] font-medium text-xs transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'pages'
                  ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] font-semibold'
                  : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)]'
              }`}
              title={pick({ ko: '화면(Site Pages) 중심 기획 및 기능 바인딩', en: 'Page-centric specs & feature bindings', ja: '画面(Site Pages)中心の仕様と機能バインド', id: 'Spesifikasi berpusat halaman & ikatan fitur' })}
            >
              {pick({ ko: '화면-기획 매핑', en: 'Screen Mapping', ja: '画面-企画マップ', id: 'Pemetaan Layar' })}
            </button>
            <button
              onClick={() => setViewMode('traceability')}
              className={`px-2.5 py-1 rounded-[2px] font-medium text-xs transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'traceability'
                  ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] font-semibold'
                  : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)]'
              }`}
              title={pick({ ko: '문제 ➔ 타깃 ➔ 기능 ➔ 화면 ➔ 데이터 추적 파이프라인', en: 'Problem ➔ Target ➔ Feature ➔ Screen ➔ Data pipeline', ja: '課題 ➔ 対象 ➔ 機能 ➔ 画面 ➔ データ追跡パイプライン', id: 'Alur pelacakan Masalah ➔ Target ➔ Fitur ➔ Layar ➔ Data' })}
            >
              {pick({ ko: '요구사항 추적', en: 'Requirements Flow', ja: '要件トレーサビリティ', id: 'Alur Kebutuhan' })}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] rounded-[2px] text-[10px] font-sans text-[var(--theme-ink-strong)]">
            <span className={`w-1.5 h-1.5 rounded-full bg-[var(--theme-seal)] ${isLivePulse ? 'animate-ping' : ''}`} />
            <span className="font-medium">{pick({ ko: '실시간 연동', en: 'Live Sync', ja: 'リアルタイム連携', id: 'Sinkron Langsung' })}</span>
          </div>
        </div>

        {/* Right: Search, Zoom Controls & Export */}
        <div className="flex items-center gap-1.5">
          {/* Search Input */}
          <div className="relative w-36 sm:w-44">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--theme-ink-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={pick({ ko: '노드 / 라우트 검색...', en: 'Search nodes / routes...', ja: 'ノード / ルート検索...', id: 'Cari node / rute...' })}
              className="w-full pl-7 pr-2 py-1 text-xs font-sans bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] rounded-[2px] text-[var(--theme-ink-primary)] placeholder-[var(--theme-ink-muted)] focus:outline-none focus:border-[var(--theme-ink-strong)] focus:bg-[var(--theme-canvas)]"
            />
            {searchQuery && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-sans tabular-nums text-[var(--theme-seal)] font-semibold">
                {matchedCount}
              </span>
            )}
          </div>

          {/* Expand / Collapse All */}
          <div className="hidden md:flex items-center gap-1 border-l border-[var(--theme-border-hairline)] pl-1.5">
            <button
              onClick={expandAllNodes}
              className="px-2.5 py-1 rounded-[2px] bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] text-[11px] text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] hover:bg-[var(--theme-subtle)] transition-colors cursor-pointer"
              title={pick({ ko: '모든 노드 펼치기', en: 'Expand all nodes', ja: 'すべてのノードを展開', id: 'Bentangkan semua node' })}
            >
              {pick({ ko: '모두 펼치기', en: 'Expand All', ja: 'すべて展開', id: 'Bentangkan Semua' })}
            </button>
            <button
              onClick={collapseToCategories}
              className="px-2.5 py-1 rounded-[2px] bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] text-[11px] text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] hover:bg-[var(--theme-subtle)] transition-colors cursor-pointer"
              title={pick({ ko: '하위 노드 접기', en: 'Collapse child nodes', ja: '子ノードを折りたたむ', id: 'Ciutkan node anak' })}
            >
              {pick({ ko: '접기', en: 'Collapse', ja: '折りたたむ', id: 'Ciutkan' })}
            </button>
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 border-l border-[var(--theme-border-hairline)] pl-1.5">
            <button
              onClick={handleZoomIn}
              className="p-1.5 min-h-[28px] min-w-[28px] flex items-center justify-center rounded-[2px] bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] hover:bg-[var(--theme-subtle)] text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] transition-colors cursor-pointer"
              title={pick({ ko: '확대 (+)', en: 'Zoom In (+)', ja: '拡大 (+)', id: 'Perbesar (+)' })}
            >
              <ZoomIn size={13} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 min-h-[28px] min-w-[28px] flex items-center justify-center rounded-[2px] bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] hover:bg-[var(--theme-subtle)] text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] transition-colors cursor-pointer"
              title={pick({ ko: '축소 (-)', en: 'Zoom Out (-)', ja: '縮小 (-)', id: 'Perkecil (-)' })}
            >
              <ZoomOut size={13} />
            </button>
            <button
              onClick={handleFitView}
              className="p-1.5 min-h-[28px] min-w-[28px] flex items-center justify-center rounded-[2px] bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] hover:bg-[var(--theme-subtle)] text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] transition-colors cursor-pointer"
              title={pick({ ko: '화면 맞춤', en: 'Fit to View', ja: '画面に合わせる', id: 'Paskan ke Layar' })}
            >
              <Maximize2 size={13} />
            </button>
            <button
              onClick={handleExportSvg}
              className="p-1.5 min-h-[28px] min-w-[28px] flex items-center justify-center rounded-[2px] bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] hover:bg-[var(--theme-subtle)] text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] transition-colors cursor-pointer"
              title={pick({ ko: 'SVG 다운로드', en: 'Download SVG', ja: 'SVG ダウンロード', id: 'Unduh SVG' })}
            >
              <Download size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* D3 Canvas Mount */}
      <div 
        ref={containerRef} 
        className="flex-1 w-full h-full relative overflow-hidden bg-[var(--theme-canvas)]"
        style={{
          backgroundImage: `radial-gradient(${theme.isDark ? 'rgba(242, 239, 233, 0.08)' : 'rgba(17, 24, 39, 0.08)'} 1.2px, transparent 1.2px)`,
          backgroundSize: '24px 24px',
        }}
      >
        <svg 
          ref={svgRef} 
          className="w-full h-full block cursor-grab active:cursor-grabbing outline-none" 
        />

        {/* Floating Mini Legend */}
        <div className="absolute bottom-3 left-3 pointer-events-none bg-[var(--theme-elevated)]/95 backdrop-blur-xs border border-[var(--theme-border-hairline)] rounded-[2px] px-3 py-2 text-[10px] font-sans text-[var(--theme-ink-secondary)] flex flex-wrap gap-3 shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--theme-success-bg)] border border-[var(--theme-success)]" />
            <span>{pick({ ko: '화면 및 사이트맵', en: 'Screens & Sitemap', ja: '画面＆サイトマップ', id: 'Layar & Peta Situs' })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--theme-danger-bg)] border border-[var(--theme-seal)]" />
            <span>{pick({ ko: '핵심 기능 및 플로우', en: 'Core Features & Flows', ja: '主要機能＆フロー', id: 'Fitur Inti & Alur' })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--theme-warning-bg)] border border-[var(--theme-warning)]" />
            <span>{pick({ ko: '사용자 기획 입력', en: 'User Spec Input', ja: 'ユーザー企画入力', id: 'Input Spek Pengguna' })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--theme-subtle)] border border-[var(--theme-ink-strong)]" />
            <span>{pick({ ko: '데이터 모델', en: 'Data Models', ja: 'データモデル', id: 'Model Data' })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-seal)]" />
            <span className="text-[var(--theme-seal)] font-semibold">{pick({ ko: '입력 연동됨', en: 'Input Linked', ja: '入力連携済', id: 'Input Terkait' })}</span>
          </div>
        </div>
      </div>

      {/* Selected Node Details Drawer / Inspection Panel */}
      {selectedNode && (
        <div className="border-t border-[var(--theme-border-hairline)] bg-[var(--theme-stage)] p-4 text-xs shrink-0 flex flex-col gap-2.5 text-[var(--theme-ink-primary)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">{getNodeIcon(selectedNode.type)}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-sans font-semibold text-sm text-[var(--theme-ink-strong)] truncate tracking-tight">
                    {selectedNode.name}
                  </h4>
                  {selectedNode.badge && (
                    <span className="text-[10px] font-sans bg-[var(--theme-subtle)] px-2 py-0.5 rounded-[2px] text-[var(--theme-ink-strong)] font-semibold">
                      {selectedNode.badge}
                    </span>
                  )}
                  {selectedNode.route && (
                    <span className="text-[10px] font-sans text-[var(--theme-ink-primary)] bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] px-2 py-0.5 rounded-[2px]">
                      {pick({ ko: '경로', en: 'Route', ja: 'ルート', id: 'Rute' })}: {selectedNode.route}
                    </span>
                  )}
                </div>
                {selectedNode.chapterTitle && (
                  <p className="text-[11px] text-[var(--theme-ink-secondary)] mt-0.5 font-sans">
                    {pick({ ko: '연동 출처', en: 'Source', ja: '連携元', id: 'Sumber' })}: {selectedNode.chapterTitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {selectedNode.chapterId && (
                <button
                  onClick={() => handleJumpToEditor(selectedNode.chapterId, selectedNode.sectionKey)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[var(--theme-btn-bg)] text-[var(--theme-btn-text)] text-xs font-semibold hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] transition-colors cursor-pointer"
                  title={pick({ ko: '이 기획 내용을 편집할 수 있는 워크스페이스 섹션으로 이동', en: 'Jump to the workspace section to edit this spec', ja: 'この仕様を編集するワークスペースセクションへ移動', id: 'Buka bagian ruang kerja untuk mengedit spek ini' })}
                >
                  <FileText size={12} />
                  <span>{pick({ ko: '기획 편집기로 이동', en: 'Open in Editor', ja: 'エディタで開く', id: 'Buka di Editor' })}</span>
                </button>
              )}
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1.5 rounded-[2px] text-[var(--theme-ink-muted)] hover:text-[var(--theme-ink-strong)] hover:bg-[var(--theme-canvas)] transition-colors cursor-pointer"
                title={pick({ ko: '닫기', en: 'Close', ja: '閉じる', id: 'Tutup' })}
              >
                ✕
              </button>
            </div>
          </div>

          {/* User Input or Source Text */}
          {selectedNode.sourceText && (
            <div className="bg-[var(--theme-canvas)] p-3 rounded-[2px] border border-[var(--theme-border-hairline)] text-[11px] font-sans text-[var(--theme-ink-body)] leading-relaxed max-h-24 overflow-y-auto select-text">
              <span className="text-[var(--theme-ink-muted)] block mb-1 text-[10px]">
                {pick({ ko: '기획 사양 내용', en: 'Specification Details', ja: '企画仕様内容', id: 'Detail Spesifikasi' })}:
              </span>
              {selectedNode.sourceText}
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] font-sans text-[var(--theme-ink-secondary)]">
            <span>
              {selectedNode.isUserInput
                ? pick({ ko: '✓ 사용자가 입력한 기획과 실시간 동기화 완료', en: '✓ Live-synced with user specification input', ja: '✓ ユーザー入力仕様とリアルタイム同期済', id: '✓ Tersinkron langsung dengan input pengguna' })
                : pick({ ko: '표준 템플릿 기본 정의', en: 'Standard template default definition', ja: '標準テンプレート基本定義', id: 'Definisi default templat standar' })}
            </span>
            {selectedNode.charCount !== undefined && (
              <span>{pick({ ko: `작성 글자 수: ${selectedNode.charCount}자`, en: `Characters: ${selectedNode.charCount}`, ja: `文字数: ${selectedNode.charCount}文字`, id: `Jumlah karakter: ${selectedNode.charCount}` })}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default D3SitePlanTree;
