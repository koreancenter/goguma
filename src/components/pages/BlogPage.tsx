import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Language } from '../../types';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTabItem,
} from '../classic/layout/EditorialPageLayout';

interface BlogArticle {
  id: string;
  category: 'architecture' | 'design' | 'local-first';
  categoryLabel: string;
  date: string;
  readTime: string;
  title: string;
  summary: string;
  body: string[];
}

function getArticles(language: Language): BlogArticle[] {
  const articlesByLang: Record<Language, BlogArticle[]> = {
    ko: [
      {
        id: 'local-first-philosophy',
        category: 'local-first',
        categoryLabel: 'LOCAL-FIRST',
        date: '2026.11',
        readTime: '4 MIN READ',
        title: '왜 소프트웨어 기획 도구에 중앙 서버가 필요하지 않은가',
        summary:
          '아이디어와 시스템 아키텍처는 기업과 개발자의 가장 민감한 지적 자산입니다. GOGUMA가 모든 사양 데이터를 브라우저 IndexedDB 내부에만 격리하는 이유를 설명합니다.',
        body: [
          '기존 클라우드 기반 기획 도구는 계정 로그인, 월간 구독, 그리고 모든 초안의 중앙 서버 업로드를 전제로 합니다. 그러나 초기 서비스 기획서, 데이터베이스 스키마, 내부 비즈니스 규칙은 외부 서버에 상시 저장할 필요가 없는 극도로 민감한 설계 문서입니다.',
          'GOGUMA 스튜디오는 브라우저 표준 IndexedDB와 순수 클라이언트 사이드 직렬화 엔진 위에서 동작합니다. 네트워크가 단절된 비행기 안이나 사내 보안망 환경에서도 0ms에 가까운 반응 속도로 8개 챕터 사양서를 작성하고 JSON 번들로 백업할 수 있습니다.',
        ],
      },
      {
        id: 'eleven-artifact-compiler',
        category: 'architecture',
        categoryLabel: 'ARCHITECTURE',
        date: '2026.10',
        readTime: '5 MIN READ',
        title: '하나의 원고에서 11종 개발 사양서와 실행형 프로토타입까지',
        summary:
          '기획자의 문장이 AI 코딩 에이전트와 엔지니어가 즉시 실행 가능한 개발 지침서(Playbook)로 변환되는 8-Chapter 17-Section 컴파일 파이프라인을 소개합니다.',
        body: [
          '기획과 개발 사이의 간극은 대개 모호한 자연어에서 비롯됩니다. 화면 흐름, 상태 전이, 데이터 엔터티, 예외 처리 규칙이 서로 다른 문서에 흩어져 있을 때 AI 어시스턴트와 개발 팀 모두 잘못된 가정을 하게 됩니다.',
          'GOGUMA는 서비스 개요(Chapter 1)부터 산출물 검수(Chapter 8)까지 17개 구조화 섹션을 단일 JSON 그래프(SitePlan)로 결합합니다. 이를 바탕으로 PRD, 유저 플로우, DB 스키마, API 명세, 테스트 시나리오 등 11종의 표준 사양서와 실시간 HTML/SVG 프로토타입을 동시에 컴파일합니다.',
        ],
      },
      {
        id: 'sumi-ink-hanji-editorial',
        category: 'design',
        categoryLabel: 'DESIGN SYSTEM',
        date: '2026.09',
        readTime: '3 MIN READ',
        title: '먹색(Sumi Ink)과 한지(Hanji Paper) 위의 에디토리얼 미니멀리즘',
        summary:
          '장식적인 그림자와 무분별한 배지를 덜어내고, 오직 타이포그래피와 1px 헤어라인 경계선만으로 집중력을 극대화한 GOGUMA 디자인 헌장을 공개합니다.',
        body: [
          '사양서를 작성하는 작업실은 화려한 대시보드가 아니라 정갈한 원고지여야 합니다. GOGUMA는 순백의 캔버스(#FFFFFF)와 온기 있는 한지 톤(#F6F5F1), 그리고 단단한 먹색(#000000)의 대비만으로 정보의 위계를 구축합니다.',
          '불필요한 장식과 알림 배지를 배제하고, 직각 모서리(0px~2px)와 명확한 텍스트 위계를 적용해 장시간 기획 집필 시에도 시각적 피로를 최소화합니다.',
        ],
      },
    ],
    en: [
      {
        id: 'local-first-philosophy',
        category: 'local-first',
        categoryLabel: 'LOCAL-FIRST',
        date: '2026.11',
        readTime: '4 MIN READ',
        title: 'Why Software Specification Tools Do Not Need a Central Server',
        summary:
          'Product ideas and system architecture are your most sensitive intellectual assets. Here is why GOGUMA isolates every specification strictly inside browser IndexedDB.',
        body: [
          'Conventional cloud planning tools assume account walls, monthly subscriptions, and constant server uploads. Yet early product PRDs, data schemas, and business rules rarely belong on third-party central servers.',
          'GOGUMA runs on standard browser IndexedDB and a pure client-side compiler. Even on an offline flight or inside a restricted intranet, you can author 8-chapter specifications with near-zero latency and export portable JSON backups.',
        ],
      },
      {
        id: 'eleven-artifact-compiler',
        category: 'architecture',
        categoryLabel: 'ARCHITECTURE',
        date: '2026.10',
        readTime: '5 MIN READ',
        title: 'From One Manuscript to 11 Engineering Specs & Live Prototypes',
        summary:
          'Explore the 8-chapter, 17-section compilation pipeline that transforms natural-language intent into an AI-ready execution playbook.',
        body: [
          'The gap between planning and engineering usually starts with fragmented prose. When flows, state transitions, schemas, and edge cases live in separate docs, engineers and coding agents make conflicting assumptions.',
          'GOGUMA unifies 17 structured sections into a single SitePlan graph, compiling 11 deterministic artifacts (PRD, user flows, DB schema, API contracts, QA scenarios) alongside a live HTML/SVG prototype.',
        ],
      },
      {
        id: 'sumi-ink-hanji-editorial',
        category: 'design',
        categoryLabel: 'DESIGN SYSTEM',
        date: '2026.09',
        readTime: '3 MIN READ',
        title: 'Editorial Minimalism on Sumi Ink & Hanji Paper',
        summary:
          'Stripping away decorative shadows and noisy badges to build an architectural studio guided solely by typography and 1px hairline borders.',
        body: [
          'A specification studio should feel like crisp manuscript paper rather than a crowded dashboard. GOGUMA establishes visual hierarchy purely through warm Hanji surfaces, Sumi ink contrast, and restrained borders.',
          'Zero-to-2px crisp corners and deliberate editorial spacing keep visual fatigue low during long architecture sessions.',
        ],
      },
    ],
    ja: [
      {
        id: 'local-first-philosophy',
        category: 'local-first',
        categoryLabel: 'LOCAL-FIRST',
        date: '2026.11',
        readTime: '4 MIN READ',
        title: 'なぜソフトウェア企画ツールに中央サーバーが不要なのか',
        summary:
          'アイデアとシステムアーキテクチャは最も機密性の高い知的資産です。GOGUMAがすべての仕様データをブラウザのIndexedDB内に隔離する理由を解説します。',
        body: [
          '従来のクラウド型企画ツールは、ログイン、月額課金、および下書きのサーバー送信を前提としています。しかし初期のPRDやDBスキーマ、業務ルールは外部サーバーに常時保存する必要のない機密設計書です。',
          'GOGUMAスタジオは標準ブラウザのIndexedDBと純粋なクライアント側シリアライザ上で動作します。オフライン環境でも遅延ゼロの操作感で8章仕様書を作成し、JSONバンドルとして保存できます。',
        ],
      },
      {
        id: 'eleven-artifact-compiler',
        category: 'architecture',
        categoryLabel: 'ARCHITECTURE',
        date: '2026.10',
        readTime: '5 MIN READ',
        title: '一つの原稿から11種の開発仕様書と実行可能プロトタイプまで',
        summary:
          '企画者の文章がAIコーディングエージェントやエンジニア向けに即実行可能な開発プレイブックへと変換されるパイプラインを紹介します。',
        body: [
          '企画と開発のギャップは曖昧な自然言語から生まれます。画面遷移、状態管理、データモデル、例外処理が別々の文書に散在すると、チームもAIも誤った前提を置いてしまいます。',
          'GOGUMAは17の構造化セクションを単一のSitePlanグラフに統合し、PRD、ユーザーフロー、DBスキーマ、API仕様、テストシナリオなど11種の標準仕様書とHTML/SVGプロトタイプを同時にコンパイルします。',
        ],
      },
      {
        id: 'sumi-ink-hanji-editorial',
        category: 'design',
        categoryLabel: 'DESIGN SYSTEM',
        date: '2026.09',
        readTime: '3 MIN READ',
        title: '墨色（Sumi Ink）と韓紙（Hanji Paper）のエディトリアルデザイン',
        summary:
          '過剰なシャドウやバッジを削ぎ落とし、タイポグラフィと1pxのヘアライン境界線のみで集中力を高めるGOGUMAデザイン憲章。',
        body: [
          '仕様書を書く作業場は派手なダッシュボードではなく、端正な原稿用紙であるべきです。GOGUMAは温かみのある韓紙トーンと引き締まった墨色のコントラストだけで情報階層を構築します。',
          '直線的な角丸（0〜2px）と明確な文字階層により、長時間の設計作業でも視覚的疲労を最小限に抑えます。',
        ],
      },
    ],
    id: [
      {
        id: 'local-first-philosophy',
        category: 'local-first',
        categoryLabel: 'LOCAL-FIRST',
        date: '2026.11',
        readTime: '4 MIN READ',
        title: 'Mengapa Alat Spesifikasi Perangkat Lunak Tidak Memerlukan Server Pusat',
        summary:
          'Ide produk dan arsitektur sistem adalah aset intelektual paling sensitif Anda. Simak mengapa GOGUMA mengisolasi seluruh data spesifikasi di dalam IndexedDB browser.',
        body: [
          'Alat perencanaan cloud konvensional mewajibkan login, langganan bulanan, dan unggahan ke server pusat. Padahal PRD awal, skema database, dan aturan bisnis sensitif tidak seharusnya tersimpan di server pihak ketiga.',
          'GOGUMA berjalan di atas IndexedDB standar browser dan kompiler sisi klien murni. Bahkan saat offline atau di jaringan internal tertutup, Anda dapat menyusun spesifikasi 8 bab tanpa latensi dan mengekspornya sebagai JSON.',
        ],
      },
      {
        id: 'eleven-artifact-compiler',
        category: 'architecture',
        categoryLabel: 'ARCHITECTURE',
        date: '2026.10',
        readTime: '5 MIN READ',
        title: 'Dari Satu Naskah Menjadi 11 Spesifikasi Teknis & Prototipe Langsung',
        summary:
          'Jelajahi pipeline kompilasi 8-bab 17-bagian yang mengubah rancangan bahasa alami menjadi playbook eksekusi siap-pakai bagi developer dan agen AI.',
        body: [
          'Celah antara perencana dan engineer sering muncul karena dokumen yang terfragmentasi. Ketika alur layar, skema data, dan aturan pengecualian tersebar di banyak file, implementasi rawan meleset.',
          'GOGUMA menyatukan 17 bagian terstruktur ke dalam satu grafik SitePlan, menghasilkan 11 dokumen standar (PRD, alur pengguna, skema DB, kontrak API, skenario QA) beserta prototipe HTML/SVG interaktif.',
        ],
      },
      {
        id: 'sumi-ink-hanji-editorial',
        category: 'design',
        categoryLabel: 'DESIGN SYSTEM',
        date: '2026.09',
        readTime: '3 MIN READ',
        title: 'Minimalisme Editorial di Atas Tinta Sumi & Kertas Hanji',
        summary:
          'Menghilangkan bayangan dekoratif dan lencana berlebihan untuk menghadirkan ruang kerja arsitektur yang bertumpu pada tipografi dan garis tipis 1px.',
        body: [
          'Ruang menyusun spesifikasi semestinya terasa seperti kertas naskah yang bersih, bukan dasbor yang bising. GOGUMA membangun hierarki visual melalui kontras kertas Hanji hangat dan tinta Sumi.',
          'Sudut tegas 0–2px dan spasi editorial menjaga fokus serta mengurangi kelelahan mata selama sesi perancangan panjang.',
        ],
      },
    ],
  };

  return articlesByLang[language] || articlesByLang.ko;
}

