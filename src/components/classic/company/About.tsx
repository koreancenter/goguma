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
    <div className="min-h-screen bg-[#0A0A0C] text-[#F5F3ED] pt-28 pb-24 font-sans selection:bg-[#2A241D] selection:text-[#F5F3ED]">
      <div className="max-w-5xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#8E8B82] hover:text-[#F5F3ED] transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#C5A880]" />
          <span>{t('back')}</span>
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111116] rounded-[2px] p-8 sm:p-14 lg:p-16 border border-[#23232A] mb-12 shadow-2xl space-y-12"
        >
          <div className="flex items-center gap-4 border-b border-[#23232A] pb-8">
            <div className="w-10 h-10 bg-[#141418] border border-[#23232A] text-[#C5A880] rounded-[2px] flex items-center justify-center font-bold">
              <Box size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A880]">ARCHITECTURAL STATEMENT</span>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F3ED] tracking-tight uppercase mt-0.5">{t('about_us')}</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-[#F5F3ED] uppercase tracking-wider">The Vision</h2>
              <p className="text-[#B8B5AC] font-sans leading-relaxed text-base">
                Technical architecture should be as intuitive as a sketch and as rigorous as an engineering blueprint. 
                We provide the bridge between conceptual design, business requirements, and high-level agentic development.
              </p>
              <p className="text-[#8E8B82] font-sans leading-relaxed text-sm">
                Our platform generates 11 core software specification documents alongside an interactive local runtime, 
                eliminating AI hallucinations before a single line of production code is written.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {values.map((v) => (
                <div key={v.title} className="p-5 bg-[#141418] rounded-[2px] border border-[#23232A] space-y-2">
                  <div className="flex items-center gap-2.5">
                    <v.icon size={16} className="text-[#C5A880]" />
                    <h3 className="font-semibold text-sm text-[#F5F3ED] uppercase tracking-wider">{v.title}</h3>
                  </div>
                  <p className="text-xs text-[#8E8B82] leading-relaxed font-sans">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
