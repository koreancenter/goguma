import { SitePlan, FormInputEntity, ProjectEntity } from '../types';

export interface StandardPrdTemplate {
  id: string;
  category: 'RESERVATION' | 'WORKFLOW' | 'INVENTORY' | 'ESTIMATE';
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
    id: 'vet-reservation',
    category: 'RESERVATION',
    badge: '예약 & 고객관리',
    name: '스마트 예약 장부 & 고객 차트',
    subtitle: '동물병원, 클리닉, 1:1 상담, 뷰티살롱 예약 관리',
    description: '노쇼를 방지하고 실시간 예약 현황과 고객 히스토리를 한눈에 관리하는 표준 예약 관리 애플리케이션',
    targetUser: '원장님, 실장님, 예약 데스크 실무자',
    keyFeatures: [
      '일자별/시간대별 예약 현황 대시보드',
      '신규 고객 진료 접수 및 예약 등록 모달',
      '예약 상태 원클릭 변경 (접수 ➔ 확정 ➔ 진료완료 ➔ 노쇼/취소)',
      '보호자 연락처 및 반려동물/특이사항 메모 검색'
    ],
    screens: [
      { name: '예약 대시보드', route: '/dashboard', purpose: '오늘의 예약 현황, 타임라인 및 긴급 대기 현황 모니터링' },
      { name: '환자/고객 차트', route: '/patients', purpose: '고객 연락처, 과거 진료 이력 및 특이사항 히스토리 조회' },
      { name: '신규 예약 접수', route: '/booking', purpose: '보호자명, 진료항목, 희망 일시 입력 및 즉시 배정' },
      { name: '진료 통계', route: '/analytics', purpose: '일별/월별 내원 건수 및 노쇼 비율 통계 리포트' }
    ],
    themeColor: '#6B1D42',
    accentColor: '#B45309',
    platform: 'WEB',
    sampleData: [
      { title: '초코 (골든리트리버) 정기 예방접종', contact: '010-8765-4321', status: '진행중', memo: '알러지 피부염 주의, 발톱 정리 요청', date: '오늘 14:00' },
      { title: '나비 (코숏) 중성화 상담 및 검진', contact: '010-1234-5678', status: '대기', memo: '금식 8시간 유지 확인 완료', date: '오늘 15:30' },
      { title: '몽이 (말티즈) 귀 염증 드레싱', contact: '010-9988-7766', status: '완료', memo: '항생제 3일분 처방', date: '오늘 11:00' },
      { title: '보리 (포메라니안) 심장사상충 검사', contact: '010-3322-1100', status: '대기', memo: '첫 방문, 문진표 작성 필요', date: '오늘 17:00' }
    ],
    plan: {
      metadata: {
        projectName: '우리동네 동물병원 스마트 예약장부',
        title: '동물병원 예약 및 환자관리 시스템',
        slogan: '간편한 진료 접수와 노쇼 없는 예약 스케줄러',
        subtitle: '현장 실무자를 위한 직관적인 원클릭 예약 장부',
        description: '진료 누락을 0%로 줄이고, 전화 문의 시 3초 만에 과거 차트를 검색하는 표준 병의원 관리 시스템',
        platform: 'WEB',
        projectMode: 'enterprise',
        projectOverview: {
          targetUrl: 'https://vet-booking.local',
          purpose: '진료 예약 누락 및 노쇼 방지, 데스크 업무 50% 시간 단축',
          target: '동물병원 원장, 테크니션, 리셉션 데스크',
          kpi: '노쇼 발생률 20% 이하 감축, 신규 접수 등록 30초 내 완결',
          reference: '토스 플레이스, 닥터팔레트, 노션 클리닉 템플릿',
          benchmarkUrl: 'https://example.com/clinic-ref',
          benchmarkAnalysis: '복잡한 EMR 대신 예약과 메모 중심의 빠른 인터랙션 구현',
          toneAndManner: '신뢰감을 주는 와인 버건디와 편안한 웜 아이보리 톤',
          screenList: '대시보드, 고객차트, 신규예약, 진료통계',
          features: '실시간 예약 필터링, 원클릭 상태 전환, 로컬 자동 저장',
          wireframe: '좌측 사이드바 내비게이션, 중앙 타임라인 그리드, 우측 상세 드로어',
          context: '진료 중 긴급 전화가 왔을 때 빠르게 이름을 검색하고 즉시 메모 기록',
          techStack: 'React + TypeScript + Tailwind CSS + IndexedDB Local-First',
          schedule: '1주차: 화면 및 상태 플로우 구현, 2주차: 검색 및 로컬 저장소 최적화'
        },
        footerInfo: {
          companyName: '스마트벳 클리닉 시스템',
          address: '서울시 강남구 테헤란로 123',
          phone: '02-1234-5678',
          email: 'support@smartvet.local',
          representative: '대표원장 김동물'
        }
      },
      design: {
        themeColor: '#6B1D42',
        accentColor: '#B45309',
        bodyTextColor: '#231F20',
        linkColor: '#6B1D42',
        buttonColor: '#6B1D42',
        layout: 'standard',
        sectionTitles: ['예약 현황', '고객 차트', '신규 접수', '통계'],
        sectionColumns: [3, 2, 1, 4],
        sectionContentTypes: [['text', 'text'], ['text', 'text']],
      },
      navigation: {
        pageStructure: [
          { name: '예약 대시보드', route: '/dashboard', purpose: '오늘의 예약 현황 및 타임라인 모니터링' },
          { name: '환자/고객 차트', route: '/patients', purpose: '보호자 및 환자 과거 진료 이력 조회' },
          { name: '신규 예약 접수', route: '/booking', purpose: '희망 일시, 진료 과목, 특이사항 신속 등록' },
          { name: '진료 통계 리포트', route: '/analytics', purpose: '월별 내원 추이 및 노쇼 통계' }
        ],
        menus: ['대시보드', '환자차트', '신규접수', '통계']
      }
    },
    formInputs: {
      'project_name': '우리동네 동물병원 스마트 예약장부',
      'target_user': '동물병원 리셉션 실무자 및 원장님',
      'pain_point': '수기 장부 사용 시 예약 중복 발생 및 노쇼로 인한 매출 손실',
      'core_value': '3초 검색과 한눈에 보는 당일 타임라인으로 데스크 혼선 완전 제거',
      'feature_list': '당일 예약 타임라인 그리드, 환자/보호자 검색, 진료상태 토글(대기/확정/완료)',
      'data_schema': '예약일시, 환자명(품종), 보호자명, 연락처, 진료과목, 진행상태, 메모',
      'ui_layout': '화면 상단 일자 필터, 중앙 카드형 목록, 원터치 신규 추가 버튼'
    }
  },
  {
    id: 'workflow-kanban',
    category: 'WORKFLOW',
    badge: '업무 & 결재 칸반',
    name: '사내 업무 요청 & 결재 칸반보드',
    subtitle: '팀별 업무 요청, 품의서 승인, 프로젝트 진척 관리',
    description: '이메일과 메신저로 흩어지는 요청사항을 한곳에 모으고 실시간 상태 칸반으로 승인 파이프라인을 통제하는 시스템',
    targetUser: '팀장, 프로젝트 매니저, 실무 담당자',
    keyFeatures: [
      '4단계 칸반 파이프라인 (요청접수 ➔ 검토중 ➔ 승인완료 ➔ 보류/반려)',
      '신규 결재/업무 요청서 원클릭 생성',
      '긴급도(긴급, 보통, 여유) 시각적 배지 표시',
      '드래그 앤 드롭 또는 원클릭 상태 전이'
    ],
    screens: [
      { name: '칸반 보드', route: '/board', purpose: '단계별 업무 요청 카드 현황 및 진행상황 한눈에 파악' },
      { name: '요청서 작성', route: '/new-request', purpose: '업무 제목, 기안자, 마감기한, 상세 품의 내용 작성' },
      { name: '승인/완료 보관함', route: '/archive', purpose: '최종 결재 승인된 문서 및 히스토리 검색' }
    ],
    themeColor: '#1E3A8A',
    accentColor: '#2563EB',
    platform: 'WEB',
    sampleData: [
      { title: '2분기 마케팅 집행 예산 품의서', contact: '마케팅팀 이대리', status: '대기', memo: '온라인 퍼포먼스 광고비 500만원 승인 요청', amount: '5,000,000원', date: '2026-09-26' },
      { title: '신규 서버 클라우드 증설 요청', contact: '개발팀 박선임', status: '진행중', memo: '트래픽 급증 대비 스펙 상향 (인프라팀 검토 중)', amount: '월 350,000원', date: '2026-09-28' },
      { title: '디자인 에셋 외주 계약 승인', contact: '디자인팀 최팀장', status: '완료', memo: '법무 검토 완료 및 전자서명 체결 완료', amount: '2,200,000원', date: '2026-09-24' },
      { title: '사내 PC 교체 신청 건', contact: '경영지원팀 정과장', status: '보류', memo: '하반기 예산 재배정 후 재검토 예정', amount: '1,800,000원', date: '2026-10-01' }
    ],
    plan: {
      metadata: {
        projectName: '스마트 워크플로우 결재 칸반',
        title: '사내 업무 요청 및 결재 승인 시스템',
        slogan: '누락 없는 팀간 협업과 막힘 없는 승인 파이프라인',
        subtitle: '복잡한 전자결재 대신 쓰는 직관적인 실무 칸반',
        description: '메신저에 묻히는 요청을 단일 대시보드에 모아 실시간 병목을 해소하는 가벼운 워크플로우 도구',
        platform: 'WEB',
        projectMode: 'enterprise',
        projectOverview: {
          targetUrl: 'https://workflow-kanban.local',
          purpose: '부서 간 업무 처리 지연 50% 단축 및 의사결정 투명성 확보',
          target: '실무 기안자, 팀장, 부서장, 의사결정권자',
          kpi: '결재 처리 리드타임 3일 ➔ 4시간 단축',
          reference: 'Linear, Jira Simplified, Asana Board',
          benchmarkUrl: 'https://linear.app',
          benchmarkAnalysis: '불필요한 설정을 빼고 순수한 칸반 상태 전이와 메모에 집중',
          toneAndManner: '정돈되고 신뢰감 있는 코퍼레이트 네이비 블루',
          screenList: '칸반 보드, 신규 요청 모달, 승인 보관함',
          features: '상태별 컬럼 집계, 긴급도 라벨, 검색 및 담당자 필터',
          wireframe: '좌우 4열 칸반 컬럼, 상단 검색 및 새 업무 버튼',
          context: '팀장님이 스마트폰이나 브라우저에서 10초 만에 내용을 훑고 승인',
          techStack: 'React + TypeScript + Tailwind CSS',
          schedule: '1주차: 칸반 레이아웃 완성, 2주차: 상태 변경 및 로컬 저장 연동'
        },
        footerInfo: {
          companyName: '엔터프라이즈 워크스페이스 솔루션',
          address: '서울시 서초구 서초대로 300',
          phone: '02-555-0100',
          email: 'support@workflow.local',
          representative: '운영책임자 박승인'
        }
      },
      design: {
        themeColor: '#1E3A8A',
        accentColor: '#2563EB',
        bodyTextColor: '#1E293B',
        linkColor: '#1E3A8A',
        buttonColor: '#1E3A8A',
        layout: 'standard',
        sectionTitles: ['칸반 보드', '신규 요청', '보관함'],
        sectionColumns: [4, 2, 3],
        sectionContentTypes: [['text', 'text']],
      },
      navigation: {
        pageStructure: [
          { name: '칸반 보드', route: '/board', purpose: '4개 상태(요청/검토/승인/보류) 시각적 카드 뷰' },
          { name: '신규 요청', route: '/new-request', purpose: '기안서 작성 및 첨부 메모 등록' },
          { name: '승인 보관함', route: '/archive', purpose: '완료된 결재 내역 보관 및 감사용 조회' }
        ],
        menus: ['칸반보드', '신규요청', '보관함']
      }
    },
    formInputs: {
      'project_name': '스마트 워크플로우 결재 칸반',
      'target_user': '부서 간 업무 협조 및 결재가 잦은 직장인',
      'pain_point': '슬랙이나 카톡으로 업무를 던져두면 누가 뭘 하고 있는지 추적 불가',
      'core_value': '시각적인 4단계 칸반으로 업무 병목과 승인 현황을 투명하게 공개',
      'feature_list': '칸반 컬럼, 업무 카드 추가, 원클릭 상태 전환, 긴급도 필터',
      'data_schema': '문서번호, 제목, 기안자/부서, 요청내용, 예상금액, 긴급도, 승인상태',
      'ui_layout': '화면 가득 펼쳐지는 4개 컬럼과 카드형 컴포넌트'
    }
  },
  {
    id: 'inventory-orders',
    category: 'INVENTORY',
    badge: '재고 & 발주 장부',
    name: '매장/창고 스마트 재고 & 발주 관리기',
    subtitle: '유통 매장, 카페/식자재, 제조업 부품 재고 파악',
    description: '안전 재고 미달 시 즉각 경고를 띄우고, 원클릭으로 거래처 발주서를 구성하는 실무자 중심의 재고 관리기',
    targetUser: '매장 점주, 창고 관리자, 자재 담당자',
    keyFeatures: [
      '품목별 현재고 vs 안전재고 실시간 대비표',
      '위험/부족 품목 자동 경고 배지 (재주문 알림)',
      '신규 입고 / 출고 수량 즉시 반영 계산',
      '거래처별 품목 필터링 및 단가 집계'
    ],
    screens: [
      { name: '재고 목록', route: '/stock', purpose: '전체 품목 재고 수량, 단가 및 재고 경고 상태 조회' },
      { name: '입출고 등록', route: '/movement', purpose: '금일 입고량 및 판매/출고량 입력하여 재고 반영' },
      { name: '발주서 생성', route: '/purchase-order', purpose: '안전재고 미달 품목 모아 거래처별 발주서 출력' }
    ],
    themeColor: '#047857',
    accentColor: '#059669',
    platform: 'WEB',
    sampleData: [
      { title: 'A등급 에스프레소 원두 1kg', contact: '로스팅팩토리 (010-4433-2211)', status: '진행중', memo: '현재고 4개 (안전재고 10개 미달! 즉시 발주 필요)', amount: '개당 28,000원', date: '안전재고 미달' },
      { title: '테이크아웃 종이컵 16oz (1000개입)', contact: '신성패키지 (02-888-9999)', status: '완료', memo: '현재고 25박스 (안전재고 5박스, 여유)', amount: '박스당 45,000원', date: '충분' },
      { title: '국산 유기농 멸균 우유 1L (12팩)', contact: '매일유업 대리점', status: '대기', memo: '현재고 8박스 (내일 오전 정기 입고 예정)', amount: '박스당 24,000원', date: '발주대기' },
      { title: '바닐라 시럽 750ml', contact: '모닌 코리아', status: '완료', memo: '현재고 12병 (충분)', amount: '병당 16,500원', date: '충분' }
    ],
    plan: {
      metadata: {
        projectName: '매장/창고 스마트 재고 & 발주 관리기',
        title: '실무형 재고 파악 및 발주 지원 시스템',
        slogan: '품절 걱정 없는 스마트 재고 추적과 원클릭 발주서',
        subtitle: '엑셀보다 10배 빠른 현장 중심 재고 관리 도구',
        description: '바쁜 매장과 창고에서 모바일이나 태블릿으로 간편하게 재고를 체크하고 품절 손실을 원천 방지',
        platform: 'WEB',
        projectMode: 'enterprise',
        projectOverview: {
          targetUrl: 'https://inventory-smart.local',
          purpose: '품절 손실 0% 달성 및 발주서 작성 시간 90% 단축',
          target: '매장 매니저, 물류 창고 관리자, 프랜차이즈 점주',
          kpi: '품절 발생 건수 0건 유지, 월 재고조사 시간 8시간 ➔ 1시간',
          reference: '박스히어로, 노션 재고 템플릿, 이카운트ERP 간소화 버전',
          benchmarkUrl: 'https://boxhero-app.com',
          benchmarkAnalysis: '복잡한 회계 모듈을 버리고 순수 실물 재고와 발주 목록에만 집중',
          toneAndManner: '안정감과 신선함을 주는 에메랄드 포레스트 그린',
          screenList: '재고 현황 테이블, 입출고 기록 모달, 발주서 뷰',
          features: '안전재고 경고 태그, 실시간 합산 수량 계산, 거래처 필터',
          wireframe: '상단 부족재고 알림 배너, 중앙 데이터 테이블, 우측 입출고 폼',
          context: '마감 시간에 태블릿 들고 매장을 돌며 수량을 탭하여 카운팅',
          techStack: 'React + TypeScript + Tailwind CSS',
          schedule: '1주차: 테이블 및 계산 로직 완성, 2주차: 발주서 출력 포맷'
        },
        footerInfo: {
          companyName: '스마트 인벤토리 시스템즈',
          address: '경기도 성남시 분당구 판교역로 100',
          phone: '031-700-1234',
          email: 'support@inventory.local',
          representative: '물류팀장 최재고'
        }
      },
      design: {
        themeColor: '#047857',
        accentColor: '#059669',
        bodyTextColor: '#064E3B',
        linkColor: '#047857',
        buttonColor: '#047857',
        layout: 'standard',
        sectionTitles: ['재고 현황', '입출고 기록', '발주서'],
        sectionColumns: [3, 2, 2],
        sectionContentTypes: [['text', 'text']],
      },
      navigation: {
        pageStructure: [
          { name: '재고 현황', route: '/stock', purpose: '전체 품목 수량, 안전재고 대비 현황 모니터링' },
          { name: '입출고 등록', route: '/movement', purpose: '당일 수량 증감 기록 및 사유 메모' },
          { name: '발주서 생성', route: '/purchase-order', purpose: '부족 품목 자동 집계 및 거래처 발송 양식' }
        ],
        menus: ['재고현황', '입출고등록', '발주서생성']
      }
    },
    formInputs: {
      'project_name': '매장/창고 스마트 재고 & 발주 관리기',
      'target_user': '식자재나 부품 재고를 매일 확인해야 하는 자영업자 및 창고 관리자',
      'pain_point': '바쁜 와중에 엑셀을 켜기 힘들어 머릿속으로 세다가 품절 대란 발생',
      'core_value': '현재고가 안전재고 밑으로 떨어지면 붉은 경고를 띄워 발주 누락 방지',
      'feature_list': '재고 테이블, 부족 품목 필터, 입출고 수량 입력창, 발주 견적 합산',
      'data_schema': '품목코드, 품목명, 카테고리, 현재고, 안전재고, 단가, 거래처명',
      'ui_layout': '한눈에 들어오는 데이터 그리드와 상단 경고 카운트 배지'
    }
  },
  {
    id: 'estimate-lead',
    category: 'ESTIMATE',
    badge: '견적 & 상담신청',
    name: '1인 전문가 실시간 견적서 & 상담 접수처',
    subtitle: '프리랜서, 인테리어, 전문직, 맞춤 제작 서비스',
    description: '고객이 원하는 옵션을 선택하면 실시간으로 예상 견적이 산출되고 즉시 상담 리드로 이어지는 고전환율 웹/앱',
    targetUser: '디자이너, 개발자, 인테리어 시공업체, 세무사, 전문 컨설턴트',
    keyFeatures: [
      '항목별 옵션 선택 시 실시간 자동 합산 견적기',
      '고객 인적사항 및 상담 희망일 원클릭 제출',
      '관리자용 접수 리드 목록 및 진행상태 관리',
      '견적서 서식 즉시 인쇄 및 PDF 저장'
    ],
    screens: [
      { name: '견적 시뮬레이터', route: '/calculator', purpose: '고객이 서비스 범위와 옵션을 선택하며 견적 실시간 확인' },
      { name: '상담 신청서', route: '/apply', purpose: '예상 견적 확인 후 상세 요구사항과 연락처 제출' },
      { name: '상담 리드 관리', route: '/admin-leads', purpose: '접수된 문의 내역 확인 및 상담 상태(신규/상담중/계약체결) 관리' }
    ],
    themeColor: '#D97706',
    accentColor: '#B45309',
    platform: 'APP',
    sampleData: [
      { title: '모바일 반응형 웹사이트 제작 (기본형 5페이지)', contact: '스타트업 김대표 (010-5544-3322)', status: '진행중', memo: '포트폴리오 스타일, 결제 연동 포함 희망', amount: '2,800,000원', date: '어제 접수' },
      { title: '브랜드 로고 및 패키지 디자인 턴키', contact: '베이커리 박점주 (010-7766-5544)', status: '완료', memo: '1차 시안 발송 완료, 피드백 대기', amount: '1,500,000원', date: '3일 전' },
      { title: '사내 업무 자동화 파이썬 스크립트 개발', contact: '물류회사 최과장 (010-1122-3344)', status: '대기', memo: '엑셀 데이터 정리 및 자동 이메일 발송 요구', amount: '900,000원', date: '오늘 접수' }
    ],
    plan: {
      metadata: {
        projectName: '1인 전문가 실시간 견적서 & 상담 접수처',
        title: '고전환율 견적 산출 및 고객 상담 리드 시스템',
        slogan: '전화 상담 전에 견적을 바로 확인하는 투명한 리드 창구',
        subtitle: '1인 메이커와 프리랜서를 위한 자동화 상담 수주 툴',
        description: '반복되는 가격 문의 전화를 줄이고, 진성 고객만 필터링하여 계약 성공률을 3배 높이는 솔루션',
        platform: 'APP',
        projectMode: 'personal',
        projectOverview: {
          targetUrl: 'https://estimate-maker.local',
          purpose: '단순 가격 문의 응대 시간 80% 절감 및 수주 성공률 극대화',
          target: '프리랜서, 1인 사업가, 외주 개발사, 인테리어 시공 전문가',
          kpi: '웹 방문자 상담 전환율 15% 달성, 평균 견적 발송 시간 5분 미만',
          reference: '숨고, 크몽 간편 견적, 해외 Typeform + Stripe 계산기',
          benchmarkUrl: 'https://typeform.com',
          benchmarkAnalysis: '지루한 문의 게시판 대신 즉각 숫자가 계산되는 인터랙티브 경험 제공',
          toneAndManner: '전문적이고 활기찬 웜 앰버 골드 톤',
          screenList: '견적 시뮬레이터, 간편 신청 폼, 관리자 리드 보드',
          features: '체크박스 단가 실시간 가산, 문의 내역 로컬 수집, 전화걸기 링크',
          wireframe: '모바일 앱 형태의 심플 카드 UI, 하단 고정 예상 합계 및 신청 버튼',
          context: '고객이 스마트폰으로 항목을 체크하면 하단에 총액이 즉각 업데이트',
          techStack: 'React + TypeScript + Tailwind CSS (Mobile-First)',
          schedule: '1주차: 옵션 계산 로직 구현, 2주차: 관리자 접수 장부 완성'
        },
        footerInfo: {
          companyName: '디지털 메이커스 스튜디오',
          address: '서울시 마포구 양화로 45',
          phone: '010-9999-8888',
          email: 'hello@makers.local',
          representative: '대표 크리에이터 이메이커'
        }
      },
      design: {
        themeColor: '#D97706',
        accentColor: '#B45309',
        bodyTextColor: '#1C1917',
        linkColor: '#D97706',
        buttonColor: '#D97706',
        layout: 'standard',
        sectionTitles: ['견적 계산기', '상담 신청', '접수 리드'],
        sectionColumns: [2, 1, 3],
        sectionContentTypes: [['text', 'text']],
      },
      navigation: {
        pageStructure: [
          { name: '견적 시뮬레이터', route: '/calculator', purpose: '서비스 범위 및 선택 옵션별 실시간 금액 계산' },
          { name: '상담 신청서', route: '/apply', purpose: '고객 연락처 및 상세 프로젝트 요구 접수' },
          { name: '상담 리드 관리', route: '/admin-leads', purpose: '접수된 잠재 고객 문의 및 수주 현황 추적' }
        ],
        menus: ['견적계산', '상담신청', '관리자장부']
      }
    },
    formInputs: {
      'project_name': '1인 전문가 실시간 견적서 & 상담 접수처',
      'target_user': '매번 일일이 견적서를 수기로 작성하느라 시간이 부족한 1인 사업자',
      'pain_point': '고객들이 "얼마예요?"만 묻고 떠나버려 상담 시간이 낭비됨',
      'core_value': '투명한 실시간 자동 계산기로 가격을 미리 보여주고 진성 고객만 확보',
      'feature_list': '옵션별 가격 체크박스, 실시간 합산 바, 연락처 전송 폼, 접수함',
      'data_schema': '견적번호, 신청자명, 연락처, 선택항목목록, 총견적액, 진행상태',
      'ui_layout': '모바일 화면에 최적화된 직관적 스텝 바이 스텝 카드 뷰'
    }
  }
];

