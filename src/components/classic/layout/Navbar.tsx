import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { auth, LocalUser } from '../../../lib/localAuth';

interface NavbarProps {
  projectTitle?: string;
  saveStatus?: 'idle' | 'saving' | 'saved';
}

export default function Navbar({ projectTitle, saveStatus }: NavbarProps) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const [user, setUser] = useState<LocalUser | null>(() => auth.currentUser);

  useEffect(() => {
    return auth.onAuthStateChanged((u) => {
      setUser(u);
    });
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E5E7EB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Single Text Element Wordmark & Optional Project Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Link 
            to="/" 
            className="text-base font-bold tracking-tight text-[#111827] hover:text-[#1E3A8A] transition-colors uppercase shrink-0 leading-none"
          >
            GOGUMA
          </Link>

          {projectTitle && (
            <>
              <span className="text-[#D1D5DB] select-none leading-none shrink-0" aria-hidden="true">/</span>
              <div className="max-w-[280px] sm:max-w-[360px] truncate flex items-center min-w-0">
                <span className="font-medium text-xs sm:text-sm text-[#4B5563] truncate block leading-normal">
                  {projectTitle}
                </span>
              </div>
            </>
          )}

          {saveStatus && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#6B7280] shrink-0">
              <span aria-hidden="true" className="leading-none select-none">·</span>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${saveStatus === 'saving' ? 'bg-[#B45309] animate-pulse' : 'bg-[#15803D]'}`} />
              <span className="font-mono text-[11px] text-[#4B5563] leading-none whitespace-nowrap">
                {saveStatus === 'saving' ? '보존 중' : '자동 보존됨'}
              </span>
            </div>
          )}
        </div>

        {/* Zone 2: Clean Typography Nav Links */}
        <nav className="hidden md:flex items-center gap-6 shrink-0">
          <Link to="/about" className="text-xs font-medium text-[#4B5563] hover:text-[#111827] transition-colors">{t('about_us')}</Link>
          <Link to="/features" className="text-xs font-medium text-[#4B5563] hover:text-[#111827] transition-colors">{t('features')}</Link>
          <Link to="/community" className="text-xs font-medium text-[#4B5563] hover:text-[#111827] transition-colors">
            {language === 'ko' ? '오픈소스' : 'Open Source'}
          </Link>
          <Link to="/support" className="text-xs font-medium text-[#4B5563] hover:text-[#111827] transition-colors">
            {language === 'ko' ? '가이드' : 'AI Guides'}
          </Link>
        </nav>

        {/* Zone 3: Primary Action Button (Editorial Navy) */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user ? (
            <button 
              onClick={() => navigate('/workspace')}
              className="px-4 py-1.5 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            >
              작업실로 이동
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-1.5 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            >
              시작하기
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-[#4B5563] hover:text-[#111827] p-1.5 rounded-lg cursor-pointer" 
          onClick={() => setIsOpen(!isOpen)} 
          aria-label="메뉴 열기"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#FFFFFF] border-b border-[#E5E7EB] overflow-hidden shadow-lg"
          >
            <div className="flex flex-col p-5 gap-4">
              <Link to="/about" className="text-xs text-[#4B5563] hover:text-[#111827] transition-colors" onClick={() => setIsOpen(false)}>{t('about_us')}</Link>
              <Link to="/features" className="text-xs text-[#4B5563] hover:text-[#111827] transition-colors" onClick={() => setIsOpen(false)}>{t('features')}</Link>
              <Link to="/community" className="text-xs text-[#4B5563] hover:text-[#111827] transition-colors" onClick={() => setIsOpen(false)}>{language === 'ko' ? '오픈소스' : 'Open Source'}</Link>
              <Link to="/support" className="text-xs text-[#4B5563] hover:text-[#111827] transition-colors" onClick={() => setIsOpen(false)}>{language === 'ko' ? '가이드' : 'AI Guides'}</Link>
              <button 
                onClick={() => navigate(user ? '/workspace' : '/login')}
                className="w-full py-2.5 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                {user ? '작업실로 이동' : '시작하기'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
