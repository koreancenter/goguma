import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTable,
  getLegalNavTabs,
} from '../layout/EditorialPageLayout';

export default function CookiePolicyPage() {
  const { language, pick } = useLanguage();
  const legalTabs = getLegalNavTabs(language);

  return (
    <EditorialPageLayout
      category="POLICY · ZERO COOKIES"
      title={pick({ ko: '쿠키 정책', en: 'Cookie Policy', ja: 'クッキーポリシー', id: 'Kebijakan Cookie' })}
      subtitle={pick({
        ko: '고구마(GOGUMA)는 어떠한 HTTP 쿠키나 외부 추적 스크립트도 생성·수집하지 않는 No Cookies 원칙을 준수합니다.',
        en: 'GOGUMA adheres to a strict No-Cookies policy without HTTP tracking cookies or external analytics scripts.',
        ja: 'GOGUMAはHTTPクッキーや外部追跡スクリプトを一切生成・収集しない「No Cookies」原則を遵守します。',
        id: 'GOGUMA mematuhi prinsip Tanpa Cookie tanpa membuat cookie pelacakan HTTP maupun skrip analitik eksternal.',
      })}
      tabs={legalTabs}
      activeTabId="cookies"
    >
      <div className="p-7 sm:p-9 bg-[var(--theme-stage)] border-l-4 border-l-[var(--theme-ink-strong)] border border-[var(--theme-border-hairline)] space-y-2.5">
        <div className="text-[17px] sm:text-[18px] font-extrabold uppercase tracking-[0.08em] text-[var(--theme-ink-strong)]">
          NO COOKIES · ZERO HTTP TRACKING
        </div>
        <p className="text-[19px] sm:text-[20px] text-[var(--theme-ink-body)] leading-[1.8]">
          {pick({
            ko: '고구마(GOGUMA)는 필수 쿠키, 방문자 분석(Google Analytics 등) 쿠키, 광고·마케팅 추적 쿠키를 일체 사용하지 않습니다. 서비스 동작에 필요한 모든 상태는 서버 쿠키가 아닌 사용자 기기 내부의 브라우저 로컬 저장소에만 유지됩니다.',
            en: 'GOGUMA does not use session cookies, analytics cookies (such as Google Analytics), or advertising trackers. All app preferences remain inside your browser’s local storage on your device.',
            ja: 'GOGUMAは必須クッキー、アクセス解析クッキー、広告トラッキングクッキーを一切使用しません。動作に必要な状態はすべて端末内のローカルストレージのみに保持されます。',
            id: 'GOGUMA tidak menggunakan cookie sesi, cookie analitik, maupun pelacak iklan. Seluruh status aplikasi hanya disimpan di penyimpanan lokal browser pada perangkat Anda.',
          })}
        </p>
      </div>

      <EditorialSection chapter={pick({ ko: '제1조 (쿠키 및 추적기 미사용 현황)', en: 'Article 1 · Zero Cookie & Tracker Matrix', ja: '第1条（クッキー・追跡スクリプト不使用状況）', id: 'Pasal 1 · Matriks Bebas Cookie & Pelacak' })}>
        <EditorialTable
          headers={[
            pick({ ko: '구분', en: 'Category', ja: '区分', id: 'Kategori' }),
            pick({ ko: 'HTTP 쿠키 사용 여부', en: 'HTTP Cookies', ja: 'HTTPクッキー使用', id: 'Cookie HTTP' }),
            pick({ ko: '대체 로컬 처리 방식', en: 'Local Storage Mechanism', ja: 'ローカル処理方式', id: 'Mekanisme Lokal' }),
            pick({ ko: '외부 서버 전송', en: 'External Transfer', ja: '外部サーバー送信', id: 'Transfer Eksternal' }),
          ]}
          rows={[
            [
              pick({ ko: '필수 기능 유지', en: 'Core Workspace State', ja: '必須機能の維持', id: 'Fungsi Inti Ruang Kerja' }),
              pick({ ko: '미사용 (0 Cookies)', en: 'None (0 Cookies)', ja: '不使用 (0 Cookies)', id: 'Tidak Digunakan (0 Cookie)' }),
              pick({ ko: '브라우저 LocalStorage / IndexedDB 내 작업 상태 저장', en: 'Saved in browser LocalStorage / IndexedDB', ja: 'ブラウザ LocalStorage / IndexedDB 内に保存', id: 'Disimpan di LocalStorage / IndexedDB browser' }),
              pick({ ko: '전송 안 함', en: 'Never sent', ja: '送信なし', id: 'Tidak dikirim' }),
            ],
            [
              pick({ ko: '방문자 분석 및 통계', en: 'Analytics & Telemetry', ja: 'アクセス解析・統計', id: 'Analitik & Statistik' }),
              pick({ ko: '미사용 (0 Cookies)', en: 'None (0 Cookies)', ja: '不使用 (0 Cookies)', id: 'Tidak Digunakan (0 Cookie)' }),
              pick({ ko: 'Google Analytics 등 분석 스크립트 일체 비탑재', en: 'Zero analytics or telemetry scripts', ja: 'Google Analytics 等の解析スクリプト非搭載', id: 'Tanpa skrip analitik pihak ketiga' }),
              pick({ ko: '전송 안 함', en: 'Never sent', ja: '送信なし', id: 'Tidak dikirim' }),
            ],
            [
              pick({ ko: '광고 및 마케팅 추적', en: 'Advertising & Pixels', ja: '広告・トラッキング', id: 'Iklan & Pelacakan' }),
              pick({ ko: '미사용 (0 Cookies)', en: 'None (0 Cookies)', ja: '不使用 (0 Cookies)', id: 'Tidak Digunakan (0 Cookie)' }),
              pick({ ko: '타겟팅 픽셀 및 제3자 광고 쿠키 일체 없음', en: 'Zero targeting pixels or third-party ad cookies', ja: 'ターゲットピクセル・第三者広告クッキーなし', id: 'Tanpa piksel penargetan atau cookie iklan' }),
              pick({ ko: '전송 안 함', en: 'Never sent', ja: '送信なし', id: 'Tidak dikirim' }),
            ],
            [
              pick({ ko: '언어·가독성·분할 설정', en: 'Locale & UI Preferences', ja: '言語・表示・UI設定', id: 'Preferensi Bahasa & UI' }),
              pick({ ko: '미사용 (0 Cookies)', en: 'None (0 Cookies)', ja: '不使用 (0 Cookies)', id: 'Tidak Digunakan (0 Cookie)' }),
              pick({ ko: '브라우저 LocalStorage (goguma_language, goguma_large_text 등)', en: 'Browser LocalStorage (goguma_language, etc.)', ja: 'ブラウザ LocalStorage (goguma_language 等)', id: 'LocalStorage Browser (goguma_language, dll.)' }),
              pick({ ko: '전송 안 함', en: 'Never sent', ja: '送信なし', id: 'Tidak dikirim' }),
            ],
          ]}
        />
      </EditorialSection>

      <EditorialSection chapter={pick({ ko: '제2조 (브라우저 로컬 저장소 제어 방법)', en: 'Article 2 · Managing Browser Local Storage', ja: '第2条（ローカルストレージの管理方法）', id: 'Pasal 2 · Mengelola Penyimpanan Lokal' })}>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>
            {pick({
              ko: '이용자는 언제든지 웹 브라우저의 사이트 데이터 삭제 기능을 이용하거나 고구마 스튜디오 내 [보관함 및 로컬 백업 > 저장소 진단 & 정리] 페이지에서 모든 로컬 저장 항목을 즉시 삭제할 수 있습니다.',
              en: 'You can clear site data via browser settings or remove all local records immediately in [Backup > Storage Diagnostics].',
              ja: 'ユーザーはいつでもブラウザのサイトデータ削除機能、またはスタジオ内の［バックアップ ＞ ストレージ整理］からすべてのローカルデータを削除できます。',
              id: 'Anda dapat menghapus data situs melalui pengaturan browser atau langsung dari halaman [Cadangan > Diagnostik Penyimpanan].',
            })}
          </li>
          <li>
            {pick({
              ko: '쿠키 차단이 기본 활성화된 프라이버시 브라우저 및 시크릿 환경에서도 모든 로컬 작성 기능은 정상적으로 동작합니다.',
              en: 'All authoring features function normally even in strict privacy browsers or incognito windows with third-party cookies blocked.',
              ja: 'クッキー遮断が有効なプライバシーブラウザやシークレットウィンドウでも、すべてのローカル編集機能が正常に動作します。',
              id: 'Semua fitur penulisan tetap berfungsi normal di browser privasi ketat maupun mode penyamaran dengan pemblokiran cookie.',
            })}
          </li>
        </ol>
      </EditorialSection>
    </EditorialPageLayout>
  );
}
