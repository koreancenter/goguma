import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTabItem,
} from '../classic/layout/EditorialPageLayout';

interface BlogArticle {
  id: string;
  category: 'architecture' | 'design' | 'local-first';
  categoryLabel: string;
  date: string;
  readTime: string;
  title: string;
  summary: string;
  body: string[];
}

const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'local-first-philosophy',
    category: 'local-first',
    categoryLabel: 'LOCAL-FIRST',
    date: '2026.11',
    readTime: '4 MIN READ',
    title: '왜 소프트웨어 기획 도구에 중앙 서버가 필요하지 않은가',
    summary:
      '아이디어와 시스템 아키텍처는 기업과 개발자의 가장 민감한 지적 자산입니다. GOGUMA가 모든 사양 데이터를 브라우저 IndexedDB 내부에만 격리하는 이유를 설명합니다.',
    body: [
      '기존 클라우드 기반 기획 도구는 계정 로그인, 월간 구독, 그리고 모든 초안의 중앙 서버 업로드를 전제로 합니다. 그러나 초기 서비스 기획서, 데이터베이스 스키마, 내부 비즈니스 규칙은 외부 서버에 상시 저장할 필요가 없는 극도로 민감한 설계 문서입니다.',
      'GOGUMA 스튜디오는 브라우저 표준 IndexedDB와 순수 클라이언트 사이드 직렬화 엔진 위에서 동작합니다. 네트워크가 단절된 비행기 안이나 사내 보안망 환경에서도 0ms에 가까운 반응 속도로 8개 챕터 사양서를 작성하고 JSON 번들로 백업할 수 있습니다.',
    ],
  },
  {
    id: 'eleven-artifact-compiler',
    category: 'architecture',
    categoryLabel: 'ARCHITECTURE',
    date: '2026.10',
    readTime: '5 MIN READ',
    title: '하나의 원고에서 11종 개발 사양서와 실행형 프로토타입까지',
    summary:
      '기획자의 문장이 AI 코딩 에이전트와 엔지니어가 즉시 실행 가능한 개발 지침서(Playbook)로 변환되는 8-Chapter 17-Section 컴파일 파이프라인을 소개합니다.',
    body: [
      '기획과 개발 사이의 간극은 대개 모호한 자연어에서 비롯됩니다. 화면 흐름, 상태 전이, 데이터 엔터티, 예외 처리 규칙이 서로 다른 문서에 흩어져 있을 때 AI 어시스턴트와 개발 팀 모두 잘못된 가정을 하게 됩니다.',
      'GOGUMA는 서비스 개요(Chapter 1)부터 산출물 검수(Chapter 8)까지 17개 구조화 섹션을 단일 JSON 그래프(SitePlan)로 결합합니다. 이를 바탕으로 PRD, 유저 플로우, DB 스키마, API 명세, 테스트 시나리오 등 11종의 표준 사양서와 실시간 HTML/SVG 프로토타입을 동시에 컴파일합니다.',
    ],
  },
  {
    id: 'sumi-ink-hanji-editorial',
    category: 'design',
    categoryLabel: 'DESIGN SYSTEM',
    date: '2026.09',
    readTime: '3 MIN READ',
    title: '먹색(Sumi Ink)과 한지(Hanji Paper) 위의 에디토리얼 미니멀리즘',
    summary:
      '장식적인 그림자와 무분별한 배지를 덜어내고, 오직 타이포그래피와 1px 헤어라인 경계선만으로 집중력을 극대화한 GOGUMA 디자인 헌장을 공개합니다.',
    body: [
      '사양서를 작성하는 작업실은 화려한 대시보드가 아니라 정갈한 원고지여야 합니다. GOGUMA는 순백의 캔버스(#FFFFFF)와 온기 있는 한지 톤(#F6F5F1), 그리고 단단한 먹색(#000000)의 대비만으로 정보의 위계를 구축합니다.',
      '불필요한 장식과 알림 배지를 배제하고, 직각 모서리(0px~2px)와 명확한 텍스트 위계를 적용해 장시간 기획 집필 시에도 시각적 피로를 최소화합니다.',
    ],
  },
];

export default function BlogPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'local-first' | 'architecture' | 'design'>('all');

  const tabs: EditorialTabItem[] = [
    { id: 'all', label: '전체 아티클', onClick: () => setSelectedCategory('all') },
    { id: 'local-first', label: '로컬 우선 아키텍처', onClick: () => setSelectedCategory('local-first') },
    { id: 'architecture', label: '사양서 컴파일러', onClick: () => setSelectedCategory('architecture') },
    { id: 'design', label: '디자인 에디토리얼', onClick: () => setSelectedCategory('design') },
  ];

  const visibleArticles =
    selectedCategory === 'all'
      ? BLOG_ARTICLES
      : BLOG_ARTICLES.filter((article) => article.category === selectedCategory);

  return (
    <EditorialPageLayout
      category="EDITORIAL · GOGUMA JOURNAL"
      title="고구마 블로그"
      subtitle="로컬 우선 소프트웨어 아키텍처, 사양서 중심 개발 방법론 및 에디토리얼 디자인에 관한 고구마 스튜디오 팀의 기록입니다."
      tabs={tabs}
      activeTabId={selectedCategory}
      headerActions={
        <button
          type="button"
          onClick={() => navigate('/dev-notes')}
          className="px-4 py-2.5 bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] text-xs font-bold rounded-none transition-colors cursor-pointer whitespace-nowrap"
        >
          개발자 노트 보기
        </button>
      }
    >
      <div className="space-y-8">
        {visibleArticles.map((article, idx) => (
          <EditorialSection
            key={article.id}
            chapter={`0${idx + 1} · ${article.title}`}
          >
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#52524E] pb-1">
              <span className="px-2 py-0.5 bg-[#000000] text-[#FFE600]">{article.categoryLabel}</span>
              <span>{article.date}</span>
              <span>·</span>
              <span>{article.readTime}</span>
            </div>

            <p className="text-sm sm:text-base font-bold text-[#000000] leading-relaxed">
              {article.summary}
            </p>

            <div className="space-y-3 pt-1">
              {article.body.map((paragraph, pIdx) => (
                <p key={pIdx} className="text-[13px] sm:text-[14px] text-[#3F3F3C] leading-[1.85]">
                  {paragraph}
                </p>
              ))}
            </div>
          </EditorialSection>
        ))}

        <div className="border-t border-[#000000] pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-[#000000]">직접 사양서를 작성해 보세요</h2>
            <p className="text-xs text-[#52524E]">
              별도의 로그인이나 서버 연동 없이 브라우저에서 즉시 기획 작업을 시작할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/workspace')}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] text-xs font-bold rounded-none transition-colors cursor-pointer shrink-0"
          >
            <span>작업실 입장</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </EditorialPageLayout>
  );
}
