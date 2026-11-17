import React, { useState, useMemo } from 'react';
import { 
  Table, Sparkles, Check, ArrowRight,
  Calendar, ToggleLeft, Hash, AlignLeft,
  Mail, Phone, FileText, Plus, RefreshCw, Eye
} from 'lucide-react';
import { SitePlan } from '../../types';

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

const PRESET_DOMAIN_TEMPLATES = [
  {
    name: 'B2B SaaS 멀티테넌트',
    rawText: '조직명, 워크스페이스, 관리자이메일, 구독플랜, 결제상태, 최근접속일시',
    description: '엔터프라이즈 멀티테넌트 B2B SaaS 및 조직 멤버십 관리'
  },
  {
    name: '모바일 O2O 주문배달',
    rawText: '주문번호, 고객명, 배달주소, 결제금액, 주문상태, 라이더연락처',
    description: '실시간 주문, 픽업 및 배송 라이프사이클 관리'
  },
  {
    name: 'AI 파이프라인 & 토큰',
    rawText: '모델명, 추론엔드포인트, 입력토큰, 레이턴시ms, 실행상태, 결과로그',
    description: '생성형 AI 모델 추론 파이프라인 및 비용 모니터링'
  },
  {
    name: '클라우드 엔지니어링 스프린트',
    rawText: '기능명세, 담당엔지니어, 마감스프린트, 우선순위, 파이프라인상태, 구현메모',
    description: '소프트웨어 기능 백로그 및 API 엔드포인트 구현 관리'
  }
];

