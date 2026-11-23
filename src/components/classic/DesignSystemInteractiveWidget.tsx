import React, { useState, useMemo } from 'react';
import { Check, Type, Sliders } from 'lucide-react';
import { SitePlan } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

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
  const { pick } = useLanguage();
  const currentThemeColor = plan.design?.themeColor || '#2563EB';
  const currentLayout = plan.design?.layout || 'standard';

  const [headingWeight, setHeadingWeight] = useState<'bold' | 'semibold'>('bold');
  const [inputStyle, setInputStyle] = useState<'underline' | 'box'>('box');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const presetLocaleMap = useMemo<Record<string, { name: string; tag: string; description: string }>>(
    () => ({
      'sumi-black-sapphire-blue': {
        name: pick({ ko: '수미 블랙 & 사파이어 블루', en: 'Sumi Black & Sapphire Blue', ja: '墨ブラック & サファイアブルー', id: 'Sumi Hitam & Biru Safir' }),
        tag: pick({ ko: '시그니처 다크', en: 'Signature Dark', ja: 'シグネチャーダーク', id: 'Gelap Khas' }),
        description: pick({
          ko: '깊은 흑색 먹빛 캔버스(#0B0C10) 위에 정갈한 웜 화이트(#F0F3F6)와 지적인 럭셔리 사파이어 블루(#2563EB) 및 일렉트릭 애저(#38BDF8)의 콰이어트 럭셔리',
          en: 'Quiet luxury combining deep sumi ink canvas (#0B0C10), warm white (#F0F3F6), sapphire blue (#2563EB), and electric azure (#38BDF8)',
          ja: '深みのある墨色キャンバス(#0B0C10)にウォームホワイト(#F0F3F6)とサファイアブルー(#2563EB)・エレクトリックアジュール(#38BDF8)を配したクワイエットラグジュアリー',
          id: 'Kemewahan tenang dengan kanvas tinta sumi (#0B0C10), putih hangat (#F0F3F6), biru safir (#2563EB), dan azure elektrik (#38BDF8)',
        }),
      },
      'midnight-azure-slate': {
        name: pick({ ko: '미드나잇 애저 & 딥 슬레이트', en: 'Midnight Azure & Deep Slate', ja: 'ミッドナイトアジュール & ストラタス', id: 'Midnight Azure & Deep Slate' }),
        tag: pick({ ko: '테크 아키텍트', en: 'Tech Architect', ja: 'テック設計', id: 'Arsitek Teknologi' }),
        description: pick({
          ko: '깊은 자정의 네이비 블루(#0E1217) 베이스에 정제된 슬레이트 블루(#60A5FA)와 맑은 화이트(#F8FAFC)로 구성된 차분한 테크 아키텍처 테마',
          en: 'Calm tech architecture theme built on midnight navy (#0E1217) with refined slate blue (#60A5FA) and crisp white (#F8FAFC)',
          ja: '深夜のネイビーブルー(#0E1217)をベースにスレートブルー(#60A5FA)と澄んだホワイト(#F8FAFC)で構成された落ち着いたテックテーマ',
          id: 'Tema arsitektur teknologi yang tenang di atas dasar navy tengah malam (#0E1217) dengan biru slate (#60A5FA) dan putih bersih (#F8FAFC)',
        }),
      },
      'obsidian-cobalt-glow': {
        name: pick({ ko: '옵시디언 & 코발트 글로우', en: 'Obsidian & Cobalt Glow', ja: 'オブシディアン & コバルトグロウ', id: 'Obsidian & Cobalt Glow' }),
        tag: pick({ ko: '하이엔드 미니멀', en: 'High-End Minimal', ja: 'ハイエンドミニマル', id: 'Minimal Kelas Atas' }),
        description: pick({
          ko: '완전한 흑요석 블랙(#07080B) 캔버스에 네온 코발트 블루(#1D4ED8)와 크리스털 스카이(#7DD3FC) 악센트의 미니멀 하이엔드 테마',
          en: 'Minimal high-end theme pairing pure obsidian black (#07080B) canvas with cobalt blue (#1D4ED8) and crystal sky (#7DD3FC)',
          ja: '漆黒のオブシディアン(#07080B)キャンバスにコバルトブルー(#1D4ED8)とクリスタルスカイ(#7DD3FC)を効かせたミニマルテーマ',
          id: 'Tema minimal kelas atas dengan kanvas obsidian murni (#07080B), biru kobalt (#1D4ED8), dan biru langit (#7DD3FC)',
        }),
      },
      'porcelain-sapphire-clean': {
        name: pick({ ko: '화이트 백자 & 사파이어 클래식', en: 'Porcelain & Sapphire Classic', ja: '白磁 & サファイアクラシック', id: 'Porselen & Safir Klasik' }),
        tag: pick({ ko: '정갈한 라이트', en: 'Crisp Light', ja: '端正ライト', id: 'Terang Rapi' }),
        description: pick({
          ko: '정갈한 라이트 백자(#F8FAFC) 베이스 위에 지적인 사파이어 블루(#2563EB)와 다크 슬레이트(#0F172A) 타이포그래피의 세련된 조화',
          en: 'Refined harmony of crisp porcelain (#F8FAFC), sapphire blue (#2563EB), and dark slate (#0F172A) typography',
          ja: '端正な白磁(#F8FAFC)ベースにサファイアブルー(#2563EB)とダークスレート(#0F172A)のタイポグラフィが調和するテーマ',
          id: 'Harmoni halus dasar porselen (#F8FAFC) dengan biru safir (#2563EB) dan tipografi slate gelap (#0F172A)',
        }),
      },
    }),
    [pick]
  );

  // Match active preset or fallback to Sumi Black & Sapphire Blue
  const activePreset = THEME_PRESETS.find(
    p => p.primaryColor.toLowerCase() === currentThemeColor.toLowerCase() || p.id === 'sumi-black-sapphire-blue'
  ) || THEME_PRESETS[0];
  const activeLocale = presetLocaleMap[activePreset.id] || {
    name: activePreset.name,
    tag: activePreset.tag,
    description: activePreset.description,
  };

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
    <div className="space-y-10 text-[var(--theme-ink-primary)] font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[var(--theme-ink-strong)]">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[16px] sm:text-[18px] font-extrabold tabular-nums text-[var(--theme-ink-secondary)] tracking-[0.08em]">
              03
            </span>
            <h3 className="font-extrabold text-[var(--theme-ink-strong)] text-[22px] sm:text-[26px] tracking-[-0.02em]">
              {pick({
                ko: '비주얼 테마 및 디자인 규약 조율',
                en: 'Visual Theme & Design System Calibration',
                ja: 'ビジュアルテーマ・デザイン規範調整',
                id: 'Kalibrasi Tema Visual & Sistem Desain',
              })}
            </h3>
            <span className="text-[15px] font-bold font-mono text-[var(--theme-ink-secondary)]">
              05_design_system.md
            </span>
          </div>
          <p className="text-[17px] sm:text-[19px] text-[var(--theme-ink-secondary)] leading-[1.7] pl-8">
            {pick({
              ko: '원하는 테마 프리셋을 선택하면 11종 사양서와 프로토타입에 디자인 규약이 즉시 동기화됩니다.',
              en: 'Selecting a theme preset immediately syncs design tokens across the 11 specs and standalone prototype.',
              ja: '希望のテーマプリセットを選択すると、11種の仕様書とプロトタイプにデザイン規範が即時同期されます。',
              id: 'Memilih prasetel tema akan langsung menyinkronkan token desain ke 11 dokumen spesifikasi dan prototipe.',
            })}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2.5 text-[15px] text-[var(--theme-ink-primary)] bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] px-4 py-2.5 rounded-none">
          <span className="w-3.5 h-3.5 border border-[var(--theme-border-strong)] shrink-0" style={{ backgroundColor: activePreset.primaryColor }} />
          <span className="font-bold whitespace-nowrap">{activeLocale.name}</span>
        </div>
      </div>

      {/* 1. 4 Signature Theme Preset Cards */}
      <div className="space-y-4">
        <label className="text-[17px] sm:text-[18px] font-extrabold text-[var(--theme-ink-strong)] block">
          {pick({
            ko: '4종 감성 미니멀리즘 테마 프리셋',
            en: '4 Signature Minimalist Theme Presets',
            ja: '4種のミニマリズムテーマプリセット',
            id: '4 Prasetel Tema Minimalis Khas',
          })}
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {THEME_PRESETS.map((preset) => {
            const isSelected = activePreset.id === preset.id;
            const loc = presetLocaleMap[preset.id] || {
              name: preset.name,
              tag: preset.tag,
              description: preset.description,
            };
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-6 rounded-none text-left transition-colors cursor-pointer flex flex-col justify-between space-y-4 border ${
                  isSelected
                    ? 'bg-[var(--theme-canvas)] border-2 border-[var(--theme-ink-strong)]'
                    : 'bg-[var(--theme-stage)] border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-[18px] text-[var(--theme-ink-strong)]">
                        {loc.name}
                      </span>
                      <span className="text-[var(--theme-ink-muted)]">·</span>
                      <span className="text-[var(--theme-ink-secondary)] text-[15px] font-bold">
                        {loc.tag}
                      </span>
                    </div>
                    <p className="text-[15px] sm:text-[16px] text-[var(--theme-ink-secondary)] mt-2 leading-[1.65]">
                      {loc.description}
                    </p>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    {isSelected ? (
                      <span className="w-6 h-6 rounded-none bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] flex items-center justify-center font-bold">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-none border border-[var(--theme-border-strong)] bg-[var(--theme-canvas)] block" />
                    )}
                  </div>
                </div>

                {/* Color Swatch Bar */}
                <div className="flex items-center gap-2.5 pt-3 border-t border-[var(--theme-border-hairline)]">
                  <div 
                    className="w-5 h-5 rounded-none border border-[var(--theme-border-strong)] shrink-0"
                    style={{ backgroundColor: preset.paperBg }}
                    title={`${pick({ ko: '배경', en: 'Background', ja: '背景', id: 'Latar' })}: ${preset.paperBg}`}
                  />
                  <div 
                    className="w-5 h-5 rounded-none border border-[var(--theme-border-strong)] shrink-0"
                    style={{ backgroundColor: preset.primaryColor }}
                    title={`${pick({ ko: '주조색', en: 'Primary', ja: 'メイン色', id: 'Utama' })}: ${preset.primaryColor}`}
                  />
                  <div 
                    className="w-5 h-5 rounded-none border border-[var(--theme-border-strong)] shrink-0"
                    style={{ backgroundColor: preset.accentColor }}
                    title={`${pick({ ko: '악센트', en: 'Accent', ja: 'アクセント', id: 'Aksen' })}: ${preset.accentColor}`}
                  />
                  <div 
                    className="w-5 h-5 rounded-none border border-[var(--theme-border-strong)] shrink-0"
                    style={{ backgroundColor: preset.textColor }}
                    title={`${pick({ ko: '본문색', en: 'Body Text', ja: '本文色', id: 'Teks' })}: ${preset.textColor}`}
                  />
                  <span className="text-[14px] font-mono font-bold tabular-nums text-[var(--theme-ink-secondary)] ml-auto">
                    {preset.primaryColor}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Typography & Input Style Customizer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-[var(--theme-border-hairline)]">
        {/* Sans Weight Selector */}
        <div className="space-y-3">
          <label className="text-[16px] font-extrabold text-[var(--theme-ink-strong)] flex items-center gap-2">
            <Type size={16} className="text-[var(--theme-ink-strong)]" />
            <span>{pick({ ko: '타이포그래피 위계', en: 'Typography Hierarchy', ja: 'タイポグラフィ階層', id: 'Hierarki Tipografi' })}</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFontWeightChange('bold')}
              className={`py-3 px-3 rounded-none text-[15px] text-center transition-colors cursor-pointer font-bold border ${
                headingWeight === 'bold'
                  ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] border-[var(--theme-ink-strong)]'
                  : 'bg-[var(--theme-stage)] text-[var(--theme-ink-primary)] border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)]'
              }`}
            >
              Bold (700)
            </button>
            <button
              type="button"
              onClick={() => handleFontWeightChange('semibold')}
              className={`py-3 px-3 rounded-none text-[15px] text-center transition-colors cursor-pointer font-bold border ${
                headingWeight === 'semibold'
                  ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] border-[var(--theme-ink-strong)]'
                  : 'bg-[var(--theme-stage)] text-[var(--theme-ink-primary)] border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)]'
              }`}
            >
              SemiBold (600)
            </button>
          </div>
        </div>

        {/* Input Field Style */}
        <div className="space-y-3">
          <label className="text-[16px] font-extrabold text-[var(--theme-ink-strong)] flex items-center gap-2">
            <Sliders size={16} className="text-[var(--theme-ink-strong)]" />
            <span>{pick({ ko: '필기 입력창 스타일', en: 'Input Field Style', ja: '入力フィールドスタイル', id: 'Gaya Kolom Input' })}</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleInputStyleChange('underline')}
              className={`py-3 px-3 rounded-none text-[15px] text-center transition-colors cursor-pointer font-bold border ${
                inputStyle === 'underline'
                  ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] border-[var(--theme-ink-strong)]'
                  : 'bg-[var(--theme-stage)] text-[var(--theme-ink-primary)] border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)]'
              }`}
            >
              {pick({ ko: '하단 밑줄형', en: 'Underline', ja: '下線スタイル', id: 'Garis Bawah' })}
            </button>
            <button
              type="button"
              onClick={() => handleInputStyleChange('box')}
              className={`py-3 px-3 rounded-none text-[15px] text-center transition-colors cursor-pointer font-bold border ${
                inputStyle === 'box'
                  ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] border-[var(--theme-ink-strong)]'
                  : 'bg-[var(--theme-stage)] text-[var(--theme-ink-primary)] border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)]'
              }`}
            >
              {pick({ ko: '미니멀 박스', en: 'Minimal Box', ja: 'ミニマルボックス', id: 'Kotak Minimalis' })}
            </button>
          </div>
        </div>

        {/* Layout Structure */}
        <div className="space-y-3">
          <label className="text-[16px] font-extrabold text-[var(--theme-ink-strong)] block">
            {pick({ ko: '화면 분할 구조', en: 'Layout Architecture', ja: '画面分割レイアウト', id: 'Struktur Tata Letak' })}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleLayoutChange('standard')}
              className={`py-3 px-3 rounded-none text-[15px] text-center transition-colors cursor-pointer font-bold border ${
                currentLayout === 'standard'
                  ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] border-[var(--theme-ink-strong)]'
                  : 'bg-[var(--theme-stage)] text-[var(--theme-ink-primary)] border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)]'
              }`}
            >
              {pick({ ko: '2-Track 비대칭', en: '2-Track Split', ja: '2カラム非対称', id: 'Split 2-Jalur' })}
            </button>
            <button
              type="button"
              onClick={() => handleLayoutChange('dashboard')}
              className={`py-3 px-3 rounded-none text-[15px] text-center transition-colors cursor-pointer font-bold border ${
                currentLayout === 'dashboard'
                  ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] border-[var(--theme-ink-strong)]'
                  : 'bg-[var(--theme-stage)] text-[var(--theme-ink-primary)] border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)]'
              }`}
            >
              {pick({ ko: '와이드 뷰', en: 'Wide View', ja: 'ワイドビュー', id: 'Tampilan Lebar' })}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Live UI Component Preview Card */}
      <div className="pt-6 border-t border-[var(--theme-border-hairline)]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-[16px]">
          <span className="font-extrabold text-[var(--theme-ink-strong)]">
            {pick({ ko: '선택된 테마 토큰 프리뷰', en: 'Selected Theme Token Preview', ja: '選択中テーマトークンプレビュー', id: 'Pratinjau Token Tema Terpilih' })}
          </span>
          <span className="font-mono text-[15px] text-[var(--theme-ink-secondary)]">
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
                {pick({
                  ko: '웹 서비스 관리 대시보드',
                  en: 'Web Service Management Dashboard',
                  ja: 'Webサービス管理ダッシュボード',
                  id: 'Dasbor Manajemen Layanan Web',
                })}
              </h4>
            </div>

            {/* Unboxed Metadata Indicators */}
            <div className="flex items-center gap-3 text-[15px] font-bold">
              <span style={{ color: activePreset.primaryColor }}>
                {pick({ ko: '활성 인스턴스 3건', en: '3 Active Instances', ja: '稼働中 3件', id: '3 Instans Aktif' })}
              </span>
              <span style={{ color: isLightPreview ? '#8C8B85' : '#7A889B' }}>·</span>
              <span style={{ color: activePreset.accentColor }}>
                {pick({ ko: '정상 배포 12건', en: '12 Healthy Deploys', ja: '正常デプロイ 12件', id: '12 Deploy Sukses' })}
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
                  value="api.platform.service/v1"
                  className="w-full bg-transparent border-0 border-b-2 px-2 py-2.5 text-[16px] font-sans outline-none"
                  style={{ borderColor: activePreset.accentColor, color: activePreset.textColor }}
                />
              ) : (
                <input
                  type="text"
                  readOnly
                  value="api.platform.service/v1"
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
              {pick({ ko: '신규 등록', en: 'New Record', ja: '新規登録', id: 'Tambah Baru' })}
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
              title={pick({ ko: '배경색 복사', en: 'Copy background hex', ja: '背景色をコピー', id: 'Salin warna latar' })}
            >
              <span className="w-3.5 h-3.5 border border-black/15" style={{ backgroundColor: activePreset.paperBg }} />
              <span>{pick({ ko: '배경', en: 'BG', ja: '背景', id: 'Latar' })}: {activePreset.paperBg}</span>
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
              title={pick({ ko: '주조색 복사', en: 'Copy primary hex', ja: 'メイン色をコピー', id: 'Salin warna utama' })}
            >
              <span className="w-3.5 h-3.5 border border-black/15" style={{ backgroundColor: activePreset.primaryColor }} />
              <span>{pick({ ko: '주조색', en: 'Primary', ja: 'メイン色', id: 'Utama' })}: {activePreset.primaryColor}</span>
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
              title={pick({ ko: '악센트색 복사', en: 'Copy accent hex', ja: 'アクセント色をコピー', id: 'Salin warna aksen' })}
            >
              <span className="w-3.5 h-3.5 border border-black/15" style={{ backgroundColor: activePreset.accentColor }} />
              <span>{pick({ ko: '악센트', en: 'Accent', ja: 'アクセント', id: 'Aksen' })}: {activePreset.accentColor}</span>
              {copiedHex === activePreset.accentColor && <Check size={14} style={{ color: activePreset.accentColor }} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
