import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTabItem,
} from '../layout/EditorialPageLayout';

export default function CustomerService() {
  const { pick } = useLanguage();
  const navigate = useNavigate();

  const helpTabs: EditorialTabItem[] = [
    { id: 'support', label: pick({ ko: '도움말 및 가이드', en: 'Help & Guide', ja: 'ヘルプ・ガイド', id: 'Bantuan & Panduan' }), to: '/support' },
    { id: 'dev-notes', label: pick({ ko: '개발자 노트', en: 'Dev Notes', ja: '開発者ノート', id: 'Catatan Pengembang' }), to: '/dev-notes' },
    { id: 'community', label: pick({ ko: '오픈 아키텍처', en: 'Open Architecture', ja: 'オープン設計', id: 'Arsitektur Terbuka' }), to: '/community' },
    { id: 'contact', label: pick({ ko: '문의 및 피드백', en: 'Contact & Feedback', ja: 'お問い合わせ', id: 'Kontak & Masukan' }), to: '/contact' },
  ];

  const guides = [
    {
      step: 'GUIDE 01',
      title: pick({ ko: 'Gemini 무료 API 키 등록 (BYOK)', en: 'BYOK Gemini API Key', ja: 'Gemini APIキー登録 (BYOK)', id: 'Kunci API Gemini (BYOK)' }),
      description: pick({
        ko: 'Google AI Studio에서 발급받은 개인 무료 API 키를 등록하여 클라우드 제한 없이 빠른 속도로 기획안을 생성합니다.',
        en: 'Connect your personal Google AI Studio API key for high-speed cloud generation with zero SaaS subscriptions.',
        ja: 'Google AI Studioの個人APIキーを登録し、クラウド制限なしで高速に企画書を生成します。',
        id: 'Hubungkan kunci API Google AI Studio pribadi Anda untuk pembuatan cepat tanpa langganan SaaS.',
      }),
      actionText: pick({ ko: '키 설정 열기', en: 'Configure API Key', ja: 'APIキー設定', id: 'Atur Kunci API' }),
      action: () => navigate('/settings?tab=engine'),
    },
    {
      step: 'GUIDE 02',
      title: pick({ ko: 'WebLLM 브라우저 로컬 AI', en: 'WebLLM In-Browser AI', ja: 'WebLLM ブラウザ内ローカルAI', id: 'AI Lokal Browser WebLLM' }),
      description: pick({
        ko: '서버 설치 없이 WebGPU 가속을 통해 브라우저 안에서 Llama-3 / Gemma-2 로컬 모델을 즉시 구동합니다.',
        en: 'Run Llama-3 or Gemma-2 locally inside your browser via WebGPU with zero installations.',
        ja: 'サーバー構築不要で、WebGPU高速化によりブラウザ内でLlama-3 / Gemma-2モデルを実行できます。',
        id: 'Jalankan Llama-3 atau Gemma-2 secara lokal di dalam browser melalui WebGPU tanpa instalasi.',
      }),
      actionText: pick({ ko: '모델 설정 열기', en: 'Launch WebLLM', ja: 'WebLLM を設定', id: 'Buka Pengaturan WebLLM' }),
      action: () => navigate('/settings?tab=engine'),
    },
    {
      step: 'GUIDE 03',
      title: pick({ ko: 'Ollama 오프라인 로컬 서버', en: 'Ollama Offline Server', ja: 'Ollama オフラインローカル', id: 'Server Offline Ollama' }),
      description: pick({
        ko: '내 PC(localhost:11434)에서 실행 중인 Ollama의 오픈소스 LLM을 연동하여 완전한 오프라인 환경을 구축합니다.',
        en: 'Connect to your local Ollama instance (localhost:11434) for 100% private, offline generation.',
        ja: 'ローカルPC（localhost:11434）のOllamaと連携し、完全なオフライン推論環境を構築します。',
        id: 'Hubungkan ke instance Ollama lokal Anda (localhost:11434) untuk generasi offline 100% privat.',
      }),
      actionText: pick({ ko: 'Ollama 연결 설정', en: 'Connect Ollama', ja: 'Ollama 接続設定', id: 'Hubungkan Ollama' }),
      action: () => navigate('/settings?tab=engine'),
    },
    {
      step: 'GUIDE 04',
      title: pick({ ko: '로컬 데이터 백업 및 복원', en: 'Data Backup & Restore', ja: 'ローカルデータのバックアップ・復元', id: 'Cadangkan & Pulihkan Data' }),
      description: pick({
        ko: '모든 기획 데이터는 브라우저 로컬에 저장됩니다. JSON 파일로 백업하고 언제든 다른 기기로 복원할 수 있습니다.',
        en: 'All architecture projects stay on your device. Export to JSON or restore anytime with one click.',
        ja: 'すべての企画データは端末内に保存されます。JSONファイルに出力し、いつでも別端末に復元可能です。',
        id: 'Semua proyek tetap di perangkat Anda. Ekspor ke JSON atau pulihkan kapan saja dalam satu klik.',
      }),
      actionText: pick({ ko: '백업 관리 열기', en: 'Open Backup Hub', ja: 'バックアップ管理を開く', id: 'Buka Pusat Cadangan' }),
      action: () => navigate('/backup'),
    },
  ];

  return (
    <EditorialPageLayout
      category="SUPPORT · LOCAL DATA & AI GUIDE"
      title={pick({ ko: '도움말 및 로컬 데이터 가이드', en: 'Help & Local Data Guide', ja: 'ヘルプ＆ローカルデータガイド', id: 'Bantuan & Panduan Data Lokal' })}
      subtitle={pick({
        ko: 'GOGUMA는 개인에게 무료로 배포되는 공개 소프트웨어입니다. 사용자 기기 중심의 안전한 로컬 기획 환경을 지원합니다.',
        en: 'GOGUMA is free, privacy-first software for individuals. Plan, design, and export with zero subscription lock-in.',
        ja: 'GOGUMAは個人向けに無料公開されているオープンソフトウェアです。端末完結の安全な企画環境を提供します。',
        id: 'GOGUMA adalah perangkat lunak gratis yang mengutamakan privasi. Rencanakan, desain, dan ekspor tanpa batas langganan.',
      })}
      tabs={helpTabs}
      activeTabId="support"
    >
      <EditorialSection chapter={pick({ ko: '제1장 핵심 연동 및 실행 가이드', en: '01 · Integration & Runtime Guides', ja: '第1章 連携・実行ガイド', id: '01 · Panduan Integrasi & Runtime' })}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          {guides.map((guide) => (
            <div
              key={guide.step}
              className="p-8 sm:p-10 bg-[var(--theme-canvas)] border border-[var(--theme-ink-strong)] rounded-none flex flex-col justify-between gap-8"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--theme-border-hairline)] pb-4">
                  <span className="text-[16px] sm:text-[17px] font-extrabold uppercase tracking-[0.14em] text-[var(--theme-ink-secondary)]">
                    {guide.step}
                  </span>
                </div>
                <h3 className="text-[22px] sm:text-[24px] font-extrabold text-[var(--theme-ink-strong)] tracking-tight leading-snug">
                  {guide.title}
                </h3>
                <p className="text-[18px] sm:text-[19px] text-[var(--theme-ink-body)] leading-[1.75]">
                  {guide.description}
                </p>
              </div>

              <button
                type="button"
                onClick={guide.action}
                className="w-full py-4 px-6 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] rounded-none text-[17px] sm:text-[18px] font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{guide.actionText}</span>
                <ArrowRight size={17} />
              </button>
            </div>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection chapter={pick({ ko: '제2장 자주 묻는 질문 (FAQ)', en: '02 · Frequently Asked Questions', ja: '第2章 よくある質問 (FAQ)', id: '02 · Pertanyaan yang Sering Diajukan' })}>
        <div className="divide-y divide-[var(--theme-border-hairline)] border-t border-b border-[var(--theme-ink-strong)]">
          <div className="py-8 space-y-3">
            <h3 className="text-[21px] sm:text-[23px] font-extrabold text-[var(--theme-ink-strong)]">
              Q. {pick({ ko: '내 기획안 데이터는 어디에 저장되나요?', en: 'Where is my project data stored?', ja: '企画書データはどこに保存されますか？', id: 'Di mana data proyek saya disimpan?' })}
            </h3>
            <p className="text-[19px] sm:text-[20px] text-[var(--theme-ink-body)] leading-[1.8]">
              {pick({
                ko: '모든 기획 데이터(사이트맵, 아키텍처, 프롬프트 등)는 브라우저의 로컬 저장소(LocalStorage / IndexedDB)에 100% 저장됩니다. 외부 서버로 자동 전송되지 않으므로 브라우저 캐시를 지우기 전 백업 파일(JSON)을 내보내 두세요.',
                en: 'All your architecture blueprints, sitemaps, and extracted prompts are stored 100% inside your browser localStorage and IndexedDB. No data is sent to external servers.',
                ja: 'すべての設計データ、サイトマップ、プロンプトは100%ブラウザのローカルストレージ（IndexedDB）に保存されます。外部サーバーには送信されないため、JSONバックアップをご活用ください。',
                id: 'Semua cetak biru arsitektur, peta situs, dan prompt disimpan 100% di dalam localStorage dan IndexedDB browser Anda tanpa dikirim ke server luar.',
              })}
            </p>
          </div>

          <div className="py-8 space-y-3">
            <h3 className="text-[21px] sm:text-[23px] font-extrabold text-[var(--theme-ink-strong)]">
              Q. {pick({ ko: 'Gemini API 키가 안전한가요?', en: 'Is my Gemini API key secure?', ja: 'Gemini APIキーは安全ですか？', id: 'Apakah kunci API Gemini saya aman?' })}
            </h3>
            <p className="text-[19px] sm:text-[20px] text-[var(--theme-ink-body)] leading-[1.8]">
              {pick({
                ko: '입력하신 개인 API 키는 귀하의 로컬 브라우저에만 저장되며, AI 요청 시 Google의 공식 Gemini 엔드포인트로만 전송됩니다. 제3자 서버에 수집되거나 공유되지 않습니다.',
                en: 'Your API key is saved exclusively in your local browser sandbox and transmitted only directly to Google official endpoints. It is never logged or stored remotely.',
                ja: '入力されたAPIキーは端末のブラウザ内にのみ保存され、AI推論時にGoogle公式エンドポイントへ直接送信されます。第三者サーバーに保存されることはありません。',
                id: 'Kunci API Anda hanya disimpan di sandbox browser lokal dan dikirim langsung ke endpoint resmi Google tanpa dicatat di server lain.',
              })}
            </p>
          </div>

          <div className="py-8 space-y-3">
            <h3 className="text-[21px] sm:text-[23px] font-extrabold text-[var(--theme-ink-strong)]">
              Q. {pick({ ko: '인터넷 연결 없이도 작동하나요?', en: 'Can I use this completely offline?', ja: 'インターネット接続なしでも使えますか？', id: 'Bisakah digunakan sepenuhnya secara offline?' })}
            </h3>
            <p className="text-[19px] sm:text-[20px] text-[var(--theme-ink-body)] leading-[1.8]">
              {pick({
                ko: '네. AI 엔진 설정에서 Ollama를 선택하고 로컬 PC의 LLM(Llama 3, DeepSeek 등)과 연동하거나 WebLLM 모델을 캐싱하면 비행기 모드나 완전한 폐쇄망에서도 모든 기능을 사용할 수 있습니다.',
                en: 'Yes. Select Ollama or pre-cache a WebLLM model, and you can build web architectures with zero internet connection.',
                ja: 'はい。AIエンジン設定でOllamaを選択するかWebLLMモデルを事前キャッシュすることで、完全なオフライン環境でも全機能をご利用いただけます。',
                id: 'Ya. Pilih Ollama atau cache model WebLLM terlebih dahulu, lalu Anda dapat membangun arsitektur tanpa koneksi internet.',
              })}
            </p>
          </div>
        </div>
      </EditorialSection>
    </EditorialPageLayout>
  );
}
