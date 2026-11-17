import React from 'react';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTable,
  LEGAL_NAV_TABS,
} from '../layout/EditorialPageLayout';

export default function PrivacyPolicy() {
  return (
    <EditorialPageLayout
      category="POLICY · PRIVACY & LOCAL-FIRST"
      title="개인정보처리방침"
      subtitle="고구마(GOGUMA)는 중앙 서버로 개인정보를 수집·전송하지 않는 100% Local-First 아키텍처를 원칙으로 합니다."
      tabs={LEGAL_NAV_TABS}
      activeTabId="privacy"
    >
      {/* Core Local-First Declaration */}
      <div className="p-5 bg-[#F6F5F1] border-l-4 border-l-[#000000] border border-[#E4E2DC] space-y-1.5">
        <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#000000]">
          NO DATA COLLECTION · 100% LOCAL-FIRST GUARANTEE
        </div>
        <p className="text-[13px] text-[#2B2B29] leading-relaxed">
          고구마(GOGUMA)는 무료 오픈소스 소프트웨어로서 중앙 데이터베이스에 사용자의 개인정보, 결제 및 금융 내역, 기획 데이터를 일체 수집·저장하지 않습니다. 모든 작성 데이터와 설정값은 오직 사용자 기기의 브라우저 로컬 저장소(IndexedDB / LocalStorage)에만 보관됩니다.
        </p>
      </div>

      <EditorialSection chapter="제1조 (개인정보 비수집 및 로컬 처리 원칙)">
        <p>
          한국센터글로벌네트워크 지식관리실 고구마앱팀(이하 "팀")은 이용자의 정보 주권을 최우선으로 보호하기 위해 서버 비수집(Zero Server Collection) 설계를 채택합니다.
        </p>
        <EditorialTable
          headers={['구분', '처리 항목', '보관 위치 및 외부 전송 여부', '파기 방법']}
          rows={[
            [
              '기획서 및 아키텍처 데이터',
              '프로젝트 제목, 챕터 원고, 사이트맵, 데이터 스키마, 화면 정의서',
              '사용자 브라우저 로컬 저장소(IndexedDB / LocalStorage) 보관 · 중앙 서버 전송 없음',
              '보관함 내 초기화 또는 브라우저 캐시 삭제 시 즉시 영구 파기',
            ],
            [
              '로컬 작업자 프로필 (선택)',
              '표시 이름, 이메일(선택), 소속/팀명(선택), 로컬 PIN(선택)',
              '사용자 브라우저 로컬 저장소(LocalStorage) 전용 · 외부 인증 서버 미전송',
              '프로필 삭제 또는 로그아웃/초기화 시 즉시 삭제',
            ],
            [
              'AI 연동 키 (선택 BYOK)',
              '사용자 개인 Google Gemini API 키 또는 로컬 Ollama 주소',
              '브라우저 로컬 저장 후 사용자가 직접 호출한 추론 엔드포인트로만 직접 전송',
              '환경 설정에서 삭제 시 즉시 소멸',
            ],
            [
              '결제·금융·수입 정보',
              '신용카드 번호, 계좌정보, 결제 및 정산 기록',
              '일체 수집 및 처리하지 않음 (100% 무료 소프트웨어)',
              '해당 없음',
            ],
          ]}
        />
      </EditorialSection>

      <EditorialSection chapter="제2조 (개인정보의 처리 및 보유 기간)">
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>팀은 이용자의 개인정보 및 기획 문서를 원격 중앙 데이터베이스에 보유하지 않습니다.</li>
          <li>모든 작업 기록은 이용자가 브라우저 로컬 저장소에서 직접 삭제하거나 캐시를 비우기 전까지 이용자 기기 내부에만 안전하게 유지됩니다.</li>
          <li>유료 결제나 상업적 거래가 발생하지 않으므로 전자상거래법상 대금결제 및 공급 기록 보관 의무 대상 정보가 존재하지 않습니다.</li>
        </ol>
      </EditorialSection>

      <EditorialSection chapter="제3조 (제3자 제공 및 AI 추론 연동 안내)">
        <p>
          팀은 이용자의 데이터를 어떠한 경우에도 제3자에게 판매하거나 광고·마케팅 목적으로 제공하지 않습니다. 단, 이용자가 인공지능 보조 기능을 직접 실행하는 경우 선택한 실행 계층에 따라 다음과 같이 처리됩니다.
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong>로컬 Ollama 및 브라우저 내장 WebLLM:</strong> 외부 네트워크 통신 없이 이용자 기기 내부에서만 100% 오프라인으로 추론됩니다.
          </li>
          <li>
            <strong>Google Gemini API (BYOK / 프록시):</strong> 이용자가 AI 초안 생성을 직접 요청한 텍스트에 한해 TLS 1.3 암호화 구간을 통해 Google Gemini 엔드포인트로 전달되며, API 정책에 따라 모델 재학습에 사용되지 않습니다.
          </li>
        </ul>
      </EditorialSection>

      <EditorialSection chapter="제4조 (정보주체의 권리 및 데이터 주권 행사)">
        <p>
          이용자는 언제든지 [보관함 및 로컬 백업] 페이지에서 전체 프로젝트 데이터를 표준 JSON 또는 11종 마크다운 ZIP 번들로 내보낼 수 있으며, 원클릭 데이터 초기화를 통해 기기 내 모든 흔적을 즉시 삭제할 수 있습니다.
        </p>
      </EditorialSection>

      <EditorialSection chapter="제5조 (개인정보 보호 문의처)">
        <EditorialTable
          headers={['항목', '세부 정보']}
          rows={[
            ['운영 조직', '한국센터글로벌네트워크 지식관리실 고구마앱팀'],
            ['주소', '경기도 부천시 원미구 역곡로 19번길 108동 803호'],
            ['사업자등록번호 / 통신판매업', '141-82-83410 · 제2025-부천원미-1090호'],
            ['문의 이메일', 'master@goguma.app'],
          ]}
        />
      </EditorialSection>
    </EditorialPageLayout>
  );
}
