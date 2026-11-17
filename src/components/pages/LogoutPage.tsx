import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import { LocalUser } from '../../lib/localAuth';
import { EditorialPageLayout } from '../classic/layout/EditorialPageLayout';

interface LogoutPageProps {
  currentUser: LocalUser | null;
  onConfirmLogout: () => Promise<void>;
}

export default function LogoutPage({ currentUser, onConfirmLogout }: LogoutPageProps) {
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleConfirm = async () => {
    setIsSigningOut(true);
    try {
      await onConfirmLogout();
      navigate('/login', { replace: true });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <EditorialPageLayout
      category="SESSION SECURITY"
      title="세션 잠금 및 로그아웃"
      subtitle="현재 로컬 작업 세션을 종료하고 디렉터 입장 화면으로 이동합니다."
      maxWidthClass="max-w-4xl"
    >
      <div className="border border-[#000000] bg-[#FFFFFF] p-8 sm:p-12 space-y-8">
        <div className="p-6 sm:p-7 bg-[#F6F5F1] border border-[#E4E2DC] flex items-center gap-5">
          <div className="w-14 h-14 bg-[#000000] text-[#FFE600] font-extrabold text-[24px] flex items-center justify-center shrink-0">
            {(currentUser?.displayName || 'D')[0]}
          </div>
          <div className="min-w-0">
            <div className="text-[22px] font-extrabold text-[#000000] truncate">
              {currentUser?.displayName || '활성 로컬 세션'}
            </div>
            <div className="text-[17px] text-[#52524E] mt-1">
              {currentUser?.email || '로컬 브라우저 독립 계정'}
            </div>
          </div>
        </div>

        <div className="p-6 bg-[#FFFFFF] border-l-4 border-l-[#000000] border border-[#E4E2DC] flex items-start gap-3 text-[18px] text-[#3F3F3C] leading-[1.75]">
          <ShieldCheck size={20} className="text-[#000000] shrink-0 mt-1" />
          <span>
            로그아웃 시에도 브라우저 로컬 저장소(IndexedDB)에 저장된 기획서와 프로젝트 원고는 삭제되지 않고 안전하게 보존됩니다.
          </span>
        </div>

        <div className="pt-6 border-t border-[#E4E2DC] flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/workspace')}
            className="px-6 py-3.5 border border-[#CBC8BF] hover:border-[#000000] text-[17px] font-bold text-[#000000] rounded-none cursor-pointer"
          >
            작업실에 머무르기
          </button>
          <button
            type="button"
            disabled={isSigningOut}
            onClick={handleConfirm}
            className="px-7 py-3.5 bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] text-[18px] font-bold rounded-none transition-colors cursor-pointer flex items-center gap-2.5 disabled:opacity-50"
          >
            <LogOut size={17} />
            <span>{isSigningOut ? '로그아웃 중...' : '세션 잠금 및 로그아웃'}</span>
          </button>
        </div>
      </div>
    </EditorialPageLayout>
  );
}
