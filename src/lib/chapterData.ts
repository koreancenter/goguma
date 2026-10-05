export interface SectionDef {
  key: string;
  title: string;
  question: string;
  placeholder: string;
  guideChips: string[];
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
    title: '제안 및 개요',
    engTitle: 'Proposal & Overview',
    description: '어떤 서비스를 왜 만드는지 일상어로 정의합니다.',
    sections: [
      {
        key: 'project_name',
        title: '서비스 명칭 및 한 줄 정의',
        question: '어떤 웹/앱 서비스를 만들고자 하시나요? 서비스의 이름과 한 줄 목적을 적어주세요.',
        placeholder: '예: 우리동네 동물병원 예약장부 - 카톡과 수기 장부를 대체하는 1인 원장님 전용 스케줄러',
        guideChips: [
          '우리동네 동물병원 예약장부 - 원장님 전용 스케줄러',
          '원생 출결 및 수납 관리 - 학원 데스크 맞춤형 장부',
          '프리랜서 실시간 견적서 발행기 - 원클릭 PDF 발송기',
          '사내 업무 요청 및 결재 보드 - 소규모 팀용 칸반 장부',
        ],
      },
      {
        key: 'problem_background',
        title: '해결하려는 문제와 배경',
        question: '이 서비스를 기획하게 된 계기와 기존 방식의 불편은 무엇인가요?',
        placeholder: '예: 수기 장부와 전화 예약이 겹쳐서 예약 펑크가 잦고, 월말마다 매출 정산에 3일씩 걸립니다.',
        guideChips: [
          '수기 장부와 카톡 예약이 겹쳐 중복 예약(오버부킹) 발생',
          '매달 말일 엑셀로 일일이 정산하느라 3일씩 야근함',
          '손님이 전화로 취소할 때 장부 기록을 지우는 과정에서 누락 발생',
          '외부 유료 SaaS는 기능이 너무 복잡하고 매달 비용 부담이 큼',
        ],
      },
    ],
  },
  {
    id: 2,
    title: '타깃 및 사용자',
    engTitle: 'Target & Problem',
    description: '서비스를 사용할 사람과 그들이 겪는 핵심 결핍을 구체화합니다.',
    sections: [
      {
        key: 'target_persona',
        title: '핵심 사용자 페르소나',
        question: '이 서비스를 가장 자주 사용하는 사람은 누구이며 어떤 환경에서 접속하나요?',
        placeholder: '예: 진료 중간중간 태블릿이나 PC 브라우저로 빠르게 스케줄을 확인하는 40대 1인 원장님',
        guideChips: [
          '진료 틈틈이 스마트폰이나 PC로 확인하는 1인 동물병원장',
          '학원 데스크에서 학부모 전화 응대와 동시에 장부를 적는 원장님',
          '별도 회원가입 없이 링크 하나로 예약 시간을 고르는 일반 고객',
          '출장 현장에서 스마트폰으로 바로 견적을 확인하는 프리랜서',
        ],
      },
      {
        key: 'user_problems',
        title: '사용자의 핵심 고통 3가지',
        question: '사용자가 기존 업무 방식에서 가장 고통받는 점 3가지는 무엇인가요?',
        placeholder: '예: 1. 예약 시간 중복, 2. 노쇼(No-show) 사전 방지 불가, 3. 지난 진료 기록 검색 어려움',
        guideChips: [
          '1. 중복 예약 발생 및 알림 누락으로 인한 고객 불만',
          '2. 미수금/수납 내역 확인이 한눈에 되지 않아 입금 확인 지연',
          '3. 과거 방문 이력과 고객 특이사항을 빠르게 검색할 수 없음',
        ],
      },
    ],
  },
  {
    id: 3,
    title: '핵심 기능 및 여정',
    engTitle: 'Features & Happy Path',
    description: '소프트웨어가 제공할 필수 기능과 사용자의 이용 흐름을 설계합니다.',
    sections: [
      {
        key: 'key_features',
        title: '필수 핵심 기능 3가지',
        question: '다른 것은 빼더라도 이 앱에 반드시 들어가야 하는 핵심 기능 3가지를 적어주세요.',
        placeholder: '예: 1. 원클릭 신규 예약 등록, 2. 오늘 일정 달력/타임라인 뷰, 3. 상태 변경(대기/확정/취소)',
        guideChips: [
          '1. 신규 데이터 1초 등록 (이름, 연락처, 일정, 메모)',
          '2. 상태 칩 원클릭 변경 (접수 ➔ 확정 ➔ 완료 ➔ 취소)',
          '3. 엑셀 형태 실시간 목록 조회 및 키워드 검색',
          '4. 당일 주요 일정 카드 및 미처리 항목 상단 강조',
        ],
      },
      {
        key: 'happy_path',
        title: '사용자 성공 여정 (Happy Path)',
        question: '사용자가 접속하여 목적을 달성하고 나갈 때까지의 가장 이상적인 흐름을 적어주세요.',
        placeholder: '예: 메인 화면 접속 ➔ [예약 추가] 클릭 ➔ 손님명/시간 입력 후 [저장] ➔ 장부에 즉시 한 줄 반영 확인',
        guideChips: [
          '접속 ➔ [추가] 클릭 ➔ 고객명/전화번호 입력 ➔ [저장] ➔ 장부 상단 즉각 반영',
          '일정 확인 ➔ 항목 클릭 ➔ [진료 완료] 칩 클릭 ➔ 완료 상태로 색상 변경',
          '검색창에 고객명 2글자 타이핑 ➔ 과거 방문 기록 3건 즉시 필터링',
        ],
      },
    ],
  },
  {
    id: 4,
    title: '데이터 및 장부 스키마',
    engTitle: 'Data Schema',
    description: '엑셀 장부처럼 관리할 데이터 열(Columns)과 저장 규칙을 정의합니다.',
    sections: [
      {
        key: 'data_columns',
        title: '엑셀 장부 관리 항목 (열 이름)',
        question: '엑셀 장부에 열(Column)로 적는다면 어떤 항목들이 들어가나요? 쉼표로 적어주세요.',
        placeholder: '예: 고객명, 연락처, 예약일시, 반려견종, 특이사항, 상태',
        guideChips: [
          '고객명, 연락처, 예약일시, 품종, 체중, 특이사항, 상태(대기/확정/완료)',
          '학생명, 학부모연락처, 수강과목, 등록일, 수강료, 납부상태, 출결',
          '고객사명, 담당자, 견적금액, 납기일, 프로젝트명, 진행단계',
        ],
      },
      {
        key: 'business_rules',
        title: '데이터 상태 변경 및 필수 규칙',
        question: '항목 저장이나 상태 변경 시 지켜야 할 규칙이 있나요?',
        placeholder: '예: 고객명과 연락처는 필수 입력, 상태는 [대기 ➔ 확정 ➔ 완료] 순으로 진행, 취소 시 사유 기록',
        guideChips: [
          '고객명과 연락처는 필수 입력 (공백 등록 차단)',
          '상태는 [접수대기], [예약확정], [방문완료], [예약취소] 4가지 순환',
          '취소 처리 시 사유를 메모란에 필수로 남기도록 안내',
          '전화번호는 숫자만 입력해도 하이픈(-) 자동 포맷 적용',
        ],
      },
    ],
  },
  {
    id: 5,
    title: '디자인 시스템 및 감성',
    engTitle: 'Design System',
    description: '도화지 질감, 서체, 테마 색상 등 사용자의 시각적 경험을 규정합니다.',
    sections: [
      {
        key: 'brand_mood',
        title: '브랜드 감성 및 메인 색상',
        question: '서비스에 어울리는 색상과 분위기는 어떤 느낌을 원하시나요?',
        placeholder: '예: Classic Warm Paper: 따뜻한 아이보리 캔버스(#F8F4EB)에 깊은 고구마 와인(#6B1D42) 악센트',
        guideChips: [
          'Classic Warm Paper: 편안한 아이보리 도화지(#F8F4EB) + 와인(#6B1D42)',
          'Editorial Slate: 정갈한 연한 회색(#F5F5F7) + 딥 네이비(#1E293B)',
          'Sage Minimal: 자연 친화적인 세이지 크림(#F4F6F0) + 올리브(#3F4E34)',
        ],
      },
      {
        key: 'ui_tone',
        title: '입력창 및 타이포그래피 스타일',
        question: '버튼, 입력창, 서체 등의 전반적인 시각적 형태를 지정해주세요.',
        placeholder: '예: 눈이 편안한 Noto Serif KR 명조 헤딩 + 하단 밑줄형 필기 인풋 + 라운드 칩',
        guideChips: [
          '클래식 양장본 명조 헤딩 + 밑줄형 필기 인풋 + 원클릭 안내 칩',
          '깔끔한 고딕 폰트 + 테두리 없는 미니멀 입력창 + 높은 명도 대비',
          '여백이 넉넉한 4단 가로 확장 북 레이아웃 + 0ms 렌더링 피드백',
        ],
      },
    ],
  },
  {
    id: 6,
    title: '화면 구조 및 네비게이션',
    engTitle: 'Page Structure',
    description: '서비스를 구성하는 주요 화면 목록과 이동 동선을 설계합니다.',
    sections: [
      {
        key: 'pages_structure',
        title: '필요한 주요 화면 (페이지 목록)',
        question: '앱에 필요한 주요 화면들은 어떤 것들이 있나요?',
        placeholder: '예: 1. 메인 장부 대시보드, 2. 신규 예약 입력 모달, 3. 고객별 이력 상세 팝업, 4. 주간 일정 캘린더',
        guideChips: [
          '대시보드(장부 목록), 신규 등록 폼, 고객 상세 모달, 월간 달력',
          '원페이지 통합 스크롤 대시보드 (입력창과 리스트가 한 화면에 공존)',
          '홈(서비스 소개), 접수 폼, 내 예약 확인, 관리자 장부 화면',
        ],
      },
      {
        key: 'nav_hierarchy',
        title: '화면 간 이동 및 메뉴 구조',
        question: '사용자가 메뉴를 오가는 네비게이션 구조는 어떻게 배치할까요?',
        placeholder: '예: 4단 가로 확장 분할 뷰, 필요 시 1·2열은 52px 아이콘 바로 접히는 반응형 구조',
        guideChips: [
          '좌측 챕터/섹션 내비게이션 + 중앙 도화지 캔버스 + 우측 실시간 프리뷰',
          '상단 탭 바 (전체보기 / 오늘 일정 / 대기 건) + 하단 액션 바',
          '모달 기반 팝업 입력 (화면 이동 없이 현재 장부 위에서 즉시 작성)',
        ],
      },
    ],
  },
  {
    id: 7,
    title: '아키텍처 및 보안 규약',
    engTitle: 'Architecture Map',
    description: '기술 스택 불변 규칙, 데이터 주권 및 로컬 퍼스트 원칙을 확정합니다.',
    sections: [
      {
        key: 'stack_requirements',
        title: '기술 스택 및 실행 환경',
        question: '기술 스택과 실행 환경 요구조건을 정리해 주세요.',
        placeholder: '예: React (TypeScript) + Tailwind CSS, 단일 파일 prototype.html, 로컬 IndexedDB 스토리지',
        guideChips: [
          'React + TypeScript + Tailwind CSS (서드파티 라이브러리 추가 금지)',
          '단일 파일 prototype.html (무설치, 더블클릭으로 모든 브라우저 구동)',
          'Cloudflare Pages + D1 서버리스 데이터베이스 호환 표준 준수',
        ],
      },
      {
        key: 'data_sovereignty',
        title: '데이터 주권 및 오프라인 정책',
        question: '데이터 프라이버시와 오프라인 작동 정책은 어떻게 되나요?',
        placeholder: '예: 외부 클라우드로 환자/고객 정보를 전송하지 않고 브라우저 로컬 스토리지에 암호화 보관',
        guideChips: [
          '사용자 입력 데이터는 외부 서버로 전송하지 않고 브라우저에만 저장',
          '인터넷 연결이 끊긴 오프라인 상태에서도 100% 읽기/쓰기 작동',
          '에이전트가 임의의 원격 SDK나 텔레메트리 스크립트를 삽입하지 못하도록 통제',
        ],
      },
    ],
  },
  {
    id: 8,
    title: '산출물 허브 및 배포',
    engTitle: 'Artifacts Hub',
    description: '11종 사양서 번들과 단일 파일 prototype.html을 검수하고 내보냅니다.',
    sections: [
      {
        key: 'export_summary',
        title: '청사진 번들 최종 검토 및 다운로드',
        question: '완성된 11종 사양서와 인터랙티브 프로토타입을 검토하고 ZIP 패키지로 다운로드합니다.',
        placeholder: '프로젝트가 완성되면 [Cmd/Ctrl + E] 또는 [ZIP 번들 내보내기] 버튼으로 다운로드할 수 있습니다.',
        guideChips: [
          'goguma-blueprint-[slug].zip 원클릭 다운로드',
          'prototype.html 단일 파일 독립 실행 확인',
          '.cursorrules 및 11종 docs 마크다운 패키지 에이전트 주입 준비 완료',
        ],
      },
      {
        key: 'verification_checklist',
        title: '사용자 인수 검수 (UAT 체크리스트)',
        question: '08_TEST_CHECKLIST.md의 검수 항목을 화면에서 직접 조작하며 확인합니다.',
        placeholder: '1. 장부 입력 시 1줄 즉시 추가 여부 / 2. 새로고침 후 데이터 유지 여부 / 3. 오프라인 동작 여부',
        guideChips: [
          '입력 폼에 값 입력 후 [저장] 시 즉시 목록 반영 확인',
          '브라우저 F5 새로고침 후에도 기록이 유지되는지 확인',
          '빈칸 입력 및 형식 오류 시 친절한 안내 문구가 뜨는지 확인',
        ],
      },
    ],
  },
];
