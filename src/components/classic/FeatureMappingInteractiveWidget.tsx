import React, { useState } from 'react';
import { 
  Workflow, Plus, Trash2, 
  Layers, RefreshCw, ArrowRightCircle
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
    title: '사용자 인증 및 세션 관리 (JWT & SSO)',
    priority: 'P0 필수',
    targetScreen: '인증 게이트웨이 (/auth/login)',
    description: '토큰 기반 세션 관리 및 역할 기반 권한 제어(RBAC)'
  },
  {
    id: 'f2',
    title: '실시간 메트릭 대시보드 (KPI Overview)',
    priority: 'P0 필수',
    targetScreen: '워크스페이스 대시보드 (/dashboard)',
    description: '핵심 성능 지표, 최근 활동 로그 및 실시간 데이터 갱신'
  },
  {
    id: 'f3',
    title: '고성능 데이터 테이블 & 스마트 검색',
    priority: 'P1 중요',
    targetScreen: '프로젝트 및 리소스 관리 (/projects)',
    description: '대용량 데이터 가상화 스크롤, 다중 조건 필터링 및 즉시 검색'
  }
];

const DEFAULT_HAPPY_PATH: HappyPathStep[] = [
  { step: 1, action: '웹 서비스 접속 및 SSO 간편 인증', result: '세션 토큰 발급 및 워크스페이스 대시보드로 이동' },
  { step: 2, action: '워크스페이스 대시보드에서 핵심 KPI 지표 확인', result: '실시간 차트 및 상태 위젯 0ms 렌더링' },
  { step: 3, action: '신규 리소스 생성 및 속성 정의 후 저장', result: 'REST/GraphQL API 연동 및 데이터베이스 즉각 반영' },
  { step: 4, action: '데이터 파이프라인 상태 전이 및 배포 완료', result: '결과 감사 로그 기록 및 시스템 지표 동기화' },
];

