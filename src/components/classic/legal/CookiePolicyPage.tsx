import React from 'react';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTable,
  LEGAL_NAV_TABS,
} from '../layout/EditorialPageLayout';

export default function CookiePolicyPage() {
  return (
    <EditorialPageLayout
      category="POLICY · ZERO COOKIES"
      title="쿠키 정책"
      subtitle="고구마(GOGUMA)는 어떠한 HTTP 쿠키나 외부 추적 스크립트도 생성·수집하지 않는 No Cookies 원칙을 준수합니다."
      tabs={LEGAL_NAV_TABS}
      activeTabId="cookies"
    >
      <div className="p-5 bg-[#F6F5F1] border-l-4 border-l-[#000000] border border-[#E4E2DC] space-y-1.5">
        <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#000000]">
          NO COOKIES · ZERO HTTP TRACKING
        </div>
        <p className="text-[13px] text-[#2B2B29] leading-relaxed">
          고구마(GOGUMA)는 필수 쿠키, 방문자 분석(Google Analytics 등) 쿠키, 광고·마케팅 추적 쿠키를 일체 사용하지 않습니다. 서비스 동작에 필요한 모든 상태는 서버 쿠키가 아닌 사용자 기기 내부의 브라우저 로컬 저장소에만 유지됩니다.
        </p>
      </div>

      <EditorialSection chapter="제1조 (쿠키 및 추적기 미사용 현황)">
        <EditorialTable
          headers={['구분', 'HTTP 쿠키 사용 여부', '대체 로컬 처리 방식', '외부 서버 전송']}
          rows={[
            [
              '필수 기능 유지',
              '미사용 (0 Cookies)',
              '브라우저 LocalStorage / IndexedDB 내 작업 상태 저장',
              '전송 안 함',
            ],
            [
              '방문자 분석 및 통계',
              '미사용 (0 Cookies)',
              'Google Analytics 등 분석 스크립트 일체 비탑재',
              '전송 안 함',
            ],
            [
              '광고 및 마케팅 추적',
              '미사용 (0 Cookies)',
              '타겟팅 픽셀 및 제3자 광고 쿠키 일체 없음',
              '전송 안 함',
            ],
            [
              '언어·가독성·분할 설정',
              '미사용 (0 Cookies)',
              '브라우저 LocalStorage (goguma_language, goguma_large_text 등)',
              '전송 안 함',
            ],
          ]}
        />
      </EditorialSection>

      <EditorialSection chapter="제2조 (브라우저 로컬 저장소 제어 방법)">
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>이용자는 언제든지 웹 브라우저의 사이트 데이터 삭제 기능을 이용하거나 고구마 스튜디오 내 [보관함 및 로컬 백업 &gt; 저장소 진단 &amp; 정리] 페이지에서 모든 로컬 저장 항목을 즉시 삭제할 수 있습니다.</li>
          <li>쿠키 차단이 기본 활성화된 프라이버시 브라우저 및 시크릿 환경에서도 모든 로컬 작성 기능은 정상적으로 동작합니다.</li>
        </ol>
      </EditorialSection>
    </EditorialPageLayout>
  );
}