export default function BlogPage() {
  const navigate = useNavigate();
  const { language, pick } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'local-first' | 'architecture' | 'design'>('all');

  const articles = getArticles(language);

  const tabs: EditorialTabItem[] = [
    { id: 'all', label: pick({ ko: '전체 아티클', en: 'All Articles', ja: 'すべての記事', id: 'Semua Artikel' }), onClick: () => setSelectedCategory('all') },
    { id: 'local-first', label: pick({ ko: '로컬 우선 아키텍처', en: 'Local-First', ja: 'ローカルファースト', id: 'Lokal-Utama' }), onClick: () => setSelectedCategory('local-first') },
    { id: 'architecture', label: pick({ ko: '사양서 컴파일러', en: 'Spec Compiler', ja: '仕様書コンパイラ', id: 'Kompiler Spesifikasi' }), onClick: () => setSelectedCategory('architecture') },
    { id: 'design', label: pick({ ko: '디자인 에디토리얼', en: 'Design System', ja: 'デザインシステム', id: 'Sistem Desain' }), onClick: () => setSelectedCategory('design') },
  ];

  const visibleArticles =
    selectedCategory === 'all'
      ? articles
      : articles.filter((article) => article.category === selectedCategory);

  return (
    <EditorialPageLayout
      category="EDITORIAL · GOGUMA JOURNAL"
      title={pick({ ko: '고구마 블로그', en: 'GOGUMA Journal', ja: 'GOGUMAブログ', id: 'Jurnal GOGUMA' })}
      subtitle={pick({
        ko: '로컬 우선 소프트웨어 아키텍처, 사양서 중심 개발 방법론 및 에디토리얼 디자인에 관한 고구마 스튜디오 팀의 기록입니다.',
        en: 'Notes from the GOGUMA team on local-first architecture, spec-driven development, and editorial minimalist design.',
        ja: 'ローカルファーストアーキテクチャ、仕様書駆動開発、エディトリアルデザインに関するGOGUMAスタジオチームの記録です。',
        id: 'Catatan tim GOGUMA tentang arsitektur lokal-utama, pengembangan berbasis spesifikasi, dan desain editorial minimalis.',
      })}
      tabs={tabs}
      activeTabId={selectedCategory}
      headerActions={
        <button
          type="button"
          onClick={() => navigate('/dev-notes')}
          className="px-6 py-3.5 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-[17px] font-bold rounded-none transition-colors cursor-pointer whitespace-nowrap"
        >
          {pick({ ko: '개발자 노트 보기', en: 'View Dev Notes', ja: '開発者ノートを見る', id: 'Lihat Catatan Rilis' })}
        </button>
      }
    >
      <div className="space-y-14">
        {visibleArticles.map((article, idx) => (
          <EditorialSection
            key={article.id}
            chapter={`0${idx + 1} · ${article.title}`}
          >
            <div className="flex flex-wrap items-center gap-3 text-[16px] font-bold uppercase tracking-[0.14em] text-[var(--theme-ink-secondary)] pb-1">
              <span className="px-3 py-1 bg-[var(--theme-active-bg)] text-[var(--theme-active-text)]">{article.categoryLabel}</span>
              <span>{article.date}</span>
              <span>·</span>
              <span>{article.readTime}</span>
            </div>

            <p className="text-[21px] sm:text-[23px] font-bold text-[var(--theme-ink-strong)] leading-[1.7]">
              {article.summary}
            </p>

            <div className="space-y-4 pt-2">
              {article.body.map((paragraph, pIdx) => (
                <p key={pIdx} className="text-[19px] sm:text-[21px] text-[var(--theme-ink-body)] leading-[1.9]">
                  {paragraph}
                </p>
              ))}
            </div>
          </EditorialSection>
        ))}

        <div className="border-t-2 border-[var(--theme-ink-strong)] pt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-[24px] sm:text-[26px] font-extrabold text-[var(--theme-ink-strong)]">
              {pick({
                ko: '직접 사양서를 작성해 보세요',
                en: 'Start Writing Your Specification',
                ja: '今すぐ仕様書を作成してみましょう',
                id: 'Mulai Tulis Spesifikasi Anda',
              })}
            </h2>
            <p className="text-[18px] sm:text-[19px] text-[var(--theme-ink-secondary)]">
              {pick({
                ko: '별도의 로그인이나 서버 연동 없이 브라우저에서 즉시 기획 작업을 시작할 수 있습니다.',
                en: 'Start architecting immediately in your browser with zero account sign-up or server dependency.',
                ja: 'アカウント登録やサーバー連携なしで、ブラウザ上ですぐに企画作業を始められます。',
                id: 'Mulai merancang langsung di browser tanpa perlu pendaftaran akun atau koneksi server.',
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/workspace')}
            className="inline-flex items-center gap-2.5 px-7 py-4 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-[18px] font-bold rounded-none transition-colors cursor-pointer shrink-0"
          >
            <span>{pick({ ko: '작업실 입장', en: 'Open Workspace', ja: 'ワークスペースへ', id: 'Buka Ruang Kerja' })}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </EditorialPageLayout>
  );
}
