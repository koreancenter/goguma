import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTable,
  getLegalNavTabs,
} from '../layout/EditorialPageLayout';

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
  const { language, pick } = useLanguage();
  const [copied, setCopied] = useState(false);
  const legalTabs = getLegalNavTabs(language);

  const openSourceStack = [
    ['React & React DOM', '19.x', pick({ ko: 'UI 컴포넌트 및 상태 렌더링 엔진', en: 'UI components & state rendering engine', ja: 'UIコンポーネント・状態レンダリング', id: 'Komponen UI & mesin rendering' }), 'MIT'],
    ['TypeScript', '5.8.x', pick({ ko: '정적 타입 안전성 및 도메인 스키마 모델링', en: 'Static type safety & domain schema modeling', ja: '静的型安全性とドメインスキーマ定義', id: 'Keamanan tipe statis & skema domain' }), 'Apache-2.0'],
    ['Vite', '6.x', pick({ ko: '초고속 모듈 번들러 및 개발 서버', en: 'High-speed module bundler & dev server', ja: '高速モジュールバンドラ・開発サーバー', id: 'Bundler modul cepat & dev server' }), 'MIT'],
    ['Tailwind CSS', '4.1.x', pick({ ko: '에디토리얼 유틸리티 스타일링 시스템', en: 'Editorial utility CSS styling system', ja: 'ユーティリティCSSスタイリング体系', id: 'Sistem gaya utilitas CSS editorial' }), 'MIT'],
    ['TipTap & ProseMirror', '3.x', pick({ ko: '리치 텍스트 기획서 에디터 코어', en: 'Rich-text PRD canvas editor core', ja: 'リッチテキスト仕様書エディタコア', id: 'Inti editor teks kaya untuk PRD' }), 'MIT'],
    ['CodeMirror', '4.x / 6.x', pick({ ko: 'HTML·JavaScript 사양서 코드 뷰어', en: 'HTML & TypeScript spec code editor', ja: 'HTML・TypeScript仕様コードエディタ', id: 'Editor kode spesifikasi HTML & TS' }), 'MIT'],
    ['Lucide React', '0.546.x', pick({ ko: '미니멀 벡터 아이콘 라이브러리', en: 'Minimalist vector icon library', ja: 'ミニマルベクターアイコン集', id: 'Pustaka ikon vektor minimalis' }), 'ISC'],
    ['D3.js & Recharts', '7.x / 3.x', pick({ ko: '정보구조 및 데이터 시각화 차트', en: 'Information architecture & chart graphs', ja: '情報設計ツリー＆データ可視化', id: 'Visualisasi pohon arsitektur & grafik' }), 'ISC / MIT'],
    ['dnd-kit', '6.x / 10.x', pick({ ko: '접근성 기반 드래그 앤 드롭 정렬', en: 'Accessible drag-and-drop sorting', ja: 'アクセシブルなドラッグ＆ドロップ', id: 'Pengurutan seret & lepas aksesibel' }), 'MIT'],
    ['Motion', '12.x', pick({ ko: '인터페이스 전환 모션 엔진', en: 'Interface transition animation engine', ja: 'UIトランジションモーション', id: 'Mesin animasi transisi antarmuka' }), 'MIT'],
    ['react-markdown & remark-gfm', '10.x / 4.x', pick({ ko: '마크다운 및 GFM 사양서 파서', en: 'Markdown & GFM specification parser', ja: 'Markdown & GFM仕様書パーサー', id: 'Pengurai spesifikasi Markdown & GFM' }), 'MIT'],
    ['react-router-dom', '7.x', pick({ ko: '클라이언트 사이드 라우팅', en: 'Client-side SPA routing', ja: 'クライアントサイドルーティング', id: 'Perutean SPA sisi klien' }), 'MIT'],
    ['JSZip & js-beautify', '3.x / 1.x', pick({ ko: '11종 사양서 ZIP 번들 패키징 및 포맷터', en: '11-spec ZIP bundling & code formatter', ja: '11種仕様書ZIP出力＆コード整形', id: 'Pengemasan ZIP 11 spek & pemformat kode' }), 'MIT'],
    ['Express', '4.x', pick({ ko: '로컬 프록시 및 서버 어댑터', en: 'Local proxy & server adapter', ja: 'ローカルプロキシ＆サーバー', id: 'Proksi lokal & adaptor server' }), 'MIT'],
    ['@google/genai', '1.x', pick({ ko: 'Google Gemini API 추론 SDK (선택 BYOK)', en: 'Google Gemini API inference SDK (optional BYOK)', ja: 'Google Gemini 推論SDK（任意BYOK）', id: 'SDK inferensi Google Gemini (BYOK opsional)' }), 'Apache-2.0'],
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(MIT_LICENSE_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <EditorialPageLayout
      category="LEGAL · MIT OPEN SOURCE & TECH STACK"
      title={pick({ ko: '오픈소스 라이선스', en: 'Open Source License', ja: 'オープンソースライセンス', id: 'Lisensi Sumber Terbuka' })}
      subtitle={pick({
        ko: '고구마(GOGUMA)는 MIT 라이선스로 배포되며, 아래 검증된 오픈소스 소프트웨어 스택을 기반으로 구축되었습니다.',
        en: 'GOGUMA is distributed under the MIT License and built on the proven open-source stack below.',
        ja: 'GOGUMAはMITライセンスで公開されており、以下の実績あるオープンソーススタック上に構築されています。',
        id: 'GOGUMA didistribusikan di bawah Lisensi MIT dan dibangun menggunakan tumpukan sumber terbuka berikut.',
      })}
      tabs={legalTabs}
      activeTabId="license"
    >
      <EditorialSection chapter={pick({ ko: '제1조 (고구마앱 사용 오픈소스 기술 스택 고지)', en: 'Article 1 · Open Source Stack Notice', ja: '第1条（利用オープンソース技術スタック）', id: 'Pasal 1 · Pemberitahuan Tumpukan Sumber Terbuka' })}>
        <p>
          {pick({
            ko: '고구마 스튜디오(GOGUMA)의 클라이언트 사이드 엔진, 마크다운 사양서 컴파일러 및 실시간 프로토타입 렌더러에 사용된 주요 오픈소스 패키지와 라이선스는 다음과 같습니다.',
            en: 'The core open-source packages powering GOGUMA’s client-side engine, Markdown spec compiler, and live prototype renderer include:',
            ja: 'GOGUMAスタジオのクライアントエンジン、Markdown仕様書コンパイラ、リアルタイムプロトタイプ機能に使用されている主なオープンソースパッケージは以下の通りです。',
            id: 'Paket sumber terbuka utama yang menggerakkan mesin sisi klien GOGUMA, kompiler spesifikasi Markdown, dan penyaji prototipe langsung meliputi:',
          })}
        </p>
        <EditorialTable
          headers={[
            pick({ ko: '패키지명', en: 'Package', ja: 'パッケージ', id: 'Paket' }),
            pick({ ko: '버전', en: 'Version', ja: 'バージョン', id: 'Versi' }),
            pick({ ko: '역할 및 적용 영역', en: 'Role & Scope', ja: '役割・適用範囲', id: 'Peran & Cakupan' }),
            pick({ ko: '라이선스', en: 'License', ja: 'ライセンス', id: 'Lisensi' }),
          ]}
          rows={openSourceStack}
        />
      </EditorialSection>

      <EditorialSection chapter={pick({ ko: '제2조 (GOGUMA MIT License 공식 전문)', en: 'Article 2 · GOGUMA Official MIT License Text', ja: '第2条（GOGUMA MITライセンス公式全文）', id: 'Pasal 2 · Teks Resmi Lisensi MIT GOGUMA' })}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
          <p className="text-[18px] sm:text-[19px] text-[var(--theme-ink-secondary)]">
            {pick({
              ko: '누구나 자유롭게 복제, 수정, 배포 및 상업적 프로젝트에 활용할 수 있는 표준 MIT 라이선스 전문입니다.',
              en: 'Standard MIT License text permitting free copying, modification, distribution, and commercial use.',
              ja: '複製・改変・配布・商用プロジェクトへの利用を自由に認める標準MITライセンス全文です。',
              id: 'Teks standar Lisensi MIT yang mengizinkan penyalinan, modifikasi, distribusi, dan penggunaan komersial secara bebas.',
            })}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="px-5 py-3 bg-[var(--theme-btn-bg)] text-[var(--theme-btn-text)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[17px] font-bold rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer shrink-0"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? pick({ ko: '복사 완료', en: 'Copied', ja: 'コピー完了', id: 'Tersalin' }) : pick({ ko: '라이선스 전문 복사', en: 'Copy License Text', ja: 'ライセンス全文をコピー', id: 'Salin Teks Lisensi' })}</span>
          </button>
        </div>

        <pre className="p-8 sm:p-10 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] text-[17px] sm:text-[18px] font-mono leading-[1.85] text-[var(--theme-ink-primary)] overflow-x-auto select-text">
          {MIT_LICENSE_TEXT}
        </pre>
      </EditorialSection>
    </EditorialPageLayout>
  );
}
