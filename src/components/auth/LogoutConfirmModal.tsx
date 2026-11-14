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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/35 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.18)] space-y-5 text-[#111827] font-sans relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          title="닫기"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] border border-[#1E3A8A]/20 text-[#1E3A8A] flex items-center justify-center shrink-0 font-bold">
            <LogOut size={16} />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#111827] tracking-tight">
              {language === 'ko' ? '세션 잠금 및 로그아웃' : 'Lock Session & Sign Out'}
            </h3>
            {userName && (
              <p className="text-xs text-[#6B7280] mt-0.5">{userName}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F8FA] text-xs font-medium transition-colors cursor-pointer"
          >
            {language === 'ko' ? '취소' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <LogOut size={13} />
            <span>{language === 'ko' ? '로그아웃' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
