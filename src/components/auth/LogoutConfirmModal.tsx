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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white border border-stone-200/90 rounded-[2px] p-6 shadow-2xl space-y-4 text-stone-900 font-sans relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-[2px] text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          title="닫기"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[2px] bg-amber-50 border border-amber-200 text-[#D97706] flex items-center justify-center shrink-0 font-bold shadow-xs">
            <LogOut size={16} />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-stone-900 tracking-tight">
              {language === 'ko' ? '세션 잠금 및 로그아웃' : 'Lock Session & Sign Out'}
            </h3>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-[2px] border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 text-xs font-medium transition-colors cursor-pointer"
          >
            {language === 'ko' ? '취소' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
            className="px-4 py-1.5 rounded-[2px] bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <LogOut size={13} />
            <span>{language === 'ko' ? '로그아웃' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
