import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getChapters } from '../../lib/chapterData';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';

export default function LandingPage() {
  const { language, pick } = useLanguage();
  const navigate = useNavigate();
  const chapters = getChapters(language);

  const principles = [
    {
      index: '01',
      title: pick({
        ko: '완전한 로컬 격리',
        en: 'Complete Local Isolation',
        ja: '完全なローカル隔離',
        id: 'Isolasi Lokal Sepenuhnya',
      }),
      desc: pick({
        ko: '외부 인증 서버나 원격 데이터베이스 없이 브라우저 IndexedDB 내부에서만 작동합니다.',
        en: 'Operates strictly within your browser IndexedDB with zero remote auth or cloud storage.',
        ja: '外部認証サーバーやリモートDBを使わず、ブラウザのIndexedDB内のみで動作します。',
        id: 'Beroperasi sepenuhnya di dalam IndexedDB peramban tanpa server autentikasi atau basis data jarak jauh.',
      }),
    },
    {
      index: '02',
      title: pick({
        ko: '즉각적 0ms 반응성',
        en: 'Instant 0ms Responsiveness',
        ja: '即座の0msレスポンス',
        id: 'Responsivitas Instan 0ms',
      }),
      desc: pick({
        ko: '네트워크 대기 시간 없이 오프라인에서도 즉시 집필과 실시간 프로토타입 검증이 가능합니다.',
        en: 'Write specifications and inspect live prototypes offline with zero network latency.',
        ja: 'ネットワーク遅延なしで、オフライン環境でも即座に執筆とライブプロトタイプ検証が可能です。',
        id: 'Tulis spesifikasi dan tinjau prototipe langsung secara luring tanpa latensi jaringan.',
      }),
    },
    {
      index: '03',
      title: pick({
        ko: '11종 표준 사양서 추출',
        en: '11 Production Specifications',
        ja: '11種類の標準仕様書を抽出',
        id: '11 Spesifikasi Produksi Standar',
      }),
      desc: pick({
        ko: '기획 원고와 도메인 규칙이 11개의 개발 사양서와 실행 플레이북으로 즉시 컴파일됩니다.',
        en: 'Compiles your prose and domain constraints into 11 engineering documents and a runnable playbook.',
        ja: '企画原稿とドメインルールが11種類の開発仕様書と実行プレイブックへ即座にコンパイルされます。',
        id: 'Mengompilasi draf dan aturan domain Anda menjadi 11 dokumen rekayasa dan playbook siap pakai.',
      }),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--theme-canvas)] text-[var(--theme-ink-primary)] flex flex-col selection:bg-[var(--theme-ink-strong)] selection:text-[var(--theme-canvas)] font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Hero Monograph Section */}
        <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="space-y-12">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--theme-border-hairline)] pb-5">
              <span className="text-[15px] sm:text-[16px] font-sans font-bold uppercase tracking-[0.16em] text-[var(--theme-ink-secondary)]">
                {pick({
                  ko: '로컬 퍼스트 사양서 스튜디오',
                  en: 'Local-First Specification Studio',
                  ja: 'ローカルファースト仕様書スタジオ',
                  id: 'Studio Spesifikasi Local-First',
                })}
              </span>
              <span className="text-[15px] sm:text-[16px] font-sans tabular-nums uppercase tracking-[0.14em] text-[var(--theme-ink-secondary)]">
                {pick({
                  ko: 'Edition 2.1 · 클라이언트 샌드박스',
                  en: 'Edition 2.1 · Client Sandboxed',
                  ja: 'Edition 2.1 · クライアントサンドボックス',
                  id: 'Edisi 2.1 · Kotak Pasir Klien',
                })}
              </span>
            </div>

            <div className="max-w-5xl space-y-6">
              <h1
                className="font-display text-4xl sm:text-5xl lg:text-[64px] font-bold text-[var(--theme-ink-primary)] tracking-[-0.03em] leading-[1.12]"
                style={{ textWrap: 'balance' }}
              >
                {pick({
                  ko: (
                    <>
                      생각의 결을 건축하는
                      <br />
                      로컬 퍼스트 사양서 스튜디오.
                    </>
                  ),
                  en: (
                    <>
                      Architecting Clarity
                      <br />
                      in Pure Local Solitude.
                    </>
                  ),
                  ja: (
                    <>
                      思考の脈絡を設計する
                      <br />
                      ローカルファースト仕様書スタジオ。
                    </>
                  ),
                  id: (
                    <>
                      Merancang Kejernihan
                      <br />
                      dalam Studio Spesifikasi Lokal.
                    </>
                  ),
                })}
              </h1>
            </div>

            <div className="pt-10 border-t-2 border-[var(--theme-ink-strong)] grid grid-cols-1 lg:grid-cols-12 gap-14 items-start">
              {/* Left Lead & Primary Actions */}
              <div className="lg:col-span-6 space-y-10">
                <p className="text-[21px] sm:text-[23px] text-[var(--theme-ink-body)] leading-[1.75] max-w-2xl">
                  {pick({
                    ko: '외부 서버로 로그인 정보나 기획 원고가 일체 전송되지 않는 독립된 Local-First 환경입니다. 8개의 구조화된 챕터를 따라 아이디어를 서술하면 실시간 프로토타입과 11종의 엔지니어링 사양서가 즉시 완성됩니다.',
                    en: 'A sovereign Local-First studio where no credentials or specifications leave your device. Author across 8 structured chapters to manifest live prototypes and 11 engineering specifications instantly.',
                    ja: 'ログイン情報や企画原稿が外部サーバーに一切送信されない独立したLocal-First環境です。構造化された8つのチャプターに沿ってアイデアを記述すると、ライブプロトタイプと11種類のエンジニアリング仕様書が即座に完成します。',
                    id: 'Studio Local-First berdaulat di mana kredensial maupun draf spesifikasi tidak pernah meninggalkan perangkat Anda. Susun ide melalui 8 bab terstruktur untuk menghasilkan prototipe langsung dan 11 spesifikasi teknis seketika.',
                  })}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/workspace')}
                    className="px-8 py-4.5 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-[18px] sm:text-[19px] font-bold tracking-wide inline-flex items-center gap-3 transition-colors cursor-pointer group"
                  >
                    <span>
                      {pick({
                        ko: '로컬 워크스페이스 시작하기',
                        en: 'Enter Local Workspace',
                        ja: 'ローカルワークスペースを開始',
                        id: 'Masuk ke Ruang Kerja Lokal',
                      })}
                    </span>
                    <ArrowRight size={19} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="px-7 py-4.5 rounded-none border border-[var(--theme-ink-strong)] bg-[var(--theme-canvas)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] hover:border-[var(--theme-hover-bg)] text-[var(--theme-ink-strong)] text-[18px] sm:text-[19px] font-bold tracking-wide inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>
                      {pick({
                        ko: '디렉터 입장 게이트웨이',
                        en: 'Director Gateway',
                        ja: 'ディレクター入場ゲートウェイ',
                        id: 'Gerbang Masuk Direktur',
                      })}
                    </span>
                  </button>
                </div>
              </div>

              {/* Right Hairline Architectural Principles */}
              <div className="lg:col-span-6 border-t lg:border-t-0 border-[var(--theme-border-hairline)]">
                {principles.map((item) => (
                  <div
                    key={item.index}
                    className="py-7 border-b border-[var(--theme-border-hairline)] first:pt-0 grid grid-cols-12 gap-5 items-baseline"
                  >
                    <span className="col-span-2 text-[17px] font-bold font-sans tabular-nums text-[var(--theme-ink-secondary)] tracking-[0.12em]">
                      {item.index}
                    </span>
                    <div className="col-span-10 space-y-2">
                      <h2 className="text-[21px] sm:text-[23px] font-extrabold text-[var(--theme-ink-strong)] tracking-tight">
                        {item.title}
                      </h2>
                      <p className="text-[18px] sm:text-[19px] text-[var(--theme-ink-body)] leading-[1.7]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sejong-Style Curated Program Index (Chapters 01 - 08) */}
        <section className="bg-[var(--theme-stage)] border-t border-[var(--theme-border-hairline)] py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b-2 border-[var(--theme-ink-strong)]">
              <div className="space-y-3">
                <span className="text-[15px] sm:text-[16px] font-bold font-sans uppercase tracking-[0.18em] text-[var(--theme-ink-secondary)] block">
                  {pick({
                    ko: 'Specification Program',
                    en: 'Specification Program',
                    ja: '仕様策定プログラム',
                    id: 'Program Spesifikasi',
                  })}
                </span>
                <h2 className="font-display text-[32px] sm:text-[40px] font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.03em] leading-tight">
                  {pick({
                    ko: '8단계 아키텍처 집필 프로그램',
                    en: 'Eight-Chapter Specification Index',
                    ja: '8段階アーキテクチャ執筆プログラム',
                    id: 'Indeks Spesifikasi Delapan Bab',
                  })}
                </h2>
              </div>
              <span className="text-[17px] sm:text-[18px] font-bold font-sans tabular-nums text-[var(--theme-ink-secondary)]">
                {pick({
                  ko: '01 — 08 챕터 · 17개 섹션',
                  en: '01 — 08 Chapters · 17 Sections',
                  ja: '01 — 08 チャプター · 17 セクション',
                  id: '01 — 08 Bab · 17 Bagian',
                })}
              </span>
            </div>

            <div className="divide-y divide-[var(--theme-border-hairline)] border-b border-[var(--theme-border-hairline)]">
              {chapters.map((chap) => (
                <button
                  key={chap.id}
                  type="button"
                  onClick={() => navigate('/workspace')}
                  className="w-full py-8 px-4 -mx-4 hover:bg-[var(--theme-canvas)] transition-colors grid grid-cols-12 gap-5 items-center text-left cursor-pointer group"
                >
                  <span className="col-span-2 sm:col-span-1 font-display font-bold text-[26px] sm:text-[32px] text-[var(--theme-ink-secondary)] group-hover:text-[var(--theme-ink-strong)] tabular-nums tracking-[-0.03em] transition-colors">
                    0{chap.id}
                  </span>

                  <div className="col-span-8 sm:col-span-5 min-w-0 space-y-1">
                    <div className="text-[22px] sm:text-[26px] font-extrabold text-[var(--theme-ink-strong)] tracking-tight truncate">
                      {chap.title}
                    </div>
                    <div className="text-[15px] sm:text-[16px] font-sans uppercase tracking-[0.12em] text-[var(--theme-ink-secondary)] truncate">
                      {chap.engTitle}
                    </div>
                  </div>

                  <p className="hidden sm:block sm:col-span-5 text-[18px] sm:text-[19px] text-[var(--theme-ink-body)] truncate">
                    {chap.sections.map((s) => s.title).join(' · ')}
                  </p>

                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <ArrowRight
                      size={22}
                      className="text-[var(--theme-ink-secondary)] group-hover:text-[var(--theme-ink-strong)] group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
