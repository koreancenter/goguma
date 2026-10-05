import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Menu, X, Code2 } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { auth, LocalUser } from '../../../lib/localAuth';

export default function Navbar() {
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0E1217]/95 backdrop-blur-md border-b border-white/7">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Zone 1: Single Text Element Wordmark */}
        <Link to="/" className="text-base font-bold tracking-tight text-[#F0F3F6] hover:text-[#C5A880] transition-colors">
          GOGUMA
        </Link>

        {/* Zone 2: Clean Typography Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/about" className="text-xs font-medium text-[#9AA5B5] hover:text-[#F0F3F6] transition-colors">{t('about_us')}</Link>
          <Link to="/features" className="text-xs font-medium text-[#9AA5B5] hover:text-[#F0F3F6] transition-colors">{t('features')}</Link>
          <Link to="/community" className="text-xs font-medium text-[#9AA5B5] hover:text-[#F0F3F6] transition-colors">
            {language === 'ko' ? '오픈소스' : 'Open Source'}
          </Link>
          <Link to="/support" className="text-xs font-medium text-[#9AA5B5] hover:text-[#F0F3F6] transition-colors">
            {language === 'ko' ? '가이드' : 'AI Guides'}
          </Link>
        </nav>

        {/* Zone 3: Primary Action Button */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <button 
              onClick={() => navigate('/workspace')}
              className="px-3.5 py-1.5 bg-[#C5A880] hover:bg-[#D4AF37] text-[#0B0C10] rounded-[3px] text-xs font-semibold transition-colors cursor-pointer"
            >
              작업실로 이동
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="px-3.5 py-1.5 bg-[#C5A880] hover:bg-[#D4AF37] text-[#0B0C10] rounded-[3px] text-xs font-semibold transition-colors cursor-pointer"
            >
              시작하기
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-[#9AA5B5] hover:text-[#F0F3F6] p-1.5" onClick={() => setIsOpen(!isOpen)} aria-label="메뉴 열기">
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
            className="md:hidden bg-[#0E1217] border-b border-white/7 overflow-hidden"
          >
            <div className="flex flex-col p-5 gap-4">
              <Link to="/about" className="text-xs text-[#9AA5B5] hover:text-[#F0F3F6] transition-colors" onClick={() => setIsOpen(false)}>{t('about_us')}</Link>
              <Link to="/features" className="text-xs text-[#9AA5B5] hover:text-[#F0F3F6] transition-colors" onClick={() => setIsOpen(false)}>{t('features')}</Link>
              <Link to="/community" className="text-xs text-[#9AA5B5] hover:text-[#F0F3F6] transition-colors" onClick={() => setIsOpen(false)}>{language === 'ko' ? '오픈소스' : 'Open Source'}</Link>
              <Link to="/support" className="text-xs text-[#9AA5B5] hover:text-[#F0F3F6] transition-colors" onClick={() => setIsOpen(false)}>{language === 'ko' ? '가이드' : 'AI Guides'}</Link>
              <button 
                onClick={() => navigate(user ? '/workspace' : '/login')}
                className="w-full py-2.5 bg-[#C5A880] text-[#0B0C10] rounded-[3px] text-xs font-semibold"
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
