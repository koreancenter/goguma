import React from 'react';
import { LogOut, ShieldCheck, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  userName?: string | null;
}

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
}: LogoutConfirmModalProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#0E1217] border border-white/[0.08] rounded-[4px] p-6 shadow-2xl space-y-4 text-[#F0F3F6] font-sans relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          title="닫기"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[2px] bg-blue-950/60 border border-blue-800/60 text-[#38BDF8] flex items-center justify-center shrink-0 font-bold shadow-xs">
            <LogOut size={16} />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white tracking-tight">
              {language === 'ko' ? '세션 잠금 및 로그아웃' : 'Lock Session & Sign Out'}
            </h3>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-[2px] border border-white/[0.08] bg-[#13181F] text-zinc-300 hover:text-white hover:bg-[#18202A] text-xs font-medium transition-colors cursor-pointer"
          >
            {language === 'ko' ? '취소' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
            className="px-4 py-1.5 rounded-[2px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <LogOut size={13} />
            <span>{language === 'ko' ? '로그아웃' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
