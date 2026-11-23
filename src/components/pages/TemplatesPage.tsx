import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Smartphone, Monitor, Zap } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getLocalizedTemplates,
  StandardPrdTemplate,
  parseRawIdeaToStandardPlan,
} from '../../lib/standardTemplates';
import {
  EditorialPageLayout,
  EditorialSection,
} from '../classic/layout/EditorialPageLayout';

interface TemplatesPageProps {
  onApplyTemplate: (template: StandardPrdTemplate) => void;
}

export default function TemplatesPage({ onApplyTemplate }: TemplatesPageProps) {
  const navigate = useNavigate();
  const { language, pick } = useLanguage();
  const [activeTab, setActiveTab] = useState<'preset' | 'aiParse'>('preset');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('saas-web-platform');
  const [rawIdeaInput, setRawIdeaInput] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<StandardPrdTemplate | null>(null);

  const templates = getLocalizedTemplates(language);
  const currentTemplate =
    templates.find(t => t.id === selectedTemplateId) || templates[0];

  const handleApplyPreset = () => {
    onApplyTemplate(currentTemplate);
    navigate('/workspace');
  };

  const handleRunSmartParse = () => {
    if (!rawIdeaInput.trim()) return;
    setParsedPreview(parseRawIdeaToStandardPlan(rawIdeaInput, language));
  };

  const handleApplySmartParse = () => {
    if (!parsedPreview) return;
    const defaultProjName = pick({
      ko: '신규 프로젝트',
      en: 'New Project',
      ja: '新規プロジェクト',
      id: 'Proyek Baru',
    });
    const customTemplate = {
      ...parsedPreview,
      name: rawIdeaInput.slice(0, 30).trim() || parsedPreview.name,
      plan: {
        ...parsedPreview.plan,
        metadata: {
          ...parsedPreview.plan.metadata,
          projectName:
            rawIdeaInput.slice(0, 30).trim() || parsedPreview.plan.metadata?.projectName || defaultProjName,
          projectOverview: {
            ...parsedPreview.plan.metadata?.projectOverview,
            purpose: rawIdeaInput.trim(),
          } as any,
        },
      } as any,
    };
    onApplyTemplate(customTemplate);
    navigate('/workspace');
  };

  const tabs = [
    {
      id: 'preset',
      label: pick({
        ko: '4대 실무 검증 템플릿 선택',
        en: '4 Production-Ready Templates',
        ja: '4大実務検証済みテンプレート',
        id: 'Pilih 4 Templat Standar Teruji',
      }),
      onClick: () => setActiveTab('preset'),
    },
    {
      id: 'aiParse',
      label: pick({
        ko: '자유 메모로 표준 기획서 변환',
        en: 'Convert Free Notes to Spec',
        ja: '自由メモから標準仕様書へ変換',
        id: 'Konversi Catatan Bebas ke Spesifikasi',
      }),
      onClick: () => setActiveTab('aiParse'),
    },
  ];

  return (
    <EditorialPageLayout
      category="STANDARD TEMPLATES"
      title={pick({
        ko: '표준 기획서 템플릿',
        en: 'Standard Spec Templates',
        ja: '標準企画書テンプレート',
        id: 'Templat Spesifikasi Standar',
      })}
      subtitle={pick({
        ko: '검증된 산업별 아키텍처 템플릿을 선택하거나 자유 메모를 표준 개발 사양서 구조로 즉시 변환합니다.',
        en: 'Pick a battle-tested architecture template or instantly transform rough notes into a structured engineering specification.',
        ja: '検証済みの産業別アーキテクチャテンプレートを選択するか、自由メモを標準開発仕様書構造へ即座に変換します。',
        id: 'Pilih templat arsitektur industri teruji atau ubah catatan bebas Anda menjadi struktur spesifikasi standar secara instan.',
      })}
      tabs={tabs}
      activeTabId={activeTab}
      maxWidthClass="max-w-6xl"
    >
      {activeTab === 'preset' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            {templates.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplateId;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`w-full p-6 rounded-none border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] border-[var(--theme-active-bg)]'
                      : 'bg-[var(--theme-stage)] text-[var(--theme-ink-primary)] border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span
                      className={`text-[14px] px-2.5 py-0.5 font-bold uppercase tracking-wider border ${
                        isSelected
                          ? 'border-[var(--theme-active-text)] text-[var(--theme-active-text)]'
                          : 'border-[var(--theme-border-strong)] text-[var(--theme-ink-body)] bg-[var(--theme-canvas)]'
                      }`}
                    >
                      {tmpl.badge}
                    </span>
                    <div className="flex items-center gap-1.5 text-[15px] font-bold opacity-80">
                      {tmpl.platform === 'APP' ? <Smartphone size={15} /> : <Monitor size={15} />}
                      <span>{tmpl.platform}</span>
                    </div>
                  </div>
                  <div className="text-[20px] font-extrabold leading-snug">{tmpl.name}</div>
                  <p className={`text-[17px] mt-1.5 line-clamp-2 leading-relaxed ${isSelected ? 'opacity-85' : 'text-[var(--theme-ink-secondary)]'}`}>
                    {tmpl.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7 bg-[var(--theme-stage)] p-8 sm:p-10 border border-[var(--theme-border-hairline)] flex flex-col justify-between space-y-8">
            <div className="space-y-7">
              <div className="border-b-2 border-[var(--theme-ink-strong)] pb-5 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[15px] font-bold uppercase tracking-wider text-[var(--theme-ink-secondary)]">
                    {pick({
                      ko: '상세 스펙 미리보기',
                      en: 'Detailed Specification Preview',
                      ja: '詳細仕様プレビュー',
                      id: 'Pratinjau Spesifikasi Detail',
                    })}
                  </span>
                  <h2 className="text-[26px] sm:text-[28px] font-extrabold text-[var(--theme-ink-strong)] mt-1">{currentTemplate.name}</h2>
                </div>
                <span className="px-3.5 py-1.5 bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] text-[16px] font-bold">
                  {currentTemplate.platform}
                </span>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-[18px] font-extrabold text-[var(--theme-ink-strong)]">
                  {pick({
                    ko: '기획 목적 및 문제 해결',
                    en: 'Project Goal & Problem Statement',
                    ja: '企画目的と課題解決',
                    id: 'Tujuan Proyek & Solusi Masalah',
                  })}
                </h3>
                <p className="text-[18px] sm:text-[19px] text-[var(--theme-ink-body)] bg-[var(--theme-canvas)] p-5 border border-[var(--theme-border-hairline)] leading-[1.8]">
                  {currentTemplate.description}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-[18px] font-extrabold text-[var(--theme-ink-strong)]">
                  {pick({
                    ko: '타깃 사용자',
                    en: 'Target Users',
                    ja: 'ターゲットユーザー',
                    id: 'Target Pengguna',
                  })}
                </h3>
                <p className="text-[18px] sm:text-[19px] text-[var(--theme-ink-body)] font-medium leading-[1.7]">{currentTemplate.targetUser}</p>
              </div>

              <div className="space-y-3">
                <h3 className="text-[18px] font-extrabold text-[var(--theme-ink-strong)]">
                  {pick({
                    ko: `표준 포함 화면 (${currentTemplate.screens.length})`,
                    en: `Included Standard Screens (${currentTemplate.screens.length})`,
                    ja: `標準収録画面 (${currentTemplate.screens.length})`,
                    id: `Layar Standar Termasuk (${currentTemplate.screens.length})`,
                  })}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {currentTemplate.screens.map((sc, idx) => (
                    <div key={idx} className="p-4 bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[17px] font-bold text-[var(--theme-ink-strong)]">{sc.name}</span>
                        <span className="text-[14px] font-mono text-[var(--theme-ink-secondary)]">{sc.route}</span>
                      </div>
                      <p className="text-[16px] text-[var(--theme-ink-secondary)] line-clamp-2 leading-relaxed">{sc.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[18px] font-extrabold text-[var(--theme-ink-strong)]">
                  {pick({
                    ko: '핵심 기능 명세 (FRD)',
                    en: 'Functional Requirements (FRD)',
                    ja: '主要機能仕様 (FRD)',
                    id: 'Spesifikasi Fitur Inti (FRD)',
                  })}
                </h3>
                <ul className="space-y-2.5 text-[18px] text-[var(--theme-ink-body)]">
                  {currentTemplate.keyFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <Check size={17} className="text-[var(--theme-ink-strong)] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--theme-border-hairline)] flex flex-wrap items-center justify-between gap-4">
              <span className="text-[17px] text-[var(--theme-ink-secondary)]">
                {pick({
                  ko: '적용 시 11종 사양서와 프로토타입이 즉시 동기화됩니다.',
                  en: '11 specs and live prototype sync immediately upon applying.',
                  ja: '適用すると11種の仕様書とプロトタイプが即座に同期されます。',
                  id: '11 dokumen spesifikasi dan prototipe langsung tersinkronisasi saat diterapkan.',
                })}
              </span>
              <button
                type="button"
                onClick={handleApplyPreset}
                className="px-7 py-4 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-[18px] font-bold transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <span>
                  {pick({
                    ko: '이 표준 기획서로 시작하기',
                    en: 'Start with This Template',
                    ja: 'この標準企画書で始める',
                    id: 'Mulai dengan Templat Ini',
                  })}
                </span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <EditorialSection
          chapter={pick({
            ko: '자유 메모 자동 구조화',
            en: 'Auto-Structure Freeform Notes',
            ja: '自由メモの自動構造化',
            id: 'Penstrukturan Otomatis Catatan Bebas',
          })}
        >
          <div className="bg-[var(--theme-stage)] p-8 border border-[var(--theme-border-hairline)] space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[20px] font-extrabold text-[var(--theme-ink-strong)] flex items-center gap-2">
                <Zap size={18} />
                <span>
                  {pick({
                    ko: '자유 메모 또는 서비스 아이디어 입력',
                    en: 'Enter Freeform Notes or Service Idea',
                    ja: '自由メモまたはサービスアイデアを入力',
                    id: 'Masukkan Catatan Bebas atau Ide Layanan',
                  })}
                </span>
              </h3>
              <span className="text-[17px] text-[var(--theme-ink-secondary)]">
                {pick({
                  ko: '핵심 키워드 기반으로 표준 기획서 규격으로 자동 매핑합니다',
                  en: 'Automatically maps your keywords to a standard specification blueprint',
                  ja: '主要キーワードをもとに標準仕様書フォーマットへ自動マッピングします',
                  id: 'Memetakan otomatis ke struktur spesifikasi standar berdasarkan kata kunci',
                })}
              </span>
            </div>

            <textarea
              rows={6}
              value={rawIdeaInput}
              onChange={(e) => setRawIdeaInput(e.target.value)}
              placeholder={pick({
                ko: '웹 애플리케이션 요구사항을 자유롭게 입력하세요. (예: 대용량 데이터 시각화 및 실시간 협업 워크스페이스를 위한 엔터프라이즈 모던 웹 SaaS 플랫폼)',
                en: 'Describe your web app idea freely (e.g., Enterprise SaaS workspace with high-volume data grids and real-time collaboration).',
                ja: 'Webアプリケーションの要件を自由に入力してください（例：大容量データ可視化とリアルタイム協業のためのSaaSプラットフォーム）。',
                id: 'Tuliskan kebutuhan aplikasi web Anda secara bebas (cth: Platform SaaS enterprise dengan visualisasi data dan kolaborasi real-time).',
              })}
              className="w-full p-5 text-[19px] bg-[var(--theme-canvas)] rounded-none border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] outline-none leading-[1.8] text-[var(--theme-ink-primary)] placeholder-[var(--theme-ink-muted)]"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRunSmartParse}
                disabled={!rawIdeaInput.trim()}
                className="px-6 py-3.5 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] disabled:opacity-40 text-[18px] font-bold transition-colors cursor-pointer flex items-center gap-2"
              >
                <Zap size={17} />
                <span>
                  {pick({
                    ko: '표준 기획서 분석 실행',
                    en: 'Analyze & Map to Standard Spec',
                    ja: '標準仕様書分析を実行',
                    id: 'Jalankan Analisis Spesifikasi',
                  })}
                </span>
              </button>
            </div>
          </div>

          {parsedPreview && (
            <div className="bg-[var(--theme-elevated)] p-8 border-2 border-[var(--theme-ink-strong)] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-bold text-[var(--theme-ink-secondary)] uppercase tracking-wider">
                  {pick({
                    ko: '추천 표준 템플릿 매핑 결과',
                    en: 'Recommended Template Match',
                    ja: '推奨標準テンプレート一致結果',
                    id: 'Hasil Pencocokan Templat Standar',
                  })}
                </span>
                <span className="px-3.5 py-1 bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] text-[16px] font-bold">
                  {parsedPreview.badge}
                </span>
              </div>
              <h3 className="text-[24px] font-extrabold text-[var(--theme-ink-strong)]">{parsedPreview.name}</h3>
              <p className="text-[19px] text-[var(--theme-ink-body)] leading-[1.8]">{parsedPreview.description}</p>
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleApplySmartParse}
                  className="px-7 py-4 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-[18px] font-bold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>
                    {pick({
                      ko: '이 기획서로 프로젝트 적용하기',
                      en: 'Apply This Blueprint to Project',
                      ja: 'この設計書をプロジェクトに適用',
                      id: 'Terapkan Cetak Biru Ini ke Proyek',
                    })}
                  </span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}
        </EditorialSection>
      )}
    </EditorialPageLayout>
  );
}
