import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, CheckCircle, AlertTriangle, Download, FolderArchive, LogOut } from 'lucide-react';
import {
  db,
  handleFirestoreError,
  OperationType,
  doc,
  getDoc,
  updateDoc,
  getStorageUsageStats,
  exportAllLocalData,
} from '../../../lib/localDb';
import { auth, updateProfile } from '../../../lib/localAuth';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTabItem,
} from '../layout/EditorialPageLayout';

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

  const [storageStats, setStorageStats] = useState(getStorageUsageStats);
  const [backupExportSuccess, setBackupExportSuccess] = useState(false);

  const accountTabs: EditorialTabItem[] = [
    { id: 'profile', label: '내 계정 및 프로필', to: '/profile' },
    { id: 'settings', label: '환경 설정', to: '/settings?tab=engine' },
    { id: 'backup', label: '보관함 및 로컬 백업', to: '/backup?tab=storage' },
    { id: 'logout', label: '로그아웃', to: '/logout' },
  ];

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
      <div className="flex items-center justify-center min-h-[420px] bg-[#FFFFFF]">
        <div className="w-8 h-8 border-2 border-[#E4E2DC] border-t-[#000000] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <EditorialPageLayout
      category="IDENTITY & LOCAL STORAGE"
      title={t('my_account')}
      subtitle={
        language === 'ko'
          ? '개인 프로필 정보 및 로컬 데이터베이스 스토리지를 관리합니다.'
          : 'Manage your local profile identity and on-device storage backup.'
      }
      tabs={accountTabs}
      activeTabId="profile"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Left Main Columns */}
        <div className="lg:col-span-8 space-y-12">
          <EditorialSection chapter={t('update_profile')}>
            <form onSubmit={handleSave} className="space-y-6 bg-[#FFFFFF] border border-[#000000] rounded-none p-7 sm:p-10">
              <div className="space-y-2">
                <label className="block text-[17px] font-extrabold text-[#000000]">
                  {t('company_name')} <span className="font-normal text-[#52524E]">({t('optional')})</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] rounded-none text-[18px] text-[#000000] placeholder-[#8C8B85] outline-none transition-colors"
                  placeholder="Personal Workspace"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[17px] font-extrabold text-[#000000]">
                  {t('full_name')}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] rounded-none text-[18px] text-[#000000] placeholder-[#8C8B85] outline-none transition-colors"
                  placeholder="Architect Name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[17px] font-extrabold text-[#000000]">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={auth.currentUser?.email || ''}
                  disabled
                  className="w-full px-4 py-3.5 bg-[#F6F5F1] border border-[#E4E2DC] rounded-none text-[18px] text-[#52524E] cursor-not-allowed outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[#E4E2DC]">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-4 py-2 bg-[#F6F5F1] border border-[#E4E2DC] text-[16px] font-bold text-[#000000]">
                    {role === 'ADMIN' ? '디렉터 (관리자)' : '게스트 / 멤버'}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/logout')}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-[#000000] bg-[#FFFFFF] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#000000] rounded-none text-[16px] font-bold transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>로그아웃</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] disabled:opacity-50 text-[#FFFFFF] rounded-none font-bold text-[17px] transition-colors cursor-pointer"
                >
                  <Save size={17} />
                  <span>{t('save_changes')}</span>
                </button>
              </div>

              {success && (
                <div className="p-4 bg-[#F3F7F4] border border-[#1F5132] text-[#1F5132] text-[17px] font-bold flex items-center gap-2">
                  <CheckCircle size={18} />
                  <span>{t('profile_updated')}</span>
                </div>
              )}

              {error && (
                <div className="p-4 bg-[#FEF2F2] border border-[#DC2626] text-[#DC2626] text-[17px] font-bold flex items-center gap-2">
                  <AlertTriangle size={18} />
                  <span>{error}</span>
                </div>
              )}
            </form>
          </EditorialSection>

          <EditorialSection chapter={language === 'ko' ? '로컬 데이터 및 백업 허브' : 'Local Data & Backup Hub'}>
            <div className="bg-[#FFFFFF] border border-[#000000] rounded-none p-7 sm:p-10 space-y-6">
              <p className="text-[18px] sm:text-[19px] text-[#3F3F3C] leading-[1.75]">
                {language === 'ko'
                  ? '기획안과 AI 설정은 브라우저 로컬 저장소에 안전하게 보관됩니다. (OFFLINE FIRST)'
                  : 'All architecture projects and settings are stored locally on your device. (OFFLINE FIRST)'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-[#F6F5F1] border border-[#E4E2DC]">
                  <div className="text-[14px] font-bold uppercase tracking-wider text-[#52524E]">Storage Used</div>
                  <div className="text-[26px] font-extrabold tabular-nums text-[#000000] mt-1">
                    {storageStats.formattedSize}
                  </div>
                </div>

                <div className="p-5 bg-[#F6F5F1] border border-[#E4E2DC]">
                  <div className="text-[14px] font-bold uppercase tracking-wider text-[#52524E]">Saved Projects</div>
                  <div className="text-[26px] font-extrabold tabular-nums text-[#000000] mt-1">
                    {storageStats.projectCount}
                  </div>
                </div>

                <div className="p-5 bg-[#F6F5F1] border border-[#E4E2DC]">
                  <div className="text-[14px] font-bold uppercase tracking-wider text-[#52524E]">Autosave Drafts</div>
                  <div className="text-[26px] font-extrabold tabular-nums text-[#000000] mt-1">
                    {storageStats.autosaveCount}
                  </div>
                </div>
              </div>

              {backupExportSuccess && (
                <div className="p-4 bg-[#F3F7F4] text-[#1F5132] border border-[#1F5132] text-[17px] font-bold flex items-center gap-2">
                  <CheckCircle size={18} />
                  <span>{language === 'ko' ? '백업 파일이 안전하게 다운로드되었습니다.' : 'Backup JSON exported successfully.'}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[#E4E2DC]">
                <span className="text-[17px] text-[#52524E]">
                  {language === 'ko' ? '전체 프로젝트 복원 및 진단' : 'Complete restore and diagnostics'}
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleQuickExportBackup}
                    className="inline-flex items-center gap-2 px-5 py-3 border border-[#000000] bg-[#FFFFFF] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#000000] rounded-none font-bold text-[17px] transition-colors cursor-pointer"
                  >
                    <Download size={16} />
                    <span>{language === 'ko' ? '빠른 백업' : 'Export Backup'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/backup')}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] rounded-none font-bold text-[17px] transition-colors cursor-pointer"
                  >
                    <FolderArchive size={16} />
                    <span>{language === 'ko' ? '백업 및 복원 허브' : 'Open Backup Hub'}</span>
                  </button>
                </div>
              </div>
            </div>
          </EditorialSection>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-4 space-y-6">
          <EditorialSection chapter={t('usage_summary')}>
            <div className="bg-[#F6F5F1] border border-[#000000] rounded-none p-7 sm:p-8 space-y-8">
              <div>
                <div className="text-[15px] font-bold uppercase tracking-widest text-[#52524E] mb-2">
                  {t('total_api_calls')}
                </div>
                <div className="text-[36px] font-extrabold tabular-nums text-[#000000] flex items-baseline gap-2">
                  {userStats.totalApiCalls}
                  <span className="text-[18px] font-semibold text-[#52524E]">Calls</span>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E4E2DC] space-y-2">
                <div className="text-[15px] font-bold uppercase tracking-widest text-[#52524E]">
                  Architecture Model
                </div>
                <div className="text-[28px] font-extrabold text-[#000000]">
                  100% Free
                </div>
                <p className="text-[17px] text-[#3F3F3C] leading-[1.75]">
                  Open software for individuals. Free BYOK (Gemini), in-browser WebLLM, or offline inference (Ollama).
                </p>
              </div>
            </div>
          </EditorialSection>
        </div>
      </div>
    </EditorialPageLayout>
  );
}
