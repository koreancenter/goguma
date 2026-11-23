import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTable,
  getLegalNavTabs,
} from '../layout/EditorialPageLayout';

export default function TermsOfService() {
  const { language, pick } = useLanguage();
  const legalTabs = getLegalNavTabs(language);

  return (
    <EditorialPageLayout
      category="POLICY · TERMS OF SERVICE"
      title={pick({ ko: '이용약관', en: 'Terms of Service', ja: '利用規約', id: 'Syarat & Ketentuan' })}
      subtitle={pick({
        ko: '고구마(GOGUMA) 스튜디오 서비스 이용 조건, MIT 오픈소스 자유 소프트웨어 권리 및 로컬 데이터 주권을 규정합니다.',
        en: 'Defines usage terms for GOGUMA Studio, MIT open-source freedoms, and local-first data sovereignty.',
        ja: 'GOGUMAスタジオの利用条件、MITオープンソースの権利、およびローカルデータ主権を定めます。',
        id: 'Mengatur ketentuan penggunaan GOGUMA Studio, kebebasan sumber terbuka MIT, dan kedaulatan data lokal.',
      })}
      tabs={legalTabs}
      activeTabId="terms"
    >
      <EditorialSection chapter={pick({ ko: '제1장 총칙', en: 'Chapter 1 · General Provisions', ja: '第1章 総則', id: 'Bab 1 · Ketentuan Umum' })}>
        <EditorialSection title={pick({ ko: '제1조 (목적)', en: 'Article 1 · Purpose', ja: '第1条（目的）', id: 'Pasal 1 · Tujuan' })}>
          <p>
            {pick({
              ko: '본 약관은 한국센터글로벌네트워크 지식관리실 고구마앱팀(이하 "팀")이 제공하는 로컬 우선(Local-First) PRD 및 소프트웨어 사양서 스튜디오 "고구마(GOGUMA)"(이하 "서비스")의 이용 조건 및 절차, 이용자와 팀의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.',
              en: 'These Terms govern the rights, responsibilities, and conditions for using GOGUMA (“Service”), the Local-First PRD and software specification studio provided by Korean Center Global Network GOGUMA App Team (“Team”).',
              ja: '本規約は、Korean Center Global Network 知識管理室 GOGUMA App Team（以下「チーム」）が提供するローカル優先仕様設計スタジオ「GOGUMA」（以下「サービス」）の利用条件および権利義務を定めるものです。',
              id: 'Ketentuan ini mengatur syarat, hak, dan kewajiban dalam menggunakan studio spesifikasi perangkat lunak local-first GOGUMA (“Layanan”) oleh GOGUMA App Team (“Tim”).',
            })}
          </p>
        </EditorialSection>

        <EditorialSection title={pick({ ko: '제2조 (약관의 효력 및 변경)', en: 'Article 2 · Effect & Amendments', ja: '第2条（規約の効力と変更）', id: 'Pasal 2 · Keberlakuan & Perubahan' })}>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>
              {pick({
                ko: '본 약관은 서비스 하단 정책 페이지에 상시 게시함으로써 효력이 발생합니다.',
                en: 'These Terms take effect upon publication on the Service’s footer policy pages.',
                ja: '本規約はサービス下部のポリシーページに常時掲示することで効力を生じます。',
                id: 'Ketentuan ini berlaku sejak dipublikasikan di halaman kebijakan footer Layanan.',
              })}
            </li>
            <li>
              {pick({
                ko: '팀은 오픈소스 라이선스(MIT) 및 로컬 우선 아키텍처 원칙을 침해하지 않는 범위에서 관련 법령에 따라 본 약관을 개정할 수 있습니다.',
                en: 'The Team may amend these Terms in accordance with law without infringing MIT open-source freedoms or local-first architecture.',
                ja: 'チームはMITライセンスおよびローカル優先原則を侵害しない範囲で本規約を改定できるものとします。',
                id: 'Tim dapat mengubah Ketentuan ini sesuai hukum tanpa mengurangi kebebasan lisensi MIT maupun prinsip local-first.',
              })}
            </li>
            <li>
              {pick({
                ko: '변경된 약관은 시행일자 및 개정 사유를 명시하여 서비스 내 공지합니다.',
                en: 'Amendments will be announced in the Service with effective dates and reasons.',
                ja: '改定後の規約は施行日および改定理由を明示してサービス内に掲示します。',
                id: 'Perubahan akan diumumkan di dalam Layanan beserta tanggal berlaku dan alasannya.',
              })}
            </li>
          </ol>
        </EditorialSection>

        <EditorialSection title={pick({ ko: '제3조 (용어의 정의)', en: 'Article 3 · Definitions', ja: '第3条（用語の定義）', id: 'Pasal 3 · Definisi' })}>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>
              {pick({
                ko: '"서비스"란 웹 브라우저 환경에서 기획서 집필, 정보구조 설계, 실시간 프로토타입 검증, 11종 개발 사양서 산출을 지원하는 고구마 스튜디오 소프트웨어를 말합니다.',
                en: '“Service” means the GOGUMA Studio web software supporting PRD authoring, information architecture, live prototyping, and 11-spec export.',
                ja: '「サービス」とは、ブラウザ上でPRD執筆、情報設計、ライブプロトタイプ検証、11種仕様書出力を支援するGOGUMAソフトウェアを指します。',
                id: '“Layanan” berarti perangkat lunak web GOGUMA Studio untuk penulisan PRD, arsitektur informasi, pratinjau prototipe, dan ekspor 11 spesifikasi.',
              })}
            </li>
            <li>
              {pick({
                ko: '"이용자"란 별도의 중앙 회원가입이나 유료 결제 없이 로컬 브라우저 세션으로 본 서비스를 이용하는 개인 및 조직을 말합니다.',
                en: '“User” means any individual or organization using the Service via local browser sessions without central registration or payment.',
                ja: '「ユーザー」とは、中央登録や課金なしにローカルセッションで本サービスを利用する個人・法人を指します。',
                id: '“Pengguna” berarti individu atau organisasi yang memakai Layanan lewat sesi browser lokal tanpa pendaftaran pusat atau biaya.',
              })}
            </li>
            <li>
              {pick({
                ko: '"로컬 산출물"이란 이용자가 워크스페이스에서 작성하고 브라우저 IndexedDB 및 LocalStorage에 보관한 모든 기획안과 마크다운/HTML 번들을 말합니다.',
                en: '“Local Artifacts” means all drafts, Markdown specs, and HTML bundles stored in IndexedDB and LocalStorage.',
                ja: '「ローカル成果物」とは、ユーザーが作成しIndexedDBおよびLocalStorageに保存した全企画書・Markdown/HTMLバンドルを指します。',
                id: '“Artefak Lokal” berarti semua draf, spesifikasi Markdown, dan bundel HTML yang tersimpan di IndexedDB dan LocalStorage.',
              })}
            </li>
          </ol>
        </EditorialSection>
      </EditorialSection>

      <EditorialSection chapter={pick({ ko: '제2장 서비스 이용 및 무료·오픈소스 원칙', en: 'Chapter 2 · Usage & Free Open-Source Principles', ja: '第2章 サービス利用および無料・オープンソース原則', id: 'Bab 2 · Penggunaan & Prinsip Sumber Terbuka Gratis' })}>
        <EditorialSection title={pick({ ko: '제4조 (서비스의 제공 및 비용)', en: 'Article 4 · Service Delivery & Zero Fees', ja: '第4条（サービスの提供と料金）', id: 'Pasal 4 · Layanan & Bebas Biaya' })}>
          <p>
            {pick({
              ko: '본 서비스는 MIT 라이선스에 기반한 무료·오픈소스 아키텍처 소프트웨어로, 개인적 목적 및 상업적 프로젝트 모두에 대해 구독 요금이나 사용량 과금 없이 제공됩니다.',
              en: 'This Service is free open-source software under the MIT License, offered for personal and commercial projects with zero subscription or usage fees.',
              ja: '本サービスはMITライセンスに基づく無料オープンソースソフトウェアであり、個人・商用を問わず課金なしで提供されます。',
              id: 'Layanan ini merupakan perangkat lunak sumber terbuka gratis berlisensi MIT untuk proyek pribadi maupun komersial tanpa biaya langganan.',
            })}
          </p>
          <EditorialTable
            headers={[
              pick({ ko: '제공 모드', en: 'Execution Mode', ja: '提供モード', id: 'Mode Eksekusi' }),
              pick({ ko: '로컬 단독 모드 (Offline)', en: 'Standalone Local (Offline)', ja: 'ローカル単独モード', id: 'Lokal Mandiri (Offline)' }),
              pick({ ko: '개인 AI 연동 모드 (BYOK)', en: 'Personal AI (BYOK)', ja: '個人AI連携 (BYOK)', id: 'AI Pribadi (BYOK)' }),
              pick({ ko: '로컬 LLM (Ollama / WebLLM)', en: 'Local LLM (Ollama / WebLLM)', ja: 'ローカルLLM (Ollama / WebLLM)', id: 'LLM Lokal (Ollama / WebLLM)' }),
            ]}
            rows={[
              [
                pick({ ko: '이용 요금', en: 'Cost', ja: '利用料金', id: 'Biaya' }),
                pick({ ko: '100% 무료', en: '100% Free', ja: '100% 無料', id: '100% Gratis' }),
                pick({ ko: '100% 무료 (사용자 API 키 직접 연결)', en: '100% Free (User API key)', ja: '100% 無料（個人APIキー直結）', id: '100% Gratis (Kunci API pribadi)' }),
                pick({ ko: '100% 무료 (기기 내 자체 추론)', en: '100% Free (On-device)', ja: '100% 無料（端末内推論）', id: '100% Gratis (Inferensi lokal)' }),
              ],
              [
                pick({ ko: '데이터 보관', en: 'Storage', ja: 'データ保管', id: 'Penyimpanan' }),
                'Browser IndexedDB / LocalStorage',
                'Browser Local Storage',
                'Browser Local Storage',
              ],
              [
                pick({ ko: '원격 서버 전송', en: 'Remote Transfer', ja: '外部送信', id: 'Transfer Jarak Jauh' }),
                pick({ ko: '없음', en: 'None', ja: 'なし', id: 'Tidak ada' }),
                pick({ ko: '사용자가 실행한 AI 프롬프트에 한해 직접 호출', en: 'User-triggered AI prompts only', ja: '実行したプロンプトのみ直接送信', id: 'Hanya prompt AI yang dipicu pengguna' }),
                pick({ ko: '없음 (완전 폐쇄망 지원)', en: 'None (Air-gapped)', ja: 'なし（完全閉域網対応）', id: 'Tidak ada (Offline penuh)' }),
              ],
              [
                pick({ ko: '산출물 소유권', en: 'Ownership', ja: '成果物権利', id: 'Kepemilikan Hasil' }),
                pick({ ko: '이용자 100% 귀속', en: '100% User-Owned', ja: 'ユーザーに100%帰属', id: '100% Milik Pengguna' }),
                pick({ ko: '이용자 100% 귀속', en: '100% User-Owned', ja: 'ユーザーに100%帰属', id: '100% Milik Pengguna' }),
                pick({ ko: '이용자 100% 귀속', en: '100% User-Owned', ja: 'ユーザーに100%帰属', id: '100% Milik Pengguna' }),
              ],
            ]}
          />
        </EditorialSection>

        <EditorialSection title={pick({ ko: '제5조 (로컬 데이터 주권 및 백업 책임)', en: 'Article 5 · Local Sovereignty & Backups', ja: '第5条（ローカルデータ主権とバックアップ責任）', id: 'Pasal 5 · Kedaulatan Data & Pencadangan' })}>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>
              {pick({
                ko: '서비스에서 생성한 모든 프로젝트 데이터는 외부 중앙 서버에 백업되지 않고 이용자의 웹 브라우저 내부에 저장됩니다.',
                en: 'All project data is stored locally inside your browser without automatic remote cloud backups.',
                ja: '作成されたデータは外部中央サーバーにはバックアップされず、ブラウザ内に保存されます。',
                id: 'Seluruh data proyek disimpan lokal di browser Anda tanpa pencadangan server otomatis.',
              })}
            </li>
            <li>
              {pick({
                ko: '이용자는 브라우저 캐시 삭제, 시크릿 모드 종료, 기기 변경에 대비하여 [보관함 및 로컬 백업] 기능을 통해 주기적으로 JSON 또는 ZIP 백업 파일을 내려받아 보관할 수 있습니다.',
                en: 'Users are encouraged to export JSON or ZIP backups regularly via [Backup] before clearing browser data or switching devices.',
                ja: 'キャッシュ削除や端末変更に備え、［アーカイブ＆ローカルバックアップ］からJSONまたはZIPの保存を推奨します。',
                id: 'Pengguna disarankan mengekspor cadangan JSON atau ZIP secara berkala melalui [Cadangan] sebelum menghapus data browser.',
              })}
            </li>
            <li>
              {pick({
                ko: '이용자의 로컬 환경 초기화 또는 브라우저 데이터 삭제로 인한 데이터 유실에 대하여 팀은 복구 기술 수단을 보유하지 않습니다.',
                en: 'The Team has no remote recovery capability if browser local storage is wiped.',
                ja: '端末側のデータ消去による消失について、チームは復元手段を保有しません。',
                id: 'Tim tidak memiliki sarana pemulihan apabila penyimpanan lokal browser terhapus.',
              })}
            </li>
          </ol>
        </EditorialSection>
      </EditorialSection>

      <EditorialSection chapter={pick({ ko: '제3장 인공지능 추론 및 책임의 한계', en: 'Chapter 3 · AI Inference & Disclaimers', ja: '第3章 AI推論および免責事項', id: 'Bab 3 · Inferensi AI & Batasan Tanggung Jawab' })}>
        <EditorialSection title={pick({ ko: '제6조 (독립 AI 추론 및 저작권)', en: 'Article 6 · Independent AI & Copyright', ja: '第6条（独立AI推論および著作権）', id: 'Pasal 6 · AI Independen & Hak Cipta' })}>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>
              {pick({
                ko: '이용자는 필요에 따라 Google Gemini API 키(BYOK), 로컬 Ollama 서버 또는 브라우저 내장 WebLLM을 선택하여 기획서 초안 및 사양서 작성을 보조받을 수 있습니다.',
                en: 'Users may optionally select Gemini BYOK, Ollama, or WebLLM to assist with drafting.',
                ja: '必要に応じてGemini BYOK、Ollama、またはWebLLMを選択し執筆補助を受けられます。',
                id: 'Pengguna dapat memilih Gemini BYOK, Ollama, atau WebLLM untuk membantu penulisan.',
              })}
            </li>
            <li>
              {pick({
                ko: '이용자가 서비스로 생성·편집한 모든 사양서, 코드 번들, 프로토타입 산출물에 대한 권리는 전적으로 이용자에게 있습니다.',
                en: 'All rights to specifications, code bundles, and prototypes authored belong exclusively to the User.',
                ja: 'ユーザーが生成・編集した仕様書・コード・プロトタイプの権利はすべてユーザーに帰属します。',
                id: 'Seluruh hak atas spesifikasi, kode, dan prototipe yang dibuat sepenuhnya milik Pengguna.',
              })}
            </li>
          </ol>
        </EditorialSection>

        <EditorialSection title={pick({ ko: '제7조 (보증의 부인 및 면책)', en: 'Article 7 · Disclaimer of Warranty', ja: '第7条（無保証および免責）', id: 'Pasal 7 · Penafian Jaminan' })}>
          <p>
            {pick({
              ko: 'MIT 라이선스 규정에 따라 본 소프트웨어는 상품성, 특정 목적에의 적합성 및 비침해성에 대한 묵시적 보증을 포함하여 어떠한 명시적 또는 묵시적 보증 없이 "있는 그대로(AS-IS)" 제공됩니다.',
              en: 'Per the MIT License, the Software is provided “AS-IS” without warranties of any kind, express or implied.',
              ja: 'MITライセンスの規定に基づき、本ソフトウェアは明示・黙示を問わず一切の保証なく「現状のまま（AS-IS）」提供されます。',
              id: 'Sesuai Lisensi MIT, Perangkat Lunak disediakan “SEBAGAIMANA ADANYA (AS-IS)” tanpa jaminan apa pun.',
            })}
          </p>
        </EditorialSection>
      </EditorialSection>

      <EditorialSection chapter={pick({ ko: '부칙', en: 'Addendum', ja: '附則', id: 'Ketentuan Tambahan' })}>
        <p className="text-[18px] sm:text-[19px] text-[var(--theme-ink-secondary)]">
          {pick({
            ko: '1. 본 약관은 2026년 1월 1일부터 시행합니다. (최근 개정: 2026년 11월 17일)',
            en: '1. Effective from January 1, 2026. (Last revised: November 17, 2026)',
            ja: '1. 本規約は2026年1月1日より施行します。（最終改定：2026年11月17日）',
            id: '1. Berlaku sejak 1 Januari 2026. (Revisi terakhir: 17 November 2026)',
          })}
        </p>
      </EditorialSection>
    </EditorialPageLayout>
  );
}
