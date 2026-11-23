import React, { useState, useMemo } from 'react';
import { 
  Table, Sparkles, Check,
  Calendar, ToggleLeft, Hash, AlignLeft,
  Mail, Phone, FileText, Eye
} from 'lucide-react';
import { SitePlan } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

export interface SchemaFieldMapping {
  id: string;
  domainName: string;
  fieldName: string;
  uiComponent: string;
  uiIcon: React.ElementType;
  tsType: string;
  sampleValue: string;
  validationRule: string;
  isRequired: boolean;
}

interface VisualSchemaBridgeWidgetProps {
  rawInput: string;
  plan: SitePlan;
  setPlan?: (plan: SitePlan) => void;
  onInputChange: (chapterId: number, sectionKey: string, text: string) => void;
}

export const VisualSchemaBridgeWidget: React.FC<VisualSchemaBridgeWidgetProps> = ({
  rawInput,
  onInputChange,
}) => {
  const { pick } = useLanguage();
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const presetDomainTemplates = useMemo(
    () => [
      {
        name: pick({ ko: 'B2B SaaS 멀티테넌트', en: 'B2B SaaS Multi-Tenant', ja: 'B2B SaaS マルチテナント', id: 'B2B SaaS Multi-Tenant' }),
        rawText: pick({
          ko: '조직명, 워크스페이스, 관리자이메일, 구독플랜, 결제상태, 최근접속일시',
          en: 'Organization Name, Workspace, Admin Email, Plan, Billing Status, Last Login Date',
          ja: '組織名, ワークスペース, 管理者メール, プラン, 決済状態, 最終ログイン日時',
          id: 'Nama Organisasi, Workspace, Email Admin, Paket, Status Pembayaran, Tanggal Login',
        }),
      },
      {
        name: pick({ ko: '모바일 O2O 주문배달', en: 'Mobile O2O Delivery', ja: 'モバイル O2O 配送', id: 'Pengiriman O2O Mobile' }),
        rawText: pick({
          ko: '주문번호, 고객명, 배달주소, 결제금액, 주문상태, 라이더연락처',
          en: 'Order ID, Customer Name, Delivery Address, Payment Amount, Order Status, Courier Phone',
          ja: '注文番号, 顧客名, 配達先住所, 支払金額, 注文状態, 配達員連絡先',
          id: 'Nomor Pesanan, Nama Pelanggan, Alamat, Jumlah Bayar, Status Pesanan, Telepon Kurir',
        }),
      },
      {
        name: pick({ ko: 'AI 파이프라인 & 토큰', en: 'AI Pipeline & Tokens', ja: 'AI パイプライン & トークン', id: 'Pipeline AI & Token' }),
        rawText: pick({
          ko: '모델명, 추론엔드포인트, 입력토큰, 레이턴시ms, 실행상태, 결과로그',
          en: 'Model Name, Inference Endpoint, Token Count, Latency ms, Run Status, Output Memo',
          ja: 'モデル名, 推論エンドポイント, 入力トークン数, レイテンシms, 実行状態, 出力メモ',
          id: 'Nama Model, Endpoint Inferensi, Jumlah Token, Latensi ms, Status Jalan, Catatan Output',
        }),
      },
      {
        name: pick({ ko: '클라우드 엔지니어링 스프린트', en: 'Cloud Engineering Sprint', ja: 'クラウド開発スプリント', id: 'Sprint Teknik Cloud' }),
        rawText: pick({
          ko: '기능명세, 담당엔지니어, 마감스프린트, 우선순위, 파이프라인상태, 구현메모',
          en: 'Feature Name, Assignee Engineer, Due Date, Priority, Pipeline Status, Implementation Notes',
          ja: '機能名, 担当エンジニア, 期日, 優先度, パイプライン状態, 実装メモ',
          id: 'Nama Fitur, Insinyur, Tanggal Tenggat, Prioritas, Status Pipeline, Catatan Implementasi',
        }),
      },
    ],
    [pick]
  );

  // Parse raw text input to infer schema fields dynamically
  const detectedFields: SchemaFieldMapping[] = useMemo(() => {
    const defaultTokens = pick({
      ko: '고객명, 연락처, 예약일시, 예약인원, 상태, 요청메모',
      en: 'Customer Name, Phone Number, Reservation Date, Guest Count, Status, Request Notes',
      ja: '顧客名, 連絡先, 予約日時, 予約人数, 状態, 要望メモ',
      id: 'Nama Pelanggan, Telepon, Tanggal Reservasi, Jumlah Tamu, Status, Catatan Permintaan',
    });
    const textToParse = rawInput.trim() || defaultTokens;

    // Split by commas, newlines, slashes, or bullet points
    const rawTokens = textToParse
      .split(/[,;\n/·•\t]+/)
      .map(t => t.trim().replace(/^[-*0-9.]+\s*/, ''))
      .filter(t => t.length > 0 && t.length < 30);

    // Dedup and take up to 8 fields
    const uniqueTokens = Array.from(new Set(rawTokens)).slice(0, 8);

    return uniqueTokens.map((token, index) => {
      const lower = token.toLowerCase();

      // Heuristic 1: Dates & Timestamps
      if (lower.includes('일시') || lower.includes('날짜') || lower.includes('시간') || lower.includes('date') || lower.includes('time') || lower.includes('마감') || lower.includes('日時') || lower.includes('期日') || lower.includes('tanggal')) {
        return {
          id: `field_${index}`,
          domainName: token,
          fieldName: lower.includes('마감') || lower.includes('due') || lower.includes('tenggat') ? 'dueDate' : lower.includes('가입') ? 'joinedAt' : 'scheduledAt',
          uiComponent: pick({ ko: '날짜/시간 선택기 (DateTime Picker)', en: 'Date/Time Picker', ja: '日時ピッカー (DateTime Picker)', id: 'Pemilih Tanggal/Waktu' }),
          uiIcon: Calendar,
          tsType: 'string (ISO8601)',
          sampleValue: '2026-11-15T14:30:00',
          validationRule: pick({ ko: '과거 날짜 불가, 유효한 타임스탬프', en: 'Valid ISO8601 timestamp', ja: '有効なタイムスタンプ形式', id: 'Timestamp ISO8601 valid' }),
          isRequired: true,
        };
      }

      // Heuristic 2: Status / State Enums
      if (lower.includes('상태') || lower.includes('status') || lower.includes('등급') || lower.includes('우선순위') || lower.includes('priority') || lower.includes('단계') || lower.includes('状態') || lower.includes('優先度') || lower.includes('prioritas')) {
        return {
          id: `field_${index}`,
          domainName: token,
          fieldName: lower.includes('우선순위') || lower.includes('priority') || lower.includes('prioritas') || lower.includes('優先度') ? 'priority' : 'status',
          uiComponent: pick({ ko: '상태 선택 칩 (Toggle Chips)', en: 'Status Toggle Chips', ja: 'ステータス選択チップ (Toggle Chips)', id: 'Chip Pilihan Status' }),
          uiIcon: ToggleLeft,
          tsType: 'Enum ("PENDING" | "ACTIVE" | "DONE")',
          sampleValue: pick({ ko: '확정 (CONFIRMED)', en: 'CONFIRMED', ja: '確定 (CONFIRMED)', id: 'CONFIRMED' }),
          validationRule: pick({ ko: '허용된 상태 목록 중 단일 선택', en: 'Single select from allowed states', ja: '許可された状態リストから単一選択', id: 'Pilih satu dari status yang diizinkan' }),
          isRequired: true,
        };
      }

      // Heuristic 3: Numbers / Price / Quantity
      if (lower.includes('금액') || lower.includes('가격') || lower.includes('price') || lower.includes('수량') || lower.includes('인원') || lower.includes('qty') || lower.includes('count') || lower.includes('토큰') || lower.includes('token') || lower.includes('amount') || lower.includes('jumlah') || lower.includes('金額') || lower.includes('人数')) {
        const isCurrency = lower.includes('금액') || lower.includes('가격') || lower.includes('price') || lower.includes('amount') || lower.includes('金額') || lower.includes('bayar');
        return {
          id: `field_${index}`,
          domainName: token,
          fieldName: isCurrency ? 'priceAmount' : 'quantity',
          uiComponent: isCurrency
            ? pick({ ko: '통화 금액 입력기 (Currency Input)', en: 'Currency Input', ja: '通貨金額入力 (Currency Input)', id: 'Input Mata Uang' })
            : pick({ ko: '숫자 카운터 (Number Stepper)', en: 'Number Stepper', ja: '数値ステッパー (Number Stepper)', id: 'Penghitung Angka' }),
          uiIcon: Hash,
          tsType: 'number',
          sampleValue: isCurrency
            ? pick({ ko: '45,000원', en: '$45.00', ja: '¥4,500', id: 'Rp 450.000' })
            : pick({ ko: '2명', en: '2', ja: '2名', id: '2' }),
          validationRule: pick({ ko: '0 이상의 유효한 정수', en: 'Valid integer >= 0', ja: '0以上の有効な整数', id: 'Bilangan bulat >= 0' }),
          isRequired: true,
        };
      }

      // Heuristic 4: Contact / Phone
      if (lower.includes('연락처') || lower.includes('전화') || lower.includes('휴대폰') || lower.includes('phone') || lower.includes('tel') || lower.includes('telepon') || lower.includes('連絡先')) {
        return {
          id: `field_${index}`,
          domainName: token,
          fieldName: 'phoneNumber',
          uiComponent: pick({ ko: '전화번호 전용 입력기 (Phone Input)', en: 'Phone Input Field', ja: '電話番号入力フィールド', id: 'Kolom Nomor Telepon' }),
          uiIcon: Phone,
          tsType: 'string',
          sampleValue: pick({ ko: '010-1234-5678', en: '+1-555-0148', ja: '090-1234-5678', id: '+62-812-3456-7890' }),
          validationRule: pick({ ko: '유효한 전화번호 형식', en: 'Valid phone number pattern', ja: '有効な電話番号形式', id: 'Format nomor telepon valid' }),
          isRequired: true,
        };
      }

      // Heuristic 5: Email
      if (lower.includes('이메일') || lower.includes('email') || lower.includes('메일') || lower.includes('メール')) {
        return {
          id: `field_${index}`,
          domainName: token,
          fieldName: 'emailAddress',
          uiComponent: pick({ ko: '이메일 유효성 입력기 (Email Input)', en: 'Validated Email Input', ja: 'メール入力 (Email Input)', id: 'Input Email Tervalidasi' }),
          uiIcon: Mail,
          tsType: 'string',
          sampleValue: 'user@example.com',
          validationRule: pick({ ko: '이메일 형식(@, 도메인 포함)', en: 'Valid email format', ja: 'メールアドレス形式', id: 'Format email valid' }),
          isRequired: true,
        };
      }

      // Heuristic 6: Multiline Notes / Memo / Description
      if (lower.includes('메모') || lower.includes('설명') || lower.includes('내용') || lower.includes('요청') || lower.includes('memo') || lower.includes('desc') || lower.includes('note') || lower.includes('catatan') || lower.includes('メモ')) {
        return {
          id: `field_${index}`,
          domainName: token,
          fieldName: 'notesDescription',
          uiComponent: pick({ ko: '장문 서술 박스 (Multiline Textarea)', en: 'Multiline Textarea', ja: '複数行テキストエリア', id: 'Area Teks Multibaris' }),
          uiIcon: AlignLeft,
          tsType: 'string',
          sampleValue: pick({ ko: '방문 시 주차 안내 요청드립니다.', en: 'Please prepare visitor pass at reception.', ja: '来訪時の駐車場案内をお願いします。', id: 'Mohon siapkan akses parkir tamu.' }),
          validationRule: pick({ ko: '최대 500자 이하, 선택 입력', en: 'Max 500 chars, optional', ja: '最大500文字、任意入力', id: 'Maks 500 karakter, opsional' }),
          isRequired: false,
        };
      }

      // Default: Clean Text Field
      const isName = lower.includes('명') || lower.includes('이름') || lower.includes('name') || lower.includes('제목') || lower.includes('title') || lower.includes('nama') || lower.includes('名');
      return {
        id: `field_${index}`,
        domainName: token,
        fieldName: isName ? 'titleName' : `itemProperty_${index + 1}`,
        uiComponent: pick({ ko: '단문 텍스트 입력창 (Text Input)', en: 'Single-line Text Input', ja: '一行テキスト入力', id: 'Input Teks Tunggal' }),
        uiIcon: FileText,
        tsType: 'string',
        sampleValue: isName
          ? pick({ ko: '김서연', en: 'Alex Kim', ja: '佐藤 健', id: 'Budi Santoso' })
          : pick({ ko: '등록 데이터', en: 'Sample Record', ja: '登録データ', id: 'Data Entri' }),
        validationRule: pick({ ko: '1자 이상 필수 입력', en: 'Required, min 1 character', ja: '1文字以上必須', id: 'Wajib diisi, min 1 karakter' }),
        isRequired: true,
      };
    });
  }, [rawInput, pick]);

  const handleApplyPreset = (templateText: string) => {
    onInputChange(4, 'data_columns', templateText);
    setCopiedNotification(
      pick({
        ko: '샘플 템플릿 필드가 원고에 반영되었습니다.',
        en: 'Sample domain fields applied to your specification.',
        ja: 'サンプルドメイン項目を仕様書に反映しました。',
        id: 'Kolom templat domain telah diterapkan ke spesifikasi.',
      })
    );
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const handleCopySchemaDefinition = async () => {
    const tsDefinition = `// Goguma Auto-Generated Schema from Domain Terms\nexport interface AppRecord {\n  id: string;\n${detectedFields.map(f => `  ${f.fieldName}${f.isRequired ? '' : '?'}: ${f.tsType.split(' ')[0]}; // ${f.domainName} (${f.uiComponent})`).join('\n')}\n  createdAt: string;\n}`;
    try {
      await navigator.clipboard.writeText(tsDefinition);
      setCopiedNotification(
        pick({
          ko: 'TypeScript 타입 인터페이스가 복사되었습니다!',
          en: 'TypeScript interface copied to clipboard!',
          ja: 'TypeScript 型定義をコピーしました！',
          id: 'Antarmuka tipe TypeScript berhasil disalin!',
        })
      );
      setTimeout(() => setCopiedNotification(null), 2500);
    } catch {
      // ignore
    }
  };

  const handleCopySqlDdl = async () => {
    const sqlDefinition = `-- Goguma Production SQL DDL Migration (PostgreSQL / Cloudflare D1 / Supabase)\nCREATE TABLE app_records (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n${detectedFields.map(f => {
      let sqlType = 'VARCHAR(255)';
      if (f.tsType.includes('number')) sqlType = 'INTEGER';
      else if (f.tsType.includes('ISO8601')) sqlType = 'TIMESTAMPTZ';
      else if (f.fieldName === 'notesDescription') sqlType = 'TEXT';
      return `  ${f.fieldName} ${sqlType}${f.isRequired ? ' NOT NULL' : ''}, -- ${f.domainName}`;
    }).join('\n')}\n  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n);\n\nCREATE INDEX idx_app_records_created_at ON app_records(created_at DESC);`;
    try {
      await navigator.clipboard.writeText(sqlDefinition);
      setCopiedNotification(
        pick({
          ko: 'SQL DDL 마이그레이션 쿼리가 복사되었습니다!',
          en: 'SQL DDL migration script copied to clipboard!',
          ja: 'SQL DDL マイグレーションクエリをコピーしました！',
          id: 'Kueri migrasi SQL DDL berhasil disalin!',
        })
      );
      setTimeout(() => setCopiedNotification(null), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-10 font-sans text-[var(--theme-ink-primary)]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[var(--theme-ink-strong)]">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-[16px] sm:text-[18px] font-extrabold tabular-nums text-[var(--theme-ink-secondary)] tracking-[0.08em]">
              03
            </span>
            <h3 className="font-extrabold text-[22px] sm:text-[26px] text-[var(--theme-ink-strong)] tracking-[-0.02em]">
              {pick({
                ko: '엑셀 장부 1:1 자동 매핑 미리보기',
                en: 'Live Domain Schema & UI Mapping Preview',
                ja: 'データ台帳 1:1 自動マッピングプレビュー',
                id: 'Pratinjau Pemetaan Skema Data 1:1',
              })}
            </h3>
          </div>
          <p className="text-[17px] sm:text-[19px] text-[var(--theme-ink-secondary)] leading-[1.7] pl-8">
            {pick({
              ko: '서술하신 업무 단어가 실제 소프트웨어의 입력창과 데이터베이스로 어떻게 변환되는지 실시간으로 보여줍니다.',
              en: 'Preview in real time how your domain terms translate into UI form fields and database columns.',
              ja: '記述した業務項目が実際のソフトウェアの入力フォームとデータベースにどう変換されるかをリアルタイムで表示します。',
              id: 'Lihat secara real time bagaimana istilah bisnis Anda diubah menjadi kolom UI dan skema basis data.',
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopySqlDdl}
            className="flex items-center gap-2 px-4 py-2.5 rounded-none bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] hover:bg-[var(--theme-active-bg)] hover:text-[var(--theme-active-text)] hover:border-[var(--theme-ink-strong)] text-[15px] font-bold text-[var(--theme-ink-primary)] transition-colors cursor-pointer whitespace-nowrap"
            title={pick({ ko: 'PostgreSQL / D1 SQL DDL 쿼리 복사', en: 'Copy PostgreSQL / D1 SQL DDL', ja: 'PostgreSQL / D1 SQL DDL をコピー', id: 'Salin SQL DDL PostgreSQL / D1' })}
          >
            <Table size={15} />
            <span>{pick({ ko: 'SQL DDL 복사', en: 'Copy SQL DDL', ja: 'SQL DDL コピー', id: 'Salin SQL DDL' })}</span>
          </button>
          <button
            type="button"
            onClick={handleCopySchemaDefinition}
            className="flex items-center gap-2 px-4 py-2.5 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[15px] font-bold text-[var(--theme-btn-text)] transition-colors cursor-pointer whitespace-nowrap"
            title={pick({ ko: 'TypeScript 인터페이스 규격 복사', en: 'Copy TypeScript Interface', ja: 'TypeScript インターフェースをコピー', id: 'Salin Antarmuka TypeScript' })}
          >
            <Sparkles size={15} />
            <span>{pick({ ko: 'TS 타입 복사', en: 'Copy TS Types', ja: 'TS 型コピー', id: 'Salin Tipe TS' })}</span>
          </button>
        </div>
      </div>

      {/* Preset Suggestion Callout */}
      <div className="bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] rounded-none p-6 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[16px] font-extrabold text-[var(--theme-ink-strong)]">
            {pick({ ko: '업무 도메인 템플릿 빠른 적용', en: 'Quick Domain Schema Presets', ja: '業務ドメインテンプレートのクイック適用', id: 'Templat Cepat Skema Domain' })}
          </span>
          <span className="text-[15px] text-[var(--theme-ink-muted)]">
            {pick({ ko: '클릭 시 데이터 스키마 즉시 채움', en: 'Click to populate data schema immediately', ja: 'クリックするとデータスキーマを即時入力', id: 'Klik untuk mengisi skema data seketika' })}
          </span>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {presetDomainTemplates.map((tmpl) => (
            <button
              key={tmpl.name}
              type="button"
              onClick={() => handleApplyPreset(tmpl.rawText)}
              className="px-4 py-2.5 rounded-none bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] hover:bg-[var(--theme-active-bg)] text-[var(--theme-ink-primary)] hover:text-[var(--theme-active-text)] hover:border-[var(--theme-ink-strong)] text-[15px] font-bold transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>{tmpl.name}</span>
            </button>
          ))}
        </div>
      </div>

      {copiedNotification && (
        <div className="px-5 py-3.5 rounded-none bg-[var(--theme-stage)] border border-[var(--theme-ink-strong)] text-[var(--theme-ink-strong)] text-[17px] font-bold flex items-center gap-2.5">
          <Check size={17} className="stroke-[2.5] shrink-0" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* 1:1 Spreadsheet Live Mapping Table */}
      <div className="overflow-x-auto bg-[var(--theme-canvas)] border-t-2 border-t-[var(--theme-ink-strong)] border-b border-b-[var(--theme-ink-strong)]">
        <div className="min-w-[600px]">
          {/* Table Column Headers */}
          <div className="bg-[var(--theme-bar-bg)] px-5 py-3.5 grid grid-cols-12 text-[15px] font-bold text-[var(--theme-bar-text)] select-none">
            <div className="col-span-3">{pick({ ko: '도메인 필드', en: 'Domain Field', ja: 'ドメイン項目', id: 'Kolom Domain' })}</div>
            <div className="col-span-4">{pick({ ko: '화면 입력 UI', en: 'UI Input Widget', ja: '画面入力 UI', id: 'Komponen Input UI' })}</div>
            <div className="col-span-3">{pick({ ko: '데이터 규격', en: 'Data Type', ja: 'データ型', id: 'Tipe Data' })}</div>
            <div className="col-span-2 text-right">{pick({ ko: '장부 예시', en: 'Sample Value', ja: 'サンプル値', id: 'Contoh Nilai' })}</div>
          </div>

          {/* Dynamic Mapping Rows */}
          <div className="divide-y divide-[var(--theme-border-hairline)]">
            {detectedFields.map((field) => {
              const Icon = field.uiIcon;
              const isSelected = selectedFieldId === field.id;

              return (
                <div 
                  key={field.id}
                  onClick={() => setSelectedFieldId(isSelected ? null : field.id)}
                  className={`px-5 py-4 grid grid-cols-12 items-center text-[16px] transition-colors cursor-pointer ${
                    isSelected ? 'bg-[var(--theme-stage)]' : 'hover:bg-[var(--theme-stage)]/60'
                  }`}
                >
                  {/* 1. Domain Term */}
                  <div className="col-span-3 flex items-center gap-2 truncate pr-2">
                    <span className="font-bold text-[var(--theme-ink-strong)] truncate">
                      {field.domainName}
                    </span>
                    <span className="text-[14px] text-[var(--theme-ink-muted)] hidden md:inline truncate">
                      ({field.fieldName})
                    </span>
                  </div>

                  {/* 2. UI Component Representation */}
                  <div className="col-span-4 flex items-center gap-2.5 truncate pr-2">
                    <Icon size={15} className="text-[var(--theme-ink-strong)] shrink-0" />
                    <span className="text-[var(--theme-ink-body)] truncate text-[15px] font-medium">
                      {field.uiComponent}
                    </span>
                  </div>

                  {/* 3. Software Type */}
                  <div className="col-span-3 flex items-center gap-2 truncate pr-2">
                    <span className="font-mono text-[14px] px-2.5 py-1 rounded-none bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] text-[var(--theme-ink-strong)] font-bold truncate">
                      {field.tsType}
                    </span>
                    <span className="text-[14px] text-[var(--theme-ink-secondary)] font-medium hidden sm:inline">
                      {field.isRequired
                        ? pick({ ko: '필수', en: 'Req', ja: '必須', id: 'Wajib' })
                        : pick({ ko: '선택', en: 'Opt', ja: '任意', id: 'Ops' })}
                    </span>
                  </div>

                  {/* 4. Realistic Spreadsheet Cell Preview */}
                  <div className="col-span-2 text-right truncate">
                    <span className="text-[15px] font-bold tabular-nums text-[var(--theme-ink-strong)] inline-block truncate max-w-full">
                      {field.sampleValue}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Live Row Preview (Soft Tonal Callout) */}
      <div className="bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] rounded-none p-6 sm:p-7 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[16px]">
          <div className="flex items-center gap-2.5">
            <Eye size={17} className="text-[var(--theme-ink-strong)]" />
            <span className="font-extrabold text-[var(--theme-ink-strong)]">
              {pick({
                ko: '실제 서비스 화면 생성 시 시뮬레이션',
                en: 'Generated Service Form Simulation',
                ja: '実サービス画面生成シミュレーション',
                id: 'Simulasi Tampilan Formulir Layanan',
              })}
            </span>
          </div>
          <span className="text-[15px] font-bold text-[var(--theme-ink-secondary)]">
            {pick({
              ko: `${detectedFields.length}개 필드 자동 반영 중`,
              en: `${detectedFields.length} fields synced automatically`,
              ja: `${detectedFields.length}項目が自動反映中`,
              id: `${detectedFields.length} kolom tersinkron otomatis`,
            })}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 pt-1">
          {detectedFields.map((field) => (
            <div key={field.id} className="bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] p-4 rounded-none space-y-1.5">
              <span className="text-[14px] text-[var(--theme-ink-muted)] block truncate">
                {field.domainName}
              </span>
              <span className="font-bold text-[16px] text-[var(--theme-ink-strong)] block truncate">
                {field.sampleValue}
              </span>
              <span className="text-[14px] text-[var(--theme-ink-secondary)] block truncate font-medium">
                {field.uiComponent.split('(')[0].trim()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisualSchemaBridgeWidget;
