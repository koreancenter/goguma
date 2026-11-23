import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTable,
  EditorialTabItem,
} from '../classic/layout/EditorialPageLayout';

export default function DevNotesPage() {
  const navigate = useNavigate();
  const { pick } = useLanguage();

  const quickTabs: EditorialTabItem[] = [
    { id: 'dev-notes', label: pick({ ko: '개발자 노트', en: 'Dev Notes', ja: '開発者ノート', id: 'Catatan Dev' }), to: '/dev-notes' },
    { id: 'blog', label: pick({ ko: '고구마 블로그', en: 'GOGUMA Blog', ja: 'GOGUMAブログ', id: 'Blog GOGUMA' }), to: '/blog' },
    { id: 'license', label: pick({ ko: '오픈소스 라이선스', en: 'Open Source License', ja: 'オープンソースライセンス', id: 'Lisensi Open Source' }), to: '/license' },
    { id: 'support', label: pick({ ko: '도움말 및 가이드', en: 'Help & Guide', ja: 'ヘルプ・ガイド', id: 'Bantuan & Panduan' }), to: '/support' },
  ];

  return (
    <EditorialPageLayout
      category="ENGINEERING · RELEASE & ARCHITECTURE NOTES"
      title={pick({ ko: '개발자 노트', en: 'Developer Notes', ja: '開発者ノート', id: 'Catatan Pengembang' })}
      subtitle={pick({
        ko: '고구마(GOGUMA) 스튜디오의 버전별 업데이트 내역, 로컬 우선 런타임 구조 및 기술 사양 변경 이력을 기록합니다.',
        en: 'Release history, local-first runtime architecture updates, and technical specification changelogs for GOGUMA Studio.',
        ja: 'GOGUMAスタジオのバージョン別アップデート内容、ローカルファーストランタイム構造、技術仕様変更履歴を記録します。',
        id: 'Catatan pembaruan versi, arsitektur runtime lokal-utama, dan log perubahan teknis untuk GOGUMA Studio.',
      })}
      tabs={quickTabs}
      activeTabId="dev-notes"
      headerActions={
        <button
          type="button"
          onClick={() => navigate('/workspace')}
          className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-[17px] font-bold rounded-none transition-colors cursor-pointer whitespace-nowrap"
        >
          <span>{pick({ ko: '작업실 입장', en: 'Open Workspace', ja: 'ワークスペースへ', id: 'Buka Ruang Kerja' })}</span>
          <ArrowRight size={17} />
        </button>
      }
    >
      <EditorialSection
        chapter={pick({
          ko: 'v2.1 · 에디토리얼 내비게이션 및 풀페이지 아키텍처 통합',
          en: 'v2.1 · Editorial Navigation & Full-Page Architecture',
          ja: 'v2.1 · エディトリアルナビゲーション・フルページ統合',
          id: 'v2.1 · Navigasi Editorial & Arsitektur Halaman Penuh',
        })}
      >
        <ul className="list-disc pl-6 space-y-3">
          <li>
            {pick({
              ko: (
                <>
                  <strong>페이지 전용 상단 메뉴 최적화:</strong> 작업실 외 페이지 경로에서는 [블로그], [환경 설정], [도움말], [작업실 입장] 4개 핵심 내비게이션을 우측 정렬로 배치하고, [도움말] 메뉴에서 모든 정책 문서와 개발자 노트에 즉시 접근할 수 있도록 개편했습니다.
                </>
              ),
              en: (
                <>
                  <strong>Refined Top Navigation Bar:</strong> Streamlined editorial routes with right-aligned core links (Blog, Settings, Help, Workspace) and instant access to all legal &amp; engineering documentation.
                </>
              ),
              ja: (
                <>
                  <strong>ページ専用上部メニュー最適化:</strong> ワークスペース外ページでは主要ナビゲーションを右寄せ配置し、ヘルプメニューから全ポリシー文書と開発者ノートへ即時アクセスできるよう再編しました。
                </>
              ),
              id: (
                <>
                  <strong>Optimasi Navigasi Atas:</strong> Menata menu inti rata kanan di halaman non-ruang kerja dengan akses cepat ke seluruh kebijakan dan catatan teknis.
                </>
              ),
            })}
          </li>
          <li>
            {pick({
              ko: (
                <>
                  <strong>모달에서 에디토리얼 풀페이지로 전환:</strong> 개인정보처리방침, 이용약관, 오픈소스 라이선스, 인공지능 정책, 커뮤니티 이용 규약, 쿠키 정책 및 환경설정/백업/내보내기 화면을 모두 독립 URL 라우트와 에디토리얼 레이아웃으로 재구성했습니다.
                </>
              ),
              en: (
                <>
                  <strong>Full-Page Editorial Routes:</strong> Converted Privacy, Terms, Open Source License, AI Policy, Cookie Policy, Settings, Backup, and Export screens into dedicated URL routes with unified editorial layout.
                </>
              ),
              ja: (
                <>
                  <strong>モーダルからフルページへの刷新:</strong> プライバシーポリシー、利用規約、ライセンス、AIポリシー、設定、バックアップ、エクスポート画面を独立URLルートとして再構成しました。
                </>
              ),
              id: (
                <>
                  <strong>Transisi ke Halaman Editorial Penuh:</strong> Mengubah dialog kebijakan, pengaturan, cadangan, dan ekspor menjadi rute URL mandiri berformat editorial.
                </>
              ),
            })}
          </li>
          <li>
            {pick({
              ko: (
                <>
                  <strong>공통 푸터 및 사계절 테마 적용:</strong> 모든 페이지 하단에 정책 고지 바, Net-to-Dot 멤버십 표기 및 관련 사이트 셀렉터를 일관되게 배치했습니다.
                </>
              ),
              en: (
                <>
                  <strong>Unified Footer &amp; Four-Season Themes:</strong> Standardized policy links, Net-to-Dot membership attribution, and related site selectors alongside five seasonal Ink &amp; Hanji themes.
                </>
              ),
              ja: (
                <>
                  <strong>共通フッターと四季テーマ適用:</strong> 全ページ下部にポリシーリンク、Net-to-Dotメンバー表示、関連サイトセレクターおよび四季テーマを一貫適用しました。
                </>
              ),
              id: (
                <>
                  <strong>Footer Terpadu &amp; Tema Empat Musim:</strong> Menyeragamkan tautan kebijakan, keanggotaan Net-to-Dot, situs terkait, serta lima tema warna musiman.
                </>
              ),
            })}
          </li>
        </ul>
      </EditorialSection>

      <EditorialSection
        chapter={pick({
          ko: 'v2.0 · 11종 사양서 컴파일러 및 샌드박스 프로토타입 엔진',
          en: 'v2.0 · 11-Artifact Spec Compiler & Sandbox Prototype Engine',
          ja: 'v2.0 · 11種仕様書コンパイラ・サンドボックスプロトタイプ',
          id: 'v2.0 · Kompiler 11 Spesifikasi & Mesin Prototipe Sandbox',
        })}
      >
        <ul className="list-disc pl-6 space-y-3">
          <li>
            {pick({
              ko: (
                <>
                  <strong>9-Chapter 18-Section 통합 엔진:</strong> 서비스 개요부터 빅테크 표준 로드맵과 산출물 검수까지 입력된 원고를 단일 <code>SitePlan</code> 상태로 정규화하여 실시간 미리보기와 사양서 문서를 동기화합니다.
                </>
              ),
              en: (
                <>
                  <strong>9-Chapter 18-Section Engine:</strong> Normalizes manuscripts across 9 chapters into a unified <code>SitePlan</code> graph, keeping live previews and generated documents in lockstep.
                </>
              ),
              ja: (
                <>
                  <strong>9-Chapter 18-Section 統合エンジン:</strong> 入力原稿を単一の <code>SitePlan</code> 状態へ正規化し、ライブプレビューと仕様書をリアルタイム同期します。
                </>
              ),
              id: (
                <>
                  <strong>Mesin Terpadu 9-Bab 18-Bagian:</strong> Menormalisasi draf naskah menjadi grafik <code>SitePlan</code> tunggal agar pratinjau dan dokumen tetap sinkron.
                </>
              ),
            })}
          </li>
          <li>
            {pick({
              ko: (
                <>
                  <strong>11종 개발 산출물 번들 추출:</strong> PRD, 아키텍처 정의서, DB 스키마, API 명세, 디자인 토큰, QA 시나리오, 실행 플레이북을 Markdown / JSON 포맷으로 즉시 추출할 수 있습니다.
                </>
              ),
              en: (
                <>
                  <strong>11-Doc Specification Bundle:</strong> Export PRD, Architecture, DB Schema, API Contracts, Design Tokens, QA Scenarios, and Execution Playbook in Markdown / JSON formats.
                </>
              ),
              ja: (
                <>
                  <strong>11種開発成果物バンドル書出:</strong> PRD、アーキテクチャ、DBスキーマ、API仕様、デザイントークン、QAシナリオ、実行プレイブックをMarkdown / JSONで即座に出力できます。
                </>
              ),
              id: (
                <>
                  <strong>Ekstraksi Bundel 11 Spesifikasi:</strong> Hasilkan PRD, arsitektur, skema DB, kontrak API, token desain, skenario QA, dan playbook eksekusi dalam Markdown / JSON.
                </>
              ),
            })}
          </li>
          <li>
            {pick({
              ko: (
                <>
                  <strong>인브라우저 프로토타입 컴파일러:</strong> 작성 중인 화면 목록과 내비게이션 구조를 클라이언트 내부에서 즉시 인터랙티브 HTML/SVG 프리뷰로 렌더링합니다.
                </>
              ),
              en: (
                <>
                  <strong>In-Browser Prototype Compiler:</strong> Renders screens and navigation hierarchies as interactive HTML/SVG previews completely client-side.
                </>
              ),
              ja: (
                <>
                  <strong>インブラウザ・プロトタイプコンパイラ:</strong> 画面構成とナビゲーション構造をクライアント側で即座にインタラクティブなHTML/SVGプレビューとして描画します。
                </>
              ),
              id: (
                <>
                  <strong>Kompiler Prototipe di Browser:</strong> Merender daftar layar dan navigasi menjadi pratinjau HTML/SVG interaktif langsung di sisi klien.
                </>
              ),
            })}
          </li>
        </ul>
      </EditorialSection>

      <EditorialSection
        chapter={pick({
          ko: 'v1.5 · 100% 로컬 우선 IndexedDB 및 3계층 하이브리드 AI',
          en: 'v1.5 · 100% Local-First IndexedDB & 3-Tier Hybrid AI',
          ja: 'v1.5 · 100%ローカルファーストIndexedDB・3層ハイブリッドAI',
          id: 'v1.5 · 100% IndexedDB Lokal-Utama & AI Hibrida 3-Lapis',
        })}
      >
        <EditorialTable
          headers={[
            pick({ ko: '구분', en: 'Layer', ja: '区分', id: 'Lapisan' }),
            pick({ ko: '구현 모듈', en: 'Module', ja: '実装モジュール', id: 'Modul' }),
            pick({ ko: '기술 사양', en: 'Technical Spec', ja: '技術仕様', id: 'Spesifikasi Teknis' }),
            pick({ ko: '비고', en: 'Notes', ja: '備考', id: 'Catatan' }),
          ]}
          rows={[
            [
              pick({ ko: '로컬 영속성 계층', en: 'Local Persistence', ja: 'ローカル永続化層', id: 'Persistensi Lokal' }),
              'IndexedDB Storage',
              pick({
                ko: '원격 DB 없이 브라우저 내부에 프로젝트·섹션·스냅샷 저장',
                en: 'Stores projects, sections, and snapshots locally without any remote DB',
                ja: 'リモートDBなしでブラウザ内部にプロジェクト・セクション・スナップショットを保存',
                id: 'Menyimpan proyek, bagian, dan snapshot langsung di browser tanpa DB jarak jauh',
              }),
              pick({ ko: 'JSON 전체 백업/복원 지원', en: 'Full JSON backup & restore', ja: 'JSON全体バックアップ・復元対応', id: 'Dukungan cadangan & pulihkan JSON' }),
            ],
            [
              pick({ ko: '인공지능 추론 계층', en: 'AI Inference', ja: 'AI推論層', id: 'Inferensi AI' }),
              'Gemini BYOK / Ollama / WebLLM',
              pick({
                ko: '클라우드 API 키 직결, 로컬 데몬(11434), WebGPU 인브라우저 실행',
                en: 'Direct BYOK cloud call, local daemon (11434), or in-browser WebGPU',
                ja: 'クラウドAPIキー直結、ローカルデーモン(11434)、WebGPUブラウザ実行',
                id: 'Kunci API cloud langsung, daemon lokal (11434), atau WebGPU di browser',
              }),
              pick({ ko: 'Zero-Training 원칙 준수', en: 'Strict Zero-Training policy', ja: 'Zero-Training原則準拠', id: 'Kebijakan Zero-Training' }),
            ],
            [
              pick({ ko: '인증 및 프로필', en: 'Identity & Profiles', ja: '認証・プロフィール', id: 'Identitas & Profil' }),
              'Local Profile Gateway',
              pick({
                ko: '기기 단위 로컬 프로필 생성 및 게스트 즉시 입장',
                en: 'Device-scoped local profiles and instant guest workspace entry',
                ja: '端末単位のローカルプロフィール作成およびゲスト即時入場',
                id: 'Pembuatan profil lokal per perangkat dan akses tamu instan',
              }),
              pick({ ko: '외부 계정 연동 불필요', en: 'No external account required', ja: '外部アカウント連携不要', id: 'Tanpa akun eksternal' }),
            ],
            [
              pick({ ko: '디자인 시스템', en: 'Design System', ja: 'デザインシステム', id: 'Sistem Desain' }),
              'Sumi Ink & Hanji Paper',
              pick({
                ko: 'Tailwind CSS 순수 유틸리티 클래스 기반 0px~2px 각진 레이아웃',
                en: 'Pure Tailwind utility-class architecture with crisp 0px–2px hairline framing',
                ja: 'Tailwind CSSユーティリティベースの0px〜2px端正なレイアウト',
                id: 'Kelas utilitas Tailwind murni dengan sudut tegas 0px–2px',
              }),
              pick({ ko: '무서드파티 UI 라이브러리', en: 'Zero external UI kit bloat', ja: 'サードパーティUIライブラリ不使用', id: 'Tanpa pustaka UI pihak ketiga' }),
            ],
          ]}
        />
      </EditorialSection>
    </EditorialPageLayout>
  );
}
