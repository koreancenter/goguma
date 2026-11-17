import React from 'react';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTable,
  LEGAL_NAV_TABS,
} from '../layout/EditorialPageLayout';

export default function TermsOfService() {
  return (
    <EditorialPageLayout
      category="POLICY · TERMS OF SERVICE"
      title="이용약관"
      subtitle="고구마(GOGUMA) 스튜디오 서비스 이용 조건, MIT 오픈소스 자유 소프트웨어 권리 및 로컬 데이터 주권을 규정합니다."
      tabs={LEGAL_NAV_TABS}
      activeTabId="terms"
    >
      <EditorialSection chapter="제1장 총칙">
        <EditorialSection title="제1조 (목적)">
          <p>
            본 약관은 한국센터글로벌네트워크 지식관리실 고구마앱팀(이하 "팀")이 제공하는 로컬 우선(Local-First) PRD 및 소프트웨어 사양서 스튜디오 "고구마(GOGUMA)"(이하 "서비스")의 이용 조건 및 절차, 이용자와 팀의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
          </p>
        </EditorialSection>

        <EditorialSection title="제2조 (약관의 효력 및 변경)">
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>본 약관은 서비스 하단 정책 페이지에 상시 게시함으로써 효력이 발생합니다.</li>
            <li>팀은 오픈소스 라이선스(MIT) 및 로컬 우선 아키텍처 원칙을 침해하지 않는 범위에서 관련 법령에 따라 본 약관을 개정할 수 있습니다.</li>
            <li>변경된 약관은 시행일자 및 개정 사유를 명시하여 서비스 내 공지합니다.</li>
          </ol>
        </EditorialSection>

        <EditorialSection title="제3조 (용어의 정의)">
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>"서비스"란 웹 브라우저 환경에서 기획서 집필, 정보구조 설계, 실시간 프로토타입 검증, 11종 개발 사양서 산출을 지원하는 고구마 스튜디오 소프트웨어를 말합니다.</li>
            <li>"이용자"란 별도의 중앙 회원가입이나 유료 결제 없이 로컬 브라우저 세션으로 본 서비스를 이용하는 개인 및 조직을 말합니다.</li>
            <li>"로컬 산출물"이란 이용자가 워크스페이스에서 작성하고 브라우저 IndexedDB 및 LocalStorage에 보관한 모든 기획안과 마크다운/HTML 번들을 말합니다.</li>
          </ol>
        </EditorialSection>
      </EditorialSection>

      <EditorialSection chapter="제2장 서비스 이용 및 무료·오픈소스 원칙">
        <EditorialSection title="제4조 (서비스의 제공 및 비용)">
          <p>
            본 서비스는 MIT 라이선스에 기반한 무료·오픈소스 아키텍처 소프트웨어로, 개인적 목적 및 상업적 프로젝트 모두에 대해 구독 요금이나 사용량 과금 없이 제공됩니다.
          </p>
          <EditorialTable
            headers={['제공 모드', '로컬 단독 모드 (Offline)', '개인 AI 연동 모드 (BYOK)', '로컬 LLM (Ollama / WebLLM)']}
            rows={[
              ['이용 요금', '100% 무료', '100% 무료 (사용자 API 키 직접 연결)', '100% 무료 (기기 내 자체 추론)'],
              ['데이터 보관', '브라우저 IndexedDB / LocalStorage', '브라우저 로컬 보관', '브라우저 로컬 보관'],
              ['원격 서버 전송', '없음', '사용자가 실행한 AI 프롬프트에 한해 직접 호출', '없음 (완전 폐쇄망 지원)'],
              ['산출물 소유권', '이용자 100% 귀속', '이용자 100% 귀속', '이용자 100% 귀속'],
            ]}
          />
        </EditorialSection>

        <EditorialSection title="제5조 (로컬 데이터 주권 및 백업 책임)">
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>서비스에서 생성한 모든 프로젝트 데이터는 외부 중앙 서버에 백업되지 않고 이용자의 웹 브라우저 내부에 저장됩니다.</li>
            <li>이용자는 브라우저 캐시 삭제, 시크릿 모드 종료, 기기 변경에 대비하여 [보관함 및 로컬 백업] 기능을 통해 주기적으로 JSON 또는 ZIP 백업 파일을 내려받아 보관할 수 있습니다.</li>
            <li>이용자의 로컬 환경 초기화 또는 브라우저 데이터 삭제로 인한 데이터 유실에 대하여 팀은 복구 기술 수단을 보유하지 않습니다.</li>
          </ol>
        </EditorialSection>
      </EditorialSection>

      <EditorialSection chapter="제3장 인공지능 추론 및 책임의 한계">
        <EditorialSection title="제6조 (독립 AI 추론 및 저작권)">
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>이용자는 필요에 따라 Google Gemini API 키(BYOK), 로컬 Ollama 서버 또는 브라우저 내장 WebLLM을 선택하여 기획서 초안 및 사양서 작성을 보조받을 수 있습니다.</li>
            <li>이용자가 서비스로 생성·편집한 모든 사양서, 코드 번들, 프로토타입 산출물에 대한 권리는 전적으로 이용자에게 있습니다.</li>
          </ol>
        </EditorialSection>

        <EditorialSection title="제7조 (보증의 부인 및 면책)">
          <p>
            MIT 라이선스 규정에 따라 본 소프트웨어는 상품성, 특정 목적에의 적합성 및 비침해성에 대한 묵시적 보증을 포함하여 어떠한 명시적 또는 묵시적 보증 없이 "있는 그대로(AS-IS)" 제공됩니다.
          </p>
        </EditorialSection>
      </EditorialSection>

      <EditorialSection chapter="부칙">
        <p className="text-[18px] sm:text-[19px] text-[#52524E]">
          1. 본 약관은 2026년 1월 1일부터 시행합니다. (최근 개정: 2026년 11월 17일)
        </p>
      </EditorialSection>
    </EditorialPageLayout>
  );
}
