import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTable,
  LEGAL_NAV_TABS,
} from '../layout/EditorialPageLayout';

const GOGUMA_OPEN_SOURCE_STACK = [
  ['React & React DOM', '19.x', 'UI 컴포넌트 및 상태 렌더링 엔진', 'MIT'],
  ['TypeScript', '5.8.x', '정적 타입 안전성 및 도메인 스키마 모델링', 'Apache-2.0'],
  ['Vite', '6.x', '초고속 모듈 번들러 및 개발 서버', 'MIT'],
  ['Tailwind CSS', '4.1.x', '에디토리얼 유틸리티 스타일링 시스템', 'MIT'],
  ['TipTap & ProseMirror', '3.x', '리치 텍스트 기획서 에디터 코어', 'MIT'],
  ['CodeMirror', '4.x / 6.x', 'HTML·JavaScript 사양서 코드 뷰어', 'MIT'],
  ['Lucide React', '0.546.x', '미니멀 벡터 아이콘 라이브러리', 'ISC'],
  ['D3.js & Recharts', '7.x / 3.x', '정보구조 및 데이터 시각화 차트', 'ISC / MIT'],
  ['dnd-kit', '6.x / 10.x', '접근성 기반 드래그 앤 드롭 정렬', 'MIT'],
  ['Motion', '12.x', '인터페이스 전환 모션 엔진', 'MIT'],
  ['react-markdown & remark-gfm', '10.x / 4.x', '마크다운 및 GFM 사양서 파서', 'MIT'],
  ['react-router-dom', '7.x', '클라이언트 사이드 라우팅', 'MIT'],
  ['JSZip & js-beautify', '3.x / 1.x', '11종 사양서 ZIP 번들 패키징 및 포맷터', 'MIT'],
  ['Express', '4.x', '로컬 프록시 및 서버 어댑터', 'MIT'],
  ['@google/genai', '1.x', 'Google Gemini API 추론 SDK (선택 BYOK)', 'Apache-2.0'],
];

const MIT_LICENSE_TEXT = `MIT License

Copyright (c) 2026 Korean Center Global Network · GOGUMA App Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

export default function OpenSourceLicensePage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(MIT_LICENSE_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <EditorialPageLayout
      category="LEGAL · MIT OPEN SOURCE & TECH STACK"
      title="오픈소스 라이선스"
      subtitle="고구마(GOGUMA)는 MIT 라이선스로 배포되며, 아래 검증된 오픈소스 소프트웨어 스택을 기반으로 구축되었습니다."
      tabs={LEGAL_NAV_TABS}
      activeTabId="license"
    >
      <EditorialSection chapter="제1조 (고구마앱 사용 오픈소스 기술 스택 고지)">
        <p>
          고구마 스튜디오(GOGUMA)의 클라이언트 사이드 엔진, 마크다운 사양서 컴파일러 및 실시간 프로토타입 렌더러에 사용된 주요 오픈소스 패키지와 라이선스는 다음과 같습니다.
        </p>
        <EditorialTable
          headers={['패키지명', '버전', '역할 및 적용 영역', '라이선스']}
          rows={GOGUMA_OPEN_SOURCE_STACK}
        />
      </EditorialSection>

      <EditorialSection chapter="제2조 (GOGUMA MIT License 공식 전문)">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
          <p className="text-[18px] sm:text-[19px] text-[#52524E]">
            누구나 자유롭게 복제, 수정, 배포 및 상업적 프로젝트에 활용할 수 있는 표준 MIT 라이선스 전문입니다.
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="px-5 py-3 bg-[#000000] text-[#FFFFFF] hover:bg-[#DC2626] hover:text-[#FFE600] text-[17px] font-bold rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer shrink-0"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? '복사 완료' : '라이선스 전문 복사'}</span>
          </button>
        </div>

        <pre className="p-8 sm:p-10 bg-[#F6F5F1] border border-[#E4E2DC] text-[17px] sm:text-[18px] font-mono leading-[1.85] text-[#111111] overflow-x-auto select-text">
          {MIT_LICENSE_TEXT}
        </pre>
      </EditorialSection>
    </EditorialPageLayout>
  );
}
