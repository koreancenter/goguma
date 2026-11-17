import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { auth, LocalUser } from '../../lib/localAuth';
import Footer from '../classic/layout/Footer';

export default function LoginGateway() {
  const navigate = useNavigate();
  const location = useLocation();

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
      setErrorMsg(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg('디렉터 이름(또는 작업자명)을 입력해 주세요.');
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
      setErrorMsg(err.message || '입장에 실패했습니다.');
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
      setErrorMsg(err.message || '게스트 세션 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col selection:bg-[#111111] selection:text-[#FFFFFF] font-sans">
      {/* Top Minimal Architectural Bar */}
      <header className="h-16 px-6 sm:px-10 border-b border-[#E4E2DC] bg-[#FFFFFF] flex items-center justify-between shrink-0">
        <Link to="/landing" className="font-display text-xl font-extrabold tracking-[-0.04em] text-[#111111] uppercase hover:opacity-75 transition-opacity">
          GOGUMA
        </Link>

        <div className="flex items-center gap-6 text-xs font-sans text-[#52524E]">
          <span className="hidden sm:inline text-[11px] uppercase tracking-[0.14em] text-[#8C8B85]">
            Zero Server · Local Isolation
          </span>
          <Link
            to="/landing"
            className="text-xs font-medium text-[#111111] hover:underline underline-offset-4 transition-colors"
          >
            소개 보기
          </Link>
        </div>
      </header>

      {/* Full-Bleed 50:50 Architectural Split */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12">
        {/* Left Pane — Warm Hanji Curatorial Manifesto */}
        <section className="lg:col-span-6 bg-[#F6F5F1] border-b lg:border-b-0 lg:border-r border-[#E4E2DC] px-8 py-14 sm:px-14 lg:px-20 lg:py-20 flex flex-col justify-between gap-12">
          <div className="space-y-6 max-w-lg">
            <span className="text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-[#8C8B85] block">
              Local-First Workspace Gateway
            </span>
            <h1
              className="font-display text-4xl sm:text-5xl font-bold text-[#111111] tracking-[-0.03em] leading-[1.15]"
              style={{ textWrap: 'balance' }}
            >
              기획 도화지
              <br />
              작업실 입장.
            </h1>
            <p className="text-sm sm:text-[15px] text-[#52524E] leading-[1.8]">
              외부 서버로 계정 정보와 기획 문서가 일체 전송되지 않는 100% 독립형 로컬 샌드박스입니다.
              브라우저 내부에서 즉시 작업자 세션을 열고 아키텍처를 설계하세요.
            </p>
          </div>

          <div className="max-w-lg border-t border-[#E4E2DC] divide-y divide-[#E4E2DC]">
            <div className="py-4 flex items-baseline gap-4">
              <span className="text-[11px] font-sans tabular-nums text-[#8C8B85] tracking-[0.12em]">01</span>
              <span className="text-[13px] text-[#1C1C1A]">이메일·비밀번호 원격 인증 없는 로컬 세션</span>
            </div>
            <div className="py-4 flex items-baseline gap-4">
              <span className="text-[11px] font-sans tabular-nums text-[#8C8B85] tracking-[0.12em]">02</span>
              <span className="text-[13px] text-[#1C1C1A]">브라우저 IndexedDB 기반 실시간 자동 보존</span>
            </div>
            <div className="py-4 flex items-baseline gap-4">
              <span className="text-[11px] font-sans tabular-nums text-[#8C8B85] tracking-[0.12em]">03</span>
              <span className="text-[13px] text-[#1C1C1A]">네트워크 연결 없이도 동작하는 오프라인 스튜디오</span>
            </div>
          </div>
        </section>

        {/* Right Pane — Unboxed Editorial Entry Form */}
        <section className="lg:col-span-6 bg-[#FFFFFF] px-8 py-14 sm:px-14 lg:px-20 lg:py-20 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto space-y-8">
            {/* Editorial Underline Tabs */}
            <div className="flex items-center gap-8 border-b border-[#E4E2DC]">
              <button
                type="button"
                onClick={() => setActiveTab('quick')}
                className={`relative pb-3 text-[13px] transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'quick'
                    ? 'text-[#111111] font-semibold'
                    : 'text-[#52524E] hover:text-[#111111] font-medium'
                }`}
              >
                <span>빠른 입장</span>
                {activeTab === 'quick' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#111111]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`relative pb-3 text-[13px] transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'custom'
                    ? 'text-[#111111] font-semibold'
                    : 'text-[#52524E] hover:text-[#111111] font-medium'
                }`}
              >
                <span>디렉터 등록</span>
                {activeTab === 'custom' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#111111]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('guest')}
                className={`relative pb-3 text-[13px] transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'guest'
                    ? 'text-[#111111] font-semibold'
                    : 'text-[#52524E] hover:text-[#111111] font-medium'
                }`}
              >
                <span>게스트 체험</span>
                {activeTab === 'guest' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#111111]" />
                )}
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="px-4 py-3 bg-[#FBF3F2] border border-[#8B261D]/25 rounded-[2px] text-[#8B261D] text-xs">
                {errorMsg}
              </div>
            )}

            {/* Tab 1: Quick Resume (Saved Profiles) */}
            {activeTab === 'quick' && (
              <div className="space-y-5">
                <div className="text-xs text-[#52524E] flex items-center justify-between font-sans">
                  <span>저장된 작업자 프로필</span>
                  <span className="text-[#111111] font-semibold tabular-nums">{savedProfiles.length}개</span>
                </div>

                {savedProfiles.length === 0 ? (
                  <div className="py-8 border-y border-[#E4E2DC] text-xs text-[#52524E] space-y-3">
                    <p>저장된 로컬 프로필이 아직 없습니다. 새 디렉터 프로필을 등록하거나 게스트로 입장해 주세요.</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('custom')}
                      className="text-[#111111] font-semibold underline underline-offset-4 cursor-pointer"
                    >
                      새 디렉터 프로필 만들기
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E4E2DC] border-y border-[#E4E2DC]">
                    {savedProfiles.map((p) => (
                      <div
                        key={p.uid}
                        className="py-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-9 h-9 rounded-[2px] bg-[#111111] text-[#FFFFFF] font-display font-bold text-base flex items-center justify-center shrink-0">
                            {p.displayName ? p.displayName[0] : 'D'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-[#111111] truncate">
                                {p.displayName}
                              </span>
                              <span className="text-[11px] font-sans text-[#8C8B85] shrink-0">
                                · {p.role === 'ADMIN' ? '디렉터' : '멤버'}
                              </span>
                            </div>
                            <div className="text-xs text-[#52524E] font-sans mt-0.5 truncate">
                              {p.email || '로컬 독립 프로필'} · {p.companyName || '독립 스튜디오'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleQuickLogin(p)}
                          className="px-4 py-2 rounded-[2px] bg-[#111111] hover:bg-[#2A2A28] text-[#FFFFFF] text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        >
                          <span>입장</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('custom')}
                    className="text-xs text-[#52524E] hover:text-[#111111] hover:underline underline-offset-4 transition-colors cursor-pointer"
                  >
                    + 다른 이름으로 새 디렉터 프로필 생성하기
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Custom Director Form */}
            {activeTab === 'custom' && (
              <form onSubmit={handleCustomLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#111111]">
                    디렉터 성함 또는 닉네임 <span className="text-[#8B261D]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="예: 박대표, 김기획, 리드 아키텍트"
                    className="w-full px-3.5 py-2.5 rounded-[2px] bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#111111] text-sm font-normal text-[#111111] outline-none transition-colors placeholder:text-[#8C8B85]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#111111]">
                      이메일 / 식별자 (선택)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="director@studio.kr"
                      className="w-full px-3.5 py-2.5 rounded-[2px] bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#111111] text-sm font-normal text-[#111111] outline-none transition-colors placeholder:text-[#8C8B85]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#111111]">
                      조직 / 스튜디오명 (선택)
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="예: 고구마 아틀리에"
                      className="w-full px-3.5 py-2.5 rounded-[2px] bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#111111] text-sm font-normal text-[#111111] outline-none transition-colors placeholder:text-[#8C8B85]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-[#111111]">
                      로컬 작업실 잠금 PIN (선택)
                    </label>
                    <span className="text-[11px] text-[#8C8B85] font-sans">4~8자리</span>
                  </div>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="설정하지 않으면 즉시 입장 가능"
                    className="w-full px-3.5 py-2.5 rounded-[2px] bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#111111] text-sm font-normal text-[#111111] outline-none transition-colors placeholder:text-[#8C8B85]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded-[2px] accent-[#111111]"
                    />
                    <span className="text-xs text-[#52524E]">
                      이 브라우저에 작업자 프로필 저장 및 자동 기억
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-[2px] bg-[#111111] hover:bg-[#2A2A28] text-[#FFFFFF] font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer tracking-wide"
                >
                  <span>디렉터로 도화지 작업실 입장</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            )}

            {/* Tab 3: Instant Guest Access */}
            {activeTab === 'guest' && (
              <div className="py-6 border-y border-[#E4E2DC] space-y-6">
                <div className="space-y-2">
                  <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-[#111111]">
                    익명 게스트 즉시 둘러보기
                  </h2>
                  <p className="text-[13px] text-[#52524E] leading-relaxed">
                    정보 입력 없이 즉시 도화지 작업실에 진입합니다.
                    작성하신 기획안은 게스트 세션 동안 로컬 브라우저에 보존됩니다.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleGuestLogin}
                  className="w-full py-3.5 px-6 rounded-[2px] bg-[#111111] hover:bg-[#2A2A28] text-[#FFFFFF] font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer tracking-wide"
                >
                  <span>게스트 세션으로 즉시 시작</span>
                  <ArrowRight size={15} />
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
