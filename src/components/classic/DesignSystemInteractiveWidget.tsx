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
    id: 'porcelain-honey-gold',
    name: '화사한 백자 & 허니 골드',
    engName: 'Porcelain & Honey Gold',
    description: '화사하고 밝은 백자 캔버스(#FBFBFA)와 정갈한 잉크 블랙(#18181B), 기분 좋은 스위트포테이토 허니 골드(#D97706)의 경쾌한 미니멀리즘',
    paperBg: '#FBFBFA',
    primaryColor: '#18181B',
    accentColor: '#D97706',
    textColor: '#27272A',
    borderColor: '#E4E4E7',
    tag: '시그니처 화사함',
  },
  {
    id: 'sunlit-hanji-amber',
    name: '햇살 한지 & 웜 앰버',
    engName: 'Sunlit Hanji & Warm Amber',
    description: '아침 햇살이 스며든 따뜻한 한지 아이보리(#FDFCF7)와 부드러운 차콜(#1F2937), 생기 넘치는 웜 앰버(#EA580C)의 감성',
    paperBg: '#FDFCF7',
    primaryColor: '#1F2937',
    accentColor: '#EA580C',
    textColor: '#374151',
    borderColor: '#E5E7EB',
    tag: '따뜻한 감성',
  },
  {
    id: 'clean-atelier-sage',
    name: '클린 아틀리에 & 세이지 민트',
    engName: 'Clean Atelier & Sage Mint',
    description: '맑고 투명한 청량감: 시원하고 깨끗한 화이트(#F8FAFC)와 상쾌한 세이지 민트(#10B981), 세련된 딥 슬레이트(#0F172A)',
    paperBg: '#F8FAFC',
    primaryColor: '#0F172A',
    accentColor: '#10B981',
    textColor: '#334155',
    borderColor: '#E2E8F0',
    tag: '청량한 기분전환',
  },
  {
    id: 'sumi-black-hanji-white',
    name: '수미 블랙 & 한지 화이트',
    engName: 'Sumi Black & Hanji White',
    description: '깊은 흑색 먹빛 캔버스(#0A0A0C) 위에 펼쳐지는 고요한 한지 화이트(#F5F3ED)와 은은한 샴페인 골드(#C5A880)의 콰이어트 럭셔리',
    paperBg: '#0A0A0C',
    primaryColor: '#F5F3ED',
    accentColor: '#C5A880',
    textColor: '#F5F3ED',
    borderColor: '#23232A',
    tag: '클래식 다크',
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
  const currentThemeColor = plan.design?.themeColor || '#F5F3ED';
  const currentLayout = plan.design?.layout || 'standard';

  const [headingWeight, setHeadingWeight] = useState<'bold' | 'semibold'>('bold');
  const [inputStyle, setInputStyle] = useState<'underline' | 'box'>('box');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Match active preset or fallback to sumi black
  const activePreset = THEME_PRESETS.find(
    p => p.primaryColor.toLowerCase() === currentThemeColor.toLowerCase() || p.id === 'sumi-black-hanji-white'
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
    const moodText = `${preset.engName}: ${preset.name} - 캔버스(${preset.paperBg})에 ${preset.primaryColor} 주조색과 ${preset.accentColor} 악센트 (${preset.description}) - Pretendard Sans Serif 전면 적용`;
    onInputChange(5, 'brand_mood', moodText);
  };

  const handleFontWeightChange = (weight: 'bold' | 'semibold') => {
    setHeadingWeight(weight);
    const weightDesc = weight === 'bold' ? 'Pretendard Bold 700 (강렬한 헤드라인 대비)' : 'Pretendard SemiBold 600 (단아하고 정제된 절제미)';
    const inputDesc = inputStyle === 'underline' ? '하단 1px 밑줄형 미니멀 인풋' : '정제된 미니멀 프레임 박스 인풋';
    onInputChange(5, 'ui_tone', `Pretendard Sans Serif (${weightDesc}) + ${inputDesc} + 수미 블랙 & 한지 화이트 럭셔리 모노크롬`);
  };

  const handleInputStyleChange = (style: 'underline' | 'box') => {
    setInputStyle(style);
    const weightDesc = headingWeight === 'bold' ? 'Pretendard Bold 700' : 'Pretendard SemiBold 600';
    const inputDesc = style === 'underline' ? '하단 1px 밑줄형 미니멀 인풋' : '정제된 미니멀 프레임 박스 인풋';
    onInputChange(5, 'ui_tone', `Pretendard Sans Serif (${weightDesc}) + ${inputDesc} + 수미 블랙 & 한지 화이트 럭셔리 모노크롬`);
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
    <div className="bg-white rounded-[2px] p-5 sm:p-6 border border-stone-200/90 space-y-6 text-stone-900 font-sans shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[2px] bg-amber-50 text-[#D97706] border border-amber-200/70">
              <Palette size={16} />
            </span>
            <h3 className="font-sans font-bold text-stone-900 text-base sm:text-lg">
              비주얼 테마 및 디자인 규약 조율
            </h3>
            <span className="text-xs text-stone-500 font-mono">
              05_design_system.md
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 font-sans leading-relaxed">
            원하는 테마 프리셋을 선택하면 11종 사양서와 프로토타입에 디자인 규약이 동기화됩니다.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 text-xs font-mono text-stone-600">
          <span className="w-2.5 h-2.5 rounded-[2px] border border-stone-300" style={{ backgroundColor: activePreset.primaryColor }} />
          <span className="text-stone-900 font-medium">{activePreset.name}</span>
        </div>
      </div>

      {/* 1. 4 Signature Theme Preset Cards */}
      <div className="space-y-3">
        <label className="text-xs font-sans font-semibold text-stone-900 block">
          4종 감성 미니멀리즘 테마 프리셋
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
                    ? 'border-[#D97706] bg-amber-50/70 ring-1 ring-[#D97706]/40 shadow-xs'
                    : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100/70 hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`font-sans font-semibold text-sm ${isSelected ? 'text-stone-900' : 'text-stone-700'}`}>
                        {preset.name}
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="text-[#D97706] font-mono text-[11px] font-semibold">
                        {preset.tag}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed font-sans">
                      {preset.description}
                    </p>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    {isSelected ? (
                      <span className="w-4 h-4 rounded-[2px] bg-[#D97706] text-white flex items-center justify-center font-bold">
                        <Check size={11} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-[2px] border border-stone-300 bg-white" />
                    )}
                  </div>
                </div>

                {/* Color Swatch Bar */}
                <div className="flex items-center gap-2 pt-2 border-t border-stone-200/80">
                  <div 
                    className="w-4 h-4 rounded-[2px] border border-stone-300 shrink-0"
                    style={{ backgroundColor: preset.paperBg }}
                    title={`배경: ${preset.paperBg}`}
                  />
                  <div 
                    className="w-4 h-4 rounded-[2px] border border-stone-300 shrink-0"
                    style={{ backgroundColor: preset.primaryColor }}
                    title={`주조색: ${preset.primaryColor}`}
                  />
                  <div 
                    className="w-4 h-4 rounded-[2px] border border-stone-300 shrink-0"
                    style={{ backgroundColor: preset.accentColor }}
                    title={`악센트: ${preset.accentColor}`}
                  />
                  <div 
                    className="w-4 h-4 rounded-[2px] border border-stone-300 shrink-0"
                    style={{ backgroundColor: preset.textColor }}
                    title={`본문색: ${preset.textColor}`}
                  />
                  <span className="text-[10px] font-mono text-stone-500 ml-auto">
                    {preset.primaryColor}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Typography & Input Style Customizer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-stone-200/80">
        {/* Pretendard Sans Weight Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
            <Type size={14} className="text-[#D97706]" />
            <span>Pretendard Sans 위계</span>
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleFontWeightChange('bold')}
              className={`py-2 px-2 rounded-[2px] border text-center transition-colors cursor-pointer font-medium ${
                headingWeight === 'bold'
                  ? 'border-[#D97706] bg-[#D97706] text-white font-semibold shadow-xs'
                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Bold (700)
            </button>
            <button
              type="button"
              onClick={() => handleFontWeightChange('semibold')}
              className={`py-2 px-2 rounded-[2px] border text-center transition-colors cursor-pointer font-medium ${
                headingWeight === 'semibold'
                  ? 'border-[#D97706] bg-[#D97706] text-white font-semibold shadow-xs'
                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              SemiBold (600)
            </button>
          </div>
        </div>

        {/* Input Field Style */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
            <Sliders size={14} className="text-[#D97706]" />
            <span>필기 입력창 스타일</span>
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleInputStyleChange('underline')}
              className={`py-2 px-2 rounded-[2px] border text-center transition-colors cursor-pointer font-medium ${
                inputStyle === 'underline'
                  ? 'border-[#D97706] bg-[#D97706] text-white font-semibold shadow-xs'
                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              하단 밑줄형
            </button>
            <button
              type="button"
              onClick={() => handleInputStyleChange('box')}
              className={`py-2 px-2 rounded-[2px] border text-center transition-colors cursor-pointer font-medium ${
                inputStyle === 'box'
                  ? 'border-[#D97706] bg-[#D97706] text-white font-semibold shadow-xs'
                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              미니멀 박스
            </button>
          </div>
        </div>

        {/* Layout Structure */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-900 block">
            화면 분할 구조
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleLayoutChange('standard')}
              className={`py-2 px-2 rounded-[2px] border text-center transition-colors cursor-pointer font-medium ${
                currentLayout === 'standard'
                  ? 'border-[#D97706] bg-[#D97706] text-white font-semibold shadow-xs'
                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              2-Track 비대칭
            </button>
            <button
              type="button"
              onClick={() => handleLayoutChange('dashboard')}
              className={`py-2 px-2 rounded-[2px] border text-center transition-colors cursor-pointer font-medium ${
                currentLayout === 'dashboard'
                  ? 'border-[#D97706] bg-[#D97706] text-white font-semibold shadow-xs'
                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              와이드 뷰
            </button>
          </div>
        </div>
      </div>

      {/* 3. Live UI Component Preview Card */}
      <div className="pt-3 border-t border-[#23232A]">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-sans font-semibold text-[#F5F3ED]">
            선택된 테마 토큰 프리뷰
          </span>
          <span className="font-mono text-[#B8B5AC]">
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
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#78756E] block">
                Sample Output Preview · Pretendard Sans
              </span>
              <h4 
                className={`text-base font-bold tracking-tight mt-0.5 text-[#F5F3ED] font-sans ${
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
              <span className="text-[#78756E]">·</span>
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
                  className="w-full bg-transparent border-0 border-b-2 px-2 py-1.5 text-xs sm:text-sm font-sans outline-none text-[#F5F3ED]"
                  style={{ borderColor: activePreset.accentColor }}
                />
              ) : (
                <input
                  type="text"
                  readOnly
                  value="서비스 도메인: api.platform.service/v1"
                  className="w-full bg-[#16161C] border px-3 py-2 text-xs sm:text-sm font-sans rounded-[2px] outline-none text-[#F5F3ED]"
                  style={{ borderColor: activePreset.borderColor }}
                />
              )}
            </div>

            <button
              type="button"
              className="px-4 py-2 rounded-[2px] font-semibold text-xs shadow-none shrink-0 cursor-default"
              style={{ 
                backgroundColor: activePreset.accentColor, 
                color: '#0A0A0C'
              }}
            >
              신규 등록
            </button>
          </div>

          {/* Color Tokens Hex Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#23232A] text-xs font-mono">
            <button
              type="button"
              onClick={() => handleCopyHex(activePreset.paperBg)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#16161C] border border-[#23232A] hover:bg-[#1C1C24] text-[#F5F3ED] cursor-pointer"
              title="배경색 복사"
            >
              <span className="w-3 h-3 rounded-[2px] border border-[#383844]" style={{ backgroundColor: activePreset.paperBg }} />
              <span>배경: {activePreset.paperBg}</span>
              {copiedHex === activePreset.paperBg && <Check size={12} className="text-[#C5A880]" />}
            </button>

            <button
              type="button"
              onClick={() => handleCopyHex(activePreset.primaryColor)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#16161C] border border-[#23232A] hover:bg-[#1C1C24] text-[#F5F3ED] cursor-pointer"
              title="주조색 복사"
            >
              <span className="w-3 h-3 rounded-[2px] border border-[#383844]" style={{ backgroundColor: activePreset.primaryColor }} />
              <span>주조색: {activePreset.primaryColor}</span>
              {copiedHex === activePreset.primaryColor && <Check size={12} className="text-[#C5A880]" />}
            </button>

            <button
              type="button"
              onClick={() => handleCopyHex(activePreset.accentColor)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#16161C] border border-[#23232A] hover:bg-[#1C1C24] text-[#F5F3ED] cursor-pointer"
              title="악센트색 복사"
            >
              <span className="w-3 h-3 rounded-[2px] border border-[#383844]" style={{ backgroundColor: activePreset.accentColor }} />
              <span>악센트: {activePreset.accentColor}</span>
              {copiedHex === activePreset.accentColor && <Check size={12} className="text-[#C5A880]" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
