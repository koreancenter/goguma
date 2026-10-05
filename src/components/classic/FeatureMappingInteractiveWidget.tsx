import React, { useState } from 'react';
import { 
  Workflow, Plus, Trash2, CheckCircle2, ArrowRightCircle, 
  Layers, RefreshCw, Sparkles, MoveRight
} from 'lucide-react';
import { SitePlan } from '../../types';

interface FeatureMappingInteractiveWidgetProps {
  plan: SitePlan;
  setPlan: (plan: SitePlan) => void;
  onInputChange: (chapterId: number, sectionKey: string, text: string) => void;
}

interface FeatureItem {
  id: string;
  title: string;
  priority: 'P0 필수' | 'P1 중요' | 'P2 부가';
  targetScreen: string;
  description: string;
}

interface HappyPathStep {
  step: number;
  action: string;
  result: string;
}

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: 'f1',
    title: '원클릭 신규 장부 기록 등록',
    priority: 'P0 필수',
    targetScreen: '신규 등록 모달 (/new)',
    description: '고객명, 연락처, 일정, 단계를 3초 안에 빠르게 입력하고 즉시 저장'
  },
  {
    id: 'f2',
    title: '원터치 4단계 상태 순환 전이',
    priority: 'P0 필수',
    targetScreen: '메인 장부 대시보드 (/)',
    description: '칩 터치 한 번으로 [접수]➔[진행]➔[완료] 상태가 즉각 바뀌며 색상 반영'
  },
  {
    id: 'f3',
    title: '초성/키워드 실시간 스마트 검색',
    priority: 'P1 중요',
    targetScreen: '메인 장부 대시보드 (/)',
    description: '타이핑 즉시 0ms 딜레이로 고객 및 상태 필터링'
  }
];

const DEFAULT_HAPPY_PATH: HappyPathStep[] = [
  { step: 1, action: '메인 장부 화면 진입 및 [+ 신규 등록] 터치', result: '부드러운 모달 입력창 오픈' },
  { step: 2, action: '고객명과 방문 일정 입력 후 [저장] 터치', result: '0ms 딜레이로 최상단 장부에 즉시 추가' },
  { step: 3, action: '업무 진행 후 해당 행의 [상태 칩] 가볍게 터치', result: '[진행중] ➔ [완료] 색상 즉각 전이' },
  { step: 4, action: '상단 [오늘 완료 건] 통계 실시간 자동 합산 확인', result: '퇴근 전 성과 한눈에 파악' },
];

const STATUS_TEMPLATES = [
  { name: '4단계 예약/주문형', steps: ['접수대기', '예약확정', '진행중', '처리완료'] },
  { name: '3단계 업무/할일형', steps: ['할 일', '진행중', '완료'] },
  { name: '4단계 정산/결제형', steps: ['청구대기', '입금대기', '결제완료', '세금계산서발행'] },
];

