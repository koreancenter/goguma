import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTable,
  getLegalNavTabs,
} from '../layout/EditorialPageLayout';

export default function CommunityTermsPage() {
  const { language, pick } = useLanguage();
  const legalTabs = getLegalNavTabs(language);

  return (
    <EditorialPageLayout
      category="COMMUNITY · OPEN PRINCIPLES"
      title={pick({ ko: '커뮤니티 이용 규약', en: 'Community Guidelines', ja: 'コミュニティ利用規約', id: 'Pedoman Komunitas' })}
      subtitle={pick({
        ko: '고구마(GOGUMA) 오픈소스 생태계의 로컬 우선 원칙, 상호 존중 기준 및 GitHub 기여 절차를 안내합니다.',
        en: 'Outlines local-first principles, mutual respect standards, and GitHub contribution workflows for the GOGUMA ecosystem.',
        ja: 'GOGUMA オープンソースエコシステムのローカル優先原則、相互尊重基準、GitHub貢献手順をご案内します。',
        id: 'Menjelaskan prinsip local-first, standar saling menghormati, dan alur kontribusi GitHub dalam ekosistem GOGUMA.',
      })}
      tabs={legalTabs}
      activeTabId="community-terms"
    >
      <EditorialSection chapter={pick({ ko: '제1조 (로컬 우선 및 종속 배제 선언)', en: 'Article 1 · Local-First & Anti-Lock-In Pledge', ja: '第1条（ローカル優先・ロックイン排除宣言）', id: 'Pasal 1 · Deklarasi Local-First & Bebas Lock-In' })}>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>
            {pick({
              ko: '고구마 프로젝트의 모든 공식 기여물과 확장 기능은 이용자의 로컬 브라우저 데이터 주권(Local-First)을 침해하지 않아야 합니다.',
              en: 'All official contributions and extensions must respect users’ browser data sovereignty (Local-First).',
              ja: 'GOGUMAの公式コントリビューションおよび拡張機能は、ユーザーのローカルデータ主権を侵害してはなりません。',
              id: 'Seluruh kontribusi dan ekstensi resmi harus menghormati kedaulatan data browser lokal pengguna.',
            })}
          </li>
          <li>
            {pick({
              ko: '외부 유료 구독 강제, 숨겨진 텔레메트리 트래커 삽입, 무단 데이터 수집 코드 삽입은 커뮤니티 원칙에 위배되며 허용되지 않습니다.',
              en: 'Forced paid subscriptions, hidden telemetry trackers, or unauthorized data collection are strictly prohibited.',
              ja: '有料サブスクリプションの強制、隠しテレメトリの挿入、無断データ収集コードの追加は認められません。',
              id: 'Langganan berbayar paksa, pelacak telemetri tersembunyi, atau kode pengumpul data tanpa izin dilarang keras.',
            })}
          </li>
        </ol>
      </EditorialSection>

      <EditorialSection chapter={pick({ ko: '제2조 (오픈소스 기여 및 소통 채널)', en: 'Article 2 · Open Source Contributions & Channels', ja: '第2条（オープンソース貢献および連絡チャネル）', id: 'Pasal 2 · Kontribusi Sumber Terbuka & Kanal' })}>
        <EditorialTable
          headers={[
            pick({ ko: '구분', en: 'Category', ja: '区分', id: 'Kategori' }),
            pick({ ko: '참여 방법 및 기준', en: 'Guidelines', ja: '参加方法と基準', id: 'Cara Berpartisipasi' }),
            pick({ ko: '공식 경로', en: 'Official Channel', ja: '公式チャネル', id: 'Kanal Resmi' }),
          ]}
          rows={[
            [
              pick({ ko: '소스코드 및 템플릿 기여', en: 'Code & Template PRs', ja: 'ソースコード・テンプレート貢献', id: 'Kontribusi Kode & Templat' }),
              pick({ ko: 'MIT 라이선스 호환 Pull Request 제출 · 표준 기획서 템플릿 제안', en: 'MIT-compatible Pull Requests & standard PRD templates', ja: 'MIT互換Pull Request提出・標準企画書テンプレート提案', id: 'Pull Request kompatibel MIT & usulan templat PRD standar' }),
              'https://github.com/koreancenter/goguma.git',
            ],
            [
              pick({ ko: '버그 제보 및 기능 요청', en: 'Bug Reports & Feature Requests', ja: 'バグ報告・機能要望', id: 'Laporan Bug & Permintaan Fitur' }),
              pick({ ko: '재현 절차 및 환경 정보(브라우저/로컬 엔진)를 포함하여 이슈 등록', en: 'Include reproduction steps and browser/engine environment', ja: '再現手順と環境情報（ブラウザ/ローカルエンジン）を明記して登録', id: 'Sertakan langkah reproduksi & info lingkungan (browser/mesin)' }),
              'GitHub Issues · master@goguma.app',
            ],
            [
              pick({ ko: '커뮤니티 행동 강령', en: 'Code of Conduct', ja: '行動規範', id: 'Kode Etik Komunitas' }),
              pick({ ko: '언어, 경력, 배경에 관계없이 모든 기여자에 대한 상호 존중과 건설적 코드 리뷰 준수', en: 'Mutual respect and constructive reviews regardless of background', ja: '言語や経歴を問わず相互尊重と建設的なレビューを遵守', id: 'Saling menghormati dan ulasan konstruktif tanpa memandang latar belakang' }),
              pick({ ko: '모든 온라인·오프라인 협업 공간 공통 적용', en: 'Applies to all online & offline spaces', ja: 'オンライン・オフライン共通適用', id: 'Berlaku di semua ruang kolaborasi' }),
            ],
          ]}
        />
      </EditorialSection>

      <EditorialSection chapter={pick({ ko: '제3조 (금지 행위)', en: 'Article 3 · Prohibited Conduct', ja: '第3条（禁止行為）', id: 'Pasal 3 · Tindakan yang Dilarang' })}>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            {pick({
              ko: '타인의 지식재산권 또는 오픈소스 라이선스 표기를 무단으로 삭제·도용하여 재배포하는 행위',
              en: 'Removing copyright/license notices or redistributing proprietary code without permission.',
              ja: '他者の知的財産権やオープンソースライセンス表記を無断で削除・盗用して再配布する行為',
              id: 'Menghapus pemberitahuan lisensi atau mendistribusikan ulang karya pihak lain tanpa izin.',
            })}
          </li>
          <li>
            {pick({
              ko: '악성 스크립트, 추적 픽셀 또는 이용자의 로컬 IndexedDB 데이터를 훼손하는 코드를 유포하는 행위',
              en: 'Distributing malicious scripts, tracking pixels, or code that corrupts local IndexedDB storage.',
              ja: '悪意のあるスクリプト、追跡ピクセル、ローカルIndexedDBデータを破損させるコードの配布',
              id: 'Menyebarkan skrip berbahaya, piksel pelacak, atau kode yang merusak IndexedDB lokal.',
            })}
          </li>
          <li>
            {pick({
              ko: '커뮤니티 채널 내 비방, 차별적 언행 및 영리 목적의 무단 스팸 게시 행위',
              en: 'Harassment, discriminatory remarks, or unsolicited commercial spam in community channels.',
              ja: 'コミュニティ内での誹謗中傷、差別的言動、および営利目的のスパム投稿',
              id: 'Pelecehan, ucapan diskriminatif, atau spam komersial di kanal komunitas.',
            })}
          </li>
        </ul>
      </EditorialSection>
    </EditorialPageLayout>
  );
}
