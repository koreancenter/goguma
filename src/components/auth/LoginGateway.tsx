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
    <div className="min-h-screen bg-[#FBFBFA] text-[#18181B] flex flex-col justify-between selection:bg-[#FEF3C7] selection:text-[#78350F] font-sans">
      {/* Top Editorial Bar */}
      <header className="h-14 px-6 sm:px-10 border-b border-stone-200/90 bg-white/95 backdrop-blur-md flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="font-bold text-base tracking-tight text-stone-900 uppercase">
            GOGUMA
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-[2px] bg-amber-50 text-[#D97706] font-mono border border-amber-200/70 font-semibold">
            LOCAL STUDIO
          </span>
        </Link>

        <div className="flex items-center gap-4 text-xs font-mono text-stone-500">
          <span className="hidden sm:inline">ZERO SERVER · LOCAL ISOLATION</span>
          <Link 
            to="/" 
            className="px-3 py-1 rounded-[2px] border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors text-xs"
          >
            소개
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl bg-white rounded-[2px] border border-stone-200/90 shadow-xl p-6 sm:p-10 space-y-7 text-stone-900">
          
          {/* Header Title Section */}
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-amber-50 border border-amber-200/70 text-amber-900 text-xs font-mono font-medium">
              <ShieldCheck size={14} className="text-[#D97706]" />
              <span>LOCAL-FIRST WORKSPACE GATEWAY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 uppercase">
              기획 도화지 작업실 입장
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
              외부 서버로 로그인 정보가 전송되지 않는 독립형 환경입니다.<br className="hidden sm:inline" />
              작업자 프로필을 선택하거나 새로 생성하여 도화지를 시작하세요.
            </p>
          </div>

          {/* Segmented Control Tabs */}
          <div className="grid grid-cols-3 p-1 bg-stone-100 rounded-[2px] border border-stone-200 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('quick')}
              className={`py-2 px-3 rounded-[2px] font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'quick'
                  ? 'bg-[#D97706] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
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
                  ? 'bg-[#D97706] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
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
                  ? 'bg-[#D97706] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Lock size={14} />
              <span>게스트 체험</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-[2px] text-rose-800 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tab 1: Quick Resume (Saved Profiles) */}
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <div className="text-xs text-stone-500 flex items-center justify-between font-mono">
                <span>저장된 작업자 프로필</span>
                <span className="text-[#D97706] font-semibold">{savedProfiles.length}개 발견됨</span>
              </div>

              <div className="space-y-2.5">
                {savedProfiles.map((p) => (
                  <div
                    key={p.uid}
                    className="p-4 rounded-[2px] bg-stone-50 border border-stone-200 hover:border-amber-300 transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-[2px] bg-amber-50 text-[#D97706] font-bold text-base flex items-center justify-center border border-amber-200/80">
                        {p.displayName ? p.displayName[0] : 'D'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-stone-900 group-hover:text-amber-900 transition-colors">
                            {p.displayName}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-white text-amber-800 border border-stone-200">
                            {p.role === 'ADMIN' ? '디렉터' : '멤버'}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500 font-mono mt-0.5">
                          {p.email || '로컬 독립 프로필'} · {p.companyName || '독립 스튜디오'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleQuickLogin(p)}
                      className="px-4 py-1.5 rounded-[2px] bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
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
                  className="text-xs text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
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
                <label className="block text-xs font-medium text-stone-800">
                  디렉터 성함 또는 닉네임 <span className="text-[#D97706]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="예: 박대표, 김기획, 리드 아키텍트"
                  className="w-full px-3.5 py-2.5 rounded-[2px] bg-stone-50 border border-stone-200 focus:border-[#D97706] text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-stone-800">
                    이메일 / 식별자 (선택)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="director@mycompany.com"
                    className="w-full px-3.5 py-2.5 rounded-[2px] bg-stone-50 border border-stone-200 focus:border-[#D97706] text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-stone-800">
                    조직 / 회사명 (선택)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="예: 고구마 기획팀, 스타트업 LAB"
                    className="w-full px-3.5 py-2.5 rounded-[2px] bg-stone-50 border border-stone-200 focus:border-[#D97706] text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-stone-800">
                    로컬 작업실 잠금 PIN (선택)
                  </label>
                  <span className="text-[11px] text-stone-500 font-mono">브라우저 잠금용 (4~8자리)</span>
                </div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="설정하지 않으면 즉시 입장 가능"
                  className="w-full px-3.5 py-2.5 rounded-[2px] bg-stone-50 border border-stone-200 focus:border-[#D97706] text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-[2px] accent-[#D97706]"
                  />
                  <span className="text-xs text-stone-600">
                    이 브라우저에 작업자 프로필 저장 및 자동 기억
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-[2px] bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <span>디렉터로 도화지 작업실 입장</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}

          {/* Tab 3: Instant Guest Access */}
          {activeTab === 'guest' && (
            <div className="p-6 rounded-[2px] bg-stone-50 border border-stone-200 space-y-5 text-center">
              <div className="w-10 h-10 rounded-[2px] bg-amber-50 text-[#D97706] border border-amber-200/70 flex items-center justify-center mx-auto text-base font-bold">
                <Lock size={18} />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-semibold text-base text-stone-900">
                  익명 게스트 즉시 둘러보기
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                  이름이나 정보 입력 없이 1초 만에 도화지 작업실에 진입합니다.
                  작성하신 기획안은 게스트 세션 동안 브라우저에 정상 보존됩니다.
                </p>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleGuestLogin}
                className="w-full py-3 px-6 rounded-[2px] bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <span>게스트 세션으로 즉시 시작</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}

          {/* Local-First Architecture Guarantee Notice */}
          <div className="p-4 rounded-[2px] bg-amber-50/60 border border-amber-200/70 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-950">
              <HardDrive size={14} className="text-[#D97706]" />
              <span>GOGUMA 무서버 독립 아키텍처 보증</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed font-mono">
              본 애플리케이션은 계정 정보와 기획 문서가 외부 클라우드로 전송되지 않는 100% 로컬 샌드박스입니다. 
              상단 헤더의 [작업실 잠금] 버튼을 통해 언제든지 세션을 종료할 수 있습니다.
            </p>
          </div>

        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="py-4 text-center text-xs text-stone-400 border-t border-stone-200 bg-stone-50 font-mono">
        <span>GOGUMA Free Software (MIT) · Zero Server Telemetry · Local IndexedDB Encrypted</span>
      </footer>
    </div>
  );
}
