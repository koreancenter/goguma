import React from 'react';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTable,
  LEGAL_NAV_TABS,
} from '../layout/EditorialPageLayout';

export default function AIPolicyPage() {
  return (
    <EditorialPageLayout
      category="POLICY · ARTIFICIAL INTELLIGENCE"
      title="인공지능 정책"
      subtitle="고구마(GOGUMA) 스튜디오의 인공지능 추론 계층, 모델 학습 배제(Zero-Training) 원칙 및 사용자 통제권을 명시합니다."
      tabs={LEGAL_NAV_TABS}
      activeTabId="ai-policy"
    >
      <EditorialSection chapter="제1조 (인공지능 활용 기본 원칙)">
        <p>
          고구마(GOGUMA)는 기획자의 사고를 대체하는 자동화 도구가 아니라, 로컬 우선 작업 흐름 위에서 사양서 초안 작성과 구조 검증을 보조하는 투명한 인공지능 지원 정책을 따릅니다. 모든 AI 실행 여부는 전적으로 이용자의 명시적 호출에 의해서만 동작합니다.
        </p>
      </EditorialSection>

      <EditorialSection chapter="제2조 (3계층 하이브리드 추론 아키텍처 비교)">
        <p>
          이용자는 [환경 설정 &gt; 인공지능 엔진] 페이지에서 작업 보안 수준과 환경에 맞는 추론 계층을 자유롭게 선택할 수 있습니다.
        </p>
        <EditorialTable
          headers={['구분', '처리 위치', '모델 재학습 활용 여부', '키·인증 방식', '오프라인 지원']}
          rows={[
            [
              'Google Gemini (BYOK / 프록시)',
              'Google Cloud Gemini API 엔드포인트',
              '활용 안 함 (Zero-Training 원칙 준수)',
              '이용자 개인 API 키 로컬 보관 (선택 사항)',
              '미지원 (온라인 추론)',
            ],
            [
              'Ollama Local Server',
              '이용자 PC 로컬 데몬 (localhost:11434)',
              '외부 전송 자체가 없음',
              '불필요 (로컬 포트 직결)',
              '100% 완전 오프라인 지원',
            ],
            [
              'WebLLM (In-Browser WebGPU)',
              '브라우저 WebGPU 샌드박스 내부',
              '외부 전송 자체가 없음',
              '불필요 (브라우저 내장 가속)',
              '모델 캐싱 후 오프라인 지원',
            ],
          ]}
        />
      </EditorialSection>

      <EditorialSection chapter="제3조 (모델 재학습 배제 및 프롬프트 보안)">
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>이용자가 작성한 기획서 원고, 시스템 스키마 및 API 키는 중앙 서버에 영구 저장되거나 공용 AI 모델 재학습 데이터셋으로 활용되지 않습니다.</li>
          <li>개인 BYOK Gemini API 키는 브라우저 로컬 저장소에만 보관되며, 추론 요청 시 TLS 1.3 암호화 구간을 통해 전달됩니다.</li>
        </ol>
      </EditorialSection>

      <EditorialSection chapter="제4조 (생성 결과의 검수 및 책임)">
        <p>
          AI가 제안한 초안, 요구사항 명세 및 아키텍처 코드는 기획 보조 자료로 제공됩니다. 최종 사양서 확정(Lock Spec) 및 실무 배포에 앞서 이용자가 직접 내용을 검토하고 편집할 수 있으며, 확정된 산출물에 대한 통제권과 최종 승인 권한은 100% 이용자에게 있습니다.
        </p>
      </EditorialSection>
    </EditorialPageLayout>
  );
}
