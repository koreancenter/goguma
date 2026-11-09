import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, ArrowRight, HardDrive, CheckCircle2, Cpu, FileCode2, Box, Lock
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import Footer from './layout/Footer';

export default function LandingPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#18181B] flex flex-col selection:bg-[#FEF3C7] selection:text-[#78350F] font-sans">
      <div className="flex flex-col lg:flex-row flex-1 relative">
        {/* Left Pane - Strategic Architecture View (Sunny Hanji & Sandstone) */}
        <div className="lg:w-1/2 p-10 sm:p-14 lg:p-20 flex flex-col bg-[#F8F7F4] text-stone-900 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-stone-200/90">
          {/* Subtle Hairline Grid Matrix */}
          <div 
            className="absolute inset-0 opacity-[0.4] pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(circle, #D4D4D8 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
          />
          
          {/* Header Rail */}
          <div className="flex items-center justify-between gap-6 relative z-10 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[2px] bg-[#D97706] text-white flex items-center justify-center font-black text-sm shadow-xs">
                G
              </div>
              <span className="text-base font-bold uppercase tracking-wider text-stone-900">GOGUMA STUDIO</span>
            </div>
            
            {/* Unboxed Status Metadata (Zero-Pill Discipline) */}
            <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
              <span className="text-stone-400">SYSTEM</span>
              <span className="text-stone-300">/</span>
              <span className="text-[#D97706] uppercase tracking-widest font-semibold">100% LOCAL FIRST</span>
            </div>
          </div>

          <div className="my-auto space-y-8 relative z-10 py-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[2px] bg-amber-100/70 border border-amber-300/60 text-xs font-mono text-amber-900">
              <HardDrive size={13} className="text-[#D97706]" />
              <span className="tracking-wider">SECURITY FIRST: CLIENT-SANDBOXED STORAGE</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] uppercase text-stone-900" style={{ textWrap: 'balance' }}>
                Zero Server Login.<br />
                <span className="text-amber-800">
                  Total Local Privacy.
                </span>
              </h1>
              <p className="text-stone-600 font-normal leading-relaxed max-w-lg text-sm sm:text-base">
                {language === 'ko' 
                  ? '외부 서버로 로그인 정보나 기획 데이터가 일체 전송되지 않는 완전한 Local First 아키텍처입니다. 브라우저 내부에서 즉시 안전하게 작동합니다.'
                  : 'A pure Local-First platform where all specifications, designs, and credentials remain strictly on your client machine with zero server transmission.'}
              </p>
            </div>

            {/* Architecture Metrics Grid (Minimalist Hairlines) */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-200">
              <div className="p-4 rounded-[2px] bg-white border border-stone-200/90 space-y-1 shadow-2xs">
                <div className="flex items-center gap-2 text-stone-600 text-xs font-mono uppercase tracking-wider">
                  <ShieldCheck size={14} className="text-emerald-600" /> Local Isolation
                </div>
                <div className="text-2xl font-bold text-stone-900 tracking-tight font-mono">100% Private</div>
                <p className="text-xs text-stone-500">No remote auth database or tracking</p>
              </div>
              <div className="p-4 rounded-[2px] bg-white border border-stone-200/90 space-y-1 shadow-2xs">
                <div className="flex items-center gap-2 text-stone-600 text-xs font-mono uppercase tracking-wider">
                  <Cpu size={14} className="text-[#D97706]" /> Zero Latency
                </div>
                <div className="text-2xl font-bold text-stone-900 tracking-tight font-mono">0ms Lag</div>
                <p className="text-xs text-stone-500">Instant offline startup</p>
              </div>
            </div>

            {/* Security Feature Checklist */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-3 text-xs text-stone-700">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>{language === 'ko' ? '이메일 / 비밀번호 입력 불필요 (비밀번호 없는 로컬 세션)' : 'No email or password required (Passwordless Local Session)'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-stone-700">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>{language === 'ko' ? '기획서 및 프롬프트 로컬 암호화 스토리지 격리' : 'Encrypted browser local sandbox for specifications and prompts'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-stone-700">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>{language === 'ko' ? '네트워크 단절 상태에서도 100% 정상 작동하는 오프라인 퍼스트' : 'Full offline functionality without reliance on cloud auth services'}</span>
              </div>
            </div>
          </div>

          {/* Footer Rail */}
          <div className="pt-8 flex items-center justify-between border-t border-stone-200 relative z-10 text-xs text-stone-500 font-mono">
            <span className="flex items-center gap-2 text-stone-700">
              <Cpu size={14} className="text-[#D97706]" /> GOGUMA Engine Local
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-[2px] bg-stone-100 border border-stone-200 text-[10px] text-stone-600">ISOLATED</span>
              <span className="px-2 py-0.5 rounded-[2px] bg-stone-100 border border-stone-200 text-[10px] text-stone-600">STANDALONE</span>
            </div>
          </div>
        </div>

        {/* Right Pane - Immediate Entry Card (Crisp Stark Luxury Minimalism) */}
        <div className="lg:w-1/2 p-8 sm:p-14 lg:p-20 flex flex-col justify-center bg-white border-t lg:border-t-0 lg:border-l border-stone-200/90">
          <div className="w-full max-w-md mx-auto space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#D97706] uppercase tracking-widest font-semibold">
                <ShieldCheck size={14} className="text-[#D97706]" />
                <span>Local-First Workspace</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-semibold text-stone-900 tracking-tight uppercase">
                {language === 'ko' ? '로컬 작업 환경' : 'Local Workspace'}
              </h2>
              <p className="text-stone-600 font-normal text-xs sm:text-sm leading-relaxed">
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
                className="w-full py-4 px-6 rounded-[2px] bg-[#D97706] hover:bg-[#B45309] active:bg-[#92400E] text-white font-semibold text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer group shadow-xs tracking-wide"
              >
                <span>{language === 'ko' ? '로컬 워크스페이스 시작하기' : 'Enter Local Workspace'}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="py-3 px-4 rounded-[2px] border border-stone-200 hover:border-amber-300 bg-stone-50 hover:bg-stone-100 text-stone-800 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                >
                  <Box size={14} className="text-[#D97706]" />
                  <span>{language === 'ko' ? '디렉터 입장 게이트웨이' : 'Director Gateway'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="py-3 px-4 rounded-[2px] border border-stone-200 hover:border-amber-300 bg-stone-50 hover:bg-stone-100 text-stone-800 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                >
                  <Lock size={14} className="text-[#D97706]" />
                  <span>{language === 'ko' ? '로컬 보안 설정' : 'Security Settings'}</span>
                </button>
              </div>
            </div>

            {/* Technical Trust Callout */}
            <div className="p-4 rounded-[2px] bg-amber-50/60 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-950">
                <FileCode2 size={14} className="text-[#D97706]" />
                <span>{language === 'ko' ? '보안 우선 로컬 아키텍처 안내' : 'Security-First Architecture Notice'}</span>
              </div>
              <p className="text-xs text-stone-600 font-normal leading-relaxed">
                {language === 'ko' 
                  ? '본 애플리케이션은 사용자의 프라이버시 보호를 위해 일체의 서버 로그인(이메일/비밀번호) 및 원격 계정 연동을 완전히 배제하고, 브라우저 로컬 저장소만을 활용하는 독립된 Local-First 환경으로 구성되어 있습니다.'
                  : 'This application has removed all server logins (email/password) and remote authentication services. All project artifacts remain securely sandboxed in your local browser storage.'}
              </p>
            </div>

            {/* Quiet Unboxed Enforced Notice */}
            <div className="text-center pt-2">
              <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
                Local Isolated Environment Enforced · Zero Telemetry
              </span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