export const VisualSchemaBridgeWidget: React.FC<VisualSchemaBridgeWidgetProps> = ({
  rawInput,
  plan,
  setPlan,
  onInputChange,
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Parse raw text input to infer schema fields dynamically
  const detectedFields: SchemaFieldMapping[] = useMemo(() => {
    // If input is empty, fallback to default reservation fields
    const textToParse = rawInput.trim() || '고객명, 연락처, 예약일시, 예약인원, 상태, 요청메모';

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
      if (lower.includes('일시') || lower.includes('날짜') || lower.includes('시간') || lower.includes('date') || lower.includes('time') || lower.includes('마감')) {
        return {
          id: `field_${index}`,
          domainName: token,
          fieldName: lower.includes('마감') ? 'dueDate' : lower.includes('가입') ? 'joinedAt' : 'reservationDateTime',
          uiComponent: '날짜/시간 선택기 (DateTime Picker)',
          uiIcon: Calendar,
          tsType: 'string (ISO8601)',
          sampleValue: '2026-11-15T14:30:00',
          validationRule: '과거 날짜 불가, 유효한 타임스탬프',
          isRequired: true,
        };
      }

      // Heuristic 2: Status / State Enums
      if (lower.includes('상태') || lower.includes('status') || lower.includes('등급') || lower.includes('우선순위') || lower.includes('단계')) {
        return {
          id: `field_${index}`,
          domainName: token,
          fieldName: lower.includes('우선순위') ? 'priority' : 'status',
          uiComponent: '상태 선택 칩 (Toggle Chips)',
          uiIcon: ToggleLeft,
          tsType: 'Enum ("대기" | "확정" | "완료" | "취소")',
          sampleValue: '확정 (CONFIRMED)',
          validationRule: '허용된 상태 목록 중 단일 선택',
          isRequired: true,
        };
      }

      // Heuristic 3: Numbers / Price / Quantity
      if (lower.includes('금액') || lower.includes('가격') || lower.includes('price') || lower.includes('수량') || lower.includes('인원') || lower.includes('qty') || lower.includes('count')) {
        const isCurrency = lower.includes('금액') || lower.includes('가격') || lower.includes('price');
        return {
          id: `field_${index}`,
          domainName: token,
          fieldName: isCurrency ? 'priceAmount' : 'quantity',
          uiComponent: isCurrency ? '통화 금액 입력기 (Currency Input)' : '숫자 카운터 (Number Stepper)',
          uiIcon: Hash,
          tsType: 'number',
          sampleValue: isCurrency ? '45,000원' : '2명',
          validationRule: '0 이상의 유효한 정수',
          isRequired: true,
        };
      }

      // Heuristic 4: Contact / Phone
      if (lower.includes('연락처') || lower.includes('전화') || lower.includes('휴대폰') || lower.includes('phone') || lower.includes('tel')) {
        return {
          id: `field_${index}`,
          domainName: token,
          fieldName: 'phoneNumber',
          uiComponent: '전화번호 전용 입력기 (Phone Input)',
          uiIcon: Phone,
          tsType: 'string',
          sampleValue: '010-1234-5678',
          validationRule: '하이픈 포함 정규식(010-XXXX-XXXX)',
          isRequired: true,
        };
      }

      // Heuristic 5: Email
      if (lower.includes('이메일') || lower.includes('email') || lower.includes('메일')) {
        return {
          id: `field_${index}`,
          domainName: token,
          fieldName: 'emailAddress',
          uiComponent: '이메일 유효성 입력기 (Email Input)',
          uiIcon: Mail,
          tsType: 'string',
          sampleValue: 'user@example.com',
          validationRule: '이메일 형식(@, 도메인 포함)',
          isRequired: true,
        };
      }

      // Heuristic 6: Multiline Notes / Memo / Description
      if (lower.includes('메모') || lower.includes('설명') || lower.includes('내용') || lower.includes('요청') || lower.includes('memo') || lower.includes('desc')) {
        return {
          id: `field_${index}`,
          domainName: token,
          fieldName: 'notesDescription',
          uiComponent: '장문 서술 박스 (Multiline Textarea)',
          uiIcon: AlignLeft,
          tsType: 'string',
          sampleValue: '방문 시 주차 안내 요청드립니다.',
          validationRule: '최대 500자 이하, 선택 입력',
          isRequired: false,
        };
      }

      // Default: Clean Text Field (e.g. 고객명, 상품명, 업무제목)
      const isName = lower.includes('명') || lower.includes('이름') || lower.includes('name') || lower.includes('제목') || lower.includes('title');
      return {
        id: `field_${index}`,
        domainName: token,
        fieldName: isName ? 'titleName' : `itemProperty_${index + 1}`,
        uiComponent: '단문 텍스트 입력창 (Text Input)',
        uiIcon: FileText,
        tsType: 'string',
        sampleValue: isName ? (lower.includes('고객') ? '홍길동' : lower.includes('상품') ? '프리미엄 원두' : '신규 기획 검토') : '등록 데이터',
        validationRule: '1자 이상 필수 입력',
        isRequired: true,
      };
    });
  }, [rawInput]);

  const handleApplyPreset = (templateText: string) => {
    onInputChange(4, 'data_columns', templateText);
    setCopiedNotification('샘플 템플릿 필드가 원고에 반영되었습니다.');
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const handleCopySchemaDefinition = async () => {
    const tsDefinition = `// Goguma Auto-Generated Schema from Domain Terms\nexport interface AppRecord {\n  id: string;\n${detectedFields.map(f => `  ${f.fieldName}${f.isRequired ? '' : '?'}: ${f.tsType.split(' ')[0]}; // ${f.domainName} (${f.uiComponent})`).join('\n')}\n  createdAt: string;\n}`;
    try {
      await navigator.clipboard.writeText(tsDefinition);
      setCopiedNotification('TypeScript 타입 인터페이스가 복사되었습니다!');
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
      setCopiedNotification('SQL DDL 마이그레이션 쿼리가 복사되었습니다!');
      setTimeout(() => setCopiedNotification(null), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-10 font-sans text-[#111111]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#000000]">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-[16px] sm:text-[18px] font-extrabold tabular-nums text-[#52524E] tracking-[0.08em]">
              03
            </span>
            <h3 className="font-extrabold text-[22px] sm:text-[26px] text-[#000000] tracking-[-0.02em]">
              엑셀 장부 1:1 자동 매핑 미리보기
            </h3>
          </div>
          <p className="text-[17px] sm:text-[19px] text-[#52524E] leading-[1.7] pl-8">
            서술하신 업무 단어가 실제 소프트웨어의 입력창과 데이터베이스로 어떻게 변환되는지 실시간으로 보여줍니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopySqlDdl}
            className="flex items-center gap-2 px-4 py-2.5 rounded-none bg-[#F6F5F1] border border-[#E4E2DC] hover:bg-[#000000] hover:text-[#FFE600] hover:border-[#000000] text-[15px] font-bold text-[#111111] transition-colors cursor-pointer whitespace-nowrap"
            title="PostgreSQL / D1 SQL DDL 쿼리 복사"
          >
            <Table size={15} />
            <span>SQL DDL 복사</span>
          </button>
          <button
            type="button"
            onClick={handleCopySchemaDefinition}
            className="flex items-center gap-2 px-4 py-2.5 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[15px] font-bold text-[#FFFFFF] transition-colors cursor-pointer whitespace-nowrap"
            title="TypeScript 인터페이스 규격 복사"
          >
            <Sparkles size={15} />
            <span>TS 타입 복사</span>
          </button>
        </div>
      </div>

      {/* Preset Suggestion Callout */}
      <div className="bg-[#F6F5F1] border border-[#E4E2DC] rounded-none p-6 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[16px] font-extrabold text-[#000000]">업무 도메인 템플릿 빠른 적용</span>
          <span className="text-[15px] text-[#787772]">클릭 시 데이터 스키마 즉시 채움</span>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {PRESET_DOMAIN_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              type="button"
              onClick={() => handleApplyPreset(tmpl.rawText)}
              className="px-4 py-2.5 rounded-none bg-[#FFFFFF] border border-[#E4E2DC] hover:bg-[#000000] text-[#111111] hover:text-[#FFE600] hover:border-[#000000] text-[15px] font-bold transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>{tmpl.name}</span>
            </button>
          ))}
        </div>
      </div>

      {copiedNotification && (
        <div className="px-5 py-3.5 rounded-none bg-[#F6F5F1] border border-[#000000] text-[#000000] text-[17px] font-bold flex items-center gap-2.5">
          <Check size={17} className="stroke-[2.5] shrink-0" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* 1:1 Spreadsheet Live Mapping Table */}
      <div className="overflow-x-auto bg-[#FFFFFF] border-t-2 border-t-[#000000] border-b border-b-[#000000]">
        <div className="min-w-[600px]">
          {/* Table Column Headers */}
          <div className="bg-[#000000] px-5 py-3.5 grid grid-cols-12 text-[15px] font-bold text-[#FFFFFF] select-none">
            <div className="col-span-3">도메인 필드</div>
            <div className="col-span-4">화면 입력 UI</div>
            <div className="col-span-3">데이터 규격</div>
            <div className="col-span-2 text-right">장부 예시</div>
          </div>

          {/* Dynamic Mapping Rows */}
          <div className="divide-y divide-[#E4E2DC]">
            {detectedFields.map((field) => {
              const Icon = field.uiIcon;
              const isSelected = selectedFieldId === field.id;

              return (
                <div 
                  key={field.id}
                  onClick={() => setSelectedFieldId(isSelected ? null : field.id)}
                  className={`px-5 py-4 grid grid-cols-12 items-center text-[16px] transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#F6F5F1]' : 'hover:bg-[#F6F5F1]/60'
                  }`}
                >
                  {/* 1. Domain Term */}
                  <div className="col-span-3 flex items-center gap-2 truncate pr-2">
                    <span className="font-bold text-[#000000] truncate">
                      {field.domainName}
                    </span>
                    <span className="text-[14px] text-[#787772] hidden md:inline truncate">
                      ({field.fieldName})
                    </span>
                  </div>

                  {/* 2. UI Component Representation */}
                  <div className="col-span-4 flex items-center gap-2.5 truncate pr-2">
                    <Icon size={15} className="text-[#000000] shrink-0" />
                    <span className="text-[#2B2B29] truncate text-[15px] font-medium">
                      {field.uiComponent}
                    </span>
                  </div>

                  {/* 3. Software Type */}
                  <div className="col-span-3 flex items-center gap-2 truncate pr-2">
                    <span className="font-mono text-[14px] px-2.5 py-1 rounded-none bg-[#F6F5F1] border border-[#E4E2DC] text-[#000000] font-bold truncate">
                      {field.tsType}
                    </span>
                    <span className="text-[14px] text-[#52524E] font-medium hidden sm:inline">
                      {field.isRequired ? '필수' : '선택'}
                    </span>
                  </div>

                  {/* 4. Realistic Spreadsheet Cell Preview */}
                  <div className="col-span-2 text-right truncate">
                    <span className="text-[15px] font-bold tabular-nums text-[#000000] inline-block truncate max-w-full">
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
      <div className="bg-[#F6F5F1] border border-[#E4E2DC] rounded-none p-6 sm:p-7 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[16px]">
          <div className="flex items-center gap-2.5">
            <Eye size={17} className="text-[#000000]" />
            <span className="font-extrabold text-[#000000]">실제 서비스 화면 생성 시 시뮬레이션</span>
          </div>
          <span className="text-[15px] font-bold text-[#52524E]">
            {detectedFields.length}개 필드 자동 반영 중
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 pt-1">
          {detectedFields.map((field) => (
            <div key={field.id} className="bg-[#FFFFFF] border border-[#E4E2DC] p-4 rounded-none space-y-1.5">
              <span className="text-[14px] text-[#787772] block truncate">
                {field.domainName}
              </span>
              <span className="font-bold text-[16px] text-[#000000] block truncate">
                {field.sampleValue}
              </span>
              <span className="text-[14px] text-[#52524E] block truncate font-medium">
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
