import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTabItem,
} from '../layout/EditorialPageLayout';

export default function About() {
  const { t } = useLanguage();

  const tabs: EditorialTabItem[] = [
    { id: 'about', label: 'GOGUMA 소개', to: '/about' },
    { id: 'community', label: '오픈 아키텍처', to: '/community' },
    { id: 'support', label: '도움말 및 가이드', to: '/support' },
    { id: 'contact', label: '문의 및 피드백', to: '/contact' },
  ];

  const values = [
    {
      index: '01',
      title: 'Precision Architecture',
      description:
        'We believe in building digital foundations that are robust, minimal, and uncompromisingly clear.',
    },
    {
      index: '02',
      title: 'Global Collaboration',
      description:
        'Empowering teams and solo builders worldwide to sync their architectural vision with zero friction.',
    },
    {
      index: '03',
      title: 'Autonomous Local Execution',
      description:
        'Leveraging offline-first principles and edge AI to automate the entire technical specification cycle.',
    },
  ];

  return (
    <EditorialPageLayout
      category="ARCHITECTURAL STATEMENT"
      title={t('about_us')}
      subtitle="GOGUMA는 기획의 직관성과 소프트웨어 엔지니어링의 엄밀함을 하나의 로컬 우선 스튜디오로 결합합니다."
      tabs={tabs}
      activeTabId="about"
    >
      <EditorialSection chapter="The Vision">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pt-2">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-[20px] sm:text-[22px] text-[#000000] font-semibold leading-[1.8]">
              Technical architecture should be as intuitive as a sketch and as rigorous as an engineering blueprint.
              We provide the bridge between conceptual design, business requirements, and high-level agentic development.
            </p>
            <p className="text-[19px] sm:text-[20px] text-[#3F3F3C] leading-[1.85]">
              Our platform generates 11 core software specification documents alongside an interactive local runtime,
              eliminating AI hallucinations before a single line of production code is written.
            </p>
          </div>

          <div className="lg:col-span-6 border-t lg:border-t-0 border-[#000000] divide-y divide-[#E4E2DC]">
            {values.map((v) => (
              <div key={v.title} className="py-6 first:pt-0 space-y-2.5">
                <div className="flex items-baseline gap-4">
                  <span className="text-[16px] font-bold tracking-[0.14em] text-[#52524E] tabular-nums">
                    {v.index}
                  </span>
                  <h3 className="text-[22px] sm:text-[24px] font-extrabold text-[#000000] tracking-tight">
                    {v.title}
                  </h3>
                </div>
                <p className="text-[18px] sm:text-[19px] text-[#3F3F3C] leading-[1.75] pl-10">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </EditorialSection>
    </EditorialPageLayout>
  );
}
