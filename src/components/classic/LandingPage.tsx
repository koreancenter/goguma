import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { GOGUMA_CHAPTERS } from '../../lib/chapterData';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';

export default function LandingPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const principles = [
    {
      index: '01',
      title: language === 'ko' ? '완전한 로컬 격리' : 'Complete Local Isolation',
      desc:
        language === 'ko'
          ? '외부 인증 서버나 원격 데이터베이스 없이 브라우저 IndexedDB 내부에서만 작동합니다.'
          : 'Operates strictly within your browser IndexedDB with zero remote auth or cloud storage.',
    },
    {
      index: '02',
      title: language === 'ko' ? '즉각적 0ms 반응성' : 'Instant 0ms Responsiveness',
      desc:
        language === 'ko'
          ? '네트워크 대기 시간 없이 오프라인에서도 즉시 집필과 실시간 프로토타입 검증이 가능합니다.'
          : 'Write specifications and inspect live prototypes offline with zero network latency.',
    },
    {
      index: '03',
      title: language === 'ko' ? '11종 표준 사양서 추출' : '11 Production Specifications',
      desc:
        language === 'ko'
          ? '기획 원고와 도메인 규칙이 11개의 개발 사양서와 실행 플레이북으로 즉시 컴파일됩니다.'
          : 'Compiles your prose and domain constraints into 11 engineering documents and a runnable playbook.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col selection:bg-[#000000] selection:text-[#FFFFFF] font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Hero Monograph Section */}
        <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="space-y-12">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4E2DC] pb-5">
              <span className="text-[15px] sm:text-[16px] font-sans font-bold uppercase tracking-[0.16em] text-[#52524E]">
                Local-First Specification Studio
              </span>
              <span className="text-[15px] sm:text-[16px] font-sans tabular-nums uppercase tracking-[0.14em] text-[#52524E]">
                Edition 2.1 · Client Sandboxed
              </span>
            </div>

            <div className="max-w-5xl space-y-6">
              <h1
                className="font-display text-4xl sm:text-5xl lg:text-[64px] font-bold text-[#111111] tracking-[-0.03em] leading-[1.12]"
                style={{ textWrap: 'balance' }}
              >
                {language === 'ko' ? (
                  <>
                    생각의 결을 건축하는
                    <br />
                    로컬 퍼스트 사양서 스튜디오.
                  </>
                ) : (
                  <>
                    Architecting Clarity
                    <br />
                    in Pure Local Solitude.
                  </>
                )}
              </h1>
            </div>

            <div className="pt-10 border-t-2 border-[#000000] grid grid-cols-1 lg:grid-cols-12 gap-14 items-start">
              {/* Left Lead & Primary Actions */}
              <div className="lg:col-span-6 space-y-10">
                <p className="text-[21px] sm:text-[23px] text-[#3F3F3C] leading-[1.75] max-w-2xl">
                  {language === 'ko'
                    ? '외부 서버로 로그인 정보나 기획 원고가 일체 전송되지 않는 독립된 Local-First 환경입니다. 8개의 구조화된 챕터를 따라 아이디어를 서술하면 실시간 프로토타입과 11종의 엔지니어링 사양서가 즉시 완성됩니다.'
                    : 'A sovereign Local-First studio where no credentials or specifications leave your device. Author across 8 structured chapters to manifest live prototypes and 11 engineering specifications instantly.'}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/workspace')}
                    className="px-8 py-4.5 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] text-[18px] sm:text-[19px] font-bold tracking-wide inline-flex items-center gap-3 transition-colors cursor-pointer group"
                  >
                    <span>{language === 'ko' ? '로컬 워크스페이스 시작하기' : 'Enter Local Workspace'}</span>
                    <ArrowRight size={19} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="px-7 py-4.5 rounded-none border border-[#000000] bg-[#FFFFFF] hover:bg-[#DC2626] hover:text-[#FFE600] hover:border-[#DC2626] text-[#000000] text-[18px] sm:text-[19px] font-bold tracking-wide inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>{language === 'ko' ? '디렉터 입장 게이트웨이' : 'Director Gateway'}</span>
                  </button>
                </div>
              </div>

              {/* Right Hairline Architectural Principles */}
              <div className="lg:col-span-6 border-t lg:border-t-0 border-[#E4E2DC]">
                {principles.map((item) => (
                  <div
                    key={item.index}
                    className="py-7 border-b border-[#E4E2DC] first:pt-0 grid grid-cols-12 gap-5 items-baseline"
                  >
                    <span className="col-span-2 text-[17px] font-bold font-sans tabular-nums text-[#52524E] tracking-[0.12em]">
                      {item.index}
                    </span>
                    <div className="col-span-10 space-y-2">
                      <h2 className="text-[21px] sm:text-[23px] font-extrabold text-[#000000] tracking-tight">
                        {item.title}
                      </h2>
                      <p className="text-[18px] sm:text-[19px] text-[#3F3F3C] leading-[1.7]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sejong-Style Curated Program Index (Chapters 01 - 08) */}
        <section className="bg-[#F6F5F1] border-t border-[#E4E2DC] py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b-2 border-[#000000]">
              <div className="space-y-3">
                <span className="text-[15px] sm:text-[16px] font-bold font-sans uppercase tracking-[0.18em] text-[#52524E] block">
                  Specification Program
                </span>
                <h2 className="font-display text-[32px] sm:text-[40px] font-extrabold text-[#000000] tracking-[-0.03em] leading-tight">
                  {language === 'ko' ? '8단계 아키텍처 집필 프로그램' : 'Eight-Chapter Specification Index'}
                </h2>
              </div>
              <span className="text-[17px] sm:text-[18px] font-bold font-sans tabular-nums text-[#52524E]">
                01 — 08 Chapters · 17 Sections
              </span>
            </div>

            <div className="divide-y divide-[#E4E2DC] border-b border-[#E4E2DC]">
              {GOGUMA_CHAPTERS.map((chap) => (
                <button
                  key={chap.id}
                  type="button"
                  onClick={() => navigate('/workspace')}
                  className="w-full py-8 px-4 -mx-4 hover:bg-[#FFFFFF] transition-colors grid grid-cols-12 gap-5 items-center text-left cursor-pointer group"
                >
                  <span className="col-span-2 sm:col-span-1 font-display font-bold text-[26px] sm:text-[32px] text-[#52524E] group-hover:text-[#000000] tabular-nums tracking-[-0.03em] transition-colors">
                    0{chap.id}
                  </span>

                  <div className="col-span-8 sm:col-span-5 min-w-0 space-y-1">
                    <div className="text-[22px] sm:text-[26px] font-extrabold text-[#000000] tracking-tight truncate">
                      {chap.title}
                    </div>
                    <div className="text-[15px] sm:text-[16px] font-sans uppercase tracking-[0.12em] text-[#52524E] truncate">
                      {chap.engTitle}
                    </div>
                  </div>

                  <p className="hidden sm:block sm:col-span-5 text-[18px] sm:text-[19px] text-[#3F3F3C] truncate">
                    {chap.sections.map((s) => s.title).join(' · ')}
                  </p>

                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <ArrowRight
                      size={22}
                      className="text-[#52524E] group-hover:text-[#000000] group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
