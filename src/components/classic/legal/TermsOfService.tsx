import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Code2, ArrowLeft, Terminal, Copy, Check, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F7F8FA] text-[#111827] pt-28 pb-24 font-sans selection:bg-[#1E3A8A]/15 selection:text-[#111827]">
      <div className="max-w-4xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#6B7280] hover:text-[#111827] transition-colors mb-10 cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#1E3A8A]" />
          <span>{language === 'ko' ? '돌아가기' : 'Back'}</span>
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFFFFF] rounded-2xl p-8 sm:p-14 border border-[#E5E7EB] shadow-[0_12px_32px_-4px_rgba(15,23,42,0.06)] space-y-10"
        >
          <div className="flex items-center gap-4 border-b border-[#E5E7EB] pb-6">
            <div className="w-10 h-10 bg-[#EFF6FF] border border-[#1E3A8A]/15 text-[#1E3A8A] rounded-xl flex items-center justify-center font-bold">
              <Code2 size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#1E3A8A] font-semibold">LEGAL & OPEN SOURCE</span>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#111827] tracking-tight uppercase mt-0.5">
                {language === 'ko' ? '오픈소스 라이선스 & 커뮤니티 정책' : 'Open Source License & Community Terms'}
              </h1>
            </div>
          </div>

          <div className="space-y-8 text-[#374151] leading-relaxed text-sm">
            <section className="p-5 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl">
              <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider flex items-center gap-2 mb-2">
                <Sparkles size={15} className="text-[#1E3A8A]" />
                <span>{language === 'ko' ? '자유 소프트웨어 선언' : 'Free Software Commitment'}</span>
              </h2>
              <p className="text-xs text-[#4B5563] leading-relaxed font-sans">
                {language === 'ko'
                  ? 'GOGUMA는 누구나 무료로 다운로드하고, 사용하며, 변경할 수 있는 오픈소스 프로젝트입니다. 유료 구독 요금제, 상업적 사용 제한, 라이선스 검증 서버가 일체 존재하지 않습니다.'
                  : 'GOGUMA is free software under the permissive MIT license. There are no paywalls, recurring subscriptions, or commercial restrictions.'}
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider flex items-center gap-2">
                  <Terminal size={15} className="text-[#1E3A8A]" />
                  <span>MIT License (Official Text)</span>
                </h2>
                <button
                  onClick={copyLicense}
                  className="flex items-center gap-1.5 text-xs font-mono text-[#374151] hover:text-[#1E3A8A] transition-colors px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] hover:bg-[#EFF6FF] cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-[#1E3A8A]" /> : <Copy size={13} className="text-[#1E3A8A]" />}
                  <span>{copied ? (language === 'ko' ? '복사 완료' : 'Copied') : (language === 'ko' ? '라이선스 복사' : 'Copy')}</span>
                </button>
              </div>
              <pre className="p-5 bg-[#F7F8FA] text-[#111827] rounded-xl text-xs font-mono leading-relaxed overflow-x-auto border border-[#E5E7EB]">
                {mitText}
              </pre>
            </section>

            <section className="space-y-2.5">
              <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider">
                {language === 'ko' ? '1. 데이터 소유권 및 프라이버시 (Local-First Guarantee)' : '1. Data Ownership & Privacy'}
              </h2>
              <p className="text-[#4B5563] text-xs sm:text-sm leading-relaxed">
                {language === 'ko'
                  ? '사용자가 GOGUMA 워크스페이스에서 작성한 모든 시스템 기획안, 사이트맵, 컴포넌트 명세서 데이터는 사용자의 로컬 브라우저에 저장됩니다. 외부 중앙 서버로 일체 자동 전송되지 않으며, 사용자는 언제든 표준 JSON 형식으로 데이터를 내보내거나 가져올 수 있습니다.'
                  : 'All architectural diagrams, sitemaps, and specifications created in GOGUMA are stored directly in your local browser sandbox. No user project data is sent to central servers without user initiation.'}
              </p>
            </section>

            <section className="space-y-2.5">
              <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider">
                {language === 'ko' ? '2. 독립적인 AI 추론 환경 (BYOK & Local Models)' : '2. Independent AI Inference (BYOK)'}
              </h2>
              <p className="text-[#4B5563] text-xs sm:text-sm leading-relaxed">
                {language === 'ko'
                  ? 'AI 보조 기능을 활성화할 경우 사용자가 보유한 Google Gemini 무료 API 키(BYOK)를 등록하거나 브라우저 내장 WebLLM, 또는 오프라인 로컬 Ollama를 직접 선택할 수 있습니다. 각 추론 요청은 사용자의 설정에 따라 해당 엔드포인트와 직접 통신합니다.'
                  : 'AI assistance connects either directly to your own Gemini API key (BYOK), runs on-device using WebGPU WebLLM, or connects to your local Ollama instance.'}
              </p>
            </section>

            <section className="space-y-2.5">
              <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider">
                {language === 'ko' ? '3. 보증의 배제 (Disclaimer of Warranties)' : '3. Disclaimer of Warranties'}
              </h2>
              <p className="text-[#4B5563] text-xs sm:text-sm leading-relaxed">
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
