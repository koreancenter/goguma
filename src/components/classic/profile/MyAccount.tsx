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
    try {
      const backupData = exportAllLocalData();
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `goguma-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupExportSuccess(true);
      setTimeout(() => setBackupExportSuccess(false), 3000);
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-goguma/20 border-t-goguma rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-black text-slate-900 mb-2">{t('my_account')}</h1>
        <p className="text-slate-500 font-medium">
          {language === 'ko' 
            ? '개인 프로필 정보 및 로컬 데이터베이스 스토리지를 관리합니다.' 
            : 'Manage your local profile identity and on-device storage backup.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="md:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-fuchsia-50 text-goguma rounded-xl">
                <User size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900">{t('update_profile')}</h2>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  {t('company_name')} <span className="text-slate-300 normal-case font-medium">({t('optional')})</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-goguma/20 transition-all outline-none"
                    placeholder="Personal Workspace"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  {t('full_name')}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-goguma/20 transition-all outline-none"
                    placeholder="Architect Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  {t('email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="email"
                    value={auth.currentUser?.email || ''}
                    disabled
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-400 cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl font-bold text-xs text-slate-600">
                    <Shield size={14} />
                    <span>{role === 'ADMIN' ? '디렉터 (관리자)' : '게스트/멤버'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>세션 잠금 / 로그아웃</span>
                  </button>
                </div>
                
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                  {t('save_changes')}
                </button>
              </div>

              {success && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mt-4 flex items-center gap-2 p-4 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-sm"
                >
                  <CheckCircle size={18} />
                  {t('profile_updated')}
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mt-4 flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm"
                >
                  <AlertTriangle size={18} />
                  {error}
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Local-First Security & Storage Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {language === 'ko' ? '로컬 데이터 및 백업 허브' : 'Local Data & Backup Hub'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {language === 'ko' 
                      ? '기획안과 AI 설정은 브라우저 로컬 저장소에 안전하게 보관됩니다.'
                      : 'All architecture projects and settings are stored locally on your device.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>OFFLINE FIRST</span>
              </div>
            </div>

            {/* Storage metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-black uppercase text-slate-400">Storage Used</div>
                <div className="text-lg font-black text-slate-900 mt-1">{storageStats.formattedSize}</div>
                <div className="text-[11px] text-slate-500">Local sandbox</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-black uppercase text-slate-400">Saved Projects</div>
                <div className="text-lg font-black text-slate-900 mt-1">{storageStats.projectCount}</div>
                <div className="text-[11px] text-slate-500">Active records</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-black uppercase text-slate-400">Autosave Drafts</div>
                <div className="text-lg font-black text-slate-900 mt-1">{storageStats.autosaveCount}</div>
                <div className="text-[11px] text-slate-500">Auto recovery</div>
              </div>
            </div>

            {backupExportSuccess && (
              <div className="p-3 mb-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
                <CheckCircle size={15} className="text-emerald-600" />
                <span>{language === 'ko' ? '백업 파일이 안전하게 다운로드되었습니다.' : 'Backup JSON exported successfully.'}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500 font-medium">
                {language === 'ko' ? '전체 프로젝트 복원 및 진단' : 'Complete restore and diagnostics'}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleQuickExportBackup}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all shadow-2xs"
                >
                  <Download size={14} />
                  <span>{language === 'ko' ? '빠른 백업' : 'Export Backup'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBackupModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-goguma hover:bg-fuchsia-950 text-white font-bold text-xs transition-all shadow-xs"
                >
                  <FolderArchive size={14} />
                  <span>{language === 'ko' ? '백업 및 복원 허브 열기' : 'Open Backup Hub'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 rounded-3xl p-8 text-white"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-white/10 text-white rounded-xl">
                <Zap size={20} />
              </div>
              <h2 className="text-xl font-black">{t('usage_summary')}</h2>
            </div>

            <div className="space-y-8">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">{t('total_api_calls')}</div>
                <div className="text-4xl font-black flex items-baseline gap-2">
                  {userStats.totalApiCalls}
                  <span className="text-sm font-medium text-white/40">Calls</span>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Architecture Model</div>
                <div className="text-2xl font-black text-emerald-400 flex items-center gap-1.5">
                  100% Free
                </div>
                <div className="mt-2 text-[10px] font-medium text-white/40 leading-relaxed">
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
    </>
  );
}
