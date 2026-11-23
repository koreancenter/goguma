import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface Region {
  id: string;
  name: { en: string; ko: string; ja: string; id: string };
}

interface LanguageOption {
  id: string;
  name: string;
  nativeName: string;
}

const regions: Region[] = [
  { id: 'global', name: { en: 'Global', ko: '글로벌', ja: 'グローバル', id: 'Global' } },
  { id: 'namerica', name: { en: 'North America', ko: '북미', ja: '北米', id: 'Amerika Utara' } },
  { id: 'europe', name: { en: 'Europe', ko: '유럽', ja: 'ヨーロッパ', id: 'Eropa' } },
  { id: 'asiapacific', name: { en: 'Asia Pacific', ko: '아시아 태평양', ja: 'アジア太平洋', id: 'Asia Pasifik' } },
  { id: 'korea', name: { en: 'South Korea', ko: '대한민국', ja: '大韓民国', id: 'Korea Selatan' } },
  { id: 'japan', name: { en: 'Japan', ko: '일본', ja: '日本', id: 'Jepang' } },
  { id: 'indonesia', name: { en: 'Indonesia', ko: '인도네시아', ja: 'インドネシア', id: 'Indonesia' } },
];

const languages: LanguageOption[] = [
  { id: 'ko', name: 'Korean', nativeName: '한국어' },
  { id: 'en', name: 'English', nativeName: 'English' },
  { id: 'ja', name: 'Japanese', nativeName: '日本語' },
  { id: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
];

export default function RegionSelector() {
  const { language, setLanguage, region, setRegion, t, pick } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedRegion = regions.find(r => r.id === region) || regions[0];

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion.id);
    
    // Automatic Mapping
    if (newRegion.id === 'korea') {
      setLanguage('ko');
    } else if (newRegion.id === 'japan') {
      setLanguage('ja');
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
        className="flex items-center justify-between gap-3 px-3.5 py-2 bg-[var(--theme-stage)] hover:bg-[var(--theme-subtle)] rounded-lg border border-[var(--theme-border-hairline)] transition-all group min-w-[150px] cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-[var(--theme-ink-primary)] flex-shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-sans uppercase tracking-widest text-[var(--theme-ink-strong)] truncate max-w-[80px]">
              {pick(selectedRegion.name)}
            </span>
            <span className="text-[10px] text-[var(--theme-border-strong)]">|</span>
            <span className="text-[10px] font-sans uppercase tracking-widest text-[var(--theme-ink-primary)] font-semibold">
              {language.toUpperCase()}
            </span>
          </div>
        </div>
        <ChevronDown size={14} className={`text-[var(--theme-ink-muted)] transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-4 w-72 bg-[var(--theme-elevated)] rounded-2xl shadow-[0_24px_48px_-12px_rgba(15,23,42,0.18)] border border-[var(--theme-border-hairline)] overflow-hidden z-50 p-5 space-y-5"
          >
            {/* Region Selection */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-sans text-[var(--theme-ink-muted)] uppercase tracking-[0.2em]">{t('select_region')}</h4>
              <div className="grid grid-cols-2 gap-2">
                {regions.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleRegionChange(r)}
                    className={`text-left px-3 py-2 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                      selectedRegion.id === r.id
                        ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] border border-[var(--theme-ink-strong)] font-semibold'
                        : 'bg-[var(--theme-stage)] text-[var(--theme-ink-body)] border border-[var(--theme-border-hairline)] hover:bg-[var(--theme-subtle)] hover:text-[var(--theme-ink-strong)]'
                    }`}
                  >
                    {pick(r.name)}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-sans text-[var(--theme-ink-muted)] uppercase tracking-[0.2em]">{t('select_language')}</h4>
              <div className="grid grid-cols-1 gap-2">
                {languages.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLanguage(l.id as any)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                      language === l.id
                        ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] border border-[var(--theme-ink-strong)] font-semibold'
                        : 'bg-[var(--theme-stage)] text-[var(--theme-ink-body)] border border-[var(--theme-border-hairline)] hover:bg-[var(--theme-subtle)] hover:text-[var(--theme-ink-strong)]'
                    }`}
                  >
                    <span>{l.nativeName}</span>
                    {language === l.id && <Check size={12} className="text-[var(--theme-active-text)]" />}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-3 border-t border-[var(--theme-border-hairline)]">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
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
