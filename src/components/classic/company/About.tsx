import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Target, Users, Zap, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const values = [
    {
      icon: Target,
      title: 'Precision Architecture',
      description: 'We believe in building digital foundations that are both robust and elegant.'
    },
    {
      icon: Users,
      title: 'Global Collaboration',
      description: 'Empowering teams worldwide to sync their technical vision seamlessly.'
    },
    {
      icon: Zap,
      title: 'AI Native',
      description: 'Leveraging cutting-edge AI to automate the complex technical planning process.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-12"
        >
          <ArrowLeft size={14} />
          {t('back')}
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] p-12 lg:p-20 shadow-xl shadow-slate-200/50 border border-slate-100 mb-12"
        >
          <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Sparkles size={24} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">{t('about_us')}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">The Vision of GOGUMA</h2>
              <p className="text-slate-600 font-medium leading-loose text-lg">
                GOGUMA was founded on a simple premise: technical architecture should be as intuitive as a sketch but as precise as a blueprint. 
                We provide the bridge between conceptual design and high-level engineering.
              </p>
              <p className="text-slate-600 font-medium leading-loose">
                Our platform integrates advanced AI orchestration to help architects, product managers, and developers align 
                their strategic vision before a single line of code is written.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {values.map((v) => (
                <div key={v.title} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <v.icon size={20} className="text-blue-600 mb-3" />
                  <h3 className="font-black text-slate-900 uppercase tracking-tight mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
