import { SitePlan } from '../types';

export interface StandardPrdTemplate {
  id: string;
  category: 'SAAS' | 'ECOMMERCE' | 'ENTERPRISE' | 'MEDIA';
  badge: string;
  name: string;
  subtitle: string;
  description: string;
  targetUser: string;
  keyFeatures: string[];
  screens: { name: string; route: string; purpose: string }[];
  themeColor: string;
  accentColor: string;
  platform: 'WEB' | 'APP';
  sampleData: Array<{
    title: string;
    contact?: string;
    status: '대기' | '진행중' | '완료' | '보류';
    memo: string;
    amount?: string;
    date?: string;
  }>;
  plan: Partial<SitePlan>;
  formInputs: Record<string, string>;
}

export const STANDARD_PRD_TEMPLATES: StandardPrdTemplate[] = [
  {
    id: 'saas-web-platform',
    category: 'SAAS',
    badge: '모던 웹 SaaS',
    name: '모던 클라우드 SaaS 웹 플랫폼',
    subtitle: '실시간 협업 워크스페이스 및 프로젝트 대시보드',
    description: '토큰 기반 인증, 실시간 메트릭 모니터링, 역할 기반 권한 제어 및 가상화 데이터 그리드를 갖춘 엔터프라이즈급 SaaS 웹 애플리케이션',
    targetUser: '엔지니어링 팀, 프로덕트 매니저, 데이터 분석가',
    keyFeatures: [
      'SSO 및 JWT 기반 사용자 인증 & 권한 제어',
      '실시간 KPI 모니터링 및 인터랙티브 메트릭 차트',
      '고성능 데이터 테이블 및 다중 조건 필터링 검색',
      'REST/GraphQL API 연동 및 웹소켓 실시간 이벤트 수신'
    ],
    screens: [
      { name: '워크스페이스 대시보드', route: '/dashboard', purpose: '실시간 핵심 KPI 지표, 최근 활동 로그 및 시스템 상태 모니터링' },
      { name: '프로젝트 및 리소스 목록', route: '/projects', purpose: '대용량 데이터 그리드, 다중 정렬 및 필터링 검색 지원' },
      { name: '팀 및 멤버 권한 관리', route: '/settings/team', purpose: '역할 기반 접근 권한 설정 및 초대 관리' },
      { name: 'API 키 및 웹훅 설정', route: '/settings/integrations', purpose: '외부 서비스 연동 키 발급 및 보안 웹훅 이벤트 관리' }
    ],
    themeColor: '#090A0D',
    accentColor: '#E4DFD7',
    platform: 'WEB',
    sampleData: [
      { title: 'API Gateway v2.4 릴리스 배포', contact: '인프라팀 리드', status: '완료', memo: '무중단 블루/그린 배포 성공 완료', date: '2026-10-12' },
      { title: '실시간 대시보드 웹소켓 최적화', contact: '프론트엔드 파트', status: '진행중', memo: '지연 시간 12ms 이내로 단축 테스트 중', date: '2026-10-13' },
      { title: '엔터프라이즈 SSO 보안 감사', contact: '보안팀', status: '대기', memo: 'SAML 2.0 연동 취약점 점검 예정', date: '2026-10-14' },
      { title: '데이터베이스 쿼리 인덱싱 튜닝', contact: 'DBA', status: '완료', memo: 'P99 레이턴시 45% 개선', date: '2026-10-11' }
    ],
    plan: {
      metadata: {
        projectName: '모던 클라우드 SaaS 웹 플랫폼',
        title: '엔터프라이즈 SaaS 웹 아키텍처 기획서',
        slogan: '고성능 실시간 협업과 직관적인 데이터 통제',
        subtitle: '웹 표준 및 확장성을 극대화한 클라우드 SaaS',
        description: '제로 레이턴시 인터랙션과 엄격한 보안 규약을 준수하는 현대적 웹 SaaS 플랫폼 기획 명세서',
        platform: 'WEB',
        projectMode: 'enterprise',
        projectOverview: {
          targetUrl: 'https://saas-platform.web.app',
          purpose: '조직 생산성 향상 및 실시간 데이터 기반 의사결정 지원',
          target: '엔터프라이즈 프로덕트 팀 및 실무 엔지니어',
          kpi: '첫 화면 렌더링 0.8초 이내, 실시간 이벤트 지연 50ms 미만',
          reference: 'Linear, Vercel Dashboard, Datadog',
          benchmarkUrl: 'https://linear.app',
          benchmarkAnalysis: '미니멀한 모노크롬 UI와 즉각적인 키보드 단축키 인터랙션 벤치마크',
          toneAndManner: '정제된 웜 옵시디언(#090A0D)과 눈부심 없는 웜 티타늄(#E4DFD7) 미니멀리즘',
          screenList: '워크스페이스 대시보드, 프로젝트 목록, 팀 권한 관리, API 설정',
          features: '역할 기반 인증, 대용량 가상화 그리드, 실시간 메트릭 스트리밍',
          wireframe: '좌측 60px 슬림 네비게이션, 상단 글로벌 검색 바, 중앙 데이터 그리드',
          context: '데스크톱 및 고해상도 모니터 환경에서 방대한 데이터를 쾌속 조작',
          techStack: 'React, TypeScript, Tailwind CSS, Vite, Cloud Run',
          schedule: '1주차: 글로벌 레이아웃 및 인증, 2주차: 데이터 그리드 및 실시간 연동'
        },
        footerInfo: {
          companyName: '클라우드 웹 아키텍처 테크놀로지',
          address: '서울시 강남구 테헤란로 501',
          phone: '02-800-1000',
          email: 'engineering@saas-platform.web',
          representative: '기술총괄 이아키텍트'
        }
      },
      design: {
        themeColor: '#090A0D',
        accentColor: '#E4DFD7',
        bodyTextColor: '#F1F1F4',
        linkColor: '#E4DFD7',
        buttonColor: '#E4DFD7',
        layout: 'standard',
        sectionTitles: ['워크스페이스 현황', '프로젝트 관리', '팀 설정', 'API 통합'],
        sectionColumns: [4, 2, 2, 3],
        sectionContentTypes: [['text', 'text'], ['text', 'text']],
      },
      navigation: {
        pageStructure: [
          { name: '워크스페이스 대시보드', route: '/dashboard', purpose: '실시간 핵심 KPI 및 최근 시스템 현황' },
          { name: '프로젝트 관리', route: '/projects', purpose: '데이터 그리드 및 필터링 검색' },
          { name: '팀 권한 설정', route: '/settings/team', purpose: 'RBAC 역할 할당 및 멤버 관리' },
          { name: 'API 통합 명세', route: '/settings/integrations', purpose: '웹훅 및 토큰 발급' }
        ],
        menus: ['대시보드', '프로젝트', '팀설정', 'API통합']
      }
    },
    formInputs: {
      'project_name': '모던 클라우드 SaaS 웹 플랫폼',
      'target_user': '복잡한 데이터를 빠르고 정확하게 제어해야 하는 기업 실무자',
      'pain_point': '느린 데이터 로딩과 비직관적인 UI로 인한 업무 생산성 저하',
      'core_value': '0ms 수준의 즉각적인 응답성과 군더더기 없는 미니멀 워크스페이스',
      'feature_list': 'JWT 인증, 실시간 지표 갱신, 가상화 데이터 테이블, 키보드 단축키',
      'data_schema': 'id, title, status, ownerId, priority, metadata, createdAt',
      'ui_layout': '좌측 슬림 사이드바, 상단 커맨드 팔레트, 메인 데이터 그리드'
    }
  },
  {
    id: 'ecommerce-web',
    category: 'ECOMMERCE',
    badge: '이커머스 웹',
    name: '반응형 프리미엄 이커머스 웹',
    subtitle: '상품 카탈로그, 장바구니 및 원클릭 결제 파이프라인',
    description: '모바일 및 데스크톱 반응형 뷰포트에 최적화된 상품 탐색, 장바구니 상태 관리 및 주문 결제 파이프라인 웹 서비스',
    targetUser: '온라인 구매 고객 및 스토어 운영 관리자',
    keyFeatures: [
      '패싯 검색 및 카테고리 필터링 엔진',
      '클라이언트 캐시 기반 반응형 장바구니',
      '원클릭 간편 결제 및 주문 생성 파이프라인',
      '실시간 주문 상태 추적 및 배송 이력 조회'
    ],
    screens: [
      { name: '스토어 메인', route: '/', purpose: '추천 컬렉션 큐레이션 및 프로모션 쇼케이스' },
      { name: '상품 카탈로그', route: '/products', purpose: '다중 속성 필터링 및 고화질 갤러리 그리드' },
      { name: '장바구니 & 체크아웃', route: '/checkout', purpose: '주문서 작성, 쿠폰 적용 및 결제 게이트웨이 연동' },
      { name: '주문 내역 상세', route: '/orders/:id', purpose: '주문 승인 영수증 및 실시간 배송 단계 확인' }
    ],
    themeColor: '#090A0D',
    accentColor: '#E4DFD7',
    platform: 'WEB',
    sampleData: [
      { title: '프리미엄 미니멀 레더 케이스', contact: '스토어 지원팀', status: '완료', memo: '주문번호 #ORD-8821 결제 승인 완료', amount: '128,000원', date: '2026-10-13' },
      { title: '모노크롬 알루미늄 데스크 스탠드', contact: '물류 센터', status: '진행중', memo: '패키징 완료 후 택배사 인계 중', amount: '240,000원', date: '2026-10-13' },
      { title: '무선 충전 패드 매트 블랙', contact: '결제 시스템', status: '대기', memo: '가상계좌 입금 대기 상태', amount: '89,000원', date: '2026-10-13' }
    ],
    plan: {
      metadata: {
        projectName: '반응형 프리미엄 이커머스 웹',
        title: '이커머스 웹 서비스 아키텍처 기획서',
        slogan: '군더더기 없는 탐색과 매끄러운 결제 경험',
        subtitle: '웹 바이탈 지표를 극대화한 현대적 커머스 웹',
        description: '고속 로딩 이미지 최적화와 결제 이탈률 최소화를 목표로 하는 프리미엄 쇼핑 플랫폼 기획서',
        platform: 'WEB',
        projectMode: 'enterprise',
        projectOverview: {
          targetUrl: 'https://minimal-store.web.app',
          purpose: '고객 구매 전환율 극대화 및 모바일 웹 쇼핑 최적화',
          target: '모던 미니멀 라이프스타일 소비자 및 스토어 관리자',
          kpi: '장바구니 결제 전환율 18% 이상, LCP 지표 1.2초 이하',
          reference: 'Apple Store Online, SSENSE, COS Web',
          benchmarkUrl: 'https://apple.com/store',
          benchmarkAnalysis: '군더더기 없는 그리드와 압도적인 제품 포커스 레이아웃',
          toneAndManner: '웜 옵시디언 캔버스, 절제된 타이포그래피 및 티타늄 피니시',
          screenList: '스토어 메인, 카탈로그, 상품 상세, 체크아웃, 주문 내역',
          features: '카테고리 패싯 검색, 로컬 장바구니 보존, 결제 PG사 연동',
          wireframe: '헤더 고정 메뉴 바, 미니 장바구니 드로어, 3열 제품 그리드',
          context: '모바일 및 태블릿 터치 제스처에 최적화된 반응형 뷰포트',
          techStack: 'React, TypeScript, Tailwind CSS, Stripe/토스페이먼츠',
          schedule: '1주차: 카탈로그 및 장바구니, 2주차: 결제 연동 및 주문 관리'
        },
        footerInfo: {
          companyName: '미니멀 커머스 솔루션즈',
          address: '서울시 성수이로 88',
          phone: '02-777-2200',
          email: 'support@minimal-store.web',
          representative: '운영책임 정커머스'
        }
      },
      design: {
        themeColor: '#090A0D',
        accentColor: '#E4DFD7',
        bodyTextColor: '#F1F1F4',
        linkColor: '#E4DFD7',
        buttonColor: '#E4DFD7',
        layout: 'standard',
        sectionTitles: ['상품 카탈로그', '장바구니', '체크아웃', '주문관리'],
        sectionColumns: [3, 2, 2, 3],
        sectionContentTypes: [['text', 'text']],
      },
      navigation: {
        pageStructure: [
          { name: '스토어 메인', route: '/', purpose: '주요 컬렉션 쇼케이스' },
          { name: '카탈로그', route: '/products', purpose: '필터링 상품 목록' },
          { name: '체크아웃', route: '/checkout', purpose: '주문서 및 결제 단계' },
          { name: '주문 관리', route: '/orders', purpose: '배송 및 영수증 확인' }
        ],
        menus: ['스토어홈', '카탈로그', '체크아웃', '주문내역']
      }
    },
    formInputs: {
      'project_name': '반응형 프리미엄 이커머스 웹',
      'target_user': '모바일 웹으로 빠르게 상품을 탐색하고 결제하는 소비자',
      'pain_point': '복잡한 팝업과 느린 결제 단계로 인한 구매 이탈',
      'core_value': '0단계 불필요한 단계 삭제, 3터치 내 결제 완료',
      'feature_list': '다중 속성 필터, 미니 장바구니 드로어, 간편결제 연동',
      'data_schema': 'productId, name, price, stock, images, category, status',
      'ui_layout': '화면 전체 폭을 활용하는 반응형 그리드 및 하단 고정 액션바'
    }
  },
  {
    id: 'enterprise-portal',
    category: 'ENTERPRISE',
    badge: '기업용 포털',
    name: '기업용 통합 관리자 포털 & 어드민',
    subtitle: '조직 관리, 감사 로그, 데이터 통계 및 운영 콘솔',
    description: '조직 계정 통합 관리, 접근 통제 감사 로그, 데이터 파이프라인 모니터링 및 일괄 데이터 처리를 지원하는 기업용 어드민 포털',
    targetUser: '사내 시스템 관리자, 보안 책임자, 비즈니스 운영팀',
    keyFeatures: [
      '엔터프라이즈 SSO 및 세션 만료 제어',
      '사용자별 세분화된 CRUD 접근 제어',
      '모든 관리 작업에 대한 실시간 감사 로그',
      '대용량 데이터 일괄 수정 및 CSV/Excel 내보내기'
    ],
    screens: [
      { name: '어드민 콘솔 홈', route: '/admin', purpose: '전사 활성 사용자 지표, 보안 알림 및 시스템 헬스체크' },
      { name: '사용자 및 계정 관리', route: '/admin/users', purpose: '임직원 권한 부여, 2FA 강제 및 비활성화 제어' },
      { name: '보안 및 감사 로그', route: '/admin/audit', purpose: '접근 IP, 작업 내역, 변경 전후 데이터 비교 로그' },
      { name: '시스템 설정', route: '/admin/settings', purpose: '글로벌 정책, 백업 스케줄 및 인프라 파라미터 제어' }
    ],
    themeColor: '#090A0D',
    accentColor: '#E4DFD7',
    platform: 'WEB',
    sampleData: [
      { title: '어드민 2FA 필수 인증 정책 활성화', contact: '보안 운영팀', status: '완료', memo: '전사 1,200명 계정 100% 반영 완료', date: '2026-10-10' },
      { title: '데이터 보관 주기(3년) 규정 준수 감사', contact: '컴플라이언스팀', status: '진행중', memo: '자동 파기 정책 검증 스크립트 실행 중', date: '2026-10-12' },
      { title: '이상 트래픽 감지 알림 규칙 추가', contact: '인프라팀', status: '완료', memo: '분당 1,000회 초과 시 관리자 SMS 발송', date: '2026-10-11' }
    ],
    plan: {
      metadata: {
        projectName: '기업용 통합 관리자 포털 & 어드민',
        title: '엔터프라이즈 관리자 포털 기획서',
        slogan: '철저한 보안 통제와 고효율 데이터 운영 콘솔',
        subtitle: '감사 추적 및 권한 분리를 충족하는 엔터프라이즈 웹',
        description: '사내 정보 유출 방지 및 전사 시스템 통합 운영을 위한 고신뢰도 어드민 웹 시스템 기획서',
        platform: 'WEB',
        projectMode: 'enterprise',
        projectOverview: {
          targetUrl: 'https://admin-portal.corp.internal',
          purpose: '운영 업무 효율화 및 엄격한 보안 컴플라이언스 준수',
          target: '사내 총괄 관리자, 정보보안팀, 비즈니스 운영자',
          kpi: '운영 이슈 처리 리드타임 70% 단축, 보안 감사 무결점',
          reference: 'Google Cloud Console, Retool, Supabase Studio',
          benchmarkUrl: 'https://console.cloud.google.com',
          benchmarkAnalysis: '체계적인 네비게이션 트리와 상세한 데이터 인스펙터 패널',
          toneAndManner: '신뢰감을 주는 다크 옵시디언 테마와 저자극 모노크롬 상태 지표',
          screenList: '콘솔 대시보드, 유저 관리, 권한 설정, 감사 로그, 시스템 헬스',
          features: '역할별 접근 제어, 무결성 감사 로그, 대용량 일괄 작업',
          wireframe: '좌측 계층형 내비게이션, 중앙 마스터 테이블, 우측 상세 디테일 뷰',
          context: '사내 인트라넷 또는 VPN 환경에서 안전하게 접속하여 운영',
          techStack: 'React, TypeScript, Tailwind CSS, PostgreSQL / Drizzle',
          schedule: '1주차: 계정 관리 및 권한 제어, 2주차: 감사 로그 및 대량 데이터 처리'
        },
        footerInfo: {
          companyName: '엔터프라이즈 시스템 사업부',
          address: '서울시 종로구 종로 1',
          phone: '02-333-9000',
          email: 'admin@corp.internal',
          representative: '정보보호최고책임자 박엔터'
        }
      },
      design: {
        themeColor: '#090A0D',
        accentColor: '#E4DFD7',
        bodyTextColor: '#F1F1F4',
        linkColor: '#E4DFD7',
        buttonColor: '#E4DFD7',
        layout: 'standard',
        sectionTitles: ['콘솔 개요', '사용자 관리', '감사 로그', '시스템 설정'],
        sectionColumns: [4, 3, 2, 2],
        sectionContentTypes: [['text', 'text']],
      },
      navigation: {
        pageStructure: [
          { name: '어드민 콘솔 홈', route: '/admin', purpose: '시스템 헬스 및 활성 지표' },
          { name: '사용자 관리', route: '/admin/users', purpose: '계정 및 권한 제어' },
          { name: '보안 감사 로그', route: '/admin/audit', purpose: '작업 이력 및 무결성 검증' },
          { name: '시스템 설정', route: '/admin/settings', purpose: '인프라 및 전사 정책' }
        ],
        menus: ['콘솔홈', '사용자관리', '감사로그', '시스템설정']
      }
    },
    formInputs: {
      'project_name': '기업용 통합 관리자 포털 & 어드민',
      'target_user': '전사 리소스와 데이터를 안전하게 통제해야 하는 시스템 관리자',
      'pain_point': '부서별로 흩어진 시스템과 감사 로그 누락으로 인한 보안 위험',
      'core_value': '단일 통합 콘솔에서 전사 권한 통제 및 100% 무결점 감사 추적',
      'feature_list': '2FA 인증, RBAC 권한 분리, 실시간 감사 로그, 데이터 일괄 변경',
      'data_schema': 'userId, email, role, lastLoginAt, status, permissions',
      'ui_layout': '3단 분할 전문 운영 콘솔 레이아웃 및 콤팩트 데이터 테이블'
    }
  },
  {
    id: 'content-media-web',
    category: 'MEDIA',
    badge: '콘텐츠 미디어',
    name: '디지털 퍼블리싱 & 미디어 웹',
    subtitle: '아티클 에디터, 미디어 큐레이션 및 구독 플랫폼',
    description: '타이포그래피 가독성을 극대화한 디지털 미디어, 마크다운/블록 에디터, 카테고리 큐레이션 및 구독 멤버십 웹 애플리케이션',
    targetUser: '작가, 에디터, 미디어 구독자 및 큐레이터',
    keyFeatures: [
      '미니멀 마크다운 & 리치 텍스트 블록 에디터',
      'SEO 최적화 및 OpenGraph 소셜 공유 자동 생성',
      '태그 기반 아티클 탐색 및 풀텍스트 검색 엔진',
      '구독자 멤버십 및 뉴스레터 발송 연동'
    ],
    screens: [
      { name: '미디어 홈 피드', route: '/', purpose: '최신 추천 아티클 및 트렌딩 토픽 큐레이션' },
      { name: '아티클 뷰어', route: '/posts/:slug', purpose: '무장애 반응형 타이포그래피 독서 뷰어' },
      { name: '에디터 스튜디오', route: '/editor', purpose: '실시간 프리뷰 지원 마크다운/블록 에디터' },
      { name: '토픽 아카이브', route: '/topics', purpose: '카테고리별 아티클 아카이빙 및 검색' }
    ],
    themeColor: '#090A0D',
    accentColor: '#E4DFD7',
    platform: 'WEB',
    sampleData: [
      { title: '2026 모던 웹 타이포그래피 아키텍처', contact: '수석 에디터', status: '완료', memo: '조회수 14,200회, 추천수 890회 달성', date: '2026-10-11' },
      { title: '클라우드 네이티브 프론트엔드 최적화 기법', contact: '기술 기고가', status: '완료', memo: '피처드 아티클 선정 및 메인 게재', date: '2026-10-12' },
      { title: '럭셔리 미니멀리즘 디자인 가이드라인', contact: '디자인 디렉터', status: '진행중', memo: '초안 교정 및 커버 이미지 검수 중', date: '2026-10-13' }
    ],
    plan: {
      metadata: {
        projectName: '디지털 퍼블리싱 & 미디어 웹',
        title: '미디어 퍼블리싱 웹 아키텍처 기획서',
        slogan: '궁극의 가독성과 몰입감 높은 콘텐츠 경험',
        subtitle: '웹 표준 시맨틱 마크업 기반의 고품격 미디어 웹',
        description: '독서 몰입도를 극대화하는 서체 체계와 경량화된 블로그/매거진 플랫폼 기획서',
        platform: 'WEB',
        projectMode: 'personal',
        projectOverview: {
          targetUrl: 'https://minimal-media.web.app',
          purpose: '고품질 디지털 아티클 생산 및 독자 인게이지먼트 증대',
          target: '전문 지식 독자, 테크 라이터, 디자인 에디터',
          kpi: '평균 독서 체류 시간 4분 30초, 이탈률 25% 미만',
          reference: 'Substack, Medium Minimal, The Verge Clean Reader',
          benchmarkUrl: 'https://substack.com',
          benchmarkAnalysis: '군더더기 광고와 배너를 배제한 순수한 타이포그래피 중심 레이아웃',
          toneAndManner: '에디토리얼 웜 옵시디언 & 티타늄, 스위스 스타일 그리드',
          screenList: '홈 피드, 아티클 리더, 에디터 스튜디오, 토픽 탐색',
          features: '마크다운 에디터, 실시간 목차, 다크/라이트 대비 모드',
          wireframe: '중앙 680px 가독 칼럼, 좌측 플로팅 공유 바, 우측 아티클 목차',
          context: '모바일 및 데스크톱에서 눈의 피로 없이 장시간 독서',
          techStack: 'React, TypeScript, Tailwind CSS, Headless CMS',
          schedule: '1주차: 에디터 및 아티클 뷰어 구현, 2주차: SEO 및 아카이브'
        },
        footerInfo: {
          companyName: '디지털 미디어 랩',
          address: '서울시 마포구 독막로 12',
          phone: '02-444-5500',
          email: 'editor@minimal-media.web',
          representative: '발행인 한미디어'
        }
      },
      design: {
        themeColor: '#090A0D',
        accentColor: '#E4DFD7',
        bodyTextColor: '#F1F1F4',
        linkColor: '#E4DFD7',
        buttonColor: '#E4DFD7',
        layout: 'standard',
        sectionTitles: ['홈 피드', '아티클 리더', '에디터 스튜디오'],
        sectionColumns: [2, 1, 2],
        sectionContentTypes: [['text', 'text']],
      },
      navigation: {
        pageStructure: [
          { name: '미디어 홈 피드', route: '/', purpose: '최신 아티클 큐레이션' },
          { name: '아티클 리더', route: '/posts/:slug', purpose: '가독 최적화 독서 화면' },
          { name: '에디터 스튜디오', route: '/editor', purpose: '마크다운 작성 및 배포' }
        ],
        menus: ['피드', '에디터', '아카이브']
      }
    },
    formInputs: {
      'project_name': '디지털 퍼블리싱 & 미디어 웹',
      'target_user': '장문의 글을 집중해서 읽고 공유하려는 지식 독자 및 필진',
      'pain_point': '지나친 광고와 산만한 UI로 인한 독서 몰입 방해',
      'core_value': '시각적 소음을 100% 제거한 순수한 활자와 에디토리얼 레이아웃',
      'feature_list': '마크다운 에디터, 목차 네비게이터, 소셜 공유 카드, 풀텍스트 검색',
      'data_schema': 'postId, title, content, author, tags, publishedAt, readTime',
      'ui_layout': '황금비율 1단 중앙 집중형 독서 레이아웃'
    }
  }
];

/**
 * Convert user's raw text idea into a structured standard plan for web development.
 */
export function parseRawIdeaToStandardPlan(rawText: string): StandardPrdTemplate {
  const text = rawText.toLowerCase();

  if (text.includes('커머스') || text.includes('쇼핑') || text.includes('스토어') || text.includes('결제') || text.includes('상품') || text.includes('장바구니') || text.includes('주문')) {
    return STANDARD_PRD_TEMPLATES[1]; // E-commerce
  }
  if (text.includes('어드민') || text.includes('관리자') || text.includes('포털') || text.includes('사내') || text.includes('보안') || text.includes('감사') || text.includes('인트라넷')) {
    return STANDARD_PRD_TEMPLATES[2]; // Enterprise Portal
  }
  if (text.includes('미디어') || text.includes('블로그') || text.includes('콘텐츠') || text.includes('아티클') || text.includes('에디터') || text.includes('뉴스') || text.includes('매거진')) {
    return STANDARD_PRD_TEMPLATES[3]; // Media & Publishing
  }

  // Default fallback to Modern SaaS Web Platform
  return STANDARD_PRD_TEMPLATES[0];
}
