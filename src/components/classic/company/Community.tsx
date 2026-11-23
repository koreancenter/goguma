import React, { useState } from 'react';
import { Copy, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTabItem,
} from '../layout/EditorialPageLayout';

export default function Community() {
  const { pick } = useLanguage();
  const navigate = useNavigate();
  const [copiedClone, setCopiedClone] = useState(false);

  const cloneCommand = 'git clone https://github.com/koreancenter/goguma.git';

  const copyClone = () => {
    navigator.clipboard.writeText(cloneCommand);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const tabs: EditorialTabItem[] = [
    { id: 'community', label: pick({ ko: '오픈 아키텍처', en: 'Open Architecture', ja: 'オープン設計', id: 'Arsitektur Terbuka' }), to: '/community' },
    { id: 'about', label: pick({ ko: 'GOGUMA 소개', en: 'About GOGUMA', ja: 'GOGUMA 紹介', id: 'Tentang GOGUMA' }), to: '/about' },
    { id: 'support', label: pick({ ko: '도움말 및 가이드', en: 'Help & Guide', ja: 'ヘルプ・ガイド', id: 'Bantuan & Panduan' }), to: '/support' },
    { id: 'contact', label: pick({ ko: '문의 및 피드백', en: 'Contact & Feedback', ja: 'お問い合わせ', id: 'Kontak & Masukan' }), to: '/contact' },
  ];

  const pillars = [
    {
      index: '01',
      title: pick({ ko: '로컬 우선 & 제로 원격 전송', en: 'Local-First & Zero Telemetry', ja: 'ローカル優先＆ゼロ遠隔送信', id: 'Local-First & Nol Telemetri' }),
      description: pick({
        ko: '기획안과 사이트맵 데이터는 중앙 서버에 수집되지 않으며 오직 사용자의 브라우저 로컬 저장소에 안전하게 보관됩니다.',
        en: 'Your project sitemaps and specification documents are saved exclusively in your browser without telemetry or tracking.',
        ja: '企画書やサイトマップは中央サーバーに収集されず、ブラウザのローカルストレージのみに安全に保管されます。',
        id: 'Peta situs dan dokumen spesifikasi Anda disimpan eksklusif di browser Anda tanpa telemetri atau pelacakan.',
      }),
    },
    {
      index: '02',
      title: pick({ ko: '무과금 AI 추론의 자유', en: 'Inference Freedom', ja: '無料AI推論の自由', id: 'Kebebasan Inferensi AI' }),
      description: pick({
        ko: 'Google Gemini 무료 API 키(BYOK) 또는 오프라인 Ollama 데몬을 자유롭게 연동하여 이용할 수 있습니다.',
        en: 'Bring Your Own Key for Gemini, or connect to your offline Ollama daemon with zero subscription fees.',
        ja: 'Google Gemini APIキー（BYOK）やオフラインOllamaデーモンを自由に連携して利用できます。',
        id: 'Gunakan API key Gemini Anda sendiri (BYOK) atau hubungkan daemon Ollama offline tanpa biaya langganan.',
      }),
    },
    {
      index: '03',
      title: pick({ ko: '오픈 포맷 & 락인 해제', en: 'Open JSON Portability', ja: 'オープン形式＆ロックイン解除', id: 'Portabilitas JSON Terbuka' }),
      description: pick({
        ko: '단일 프로젝트 또는 전체 워크스페이스를 원클릭 표준 JSON 파일로 백업하고 언제든 다른 기기로 복원할 수 있습니다.',
        en: 'Export and restore your entire studio workspace in portable, human-readable standard JSON at any time.',
        ja: 'プロジェクトやワークスペース全体を標準JSONファイルへ出力し、いつでも別端末へ復元できます。',
        id: 'Ekspor dan pulihkan seluruh ruang kerja studio dalam format JSON standar kapan saja.',
      }),
    },
  ];

  return (
    <EditorialPageLayout
      category="OPEN ARCHITECTURE · 100% FREE SOFTWARE"
      title={pick({ ko: '독립형 웹 아키텍처 스튜디오', en: 'Open Architecture Studio', ja: '独立型Webアーキテクチャスタジオ', id: 'Studio Arsitektur Terbuka' })}
      subtitle={pick({
        ko: '특정 중앙 서버나 반복 구독에 종속되지 않는 로컬 우선 오픈 소프트웨어입니다. 순수 브라우저 오프라인 환경 또는 개인 BYOK AI 엔진으로 완전히 독립적으로 동작합니다.',
        en: 'A local-first open architecture suite. Free from recurring subscriptions or server lock-in, it runs autonomously in your browser.',
        ja: '特定の中央サーバーやサブスクリプションに依存しないローカル優先のオープンソフトウェアです。ブラウザ上で独立して動作します。',
        id: 'Rangkaian arsitektur terbuka local-first. Bebas dari langganan berulang atau ketergantungan server, berjalan mandiri di browser Anda.',
      })}
      tabs={tabs}
      activeTabId="community"
      headerActions={
        <>
          <button
            type="button"
            onClick={() => navigate('/workspace')}
            className="px-5 py-3 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] rounded-none text-[17px] font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <span>{pick({ ko: '작업실 바로 시작', en: 'Open Workspace', ja: 'ワークスペースを開く', id: 'Buka Ruang Kerja' })}</span>
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => navigate('/license')}
            className="px-5 py-3 bg-[var(--theme-canvas)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] hover:border-[var(--theme-hover-bg)] border border-[var(--theme-ink-strong)] text-[var(--theme-ink-strong)] rounded-none text-[17px] font-bold transition-colors cursor-pointer"
          >
            <span>{pick({ ko: 'MIT 라이선스 보기', en: 'View MIT License', ja: 'MITライセンスを見る', id: 'Lihat Lisensi MIT' })}</span>
          </button>
        </>
      }
    >
      <EditorialSection chapter={pick({ ko: '제1장 3대 핵심 독립 원칙', en: '01 · Three Architectural Pillars', ja: '第1章 3つの独立原則', id: '01 · Tiga Pilar Arsitektur' })}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
          {pillars.map((pillar) => (
            <div
              key={pillar.index}
              className="p-8 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] rounded-none space-y-4"
            >
              <div className="text-[16px] font-extrabold uppercase tracking-[0.14em] text-[var(--theme-ink-secondary)] tabular-nums">
                PILLAR {pillar.index}
              </div>
              <h3 className="text-[22px] sm:text-[24px] font-extrabold text-[var(--theme-ink-strong)] tracking-tight leading-snug">
                {pillar.title}
              </h3>
              <p className="text-[18px] sm:text-[19px] text-[var(--theme-ink-body)] leading-[1.8]">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection chapter={pick({ ko: '제2장 오픈소스 저장소 및 커뮤니티 규약', en: '02 · Open Source Repository & Guidelines', ja: '第2章 オープンソース＆規約', id: '02 · Repositori Sumber Terbuka & Pedoman' })}>
        <div className="p-8 sm:p-10 bg-[var(--theme-canvas)] border border-[var(--theme-ink-strong)] rounded-none space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-[19px] sm:text-[20px] text-[var(--theme-ink-body)]">
              {pick({
                ko: '누구나 코드를 열람하고, 포크(Fork)하며 기여할 수 있는 MIT 라이선스 프로젝트입니다.',
                en: 'Open for inspection, improvements, and community contributions under MIT.',
                ja: '誰でもコードを閲覧し、Forkして貢献できるMITライセンスプロジェクトです。',
                id: 'Terbuka untuk ditinjau, dikembangkan, dan menerima kontribusi di bawah lisensi MIT.',
              })}
            </p>
            <button
              type="button"
              onClick={() => navigate('/community-terms')}
              className="px-5 py-3 bg-[var(--theme-canvas)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] hover:border-[var(--theme-hover-bg)] text-[var(--theme-ink-strong)] border border-[var(--theme-ink-strong)] rounded-none text-[17px] font-bold transition-colors cursor-pointer shrink-0"
            >
              {pick({ ko: '커뮤니티 규약 보기', en: 'Community Guidelines', ja: 'コミュニティ規約', id: 'Pedoman Komunitas' })}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 p-5 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] rounded-none font-mono text-[17px] sm:text-[19px] overflow-x-auto">
            <span className="text-[var(--theme-ink-strong)] select-all">$ {cloneCommand}</span>
            <button
              type="button"
              onClick={copyClone}
              className="px-4 py-2 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-[16px] font-sans font-bold rounded-none transition-colors shrink-0 cursor-pointer inline-flex items-center gap-2"
              title="Copy command"
            >
              {copiedClone ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedClone ? pick({ ko: '복사됨', en: 'Copied', ja: 'コピー済', id: 'Disalin' }) : pick({ ko: '복사', en: 'Copy', ja: 'コピー', id: 'Salin' })}</span>
            </button>
          </div>
        </div>
      </EditorialSection>
    </EditorialPageLayout>
  );
}
