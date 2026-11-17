import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { auth, LocalUser } from '../../lib/localAuth';
import Navbar from '../classic/layout/Navbar';
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
      <Navbar />

      {/* Full-Bleed 50:50 Architectural Split */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12">
        {/* Left Pane — Warm Hanji Curatorial Manifesto */}
        <section className="lg:col-span-6 bg-[#F6F5F1] border-b lg:border-b-0 lg:border-r border-[#E4E2DC] px-8 py-16 sm:px-14 lg:px-20 lg:py-24 flex flex-col justify-between gap-14">
          <div className="space-y-8 max-w-xl">
            <span className="text-[15px] sm:text-[16px] font-sans font-bold uppercase tracking-[0.18em] text-[#52524E] block">
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
            <p className="text-[20px] sm:text-[22px] text-[#3F3F3C] leading-[1.8]">
              외부 서버로 계정 정보와 기획 문서가 일체 전송되지 않는 100% 독립형 로컬 샌드박스입니다.
              브라우저 내부에서 즉시 작업자 세션을 열고 아키텍처를 설계하세요.
            </p>
          </div>

          <div className="max-w-xl border-t border-[#E4E2DC] divide-y divide-[#E4E2DC]">
            <div className="py-5 flex items-baseline gap-5">
              <span className="text-[16px] font-bold font-sans tabular-nums text-[#52524E] tracking-[0.12em]">01</span>
              <span className="text-[19px] sm:text-[20px] text-[#1C1C1A]">이메일·비밀번호 원격 인증 없는 로컬 세션</span>
            </div>
            <div className="py-5 flex items-baseline gap-5">
              <span className="text-[16px] font-bold font-sans tabular-nums text-[#52524E] tracking-[0.12em]">02</span>
              <span className="text-[19px] sm:text-[20px] text-[#1C1C1A]">브라우저 IndexedDB 기반 실시간 자동 보존</span>
            </div>
            <div className="py-5 flex items-baseline gap-5">
              <span className="text-[16px] font-bold font-sans tabular-nums text-[#52524E] tracking-[0.12em]">03</span>
              <span className="text-[19px] sm:text-[20px] text-[#1C1C1A]">네트워크 연결 없이도 동작하는 오프라인 스튜디오</span>
            </div>
          </div>
        </section>

        {/* Right Pane — Unboxed Editorial Entry Form */}
        <section className="lg:col-span-6 bg-[#FFFFFF] px-8 py-16 sm:px-14 lg:px-20 lg:py-24 flex flex-col justify-center">
          <div className="w-full max-w-lg mx-auto space-y-10">
            {/* Editorial Underline Tabs */}
            <div className="flex items-center gap-8 border-b border-[#E4E2DC]">
              <button
                type="button"
                onClick={() => setActiveTab('quick')}
                className={`relative pb-4 text-[18px] sm:text-[19px] transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'quick'
                    ? 'text-[#000000] font-extrabold'
                    : 'text-[#52524E] hover:text-[#000000] font-semibold'
                }`}
              >
                <span>빠른 입장</span>
                {activeTab === 'quick' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#000000]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`relative pb-4 text-[18px] sm:text-[19px] transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'custom'
                    ? 'text-[#000000] font-extrabold'
                    : 'text-[#52524E] hover:text-[#000000] font-semibold'
                }`}
              >
                <span>디렉터 등록</span>
                {activeTab === 'custom' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#000000]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('guest')}
                className={`relative pb-4 text-[18px] sm:text-[19px] transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'guest'
                    ? 'text-[#000000] font-extrabold'
                    : 'text-[#52524E] hover:text-[#000000] font-semibold'
                }`}
              >
                <span>게스트 체험</span>
                {activeTab === 'guest' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#000000]" />
                )}
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="px-5 py-4 bg-[#FEF2F2] border border-[#DC2626] rounded-none text-[#DC2626] text-[17px] font-bold">
                {errorMsg}
              </div>
            )}

            {/* Tab 1: Quick Resume (Saved Profiles) */}
            {activeTab === 'quick' && (
              <div className="space-y-6">
                <div className="text-[17px] text-[#52524E] flex items-center justify-between font-sans">
                  <span>저장된 작업자 프로필</span>
                  <span className="text-[#000000] font-extrabold tabular-nums">{savedProfiles.length}개</span>
                </div>

                {savedProfiles.length === 0 ? (
                  <div className="py-10 border-y border-[#E4E2DC] text-[18px] text-[#3F3F3C] space-y-4 leading-[1.7]">
                    <p>저장된 로컬 프로필이 아직 없습니다. 새 디렉터 프로필을 등록하거나 게스트로 입장해 주세요.</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('custom')}
                      className="text-[#000000] font-extrabold underline underline-offset-4 cursor-pointer"
                    >
                      새 디렉터 프로필 만들기
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E4E2DC] border-y border-[#E4E2DC]">
                    {savedProfiles.map((p) => (
                      <div
                        key={p.uid}
                        className="py-5 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-11 h-11 rounded-none bg-[#000000] text-[#FFFFFF] font-display font-bold text-[20px] flex items-center justify-center shrink-0">
                            {p.displayName ? p.displayName[0] : 'D'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-[19px] text-[#000000] truncate">
                                {p.displayName}
                              </span>
                              <span className="text-[16px] font-sans text-[#52524E] shrink-0">
                                · {p.role === 'ADMIN' ? '디렉터' : '멤버'}
                              </span>
                            </div>
                            <div className="text-[16px] text-[#52524E] font-sans mt-1 truncate">
                              {p.email || '로컬 독립 프로필'} · {p.companyName || '독립 스튜디오'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleQuickLogin(p)}
                          className="px-5 py-3 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] text-[17px] font-bold inline-flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                        >
                          <span>입장</span>
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
                    className="text-[17px] text-[#52524E] hover:text-[#000000] hover:underline underline-offset-4 transition-colors cursor-pointer font-semibold"
                  >
                    + 다른 이름으로 새 디렉터 프로필 생성하기
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Custom Director Form */}
            {activeTab === 'custom' && (
              <form onSubmit={handleCustomLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[17px] font-extrabold text-[#000000]">
                    디렉터 성함 또는 닉네임 <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="예: 박대표, 김기획, 리드 아키텍트"
                    className="w-full px-4 py-3.5 rounded-none bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] text-[19px] font-normal text-[#000000] outline-none transition-colors placeholder:text-[#8C8B85]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-[17px] font-extrabold text-[#000000]">
                      이메일 / 식별자 (선택)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="director@studio.kr"
                      className="w-full px-4 py-3.5 rounded-none bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] text-[19px] font-normal text-[#000000] outline-none transition-colors placeholder:text-[#8C8B85]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[17px] font-extrabold text-[#000000]">
                      조직 / 스튜디오명 (선택)
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="예: 고구마 아틀리에"
                      className="w-full px-4 py-3.5 rounded-none bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] text-[19px] font-normal text-[#000000] outline-none transition-colors placeholder:text-[#8C8B85]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[17px] font-extrabold text-[#000000]">
                      로컬 작업실 잠금 PIN (선택)
                    </label>
                    <span className="text-[15px] text-[#52524E] font-sans">4~8자리</span>
                  </div>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="설정하지 않으면 즉시 입장 가능"
                    className="w-full px-4 py-3.5 rounded-none bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] text-[19px] font-normal text-[#000000] outline-none transition-colors placeholder:text-[#8C8B85]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-5 h-5 rounded-none accent-[#000000]"
                    />
                    <span className="text-[17px] text-[#3F3F3C]">
                      이 브라우저에 작업자 프로필 저장 및 자동 기억
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] font-bold text-[19px] flex items-center justify-center gap-2.5 transition-colors cursor-pointer tracking-wide"
                >
                  <span>디렉터로 도화지 작업실 입장</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* Tab 3: Instant Guest Access */}
            {activeTab === 'guest' && (
              <div className="py-8 border-y border-[#E4E2DC] space-y-8">
                <div className="space-y-3">
                  <h2 className="font-display text-[26px] sm:text-[30px] font-extrabold tracking-[-0.02em] text-[#000000]">
                    익명 게스트 즉시 둘러보기
                  </h2>
                  <p className="text-[19px] text-[#3F3F3C] leading-[1.8]">
                    정보 입력 없이 즉시 도화지 작업실에 진입합니다.
                    작성하신 기획안은 게스트 세션 동안 로컬 브라우저에 보존됩니다.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleGuestLogin}
                  className="w-full py-4 px-6 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] font-bold text-[19px] flex items-center justify-center gap-2.5 transition-colors cursor-pointer tracking-wide"
                >
                  <span>게스트 세션으로 즉시 시작</span>
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
