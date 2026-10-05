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
        className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-all group min-w-[150px]"
      >
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-slate-400 group-hover:text-goguma transition-colors flex-shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 truncate max-w-[80px]">
              {selectedRegion.name[language as 'en' | 'ko' | 'id']}
            </span>
            <span className="text-[10px] text-slate-300">|</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
              {language.toUpperCase()}
            </span>
          </div>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-4 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 p-6 space-y-6"
          >
            {/* Region Selection */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('select_region')}</h4>
              <div className="grid grid-cols-2 gap-2">
                {regions.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleRegionChange(r)}
                    className={`text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                      selectedRegion.id === r.id
                        ? 'bg-goguma/10 text-goguma border border-goguma/20'
                        : 'bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100'
                    }`}
                  >
                    {r.name[language as 'en' | 'ko' | 'id']}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('select_language')}</h4>
              <div className="grid grid-cols-1 gap-2">
                {languages.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLanguage(l.id as any)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                      language === l.id
                        ? 'bg-goguma/10 text-goguma border border-goguma/20'
                        : 'bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100'
                    }`}
                  >
                    <span>{l.nativeName}</span>
                    {language === l.id && <Check size={10} />}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-50">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-goguma text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-goguma/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
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
