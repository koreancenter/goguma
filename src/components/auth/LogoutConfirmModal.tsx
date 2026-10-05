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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#FAF7F2] border-2 border-[#E5DFD3] rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 text-[#231F20] relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#8E8377] hover:text-[#231F20] hover:bg-[#EFE9DC] transition-colors"
          title="닫기"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]/40 flex items-center justify-center flex-shrink-0">
            <LogOut size={22} />
          </div>
          <div>
            <h3 className="font-serif font-black text-lg text-[#111827]">
              {language === 'ko' ? '작업실 세션 잠금 및 로그아웃' : 'Lock Workspace & Sign Out'}
            </h3>
            <p className="text-xs text-[#8E8377] font-medium">
              {userName ? `${userName} 계정 세션` : '현재 작업자 세션'}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#EFE9DC]/70 border border-[#E5DFD3] space-y-1.5 text-xs text-[#6B625B]">
          <div className="flex items-center gap-1.5 font-bold text-[#4B433C]">
            <ShieldCheck size={15} className="text-[#6B1D42]" />
            <span>{language === 'ko' ? '작업 데이터 자동 보존 안내' : 'Data Persistence Guarantee'}</span>
          </div>
          <p className="leading-relaxed">
            {language === 'ko'
              ? '로그아웃하더라도 브라우저 IndexedDB에 저장된 기획안과 캔버스 문서는 삭제되지 않고 안전하게 보관됩니다. 언제든지 로그인 게이트웨이에서 다시 입장할 수 있습니다.'
              : 'Your workspace documents and canvas data are safely preserved in local IndexedDB. You can return anytime through the Login Gateway.'}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#D5CCBC] bg-white text-[#4B433C] hover:bg-[#EFE9DC] text-xs font-bold transition-colors cursor-pointer"
          >
            {language === 'ko' ? '계속 작업하기' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>{language === 'ko' ? '로그아웃 및 잠금' : 'Sign Out & Lock'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
