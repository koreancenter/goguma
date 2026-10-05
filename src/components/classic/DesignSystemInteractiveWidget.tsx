import React, { useState } from 'react';
import { Palette, Check, Type, Sliders, Sparkles, Copy } from 'lucide-react';
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
    id: 'classic-warm-paper',
    name: '클래식 웜 페이퍼',
    engName: 'Classic Warm Paper',
    description: '눈이 편안한 아이보리 양장본 도화지 & 고구마 시그니처 딥 와인',
    paperBg: '#F8F4EB',
    primaryColor: '#6B1D42',
    accentColor: '#10B981',
    textColor: '#231F20',
    borderColor: '#E5DFD3',
    tag: '시그니처 권장',
  },
  {
    id: 'editorial-slate',
    name: '에디토리얼 슬레이트',
    engName: 'Editorial Slate',
    description: '정갈하고 모던한 연회색 캔버스 & 묵직한 딥 네이비 악센트',
    paperBg: '#F5F5F7',
    primaryColor: '#1E293B',
    accentColor: '#2563EB',
    textColor: '#0F172A',
    borderColor: '#E2E8F0',
    tag: '모던 클래식',
  },
  {
    id: 'sage-minimal',
    name: '세이지 미니멀',
    engName: 'Sage Minimal',
    description: '자연 친화적인 세이지 크림 도화지 & 차분한 포레스트 올리브',
    paperBg: '#F4F6F0',
    primaryColor: '#3F4E34',
    accentColor: '#15803D',
    textColor: '#283324',
    borderColor: '#DCE3D6',
    tag: '온화한 감성',
  },
  {
    id: 'warm-wood-modern',
    name: '웜 우드 모던',
    engName: 'Warm Wood Modern',
    description: '원목 책상의 온화함을 담은 샌드 베이지 & 앤틱 브라운',
    paperBg: '#FAF7F2',
    primaryColor: '#78350F',
    accentColor: '#D97706',
    textColor: '#382012',
    borderColor: '#EADBCE',
    tag: '신뢰 & 아늑함',
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
  const currentThemeColor = plan.design?.themeColor || '#6B1D42';
  const currentLayout = plan.design?.layout || 'standard';

  const [headingFont, setHeadingFont] = useState<'serif' | 'sans'>('serif');
  const [inputStyle, setInputStyle] = useState<'underline' | 'box'>('underline');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Match active preset or fallback
  const activePreset = THEME_PRESETS.find(
    p => p.primaryColor.toLowerCase() === currentThemeColor.toLowerCase()
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
    const moodText = `${preset.engName}: ${preset.name} - 배경 도화지(${preset.paperBg})에 ${preset.primaryColor} 주조색과 ${preset.accentColor} 악센트 (${preset.description})`;
    onInputChange(5, 'brand_mood', moodText);
  };

  const handleFontChange = (font: 'serif' | 'sans') => {
    setHeadingFont(font);
    const fontDesc = font === 'serif' ? '눈이 편안한 Noto Serif KR 양장본 명조 헤딩' : '모던하고 또렷한 Pretendard 고딕 헤딩';
    const inputDesc = inputStyle === 'underline' ? '하단 2px 밑줄형(Underline) 아날로그 필기 인풋' : '부드러운 라운드 박스형 인풋';
    onInputChange(5, 'ui_tone', `${fontDesc} + ${inputDesc} + 라운드 칩, 0ms 실시간 피드백`);
  };

  const handleInputStyleChange = (style: 'underline' | 'box') => {
    setInputStyle(style);
    const fontDesc = headingFont === 'serif' ? '눈이 편안한 Noto Serif KR 양장본 명조 헤딩' : '모던하고 또렷한 Pretendard 고딕 헤딩';
    const inputDesc = style === 'underline' ? '하단 2px 밑줄형(Underline) 아날로그 필기 인풋' : '부드러운 라운드 박스형 인풋';
    onInputChange(5, 'ui_tone', `${fontDesc} + ${inputDesc} + 라운드 칩, 0ms 실시간 피드백`);
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
    <div className="bg-[#13181F] rounded-[3px] p-5 sm:p-6 border border-white/7 space-y-6 text-[#F0F3F6]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/7 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[2px] bg-[#18202A] text-[#C5A880] border border-white/10">
              <Palette size={16} />
            </span>
            <h3 className="font-bold text-[#F0F3F6] text-base sm:text-lg">
              비주얼 테마 및 디자인 규약 조율
            </h3>
            <span className="text-xs text-[#5C6675] font-mono">
              05_design_system.md 연동
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#9AA5B5] mt-1 font-sans leading-relaxed">
            원하는 테마 프리셋을 선택하면 11종 사양서와 프로토타입에 디자인 규약이 동기화됩니다.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 text-xs font-mono text-[#9AA5B5]">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activePreset.primaryColor }} />
          <span className="text-[#F0F3F6] font-medium">{activePreset.name}</span>
        </div>
      </div>

      {/* 1. 4 Signature Theme Preset Cards */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-[#F0F3F6] block">
          4종 디자인 테마 프리셋
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {THEME_PRESETS.map((preset) => {
            const isSelected = activePreset.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-4 rounded-[3px] border text-left transition-colors cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'border-[#C5A880] bg-[#18202A]'
                    : 'border-white/5 bg-[#13181F] hover:bg-[#18202A] hover:border-white/15'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`font-semibold text-sm ${isSelected ? 'text-[#F0F3F6]' : 'text-[#9AA5B5]'}`}>
                        {preset.name}
                      </span>
                      <span className="text-[#5C6675]">·</span>
                      <span className="text-[#5C6675] font-mono">
                        {preset.tag}
                      </span>
                    </div>
                    <p className="text-xs text-[#9AA5B5] mt-1 leading-relaxed font-sans">
                      {preset.description}
                    </p>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-[2px] bg-[#C5A880] text-[#0B0C10] flex items-center justify-center font-bold">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-[2px] border border-white/10" />
                    )}
                  </div>
                </div>

                {/* Color Swatch Bar */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <div 
                    className="w-5 h-5 rounded-[2px] border border-white/10 shrink-0"
                    style={{ backgroundColor: preset.paperBg }}
                    title={`배경: ${preset.paperBg}`}
                  />
                  <div 
                    className="w-5 h-5 rounded-[2px] border border-white/10 shrink-0"
                    style={{ backgroundColor: preset.primaryColor }}
                    title={`주조색: ${preset.primaryColor}`}
                  />
                  <div 
                    className="w-5 h-5 rounded-[2px] border border-white/10 shrink-0"
                    style={{ backgroundColor: preset.accentColor }}
                    title={`악센트: ${preset.accentColor}`}
                  />
                  <div 
                    className="w-5 h-5 rounded-[2px] border border-white/10 shrink-0"
                    style={{ backgroundColor: preset.textColor }}
                    title={`본문색: ${preset.textColor}`}
                  />
                  <span className="text-[11px] font-mono text-[#5C6675] ml-auto">
                    {preset.primaryColor}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Typography & Input Style Customizer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/7">
        {/* Heading Font */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#F0F3F6] flex items-center gap-1.5">
            <Type size={14} className="text-[#C5A880]" />
            <span>헤딩 타이포그래피</span>
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleFontChange('serif')}
              className={`py-2 px-2 rounded-[3px] border text-center transition-colors cursor-pointer font-medium ${
                headingFont === 'serif'
                  ? 'border-[#C5A880] bg-[#18202A] text-[#C5A880]'
                  : 'border-white/10 bg-[#13181F] text-[#9AA5B5] hover:text-[#F0F3F6]'
              }`}
            >
              양장본 명조
            </button>
            <button
              type="button"
              onClick={() => handleFontChange('sans')}
              className={`py-2 px-2 rounded-[3px] border text-center transition-colors cursor-pointer font-medium ${
                headingFont === 'sans'
                  ? 'border-[#C5A880] bg-[#18202A] text-[#C5A880]'
                  : 'border-white/10 bg-[#13181F] text-[#9AA5B5] hover:text-[#F0F3F6]'
              }`}
            >
              모던 고딕
            </button>
          </div>
        </div>

        {/* Input Field Style */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#F0F3F6] flex items-center gap-1.5">
            <Sliders size={14} className="text-[#C5A880]" />
            <span>필기 입력창 스타일</span>
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleInputStyleChange('underline')}
              className={`py-2 px-2 rounded-[3px] border text-center transition-colors cursor-pointer font-medium ${
                inputStyle === 'underline'
                  ? 'border-[#C5A880] bg-[#18202A] text-[#C5A880]'
                  : 'border-white/10 bg-[#13181F] text-[#9AA5B5] hover:text-[#F0F3F6]'
              }`}
            >
              하단 밑줄형
            </button>
            <button
              type="button"
              onClick={() => handleInputStyleChange('box')}
              className={`py-2 px-2 rounded-[3px] border text-center transition-colors cursor-pointer font-medium ${
                inputStyle === 'box'
                  ? 'border-[#C5A880] bg-[#18202A] text-[#C5A880]'
                  : 'border-white/10 bg-[#13181F] text-[#9AA5B5] hover:text-[#F0F3F6]'
              }`}
            >
              라운드 박스
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
              className={`py-2 px-2 rounded-[3px] border text-center transition-colors cursor-pointer font-medium ${
                currentLayout === 'standard'
                  ? 'border-[#C5A880] bg-[#18202A] text-[#C5A880]'
                  : 'border-white/10 bg-[#13181F] text-[#9AA5B5] hover:text-[#F0F3F6]'
              }`}
            >
              4단 확장형
            </button>
            <button
              type="button"
              onClick={() => handleLayoutChange('dashboard')}
              className={`py-2 px-2 rounded-[3px] border text-center transition-colors cursor-pointer font-medium ${
                currentLayout === 'dashboard'
                  ? 'border-[#C5A880] bg-[#18202A] text-[#C5A880]'
                  : 'border-white/10 bg-[#13181F] text-[#9AA5B5] hover:text-[#F0F3F6]'
              }`}
            >
              대시보드 뷰
            </button>
          </div>
        </div>
      </div>

      {/* 3. Live UI Component Preview Card */}
      <div className="pt-3 border-t border-white/7">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-semibold text-[#F0F3F6]">
            선택된 테마 토큰 프리뷰
          </span>
          <span className="font-mono text-[#5C6675]">
            {activePreset.engName} · {activePreset.primaryColor}
          </span>
        </div>

        <div 
          className="p-5 rounded-[3px] border transition-colors space-y-4"
          style={{ 
            backgroundColor: activePreset.paperBg,
            borderColor: activePreset.borderColor,
            color: activePreset.textColor
          }}
        >
          {/* Sample Heading & Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider opacity-70 block">
                Sample Output Preview
              </span>
              <h4 
                className={`text-base font-bold tracking-tight mt-0.5 ${
                  headingFont === 'serif' ? 'font-serif' : 'font-sans'
                }`}
              >
                예약 장부 대시보드
              </h4>
            </div>

            {/* Unboxed Metadata Indicators */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <span style={{ color: activePreset.primaryColor }}>
                접수대기 3건
              </span>
              <span className="opacity-30">·</span>
              <span style={{ color: activePreset.accentColor }}>
                완료 12건
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
                  value="고객명: 김민지 원장 (010-1234-5678)"
                  className="w-full bg-transparent border-0 border-b-2 px-2 py-1.5 text-xs sm:text-sm font-sans outline-none"
                  style={{ borderColor: activePreset.primaryColor }}
                />
              ) : (
                <input
                  type="text"
                  readOnly
                  value="고객명: 김민지 원장 (010-1234-5678)"
                  className="w-full bg-white/90 border px-3 py-2 text-xs sm:text-sm font-sans rounded-[3px] outline-none"
                  style={{ borderColor: activePreset.borderColor }}
                />
              )}
            </div>

            <button
              type="button"
              className="px-4 py-2 rounded-[3px] text-white font-medium text-xs shadow-xs shrink-0 cursor-default"
              style={{ backgroundColor: activePreset.primaryColor }}
            >
              신규 등록
            </button>
          </div>

          {/* Color Tokens Hex Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/10 text-xs font-mono">
            <button
              type="button"
              onClick={() => handleCopyHex(activePreset.paperBg)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-white/80 border border-black/10 hover:bg-white cursor-pointer"
              title="배경색 복사"
            >
              <span className="w-3 h-3 rounded-[2px] border border-black/10" style={{ backgroundColor: activePreset.paperBg }} />
              <span>배경: {activePreset.paperBg}</span>
              {copiedHex === activePreset.paperBg && <Check size={12} className="text-emerald-600" />}
            </button>

            <button
              type="button"
              onClick={() => handleCopyHex(activePreset.primaryColor)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-white/80 border border-black/10 hover:bg-white cursor-pointer"
              title="주조색 복사"
            >
              <span className="w-3 h-3 rounded-[2px] border border-black/10" style={{ backgroundColor: activePreset.primaryColor }} />
              <span>주조색: {activePreset.primaryColor}</span>
              {copiedHex === activePreset.primaryColor && <Check size={12} className="text-emerald-600" />}
            </button>

            <button
              type="button"
              onClick={() => handleCopyHex(activePreset.accentColor)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-white/80 border border-black/10 hover:bg-white cursor-pointer"
              title="악센트색 복사"
            >
              <span className="w-3 h-3 rounded-[2px] border border-black/10" style={{ backgroundColor: activePreset.accentColor }} />
              <span>악센트: {activePreset.accentColor}</span>
              {copiedHex === activePreset.accentColor && <Check size={12} className="text-emerald-600" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