export const FeatureMappingInteractiveWidget: React.FC<FeatureMappingInteractiveWidgetProps> = ({
  plan,
  setPlan,
  onInputChange,
}) => {
  const [features, setFeatures] = useState<FeatureItem[]>(DEFAULT_FEATURES);
  const [happyPathSteps, setHappyPathSteps] = useState<HappyPathStep[]>(DEFAULT_HAPPY_PATH);
  const [selectedStatusTpl, setSelectedStatusTpl] = useState(0);
  const [customStatuses, setCustomStatuses] = useState<string[]>(STATUS_TEMPLATES[0].steps);
  const [activeSimulationStatus, setActiveSimulationStatus] = useState<number>(0);

  // Available screens for dropdown
  const availableScreens = plan.navigation?.pageStructure?.map(p => `${p.name} (${p.slug})`) || [
    '메인 장부 대시보드 (/)',
    '신규 등록 모달 (/new)',
    '상세 이력 서랍 (/detail)',
  ];

  const syncToBundle = (
    updatedFeatures: FeatureItem[], 
    updatedSteps: HappyPathStep[], 
    statuses: string[]
  ) => {
    // 1. Sync Chapter 3 natural language inputs
    // 3_core_features:
    const featuresSummary = updatedFeatures
      .map((f, i) => `${i + 1}. [${f.priority}] ${f.title} (${f.targetScreen})\n   - 기능 설명: ${f.description}`)
      .join('\n\n');
    onInputChange(3, 'core_features', featuresSummary);

    // 3_user_journey (Happy Path):
    const journeySummary = updatedSteps
      .map(s => `${s.step}단계: ${s.action} ➔ 결과: ${s.result}`)
      .join('\n');
    const lifecycleText = `\n\n[상태 순환 수명주기]\n${statuses.join(' ➔ ')}`;
    onInputChange(3, 'user_journey', `${journeySummary}${lifecycleText}`);

    // 2. Also keep plan.features synced if applicable
    if (plan.features) {
      setPlan({
        ...plan,
        features: {
          ...plan.features,
          list: updatedFeatures.map(f => ({
            id: f.id,
            name: f.title,
            priority: (f.priority || '').startsWith('P0') ? 'P0' : (f.priority || '').startsWith('P1') ? 'P1' : 'P2',
            description: `${f.description} (대상 화면: ${f.targetScreen})`,
            mappedScreens: [f.targetScreen],
          }))
        }
      });
    }
  };

  const handleAddFeature = () => {
    const newFeature: FeatureItem = {
      id: `f_${Date.now()}`,
      title: `신규 기능 ${features.length + 1}`,
      priority: 'P1 중요',
      targetScreen: availableScreens[0] || '메인 장부 대시보드 (/)',
      description: '사용자가 편리하게 작업할 수 있도록 지원하는 핵심 기능'
    };
    const updated = [...features, newFeature];
    setFeatures(updated);
    syncToBundle(updated, happyPathSteps, customStatuses);
  };

  const handleUpdateFeature = (id: string, field: keyof FeatureItem, val: string) => {
    const updated = features.map(f => f.id === id ? { ...f, [field]: val } : f);
    setFeatures(updated);
    syncToBundle(updated, happyPathSteps, customStatuses);
  };

  const handleDeleteFeature = (id: string) => {
    if (features.length <= 1) {
      alert('최소 1개 이상의 핵심 기능이 정의되어야 합니다.');
      return;
    }
    const updated = features.filter(f => f.id !== id);
    setFeatures(updated);
    syncToBundle(updated, happyPathSteps, customStatuses);
  };

  const handleUpdateHappyPath = (stepNum: number, field: 'action' | 'result', val: string) => {
    const updated = happyPathSteps.map(s => s.step === stepNum ? { ...s, [field]: val } : s);
    setHappyPathSteps(updated);
    syncToBundle(features, updated, customStatuses);
  };

  const handleSelectStatusTemplate = (idx: number) => {
    setSelectedStatusTpl(idx);
    const newCycle = STATUS_TEMPLATES[idx].steps;
    setCustomStatuses(newCycle);
    syncToBundle(features, happyPathSteps, newCycle);
  };

  return (
    <div className="bg-[#13181F] rounded-[3px] p-5 sm:p-6 border border-white/7 shadow-xs space-y-6 text-[#F0F3F6]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/7 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[2px] bg-[#18202A] text-[#C5A880] border border-white/10">
              <Workflow size={16} />
            </span>
            <h3 className="font-bold text-[#F0F3F6] text-base sm:text-lg">
              핵심 기능 ↔ 화면 매핑 및 성공 여정 (Happy Path)
            </h3>
            <span className="px-2 py-0.5 rounded-[2px] bg-[#18202A] text-[#34D399] text-xs font-mono border border-white/10">
              02_roadmap.md 연동
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#9AA5B5] mt-1 font-sans leading-relaxed">
            소프트웨어가 제공할 필수 기능을 정의하고, 대상 화면과 사용자의 가장 이상적인 이용 동선을 매핑합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddFeature}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#C5A880] hover:bg-[#D4AF37] text-[#0B0C10] text-xs font-semibold transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>+ 기능 추가</span>
        </button>
      </div>

      {/* 1. Feature to Screen Mapping Table */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-[#F0F3F6] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers size={14} className="text-[#C5A880]" />
            <span>3대 필수 핵심 기능 ↔ 대상 화면 매핑</span>
          </div>
          <span className="text-[11px] font-mono text-[#5C6675]">
            각 기능이 어느 화면에서 동작하는지 지정
          </span>
        </label>

        <div className="space-y-2.5">
          {features.map((f, idx) => (
            <div
              key={f.id}
              className="p-3.5 rounded-[4px] border border-white/8 bg-[#0E1217] hover:border-white/15 focus-within:border-[#C5A880]/60 focus-within:ring-1 focus-within:ring-[#C5A880]/20 space-y-2.5 transition-all shadow-xs"
            >
              {/* Top Row: Index Badge, Feature Title, Priority Selector, Delete Button */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#C5A880] bg-[#18202A] px-2 py-1 rounded-[3px] border border-white/10 shrink-0">
                  #0{idx + 1}
                </span>

                <input
                  type="text"
                  value={f.title}
                  onChange={(e) => handleUpdateFeature(f.id, 'title', e.target.value)}
                  className="flex-1 bg-[#13181F] border border-white/10 hover:border-white/20 rounded-[3px] px-3 py-1.5 text-xs font-semibold text-[#F0F3F6] outline-none focus:border-[#C5A880] transition-colors"
                  placeholder="기능 명칭 (예: 원클릭 신규 장부 등록)"
                />

                <select
                  value={f.priority}
                  onChange={(e) => handleUpdateFeature(f.id, 'priority', e.target.value as any)}
                  className="bg-[#13181F] border border-white/10 hover:border-white/20 rounded-[3px] px-2.5 py-1.5 text-xs font-mono font-medium text-[#C5A880] outline-none focus:border-[#C5A880] cursor-pointer transition-colors shrink-0"
                >
                  <option value="P0 필수">P0 필수</option>
                  <option value="P1 중요">P1 중요</option>
                  <option value="P2 부가">P2 부가</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleDeleteFeature(f.id)}
                  className="p-1.5 text-[#5C6675] hover:text-red-400 hover:bg-white/5 rounded-[3px] transition-colors cursor-pointer shrink-0"
                  title="기능 삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Bottom Row: Detailed Description & Target Screen Mapping */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={f.description}
                    onChange={(e) => handleUpdateFeature(f.id, 'description', e.target.value)}
                    className="w-full bg-[#13181F] border border-white/10 hover:border-white/20 rounded-[3px] px-3 py-1.5 text-xs text-[#9AA5B5] outline-none focus:border-[#C5A880] transition-colors"
                    placeholder="기능에 대한 상세 동작 설명 (예: 3초 안에 빠르게 입력)"
                  />
                </div>
                <div className="sm:col-span-1">
                  <select
                    value={f.targetScreen}
                    onChange={(e) => handleUpdateFeature(f.id, 'targetScreen', e.target.value)}
                    className="w-full bg-[#13181F] border border-white/10 hover:border-white/20 rounded-[3px] px-2.5 py-1.5 text-xs text-[#9AA5B5] outline-none focus:border-[#C5A880] truncate cursor-pointer transition-colors"
                  >
                    {availableScreens.map((s, i) => (
                      <option key={i} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. State Machine / Lifecycle Cycler */}
      <div className="space-y-3 pt-4 border-t border-white/7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold text-[#F0F3F6] flex items-center gap-1.5">
            <RefreshCw size={14} className="text-[#C5A880]" />
            <span>장부 상태 순환 수명주기 (State Machine)</span>
          </label>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {STATUS_TEMPLATES.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectStatusTemplate(idx)}
                className={`px-2.5 py-1 rounded-[2px] text-xs font-medium transition-colors cursor-pointer border ${
                  selectedStatusTpl === idx
                    ? 'border-[#C5A880] bg-[#18202A] text-[#C5A880]'
                    : 'border-white/10 bg-[#13181F] text-[#9AA5B5] hover:text-[#F0F3F6]'
                }`}
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3.5 rounded-[4px] bg-[#0E1217] border border-white/8 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-[#5C6675]">
            <span>순환 상태 파이프라인 (클릭하여 전이 시뮬레이션)</span>
            <span className="font-mono text-[#C5A880]">
              현재 활성: {customStatuses[activeSimulationStatus] || customStatuses[0]}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {customStatuses.map((st, i) => {
              const isSelected = activeSimulationStatus === i;
              // Semantic stage colors
              const stageColors = [
                'bg-sky-950/40 text-sky-300 border-sky-800/50 hover:bg-sky-900/50',
                'bg-indigo-950/40 text-indigo-300 border-indigo-800/50 hover:bg-indigo-900/50',
                'bg-amber-950/40 text-amber-300 border-amber-800/50 hover:bg-amber-900/50',
                'bg-emerald-950/40 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/50',
              ];
              const colorClass = stageColors[i % stageColors.length];

              return (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = (i + 1) % customStatuses.length;
                      setActiveSimulationStatus(i);
                    }}
                    className={`px-3 py-1.5 rounded-[3px] border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${colorClass} ${
                      isSelected ? 'ring-2 ring-[#C5A880] shadow-sm scale-105' : 'opacity-85 hover:opacity-100'
                    }`}
                    title="클릭하여 상태 전이 확인"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#C5A880] animate-pulse' : 'bg-current opacity-70'}`} />
                    <span>{st}</span>
                  </button>
                  {i < customStatuses.length - 1 && (
                    <span className="text-xs text-[#5C6675] font-mono select-none">➔</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* 3. Happy Path Step Builder */}
      <div className="space-y-3 pt-4 border-t border-white/7">
        <label className="text-xs font-semibold text-[#F0F3F6] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ArrowRightCircle size={14} className="text-[#C5A880]" />
            <span>사용자 성공 여정 (Happy Path 4단계)</span>
          </div>
          <span className="text-xs text-[#5C6675]">
            목적 달성까지의 최단 무장애 경로
          </span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {happyPathSteps.map((s) => (
            <div
              key={s.step}
              className="p-3.5 rounded-[3px] border border-white/5 bg-[#18202A] space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#C5A880] tabular-nums shrink-0">
                  0{s.step}.
                </span>
                <input
                  type="text"
                  value={s.action}
                  onChange={(e) => handleUpdateHappyPath(s.step, 'action', e.target.value)}
                  className="flex-1 text-xs sm:text-sm font-semibold text-[#F0F3F6] bg-transparent border-0 border-b border-white/10 focus:border-[#C5A880] outline-none pb-0.5"
                  placeholder={`Step ${s.step} 사용자 행동`}
                />
              </div>

              <div className="pl-6">
                <input
                  type="text"
                  value={s.result}
                  onChange={(e) => handleUpdateHappyPath(s.step, 'result', e.target.value)}
                  className="w-full text-xs text-[#9AA5B5] bg-transparent border-0 border-b border-white/5 focus:border-[#C5A880] outline-none pb-0.5"
                  placeholder="시스템의 즉각 반응 결과"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
