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
    const moodText = `${preset.engName}: ${preset.name} - 캔버스(${preset.paperBg})에 ${preset.primaryColor} 주조색과 ${preset.accentColor} 악센트 (${preset.description}) - DM Sans & SUIT Variable 산세리프 전면 적용`;
    onInputChange(5, 'brand_mood', moodText);
  };

  const handleFontWeightChange = (weight: 'bold' | 'semibold') => {
    setHeadingWeight(weight);
    const weightDesc = weight === 'bold' ? 'DM Sans & SUIT Variable Bold 700 (강렬하고 정밀한 헤드라인 대비)' : 'DM Sans & SUIT Variable SemiBold 600 (단아하고 정제된 절제미)';
    const inputDesc = inputStyle === 'underline' ? '하단 1px 밑줄형 미니멀 인풋' : '정제된 미니멀 프레임 박스 인풋';
    onInputChange(5, 'ui_tone', `DM Sans & SUIT Variable (${weightDesc}) + ${inputDesc} + 수미 블랙 & 럭셔리 사파이어 블루 모노크롬`);
  };

  const handleInputStyleChange = (style: 'underline' | 'box') => {
    setInputStyle(style);
    const weightDesc = headingWeight === 'bold' ? 'DM Sans & SUIT Variable Bold 700' : 'DM Sans & SUIT Variable SemiBold 600';
    const inputDesc = style === 'underline' ? '하단 1px 밑줄형 미니멀 인풋' : '정제된 미니멀 프레임 박스 인풋';
    onInputChange(5, 'ui_tone', `DM Sans & SUIT Variable (${weightDesc}) + ${inputDesc} + 수미 블랙 & 럭셔리 사파이어 블루 모노크롬`);
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

  const isLightPreview = activePreset.id === 'porcelain-sapphire-clean';

  return (
    <div className="space-y-10 text-[#111111] font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#000000]">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[16px] sm:text-[18px] font-extrabold tabular-nums text-[#52524E] tracking-[0.08em]">
              03
            </span>
            <h3 className="font-extrabold text-[#000000] text-[22px] sm:text-[26px] tracking-[-0.02em]">
              비주얼 테마 및 디자인 규약 조율
            </h3>
            <span className="text-[15px] font-bold font-mono text-[#52524E]">
              05_design_system.md
            </span>
          </div>
          <p className="text-[17px] sm:text-[19px] text-[#52524E] leading-[1.7] pl-8">
            원하는 테마 프리셋을 선택하면 11종 사양서와 프로토타입에 디자인 규약이 즉시 동기화됩니다.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2.5 text-[15px] text-[#111111] bg-[#F6F5F1] border border-[#E4E2DC] px-4 py-2.5 rounded-none">
          <span className="w-3.5 h-3.5 border border-black/20 shrink-0" style={{ backgroundColor: activePreset.primaryColor }} />
          <span className="font-bold whitespace-nowrap">{activePreset.name}</span>
        </div>
      </div>

      {/* 1. 4 Signature Theme Preset Cards */}
      <div className="space-y-4">
        <label className="text-[17px] sm:text-[18px] font-extrabold text-[#000000] block">
          4종 감성 미니멀리즘 테마 프리셋
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {THEME_PRESETS.map((preset) => {
            const isSelected = activePreset.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-6 rounded-none text-left transition-colors cursor-pointer flex flex-col justify-between space-y-4 border ${
                  isSelected
                    ? 'bg-[#FFFFFF] border-2 border-[#000000]'
                    : 'bg-[#F6F5F1] border-[#E4E2DC] hover:border-[#000000]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-[18px] text-[#000000]">
                        {preset.name}
                      </span>
                      <span className="text-[#787772]">·</span>
                      <span className="text-[#52524E] text-[15px] font-bold">
                        {preset.tag}
                      </span>
                    </div>
                    <p className="text-[15px] sm:text-[16px] text-[#52524E] mt-2 leading-[1.65]">
                      {preset.description}
                    </p>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    {isSelected ? (
                      <span className="w-6 h-6 rounded-none bg-[#000000] text-[#FFE600] flex items-center justify-center font-bold">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-none border border-[#CBC8BF] bg-[#FFFFFF] block" />
                    )}
                  </div>
                </div>

                {/* Color Swatch Bar */}
                <div className="flex items-center gap-2.5 pt-3 border-t border-[#E4E2DC]">
                  <div 
                    className="w-5 h-5 rounded-none border border-black/20 shrink-0"
                    style={{ backgroundColor: preset.paperBg }}
                    title={`배경: ${preset.paperBg}`}
                  />
                  <div 
                    className="w-5 h-5 rounded-none border border-black/20 shrink-0"
                    style={{ backgroundColor: preset.primaryColor }}
                    title={`주조색: ${preset.primaryColor}`}
                  />
                  <div 
                    className="w-5 h-5 rounded-none border border-black/20 shrink-0"
                    style={{ backgroundColor: preset.accentColor }}
                    title={`악센트: ${preset.accentColor}`}
                  />
                  <div 
                    className="w-5 h-5 rounded-none border border-black/20 shrink-0"
                    style={{ backgroundColor: preset.textColor }}
                    title={`본문색: ${preset.textColor}`}
                  />
                  <span className="text-[14px] font-mono font-bold tabular-nums text-[#52524E] ml-auto">
                    {preset.primaryColor}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Typography & Input Style Customizer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-[#E4E2DC]">
        {/* Sans Weight Selector */}
        <div className="space-y-3">
          <label className="text-[16px] font-extrabold text-[#000000] flex items-center gap-2">
            <Type size={16} className="text-[#000000]" />
            <span>타이포그래피 위계</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFontWeightChange('bold')}
              className={`py-3 px-3 rounded-none text-[15px] text-center transition-colors cursor-pointer font-bold border ${
                headingWeight === 'bold'
                  ? 'bg-[#000000] text-[#FFE600] border-[#000000]'
                  : 'bg-[#F6F5F1] text-[#111111] border-[#E4E2DC] hover:border-[#000000]'
              }`}
            >
              Bold (700)
            </button>
            <button
              type="button"
              onClick={() => handleFontWeightChange('semibold')}
              className={`py-3 px-3 rounded-none text-[15px] text-center transition-colors cursor-pointer font-bold border ${
                headingWeight === 'semibold'
                  ? 'bg-[#000000] text-[#FFE600] border-[#000000]'
                  : 'bg-[#F6F5F1] text-[#111111] border-[#E4E2DC] hover:border-[#000000]'
              }`}
            >
              SemiBold (600)
            </button>
          </div>
        </div>

        {/* Input Field Style */}
        <div className="space-y-3">
          <label className="text-[16px] font-extrabold text-[#000000] flex items-center gap-2">
            <Sliders size={16} className="text-[#000000]" />
            <span>필기 입력창 스타일</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleInputStyleChange('underline')}
              className={`py-3 px-3 rounded-none text-[15px] text-center transition-colors cursor-pointer font-bold border ${
                inputStyle === 'underline'
                  ? 'bg-[#000000] text-[#FFE600] border-[#000000]'
                  : 'bg-[#F6F5F1] text-[#111111] border-[#E4E2DC] hover:border-[#000000]'
              }`}
            >
              하단 밑줄형
            </button>
            <button
              type="button"
              onClick={() => handleInputStyleChange('box')}
              className={`py-3 px-3 rounded-none text-[15px] text-center transition-colors cursor-pointer font-bold border ${
                inputStyle === 'box'
                  ? 'bg-[#000000] text-[#FFE600] border-[#000000]'
                  : 'bg-[#F6F5F1] text-[#111111] border-[#E4E2DC] hover:border-[#000000]'
              }`}
            >
              미니멀 박스
            </button>
          </div>
        </div>

        {/* Layout Structure */}
        <div className="space-y-3">
          <label className="text-[16px] font-extrabold text-[#000000] block">
            화면 분할 구조
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleLayoutChange('standard')}
              className={`py-3 px-3 rounded-none text-[15px] text-center transition-colors cursor-pointer font-bold border ${
                currentLayout === 'standard'
                  ? 'bg-[#000000] text-[#FFE600] border-[#000000]'
                  : 'bg-[#F6F5F1] text-[#111111] border-[#E4E2DC] hover:border-[#000000]'
              }`}
            >
              2-Track 비대칭
            </button>
            <button
              type="button"
              onClick={() => handleLayoutChange('dashboard')}
              className={`py-3 px-3 rounded-none text-[15px] text-center transition-colors cursor-pointer font-bold border ${
                currentLayout === 'dashboard'
                  ? 'bg-[#000000] text-[#FFE600] border-[#000000]'
                  : 'bg-[#F6F5F1] text-[#111111] border-[#E4E2DC] hover:border-[#000000]'
              }`}
            >
              와이드 뷰
            </button>
          </div>
        </div>
      </div>

      {/* 3. Live UI Component Preview Card */}
      <div className="pt-6 border-t border-[#E4E2DC]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-[16px]">
          <span className="font-extrabold text-[#000000]">
            선택된 테마 토큰 프리뷰
          </span>
          <span className="font-mono text-[15px] text-[#52524E]">
            {activePreset.engName} · {activePreset.primaryColor}
          </span>
        </div>

        <div 
          className="p-6 sm:p-7 rounded-none border transition-colors space-y-5"
          style={{ 
            backgroundColor: activePreset.paperBg,
            borderColor: isLightPreview ? '#E4E2DC' : activePreset.borderColor,
            color: activePreset.textColor
          }}
        >
          {/* Sample Heading & Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span
                className="text-[13px] font-bold uppercase tracking-widest block"
                style={{ color: isLightPreview ? '#52524E' : '#94A3B8' }}
              >
                Sample Output Preview
              </span>
              <h4 
                className={`text-[20px] tracking-tight mt-1 font-sans ${
                  headingWeight === 'bold' ? 'font-extrabold' : 'font-semibold'
                }`}
                style={{ color: activePreset.textColor }}
              >
                웹 서비스 관리 대시보드
              </h4>
            </div>

            {/* Unboxed Metadata Indicators */}
            <div className="flex items-center gap-3 text-[15px] font-bold">
              <span style={{ color: activePreset.primaryColor }}>
                활성 인스턴스 3건
              </span>
              <span style={{ color: isLightPreview ? '#8C8B85' : '#7A889B' }}>·</span>
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
                  className="w-full bg-transparent border-0 border-b-2 px-2 py-2.5 text-[16px] font-sans outline-none"
                  style={{ borderColor: activePreset.accentColor, color: activePreset.textColor }}
                />
              ) : (
                <input
                  type="text"
                  readOnly
                  value="서비스 도메인: api.platform.service/v1"
                  className="w-full border px-4 py-3 text-[16px] font-sans rounded-none outline-none"
                  style={{
                    backgroundColor: isLightPreview ? '#FFFFFF' : '#13181F',
                    borderColor: isLightPreview ? '#E4E2DC' : activePreset.borderColor,
                    color: activePreset.textColor,
                  }}
                />
              )}
            </div>

            <button
              type="button"
              className="px-5 py-3 rounded-none font-bold text-[15px] shadow-none shrink-0 cursor-default"
              style={{ 
                backgroundColor: activePreset.primaryColor, 
                color: '#FFFFFF'
              }}
            >
              신규 등록
            </button>
          </div>

          {/* Color Tokens Hex Chips */}
          <div
            className="flex flex-wrap items-center gap-2.5 pt-4 border-t text-[15px] font-mono"
            style={{ borderColor: isLightPreview ? '#E4E2DC' : 'rgba(255,255,255,0.08)' }}
          >
            <button
              type="button"
              onClick={() => handleCopyHex(activePreset.paperBg)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-none border cursor-pointer transition-colors"
              style={{
                backgroundColor: isLightPreview ? '#FFFFFF' : '#13181F',
                borderColor: isLightPreview ? '#E4E2DC' : 'rgba(255,255,255,0.12)',
                color: activePreset.textColor,
              }}
              title="배경색 복사"
            >
              <span className="w-3.5 h-3.5 border border-black/15" style={{ backgroundColor: activePreset.paperBg }} />
              <span>배경: {activePreset.paperBg}</span>
              {copiedHex === activePreset.paperBg && <Check size={14} style={{ color: activePreset.accentColor }} />}
            </button>

            <button
              type="button"
              onClick={() => handleCopyHex(activePreset.primaryColor)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-none border cursor-pointer transition-colors"
              style={{
                backgroundColor: isLightPreview ? '#FFFFFF' : '#13181F',
                borderColor: isLightPreview ? '#E4E2DC' : 'rgba(255,255,255,0.12)',
                color: activePreset.textColor,
              }}
              title="주조색 복사"
            >
              <span className="w-3.5 h-3.5 border border-black/15" style={{ backgroundColor: activePreset.primaryColor }} />
              <span>주조색: {activePreset.primaryColor}</span>
              {copiedHex === activePreset.primaryColor && <Check size={14} style={{ color: activePreset.accentColor }} />}
            </button>

            <button
              type="button"
              onClick={() => handleCopyHex(activePreset.accentColor)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-none border cursor-pointer transition-colors"
              style={{
                backgroundColor: isLightPreview ? '#FFFFFF' : '#13181F',
                borderColor: isLightPreview ? '#E4E2DC' : 'rgba(255,255,255,0.12)',
                color: activePreset.textColor,
              }}
              title="악센트색 복사"
            >
              <span className="w-3.5 h-3.5 border border-black/15" style={{ backgroundColor: activePreset.accentColor }} />
              <span>악센트: {activePreset.accentColor}</span>
              {copiedHex === activePreset.accentColor && <Check size={14} style={{ color: activePreset.accentColor }} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
