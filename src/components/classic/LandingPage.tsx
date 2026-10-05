import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Sparkles, Box, Zap, Lock,
  ArrowRight, HardDrive, CheckCircle2, Cpu, FileCode2
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import Footer from './layout/Footer';

export default function LandingPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f1f1f0] flex flex-col selection:bg-goguma-light selection:text-goguma">
      <div className="flex flex-col lg:flex-row flex-1 relative">
        {/* Left Pane - Strategic Architecture View */}
        <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col bg-zinc-950 text-white relative overflow-hidden border-r border-white/5">
          {/* Technical Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
          />
          
          {/* Header Rail */}
          <div className="flex items-center justify-between gap-6 relative z-10 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-goguma flex items-center justify-center text-white shadow-lg shadow-goguma/20">
                <Sparkles size={20} />
              </div>
              <span className="text-xl font-black uppercase tracking-tighter text-white">GOGUMA STUDIO</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% LOCAL FIRST
            </div>
          </div>

          <div className="my-auto space-y-8 relative z-10 py-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-zinc-400">
              <HardDrive size={14} className="text-goguma" />
              <span>SECURITY FIRST: CLIENT-SANDBOXED STORAGE</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-none uppercase">
                Zero Server Login.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-goguma-bright via-purple-300 to-indigo-300">
                  Total Local Privacy.
                </span>
              </h1>
              <p className="text-zinc-400 font-medium leading-relaxed max-w-lg text-sm">
                {language === 'ko' 
                  ? '외부 서버로 로그인 정보나 기획 데이터가 일체 전송되지 않는 완전한 Local First 아키텍처입니다. 브라우저 내부에서 즉시 안전하게 작동합니다.'
                  : 'A pure Local-First platform where all specifications, designs, and credentials remain strictly on your client machine with zero server transmission.'}
              </p>
            </div>

            {/* Architecture Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-goguma-bright text-xs font-black uppercase">
                  <ShieldCheck size={14} /> Local Isolation
                </div>
                <div className="text-xl font-black text-white">100% Private</div>
                <p className="text-[10px] text-zinc-500 font-bold">No remote auth database or tracking</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase">
                  <Zap size={14} /> Zero Latency
                </div>
                <div className="text-xl font-black text-white">0ms Auth Lag</div>
                <p className="text-[10px] text-zinc-500 font-bold">Instant offline startup</p>
              </div>
            </div>

            {/* Security Feature Checklist */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-3 text-xs text-zinc-300 font-bold">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{language === 'ko' ? '이메일 / 비밀번호 입력 불필요 (비밀번호 없는 로컬 세션)' : 'No email or password required (Passwordless Local Session)'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-300 font-bold">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{language === 'ko' ? '기획서 및 프롬프트 로컬 암호화 스토리지 격리' : 'Encrypted browser local sandbox for specifications and prompts'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-300 font-bold">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{language === 'ko' ? '네트워크 단절 상태에서도 100% 정상 작동하는 오프라인 퍼스트' : 'Full offline functionality without reliance on cloud auth services'}</span>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="pt-8 flex items-center justify-between border-t border-white/5 relative z-10 text-[11px] text-zinc-500 font-bold">
            <span className="flex items-center gap-2">
              <Cpu size={14} /> GOGUMA Engine v3.0 Local
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-zinc-400">ISOLATED</span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-zinc-400">STANDALONE</span>
            </div>
          </div>

          {/* Atmospheric Glow */}
          <div className="absolute top-1/4 -right-20 w-[400px] h-[400px] bg-goguma-bright/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        </div>

        {/* Right Pane - Immediate Entry Card */}
        <div className="lg:w-1/2 p-8 lg:px-20 lg:py-16 flex flex-col justify-center bg-white">
          <div className="w-full max-w-md mx-auto space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-goguma-light border border-goguma/20 text-[10px] font-black uppercase tracking-widest text-goguma">
                <ShieldCheck size={12} /> Local-First Active
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight uppercase">
                {language === 'ko' ? '로컬 작업 환경' : 'Local Workspace'}
              </h2>
              <p className="text-zinc-500 font-medium text-xs leading-relaxed">
                {language === 'ko'
                  ? '서버 로그인이나 계정 인증 절차 없이, 즉시 보안이 보장된 로컬 환경에서 사이트 기획과 AI 아키텍처 설계를 시작할 수 있습니다.'
                  : 'Start planning and architecting directly in your secure local browser environment with zero external sign-in barriers.'}
              </p>
            </div>

            {/* Launch Action */}
            <div className="space-y-4 pt-2">
              <button
                type="button"
                onClick={() => navigate('/workspace')}
                className="w-full py-5 rounded-2xl bg-zinc-900 hover:bg-goguma text-white font-black text-sm flex items-center justify-center gap-3 shadow-xl hover:shadow-goguma/25 transition-all duration-300 group"
              >
                <span>{language === 'ko' ? '로컬 워크스페이스 시작하기' : 'Enter Local Workspace'}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="py-3.5 px-4 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-zinc-50 hover:bg-white text-zinc-800 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <Box size={14} className="text-zinc-500" />
                  <span>{language === 'ko' ? '디렉터 로그인 / 입장' : 'Login Gateway'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="py-3.5 px-4 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-zinc-50 hover:bg-white text-zinc-800 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Lock size={14} className="text-zinc-500" />
                  <span>{language === 'ko' ? '로컬 보안 설정' : 'Security Settings'}</span>
                </button>
              </div>
            </div>

            {/* Technical Trust Callout */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-black text-zinc-800">
                <FileCode2 size={14} className="text-goguma" />
                <span>{language === 'ko' ? '보안 우선 로컬 아키텍처 안내' : 'Security-First Architecture Notice'}</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                {language === 'ko' 
                  ? '본 애플리케이션은 사용자의 프라이버시 보호를 위해 일체의 서버 로그인(이메일/비밀번호) 및 원격 계정 연동을 완전히 제거하고, 브라우저 로컬 저장소만을 활용하는 독립된 Local-First 환경으로 구성되어 있습니다.'
                  : 'This application has removed all server logins (email/password) and remote authentication services. All project artifacts remain securely sandboxed in your local browser storage.'}
              </p>
            </div>

            <div className="text-center pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                <Sparkles size={10} /> Local Isolated Environment Enforced
              </span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
