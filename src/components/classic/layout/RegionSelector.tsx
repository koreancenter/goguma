import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface Region {
  id: string;
  name: { en: string; ko: string; id: string };
}

interface LanguageOption {
  id: string;
  name: string;
  nativeName: string;
}

const regions: Region[] = [
  { id: 'global', name: { en: 'Global', ko: '글로벌', id: 'Global' } },
  { id: 'namerica', name: { en: 'North America', ko: '북미', id: 'Amerika Utara' } },
  { id: 'europe', name: { en: 'Europe', ko: '유럽', id: 'Eropa' } },
  { id: 'asiapacific', name: { en: 'Asia Pacific', ko: '아시아 태평양', id: 'Asia Pasifik' } },
  { id: 'korea', name: { en: 'South Korea', ko: '대한민국', id: 'Korea Selatan' } },
  { id: 'indonesia', name: { en: 'Indonesia', ko: '인도네시아', id: 'Indonesia' } },
];

const languages: LanguageOption[] = [
  { id: 'en', name: 'English', nativeName: 'English' },
  { id: 'ko', name: 'Korean', nativeName: '한국어' },
  { id: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
];

export default function RegionSelector() {
  const { language, setLanguage, region, setRegion, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedRegion = regions.find(r => r.id === region) || regions[0];

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion.id);
    
    // Automatic Mapping
    if (newRegion.id === 'korea') {
      setLanguage('ko');
    } else if (newRegion.id === 'indonesia') {
      setLanguage('id');
    } else {
      setLanguage('en');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 px-3.5 py-2 bg-[#F7F8FA] hover:bg-[#F1F5F9] rounded-lg border border-[#E5E7EB] transition-all group min-w-[150px] cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-[#1E3A8A] flex-shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#111827] truncate max-w-[80px]">
              {selectedRegion.name[language as 'en' | 'ko' | 'id']}
            </span>
            <span className="text-[10px] text-[#D1D5DB]">|</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#1E3A8A] font-semibold">
              {language.toUpperCase()}
            </span>
          </div>
        </div>
        <ChevronDown size={14} className={`text-[#6B7280] transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-4 w-72 bg-[#FFFFFF] rounded-2xl shadow-[0_24px_48px_-12px_rgba(15,23,42,0.18)] border border-[#E5E7EB] overflow-hidden z-50 p-5 space-y-5"
          >
            {/* Region Selection */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-mono text-[#6B7280] uppercase tracking-[0.2em]">{t('select_region')}</h4>
              <div className="grid grid-cols-2 gap-2">
                {regions.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleRegionChange(r)}
                    className={`text-left px-3 py-2 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                      selectedRegion.id === r.id
                        ? 'bg-[#EFF6FF] text-[#1E3A8A] border border-[#1E3A8A]/30 font-semibold'
                        : 'bg-[#F7F8FA] text-[#374151] border border-[#E5E7EB] hover:bg-[#F1F5F9] hover:text-[#111827]'
                    }`}
                  >
                    {r.name[language as 'en' | 'ko' | 'id']}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-mono text-[#6B7280] uppercase tracking-[0.2em]">{t('select_language')}</h4>
              <div className="grid grid-cols-1 gap-2">
                {languages.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLanguage(l.id as any)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                      language === l.id
                        ? 'bg-[#EFF6FF] text-[#1E3A8A] border border-[#1E3A8A]/30 font-semibold'
                        : 'bg-[#F7F8FA] text-[#374151] border border-[#E5E7EB] hover:bg-[#F1F5F9] hover:text-[#111827]'
                    }`}
                  >
                    <span>{l.nativeName}</span>
                    {language === l.id && <Check size={12} className="text-[#1E3A8A]" />}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-3 border-t border-[#E5E7EB]">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
              >
                {t('confirm')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
