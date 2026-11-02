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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#111116] border border-[#262632] rounded-[2px] p-6 shadow-2xl space-y-4 text-[#F5F3ED] font-sans relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-[2px] text-[#8E8B82] hover:text-[#F5F3ED] hover:bg-[#1A1A22] transition-colors cursor-pointer"
          title="닫기"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[2px] bg-[#C5A880] text-[#0A0A0C] flex items-center justify-center shrink-0 font-bold">
            <LogOut size={16} />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#F5F3ED] uppercase tracking-wider">
              {language === 'ko' ? '세션 잠금 및 로그아웃' : 'Lock Session & Sign Out'}
            </h3>
            <p className="text-xs text-[#8E8B82] font-mono mt-0.5">
              {userName ? `${userName} 계정` : '현재 작업자'}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-[2px] bg-[#141418] border border-[#23232A] space-y-1 text-xs text-[#8E8B82]">
          <div className="flex items-center gap-1.5 font-semibold text-[#F5F3ED]">
            <ShieldCheck size={14} className="text-[#C5A880]" />
            <span>{language === 'ko' ? '로컬 데이터 보존 안내' : 'Data Persistence Guarantee'}</span>
          </div>
          <p className="leading-relaxed font-sans">
            {language === 'ko'
              ? '로그아웃하더라도 로컬에 저장된 기획안과 사양서 문서는 안전하게 유지됩니다. 언제든지 로그인 게이트웨이에서 다시 작업실로 입장할 수 있습니다.'
              : 'Your workspace documents and data are safely preserved in local storage. You can return anytime through the Login Gateway.'}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#23232A]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-[2px] border border-[#23232A] bg-[#141418] text-[#8E8B82] hover:text-[#F5F3ED] hover:bg-[#1A1A22] text-xs font-medium transition-colors cursor-pointer"
          >
            {language === 'ko' ? '취소' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
            className="px-4 py-1.5 rounded-[2px] bg-[#C5A880] hover:bg-[#D4B992] text-[#0A0A0C] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <LogOut size={13} />
            <span>{language === 'ko' ? '로그아웃' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
