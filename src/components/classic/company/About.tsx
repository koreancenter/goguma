import React from 'react';
import { motion } from 'motion/react';
import { Target, Users, Zap, ArrowLeft, Box } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const values = [
    {
      icon: Target,
      title: 'Precision Architecture',
      description: 'We believe in building digital foundations that are both robust, minimal, and uncompromisingly elegant.'
    },
    {
      icon: Users,
      title: 'Global Collaboration',
      description: 'Empowering teams and solo builders worldwide to sync their architectural vision with zero friction.'
    },
    {
      icon: Zap,
      title: 'Autonomous Local Execution',
      description: 'Leveraging offline-first principles and edge AI to automate the entire technical specification cycle.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#111827] pt-28 pb-24 font-sans selection:bg-[#1E3A8A]/15 selection:text-[#111827]">
      <div className="max-w-5xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#6B7280] hover:text-[#111827] transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#1E3A8A]" />
          <span>{t('back')}</span>
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFFFFF] rounded-2xl p-8 sm:p-14 lg:p-16 border border-[#E5E7EB] mb-12 shadow-[0_12px_32px_-4px_rgba(15,23,42,0.06)] space-y-12"
        >
          <div className="flex items-center gap-4 border-b border-[#E5E7EB] pb-8">
            <div className="w-10 h-10 bg-[#EFF6FF] border border-[#1E3A8A]/15 text-[#1E3A8A] rounded-xl flex items-center justify-center font-bold">
              <Box size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#1E3A8A] font-semibold">ARCHITECTURAL STATEMENT</span>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#111827] tracking-tight uppercase mt-0.5">{t('about_us')}</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-[#111827] uppercase tracking-wider">The Vision</h2>
              <p className="text-[#374151] font-sans leading-relaxed text-base">
                Technical architecture should be as intuitive as a sketch and as rigorous as an engineering blueprint. 
                We provide the bridge between conceptual design, business requirements, and high-level agentic development.
              </p>
              <p className="text-[#4B5563] font-sans leading-relaxed text-sm">
                Our platform generates 11 core software specification documents alongside an interactive local runtime, 
                eliminating AI hallucinations before a single line of production code is written.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {values.map((v) => (
                <div key={v.title} className="p-5 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center gap-2.5">
                    <v.icon size={16} className="text-[#1E3A8A]" />
                    <h3 className="font-semibold text-sm text-[#111827] uppercase tracking-wider">{v.title}</h3>
                  </div>
                  <p className="text-xs text-[#4B5563] leading-relaxed font-sans">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
