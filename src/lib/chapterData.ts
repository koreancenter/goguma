export interface SectionDef {
  key: string;
  title: string;
  question: string;
  placeholder: string;
}

export interface ChapterDef {
  id: number;
  title: string;
  engTitle: string;
  description: string;
  sections: SectionDef[];
}

export const GOGUMA_CHAPTERS: ChapterDef[] = [
  {
    id: 1,
    title: '서비스 개요 및 기획 배경',
    engTitle: 'Overview & Background',
    description: '웹 애플리케이션의 핵심 정의와 개발 목적 및 기대 효과를 규정합니다.',
    sections: [
      {
        key: 'project_name',
        title: '서비스 명칭 및 웹 서비스 정의',
        question: '구축하고자 하는 웹 애플리케이션의 공식 명칭과 핵심 목적을 입력하세요.',
        placeholder: '웹 애플리케이션 명칭 및 주요 기능 요약',
      },
      {
        key: 'problem_background',
        title: '개발 배경 및 기술 목표',
        question: '웹 서비스 개발 배경, 주요 해결 과제 및 기대 효과를 입력하세요.',
        placeholder: '웹 서비스 개발 배경 및 기술적 해결 과제',
      },
    ],
  },
  {
    id: 2,
    title: '타깃 사용자 및 환경 명세',
    engTitle: 'Target & Platform Spec',
    description: '사용자 그룹과 지원 디바이스 환경 및 핵심 요구사항을 구체화합니다.',
    sections: [
      {
        key: 'target_persona',
        title: '주요 사용자군 및 런타임 환경',
        question: '서비스의 주 사용자 계층과 지원 디바이스(Desktop / Mobile Web) 환경을 정의하세요.',
        placeholder: '사용자 그룹 및 디바이스 환경 명세',
      },
      {
        key: 'user_problems',
        title: '사용자 요구사항 및 Pain Points',
        question: '사용자가 직면한 주요 요구사항 및 시스템이 충족해야 할 인터랙션 목표를 입력하세요.',
        placeholder: '핵심 사용자 요구사항 및 기술적 대응 방안',
      },
    ],
  },
  {
    id: 3,
    title: '핵심 기능 명세 및 유저 플로우',
    engTitle: 'Functional Specs & Flow',
    description: '웹 애플리케이션의 핵심 기능 명세와 엔드투엔드 이용 흐름을 설계합니다.',
    sections: [
      {
        key: 'key_features',
        title: '필수 핵심 기능 명세',
        question: '웹 애플리케이션에 반드시 포함되어야 하는 핵심 기능 요구사항을 입력하세요.',
        placeholder: '인증, 대시보드, 데이터 관리(CRUD), 실시간 알림 등 필수 기능 명세',
      },
      {
        key: 'happy_path',
        title: '엔드투엔드 유저 플로우 (Happy Path)',
        question: '사용자가 진입하여 주요 작업을 완결하는 엔드투엔드 플로우를 정의하세요.',
        placeholder: '랜딩 ➔ 인증 ➔ 대시보드 ➔ 데이터 조작 ➔ 결과 저장 및 통계 반영',
      },
    ],
  },
  {
    id: 4,
    title: '데이터 모델 및 API 스키마',
    engTitle: 'Data Model & Schema',
    description: '데이터베이스 엔터티 구조와 비즈니스 로직 및 유효성 검증 규칙을 정의합니다.',
    sections: [
      {
        key: 'data_columns',
        title: '데이터베이스 엔터티 및 필드 명세',
        question: '데이터베이스 모델에 포함될 주요 엔터티와 필드(Columns) 목록을 정의하세요.',
        placeholder: 'ID, Title, UserID, Status, Metadata, CreatedAt 등 필드 목록',
      },
      {
        key: 'business_rules',
        title: '비즈니스 로직 및 유효성 검증 규칙',
        question: '데이터 무결성을 위한 유효성 검증 규칙과 상태 전이 로직을 정의하세요.',
        placeholder: '필수 입력값 검증, 상태 전이 규칙, 인덱싱 및 권한 정책',
      },
    ],
  },
  {
    id: 5,
    title: '디자인 시스템 및 UI 토큰',
    engTitle: 'Design System & Tokens',
    description: '모노크롬 테마 토큰, 타이포그래피, 레이아웃 그리드 등 시각적 규격을 규정합니다.',
    sections: [
      {
        key: 'brand_mood',
        title: '비주얼 테마 및 컬러 토큰',
        question: '웹 서비스의 비주얼 테마와 모노크롬 컬러 토큰을 정의하세요.',
        placeholder: 'Warm Obsidian & Titanium: Deep Obsidian (#090A0D) + Warm Titanium (#E4DFD7)',
      },
      {
        key: 'ui_tone',
        title: '타이포그래피 및 레이아웃 규격',
        question: '서체 체계, 그리드 시스템, 인터랙션 피드백 규격을 정의하세요.',
        placeholder: '시스템 산세리프 및 모노스페이스, 8px 그리드, 마이크로 애니메이션',
      },
    ],
  },
  {
    id: 6,
    title: '정보구조(IA) 및 화면 정의서',
    engTitle: 'Information Architecture',
    description: '웹 서비스를 구성하는 전체 사이트맵, 화면 목록 및 내비게이션 동선을 설계합니다.',
    sections: [
      {
        key: 'pages_structure',
        title: '사이트맵 및 화면 목록',
        question: '웹 애플리케이션을 구성하는 전체 화면 목록과 라우트 경로를 정의하세요.',
        placeholder: '대시보드 (/), 데이터 목록 (/items), 상세 뷰 (/items/:id), 설정 (/settings)',
      },
      {
        key: 'nav_hierarchy',
        title: '내비게이션 및 메뉴 계층 구조',
        question: '헤더 네비게이션, 사이드바, 서브메뉴의 이동 계층 구조를 정의하세요.',
        placeholder: '글로벌 헤더 네비게이션, 좌측 사이드바, 인라인 모달 레이아웃',
      },
    ],
  },
  {
    id: 7,
    title: '시스템 아키텍처 및 보안 규약',
    engTitle: 'Architecture & Security',
    description: '프론트엔드/백엔드 기술 스택, 보안 규약 및 성능 최적화 정책을 확정합니다.',
    sections: [
      {
        key: 'stack_requirements',
        title: '기술 스택 및 프레임워크 규약',
        question: '프론트엔드, 백엔드 프레임워크 및 데이터베이스 기술 스택을 확정하세요.',
        placeholder: 'React (TypeScript), Tailwind CSS, Node.js / RESTful API, Cloud Run',
      },
      {
        key: 'data_sovereignty',
        title: '보안 정책 및 성능 최적화 규약',
        question: '데이터 암호화, 세션 보안 및 성능 최적화(Lighthouse) 정책을 정의하세요.',
        placeholder: 'TLS 전송 암호화, 안전한 토큰 보관, 코드 스플리팅, 0ms 렌더링 최적화',
      },
    ],
  },
  {
    id: 8,
    title: '개발 산출물 및 배포 명세',
    engTitle: 'Artifacts & Release',
    description: '11종 마크다운 기술 사양서 번들과 프로토타입 산출물을 검수하고 배포합니다.',
    sections: [
      {
        key: 'export_summary',
        title: '최종 개발 명세서 번들 및 프로토타입',
        question: '완성된 11종 기술 사양서와 인터랙티브 프로토타입 산출물을 검토합니다.',
        placeholder: '마크다운 사양서 패키지 및 단일 파일 프로토타입 내보내기',
      },
      {
        key: 'verification_checklist',
        title: '개발 검수 및 인수 테스트 기준',
        question: '개발 완료 후 검증할 핵심 기능 및 성능 인수 체크리스트를 확인하세요.',
        placeholder: '주요 API 통신 정상 동작, 모바일/데스크톱 반응형 렌더링, 콘솔 에러 제로',
      },
    ],
  },
];
