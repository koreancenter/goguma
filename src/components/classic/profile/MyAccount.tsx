import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  User, Mail, Shield, Zap, Save, CheckCircle, Lock, AlertTriangle,
  HardDrive, Download, RefreshCw, ShieldCheck, FolderArchive, Database, LogOut
} from 'lucide-react';
import { db, handleFirestoreError, OperationType, doc, getDoc, updateDoc, getStorageUsageStats, exportAllLocalData } from '../../../lib/localDb';
import { auth, updateProfile } from '../../../lib/localAuth';
import { useLanguage } from '../../../contexts/LanguageContext';
import { LocalBackupModal } from '../LocalBackupModal';
import LogoutConfirmModal from '../../auth/LogoutConfirmModal';

export default function MyAccount() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [userStats, setUserStats] = useState({ totalApiCalls: 0 });
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // Storage Stats
  const [storageStats, setStorageStats] = useState(getStorageUsageStats);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupExportSuccess, setBackupExportSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      setDisplayName(user.displayName || '');

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRole(userData.role || 'USER');
          setCompanyName(userData.companyName || '');
        } else {
          setRole('USER');
        }

        const statsDoc = await getDoc(doc(db, 'user_stats', user.uid));
        if (statsDoc.exists()) {
          setUserStats(statsDoc.data() as any);
        } else {
          setUserStats({ totalApiCalls: 0 });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        setRole('USER');
        setUserStats({ totalApiCalls: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    setStorageStats(getStorageUsageStats());
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      const nameRegex = /^[a-zA-Z가-힣\s-]{2,30}$/;
      if (!nameRegex.test(displayName.trim())) {
        setError(t('full_name_hint'));
        setSaving(false);
        return;
      }

      await updateProfile(user, { displayName: displayName.trim() });
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim(),
        companyName: companyName.trim(),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickExportBackup = () => {
    exportAllLocalData();
    setBackupExportSuccess(true);
    setTimeout(() => setBackupExportSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#0A0A0C]">
        <div className="w-8 h-8 border-2 border-[#23232A] border-t-[#C5A880] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F5F3ED]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 border-b border-[#23232A] pb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C5A880]">SETTINGS & IDENTITY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F3ED] tracking-tight">{t('my_account')}</h1>
          <p className="text-[#B8B5AC] font-sans text-sm mt-1">
            {language === 'ko' 
              ? '개인 프로필 정보 및 로컬 데이터베이스 스토리지를 관리합니다.' 
              : 'Manage your local profile identity and on-device storage backup.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="md:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111116] rounded-[2px] p-6 sm:p-7 border border-[#23232A] shadow-xs"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-[#23232A] pb-4">
                <div className="p-2 bg-[#141418] text-[#C5A880] rounded-[2px] border border-[#23232A]">
                  <User size={18} />
                </div>
                <h2 className="text-lg font-semibold text-[#F5F3ED] uppercase tracking-wider">{t('update_profile')}</h2>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8E8B82] mb-1.5">
                    {t('company_name')} <span className="text-[#8E8B82] font-normal">({t('optional')})</span>
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8B82]" size={16} />
                    <input 
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#141418] border border-[#23232A] rounded-[2px] text-xs font-medium text-[#F5F3ED] focus:border-[#C5A880] transition-all outline-none"
                      placeholder="Personal Workspace"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8E8B82] mb-1.5">
                    {t('full_name')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8B82]" size={16} />
                    <input 
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#141418] border border-[#23232A] rounded-[2px] text-xs font-medium text-[#F5F3ED] focus:border-[#C5A880] transition-all outline-none"
                      placeholder="Architect Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8E8B82] mb-1.5">
                    {t('email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8B82]" size={16} />
                    <input 
                      type="email"
                      value={auth.currentUser?.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0D0D11] border border-[#23232A]/50 rounded-[2px] text-xs font-mono text-[#8E8B82] cursor-not-allowed outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#23232A]">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141418] rounded-[2px] border border-[#23232A] font-mono text-xs text-[#C5A880]">
                      <Shield size={13} />
                      <span>{role === 'ADMIN' ? '디렉터 (관리자)' : '게스트/멤버'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLogoutModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-[2px] border border-[#23232A] text-[#8E8B82] hover:text-[#F5F3ED] hover:bg-[#141418] text-xs font-medium transition-colors cursor-pointer"
                    >
                      <LogOut size={13} />
                      <span>로그아웃</span>
                    </button>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 bg-[#C5A880] hover:bg-[#D4B992] disabled:opacity-50 text-[#0A0A0C] rounded-[2px] font-semibold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    {saving ? <div className="w-3.5 h-3.5 border-2 border-[#0A0A0C]/30 border-t-[#0A0A0C] rounded-full animate-spin" /> : <Save size={14} />}
                    <span>{t('save_changes')}</span>
                  </button>
                </div>

                {success && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mt-3 flex items-center gap-2 p-3 bg-[#16221A] border border-[#2D4A38] text-[#93D7AC] rounded-[2px] text-xs font-medium"
                  >
                    <CheckCircle size={15} />
                    <span>{t('profile_updated')}</span>
                  </motion.div>
                )}

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mt-3 flex items-center gap-2 p-3 bg-red-950/40 border border-red-500/30 text-red-300 rounded-[2px] text-xs font-medium"
                  >
                    <AlertTriangle size={15} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </form>
            </motion.div>

            {/* Local-First Security & Storage Section */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111116] rounded-[2px] p-6 sm:p-7 border border-[#23232A] shadow-xs"
            >
              <div className="flex items-center justify-between gap-4 mb-5 border-b border-[#23232A] pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#141418] text-[#C5A880] rounded-[2px] border border-[#23232A]">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[#F5F3ED] uppercase tracking-wider">
                      {language === 'ko' ? '로컬 데이터 및 백업 허브' : 'Local Data & Backup Hub'}
                    </h2>
                    <p className="text-xs text-[#B8B5AC] font-sans mt-0.5">
                      {language === 'ko' 
                        ? '기획안과 AI 설정은 브라우저 로컬 저장소에 안전하게 보관됩니다.'
                        : 'All architecture projects and settings are stored locally on your device.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#141418] border border-[#23232A] text-[#C5A880] text-[10px] font-mono uppercase tracking-wider shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
                  <span>OFFLINE FIRST</span>
                </div>
              </div>

              {/* Storage metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-5">
                <div className="p-3.5 rounded-[2px] bg-[#141418] border border-[#23232A]">
                  <div className="text-[10px] font-mono uppercase text-[#8E8B82]">Storage Used</div>
                  <div className="text-base font-mono font-bold text-[#F5F3ED] mt-1">{storageStats.formattedSize}</div>
                  <div className="text-[10px] text-[#8E8B82] font-mono mt-0.5">Local sandbox</div>
                </div>

                <div className="p-3.5 rounded-[2px] bg-[#141418] border border-[#23232A]">
                  <div className="text-[10px] font-mono uppercase text-[#8E8B82]">Saved Projects</div>
                  <div className="text-base font-mono font-bold text-[#F5F3ED] mt-1">{storageStats.projectCount}</div>
                  <div className="text-[10px] text-[#8E8B82] font-mono mt-0.5">Active records</div>
                </div>

                <div className="p-3.5 rounded-[2px] bg-[#141418] border border-[#23232A]">
                  <div className="text-[10px] font-mono uppercase text-[#8E8B82]">Autosave Drafts</div>
                  <div className="text-base font-mono font-bold text-[#F5F3ED] mt-1">{storageStats.autosaveCount}</div>
                  <div className="text-[10px] text-[#8E8B82] font-mono mt-0.5">Auto recovery</div>
                </div>
              </div>

              {backupExportSuccess && (
                <div className="p-3 mb-4 bg-[#16221A] text-[#93D7AC] rounded-[2px] text-xs flex items-center gap-2 border border-[#2D4A38]">
                  <CheckCircle size={14} className="text-[#93D7AC]" />
                  <span>{language === 'ko' ? '백업 파일이 안전하게 다운로드되었습니다.' : 'Backup JSON exported successfully.'}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#23232A]">
                <div className="text-xs text-[#8E8B82] font-sans">
                  {language === 'ko' ? '전체 프로젝트 복원 및 진단' : 'Complete restore and diagnostics'}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleQuickExportBackup}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] border border-[#23232A] bg-[#141418] hover:bg-[#1A1A22] text-[#B8B5AC] hover:text-[#F5F3ED] font-medium text-xs transition-all cursor-pointer"
                  >
                    <Download size={13} className="text-[#C5A880]" />
                    <span>{language === 'ko' ? '빠른 백업' : 'Export Backup'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsBackupModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-[2px] bg-[#C5A880] hover:bg-[#D4B992] text-[#0A0A0C] font-semibold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    <FolderArchive size={13} />
                    <span>{language === 'ko' ? '백업 및 복원 허브' : 'Open Backup Hub'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-[#111116] rounded-[2px] p-6 sm:p-7 border border-[#23232A] text-[#F5F3ED]"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-[#23232A] pb-4">
                <div className="p-2 bg-[#141418] text-[#C5A880] rounded-[2px] border border-[#23232A]">
                  <Zap size={18} />
                </div>
                <h2 className="text-base font-semibold uppercase tracking-wider">{t('usage_summary')}</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#8E8B82] mb-1">{t('total_api_calls')}</div>
                  <div className="text-3xl font-mono font-bold text-[#F5F3ED] flex items-baseline gap-2">
                    {userStats.totalApiCalls}
                    <span className="text-xs font-mono text-[#8E8B82]">Calls</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#23232A]">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#8E8B82] mb-1">Architecture Model</div>
                  <div className="text-xl font-mono font-bold text-[#C5A880] flex items-center gap-1.5">
                    100% Free
                  </div>
                  <div className="mt-2 text-[11px] text-[#B8B5AC] leading-relaxed font-sans">
                    Open software for individuals. Free BYOK (Gemini), in-browser WebLLM, or offline inference (Ollama).
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <LocalBackupModal isOpen={isBackupModalOpen} onClose={() => {
        setIsBackupModalOpen(false);
        setStorageStats(getStorageUsageStats());
      }} />
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={async () => {
          await auth.signOut();
          navigate('/login', { replace: true, state: null });
        }}
        userName={displayName}
      />
    </div>
  );
}
