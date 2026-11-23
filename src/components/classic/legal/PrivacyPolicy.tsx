import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTable,
  getLegalNavTabs,
} from '../layout/EditorialPageLayout';

export default function PrivacyPolicy() {
  const { language, pick } = useLanguage();
  const legalTabs = getLegalNavTabs(language);

  return (
    <EditorialPageLayout
      category="POLICY · PRIVACY & LOCAL-FIRST"
      title={pick({ ko: '개인정보처리방침', en: 'Privacy Policy', ja: 'プライバシーポリシー', id: 'Kebijakan Privasi' })}
      subtitle={pick({
        ko: '고구마(GOGUMA)는 중앙 서버로 개인정보를 수집·전송하지 않는 100% Local-First 아키텍처를 원칙으로 합니다.',
        en: 'GOGUMA operates on a 100% Local-First architecture that never collects or transmits personal data to a central server.',
        ja: 'GOGUMAは中央サーバーへ個人情報を収集・送信しない 100% Local-First アーキテクチャを原則としています。',
        id: 'GOGUMA beroperasi dengan arsitektur 100% Local-First yang tidak mengumpulkan maupun mengirim data pribadi ke server pusat.',
      })}
      tabs={legalTabs}
      activeTabId="privacy"
    >
      {/* Core Local-First Declaration */}
      <div className="p-7 sm:p-9 bg-[var(--theme-stage)] border-l-4 border-l-[var(--theme-ink-strong)] border border-[var(--theme-border-hairline)] space-y-2.5">
        <div className="text-[17px] sm:text-[18px] font-extrabold uppercase tracking-[0.08em] text-[var(--theme-ink-strong)]">
          NO DATA COLLECTION · 100% LOCAL-FIRST GUARANTEE
        </div>
        <p className="text-[19px] sm:text-[20px] text-[var(--theme-ink-body)] leading-[1.8]">
          {pick({
            ko: '고구마(GOGUMA)는 무료 오픈소스 소프트웨어로서 중앙 데이터베이스에 사용자의 개인정보, 결제 및 금융 내역, 기획 데이터를 일체 수집·저장하지 않습니다. 모든 작성 데이터와 설정값은 오직 사용자 기기의 브라우저 로컬 저장소(IndexedDB / LocalStorage)에만 보관됩니다.',
            en: 'As free open-source software, GOGUMA never collects or stores personal details, payment records, or project documents in any central database. All authored files and settings reside solely inside your device’s browser storage (IndexedDB / LocalStorage).',
            ja: 'GOGUMAは無料のオープンソースソフトウェアであり、中央データベースに個人情報・決済履歴・企画データを一切収集・保存しません。すべての作成データと設定は端末内のブラウザストレージ（IndexedDB / LocalStorage）にのみ保管されます。',
            id: 'Sebagai perangkat lunak sumber terbuka gratis, GOGUMA tidak pernah mengumpulkan atau menyimpan data pribadi, catatan pembayaran, atau dokumen proyek di database pusat. Seluruh karya dan pengaturan Anda hanya tersimpan di penyimpanan browser perangkat Anda.',
          })}
        </p>
      </div>

      <EditorialSection chapter={pick({ ko: '제1조 (개인정보 비수집 및 로컬 처리 원칙)', en: 'Article 1 · Zero Collection & Local Processing', ja: '第1条（個人情報非収集およびローカル処理原則）', id: 'Pasal 1 · Prinsip Tanpa Pengumpulan & Pemrosesan Lokal' })}>
        <p>
          {pick({
            ko: '한국센터글로벌네트워크 지식관리실 고구마앱팀(이하 "팀")은 이용자의 정보 주권을 최우선으로 보호하기 위해 서버 비수집(Zero Server Collection) 설계를 채택합니다.',
            en: 'Korean Center Global Network Knowledge Management Office GOGUMA App Team (“Team”) adopts a Zero Server Collection architecture to protect user data sovereignty.',
            ja: 'Korean Center Global Network 知識管理室 GOGUMA App Team（以下「チーム」）は、ユーザーのデータ主権を最優先するためサーバー非収集（Zero Server Collection）設計を採用しています。',
            id: 'Korean Center Global Network GOGUMA App Team (“Tim”) mengadopsi rancangan Zero Server Collection untuk melindungi kedaulatan data pengguna.',
          })}
        </p>
        <EditorialTable
          headers={[
            pick({ ko: '구분', en: 'Category', ja: '区分', id: 'Kategori' }),
            pick({ ko: '처리 항목', en: 'Data Items', ja: '処理項目', id: 'Item Data' }),
            pick({ ko: '보관 위치 및 외부 전송 여부', en: 'Storage & External Transfer', ja: '保管場所・外部送信', id: 'Lokasi Simpan & Transfer' }),
            pick({ ko: '파기 방법', en: 'Deletion', ja: '削除方法', id: 'Penghapusan' }),
          ]}
          rows={[
            [
              pick({ ko: '기획서 및 아키텍처 데이터', en: 'Specs & Architecture Data', ja: '企画書・設計データ', id: 'Data Spek & Arsitektur' }),
              pick({ ko: '프로젝트 제목, 챕터 원고, 사이트맵, 데이터 스키마, 화면 정의서', en: 'Project titles, chapters, sitemaps, schemas, screens', ja: 'プロジェクト名、各章本文、サイトマップ、スキーマ', id: 'Judul proyek, naskah bab, peta situs, skema' }),
              pick({ ko: '사용자 브라우저 로컬 저장소(IndexedDB / LocalStorage) 보관 · 중앙 서버 전송 없음', en: 'Browser IndexedDB / LocalStorage · Never sent to server', ja: 'ブラウザ IndexedDB / LocalStorage 保管・送信なし', id: 'IndexedDB / LocalStorage Browser · Tanpa kirim server' }),
              pick({ ko: '보관함 내 초기화 또는 브라우저 캐시 삭제 시 즉시 영구 파기', en: 'Cleared immediately via Backup Reset or browser storage wipe', ja: '保管庫リセットまたはブラウザキャッシュ削除で即時消去', id: 'Dihapus permanen lewat Reset Cadangan atau hapus data browser' }),
            ],
            [
              pick({ ko: '로컬 작업자 프로필 (선택)', en: 'Local Operator Profile (Optional)', ja: 'ローカル作業者プロフィール（任意）', id: 'Profil Lokal (Opsional)' }),
              pick({ ko: '표시 이름, 이메일(선택), 소속/팀명(선택), 로컬 PIN(선택)', en: 'Display name, optional email, team, optional local PIN', ja: '表示名、メール(任意)、所属(任意)、ローカルPIN(任意)', id: 'Nama tampilan, email opsional, tim, PIN lokal' }),
              pick({ ko: '사용자 브라우저 로컬 저장소(LocalStorage) 전용 · 외부 인증 서버 미전송', en: 'LocalStorage only · Never sent to remote auth server', ja: 'LocalStorage 専用・外部認証サーバーへ未送信', id: 'Khusus LocalStorage · Tanpa kirim ke server autentikasi' }),
              pick({ ko: '프로필 삭제 또는 로그아웃/초기화 시 즉시 삭제', en: 'Deleted immediately on profile removal or reset', ja: 'プロフィール削除またはリセット時に即時削除', id: 'Langsung dihapus saat menghapus profil atau reset' }),
            ],
            [
              pick({ ko: 'AI 연동 키 (선택 BYOK)', en: 'AI API Key (Optional BYOK)', ja: 'AI連携キー（任意BYOK）', id: 'Kunci API AI (BYOK Opsional)' }),
              pick({ ko: '사용자 개인 Google Gemini API 키 또는 로컬 Ollama 주소', en: 'Personal Gemini API key or local Ollama URL', ja: '個人Google Gemini APIキーまたはOllama URL', id: 'Kunci API Gemini pribadi atau URL Ollama lokal' }),
              pick({ ko: '브라우저 로컬 저장 후 사용자가 직접 호출한 추론 엔드포인트로만 직접 전송', en: 'Stored locally; transmitted solely to chosen endpoint on request', ja: 'ローカル保存後、利用者が指定した推論先のみに直接送信', id: 'Disimpan lokal; dikirim hanya ke endpoint pilihan saat diminta' }),
              pick({ ko: '환경 설정에서 삭제 시 즉시 소멸', en: 'Removed immediately when cleared in Settings', ja: '環境設定から削除すると即時消滅', id: 'Langsung terhapus saat dihapus di Pengaturan' }),
            ],
            [
              pick({ ko: '결제·금융·수입 정보', en: 'Payment & Financial Data', ja: '決済・金融情報', id: 'Data Pembayaran' }),
              pick({ ko: '신용카드 번호, 계좌정보, 결제 및 정산 기록', en: 'Credit cards, bank accounts, billing records', ja: 'クレジットカード番号、口座情報、決済履歴', id: 'Kartu kredit, rekening bank, riwayat tagihan' }),
              pick({ ko: '일체 수집 및 처리하지 않음 (100% 무료 소프트웨어)', en: 'Never collected or processed (100% Free Software)', ja: '一切収集・処理しません（100%無料ソフト）', id: 'Tidak pernah dikumpulkan (100% Gratis)' }),
              pick({ ko: '해당 없음', en: 'N/A', ja: '該当なし', id: 'Tidak berlaku' }),
            ],
          ]}
        />
      </EditorialSection>

      <EditorialSection chapter={pick({ ko: '제2조 (개인정보의 처리 및 보유 기간)', en: 'Article 2 · Data Retention', ja: '第2条（保有および利用期間）', id: 'Pasal 2 · Retensi Data' })}>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>
            {pick({
              ko: '팀은 이용자의 개인정보 및 기획 문서를 원격 중앙 데이터베이스에 보유하지 않습니다.',
              en: 'The Team retains zero user personal information or specification documents on any central server.',
              ja: 'チームはユーザーの個人情報や企画書をリモートの中央データベースに保持しません。',
              id: 'Tim tidak menyimpan data pribadi ataupun dokumen spesifikasi pengguna pada server pusat mana pun.',
            })}
          </li>
          <li>
            {pick({
              ko: '모든 작업 기록은 이용자가 브라우저 로컬 저장소에서 직접 삭제하거나 캐시를 비우기 전까지 이용자 기기 내부에만 안전하게 유지됩니다.',
              en: 'All workspace records remain safely on your device until you explicitly delete them or clear browser storage.',
              ja: 'すべての作業記録はユーザーがローカルストレージから削除するまで、ご自身の端末内にのみ安全に保持されます。',
              id: 'Semua catatan ruang kerja tetap aman di perangkat Anda hingga Anda menghapusnya secara langsung.',
            })}
          </li>
          <li>
            {pick({
              ko: '유료 결제나 상업적 거래가 발생하지 않으므로 전자상거래법상 대금결제 및 공급 기록 보관 의무 대상 정보가 존재하지 않습니다.',
              en: 'No paid transactions occur, so no commercial billing retention applies.',
              ja: '有料決済や商業取引が発生しないため、決済記録の保管対象データはありません。',
              id: 'Karena tidak ada transaksi berbayar, tidak ada penyimpanan catatan penagihan komersial.',
            })}
          </li>
        </ol>
      </EditorialSection>

      <EditorialSection chapter={pick({ ko: '제3조 (제3자 제공 및 AI 추론 연동 안내)', en: 'Article 3 · Third Parties & AI Inference', ja: '第3条（第三者提供およびAI推論連携）', id: 'Pasal 3 · Pihak Ketiga & Inferensi AI' })}>
        <p>
          {pick({
            ko: '팀은 이용자의 데이터를 어떠한 경우에도 제3자에게 판매하거나 광고·마케팅 목적으로 제공하지 않습니다. 단, 이용자가 인공지능 보조 기능을 직접 실행하는 경우 선택한 실행 계층에 따라 다음과 같이 처리됩니다.',
            en: 'We never sell or share data for advertising. When you invoke optional AI assistance, requests follow the runtime engine you selected:',
            ja: 'チームがユーザーデータを第三者へ販売・広告提供することはありません。任意でAI機能を実行した場合のみ、選択した実行先へ送信されます：',
            id: 'Kami tidak pernah menjual atau membagikan data untuk iklan. Saat Anda menjalankan asisten AI opsional, pemrosesan mengikuti mesin pilihan Anda:',
          })}
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong>{pick({ ko: '로컬 Ollama 및 브라우저 내장 WebLLM:', en: 'Local Ollama & In-Browser WebLLM:', ja: 'ローカル Ollama ＆ WebLLM:', id: 'Ollama Lokal & WebLLM Browser:' })}</strong>{' '}
            {pick({
              ko: '외부 네트워크 통신 없이 이용자 기기 내부에서만 100% 오프라인으로 추론됩니다.',
              en: 'Runs 100% locally on your device with zero external network transmission.',
              ja: '外部通信なしで端末内部のみで100%オフライン推論されます。',
              id: 'Berjalan 100% lokal di perangkat Anda tanpa transmisi jaringan eksternal.',
            })}
          </li>
          <li>
            <strong>Google Gemini API (BYOK / Proxy):</strong>{' '}
            {pick({
              ko: '이용자가 AI 초안 생성을 직접 요청한 텍스트에 한해 TLS 1.3 암호화 구간을 통해 Google Gemini 엔드포인트로 전달되며, API 정책에 따라 모델 재학습에 사용되지 않습니다.',
              en: 'Only the prompt text explicitly triggered by the user is sent over TLS 1.3 to Google Gemini API under Zero-Training guarantees.',
              ja: 'ユーザーが生成を実行したテキストのみがTLS 1.3経由でGoogle Geminiへ送信され、APIポリシーによりモデル学習には使用されません。',
              id: 'Hanya teks yang diminta pengguna dikirim melalui TLS 1.3 ke Google Gemini API di bawah kebijakan tanpa pelatihan ulang.',
            })}
          </li>
        </ul>
      </EditorialSection>

      <EditorialSection chapter={pick({ ko: '제4조 (정보주체의 권리 및 데이터 주권 행사)', en: 'Article 4 · User Rights & Data Sovereignty', ja: '第4条（データ主体の権利行使）', id: 'Pasal 4 · Hak Pengguna & Kedaulatan Data' })}>
        <p>
          {pick({
            ko: '이용자는 언제든지 [보관함 및 로컬 백업] 페이지에서 전체 프로젝트 데이터를 표준 JSON 또는 11종 마크다운 ZIP 번들로 내보낼 수 있으며, 원클릭 데이터 초기화를 통해 기기 내 모든 흔적을 즉시 삭제할 수 있습니다.',
            en: 'You can export your full studio archive as JSON or an 11-spec Markdown ZIP bundle anytime in [Backup], or wipe all local traces in one click.',
            ja: 'いつでも［アーカイブ＆ローカルバックアップ］からJSONまたは11種仕様書ZIPとして書き出せ、ワンクリック初期化ですべて削除できます。',
            id: 'Anda dapat mengekspor seluruh arsip studio sebagai JSON atau bundel ZIP 11 spek kapan saja di [Cadangan], atau menghapus seluruh jejak lokal dalam satu klik.',
          })}
        </p>
      </EditorialSection>

      <EditorialSection chapter={pick({ ko: '제5조 (개인정보 보호 문의처)', en: 'Article 5 · Privacy Contact', ja: '第5条（プライバシー保護窓口）', id: 'Pasal 5 · Kontak Privasi' })}>
        <EditorialTable
          headers={[
            pick({ ko: '항목', en: 'Item', ja: '項目', id: 'Item' }),
            pick({ ko: '세부 정보', en: 'Details', ja: '詳細', id: 'Detail' }),
          ]}
          rows={[
            [pick({ ko: '운영 조직', en: 'Organization', ja: '運営組織', id: 'Organisasi' }), pick({ ko: '한국센터글로벌네트워크 지식관리실 고구마앱팀', en: 'Korean Center Global Network · GOGUMA App Team', ja: 'Korean Center Global Network · GOGUMA App Team', id: 'Korean Center Global Network · GOGUMA App Team' })],
            [pick({ ko: '주소', en: 'Address', ja: '所在地', id: 'Alamat' }), pick({ ko: '경기도 부천시 원미구 역곡로 19번길 108동 803호', en: '108-803, 19-gil Yeokgok-ro, Wonmi-gu, Bucheon-si, South Korea', ja: '大韓民国 京畿道 富川市 遠美区 駅谷路19番キル 108-803', id: '108-803, 19-gil Yeokgok-ro, Wonmi-gu, Bucheon-si, Korea Selatan' })],
            [pick({ ko: '사업자등록번호 / 통신판매업', en: 'Business Registration', ja: '事業者登録番号', id: 'Nomor Registrasi' }), '141-82-83410 · 제2025-부천원미-1090호'],
            [pick({ ko: '문의 이메일', en: 'Contact Email', ja: '窓口メール', id: 'Email Kontak' }), 'master@goguma.app'],
          ]}
        />
      </EditorialSection>
    </EditorialPageLayout>
  );
}
