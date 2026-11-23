import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import { LocalUser } from '../../lib/localAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { EditorialPageLayout } from '../classic/layout/EditorialPageLayout';

interface LogoutPageProps {
  currentUser: LocalUser | null;
  onConfirmLogout: () => Promise<void>;
}

export default function LogoutPage({ currentUser, onConfirmLogout }: LogoutPageProps) {
  const navigate = useNavigate();
  const { pick } = useLanguage();
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
      title={pick({
        ko: '세션 잠금 및 로그아웃',
        en: 'Lock Session & Sign Out',
        ja: 'セッションロック・サインアウト',
        id: 'Kunci Sesi & Keluar',
      })}
      subtitle={pick({
        ko: '현재 로컬 작업 세션을 종료하고 디렉터 입장 화면으로 이동합니다.',
        en: 'End the current local worker session and return to the director gateway.',
        ja: '現在のローカル作業セッションを終了し、ディレクター入場画面へ移動します。',
        id: 'Akhiri sesi kerja lokal saat ini dan kembali ke gerbang masuk direktur.',
      })}
      maxWidthClass="max-w-4xl"
    >
      <div className="border border-[var(--theme-ink-strong)] bg-[var(--theme-elevated)] p-8 sm:p-12 space-y-8">
        <div className="p-6 sm:p-7 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] flex items-center gap-5">
          <div className="w-14 h-14 bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] font-extrabold text-[24px] flex items-center justify-center shrink-0">
            {(currentUser?.displayName || 'D')[0]}
          </div>
          <div className="min-w-0">
            <div className="text-[22px] font-extrabold text-[var(--theme-ink-strong)] truncate">
              {currentUser?.displayName ||
                pick({ ko: '활성 로컬 세션', en: 'Active Local Session', ja: 'アクティブローカルセッション', id: 'Sesi Lokal Aktif' })}
            </div>
            <div className="text-[17px] text-[var(--theme-ink-secondary)] mt-1">
              {currentUser?.email ||
                pick({ ko: '로컬 브라우저 독립 계정', en: 'Independent Browser Account', ja: 'ローカルブラウザ独立アカウント', id: 'Akun Independen Browser Lokal' })}
            </div>
          </div>
        </div>

        <div className="p-6 bg-[var(--theme-canvas)] border-l-4 border-l-[var(--theme-ink-strong)] border border-[var(--theme-border-hairline)] flex items-start gap-3 text-[18px] text-[var(--theme-ink-body)] leading-[1.75]">
          <ShieldCheck size={20} className="text-[var(--theme-ink-strong)] shrink-0 mt-1" />
          <span>
            {pick({
              ko: '로그아웃 시에도 브라우저 로컬 저장소(IndexedDB)에 저장된 기획서와 프로젝트 원고는 삭제되지 않고 안전하게 보존됩니다.',
              en: 'Signing out never deletes your specifications or project manuscripts stored in browser IndexedDB.',
              ja: 'サインアウトしても、ブラウザのローカルストレージ（IndexedDB）に保存された企画書やプロジェクト原稿は削除されず安全に保持されます。',
              id: 'Keluar tidak akan menghapus spesifikasi maupun draf proyek Anda yang tersimpan di IndexedDB browser.',
            })}
          </span>
        </div>

        <div className="pt-6 border-t border-[var(--theme-border-hairline)] flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/workspace')}
            className="px-6 py-3.5 border border-[var(--theme-border-strong)] hover:border-[var(--theme-ink-strong)] text-[17px] font-bold text-[var(--theme-ink-strong)] rounded-none cursor-pointer"
          >
            {pick({ ko: '작업실에 머무르기', en: 'Stay in Workspace', ja: 'ワークスペースに留まる', id: 'Tetap di Ruang Kerja' })}
          </button>
          <button
            type="button"
            disabled={isSigningOut}
            onClick={handleConfirm}
            className="px-7 py-3.5 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-[18px] font-bold rounded-none transition-colors cursor-pointer flex items-center gap-2.5 disabled:opacity-50"
          >
            <LogOut size={17} />
            <span>
              {isSigningOut
                ? pick({ ko: '로그아웃 중...', en: 'Signing out...', ja: 'サインアウト中...', id: 'Sedang keluar...' })
                : pick({ ko: '세션 잠금 및 로그아웃', en: 'Lock Session & Sign Out', ja: 'セッションロック・サインアウト', id: 'Kunci Sesi & Keluar' })}
            </span>
          </button>
        </div>
      </div>
    </EditorialPageLayout>
  );
}
