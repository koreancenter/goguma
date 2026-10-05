import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  HelpCircle, Book, Shield, ArrowLeft, Key, Laptop, HardDrive, 
  FolderArchive, Sparkles, ExternalLink, ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { LocalBackupModal } from '../LocalBackupModal';
import { AISettingsModal } from '../../guide/AISettingsModal';

export default function CustomerService() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);

  const guides = [
    {
      icon: Key,
      title: language === 'ko' ? 'Gemini 무료 API 키 등록 (BYOK)' : 'BYOK Gemini API Key',
      description: language === 'ko' 
        ? 'Google AI Studio에서 발급받은 개인 무료 API 키를 등록하여 클라우드 제한 없이 빠른 속도로 기획안을 생성합니다.'
        : 'Connect your personal Google AI Studio API key for high-speed cloud generation with zero SaaS subscriptions.',
      actionText: language === 'ko' ? '키 설정 열기' : 'Configure API Key',
      action: () => setIsAISettingsOpen(true),
      color: 'text-goguma',
      bg: 'bg-fuchsia-50'
    },
    {
      icon: Laptop,
      title: language === 'ko' ? 'WebLLM 브라우저 로컬 AI' : 'WebLLM In-Browser AI',
      description: language === 'ko'
        ? '서버 설치 없이 WebGPU 가속을 통해 브라우저 안에서 Llama-3 / Gemma-2 로컬 모델을 즉시 구동합니다.'
        : 'Run Llama-3 or Gemma-2 locally inside your browser via WebGPU with zero installations.',
      actionText: language === 'ko' ? '모델 설정 열기' : 'Launch WebLLM',
      action: () => setIsAISettingsOpen(true),
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      icon: HardDrive,
      title: language === 'ko' ? 'Ollama 오프라인 로컬 서버' : 'Ollama Offline Server',
      description: language === 'ko'
        ? '내 PC(localhost:11434)에서 실행 중인 Ollama의 오픈소스 LLM을 연동하여 완전한 오프라인 환경을 구축합니다.'
        : 'Connect to your local Ollama instance (localhost:11434) for 100% private, offline generation.',
      actionText: language === 'ko' ? 'Ollama 연결 설정' : 'Connect Ollama',
      action: () => setIsAISettingsOpen(true),
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    {
      icon: FolderArchive,
      title: language === 'ko' ? '로컬 데이터 백업 및 복원' : 'Data Backup & Restore',
      description: language === 'ko'
        ? '모든 기획 데이터는 브라우저 로컬에 저장됩니다. JSON 파일로 백업하고 언제든 다른 기기로 복원할 수 있습니다.'
        : 'All architecture projects stay on your device. Export to JSON or restore anytime with one click.',
      actionText: language === 'ko' ? '백업 관리 열기' : 'Open Backup Hub',
      action: () => setIsBackupOpen(true),
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ];

  return (
    <>
    <div className="min-h-screen bg-slate-50 pt-28 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <button 
          onClick={() => navigate('/workspace')}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-12"
        >
          <ArrowLeft size={14} />
          {language === 'ko' ? '워크스페이스로 돌아가기' : 'Back to Workspace'}
        </button>

        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide">
            <ShieldCheck size={14} />
            {language === 'ko' ? '공개 소프트웨어 안내 & 가이드' : 'Open Software & Privacy Guide'}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase">
            {language === 'ko' ? '도움말 및 로컬 데이터 가이드' : 'Help & Local Data Guide'}
          </h1>
          <p className="text-slate-500 font-medium max-w-xl mx-auto text-sm sm:text-base">
            {language === 'ko'
              ? 'GOGUMA는 개인에게 무료로 배포되는 공개 소프트웨어입니다. 사용자 기기 중심의 안전한 로컬 기획 환경을 지원합니다.'
              : 'GOGUMA is free, privacy-first software for individuals. Plan, design, and export with zero subscription lock-in.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide, index) => (
            <motion.div
              key={guide.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:border-slate-400 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3.5 ${guide.bg} ${guide.color} rounded-2xl`}>
                    <guide.icon size={22} />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    STEP 0{index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">
                  {guide.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                  {guide.description}
                </p>
              </div>

              <button
                onClick={guide.action}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-2xs"
              >
                <span>{guide.actionText}</span>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Local Storage FAQ Section */}
        <div className="mt-16 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 space-y-6">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Shield size={20} className="text-goguma" />
            {language === 'ko' ? '자주 묻는 질문 (FAQ)' : 'Frequently Asked Questions'}
          </h2>

          <div className="space-y-4 divide-y divide-slate-100 text-xs">
            <div className="pt-4 space-y-1.5">
              <h4 className="font-black text-slate-900 text-sm">
                Q. {language === 'ko' ? '내 기획안 데이터는 어디에 저장되나요?' : 'Where is my project data stored?'}
              </h4>
              <p className="text-slate-500 leading-relaxed">
                {language === 'ko'
                  ? '모든 기획 데이터(사이트맵, 아키텍처, 프롬프트 등)는 브라우저의 로컬 저장소(localStorage)에 100% 저장됩니다. 외부 서버로 자동 전송되지 않으므로 브라우저 캐시를 지우기 전 백업 파일(JSON)을 내보내 두세요.'
                  : 'All your architecture blueprints, sitemaps, and extracted prompts are stored 100% inside your browser localStorage. No data is sent to external servers.'}
              </p>
            </div>

            <div className="pt-4 space-y-1.5">
              <h4 className="font-black text-slate-900 text-sm">
                Q. {language === 'ko' ? 'Gemini API 키가 안전한가요?' : 'Is my Gemini API key secure?'}
              </h4>
              <p className="text-slate-500 leading-relaxed">
                {language === 'ko'
                  ? '입력하신 개인 API 키는 귀하의 로컬 브라우저에만 저장되며, AI 요청 시 Google의 공식 Gemini 엔드포인트로만 전송됩니다. 제3자 서버에 수집되거나 공유되지 않습니다.'
                  : 'Your API key is saved exclusively in your local browser sandbox and transmitted only directly to Google official endpoints. It is never logged or stored remotely.'}
              </p>
            </div>

            <div className="pt-4 space-y-1.5">
              <h4 className="font-black text-slate-900 text-sm">
                Q. {language === 'ko' ? '인터넷 연결 없이도 작동하나요?' : 'Can I use this completely offline?'}
              </h4>
              <p className="text-slate-500 leading-relaxed">
                {language === 'ko'
                  ? '네! AI 엔진 설정에서 Ollama를 선택하고 로컬 PC의 LLM(Llama 3, DeepSeek 등)과 연동하면 비행기 모드나 완전한 폐쇄망에서도 모든 기능을 사용할 수 있습니다.'
                  : 'Yes! Select Ollama or pre-cache a WebLLM model, and you can build web architectures with zero internet connection.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <LocalBackupModal isOpen={isBackupOpen} onClose={() => setIsBackupOpen(false)} />
    <AISettingsModal isOpen={isAISettingsOpen} onClose={() => setIsAISettingsOpen(false)} />
    </>
  );
}