/**
 * Convert user's raw text idea into a structured standard plan.
 */
export function parseRawIdeaToStandardPlan(rawText: string): StandardPrdTemplate {
  const text = rawText.toLowerCase();

  // Match best template based on keywords
  if (text.includes('예약') || text.includes('병원') || text.includes('진료') || text.includes('환자') || text.includes('고객') || text.includes('상담') || text.includes('클리닉') || text.includes('미용')) {
    return STANDARD_PRD_TEMPLATES[0]; // Vet reservation
  }
  if (text.includes('결재') || text.includes('칸반') || text.includes('업무') || text.includes('요청') || text.includes('승인') || text.includes('티켓') || text.includes('팀') || text.includes('품의')) {
    return STANDARD_PRD_TEMPLATES[1]; // Workflow Kanban
  }
  if (text.includes('재고') || text.includes('발주') || text.includes('창고') || text.includes('매장') || text.includes('품목') || text.includes('카페') || text.includes('입고') || text.includes('출고')) {
    return STANDARD_PRD_TEMPLATES[2]; // Inventory
  }
  if (text.includes('견적') || text.includes('계산') || text.includes('단가') || text.includes('1인') || text.includes('프리랜서') || text.includes('문의') || text.includes('외주')) {
    return STANDARD_PRD_TEMPLATES[3]; // Estimate
  }

  // Default fallback to Reservation template
  return STANDARD_PRD_TEMPLATES[0];
}
