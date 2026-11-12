import React, { useState } from 'react';
import { Palette, Check, Type, Sliders } from 'lucide-react';
import { SitePlan } from '../../types';

export interface ThemePreset {
  id: string;
  name: string;
  engName: string;
  description: string;
  paperBg: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  borderColor: string;
  tag: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'sumi-black-sapphire-blue',
    name: '수미 블랙 & 사파이어 블루',
    engName: 'Sumi Black & Sapphire Blue',
    description: '깊은 흑색 먹빛 캔버스(#0B0C10) 위에 정갈한 웜 화이트(#F0F3F6)와 지적인 럭셔리 사파이어 블루(#2563EB) 및 일렉트릭 애저(#38BDF8)의 콰이어트 럭셔리',
    paperBg: '#0B0C10',
    primaryColor: '#2563EB',
    accentColor: '#38BDF8',
    textColor: '#F0F3F6',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    tag: '시그니처 다크',
  },
  {
    id: 'midnight-azure-slate',
    name: '미드나잇 애저 & 딥 슬레이트',
    engName: 'Midnight Azure & Deep Slate',
    description: '깊은 자정의 네이비 블루(#0E1217) 베이스에 정제된 슬레이트 블루(#60A5FA)와 맑은 화이트(#F8FAFC)로 구성된 차분한 테크 아키텍처 테마',
    paperBg: '#0E1217',
    primaryColor: '#3B82F6',
    accentColor: '#60A5FA',
    textColor: '#F8FAFC',
    borderColor: 'rgba(255, 255, 255, 0.07)',
    tag: '테크 아키텍트',
  },
  {
    id: 'obsidian-cobalt-glow',
    name: '옵시디언 & 코발트 글로우',
    engName: 'Obsidian & Cobalt Glow',
    description: '완전한 흑요석 블랙(#07080B) 캔버스에 네온 코발트 블루(#1D4ED8)와 크리스털 스카이(#7DD3FC) 악센트의 미니멀 하이엔드 테마',
    paperBg: '#07080B',
    primaryColor: '#1D4ED8',
    accentColor: '#7DD3FC',
    textColor: '#E2E8F0',
    borderColor: 'rgba(255, 255, 255, 0.09)',
    tag: '하이엔드 미니멀',
  },
  {
    id: 'porcelain-sapphire-clean',
    name: '화이트 백자 & 사파이어 클래식',
    engName: 'Porcelain & Sapphire Classic',
    description: '정갈한 라이트 백자(#F8FAFC) 베이스 위에 지적인 사파이어 블루(#2563EB)와 다크 슬레이트(#0F172A) 타이포그래피의 세련된 조화',
    paperBg: '#F8FAFC',
    primaryColor: '#2563EB',
    accentColor: '#1E40AF',
    textColor: '#0F172A',
    borderColor: '#E2E8F0',
    tag: '정갈한 라이트',
  },
];

interface DesignSystemInteractiveWidgetProps {
  plan: SitePlan;
  setPlan: (plan: SitePlan) => void;
  onInputChange: (chapterId: number, sectionKey: string, text: string) => void;
}

