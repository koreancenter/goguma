import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Code2, ArrowLeft, Heart, Sparkles, Terminal, Copy, Check } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const mitText = `MIT License

Copyright (c) 2024-2026 GOGUMA Contributors & Community

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

  const copyLicense = () => {
    navigator.clipboard.writeText(mitText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-12"
        >
          <ArrowLeft size={14} />
          {language === 'ko' ? '돌아가기' : 'Back'}
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] p-8 sm:p-14 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-10"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-goguma/10 text-goguma rounded-2xl">
              <Code2 size={24} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
                {language === 'ko' ? '오픈소스 라이선스 & 커뮤니티 정책' : 'Open Source License & Community Terms'}
              </h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                MIT License • 100% Free & Local-First Architecture Software
              </p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 font-medium text-slate-600 leading-relaxed text-sm">
            <section className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <h2 className="text-base font-black text-emerald-950 uppercase tracking-tight flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-emerald-600" />
                {language === 'ko' ? '자유 소프트웨어 선언' : 'Free Software Commitment'}
              </h2>
              <p className="text-xs text-emerald-900 leading-relaxed">
                {language === 'ko'
                  ? 'GOGUMA는 누구나 무료로 다운로드하고, 사용하며, 변경할 수 있는 오픈소스 프로젝트입니다. 유료 구독 요금제, 상업적 사용 제한, 라이선스 검증 서버가 일체 존재하지 않습니다.'
                  : 'GOGUMA is free software under the permissive MIT license. There are no paywalls, recurring subscriptions, or commercial restrictions.'}
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Terminal size={18} className="text-goguma" />
                  <span>MIT License (Official Text)</span>
                </h2>
                <button
                  onClick={copyLicense}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-goguma transition-colors px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? (language === 'ko' ? '복사 완료' : 'Copied') : (language === 'ko' ? '라이선스 복사' : 'Copy')}</span>
                </button>
              </div>
              <pre className="p-5 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono leading-relaxed overflow-x-auto border border-slate-800">
                {mitText}
              </pre>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {language === 'ko' ? '1. 데이터 소유권 및 프라이버시 (Local-First Guarantee)' : '1. Data Ownership & Privacy'}
              </h2>
              <p>
                {language === 'ko'
                  ? '사용자가 GOGUMA 워크스페이스에서 작성한 모든 시스템 기획안, 사이트맵, 컴포넌트 명세서 데이터는 사용자의 로컬 브라우저에 저장됩니다. 외부 중앙 서버로 일체 자동 전송되지 않으며, 사용자는 언제든 표준 JSON 형식으로 데이터를 내보내거나 가져올 수 있습니다.'
                  : 'All architectural diagrams, sitemaps, and specifications created in GOGUMA are stored directly in your local browser sandbox. No user project data is sent to central servers without user initiation.'}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {language === 'ko' ? '2. 독립적인 AI 추론 환경 (BYOK & Local Models)' : '2. Independent AI Inference (BYOK)'}
              </h2>
              <p>
                {language === 'ko'
                  ? 'AI 보조 기능을 활성화할 경우 사용자가 보유한 Google Gemini 무료 API 키(BYOK)를 등록하거나 브라우저 내장 WebLLM, 또는 오프라인 로컬 Ollama를 직접 선택할 수 있습니다. 각 추론 요청은 사용자의 설정에 따라 해당 엔드포인트와 직접 통신합니다.'
                  : 'AI assistance connects either directly to your own Gemini API key (BYOK), runs on-device using WebGPU WebLLM, or connects to your local Ollama instance.'}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {language === 'ko' ? '3. 보증의 배제 (Disclaimer of Warranties)' : '3. Disclaimer of Warranties'}
              </h2>
              <p>
                {language === 'ko'
                  ? 'MIT 라이선스에 명시된 바와 같이 본 소프트웨어는 상품성이나 특정 목적에의 적합성에 대한 보증을 포함하여 일체의 명시적 또는 묵시적 보증 없이 "있는 그대로(AS-IS)" 제공됩니다.'
                  : 'As stated in the MIT license, the software is provided "as is", without warranty of any kind, express or implied.'}
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
