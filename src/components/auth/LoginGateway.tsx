import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ShieldCheck, ArrowRight, UserCheck, HardDrive, 
  Check, Lock, UserPlus
} from 'lucide-react';
import { auth, LocalUser } from '../../lib/localAuth';
import { useLanguage } from '../../contexts/LanguageContext';

export default function LoginGateway() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to target or /workspace
  useEffect(() => {
    if (auth.isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/workspace';
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const [savedProfiles, setSavedProfiles] = useState<LocalUser[]>([]);
  const [activeTab, setActiveTab] = useState<'quick' | 'custom' | 'guest'>('quick');

  // Custom Director form state
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
    <div className="min-h-screen bg-[#0B0C10] text-[#F0F3F6] flex flex-col justify-between selection:bg-blue-600/30 selection:text-[#F0F3F6] font-sans">
      {/* Top Editorial Bar */}
      <header className="h-14 px-6 sm:px-10 border-b border-white/[0.08] bg-[#0E1217]/95 backdrop-blur-md flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="font-bold text-base tracking-tight text-white uppercase">
            GOGUMA
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-[2px] bg-blue-950/60 text-[#38BDF8] font-mono border border-blue-800/60 font-semibold">
            LOCAL STUDIO
          </span>
        </Link>

        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
          <span className="hidden sm:inline">ZERO SERVER · LOCAL ISOLATION</span>
          <Link 
            to="/" 
            className="px-3 py-1 rounded-[2px] border border-white/[0.08] bg-[#13181F] text-zinc-300 hover:bg-[#18202A] hover:text-white transition-colors text-xs"
          >
            소개
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl bg-[#0E1217] rounded-[4px] border border-white/[0.08] shadow-2xl p-6 sm:p-10 space-y-7 text-[#F0F3F6]">
          
          {/* Header Title Section */}
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-blue-950/40 border border-blue-900/50 text-[#38BDF8] text-xs font-mono font-medium">
              <ShieldCheck size={14} className="text-[#38BDF8]" />
              <span>LOCAL-FIRST WORKSPACE GATEWAY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
              기획 도화지 작업실 입장
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              외부 서버로 로그인 정보가 전송되지 않는 독립형 환경입니다.<br className="hidden sm:inline" />
              작업자 프로필을 선택하거나 새로 생성하여 도화지를 시작하세요.
            </p>
          </div>

          {/* Segmented Control Tabs */}
          <div className="grid grid-cols-3 p-1 bg-[#13181F] rounded-[4px] border border-white/[0.08] gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('quick')}
              className={`py-2 px-3 rounded-[2px] font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'quick'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserCheck size={14} />
              <span>빠른 입장</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`py-2 px-3 rounded-[2px] font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'custom'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserPlus size={14} />
              <span>디렉터 등록</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('guest')}
              className={`py-2 px-3 rounded-[2px] font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'guest'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Lock size={14} />
              <span>게스트 체험</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/50 rounded-[2px] text-rose-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tab 1: Quick Resume (Saved Profiles) */}
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400 flex items-center justify-between font-mono">
                <span>저장된 작업자 프로필</span>
                <span className="text-[#38BDF8] font-semibold">{savedProfiles.length}개 발견됨</span>
              </div>

              <div className="space-y-2.5">
                {savedProfiles.map((p) => (
                  <div
                    key={p.uid}
                    className="p-4 rounded-[4px] bg-[#13181F] border border-white/[0.08] hover:border-[#38BDF8]/40 transition-all flex items-center justify-between group shadow-xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-[2px] bg-blue-950/60 text-[#38BDF8] font-bold text-base flex items-center justify-center border border-blue-800/60">
                        {p.displayName ? p.displayName[0] : 'D'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#F0F3F6] group-hover:text-white transition-colors">
                            {p.displayName}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-[#0E1217] text-[#38BDF8] border border-white/[0.08]">
                            {p.role === 'ADMIN' ? '디렉터' : '멤버'}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 font-mono mt-0.5">
                          {p.email || '로컬 독립 프로필'} · {p.companyName || '독립 스튜디오'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleQuickLogin(p)}
                      className="px-4 py-1.5 rounded-[2px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>입장</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('custom')}
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  + 다른 이름으로 새 디렉터 프로필 생성하기
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Custom Director Form */}
          {activeTab === 'custom' && (
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  디렉터 성함 또는 닉네임 <span className="text-[#38BDF8]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="예: 박대표, 김기획, 리드 아키텍트"
                  className="w-full px-3.5 py-2.5 rounded-[4px] bg-[#13181F] border border-white/[0.08] focus:border-[#38BDF8] text-sm font-medium text-[#F0F3F6] outline-none transition-all placeholder:text-zinc-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-300">
                    이메일 / 식별자 (선택)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="director@mycompany.com"
                    className="w-full px-3.5 py-2.5 rounded-[4px] bg-[#13181F] border border-white/[0.08] focus:border-[#38BDF8] text-sm font-medium text-[#F0F3F6] outline-none transition-all placeholder:text-zinc-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-300">
                    조직 / 회사명 (선택)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="예: 고구마 기획팀, 스타트업 LAB"
                    className="w-full px-3.5 py-2.5 rounded-[4px] bg-[#13181F] border border-white/[0.08] focus:border-[#38BDF8] text-sm font-medium text-[#F0F3F6] outline-none transition-all placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-zinc-300">
                    로컬 작업실 잠금 PIN (선택)
                  </label>
                  <span className="text-[11px] text-zinc-500 font-mono">브라우저 잠금용 (4~8자리)</span>
                </div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="설정하지 않으면 즉시 입장 가능"
                  className="w-full px-3.5 py-2.5 rounded-[4px] bg-[#13181F] border border-white/[0.08] focus:border-[#38BDF8] text-sm font-medium text-[#F0F3F6] outline-none transition-all placeholder:text-zinc-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-[2px] accent-[#2563EB]"
                  />
                  <span className="text-xs text-zinc-400">
                    이 브라우저에 작업자 프로필 저장 및 자동 기억
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-[4px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.25)]"
              >
                <span>디렉터로 도화지 작업실 입장</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}

          {/* Tab 3: Instant Guest Access */}
          {activeTab === 'guest' && (
            <div className="p-6 rounded-[4px] bg-[#13181F] border border-white/[0.08] space-y-5 text-center">
              <div className="w-10 h-10 rounded-[2px] bg-blue-950/60 text-[#38BDF8] border border-blue-800/60 flex items-center justify-center mx-auto text-base font-bold">
                <Lock size={18} />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-semibold text-base text-white">
                  익명 게스트 즉시 둘러보기
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  이름이나 정보 입력 없이 1초 만에 도화지 작업실에 진입합니다.
                  작성하신 기획안은 게스트 세션 동안 브라우저에 정상 보존됩니다.
                </p>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleGuestLogin}
                className="w-full py-3 px-6 rounded-[4px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.25)]"
              >
                <span>게스트 세션으로 즉시 시작</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}

          {/* Local-First Architecture Guarantee Notice */}
          <div className="p-4 rounded-[4px] bg-blue-950/30 border border-blue-900/40 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
              <HardDrive size={14} className="text-[#38BDF8]" />
              <span>GOGUMA 무서버 독립 아키텍처 보증</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
              본 애플리케이션은 계정 정보와 기획 문서가 외부 클라우드로 전송되지 않는 100% 로컬 샌드박스입니다. 
              상단 헤더의 [작업실 잠금] 버튼을 통해 언제든지 세션을 종료할 수 있습니다.
            </p>
          </div>

        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="py-4 text-center text-xs text-zinc-500 border-t border-white/[0.08] bg-[#0E1217] font-mono">
        <span>GOGUMA Free Software (MIT) · Zero Server Telemetry · Local IndexedDB Encrypted</span>
      </footer>
    </div>
  );
}