export const DesignSystemInteractiveWidget: React.FC<DesignSystemInteractiveWidgetProps> = ({
  plan,
  setPlan,
  onInputChange,
}) => {
  const currentThemeColor = plan.design?.themeColor || '#2563EB';
  const currentLayout = plan.design?.layout || 'standard';

  const [headingWeight, setHeadingWeight] = useState<'bold' | 'semibold'>('bold');
  const [inputStyle, setInputStyle] = useState<'underline' | 'box'>('box');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Match active preset or fallback to Sumi Black & Sapphire Blue
  const activePreset = THEME_PRESETS.find(
    p => p.primaryColor.toLowerCase() === currentThemeColor.toLowerCase() || p.id === 'sumi-black-sapphire-blue'
  ) || THEME_PRESETS[0];

  const handleSelectPreset = (preset: ThemePreset) => {
    // 1. Update plan.design
    const updatedPlan: SitePlan = {
      ...plan,
      design: {
        ...plan.design,
        themeColor: preset.primaryColor,
        accentColor: preset.accentColor,
        bodyTextColor: preset.textColor,
        buttonColor: preset.primaryColor,
        aesthetic: preset.engName,
      },
    };
    setPlan(updatedPlan);

    // 2. Sync with natural language Chapter 5 inputs
    const moodText = `${preset.engName}: ${preset.name} - 캔버스(${preset.paperBg})에 ${preset.primaryColor} 주조색과 ${preset.accentColor} 악센트 (${preset.description}) - Plus Jakarta Sans & Pretendard Variable 산세리프 전면 적용`;
    onInputChange(5, 'brand_mood', moodText);
  };

  const handleFontWeightChange = (weight: 'bold' | 'semibold') => {
    setHeadingWeight(weight);
    const weightDesc = weight === 'bold' ? 'Pretendard Bold 700 (강렬하고 정밀한 헤드라인 대비)' : 'Pretendard SemiBold 600 (단아하고 정제된 절제미)';
    const inputDesc = inputStyle === 'underline' ? '하단 1px 밑줄형 미니멀 인풋' : '정제된 미니멀 프레임 박스 인풋';
    onInputChange(5, 'ui_tone', `Plus Jakarta Sans & Pretendard Variable (${weightDesc}) + ${inputDesc} + 수미 블랙 & 럭셔리 사파이어 블루 모노크롬`);
  };

  const handleInputStyleChange = (style: 'underline' | 'box') => {
    setInputStyle(style);
    const weightDesc = headingWeight === 'bold' ? 'Pretendard Bold 700' : 'Pretendard SemiBold 600';
    const inputDesc = style === 'underline' ? '하단 1px 밑줄형 미니멀 인풋' : '정제된 미니멀 프레임 박스 인풋';
    onInputChange(5, 'ui_tone', `Plus Jakarta Sans & Pretendard Variable (${weightDesc}) + ${inputDesc} + 수미 블랙 & 럭셔리 사파이어 블루 모노크롬`);
  };

  const handleLayoutChange = (layout: 'standard' | 'sidebar' | 'dashboard') => {
    setPlan({
      ...plan,
      design: {
        ...plan.design,
        layout,
      },
    });
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  return (
    <div className="bg-[#0E1217] rounded-[2px] p-5 sm:p-6 border border-white/[0.08] space-y-6 text-[#F0F3F6] font-sans shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[2px] bg-blue-950/60 text-[#38BDF8] border border-blue-500/30">
              <Palette size={16} />
            </span>
            <h3 className="font-sans font-bold text-[#F0F3F6] text-base sm:text-lg">
              비주얼 테마 및 디자인 규약 조율
            </h3>
            <span className="text-xs text-[#7A889B] font-mono">
              05_design_system.md
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 font-sans leading-relaxed">
            원하는 테마 프리셋을 선택하면 11종 사양서와 프로토타입에 디자인 규약이 즉시 동기화됩니다.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
          <span className="w-2.5 h-2.5 rounded-[2px] border border-white/20" style={{ backgroundColor: activePreset.primaryColor }} />
          <span className="text-[#F0F3F6] font-medium">{activePreset.name}</span>
        </div>
      </div>

      {/* 1. 4 Signature Theme Preset Cards */}
      <div className="space-y-3">
        <label className="text-xs font-sans font-semibold text-[#F0F3F6] block">
          4종 감성 미니멀리즘 테마 프리셋 (Sumi Black & Luxury Blue)
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {THEME_PRESETS.map((preset) => {
            const isSelected = activePreset.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-4 rounded-[2px] border text-left transition-colors cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'border-[#38BDF8] bg-[#16202E] ring-1 ring-[#38BDF8]/40 shadow-xs'
                    : 'border-white/[0.08] bg-[#13181F] hover:bg-[#18212B] hover:border-white/15'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`font-sans font-semibold text-sm ${isSelected ? 'text-[#F0F3F6]' : 'text-[#C5D0DC]'}`}>
                        {preset.name}
                      </span>
                      <span className="text-white/20">·</span>
                      <span className="text-[#38BDF8] font-mono text-[11px] font-semibold">
                        {preset.tag}
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed font-sans">
                      {preset.description}
                    </p>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    {isSelected ? (
                      <span className="w-4 h-4 rounded-[2px] bg-[#2563EB] text-white flex items-center justify-center font-bold">
                        <Check size={11} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-[2px] border border-white/20 bg-[#0B0C10]" />
                    )}
                  </div>
                </div>

                {/* Color Swatch Bar */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/[0.08]">
                  <div 
                    className="w-4 h-4 rounded-[2px] border border-white/20 shrink-0"
                    style={{ backgroundColor: preset.paperBg }}
                    title={`배경: ${preset.paperBg}`}
                  />
                  <div 
                    className="w-4 h-4 rounded-[2px] border border-white/20 shrink-0"
                    style={{ backgroundColor: preset.primaryColor }}
                    title={`주조색: ${preset.primaryColor}`}
                  />
                  <div 
                    className="w-4 h-4 rounded-[2px] border border-white/20 shrink-0"
                    style={{ backgroundColor: preset.accentColor }}
                    title={`악센트: ${preset.accentColor}`}
                  />
                  <div 
                    className="w-4 h-4 rounded-[2px] border border-white/20 shrink-0"
                    style={{ backgroundColor: preset.textColor }}
                    title={`본문색: ${preset.textColor}`}
                  />
                  <span className="text-[10px] font-mono text-[#7A889B] ml-auto">
                    {preset.primaryColor}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Typography & Input Style Customizer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/[0.08]">
        {/* Sans Weight Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#F0F3F6] flex items-center gap-1.5">
            <Type size={14} className="text-[#38BDF8]" />
            <span>Pretendard Sans 위계</span>
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleFontWeightChange('bold')}
              className={`py-2 px-2 rounded-[2px] border text-center transition-colors cursor-pointer font-medium ${
                headingWeight === 'bold'
                  ? 'border-[#2563EB] bg-[#2563EB] text-white font-semibold shadow-xs'
                  : 'border-white/[0.08] bg-[#13181F] text-[#94A3B8] hover:text-[#F0F3F6] hover:bg-[#18212B]'
              }`}
            >
              Bold (700)
            </button>
            <button
              type="button"
              onClick={() => handleFontWeightChange('semibold')}
              className={`py-2 px-2 rounded-[2px] border text-center transition-colors cursor-pointer font-medium ${
                headingWeight === 'semibold'
                  ? 'border-[#2563EB] bg-[#2563EB] text-white font-semibold shadow-xs'
                  : 'border-white/[0.08] bg-[#13181F] text-[#94A3B8] hover:text-[#F0F3F6] hover:bg-[#18212B]'
              }`}
            >
              SemiBold (600)
            </button>
          </div>
        </div>

        {/* Input Field Style */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#F0F3F6] flex items-center gap-1.5">
            <Sliders size={14} className="text-[#38BDF8]" />
            <span>필기 입력창 스타일</span>
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleInputStyleChange('underline')}
              className={`py-2 px-2 rounded-[2px] border text-center transition-colors cursor-pointer font-medium ${
                inputStyle === 'underline'
                  ? 'border-[#2563EB] bg-[#2563EB] text-white font-semibold shadow-xs'
                  : 'border-white/[0.08] bg-[#13181F] text-[#94A3B8] hover:text-[#F0F3F6] hover:bg-[#18212B]'
              }`}
            >
              하단 밑줄형
            </button>
            <button
              type="button"
              onClick={() => handleInputStyleChange('box')}
              className={`py-2 px-2 rounded-[2px] border text-center transition-colors cursor-pointer font-medium ${
                inputStyle === 'box'
                  ? 'border-[#2563EB] bg-[#2563EB] text-white font-semibold shadow-xs'
                  : 'border-white/[0.08] bg-[#13181F] text-[#94A3B8] hover:text-[#F0F3F6] hover:bg-[#18212B]'
              }`}
            >
              미니멀 박스
            </button>
          </div>
        </div>

        {/* Layout Structure */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#F0F3F6] block">
            화면 분할 구조
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleLayoutChange('standard')}
              className={`py-2 px-2 rounded-[2px] border text-center transition-colors cursor-pointer font-medium ${
                currentLayout === 'standard'
                  ? 'border-[#2563EB] bg-[#2563EB] text-white font-semibold shadow-xs'
                  : 'border-white/[0.08] bg-[#13181F] text-[#94A3B8] hover:text-[#F0F3F6] hover:bg-[#18212B]'
              }`}
            >
              2-Track 비대칭
            </button>
            <button
              type="button"
              onClick={() => handleLayoutChange('dashboard')}
              className={`py-2 px-2 rounded-[2px] border text-center transition-colors cursor-pointer font-medium ${
                currentLayout === 'dashboard'
                  ? 'border-[#2563EB] bg-[#2563EB] text-white font-semibold shadow-xs'
                  : 'border-white/[0.08] bg-[#13181F] text-[#94A3B8] hover:text-[#F0F3F6] hover:bg-[#18212B]'
              }`}
            >
              와이드 뷰
            </button>
          </div>
        </div>
      </div>

      {/* 3. Live UI Component Preview Card */}
      <div className="pt-3 border-t border-white/[0.08]">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-sans font-semibold text-[#F0F3F6]">
            선택된 테마 토큰 프리뷰
          </span>
          <span className="font-mono text-[#94A3B8]">
            {activePreset.engName} · {activePreset.primaryColor}
          </span>
        </div>

        <div 
          className="p-5 rounded-[2px] border transition-colors space-y-4 shadow-xs"
          style={{ 
            backgroundColor: activePreset.paperBg,
            borderColor: activePreset.borderColor,
            color: activePreset.textColor
          }}
        >
          {/* Sample Heading & Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A889B] block">
                Sample Output Preview · Plus Jakarta Sans & Pretendard
              </span>
              <h4 
                className={`text-base font-bold tracking-tight mt-0.5 text-[#F0F3F6] font-sans ${
                  headingWeight === 'bold' ? 'font-bold' : 'font-semibold'
                }`}
              >
                웹 서비스 관리 대시보드
              </h4>
            </div>

            {/* Unboxed Metadata Indicators */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <span style={{ color: activePreset.primaryColor }}>
                활성 인스턴스 3건
              </span>
              <span className="text-[#7A889B]">·</span>
              <span style={{ color: activePreset.accentColor }}>
                정상 배포 12건
              </span>
            </div>
          </div>

          {/* Sample Input and Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <div className="flex-1 w-full">
              {inputStyle === 'underline' ? (
                <input
                  type="text"
                  readOnly
                  value="서비스 도메인: api.platform.service/v1"
                  className="w-full bg-transparent border-0 border-b-2 px-2 py-1.5 text-xs sm:text-sm font-sans outline-none text-[#F0F3F6]"
                  style={{ borderColor: activePreset.accentColor }}
                />
              ) : (
                <input
                  type="text"
                  readOnly
                  value="서비스 도메인: api.platform.service/v1"
                  className="w-full bg-[#13181F] border px-3 py-2 text-xs sm:text-sm font-sans rounded-[2px] outline-none text-[#F0F3F6]"
                  style={{ borderColor: activePreset.borderColor }}
                />
              )}
            </div>

            <button
              type="button"
              className="px-4 py-2 rounded-[2px] font-semibold text-xs shadow-none shrink-0 cursor-default"
              style={{ 
                backgroundColor: activePreset.primaryColor, 
                color: '#FFFFFF'
              }}
            >
              신규 등록
            </button>
          </div>

          {/* Color Tokens Hex Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.08] text-xs font-mono">
            <button
              type="button"
              onClick={() => handleCopyHex(activePreset.paperBg)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#13181F] border border-white/[0.08] hover:bg-[#18212B] text-[#F0F3F6] cursor-pointer"
              title="배경색 복사"
            >
              <span className="w-3 h-3 rounded-[2px] border border-white/20" style={{ backgroundColor: activePreset.paperBg }} />
              <span>배경: {activePreset.paperBg}</span>
              {copiedHex === activePreset.paperBg && <Check size={12} className="text-[#38BDF8]" />}
            </button>

            <button
              type="button"
              onClick={() => handleCopyHex(activePreset.primaryColor)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#13181F] border border-white/[0.08] hover:bg-[#18212B] text-[#F0F3F6] cursor-pointer"
              title="주조색 복사"
            >
              <span className="w-3 h-3 rounded-[2px] border border-white/20" style={{ backgroundColor: activePreset.primaryColor }} />
              <span>주조색: {activePreset.primaryColor}</span>
              {copiedHex === activePreset.primaryColor && <Check size={12} className="text-[#38BDF8]" />}
            </button>

            <button
              type="button"
              onClick={() => handleCopyHex(activePreset.accentColor)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#13181F] border border-white/[0.08] hover:bg-[#18212B] text-[#F0F3F6] cursor-pointer"
              title="악센트색 복사"
            >
              <span className="w-3 h-3 rounded-[2px] border border-white/20" style={{ backgroundColor: activePreset.accentColor }} />
              <span>악센트: {activePreset.accentColor}</span>
              {copiedHex === activePreset.accentColor && <Check size={12} className="text-[#38BDF8]" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
