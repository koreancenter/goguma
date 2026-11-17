import React from 'react';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTable,
  LEGAL_NAV_TABS,
} from '../layout/EditorialPageLayout';

export default function CommunityTermsPage() {
  return (
    <EditorialPageLayout
      category="COMMUNITY · OPEN PRINCIPLES"
      title="커뮤니티 이용 규약"
      subtitle="고구마(GOGUMA) 오픈소스 생태계의 로컬 우선 원칙, 상호 존중 기준 및 GitHub 기여 절차를 안내합니다."
      tabs={LEGAL_NAV_TABS}
      activeTabId="community-terms"
    >
      <EditorialSection chapter="제1조 (로컬 우선 및 종속 배제 선언)">
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>고구마 프로젝트의 모든 공식 기여물과 확장 기능은 이용자의 로컬 브라우저 데이터 주권(Local-First)을 침해하지 않아야 합니다.</li>
          <li>외부 유료 구독 강제, 숨겨진 텔레메트리 트래커 삽입, 무단 데이터 수집 코드 삽입은 커뮤니티 원칙에 위배되며 허용되지 않습니다.</li>
        </ol>
      </EditorialSection>

      <EditorialSection chapter="제2조 (오픈소스 기여 및 소통 채널)">
        <EditorialTable
          headers={['구분', '참여 방법 및 기준', '공식 경로']}
          rows={[
            [
              '소스코드 및 템플릿 기여',
              'MIT 라이선스 호환 Pull Request 제출 · 표준 기획서 템플릿 제안',
              'https://github.com/koreancenter/goguma.git',
            ],
            [
              '버그 제보 및 기능 요청',
              '재현 절차 및 환경 정보(브라우저/로컬 엔진)를 포함하여 이슈 등록',
              'GitHub Issues · master@goguma.app',
            ],
            [
              '커뮤니티 행동 강령',
              '언어, 경력, 배경에 관계없이 모든 기여자에 대한 상호 존중과 건설적 코드 리뷰 준수',
              '모든 온라인·오프라인 협업 공간 공통 적용',
            ],
          ]}
        />
      </EditorialSection>

      <EditorialSection chapter="제3조 (금지 행위)">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>타인의 지식재산권 또는 오픈소스 라이선스 표기를 무단으로 삭제·도용하여 재배포하는 행위</li>
          <li>악성 스크립트, 추적 픽셀 또는 이용자의 로컬 IndexedDB 데이터를 훼손하는 코드를 유포하는 행위</li>
          <li>커뮤니티 채널 내 비방, 차별적 언행 및 영리 목적의 무단 스팸 게시 행위</li>
        </ul>
      </EditorialSection>
    </EditorialPageLayout>
  );
}