const STATUS_TEMPLATES = [
  { name: '3단계 배포 파이프라인', steps: ['Development', 'Staging', 'Production'] },
  { name: '4단계 태스크 라이프사이클', steps: ['Backlog', 'In Progress', 'In Review', 'Resolved'] },
  { name: '3단계 데이터 퍼블리싱', steps: ['Draft', 'In Review', 'Published'] },
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
    '워크스페이스 대시보드 (/dashboard)',
    '프로젝트 관리 (/projects)',
    '설정 및 권한 (/settings)',
  ];

  const syncToBundle = (
    updatedFeatures: FeatureItem[], 
    updatedSteps: HappyPathStep[], 
    statuses: string[]
  ) => {
    // 1. Sync Chapter 3 natural language inputs
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
      targetScreen: availableScreens[0] || '메인 대시보드 (/dashboard)',
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
    <div className="bg-[#121216] rounded-[2px] p-5 sm:p-6 border border-[#23232A] space-y-6 text-[#F5F3ED] font-sans shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#23232A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[2px] bg-[#181820] text-[#C5A880] border border-[#282834]">
              <Workflow size={16} />
            </span>
            <h3 className="font-sans font-bold text-[#F5F3ED] text-base sm:text-lg">
              핵심 기능 ↔ 화면 매핑 및 성공 여정 (Happy Path)
            </h3>
            <span className="px-2 py-0.5 rounded-[2px] bg-[#181820] text-[#C5A880] text-xs font-mono border border-[#282834]">
              02_roadmap.md
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#B8B5AC] mt-1 font-sans leading-relaxed">
            소프트웨어가 제공할 필수 기능을 정의하고, 대상 화면과 사용자의 가장 이상적인 이용 동선을 매핑합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddFeature}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#C5A880] hover:bg-[#D4B896] text-[#0A0A0C] text-xs font-semibold transition-all cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Plus size={14} />
          <span>+ 기능 추가</span>
        </button>
      </div>

      {/* 1. Feature to Screen Mapping Table */}
      <div className="space-y-3">
        <label className="text-xs font-sans font-semibold text-[#F5F3ED] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers size={14} className="text-[#C5A880]" />
            <span>3대 필수 핵심 기능 ↔ 대상 화면 매핑</span>
          </div>
          <span className="text-[11px] font-mono text-[#78756E]">
            각 기능이 어느 화면에서 동작하는지 지정
          </span>
        </label>

        <div className="space-y-2.5">
          {features.map((f, idx) => (
            <div
              key={f.id}
              className="p-3.5 rounded-[2px] border border-[#23232A] bg-[#16161C] hover:border-[#383848] focus-within:border-[#C5A880] space-y-2.5 transition-all shadow-xs"
            >
              {/* Top Row: Index Badge, Feature Title, Priority Selector, Delete Button */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#F5F3ED] bg-[#1E1E26] px-2 py-1 rounded-[2px] border border-[#2A2A38] shrink-0">
                  #0{idx + 1}
                </span>

                <input
                  type="text"
                  value={f.title}
                  onChange={(e) => handleUpdateFeature(f.id, 'title', e.target.value)}
                  className="flex-1 bg-[#121216] border border-[#23232A] hover:border-[#383848] rounded-[2px] px-3 py-1.5 text-xs font-semibold text-[#F5F3ED] outline-none focus:border-[#C5A880] transition-colors"
                  placeholder="기능 명칭 (예: 원클릭 리소스 생성 및 필터링)"
                />

                <select
                  value={f.priority}
                  onChange={(e) => handleUpdateFeature(f.id, 'priority', e.target.value as any)}
                  className="bg-[#121216] border border-[#23232A] hover:border-[#383848] rounded-[2px] px-2.5 py-1.5 text-xs font-mono font-medium text-[#F5F3ED] outline-none focus:border-[#C5A880] cursor-pointer transition-colors shrink-0"
                >
                  <option value="P0 필수">P0 필수</option>
                  <option value="P1 중요">P1 중요</option>
                  <option value="P2 부가">P2 부가</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleDeleteFeature(f.id)}
                  className="p-1.5 text-[#78756E] hover:text-[#C5A880] hover:bg-[#1E1E26] rounded-[2px] transition-colors cursor-pointer shrink-0"
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
                    className="w-full bg-[#121216] border border-[#23232A] hover:border-[#383848] rounded-[2px] px-3 py-1.5 text-xs text-[#B8B5AC] outline-none focus:border-[#C5A880] transition-colors"
                    placeholder="기능에 대한 상세 동작 설명 (예: 3초 안에 빠르게 입력)"
                  />
                </div>
                <div className="sm:col-span-1">
                  <select
                    value={f.targetScreen}
                    onChange={(e) => handleUpdateFeature(f.id, 'targetScreen', e.target.value)}
                    className="w-full bg-[#121216] border border-[#23232A] hover:border-[#383848] rounded-[2px] px-2.5 py-1.5 text-xs text-[#B8B5AC] outline-none focus:border-[#C5A880] truncate cursor-pointer transition-colors"
                  >
                    {availableScreens.map((s, i) => (
                      <option key={i} value={s} className="bg-[#121216] text-[#F5F3ED]">{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. State Machine / Lifecycle Cycler */}
      <div className="space-y-3 pt-4 border-t border-[#23232A]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold text-[#F5F3ED] flex items-center gap-1.5">
            <RefreshCw size={14} className="text-[#C5A880]" />
            <span>리소스 상태 전이 수명주기 (State Machine)</span>
          </label>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {STATUS_TEMPLATES.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectStatusTemplate(idx)}
                className={`px-2.5 py-1 rounded-[2px] text-xs font-medium transition-colors cursor-pointer border ${
                  selectedStatusTpl === idx
                    ? 'border-[#C5A880] bg-[#C5A880] text-[#0A0A0C] font-semibold shadow-xs'
                    : 'border-[#23232A] bg-[#16161C] text-[#B8B5AC] hover:text-[#F5F3ED]'
                }`}
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3.5 rounded-[2px] bg-[#16161C] border border-[#23232A] space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-[#B8B5AC]">
            <span>순환 상태 파이프라인 (클릭하여 전이 시뮬레이션)</span>
            <span className="font-mono text-[#C5A880] font-semibold">
              현재 활성: {customStatuses[activeSimulationStatus] || customStatuses[0]}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {customStatuses.map((st, i) => {
              const isSelected = activeSimulationStatus === i;

              return (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSimulationStatus(i);
                    }}
                    className={`px-3 py-1.5 rounded-[2px] border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'border-[#C5A880] bg-[#C5A880] text-[#0A0A0C] font-bold shadow-xs'
                        : 'border-[#23232A] bg-[#121216] text-[#B8B5AC] hover:border-[#383848] hover:text-[#F5F3ED]'
                    }`}
                    title="클릭하여 상태 전이 확인"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#0A0A0C]' : 'bg-[#C5A880]/40'}`} />
                    <span>{st}</span>
                  </button>
                  {i < customStatuses.length - 1 && (
                    <span className="text-xs text-[#78756E] font-mono select-none">➔</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Happy Path Step Builder */}
      <div className="space-y-3 pt-4 border-t border-[#23232A]">
        <label className="text-xs font-sans font-semibold text-[#F5F3ED] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ArrowRightCircle size={14} className="text-[#C5A880]" />
            <span>사용자 성공 여정 (Happy Path 4단계)</span>
          </div>
          <span className="text-xs text-[#78756E]">
            목적 달성까지의 최단 무장애 경로
          </span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {happyPathSteps.map((s) => (
            <div
              key={s.step}
              className="p-3.5 rounded-[2px] border border-[#23232A] bg-[#16161C] space-y-2 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#C5A880] font-semibold tabular-nums shrink-0">
                  0{s.step}.
                </span>
                <input
                  type="text"
                  value={s.action}
                  onChange={(e) => handleUpdateHappyPath(s.step, 'action', e.target.value)}
                  className="flex-1 text-xs sm:text-sm font-semibold text-[#F5F3ED] bg-transparent border-0 border-b border-[#23232A] focus:border-[#C5A880] outline-none pb-0.5"
                  placeholder={`Step ${s.step} 사용자 행동`}
                />
              </div>

              <div className="pl-6">
                <input
                  type="text"
                  value={s.result}
                  onChange={(e) => handleUpdateHappyPath(s.step, 'result', e.target.value)}
                  className="w-full text-xs text-[#B8B5AC] bg-transparent border-0 border-b border-[#23232A] focus:border-[#C5A880] outline-none pb-0.5"
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
