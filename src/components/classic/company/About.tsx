import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTabItem,
} from '../layout/EditorialPageLayout';

export default function About() {
  const { t, pick } = useLanguage();

  const tabs: EditorialTabItem[] = [
    { id: 'about', label: pick({ ko: 'GOGUMA 소개', en: 'About GOGUMA', ja: 'GOGUMA 紹介', id: 'Tentang GOGUMA' }), to: '/about' },
    { id: 'community', label: pick({ ko: '오픈 아키텍처', en: 'Open Architecture', ja: 'オープン設計', id: 'Arsitektur Terbuka' }), to: '/community' },
    { id: 'support', label: pick({ ko: '도움말 및 가이드', en: 'Help & Guide', ja: 'ヘルプ・ガイド', id: 'Bantuan & Panduan' }), to: '/support' },
    { id: 'contact', label: pick({ ko: '문의 및 피드백', en: 'Contact & Feedback', ja: 'お問い合わせ', id: 'Kontak & Masukan' }), to: '/contact' },
  ];

  const values = [
    {
      index: '01',
      title: pick({
        ko: '정밀한 아키텍처 설계',
        en: 'Precision Architecture',
        ja: '精密なアーキテクチャ設計',
        id: 'Arsitektur Presisi',
      }),
      description: pick({
        ko: '견고하고 미니멀하며 타협 없는 명확함을 갖춘 디지털 기반을 구축합니다.',
        en: 'We believe in building digital foundations that are robust, minimal, and uncompromisingly clear.',
        ja: '堅牢でミニマル、そして妥協のない明快さを備えたデジタル基盤を構築します。',
        id: 'Kami membangun fondasi digital yang kokoh, minimal, dan sangat jelas.',
      }),
    },
    {
      index: '02',
      title: pick({
        ko: '경계 없는 글로벌 협업',
        en: 'Global Collaboration',
        ja: 'グローバルな協業',
        id: 'Kolaborasi Global',
      }),
      description: pick({
        ko: '전 세계 팀과 1인 빌더들이 마찰 없이 아키텍처 비전을 동기화하도록 돕습니다.',
        en: 'Empowering teams and solo builders worldwide to sync their architectural vision with zero friction.',
        ja: '世界中のチームや個人ビルダーが摩擦なく設計ビジョンを共有できるよう支援します。',
        id: 'Memberdayakan tim dan pembangun mandiri di seluruh dunia untuk menyelaraskan visi arsitektur.',
      }),
    },
    {
      index: '03',
      title: pick({
        ko: '자율적인 로컬 실행 환경',
        en: 'Autonomous Local Execution',
        ja: '自律型ローカル実行',
        id: 'Eksekusi Lokal Otonom',
      }),
      description: pick({
        ko: '오프라인 우선 원칙과 엣지 AI를 결합해 기술 명세 전 과정을 자동화합니다.',
        en: 'Leveraging offline-first principles and edge AI to automate the entire technical specification cycle.',
        ja: 'オフライン優先原則とエッジAIにより技術仕様サイクル全体を自動化します。',
        id: 'Memanfaatkan prinsip offline-first dan edge AI untuk mengotomatisasi siklus spesifikasi teknis.',
      }),
    },
  ];

  return (
    <EditorialPageLayout
      category={pick({ ko: 'ARCHITECTURAL STATEMENT', en: 'ARCHITECTURAL STATEMENT', ja: 'ARCHITECTURAL STATEMENT', id: 'PERNYATAAN ARSITEKTURAL' })}
      title={t('about_us')}
      subtitle={pick({
        ko: 'GOGUMA는 기획의 직관성과 소프트웨어 엔지니어링의 엄밀함을 하나의 로컬 우선 스튜디오로 결합합니다.',
        en: 'GOGUMA unites planning intuition and software engineering rigor inside a single local-first studio.',
        ja: 'GOGUMAは企画の直感性とソフトウェア工学の厳密さを、ひとつのローカル優先スタジオへ統合します。',
        id: 'GOGUMA menyatukan intuisi perencanaan dan ketelitian rekayasa perangkat lunak dalam satu studio local-first.',
      })}
      tabs={tabs}
      activeTabId="about"
    >
      <EditorialSection chapter={pick({ ko: '비전 (The Vision)', en: 'The Vision', ja: 'ビジョン (The Vision)', id: 'Visi Kami (The Vision)' })}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pt-2">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-[20px] sm:text-[22px] text-[var(--theme-ink-strong)] font-semibold leading-[1.8]">
              {pick({
                ko: '기술 아키텍처는 스케치처럼 직관적이면서도 엔지니어링 청사진처럼 엄밀해야 합니다. GOGUMA는 개념 설계, 비즈니스 요구사항, 그리고 에이전트 기반 개발을 잇는 다리를 제공합니다.',
                en: 'Technical architecture should be as intuitive as a sketch and as rigorous as an engineering blueprint. We provide the bridge between conceptual design, business requirements, and high-level agentic development.',
                ja: '技術アーキテクチャはスケッチのように直感的でありながら、設計図のように厳密であるべきです。GOGUMAは概念設計、ビジネス要件、エージェント開発をつなぐ架け橋です。',
                id: 'Arsitektur teknis harus seintuitif sketsa dan seketat cetak biru rekayasa. Kami menghubungkan desain konseptual, kebutuhan bisnis, dan pengembangan berbasis agen.',
              })}
            </p>
            <p className="text-[19px] sm:text-[20px] text-[var(--theme-ink-body)] leading-[1.85]">
              {pick({
                ko: '본 스튜디오는 단 한 줄의 프로덕션 코드를 작성하기 전에 11종의 핵심 소프트웨어 사양서와 인터랙티브 로컬 프로토타입을 생성하여 AI 환각을 원천 차단합니다.',
                en: 'Our platform generates 11 core software specification documents alongside an interactive local runtime, eliminating AI hallucinations before a single line of production code is written.',
                ja: '本番コードを1行書く前に11種のコアソフトウェア仕様書とインタラクティブなローカルプロトタイプを生成し、AIのハルシネーションを防ぎます。',
                id: 'Platform kami menghasilkan 11 dokumen spesifikasi inti beserta runtime lokal interaktif untuk menghilangkan halusinasi AI sebelum kode produksi ditulis.',
              })}
            </p>
          </div>

          <div className="lg:col-span-6 border-t lg:border-t-0 border-[var(--theme-ink-strong)] divide-y divide-[var(--theme-border-hairline)]">
            {values.map((v) => (
              <div key={v.index} className="py-6 first:pt-0 space-y-2.5">
                <div className="flex items-baseline gap-4">
                  <span className="text-[16px] font-bold tracking-[0.14em] text-[var(--theme-ink-secondary)] tabular-nums">
                    {v.index}
                  </span>
                  <h3 className="text-[22px] sm:text-[24px] font-extrabold text-[var(--theme-ink-strong)] tracking-tight">
                    {v.title}
                  </h3>
                </div>
                <p className="text-[18px] sm:text-[19px] text-[var(--theme-ink-body)] leading-[1.75] pl-10">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </EditorialSection>
    </EditorialPageLayout>
  );
}
