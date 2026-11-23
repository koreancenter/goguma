import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  CheckCircle,
  AlertTriangle,
  Download,
  FolderArchive,
  LogOut,
  UserPlus,
  ArrowRight,
  Trash2,
} from 'lucide-react';
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
import {
  auth,
  updateProfile,
  LocalUser,
  DEFAULT_DIRECTOR_PROFILE,
} from '../../../lib/localAuth';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTabItem,
} from '../layout/EditorialPageLayout';

export default function MyAccount() {
  const { t, language, pick } = useLanguage();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(() => auth.currentUser);
  const [savedProfiles, setSavedProfiles] = useState<LocalUser[]>(() => auth.getSavedProfiles());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [userStats, setUserStats] = useState({ totalApiCalls: 0 });
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');

  // New local profile inline creation state
  const [isAddProfileOpen, setIsAddProfileOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileEmail, setNewProfileEmail] = useState('');
  const [newProfileTeam, setNewProfileTeam] = useState('');
  const [newProfilePin, setNewProfilePin] = useState('');
  const [profileActionMsg, setProfileActionMsg] = useState('');
  const [profileActionError, setProfileActionError] = useState('');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const [storageStats, setStorageStats] = useState(getStorageUsageStats);
  const [backupExportSuccess, setBackupExportSuccess] = useState(false);

  const accountTabs: EditorialTabItem[] = [
    {
      id: 'profile',
      label: pick({ ko: '내 계정 및 프로필', en: 'Account & Profile', ja: 'アカウント・プロフィール', id: 'Akun & Profil' }),
      to: '/profile',
    },
    {
      id: 'settings',
      label: pick({ ko: '환경 설정', en: 'Preferences', ja: '環境設定', id: 'Preferensi' }),
      to: '/settings?tab=engine',
    },
    {
      id: 'backup',
      label: pick({ ko: '보관함 및 로컬 백업', en: 'Vault & Local Backup', ja: '保管庫・ローカルバックアップ', id: 'Brankas & Cadangan Lokal' }),
      to: '/backup?tab=storage',
    },
    {
      id: 'logout',
      label: pick({ ko: '로그아웃', en: 'Sign Out', ja: 'サインアウト', id: 'Keluar' }),
      to: '/logout',
    },
  ];

  const loadAccountData = useCallback(async (user: LocalUser | null) => {
    setSavedProfiles(auth.getSavedProfiles());
    if (!user) {
      setLoading(false);
      return;
    }

    setDisplayName(user.displayName || '');
    setCompanyName(user.companyName || '');
    setRole(user.role || 'USER');

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role) setRole(userData.role);
        if (userData.companyName) setCompanyName(userData.companyName);
        if (userData.displayName) setDisplayName(userData.displayName);
      }

      const statsDoc = await getDoc(doc(db, 'user_stats', user.uid));
      if (statsDoc.exists()) {
        setUserStats(statsDoc.data() as any);
      } else {
        setUserStats({ totalApiCalls: 0 });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      setUserStats({ totalApiCalls: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      loadAccountData(user);
    });
    setStorageStats(getStorageUsageStats());
    return unsubscribe;
  }, [loadAccountData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      const trimmedName = displayName.trim();
      const trimmedCompany = companyName.trim();
      const nameRegex = /^[a-zA-Z0-9가-힣\s_-]{2,30}$/;
      if (!nameRegex.test(trimmedName)) {
        setError(t('full_name_hint'));
        setSaving(false);
        return;
      }

      await updateProfile(user, {
        displayName: trimmedName,
        companyName: trimmedCompany,
      });
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: trimmedName,
        companyName: trimmedCompany,
      });

      setSavedProfiles(auth.getSavedProfiles());
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(
        err.message ||
          pick({
            ko: '프로필 업데이트에 실패했습니다.',
            en: 'Failed to update profile.',
            ja: 'プロフィールの更新に失敗しました。',
            id: 'Gagal memperbarui profil.',
          })
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSwitchProfile = async (profile: LocalUser) => {
    setProfileActionError('');
    setProfileActionMsg('');
    try {
      await auth.signInWithProfile(profile);
      setSavedProfiles(auth.getSavedProfiles());
      setProfileActionMsg(
        pick({
          ko: `'${profile.displayName}' 프로필로 전환되었습니다.`,
          en: `Switched to '${profile.displayName}' profile.`,
          ja: `「${profile.displayName}」プロフィールに切り替えました。`,
          id: `Beralih ke profil '${profile.displayName}'.`,
        })
      );
      setTimeout(() => setProfileActionMsg(''), 3000);
    } catch (err: any) {
      setProfileActionError(
        err?.message ||
          pick({
            ko: '프로필 전환에 실패했습니다.',
            en: 'Failed to switch profile.',
            ja: 'プロフィールの切り替えに失敗しました。',
            id: 'Gagal beralih profil.',
          })
      );
    }
  };

  const handleRemoveProfile = (profile: LocalUser) => {
    if (profile.uid === currentUser?.uid) return;
    auth.removeSavedProfile(profile.uid);
    setSavedProfiles(auth.getSavedProfiles());
    setProfileActionMsg(
      pick({
        ko: `'${profile.displayName}' 프로필이 목록에서 제거되었습니다.`,
        en: `Removed '${profile.displayName}' from saved profiles.`,
        ja: `「${profile.displayName}」を保存済みリストから削除しました。`,
        id: `Profil '${profile.displayName}' dihapus dari daftar.`,
      })
    );
    setTimeout(() => setProfileActionMsg(''), 3000);
  };

  const handleAddNewProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) {
      setProfileActionError(
        pick({
          ko: '새 프로필의 이름 또는 닉네임을 입력해 주세요.',
          en: 'Please enter a name or nickname for the new profile.',
          ja: '新しいプロフィールの名前またはニックネームを入力してください。',
          id: 'Masukkan nama atau nama panggilan untuk profil baru.',
        })
      );
      return;
    }

    setIsCreatingProfile(true);
    setProfileActionError('');
    setProfileActionMsg('');
    try {
      const created = await auth.signInLocal({
        displayName: newProfileName.trim(),
        email: newProfileEmail.trim() || undefined,
        companyName: newProfileTeam.trim() || undefined,
        pin: newProfilePin.trim() || undefined,
        rememberMe: true,
        role: 'ADMIN',
      });
      setNewProfileName('');
      setNewProfileEmail('');
      setNewProfileTeam('');
      setNewProfilePin('');
      setIsAddProfileOpen(false);
      setSavedProfiles(auth.getSavedProfiles());
      setProfileActionMsg(
        pick({
          ko: `새 로컬 프로필 '${created.displayName}'이(가) 생성되어 활성화되었습니다.`,
          en: `Created and activated new local profile '${created.displayName}'.`,
          ja: `新しいローカルプロフィール「${created.displayName}」を作成し有効化しました。`,
          id: `Profil lokal baru '${created.displayName}' dibuat dan diaktifkan.`,
        })
      );
      setTimeout(() => setProfileActionMsg(''), 4000);
    } catch (err: any) {
      setProfileActionError(
        err?.message ||
          pick({
            ko: '새 로컬 프로필 생성에 실패했습니다.',
            en: 'Failed to create new local profile.',
            ja: '新しいローカルプロフィールの作成に失敗しました。',
            id: 'Gagal membuat profil lokal baru.',
          })
      );
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const handleQuickExportBackup = () => {
    exportAllLocalData();
    setBackupExportSuccess(true);
    setTimeout(() => setBackupExportSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px] bg-[var(--theme-canvas)]">
        <div className="w-8 h-8 border-2 border-[var(--theme-border-hairline)] border-t-[var(--theme-ink-strong)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <EditorialPageLayout
      category="IDENTITY & LOCAL STORAGE"
      title={t('my_account')}
      subtitle={pick({
        ko: '개인 프로필 정보 및 로컬 데이터베이스 스토리지를 관리합니다.',
        en: 'Manage your local profile identity and on-device storage backup.',
        ja: '個人プロフィール情報とローカルデータベースストレージを管理します。',
        id: 'Kelola identitas profil lokal dan cadangan penyimpanan perangkat Anda.',
      })}
      tabs={accountTabs}
      activeTabId="profile"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Left Main Columns */}
        <div className="lg:col-span-8 space-y-12">
          <EditorialSection chapter={t('update_profile')}>
            <form onSubmit={handleSave} className="space-y-6 bg-[var(--theme-elevated)] border border-[var(--theme-ink-strong)] rounded-none p-7 sm:p-10">
              {currentUser?.isAnonymous && (
                <div className="p-4 bg-[var(--theme-stage)] border border-[var(--theme-ink-strong)] flex flex-wrap items-center justify-between gap-4">
                  <span className="text-[16px] font-semibold text-[var(--theme-ink-primary)]">
                    {pick({
                      ko: '현재 익명 게스트 세션입니다. 정식 로컬 디렉터 프로필로 등록하면 브라우저에 영구 저장됩니다.',
                      en: 'You are currently in an anonymous guest session. Register a permanent local director profile to save it in your browser.',
                      ja: '現在は匿名ゲストセッションです。正式なローカルディレクタープロフィールを登録するとブラウザに永続保存されます。',
                      id: 'Anda sedang dalam sesi tamu anonim. Daftarkan profil direktur lokal permanen untuk menyimpannya di browser.',
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/create-account')}
                    className="px-4 py-2 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-[15px] font-bold rounded-none transition-colors cursor-pointer shrink-0"
                  >
                    {pick({
                      ko: '정식 프로필 등록',
                      en: 'Register Profile',
                      ja: '正式プロフィール登録',
                      id: 'Daftarkan Profil',
                    })}
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[17px] font-extrabold text-[var(--theme-ink-strong)]">
                  {t('company_name')} <span className="font-normal text-[var(--theme-ink-secondary)]">({t('optional')})</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] rounded-none text-[18px] text-[var(--theme-ink-strong)] placeholder-[var(--theme-ink-muted)] outline-none transition-colors"
                  placeholder="Personal Workspace"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[17px] font-extrabold text-[var(--theme-ink-strong)]">
                  {t('full_name')}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] rounded-none text-[18px] text-[var(--theme-ink-strong)] placeholder-[var(--theme-ink-muted)] outline-none transition-colors"
                  placeholder="Architect Name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[17px] font-extrabold text-[var(--theme-ink-strong)]">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={currentUser?.email || ''}
                  disabled
                  className="w-full px-4 py-3.5 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] rounded-none text-[18px] text-[var(--theme-ink-secondary)] cursor-not-allowed outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[var(--theme-border-hairline)]">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-4 py-2 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] text-[16px] font-bold text-[var(--theme-ink-strong)]">
                    {role === 'ADMIN'
                      ? pick({ ko: '디렉터 (관리자)', en: 'Director (Admin)', ja: 'ディレクター（管理者）', id: 'Direktur (Admin)' })
                      : pick({ ko: '게스트 / 멤버', en: 'Guest / Member', ja: 'ゲスト / メンバー', id: 'Tamu / Anggota' })}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/logout')}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--theme-ink-strong)] bg-[var(--theme-canvas)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-ink-strong)] rounded-none text-[16px] font-bold transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>{pick({ ko: '로그아웃', en: 'Sign Out', ja: 'サインアウト', id: 'Keluar' })}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] disabled:opacity-50 text-[var(--theme-btn-text)] rounded-none font-bold text-[17px] transition-colors cursor-pointer"
                >
                  <Save size={17} />
                  <span>{t('save_changes')}</span>
                </button>
              </div>

              {success && (
                <div className="p-4 bg-[var(--theme-success-bg)] border border-[var(--theme-success)] text-[var(--theme-success)] text-[17px] font-bold flex items-center gap-2">
                  <CheckCircle size={18} />
                  <span>{t('profile_updated')}</span>
                </div>
              )}

              {error && (
                <div className="p-4 bg-[var(--theme-danger-bg)] border border-[var(--theme-danger)] text-[var(--theme-danger)] text-[17px] font-bold flex items-center gap-2">
                  <AlertTriangle size={18} />
                  <span>{error}</span>
                </div>
              )}
            </form>
          </EditorialSection>

          <EditorialSection
            chapter={pick({
              ko: '로컬 작업자 프로필 전환 및 추가',
              en: 'Switch or Add Local Worker Profiles',
              ja: 'ローカル作業者プロフィールの切替・追加',
              id: 'Ganti atau Tambah Profil Pekerja Lokal',
            })}
          >
            <div className="bg-[var(--theme-elevated)] border border-[var(--theme-ink-strong)] rounded-none p-7 sm:p-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-[17px] text-[var(--theme-ink-body)] leading-[1.7] max-w-xl">
                  {pick({
                    ko: '같은 브라우저에 저장된 다른 로컬 작업자 프로필로 전환하거나 새 프로필을 추가합니다. 작성 중인 기획 데이터는 그대로 유지됩니다.',
                    en: 'Switch between saved local worker profiles or add a new one. Your local workspace drafts remain intact.',
                    ja: '同じブラウザに保存された他のローカル作業者プロフィールに切り替えるか、新しいプロフィールを追加します。作成中の企画データはそのまま維持されます。',
                    id: 'Beralih antar profil pekerja lokal yang tersimpan di browser ini atau tambahkan profil baru. Draf spesifikasi Anda tetap aman.',
                  })}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddProfileOpen((prev) => !prev);
                    setProfileActionError('');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-[var(--theme-ink-strong)] bg-[var(--theme-canvas)] hover:bg-[var(--theme-btn-bg)] hover:text-[var(--theme-btn-text)] text-[var(--theme-ink-strong)] rounded-none text-[16px] font-bold transition-colors cursor-pointer shrink-0"
                >
                  <UserPlus size={16} />
                  <span>
                    {isAddProfileOpen
                      ? pick({ ko: '추가 폼 닫기', en: 'Close Form', ja: 'フォームを閉じる', id: 'Tutup Formulir' })
                      : pick({ ko: '새 로컬 프로필 추가', en: 'Add Local Profile', ja: '新規ローカルプロフィール追加', id: 'Tambah Profil Lokal' })}
                  </span>
                </button>
              </div>

              {profileActionMsg && (
                <div className="p-4 bg-[var(--theme-success-bg)] text-[var(--theme-success)] border border-[var(--theme-success)] text-[16px] font-bold flex items-center gap-2">
                  <CheckCircle size={17} />
                  <span>{profileActionMsg}</span>
                </div>
              )}

              {profileActionError && (
                <div className="p-4 bg-[var(--theme-danger-bg)] text-[var(--theme-danger)] border border-[var(--theme-danger)] text-[16px] font-bold flex items-center gap-2">
                  <AlertTriangle size={17} />
                  <span>{profileActionError}</span>
                </div>
              )}

              {isAddProfileOpen && (
                <form
                  onSubmit={handleAddNewProfile}
                  className="p-6 bg-[var(--theme-stage)] border border-[var(--theme-ink-strong)] space-y-5"
                >
                  <div className="text-[17px] font-extrabold text-[var(--theme-ink-strong)]">
                    {pick({
                      ko: '새 로컬 디렉터 프로필 생성 및 즉시 전환',
                      en: 'Create & Switch to New Local Director Profile',
                      ja: '新規ローカルディレクタープロフィールの作成・即時切替',
                      id: 'Buat & Beralih ke Profil Direktur Lokal Baru',
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[15px] font-bold text-[var(--theme-ink-strong)]">
                        {pick({ ko: '이름 / 닉네임 *', en: 'Name / Nickname *', ja: '氏名 / ニックネーム *', id: 'Nama / Panggilan *' })}
                      </label>
                      <input
                        type="text"
                        required
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        placeholder={pick({
                          ko: '예: 김기획 디렉터',
                          en: 'e.g., Alex Lead Architect',
                          ja: '例：佐藤プランニングディレクター',
                          id: 'cth., Budi Arsitek Utama',
                        })}
                        className="w-full px-3.5 py-2.5 bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] text-[var(--theme-ink-strong)] placeholder-[var(--theme-ink-muted)] rounded-none text-[17px] outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[15px] font-bold text-[var(--theme-ink-strong)]">
                        {pick({ ko: '이메일 (선택)', en: 'Email (Optional)', ja: 'メール（任意）', id: 'Email (Opsional)' })}
                      </label>
                      <input
                        type="email"
                        value={newProfileEmail}
                        onChange={(e) => setNewProfileEmail(e.target.value)}
                        placeholder="planner@studio.local"
                        className="w-full px-3.5 py-2.5 bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] text-[var(--theme-ink-strong)] placeholder-[var(--theme-ink-muted)] rounded-none text-[17px] outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[15px] font-bold text-[var(--theme-ink-strong)]">
                        {pick({ ko: '소속 / 팀명 (선택)', en: 'Team / Studio (Optional)', ja: '所属 / チーム名（任意）', id: 'Tim / Studio (Opsional)' })}
                      </label>
                      <input
                        type="text"
                        value={newProfileTeam}
                        onChange={(e) => setNewProfileTeam(e.target.value)}
                        placeholder="Goguma Studio"
                        className="w-full px-3.5 py-2.5 bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] text-[var(--theme-ink-strong)] placeholder-[var(--theme-ink-muted)] rounded-none text-[17px] outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[15px] font-bold text-[var(--theme-ink-strong)]">
                        {pick({ ko: '보안 PIN (선택)', en: 'Security PIN (Optional)', ja: 'セキュリティPIN（任意）', id: 'PIN Keamanan (Opsional)' })}
                      </label>
                      <input
                        type="password"
                        value={newProfilePin}
                        onChange={(e) => setNewProfilePin(e.target.value)}
                        placeholder={pick({ ko: '4자리 숫자', en: '4-digit PIN', ja: '4桁の数字', id: 'PIN 4 digit' })}
                        maxLength={8}
                        className="w-full px-3.5 py-2.5 bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] text-[var(--theme-ink-strong)] placeholder-[var(--theme-ink-muted)] rounded-none text-[17px] outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddProfileOpen(false)}
                      className="px-4 py-2.5 border border-[var(--theme-border-strong)] bg-[var(--theme-canvas)] hover:border-[var(--theme-ink-strong)] text-[15px] font-bold text-[var(--theme-ink-strong)] rounded-none cursor-pointer"
                    >
                      {pick({ ko: '취소', en: 'Cancel', ja: 'キャンセル', id: 'Batal' })}
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingProfile}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] disabled:opacity-50 text-[var(--theme-btn-text)] text-[15px] font-bold rounded-none transition-colors cursor-pointer"
                    >
                      <span>
                        {isCreatingProfile
                          ? pick({ ko: '생성 중...', en: 'Creating...', ja: '作成中...', id: 'Membuat...' })
                          : pick({ ko: '생성 및 전환', en: 'Create & Switch', ja: '作成して切替', id: 'Buat & Beralih' })}
                      </span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </form>
              )}

              <div className="divide-y divide-[var(--theme-border-hairline)] border-y border-[var(--theme-border-hairline)]">
                {savedProfiles.map((profile) => {
                  const isActive = currentUser?.uid === profile.uid;
                  const isDefaultProfile = profile.uid === DEFAULT_DIRECTOR_PROFILE.uid;

                  return (
                    <div
                      key={profile.uid}
                      className="py-4 flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-none font-bold text-[18px] flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)]'
                              : 'bg-[var(--theme-stage)] border border-[var(--theme-border-strong)] text-[var(--theme-ink-strong)]'
                          }`}
                        >
                          {(profile.displayName || 'D')[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[18px] font-extrabold text-[var(--theme-ink-strong)] truncate">
                              {profile.displayName || pick({ ko: '로컬 디렉터', en: 'Local Director', ja: 'ローカルディレクター', id: 'Direktur Lokal' })}
                            </span>
                            {isActive && (
                              <span className="px-2 py-0.5 bg-[var(--theme-btn-bg)] text-[var(--theme-btn-text)] text-[12px] font-bold">
                                {pick({ ko: '현재 세션', en: 'Active Session', ja: '現在のセッション', id: 'Sesi Aktif' })}
                              </span>
                            )}
                          </div>
                          <div className="text-[15px] text-[var(--theme-ink-secondary)] truncate mt-0.5">
                            {profile.email || pick({ ko: '로컬 독립 프로필', en: 'Independent Local Profile', ja: 'ローカル独立プロフィール', id: 'Profil Lokal Independen' })} ·{' '}
                            {profile.companyName || pick({ ko: '독립 스튜디오', en: 'Independent Studio', ja: '独立スタジオ', id: 'Studio Independen' })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => handleSwitchProfile(profile)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-[15px] font-bold rounded-none transition-colors cursor-pointer"
                          >
                            <span>{pick({ ko: '전환', en: 'Switch', ja: '切替', id: 'Beralih' })}</span>
                            <ArrowRight size={14} />
                          </button>
                        )}
                        {!isActive && !isDefaultProfile && (
                          <button
                            type="button"
                            onClick={() => handleRemoveProfile(profile)}
                            className="p-2 border border-[var(--theme-border-strong)] hover:border-[var(--theme-danger)] hover:text-[var(--theme-danger)] text-[var(--theme-ink-secondary)] rounded-none transition-colors cursor-pointer"
                            aria-label={`${profile.displayName} ${pick({ ko: '프로필 삭제', en: 'Remove profile', ja: 'プロフィール削除', id: 'Hapus profil' })}`}
                            title={pick({ ko: '프로필 삭제', en: 'Remove Profile', ja: 'プロフィール削除', id: 'Hapus Profil' })}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </EditorialSection>

          <EditorialSection
            chapter={pick({
              ko: '로컬 데이터 및 백업 허브',
              en: 'Local Data & Backup Hub',
              ja: 'ローカルデータ・バックアップハブ',
              id: 'Data Lokal & Pusat Cadangan',
            })}
          >
            <div className="bg-[var(--theme-elevated)] border border-[var(--theme-ink-strong)] rounded-none p-7 sm:p-10 space-y-6">
              <p className="text-[18px] sm:text-[19px] text-[var(--theme-ink-body)] leading-[1.75]">
                {pick({
                  ko: '기획안과 AI 설정은 브라우저 로컬 저장소에 안전하게 보관됩니다. (OFFLINE FIRST)',
                  en: 'All architecture projects and settings are stored locally on your device. (OFFLINE FIRST)',
                  ja: '企画書とAI設定はブラウザのローカルストレージに安全に保存されます。（OFFLINE FIRST）',
                  id: 'Semua proyek spesifikasi dan pengaturan AI disimpan secara lokal di perangkat Anda. (OFFLINE FIRST)',
                })}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)]">
                  <div className="text-[14px] font-bold uppercase tracking-wider text-[var(--theme-ink-secondary)]">
                    {pick({ ko: '저장소 사용량', en: 'Storage Used', ja: 'ストレージ使用量', id: 'Penyimpanan Terpakai' })}
                  </div>
                  <div className="text-[26px] font-extrabold tabular-nums text-[var(--theme-ink-strong)] mt-1">
                    {storageStats.formattedSize}
                  </div>
                </div>

                <div className="p-5 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)]">
                  <div className="text-[14px] font-bold uppercase tracking-wider text-[var(--theme-ink-secondary)]">
                    {pick({ ko: '저장된 프로젝트', en: 'Saved Projects', ja: '保存済みプロジェクト', id: 'Proyek Tersimpan' })}
                  </div>
                  <div className="text-[26px] font-extrabold tabular-nums text-[var(--theme-ink-strong)] mt-1">
                    {storageStats.projectCount}
                  </div>
                </div>

                <div className="p-5 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)]">
                  <div className="text-[14px] font-bold uppercase tracking-wider text-[var(--theme-ink-secondary)]">
                    {pick({ ko: '자동 저장 초안', en: 'Autosave Drafts', ja: '自動保存下書き', id: 'Draf Simpan Otomatis' })}
                  </div>
                  <div className="text-[26px] font-extrabold tabular-nums text-[var(--theme-ink-strong)] mt-1">
                    {storageStats.autosaveCount}
                  </div>
                </div>
              </div>

              {backupExportSuccess && (
                <div className="p-4 bg-[var(--theme-success-bg)] text-[var(--theme-success)] border border-[var(--theme-success)] text-[17px] font-bold flex items-center gap-2">
                  <CheckCircle size={18} />
                  <span>
                    {pick({
                      ko: '백업 파일이 안전하게 다운로드되었습니다.',
                      en: 'Backup JSON exported successfully.',
                      ja: 'バックアップJSONが正常にエクスポートされました。',
                      id: 'File cadangan JSON berhasil diekspor.',
                    })}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[var(--theme-border-hairline)]">
                <span className="text-[17px] text-[var(--theme-ink-secondary)]">
                  {pick({
                    ko: '전체 프로젝트 복원 및 진단',
                    en: 'Complete restore and diagnostics',
                    ja: '全プロジェクトの復元および診断',
                    id: 'Pemulihan lengkap & diagnostik',
                  })}
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleQuickExportBackup}
                    className="inline-flex items-center gap-2 px-5 py-3 border border-[var(--theme-ink-strong)] bg-[var(--theme-canvas)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-ink-strong)] rounded-none font-bold text-[17px] transition-colors cursor-pointer"
                  >
                    <Download size={16} />
                    <span>{pick({ ko: '빠른 백업', en: 'Export Backup', ja: 'クイックバックアップ', id: 'Ekspor Cadangan' })}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/backup')}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] rounded-none font-bold text-[17px] transition-colors cursor-pointer"
                  >
                    <FolderArchive size={16} />
                    <span>{pick({ ko: '백업 및 복원 허브', en: 'Open Backup Hub', ja: 'バックアップ・復元ハブ', id: 'Buka Pusat Cadangan' })}</span>
                  </button>
                </div>
              </div>
            </div>
          </EditorialSection>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-4 space-y-6">
          <EditorialSection chapter={t('usage_summary')}>
            <div className="bg-[var(--theme-stage)] border border-[var(--theme-ink-strong)] rounded-none p-7 sm:p-8 space-y-8">
              <div>
                <div className="text-[15px] font-bold uppercase tracking-widest text-[var(--theme-ink-secondary)] mb-2">
                  {t('total_api_calls')}
                </div>
                <div className="text-[36px] font-extrabold tabular-nums text-[var(--theme-ink-strong)] flex items-baseline gap-2">
                  {userStats.totalApiCalls}
                  <span className="text-[18px] font-semibold text-[var(--theme-ink-secondary)]">Calls</span>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--theme-border-hairline)] space-y-2">
                <div className="text-[15px] font-bold uppercase tracking-widest text-[var(--theme-ink-secondary)]">
                  {pick({ ko: '아키텍처 모델', en: 'Architecture Model', ja: 'アーキテクチャモデル', id: 'Model Arsitektur' })}
                </div>
                <div className="text-[28px] font-extrabold text-[var(--theme-ink-strong)]">
                  100% Free
                </div>
                <p className="text-[17px] text-[var(--theme-ink-body)] leading-[1.75]">
                  {pick({
                    ko: '개인 사용자를 위한 오픈 소프트웨어입니다. 무료 Gemini BYOK, 브라우저 내장 WebLLM, 또는 오프라인 추론(Ollama)을 지원합니다.',
                    en: 'Open software for individuals. Free BYOK (Gemini), in-browser WebLLM, or offline inference (Ollama).',
                    ja: '個人向けのオープンソフトウェアです。無料BYOK（Gemini）、ブラウザ内WebLLM、またはオフライン推論（Ollama）に対応しています。',
                    id: 'Perangkat lunak terbuka untuk individu. Mendukung BYOK gratis (Gemini), WebLLM di browser, atau inferensi offline (Ollama).',
                  })}
                </p>
              </div>
            </div>
          </EditorialSection>
        </div>
      </div>
    </EditorialPageLayout>
  );
}
