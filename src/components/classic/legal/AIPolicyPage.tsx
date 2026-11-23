import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTable,
  getLegalNavTabs,
} from '../layout/EditorialPageLayout';

export default function AIPolicyPage() {
  const { language, pick } = useLanguage();
  const legalTabs = getLegalNavTabs(language);

  return (
    <EditorialPageLayout
      category="POLICY · ARTIFICIAL INTELLIGENCE"
      title={pick({ ko: '인공지능 정책', en: 'AI Policy', ja: 'AI ポリシー', id: 'Kebijakan AI' })}
      subtitle={pick({
        ko: '고구마(GOGUMA) 스튜디오의 인공지능 추론 계층, 모델 학습 배제(Zero-Training) 원칙 및 사용자 통제권을 명시합니다.',
        en: 'Specifies GOGUMA Studio’s AI inference layers, Zero-Training commitment, and full user control.',
        ja: 'GOGUMAスタジオのAI推論レイヤー、モデル学習除外（Zero-Training）原則、およびユーザーの管理権を定めます。',
        id: 'Menjelaskan lapisan inferensi AI GOGUMA Studio, prinsip Tanpa Pelatihan (Zero-Training), dan kendali penuh pengguna.',
      })}
      tabs={legalTabs}
      activeTabId="ai-policy"
    >
      <EditorialSection chapter={pick({ ko: '제1조 (인공지능 활용 기본 원칙)', en: 'Article 1 · Core AI Principles', ja: '第1条（AI活用の基本原則）', id: 'Pasal 1 · Prinsip Dasar AI' })}>
        <p>
          {pick({
            ko: '고구마(GOGUMA)는 기획자의 사고를 대체하는 자동화 도구가 아니라, 로컬 우선 작업 흐름 위에서 사양서 초안 작성과 구조 검증을 보조하는 투명한 인공지능 지원 정책을 따릅니다. 모든 AI 실행 여부는 전적으로 이용자의 명시적 호출에 의해서만 동작합니다.',
            en: 'GOGUMA is not an automated tool that replaces human planning. It provides transparent AI assistance for drafting specifications and validating architecture on top of a local-first workflow, executing strictly on explicit user invocation.',
            ja: 'GOGUMAは企画者の思考を代替する自動化ツールではなく、ローカル優先ワークフロー上で仕様書ドラフト作成と構造検証を補助する透明なAI支援方針を採用しています。すべてのAI実行はユーザーの明示的な操作時のみ作動します。',
            id: 'GOGUMA bukan alat otomatis yang menggantikan pemikiran perencana, melainkan asisten AI transparan untuk menyusun draf spesifikasi dan memvalidasi struktur pada alur kerja local-first yang hanya berjalan atas perintah eksplisit pengguna.',
          })}
        </p>
      </EditorialSection>

      <EditorialSection chapter={pick({ ko: '제2조 (3계층 하이브리드 추론 아키텍처 비교)', en: 'Article 2 · 3-Tier Hybrid Inference Architecture', ja: '第2条（3層ハイブリッド推論アーキテクチャ比較）', id: 'Pasal 2 · Arsitektur Inferensi Hibrida 3 Lapis' })}>
        <p>
          {pick({
            ko: '이용자는 [환경 설정 > 인공지능 엔진] 페이지에서 작업 보안 수준과 환경에 맞는 추론 계층을 자유롭게 선택할 수 있습니다.',
            en: 'Users can freely choose the inference tier matching their security level and environment in [Settings > AI Engine].',
            ja: 'ユーザーは［環境設定 ＞ AIエンジン］画面から、セキュリティ要件や利用環境に応じた推論レイヤーを自由に選択できます。',
            id: 'Pengguna bebas memilih lapisan inferensi sesuai tingkat keamanan dan lingkungan di halaman [Pengaturan > Mesin AI].',
          })}
        </p>
        <EditorialTable
          headers={[
            pick({ ko: '구분', en: 'Engine Tier', ja: '区分', id: 'Tingkatan' }),
            pick({ ko: '처리 위치', en: 'Execution Location', ja: '処理場所', id: 'Lokasi Proses' }),
            pick({ ko: '모델 재학습 활용 여부', en: 'Model Training Usage', ja: 'モデル学習への利用', id: 'Penggunaan Pelatihan' }),
            pick({ ko: '키·인증 방식', en: 'Key / Auth Method', ja: 'キー・認証方式', id: 'Metode Kunci' }),
            pick({ ko: '오프라인 지원', en: 'Offline Support', ja: 'オフライン対応', id: 'Dukungan Offline' }),
          ]}
          rows={[
            [
              'Google Gemini (BYOK / Proxy)',
              pick({ ko: 'Google Cloud Gemini API 엔드포인트', en: 'Google Cloud Gemini API Endpoint', ja: 'Google Cloud Gemini API エンドポイント', id: 'Endpoint API Google Cloud Gemini' }),
              pick({ ko: '활용 안 함 (Zero-Training 원칙 준수)', en: 'Never used (Zero-Training policy)', ja: '利用しない（Zero-Training 原則遵守）', id: 'Tidak pernah digunakan (Zero-Training)' }),
              pick({ ko: '이용자 개인 API 키 로컬 보관 (선택 사항)', en: 'User BYOK API key stored locally', ja: '個人APIキーをローカル保管（任意）', id: 'Kunci API pribadi disimpan lokal' }),
              pick({ ko: '미지원 (온라인 추론)', en: 'Not supported (Online inference)', ja: '非対応（オンライン推論）', id: 'Tidak didukung (Inferensi daring)' }),
            ],
            [
              'Ollama Local Server',
              pick({ ko: '이용자 PC 로컬 데몬 (localhost:11434)', en: 'Local PC Daemon (localhost:11434)', ja: 'ユーザーPC ローカルデーモン (localhost:11434)', id: 'Daemon PC Lokal (localhost:11434)' }),
              pick({ ko: '외부 전송 자체가 없음', en: 'No external transmission', ja: '外部送信自体なし', id: 'Tidak ada transmisi eksternal' }),
              pick({ ko: '불필요 (로컬 포트 직결)', en: 'None (Direct local port)', ja: '不要（ローカルポート直結）', id: 'Tidak perlu (Port lokal langsung)' }),
              pick({ ko: '100% 완전 오프라인 지원', en: '100% Full Offline', ja: '100% 完全オフライン対応', id: '100% Offline Penuh' }),
            ],
            [
              'WebLLM (In-Browser WebGPU)',
              pick({ ko: '브라우저 WebGPU 샌드박스 내부', en: 'Inside Browser WebGPU Sandbox', ja: 'ブラウザ WebGPU サンドボックス内', id: 'Dalam Sandbox WebGPU Browser' }),
              pick({ ko: '외부 전송 자체가 없음', en: 'No external transmission', ja: '外部送信自体なし', id: 'Tidak ada transmisi eksternal' }),
              pick({ ko: '불필요 (브라우저 내장 가속)', en: 'None (In-browser acceleration)', ja: '不要（ブラウザ内蔵加速）', id: 'Tidak perlu (Akselerasi browser)' }),
              pick({ ko: '모델 캐싱 후 오프라인 지원', en: 'Offline after model cache', ja: 'モデルキャッシュ後オフライン対応', id: 'Offline setelah cache model' }),
            ],
          ]}
        />
      </EditorialSection>

      <EditorialSection chapter={pick({ ko: '제3조 (모델 재학습 배제 및 프롬프트 보안)', en: 'Article 3 · Zero-Training & Prompt Security', ja: '第3条（モデル学習除外・プロンプトセキュリティ）', id: 'Pasal 3 · Zero-Training & Keamanan Prompt' })}>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>
            {pick({
              ko: '이용자가 작성한 기획서 원고, 시스템 스키마 및 API 키는 중앙 서버에 영구 저장되거나 공용 AI 모델 재학습 데이터셋으로 활용되지 않습니다.',
              en: 'User-authored specifications, schemas, and API keys are never persistently stored on central servers or used to train public AI models.',
              ja: 'ユーザーが作成した企画書、スキーマ、APIキーは中央サーバーへ保存されたり、公開AIモデルの学習データに利用されたりしません。',
              id: 'Naskah spesifikasi, skema, dan kunci API pengguna tidak pernah disimpan permanen di server pusat atau dipakai melatih model AI publik.',
            })}
          </li>
          <li>
            {pick({
              ko: '개인 BYOK Gemini API 키는 브라우저 로컬 저장소에만 보관되며, 추론 요청 시 TLS 1.3 암호화 구간을 통해 전달됩니다.',
              en: 'Personal BYOK Gemini API keys remain in browser local storage and are transmitted over TLS 1.3 solely during inference requests.',
              ja: '個人BYOK Gemini APIキーはブラウザのローカル保存領域にのみ保管され、推論時にTLS 1.3暗号化通信で送信されます。',
              id: 'Kunci API Gemini BYOK pribadi hanya disimpan di penyimpanan lokal browser dan dikirim melalui TLS 1.3 saat permintaan inferensi.',
            })}
          </li>
        </ol>
      </EditorialSection>

      <EditorialSection chapter={pick({ ko: '제4조 (생성 결과의 검수 및 책임)', en: 'Article 4 · Review & Ownership of Outputs', ja: '第4条（生成結果の検証と責任）', id: 'Pasal 4 · Tinjauan & Tanggung Jawab Hasil' })}>
        <p>
          {pick({
            ko: 'AI가 제안한 초안, 요구사항 명세 및 아키텍처 코드는 기획 보조 자료로 제공됩니다. 최종 사양서 확정(Lock Spec) 및 실무 배포에 앞서 이용자가 직접 내용을 검토하고 편집할 수 있으며, 확정된 산출물에 대한 통제권과 최종 승인 권한은 100% 이용자에게 있습니다.',
            en: 'AI-suggested drafts, requirements, and architectural snippets are assistive materials. Users review and edit content before locking specs or deploying; 100% of control and final approval authority rests with the user.',
            ja: 'AIが提案するドラフトや要件仕様・設計コードは企画補助資料として提供されます。最終仕様確定（Lock Spec）や実務展開の前にユーザーが直接検証・編集でき、成果物の管理権と最終承認権は100%ユーザーに帰属します。',
            id: 'Draf, spesifikasi kebutuhan, dan cuplikan arsitektur dari AI bersifat membantu. Pengguna meninjau dan menyunting sebelum mengunci spek atau rilis; kendali dan wewenang akhir 100% berada pada pengguna.',
          })}
        </p>
      </EditorialSection>
    </EditorialPageLayout>
  );
}
