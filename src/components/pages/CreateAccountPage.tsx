import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, UserCheck, LogOut } from 'lucide-react';
import { auth, LocalUser } from '../../lib/localAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { EditorialPageLayout } from '../classic/layout/EditorialPageLayout';

export default function CreateAccountPage() {
  const navigate = useNavigate();
  const { pick } = useLanguage();
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(() => auth.currentUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [team, setTeam] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
  }, []);

  const isGuestSession = Boolean(currentUser?.isAnonymous);
  const isRegisteredSignedIn = Boolean(currentUser && !currentUser.isAnonymous);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(
        pick({
          ko: '계정 이름(작업자명)을 입력해 주세요.',
          en: 'Please enter an account name (worker name).',
          ja: 'アカウント名（作業者名）を入力してください。',
          id: 'Silakan masukkan nama akun (nama pekerja).',
        })
      );
      return;
    }
    setIsCreating(true);
    setError('');
    try {
      await auth.signInLocal({
        displayName: name.trim(),
        email: email.trim() || undefined,
        companyName: team.trim() || undefined,
        pin: pin.trim() || undefined,
        rememberMe: true,
        role: 'ADMIN',
      });
      navigate('/workspace');
    } catch (err: any) {
      setError(
        err?.message ||
          pick({
            ko: '로컬 계정 생성에 실패했습니다.',
            en: 'Failed to create local account.',
            ja: 'ローカルアカウントの作成に失敗しました。',
            id: 'Gagal membuat akun lokal.',
          })
      );
    } finally {
      setIsCreating(false);
    }
  };

  if (isRegisteredSignedIn && currentUser) {
    return (
      <EditorialPageLayout
        category="LOCAL-FIRST IDENTITY"
        title={pick({
          ko: '이미 로컬 계정으로 로그인되어 있습니다',
          en: 'You are already signed in with a local account',
          ja: 'すでにローカルアカウントでサインインしています',
          id: 'Anda sudah masuk dengan akun lokal',
        })}
        subtitle={pick({
          ko: '현재 작업자 세션이 활성화되어 있습니다. 프로필 수정·전환·추가는 내 계정 화면에서 바로 관리할 수 있습니다.',
          en: 'Your local worker session is active. Edit, switch, or add profiles directly in My Account.',
          ja: '現在の作業者セッションは有効です。プロフィールの編集・切替・追加は「マイアカウント」画面で直接管理できます。',
          id: 'Sesi pekerja Anda sedang aktif. Ubah, ganti, atau tambah profil langsung di halaman Akun Saya.',
        })}
        maxWidthClass="max-w-4xl"
      >
        <div className="border border-[var(--theme-ink-strong)] bg-[var(--theme-elevated)] p-8 sm:p-12 space-y-8">
          <div className="p-6 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] flex items-start gap-5">
            <div className="w-12 h-12 rounded-none bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] font-extrabold text-[22px] flex items-center justify-center shrink-0">
              {(currentUser.displayName || 'D')[0]}
            </div>
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[22px] font-extrabold text-[var(--theme-ink-strong)]">
                  {currentUser.displayName ||
                    pick({ ko: '로컬 디렉터', en: 'Local Director', ja: 'ローカルディレクター', id: 'Direktur Lokal' })}
                </span>
                <span className="px-2.5 py-0.5 bg-[var(--theme-btn-bg)] text-[var(--theme-btn-text)] text-[13px] font-bold tracking-wide">
                  {pick({ ko: '현재 로그인됨', en: 'Signed In', ja: 'サインイン中', id: 'Sedang Masuk' })}
                </span>
              </div>
              <p className="text-[17px] text-[var(--theme-ink-secondary)]">
                {currentUser.email ||
                  pick({ ko: '로컬 독립 프로필', en: 'Independent Local Profile', ja: 'ローカル独立プロフィール', id: 'Profil Lokal Independen' })}{' '}
                ·{' '}
                {currentUser.companyName ||
                  pick({ ko: '독립 기획 스튜디오', en: 'Independent Planning Studio', ja: '独立企画スタジオ', id: 'Studio Perencanaan Independen' })}
              </p>
            </div>
          </div>

          <p className="text-[18px] text-[var(--theme-ink-body)] leading-[1.8]">
            {pick({
              ko: (
                <>
                  고구마 스튜디오의 모든 기획서와 도화지 데이터는 브라우저 로컬 저장소에 안전하게 보관됩니다.
                  다른 작업자 프로필로 전환하거나 새 로컬 프로필을 추가하려면 아래 <strong>내 계정 및 프로필 관리</strong>로 이동해 주세요.
                </>
              ),
              en: (
                <>
                  All GOGUMA specifications and workspace canvases are stored safely in your browser&apos;s local storage.
                  To switch worker profiles or add a new local profile, open <strong>Account &amp; Profile Management</strong> below.
                </>
              ),
              ja: (
                <>
                  GOGUMAスタジオのすべての企画書とキャンバスデータはブラウザのローカルストレージに安全に保管されます。
                  別の作業者プロフィールに切り替えるか新規追加する場合は、下の<strong>アカウント・プロフィール管理</strong>へお進みください。
                </>
              ),
              id: (
                <>
                  Seluruh spesifikasi dan kanvas GOGUMA disimpan aman di penyimpanan lokal browser Anda.
                  Untuk berganti atau menambah profil pekerja baru, buka <strong>Kelola Akun &amp; Profil</strong> di bawah.
                </>
              ),
            })}
          </p>

          <div className="pt-6 border-t border-[var(--theme-border-hairline)] flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/logout')}
              className="inline-flex items-center gap-2 px-5 py-3.5 border border-[var(--theme-border-strong)] hover:border-[var(--theme-ink-strong)] text-[17px] font-bold text-[var(--theme-ink-strong)] rounded-none transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              <span>{pick({ ko: '로그아웃 후 새로 만들기', en: 'Sign Out & Create New', ja: 'ログアウトして新規作成', id: 'Keluar & Buat Baru' })}</span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/workspace')}
                className="px-6 py-3.5 border border-[var(--theme-ink-strong)] bg-[var(--theme-canvas)] hover:bg-[var(--theme-stage)] text-[17px] font-bold text-[var(--theme-ink-strong)] rounded-none transition-colors cursor-pointer"
              >
                {pick({ ko: '작업실로 이동', en: 'Go to Workspace', ja: 'ワークスペースへ', id: 'Ke Ruang Kerja' })}
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-7 py-3.5 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-[18px] font-bold rounded-none transition-colors cursor-pointer flex items-center gap-2.5"
              >
                <UserCheck size={17} />
                <span>{pick({ ko: '내 계정 및 프로필 관리', en: 'Manage Account & Profiles', ja: 'アカウント・プロフィール管理', id: 'Kelola Akun & Profil' })}</span>
              </button>
            </div>
          </div>
        </div>
      </EditorialPageLayout>
    );
  }

  return (
    <EditorialPageLayout
      category="LOCAL-FIRST IDENTITY"
      title={
        isGuestSession
          ? pick({ ko: '정식 로컬 프로필 등록', en: 'Register Formal Local Profile', ja: '正式ローカルプロフィール登録', id: 'Daftarkan Profil Lokal Resmi' })
          : pick({ ko: '로컬 계정 만들기', en: 'Create Local Account', ja: 'ローカルアカウント作成', id: 'Buat Akun Lokal' })
      }
      subtitle={
        isGuestSession
          ? pick({
              ko: '현재 체험 중인 게스트 세션을 정식 로컬 디렉터 계정으로 전환합니다. 작성 중인 기획 데이터는 그대로 유지됩니다.',
              en: 'Upgrade your current guest session into a permanent local director profile. Existing drafts are preserved.',
              ja: '現在体験中のゲストセッションを正式なローカルディレクターアカウントに昇格します。作成中の企画データは維持されます。',
              id: 'Tingkatkan sesi tamu Anda menjadi akun direktur lokal resmi. Draf proyek Anda tetap aman.',
            })
          : pick({
              ko: '외부 서버에 등록하지 않고 브라우저 로컬 저장소에만 보관되는 독립 작업자 계정을 생성하고 즉시 전환합니다.',
              en: 'Create an independent local worker account stored strictly in your browser with zero central server registration.',
              ja: '外部サーバーに登録せずブラウザのローカルストレージのみに保存される独立作業者アカウントを作成し即座に切り替えます。',
              id: 'Buat akun pekerja lokal independen yang disimpan hanya di browser tanpa pendaftaran ke server luar.',
            })
      }
      maxWidthClass="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="border border-[var(--theme-ink-strong)] bg-[var(--theme-elevated)] p-8 sm:p-12 space-y-7">
        {isGuestSession && (
          <div className="p-5 bg-[var(--theme-stage)] border border-[var(--theme-ink-strong)] text-[17px] text-[var(--theme-ink-primary)] leading-[1.7]">
            {pick({
              ko: (
                <>
                  현재 <strong>익명 게스트</strong>로 작업 중입니다. 아래 정보를 입력해 등록하면 기존 로컬 기획안은 손실 없이 유지되면서 정식 디렉터 프로필로 전환됩니다.
                </>
              ),
              en: (
                <>
                  You are currently working as an <strong>Anonymous Guest</strong>. Registering below preserves your local drafts while upgrading to a full director profile.
                </>
              ),
              ja: (
                <>
                  現在<strong>匿名ゲスト</strong>として作業中です。以下の情報を入力して登録すると、既存のローカル企画書を失うことなく正式ディレクタープロフィールへ移行します。
                </>
              ),
              id: (
                <>
                  Anda sedang bekerja sebagai <strong>Tamu Anonim</strong>. Mendaftar di bawah akan menjaga draf lokal Anda sambil meningkatkan ke profil direktur penuh.
                </>
              ),
            })}
          </div>
        )}

        {error && (
          <div className="p-4 bg-[var(--theme-danger-bg)] border border-[var(--theme-danger)] text-[17px] font-bold text-[var(--theme-danger)]">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-[17px] font-extrabold text-[var(--theme-ink-strong)]">
            {pick({ ko: '이름 / 닉네임 *', en: 'Name / Nickname *', ja: '氏名 / ニックネーム *', id: 'Nama / Panggilan *' })}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={pick({
              ko: '예: 홍길동 디렉터',
              en: 'e.g., Jordan Director',
              ja: '例：山田ディレクター',
              id: 'cth., Andi Direktur',
            })}
            className="w-full px-4 py-3.5 bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] text-[var(--theme-ink-strong)] placeholder-[var(--theme-ink-muted)] rounded-none text-[19px] outline-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[17px] font-extrabold text-[var(--theme-ink-strong)]">
            {pick({ ko: '이메일 (선택)', en: 'Email (Optional)', ja: 'メール（任意）', id: 'Email (Opsional)' })}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="director@studio.local"
            className="w-full px-4 py-3.5 bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] text-[var(--theme-ink-strong)] placeholder-[var(--theme-ink-muted)] rounded-none text-[19px] outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[17px] font-extrabold text-[var(--theme-ink-strong)]">
              {pick({ ko: '소속 / 팀명 (선택)', en: 'Team / Studio (Optional)', ja: '所属 / チーム名（任意）', id: 'Tim / Studio (Opsional)' })}
            </label>
            <input
              type="text"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="Goguma Studio"
              className="w-full px-4 py-3.5 bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] text-[var(--theme-ink-strong)] placeholder-[var(--theme-ink-muted)] rounded-none text-[19px] outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[17px] font-extrabold text-[var(--theme-ink-strong)]">
              {pick({ ko: '보안 PIN (선택)', en: 'Security PIN (Optional)', ja: 'セキュリティPIN（任意）', id: 'PIN Keamanan (Opsional)' })}
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder={pick({ ko: '4자리 숫자', en: '4-digit PIN', ja: '4桁の数字', id: 'PIN 4 digit' })}
              maxLength={8}
              className="w-full px-4 py-3.5 bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] text-[var(--theme-ink-strong)] placeholder-[var(--theme-ink-muted)] rounded-none text-[19px] outline-none"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--theme-border-hairline)] flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/workspace')}
            className="px-6 py-3.5 border border-[var(--theme-border-strong)] hover:border-[var(--theme-ink-strong)] text-[17px] font-bold text-[var(--theme-ink-strong)] rounded-none cursor-pointer"
          >
            {pick({ ko: '취소', en: 'Cancel', ja: 'キャンセル', id: 'Batal' })}
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="px-7 py-3.5 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-[18px] font-bold rounded-none transition-colors cursor-pointer flex items-center gap-2.5 disabled:opacity-50"
          >
            <span>
              {isCreating
                ? pick({ ko: '처리 중...', en: 'Processing...', ja: '処理中...', id: 'Memproses...' })
                : isGuestSession
                ? pick({ ko: '정식 프로필 등록 및 시작', en: 'Register Profile & Start', ja: '正式プロフィール登録・開始', id: 'Daftar Profil & Mulai' })
                : pick({ ko: '로컬 계정 생성 및 시작', en: 'Create Local Account & Start', ja: 'ローカルアカウント作成・開始', id: 'Buat Akun Lokal & Mulai' })}
            </span>
            <ArrowRight size={17} />
          </button>
        </div>
      </form>
    </EditorialPageLayout>
  );
}
