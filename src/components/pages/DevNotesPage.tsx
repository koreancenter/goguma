import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTable,
  EditorialTabItem,
} from '../classic/layout/EditorialPageLayout';

export default function DevNotesPage() {
  const navigate = useNavigate();

  const quickTabs: EditorialTabItem[] = [
    { id: 'dev-notes', label: '개발자 노트', to: '/dev-notes' },
    { id: 'blog', label: '고구마 블로그', to: '/blog' },
    { id: 'license', label: '오픈소스 라이선스', to: '/license' },
    { id: 'support', label: '도움말 및 가이드', to: '/support' },
  ];

  return (
    <EditorialPageLayout
      category="ENGINEERING · RELEASE & ARCHITECTURE NOTES"
      title="개발자 노트"
      subtitle="고구마(GOGUMA) 스튜디오의 버전별 업데이트 내역, 로컬 우선 런타임 구조 및 기술 사양 변경 이력을 기록합니다."
      tabs={quickTabs}
      activeTabId="dev-notes"
      headerActions={
        <button
          type="button"
          onClick={() => navigate('/workspace')}
          className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] text-[17px] font-bold rounded-none transition-colors cursor-pointer whitespace-nowrap"
        >
          <span>작업실 입장</span>
          <ArrowRight size={17} />
        </button>
      }
    >
      <EditorialSection chapter="v2.1 · 에디토리얼 내비게이션 및 풀페이지 아키텍처 통합">
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>페이지 전용 상단 메뉴 최적화:</strong> 작업실 외 페이지 경로에서는 [블로그], [환경 설정], [도움말], [작업실 입장] 4개 핵심 내비게이션을 우측 정렬로 배치하고, [도움말] 메뉴에서 모든 정책 문서와 개발자 노트에 즉시 접근할 수 있도록 개편했습니다.
          </li>
          <li>
            <strong>모달에서 에디토리얼 풀페이지로 전환:</strong> 개인정보처리방침, 이용약관, 오픈소스 라이선스, 인공지능 정책, 커뮤니티 이용 규약, 쿠키 정책 및 환경설정/백업/내보내기 화면을 모두 독립 URL 라우트와 에디토리얼 레이아웃으로 재구성했습니다.
          </li>
          <li>
            <strong>공통 세종 푸터 적용:</strong> 모든 페이지 하단에 정책 고지 바, Net-to-Dot 멤버십 표기 및 관련 사이트 셀렉터를 일관되게 배치했습니다.
          </li>
        </ul>
      </EditorialSection>

      <EditorialSection chapter="v2.0 · 11종 사양서 컴파일러 및 샌드박스 프로토타입 엔진">
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>8-Chapter 17-Section 통합 엔진:</strong> 서비스 개요부터 산출물 검수까지 입력된 원고를 단일 <code>SitePlan</code> 상태로 정규화하여 실시간 미리보기와 사양서 문서를 동기화합니다.
          </li>
          <li>
            <strong>11종 개발 산출물 번들 추출:</strong> PRD, 아키텍처 정의서, DB 스키마, API 명세, 디자인 토큰, QA 시나리오, 실행 플레이북을 Markdown / JSON 포맷으로 즉시 추출할 수 있습니다.
          </li>
          <li>
            <strong>인브라우저 프로토타입 컴파일러:</strong> 작성 중인 화면 목록과 내비게이션 구조를 클라이언트 내부에서 즉시 인터랙티브 HTML/SVG 프리뷰로 렌더링합니다.
          </li>
        </ul>
      </EditorialSection>

      <EditorialSection chapter="v1.5 · 100% 로컬 우선 IndexedDB 및 3계층 하이브리드 AI">
        <EditorialTable
          headers={['구분', '구현 모듈', '기술 사양', '비고']}
          rows={[
            [
              '로컬 영속성 계층',
              'IndexedDB Storage',
              '원격 DB 없이 브라우저 내부에 프로젝트·섹션·스냅샷 저장',
              'JSON 전체 백업/복원 지원',
            ],
            [
              '인공지능 추론 계층',
              'Gemini BYOK / Ollama / WebLLM',
              '클라우드 API 키 직결, 로컬 데몬(11434), WebGPU 인브라우저 실행',
              'Zero-Training 원칙 준수',
            ],
            [
              '인증 및 프로필',
              'Local Profile Gateway',
              '기기 단위 로컬 프로필 생성 및 게스트 즉시 입장',
              '외부 계정 연동 불필요',
            ],
            [
              '디자인 시스템',
              'Sumi Ink & Hanji Paper',
              'Tailwind CSS 순수 유틸리티 클래스 기반 0px~2px 각진 레이아웃',
              '무서드파티 UI 라이브러리',
            ],
          ]}
        />
      </EditorialSection>
    </EditorialPageLayout>
  );
}
