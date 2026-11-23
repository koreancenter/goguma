import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { auth, LocalUser } from '../../lib/localAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import Navbar from '../classic/layout/Navbar';
import Footer from '../classic/layout/Footer';

export default function LoginGateway() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pick } = useLanguage();

  useEffect(() => {
    if (auth.isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/workspace';
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const [savedProfiles, setSavedProfiles] = useState<LocalUser[]>([]);
  const [activeTab, setActiveTab] = useState<'quick' | 'custom' | 'guest'>('quick');

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [pin, setPin] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const list = auth.getSavedProfiles();
    setSavedProfiles(list);
    if (list.length === 0) {
      setActiveTab('custom');
    }
  }, []);

  const handleQuickLogin = async (profile: LocalUser) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await auth.signInWithProfile(profile);
      const destination = (location.state as any)?.from?.pathname || '/workspace';
      navigate(destination, { replace: true });
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          pick({
            ko: '로그인 중 오류가 발생했습니다.',
            en: 'An error occurred while signing in.',
            ja: 'サインイン中にエラーが発生しました。',
            id: 'Terjadi kesalahan saat masuk.',
          })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg(
        pick({
          ko: '디렉터 이름(또는 작업자명)을 입력해 주세요.',
          en: 'Please enter a director or worker name.',
          ja: 'ディレクター名（または作業者名）を入力してください。',
          id: 'Silakan masukkan nama direktur atau pekerja.',
        })
      );
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      await auth.signInLocal({
        displayName: displayName.trim(),
        email: email.trim() || undefined,
        companyName: companyName.trim() || undefined,
        pin: pin.trim() || undefined,
        rememberMe,
        role: 'ADMIN',
      });
      const destination = (location.state as any)?.from?.pathname || '/workspace';
      navigate(destination, { replace: true });
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          pick({
            ko: '입장에 실패했습니다.',
            en: 'Failed to enter workspace.',
            ja: '入場に失敗しました。',
            id: 'Gagal masuk ke ruang kerja.',
          })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await auth.signInAsGuest();
      const destination = (location.state as any)?.from?.pathname || '/workspace';
      navigate(destination, { replace: true });
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          pick({
            ko: '게스트 세션 생성에 실패했습니다.',
            en: 'Failed to start guest session.',
            ja: 'ゲストセッションの作成に失敗しました。',
            id: 'Gagal membuat sesi tamu.',
          })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--theme-canvas)] text-[var(--theme-ink-primary)] flex flex-col selection:bg-[var(--theme-ink-strong)] selection:text-[var(--theme-canvas)] font-sans">
      <Navbar />

      {/* Full-Bleed 50:50 Architectural Split */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12">
        {/* Left Pane — Warm Hanji / Nocturnal Ink Curatorial Manifesto */}
        <section className="lg:col-span-6 bg-[var(--theme-stage)] border-b lg:border-b-0 lg:border-r border-[var(--theme-border-hairline)] px-8 py-16 sm:px-14 lg:px-20 lg:py-24 flex flex-col justify-between gap-14">
          <div className="space-y-8 max-w-xl">
            <span className="text-[15px] sm:text-[16px] font-sans font-bold uppercase tracking-[0.18em] text-[var(--theme-ink-secondary)] block">
              {pick({
                ko: 'Local-First Workspace Gateway',
                en: 'Local-First Workspace Gateway',
                ja: 'ローカルファースト・ゲートウェイ',
                id: 'Gerbang Ruang Kerja Local-First',
              })}
            </span>
            <h1
              className="font-display text-4xl sm:text-5xl font-bold text-[var(--theme-ink-primary)] tracking-[-0.03em] leading-[1.15]"
              style={{ textWrap: 'balance' }}
            >
              {pick({
                ko: (
                  <>
                    기획 도화지
                    <br />
                    작업실 입장.
                  </>
                ),
                en: (
                  <>
                    Enter the Spec
                    <br />
                    Studio Canvas.
                  </>
                ),
                ja: (
                  <>
                    企画キャンバス
                    <br />
                    スタジオ入場。
                  </>
                ),
                id: (
                  <>
                    Masuk ke Kanvas
                    <br />
                    Studio Spesifikasi.
                  </>
                ),
              })}
            </h1>
            <p className="text-[20px] sm:text-[22px] text-[var(--theme-ink-body)] leading-[1.8]">
              {pick({
                ko: '외부 서버로 계정 정보와 기획 문서가 일체 전송되지 않는 100% 독립형 로컬 샌드박스입니다. 브라우저 내부에서 즉시 작업자 세션을 열고 아키텍처를 설계하세요.',
                en: 'A 100% sovereign local sandbox where zero credentials or specifications are sent to remote servers. Open a local session right inside your browser and start architecting.',
                ja: 'アカウント情報や企画書が外部サーバーに一切送信されない100%独立型ローカルサンドボックスです。ブラウザ内で即座にセッションを開き、設計を始めましょう。',
                id: 'Kotak pasir lokal 100% independen di mana kredensial dan dokumen spesifikasi tidak pernah dikirim ke server luar. Buka sesi lokal langsung di peramban dan mulai merancang.',
              })}
            </p>
          </div>

          <div className="max-w-xl border-t border-[var(--theme-border-hairline)] divide-y divide-[var(--theme-border-hairline)]">
            <div className="py-5 flex items-baseline gap-5">
              <span className="text-[16px] font-bold font-sans tabular-nums text-[var(--theme-ink-secondary)] tracking-[0.12em]">01</span>
              <span className="text-[19px] sm:text-[20px] text-[var(--theme-ink-primary)]">
                {pick({
                  ko: '이메일·비밀번호 원격 인증 없는 로컬 세션',
                  en: 'Local sessions without remote email or password auth',
                  ja: 'メール・パスワードのリモート認証不要なローカルセッション',
                  id: 'Sesi lokal tanpa autentikasi email atau kata sandi jarak jauh',
                })}
              </span>
            </div>
            <div className="py-5 flex items-baseline gap-5">
              <span className="text-[16px] font-bold font-sans tabular-nums text-[var(--theme-ink-secondary)] tracking-[0.12em]">02</span>
              <span className="text-[19px] sm:text-[20px] text-[var(--theme-ink-primary)]">
                {pick({
                  ko: '브라우저 IndexedDB 기반 실시간 자동 보존',
                  en: 'Real-time auto-persistence powered by browser IndexedDB',
                  ja: 'ブラウザIndexedDBに基づくリアルタイム自動保存',
                  id: 'Penyimpanan otomatis real-time berbasis IndexedDB peramban',
                })}
              </span>
            </div>
            <div className="py-5 flex items-baseline gap-5">
              <span className="text-[16px] font-bold font-sans tabular-nums text-[var(--theme-ink-secondary)] tracking-[0.12em]">03</span>
              <span className="text-[19px] sm:text-[20px] text-[var(--theme-ink-primary)]">
                {pick({
                  ko: '네트워크 연결 없이도 동작하는 오프라인 스튜디오',
                  en: 'Offline studio operating seamlessly without network access',
                  ja: 'ネットワーク接続なしでも動作するオフラインスタジオ',
                  id: 'Studio luring yang beroperasi penuh tanpa koneksi internet',
                })}
              </span>
            </div>
          </div>
        </section>

        {/* Right Pane — Unboxed Editorial Entry Form */}
        <section className="lg:col-span-6 bg-[var(--theme-canvas)] px-8 py-16 sm:px-14 lg:px-20 lg:py-24 flex flex-col justify-center">
          <div className="w-full max-w-lg mx-auto space-y-10">
            {/* Editorial Underline Tabs */}
            <div className="flex items-center gap-8 border-b border-[var(--theme-border-hairline)]">
              <button
                type="button"
                onClick={() => setActiveTab('quick')}
                className={`relative pb-4 text-[18px] sm:text-[19px] transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'quick'
                    ? 'text-[var(--theme-ink-strong)] font-extrabold'
                    : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] font-semibold'
                }`}
              >
                <span>{pick({ ko: '빠른 입장', en: 'Quick Resume', ja: 'クイック入場', id: 'Masuk Cepat' })}</span>
                {activeTab === 'quick' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--theme-ink-strong)]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`relative pb-4 text-[18px] sm:text-[19px] transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'custom'
                    ? 'text-[var(--theme-ink-strong)] font-extrabold'
                    : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] font-semibold'
                }`}
              >
                <span>{pick({ ko: '디렉터 등록', en: 'Register Director', ja: 'ディレクター登録', id: 'Daftar Direktur' })}</span>
                {activeTab === 'custom' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--theme-ink-strong)]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('guest')}
                className={`relative pb-4 text-[18px] sm:text-[19px] transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'guest'
                    ? 'text-[var(--theme-ink-strong)] font-extrabold'
                    : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] font-semibold'
                }`}
              >
                <span>{pick({ ko: '게스트 체험', en: 'Guest Mode', ja: 'ゲスト体験', id: 'Mode Tamu' })}</span>
                {activeTab === 'guest' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--theme-ink-strong)]" />
                )}
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="px-5 py-4 bg-[var(--theme-danger-bg)] border border-[var(--theme-danger)] rounded-none text-[var(--theme-danger)] text-[17px] font-bold">
                {errorMsg}
              </div>
            )}

            {/* Tab 1: Quick Resume (Saved Profiles) */}
            {activeTab === 'quick' && (
              <div className="space-y-6">
                <div className="text-[17px] text-[var(--theme-ink-secondary)] flex items-center justify-between font-sans">
                  <span>
                    {pick({
                      ko: '저장된 작업자 프로필',
                      en: 'Saved Worker Profiles',
                      ja: '保存済みの作業者プロフィール',
                      id: 'Profil Pekerja Tersimpan',
                    })}
                  </span>
                  <span className="text-[var(--theme-ink-strong)] font-extrabold tabular-nums">
                    {pick({
                      ko: `${savedProfiles.length}개`,
                      en: `${savedProfiles.length}`,
                      ja: `${savedProfiles.length}件`,
                      id: `${savedProfiles.length}`,
                    })}
                  </span>
                </div>

                {savedProfiles.length === 0 ? (
                  <div className="py-10 border-y border-[var(--theme-border-hairline)] text-[18px] text-[var(--theme-ink-body)] space-y-4 leading-[1.7]">
                    <p>
                      {pick({
                        ko: '저장된 로컬 프로필이 아직 없습니다. 새 디렉터 프로필을 등록하거나 게스트로 입장해 주세요.',
                        en: 'No local profiles saved yet. Register a new director profile or enter as a guest.',
                        ja: '保存されたローカルプロフィールがまだありません。新しいディレクタープロフィールを登録するか、ゲストとして入場してください。',
                        id: 'Belum ada profil lokal tersimpan. Daftarkan profil direktur baru atau masuk sebagai tamu.',
                      })}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('custom')}
                      className="text-[var(--theme-ink-strong)] font-extrabold underline underline-offset-4 cursor-pointer"
                    >
                      {pick({
                        ko: '새 디렉터 프로필 만들기',
                        en: 'Create New Director Profile',
                        ja: '新しいディレクタープロフィールを作成',
                        id: 'Buat Profil Direktur Baru',
                      })}
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--theme-border-hairline)] border-y border-[var(--theme-border-hairline)]">
                    {savedProfiles.map((p) => (
                      <div
                        key={p.uid}
                        className="py-5 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-11 h-11 rounded-none bg-[var(--theme-btn-bg)] text-[var(--theme-btn-text)] font-display font-bold text-[20px] flex items-center justify-center shrink-0">
                            {p.displayName ? p.displayName[0] : 'D'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-[19px] text-[var(--theme-ink-strong)] truncate">
                                {p.displayName}
                              </span>
                              <span className="text-[16px] font-sans text-[var(--theme-ink-secondary)] shrink-0">
                                ·{' '}
                                {p.role === 'ADMIN'
                                  ? pick({ ko: '디렉터', en: 'Director', ja: 'ディレクター', id: 'Direktur' })
                                  : pick({ ko: '멤버', en: 'Member', ja: 'メンバー', id: 'Anggota' })}
                              </span>
                            </div>
                            <div className="text-[16px] text-[var(--theme-ink-secondary)] font-sans mt-1 truncate">
                              {p.email || pick({ ko: '로컬 독립 프로필', en: 'Local Standalone Profile', ja: 'ローカル独立プロフィール', id: 'Profil Lokal Mandiri' })} ·{' '}
                              {p.companyName || pick({ ko: '독립 스튜디오', en: 'Independent Studio', ja: '独立スタジオ', id: 'Studio Independen' })}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleQuickLogin(p)}
                          className="px-5 py-3 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-[17px] font-bold inline-flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                        >
                          <span>{pick({ ko: '입장', en: 'Enter', ja: '入場', id: 'Masuk' })}</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('custom')}
                    className="text-[17px] text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] hover:underline underline-offset-4 transition-colors cursor-pointer font-semibold"
                  >
                    {pick({
                      ko: '+ 다른 이름으로 새 디렉터 프로필 생성하기',
                      en: '+ Create another local director profile',
                      ja: '+ 別の名前で新しいディレクタープロフィールを作成',
                      id: '+ Buat profil direktur lokal dengan nama lain',
                    })}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Custom Director Form */}
            {activeTab === 'custom' && (
              <form onSubmit={handleCustomLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[17px] font-extrabold text-[var(--theme-ink-strong)]">
                    {pick({
                      ko: '디렉터 성함 또는 닉네임',
                      en: 'Director Name or Alias',
                      ja: 'ディレクター名またはニックネーム',
                      id: 'Nama atau Alias Direktur',
                    })}{' '}
                    <span className="text-[var(--theme-seal)]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={pick({
                      ko: '예: 박대표, 김기획, 리드 아키텍트',
                      en: 'e.g., Alex Kim, Lead Architect',
                      ja: '例：鈴木ディレクター、リードアーキテクト',
                      id: 'cth: Budi Direktur, Lead Architect',
                    })}
                    className="w-full px-4 py-3.5 rounded-none bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] text-[19px] font-normal text-[var(--theme-ink-strong)] outline-none transition-colors placeholder:text-[var(--theme-ink-muted)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-[17px] font-extrabold text-[var(--theme-ink-strong)]">
                      {pick({
                        ko: '이메일 / 식별자 (선택)',
                        en: 'Email / Identifier (Optional)',
                        ja: 'メール / 識別子（任意）',
                        id: 'Email / Pengenal (Opsional)',
                      })}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="director@studio.local"
                      className="w-full px-4 py-3.5 rounded-none bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] text-[19px] font-normal text-[var(--theme-ink-strong)] outline-none transition-colors placeholder:text-[var(--theme-ink-muted)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[17px] font-extrabold text-[var(--theme-ink-strong)]">
                      {pick({
                        ko: '조직 / 스튜디오명 (선택)',
                        en: 'Organization / Studio (Optional)',
                        ja: '組織 / スタジオ名（任意）',
                        id: 'Organisasi / Studio (Opsional)',
                      })}
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={pick({
                        ko: '예: 고구마 아틀리에',
                        en: 'e.g., Goguma Atelier',
                        ja: '例：ゴグマ・アトリエ',
                        id: 'cth: Goguma Atelier',
                      })}
                      className="w-full px-4 py-3.5 rounded-none bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] text-[19px] font-normal text-[var(--theme-ink-strong)] outline-none transition-colors placeholder:text-[var(--theme-ink-muted)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[17px] font-extrabold text-[var(--theme-ink-strong)]">
                      {pick({
                        ko: '로컬 작업실 잠금 PIN (선택)',
                        en: 'Local Workspace Lock PIN (Optional)',
                        ja: 'ローカル作業室ロックPIN（任意）',
                        id: 'PIN Kunci Ruang Kerja Lokal (Opsional)',
                      })}
                    </label>
                    <span className="text-[15px] text-[var(--theme-ink-secondary)] font-sans">
                      {pick({ ko: '4~8자리', en: '4–8 digits', ja: '4〜8桁', id: '4-8 digit' })}
                    </span>
                  </div>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder={pick({
                      ko: '설정하지 않으면 즉시 입장 가능',
                      en: 'Leave empty for instant entry',
                      ja: '未設定の場合は即座に入場できます',
                      id: 'Kosongkan untuk masuk langsung',
                    })}
                    className="w-full px-4 py-3.5 rounded-none bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] text-[19px] font-normal text-[var(--theme-ink-strong)] outline-none transition-colors placeholder:text-[var(--theme-ink-muted)]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-5 h-5 rounded-none accent-[var(--theme-ink-strong)]"
                    />
                    <span className="text-[17px] text-[var(--theme-ink-body)]">
                      {pick({
                        ko: '이 브라우저에 작업자 프로필 저장 및 자동 기억',
                        en: 'Save and remember this profile in this browser',
                        ja: 'このブラウザに作業者プロフィールを保存して記憶する',
                        id: 'Simpan dan ingat profil ini di peramban ini',
                      })}
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] font-bold text-[19px] flex items-center justify-center gap-2.5 transition-colors cursor-pointer tracking-wide"
                >
                  <span>
                    {pick({
                      ko: '디렉터로 도화지 작업실 입장',
                      en: 'Enter Canvas Studio as Director',
                      ja: 'ディレクターとしてスタジオへ入場',
                      id: 'Masuk ke Studio Kanvas sebagai Direktur',
                    })}
                  </span>
                  <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* Tab 3: Instant Guest Access */}
            {activeTab === 'guest' && (
              <div className="py-8 border-y border-[var(--theme-border-hairline)] space-y-8">
                <div className="space-y-3">
                  <h2 className="font-display text-[26px] sm:text-[30px] font-extrabold tracking-[-0.02em] text-[var(--theme-ink-strong)]">
                    {pick({
                      ko: '익명 게스트 즉시 둘러보기',
                      en: 'Instant Anonymous Guest Access',
                      ja: '匿名ゲストとして今すぐ試す',
                      id: 'Akses Tamu Anonim Instan',
                    })}
                  </h2>
                  <p className="text-[19px] text-[var(--theme-ink-body)] leading-[1.8]">
                    {pick({
                      ko: '정보 입력 없이 즉시 도화지 작업실에 진입합니다. 작성하신 기획안은 게스트 세션 동안 로컬 브라우저에 보존됩니다.',
                      en: 'Enter the studio canvas immediately with zero sign-up. Your specifications remain preserved inside your local browser during your guest session.',
                      ja: '情報を入力せず即座にスタジオキャンバスへ入れます。作成した企画書はゲストセッション中、ローカルブラウザに保存されます。',
                      id: 'Masuk ke kanvas studio seketika tanpa mengisi formulir. Draf spesifikasi Anda tetap tersimpan di peramban lokal selama sesi tamu.',
                    })}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleGuestLogin}
                  className="w-full py-4 px-6 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] font-bold text-[19px] flex items-center justify-center gap-2.5 transition-colors cursor-pointer tracking-wide"
                >
                  <span>
                    {pick({
                      ko: '게스트 세션으로 즉시 시작',
                      en: 'Start Immediately as Guest',
                      ja: 'ゲストセッションで今すぐ開始',
                      id: 'Mulai Langsung sebagai Tamu',
                    })}
                  </span>
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Common Global Editorial Footer */}
      <Footer />
    </div>
  );
}
