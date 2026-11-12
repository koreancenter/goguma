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
    <div className="min-h-screen bg-[#0B0C10] text-[#F0F3F6] pt-28 pb-24 font-sans selection:bg-[#2563EB]/30 selection:text-[#F0F3F6]">
      <div className="max-w-5xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#64748B] hover:text-[#F0F3F6] transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#38BDF8]" />
          <span>{t('back')}</span>
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0E1217] rounded-[2px] p-8 sm:p-14 lg:p-16 border border-white/[0.08] mb-12 shadow-2xl space-y-12"
        >
          <div className="flex items-center gap-4 border-b border-white/[0.08] pb-8">
            <div className="w-10 h-10 bg-[#13181F] border border-white/[0.08] text-[#38BDF8] rounded-[2px] flex items-center justify-center font-bold">
              <Box size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#38BDF8]">ARCHITECTURAL STATEMENT</span>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#F0F3F6] tracking-tight uppercase mt-0.5">{t('about_us')}</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-[#F0F3F6] uppercase tracking-wider">The Vision</h2>
              <p className="text-[#94A3B8] font-sans leading-relaxed text-base">
                Technical architecture should be as intuitive as a sketch and as rigorous as an engineering blueprint. 
                We provide the bridge between conceptual design, business requirements, and high-level agentic development.
              </p>
              <p className="text-[#64748B] font-sans leading-relaxed text-sm">
                Our platform generates 11 core software specification documents alongside an interactive local runtime, 
                eliminating AI hallucinations before a single line of production code is written.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {values.map((v) => (
                <div key={v.title} className="p-5 bg-[#13181F] rounded-[2px] border border-white/[0.08] space-y-2">
                  <div className="flex items-center gap-2.5">
                    <v.icon size={16} className="text-[#38BDF8]" />
                    <h3 className="font-semibold text-sm text-[#F0F3F6] uppercase tracking-wider">{v.title}</h3>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed font-sans">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
