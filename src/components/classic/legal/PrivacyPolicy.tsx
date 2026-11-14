import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, ArrowLeft, ShieldCheck, Cpu, HardDrive, Sparkles } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#111827] pt-28 pb-24 px-4 sm:px-6 font-sans selection:bg-[#1E3A8A]/15 selection:text-[#111827]">
      <div className="max-w-4xl mx-auto">
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
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-[#E5E7EB] pb-6">
            <div className="w-10 h-10 bg-[#EFF6FF] border border-[#1E3A8A]/15 text-[#1E3A8A] rounded-xl flex items-center justify-center font-bold">
              <Shield size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#1E3A8A] font-semibold">PRIVACY ASSURANCE</span>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#111827] tracking-tight uppercase mt-0.5">
                {language === 'ko' ? '개인정보처리방침' : 'Privacy Policy'}
              </h1>
            </div>
          </div>

          {/* Banner */}
          <div className="p-4 bg-[#EFF6FF] border border-[#1E3A8A]/15 rounded-xl flex items-start gap-3">
            <ShieldCheck className="text-[#1E3A8A] shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-[#374151] leading-relaxed font-sans">
              {language === 'ko' ? (
                <>
                  <strong className="text-[#111827] font-semibold block mb-1">결제 정보 및 수입 내역 일체 비수집 보장:</strong>
                  고구마(GOGUMA)는 100% 무료 오픈소스 아키텍처 소프트웨어입니다. 유료 구독, 결제 대행사(PG사), 수입 정산 모듈이 존재하지 않으므로, <strong className="text-[#111827]">신용카드 번호, 결제 내역, 수입 및 정산 데이터</strong>를 일체 수집·보관·처리하지 않습니다.
                </>
              ) : (
                <>
                  <strong className="text-[#111827] font-semibold block mb-1">Zero Payment & Financial Data Guarantee:</strong>
                  GOGUMA is 100% free and open-source architecture software. We do not operate paid subscriptions or billing gateways, and we <strong className="text-[#111827]">never collect or store credit card details, payment histories, or revenue/income records</strong>.
                </>
              )}
            </div>
          </div>

          {/* Detailed Policy Sections */}
          <div className="space-y-8 text-[#374151] leading-relaxed text-sm">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={14} className="text-[#1E3A8A]" />
                <span>{language === 'ko' ? '1. 수집하는 개인정보 항목 및 비수집 원칙' : '1. Information We Collect & Zero-Payment Principle'}</span>
              </h2>
              <p className="text-xs text-[#4B5563]">
                {language === 'ko' ? (
                  '당사는 서비스 제공에 꼭 필요한 최소한의 로컬 환경 설정 정보만을 처리하며, 영리 목적의 결제나 금융 정보는 원천적으로 수집하지 않습니다.'
                ) : (
                  'We only process minimal operational preferences needed for local workspace tools. No commercial payment or financial data is collected.'
                )}
              </p>
              <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FFFFFF]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F8FA] text-[#111827] font-mono text-[11px] uppercase border-b border-[#E5E7EB]">
                    <tr>
                      <th className="p-3">{language === 'ko' ? '구분' : 'Category'}</th>
                      <th className="p-3">{language === 'ko' ? '처리 항목' : 'Items'}</th>
                      <th className="p-3">{language === 'ko' ? '처리 목적 및 보관 장소' : 'Purpose & Storage'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] text-[#374151] font-sans">
                    <tr>
                      <td className="p-3 font-semibold text-[#111827]">{language === 'ko' ? '워크스페이스 기획 데이터' : 'Workspace Data'}</td>
                      <td className="p-3">{language === 'ko' ? '사이트맵, 구조도, 컴포넌트 명세서' : 'Sitemaps, diagrams, specs'}</td>
                      <td className="p-3 text-[#4B5563]">{language === 'ko' ? '브라우저 로컬 저장소(IndexedDB) 보관 (중앙 서버 미전송)' : 'Stored in local browser sandbox'}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-[#111827]">{language === 'ko' ? 'AI 추론 키 (선택)' : 'AI API Key (Optional)'}</td>
                      <td className="p-3">{language === 'ko' ? '개인 BYOK Gemini API 키' : 'User-provided BYOK key'}</td>
                      <td className="p-3 text-[#4B5563]">{language === 'ko' ? '브라우저 로컬 암호화 저장 후 AI 제공사에 직접 요청' : 'Encrypted locally for direct calls'}</td>
                    </tr>
                    <tr className="bg-[#EFF6FF]">
                      <td className="p-3 font-semibold text-[#1E3A8A]">{language === 'ko' ? '결제 및 금융 정보' : 'Payment & Financial'}</td>
                      <td className="p-3 text-[#4B5563]">{language === 'ko' ? '카드번호, 계좌정보, 수입·정산 내역' : 'Credit cards, bank accounts, income'}</td>
                      <td className="p-3 text-[#1E3A8A] font-mono font-semibold">{language === 'ko' ? '★ 일체 수집하지 않음 (비영리 무료 원칙)' : '★ Never collected (Zero Financial Data)'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-2.5">
              <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider flex items-center gap-2">
                <HardDrive size={14} className="text-[#1E3A8A]" />
                <span>{language === 'ko' ? '2. 로컬 우선 저장 및 제로 텔레메트리 (Local-First Guarantee)' : '2. Local-First Architecture & Zero Telemetry'}</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                {language === 'ko'
                  ? 'GOGUMA에서 생성하는 시스템 설계도 및 다이어그램은 중앙 서버에 저장되지 않습니다. 모든 기획 데이터는 사용자의 웹 브라우저 로컬 저장소(IndexedDB / LocalStorage)에 격리 보관되며, 사용자가 브라우저 캐시를 지우거나 초기화할 경우 즉시 영구 파기됩니다.'
                  : 'All diagrams and architecture specifications created in GOGUMA remain on your device. We do not operate remote databases storing your documents. Clearing your browser cache or pressing data reset deletes all local records permanently.'}
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-2.5">
              <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider flex items-center gap-2">
                <Cpu size={14} className="text-[#1E3A8A]" />
                <span>{language === 'ko' ? '3. AI 추론 연동 및 모델 학습 배제 (BYOK Policy)' : '3. AI Processing & Training Exclusion (BYOK)'}</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                {language === 'ko'
                  ? '사용자가 AI 보조 기능을 활용할 때 입력하는 프롬프트는 Google Gemini API 공식 보안 지침에 따라 모델 학습에 활용되지 않습니다. 또한 브라우저 내장 WebLLM이나 로컬 Ollama를 사용하는 경우 외부 네트워크 전송 없이 기기 내부에서 100% 로컬 처리됩니다.'
                  : 'Prompts processed via your Bring-Your-Own-Key (BYOK) Gemini API are protected under enterprise API safety guidelines and are not used to train models. Alternatively, on-device WebLLM or local Ollama instances operate 100% offline.'}
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-2.5">
              <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider flex items-center gap-2">
                <Lock size={14} className="text-[#1E3A8A]" />
                <span>{language === 'ko' ? '4. 데이터 주권 및 파기 권한' : '4. Data Ownership & Portability'}</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                {language === 'ko'
                  ? '사용자는 언제든지 작업한 워크스페이스 데이터를 표준 JSON 파일로 다운로드하여 외부로 이전할 수 있으며, 원클릭 초기화를 통해 기기 내 모든 정보를 즉시 소멸시킬 수 있는 완전한 통제권을 가집니다.'
                  : 'You retain 100% ownership over all generated data. Export your entire workspace into open JSON anytime, or wipe all local data with zero remnants.'}
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-2 p-4 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl text-xs">
              <h3 className="font-semibold text-[#111827] uppercase tracking-wider">
                {language === 'ko' ? '개인정보 보호 문의' : 'Privacy Inquiries'}
              </h3>
              <p className="text-[#4B5563] font-sans">
                {language === 'ko'
                  ? '고구마 프로젝트는 프라이버시 우선 소프트웨어 가치를 준수합니다. 문의 사항은 master@goguma.app으로 연락주시기 바랍니다.'
                  : 'For any privacy-related inquiries regarding our open-source tools, please contact master@goguma.app.'}
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
