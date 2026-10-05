import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ShieldCheck, ArrowRight, UserCheck, HardDrive, KeyRound, 
  Sparkles, Check, Lock, ChevronRight, UserPlus, HelpCircle
} from 'lucide-react';
import { auth, LocalUser, DEFAULT_DIRECTOR_PROFILE } from '../../lib/localAuth';
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
    <div className="min-h-screen bg-[#F8F4EB] text-[#231F20] flex flex-col justify-between selection:bg-[#F2D6DF] selection:text-[#6B1D42]">
      {/* Top Editorial Bar */}
      <header className="h-16 px-6 sm:px-10 border-b border-[#E5DFD3] bg-[#FAF7F2]/90 backdrop-blur-sm flex items-center justify-between">
        <Link to="/welcome" className="flex items-center gap-2.5 group">
          <span className="text-2xl group-hover:scale-105 transition-transform">🍠</span>
          <span className="font-serif font-extrabold text-xl tracking-tight text-[#6B1D42]">
            GOGUMA
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#F7EFF3] text-[#6B1D42] font-mono font-bold border border-[#6B1D42]/20">
            Local-First Studio
          </span>
        </Link>

        <div className="flex items-center gap-4 text-xs font-medium text-[#6B625B]">
          <span className="hidden sm:inline">100% 무서버 브라우저 격리</span>
          <Link 
            to="/welcome" 
            className="px-3.5 py-1.5 rounded-xl border border-[#D5CCBC] bg-white text-[#231F20] hover:bg-[#EFE9DC] transition-colors font-bold text-xs"
          >
            서비스 소개
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl bg-[#FAF7F2] rounded-3xl border-2 border-[#E5DFD3] shadow-sm p-6 sm:p-10 space-y-7">
          
          {/* Header Title Section */}
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7EFF3] border border-[#6B1D42]/20 text-[#6B1D42] text-xs font-bold">
              <ShieldCheck size={14} />
              <span>로컬 퍼스트 워크스페이스 게이트웨이</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#111827]">
              기획 도화지 작업실 입장
            </h1>
            <p className="text-xs sm:text-sm text-[#6B625B] max-w-md mx-auto leading-relaxed">
              외부 서버로 로그인 정보가 전송되지 않는 독립형 환경입니다.<br className="hidden sm:inline" />
              작업자 프로필을 선택하거나 새로 생성하여 도화지를 시작하세요.
            </p>
          </div>

          {/* Segmented Control Tabs */}
          <div className="grid grid-cols-3 p-1.5 bg-[#EFE9DC] rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('quick')}
              className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'quick'
                  ? 'bg-white text-[#6B1D42] shadow-xs'
                  : 'text-[#6B625B] hover:text-[#231F20]'
              }`}
            >
              <UserCheck size={15} />
              <span>빠른 입장</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'custom'
                  ? 'bg-white text-[#6B1D42] shadow-xs'
                  : 'text-[#6B625B] hover:text-[#231F20]'
              }`}
            >
              <UserPlus size={15} />
              <span>디렉터 등록</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('guest')}
              className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'guest'
                  ? 'bg-white text-[#6B1D42] shadow-xs'
                  : 'text-[#6B625B] hover:text-[#231F20]'
              }`}
            >
              <Sparkles size={15} />
              <span>게스트 체험</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-[#FDE8E8] border border-[#F8B4B4] rounded-2xl text-[#9B1C1C] text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E02424]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tab 1: Quick Resume (Saved Profiles) */}
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-[#6B625B] flex items-center justify-between">
                <span>저장된 작업자 프로필</span>
                <span className="font-mono text-[11px] text-[#8E8377]">{savedProfiles.length}개 발견됨</span>
              </div>

              <div className="space-y-2.5">
                {savedProfiles.map((p) => (
                  <div
                    key={p.uid}
                    className="p-4 rounded-2xl bg-white border border-[#E5DFD3] hover:border-[#6B1D42] hover:shadow-xs transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#F7EFF3] text-[#6B1D42] font-serif font-black text-lg flex items-center justify-center border border-[#6B1D42]/20">
                        {p.displayName ? p.displayName[0] : 'D'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#111827] group-hover:text-[#6B1D42] transition-colors">
                            {p.displayName}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#6B625B] border border-[#E5DFD3]">
                            {p.role === 'ADMIN' ? '디렉터' : '멤버'}
                          </span>
                        </div>
                        <div className="text-xs text-[#8E8377] font-mono mt-0.5">
                          {p.email || '로컬 독립 프로필'} · {p.companyName || '독립 스튜디오'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleQuickLogin(p)}
                      className="px-4 py-2 min-h-[40px] rounded-xl bg-[#6B1D42] hover:bg-[#842352] text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>입장</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('custom')}
                  className="text-xs font-bold text-[#6B1D42] hover:underline"
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
                <label className="block text-xs font-bold text-[#231F20]">
                  디렉터 성함 또는 닉네임 <span className="text-[#6B1D42]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="예: 박대표, 김기획, 리드 아키텍트"
                  className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-white border border-[#D5CCBC] focus:border-[#6B1D42] focus:ring-2 focus:ring-[#6B1D42]/20 text-sm font-medium text-[#111827] outline-none transition-all placeholder:text-[#B5ABA0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#231F20]">
                    이메일 / 식별자 (선택)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="director@mycompany.com"
                    className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-white border border-[#D5CCBC] focus:border-[#6B1D42] focus:ring-2 focus:ring-[#6B1D42]/20 text-sm font-medium text-[#111827] outline-none transition-all placeholder:text-[#B5ABA0]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#231F20]">
                    조직 / 회사명 (선택)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="예: 고구마 기획팀, 스타트업 LAB"
                    className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-white border border-[#D5CCBC] focus:border-[#6B1D42] focus:ring-2 focus:ring-[#6B1D42]/20 text-sm font-medium text-[#111827] outline-none transition-all placeholder:text-[#B5ABA0]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#231F20]">
                    로컬 작업실 잠금 PIN (선택)
                  </label>
                  <span className="text-[11px] text-[#8E8377]">브라우저 잠금용 (4~8자리)</span>
                </div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="설정하지 않으면 즉시 입장 가능"
                  className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-white border border-[#D5CCBC] focus:border-[#6B1D42] focus:ring-2 focus:ring-[#6B1D42]/20 text-sm font-medium text-[#111827] outline-none transition-all placeholder:text-[#B5ABA0]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#6B1D42] focus:ring-[#6B1D42] border-[#D5CCBC]"
                  />
                  <span className="text-xs font-medium text-[#4B433C]">
                    이 브라우저에 작업자 프로필 저장 및 자동 기억
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 min-h-[46px] rounded-2xl bg-[#6B1D42] hover:bg-[#842352] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <span>디렉터로 도화지 작업실 입장</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Tab 3: Instant Guest Access */}
          {activeTab === 'guest' && (
            <div className="p-6 rounded-2xl bg-white border border-[#E5DFD3] space-y-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#EFE9DC] text-[#6B1D42] flex items-center justify-center mx-auto text-xl font-bold">
                🎯
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-base text-[#111827]">
                  익명 게스트 즉시 둘러보기
                </h3>
                <p className="text-xs text-[#6B625B] max-w-sm mx-auto leading-relaxed">
                  이름이나 정보 입력 없이 1초 만에 도화지 작업실에 진입합니다.
                  작성하신 기획안은 게스트 세션 동안 브라우저에 정상 보존됩니다.
                </p>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleGuestLogin}
                className="w-full py-3.5 px-6 min-h-[46px] rounded-2xl bg-[#231F20] hover:bg-[#3D3734] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <span>게스트 세션으로 즉시 시작</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Local-First Architecture Guarantee Notice */}
          <div className="p-4 rounded-2xl bg-[#EFE9DC]/60 border border-[#E5DFD3] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#4A423A]">
              <HardDrive size={15} className="text-[#6B1D42]" />
              <span>GOGUMA 무서버 독립 아키텍처 보증</span>
            </div>
            <p className="text-[11px] text-[#6B625B] leading-relaxed">
              본 애플리케이션은 계정 정보와 기획 문서가 외부 클라우드로 유출되지 않는 100% 로컬 샌드박스입니다. 
              언제든지 상단 헤더의 <strong>[작업실 잠금]</strong> 버튼을 통해 세션을 종료할 수 있습니다.
            </p>
          </div>

        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="py-4 text-center text-xs text-[#8E8377] border-t border-[#E5DFD3] bg-[#FAF7F2]">
        <span>GOGUMA Free Software (MIT) · Zero Server Telemetry · Local IndexedDB Encrypted</span>
      </footer>
    </div>
  );
}
