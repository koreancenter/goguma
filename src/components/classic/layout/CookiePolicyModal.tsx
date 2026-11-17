import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Cookie, ShieldCheck, Ban, Database } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface CookiePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CookiePolicyModal({ isOpen, onClose }: CookiePolicyModalProps) {
  const { t, language } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#111827]/35 backdrop-blur-xs z-[9998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] h-[540px] bg-[#FFFFFF] rounded-none shadow-[0_24px_48px_-12px_rgba(15,23,42,0.18)] z-[9999] overflow-hidden flex flex-col border border-[#000000] text-[#111827] font-sans"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#000000] text-[#FFFFFF] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#1A1A18] border border-white/20 text-[#FFE600] rounded-none flex items-center justify-center font-bold shrink-0">
                  <Cookie size={18} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wide">
                    {t('cookie_policy')} (No Cookies)
                  </h2>
                  <p className="text-[11px] text-white/70 font-sans mt-0.5">
                    Zero Cookies · 100% Local-First Architecture
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-none text-white/80 hover:text-[#FFE600] transition-colors cursor-pointer"
                aria-label="닫기"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scroll space-y-4 flex-1 bg-[#FFFFFF]">
              {/* Zero Cookies Declaration */}
              <div className="p-4 bg-[#F7F8FA] rounded-none border border-[#000000]/20 flex items-start gap-3.5">
                <div className="w-8 h-8 bg-[#000000] rounded-none flex items-center justify-center text-[#FFE600] shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                      {language === 'ko' ? '쿠키 미사용 원칙 (NO COOKIES)' : 'Zero Cookies Policy (No Cookies)'}
                    </h3>
                    <span className="px-2 py-0.5 bg-[#000000] text-[#FFE600] text-[10px] font-bold uppercase tracking-wider">
                      0 COOKIES
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#374151] font-sans">
                    {language === 'ko'
                      ? '고구마(GOGUMA)는 어떠한 형태의 HTTP 쿠키(필수 쿠키, 분석 쿠키, 광고·마케팅 쿠키)도 생성, 저장 또는 서버로 전송하지 않습니다.'
                      : 'GOGUMA does not set, read, or transmit any HTTP cookies—neither essential, analytics, nor marketing cookies.'}
                  </p>
                </div>
              </div>

              {/* Analytics & Marketing Trackers */}
              <div className="p-4 bg-[#F7F8FA] rounded-none border border-[#E5E7EB] flex items-start gap-3.5">
                <div className="w-8 h-8 bg-[#FFFFFF] rounded-none border border-[#E5E7EB] flex items-center justify-center text-[#111827] shrink-0">
                  <Ban size={16} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                      {language === 'ko' ? '외부 추적기 및 분석 도구 비탑재' : 'Zero Analytics & Third-Party Trackers'}
                    </h3>
                    <span className="px-2 py-0.5 bg-[#FFFFFF] text-[#4B5563] border border-[#E5E7EB] text-[10px] font-semibold uppercase tracking-wider">
                      {language === 'ko' ? '미수집' : 'NOT USED'}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#4B5563] font-sans">
                    {language === 'ko'
                      ? 'Google Analytics, 광고 픽셀, 제3자 행동 추적 스크립트 및 핑거프린팅 도구를 일체 포함하지 않으며, 방문 이력을 외부로 전송하지 않습니다.'
                      : 'No Google Analytics, advertising pixels, or third-party behavioral tracking scripts exist anywhere in GOGUMA.'}
                  </p>
                </div>
              </div>

              {/* Local Browser Storage Transparency */}
              <div className="p-4 bg-[#F7F8FA] rounded-none border border-[#E5E7EB] flex items-start gap-3.5">
                <div className="w-8 h-8 bg-[#FFFFFF] rounded-none border border-[#E5E7EB] flex items-center justify-center text-[#111827] shrink-0">
                  <Database size={16} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                    {language === 'ko' ? '브라우저 로컬 저장소 투명성' : 'Local Browser Storage Only'}
                  </h3>
                  <p className="text-xs leading-relaxed text-[#4B5563] font-sans">
                    {language === 'ko'
                      ? '언어 설정, 에디터 분할 비율, 작성 중인 기획서 데이터는 서버 쿠키가 아닌 사용자 기기 내부의 IndexedDB 및 LocalStorage에만 저장되며, 브라우저 설정을 통해 언제든 즉시 삭제할 수 있습니다.'
                      : 'Language preferences, split layout ratios, and specification drafts reside strictly in on-device IndexedDB and LocalStorage—never in server cookies.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-[#E5E7EB] bg-[#F7F8FA] flex items-center justify-between shrink-0">
              <span className="text-[11px] font-sans text-[#6B7280]">
                No Cookies · No Telemetry · Local-First
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] rounded-none text-xs font-bold transition-colors cursor-pointer"
              >
                {language === 'ko' ? '확인' : 'Confirm'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
