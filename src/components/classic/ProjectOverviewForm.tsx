import React, { useState, useRef, useEffect } from 'react';
import { MetadataConfig } from '../../types';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  ClipboardList, Target, BarChart3, Search, Palette, 
  Monitor, Smartphone, Zap, PenTool, MessageSquare, Layers, Calendar, 
  Save, FileText, Sparkles, Loader2, Globe, ExternalLink, ArrowLeft,
  Settings, Paperclip, Link, Trash2, AlertTriangle, Plus, Eye, Check, CheckCircle2, ChevronRight, Terminal, ShieldAlert, Cpu, X, User, Building
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import RoadmapChart from '../preview/RoadmapChart';
import { 
  recommendReferences, analyzeBenchmarkSite, 
  generateProjectStrategy, generateRoadmap, generateAiCriticism, streamAiCriticism,
  recommendTechStack, polishOverviewText
} from '../../services/geminiService';

import { useSitePlan } from '../../contexts/SitePlanContext';
import { IconButton, Tooltip } from '../guide/Tooltip';
import { StepHeader } from './StepHeader';

const TECH_STACK_SUGGESTIONS = [
  // Frontend
  "React", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Svelte", "Remix", "Gatsby", "SolidJS", "Astro",
  "Tailwind CSS", "Styled Components", "Emotion", "Sass", "Mantine", "Chakra UI", "Shadcn UI", "Radix UI",
  "Redux", "Zustand", "Recoil", "TanStack Query", "SWR", "Framer Motion", "GSAP", "Three.js",

  // Backend & APIs
  "Node.js", "Express", "Fastify", "NestJS", "Go (Golang)", "Python", "Django", "Flask", "FastAPI",
  "Ruby on Rails", "Java", "Spring Boot", "PHP", "Laravel", ".NET", "GraphQL", "Apollo Server", "tRPC",

  // Database
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Supabase", "Firebase Firestore", "Prisma", "Drizzle ORM",
  "Elasticsearch", "Cassandra", "DynamoDB", "MariaDB",

  // Cloud & Deployment
  "Vercel", "Netlify", "AWS (Amazon Web Services)", "Google Cloud Platform (GCP)", "Microsoft Azure",
  "Docker", "Kubernetes", "DigitalOcean", "Heroku", "Railway", "Fly.io", "Cloudflare Pages",

  // CMS & Tools
  "WordPress", "Headless CMS", "Strapi", "Sanity", "Contentful", "Ghost", "Shopify", "Webflow", "Framer",
  "Storybook", "Jest", "Vitest", "Cypress", "Playwright", "ESLint", "Prettier", "Vite", "Webpack", "TurboRepo"
];

interface FieldGuide {
  title: { en: string; ko: string; id: string };
  desc: { en: string; ko: string; id: string };
  gogumaChat: { en: string; ko: string; id: string };
  examples: { en: string[]; ko: string[]; id: string[] };
}

const FIELD_GUIDE_DICTIONARY: Record<string, FieldGuide> = {
  purpose: {
    title: {
      en: "Mission & Ultimate Purpose",
      ko: "최종 목적 및 미션 가이드",
      id: "Misi & Tujuan Utama"
    },
    desc: {
      en: "Why does this application exist? Focus on the core value proposition and the specific problem you are solving, rather than just listing features.",
      ko: "이 애플리케이션이 세상에 왜 존재해야 하는지 그 근본적인 가치를 정의하십시오. 단순 기능 나열을 넘어, 사용자가 해결하려는 궁극적인 Pain Point와 제공하고자 하는 핵심 가치를 명세합니다.",
      id: "Mengapa aplikasi ini ada? Fokus pada proposisi nilai inti dan masalah spesifik yang Anda selesaikan, bukan sekadar mencantumkan fitur."
    },
    gogumaChat: {
      en: "Aha! Defining the 'Purpose' is where most projects fail by being too vague. Don't just say 'To make a great app.' Tell me WHAT specific friction you are destroying in the universe, and WHY anyone should care. Write a clear, focused mission statement here!",
      ko: "하! '목적' 정의 단계부터 대부분의 기획이 흐리텅텅하게 흔들립니다. 단순 '좋은 앱 만들기' 식의 허접한 다짐은 쓰레기통에 버리십시오. 우주에서 어떤 구체적인 마찰과 비효율을 파괴하고자 하는지, 그리고 왜 남들이 여기에 관심을 가져야 하는지 압도적인 비전을 서술해 주셔야 안전한 설계를 추천할 수 있습니다.",
      id: "Aha! Mendefinisikan 'Tujuan' adalah tempat sebagian besar proyek gagal karena terlalu samar. Jangan hanya katakan 'Untuk membuat aplikasi hebat.' Beritahu saya gesekan spesifik APA yang Anda hancurkan di alam semesta, dan MENGAPA ada orang yang peduli. Tulis pernyataan misi yang jelas dan terfokus di sini!"
    },
    examples: {
      en: [
        "Minimize friction in global cross-border payments by removing intermediary fees.",
        "Provide unified, offline-first personal task coordination without data selling."
      ],
      ko: [
        "해외 송금 가상통화 중계 수수료를 0%로 수렴시켜 국외 물류 결제 지연 마찰 최소화",
        "개인 프라이버시 침해 없는 오프라인 퍼스트 로컬 전용 업무 조율 플랫폼 제공"
      ],
      id: [
        "Minimalkan gesekan dalam pembayaran lintas batas global dengan menghapus biaya perantara.",
        "Sediakan koordinasi tugas pribadi terpadu yang mengutamakan offline tanpa penjualan data."
      ]
    }
  },
  target: {
    title: {
      en: "Target Audience & Persona Group",
      ko: "타겟 오디언스 및 페르소나 설계",
      id: "Target Audiens & Grup Persona"
    },
    desc: {
      en: "Who are your primary visitors and high-value customer personas? Specifying their tech-savviness, demography, and key pain points helps tailor the UX.",
      ko: "이 서비스를 사용할 핵심 타겟 고객 군의 특성을 다면적으로 구체화하십시오. 단순 연령대를 벗어나 그들의 디지털 기기 숙련도, 지불 용의, 핵심 고충(Pain Points)을 상세히 나열합니다.",
      id: "Siapa pengunjung utama Anda dan persona pelanggan bernilai tinggi? Menentukan pemahaman teknologi, demografi, dan titik hambatan utama mereka membantu menyesuaikan UX."
    },
    gogumaChat: {
      en: "Target audience is not 'everyone.' If you build for everyone, you build for no one. Tell me EXACTLY who has the bleeding neck that your solution bandages. Are they tech-savvy developers, or older users who need 18px font sizes? Detail their characteristics now!",
      ko: "'모든 인류' 같은 안일한 타겟팅은 실패의 지름길입니다. 당신의 붕대로 당장 상처를 싸매야 하는 피 흘리는 핵심 고객이 정확히 누구입니까? 터치 인터페이스가 손에 익지 않은 어르신들입니까, 아니면 단축키 없이는 움직이지 않는 헤비 개발자 군입니까? 이들의 숙련도와 취약점을 서술하십시오.",
      id: "Target audiens bukanlah 'semua orang.' Jika Anda membangun untuk semua orang, Anda tidak membangun untuk siapa pun. Beritahu saya SEBENARNYA siapa yang memiliki masalah mendesak yang dibalut oleh solusi Anda. Apakah mereka pengembang yang paham teknologi, atau pengguna lansia yang membutuhkan ukuran font 18px? Rincikan karakteristik mereka sekarang!"
    },
    examples: {
      en: [
        "Independent cross-border freelancers needing reliable payments, low tech-savviness.",
        "Enterprise system administrators managing Kubernetes clusters with severe time constraints."
      ],
      ko: [
        "외주 정산을 받는 독립형 프리랜서 군 (기술 숙련도 중하, 수수료에 치명적으로 민감함)",
        "클라우드 보안 거버넌스를 조율하느라 번아웃에 처한 국내 대기업 소속 시스템 아키텍트 그룹"
      ],
      id: [
        "Pekerja lepas lintas batas independen yang membutuhkan pembayaran andal, celah pemahaman teknologi rendah.",
        "Administrator sistem perusahaan yang mengelola kluster Kubernetes dengan batasan waktu yang ketat."
      ]
    }
  },
  kpi: {
    title: {
      en: "Quantitative KPIs & Success Metrics",
      ko: "정량적 핵심 성과 지표 (KPI)",
      id: "KPI Kuantitatif & Metrik Keberhasilan"
    },
    desc: {
      en: "Establish concrete, measurable targets. Clear KPIs protect your project from drifting scope and help validate the engineering value.",
      ko: "기획안이 뜬구름 잡는 다짐에 그치지 않도록 숫자 기반의 명확한 통계 지표를 기술하십시오. 비즈니스 이탈률, 월간 사용자 수, 인프라 비용 한계 등을 작성합니다.",
      id: "Tetapkan target yang konkret dan terukur. KPI yang jelas melindungi proyek Anda dari cakupan yang meluas dan membantu memvalidasi nilai rekayasa."
    },
    gogumaChat: {
      en: "Without numbers, success is just an opinion. Give me hard, measurable goals. Churn rate under 5%? Load times under 200ms? Daily active users surpassing 10k? Put down objective targets that GOGUMA can audit for architectural sanity!",
      ko: "숫자로 측정되지 않는 성공은 허상일 뿐입니다. 월간 활성 사용자(MAU) 몇 명을 목표로 하십니까? 이탈률은 몇 % 수준으로 차단할 겁니까? 페이지 반응 속도는 몇 ms 이내여야 사용자 인지 장벽을 허물 수 있습니까? 구체적이고 엄격한 통계적 가이드라인을 새기십시오.",
      id: "Tanpa angka, kesuksesan hanyalah sebuah opini. Berikan saya target yang keras dan terukur. Tingkat churn di bawah 5%? Waktu muat di bawah 200 ms? Pengguna aktif harian melampaui 10 ribu? Tetapkan target objektif yang dapat diaudit oleh GOGUMA untuk kewajaran arsitektur!"
    },
    examples: {
      en: [
        "Achieve transaction processing speed under 500ms for 99% of requests.",
        "Maintain customer retention rate above 85% within the first 30 days of release."
      ],
      ko: [
        "전체 인입 요청의 99%에서 트랜잭션 수치 처리 속도 500ms 미만 유지 보증",
        "신규 런칭 후 최초 30일 이내 사용자 리텐션(재방문율) 85% 수렴"
      ],
      id: [
        "Mencapai kecepatan pemrosesan transaksi di bawah 500ms untuk 99% permintaan.",
        "Pertahankan tingkat retensi pelanggan di atas 85% dalam 30 hari pertama rilis."
      ]
    }
  },
  toneAndManner: {
    title: {
      en: "Design System Tone & Manner",
      ko: "디자인 시스템 톤 앤 매너",
      id: "Nada & Gaya Sistem Desain"
    },
    desc: {
      en: "Choose the visual identity keywords and aesthetic principles. This will guide component choices, typography pairings, and layout behaviors.",
      ko: "아키텍처의 인상을 좌우할 디자인 시스템 가이드를 정의합니다. 어둡고 묵직한 가상의 고구마 우주(Cosmic Slate), 혹은 순백의 현대적 미니멀리즘 테마 등 명확한 시각 정체성 키워드를 명세하십시오.",
      id: "Pilih kata kunci identitas visual dan prinsip estetika. Ini akan memandu pilihan komponen, pemasangan tipografi, dan perilaku tata letak."
    },
    gogumaChat: {
      en: "Typography and color choices dictate user trust. Avoid random rainbows. Describe a professional color direction, visual weight, and typography hierarchy that tells users they are safe with your secure application.",
      ko: "이상한 원색 그라데이션과 잡다한 폰트의 난무는 브랜드 신뢰도를 수직 하락시킵니다. 일관된 대비 배율, 묵직한 레이아웃 무게감, 그리고 단일 지향 서체 구조에 대한 시각 가이드를 명세하여 무너지지 않는 성전의 외형을 설계하십시오.",
      id: "Pilihan tipografi dan warna menentukan kepercayaan pengguna. Hindari pelangi acak. Jelaskan arah warna profesional, bobot visual, dan hierarki tipografi yang memberi tahu pengguna bahwa mereka aman dengan aplikasi aman Anda."
    },
    examples: {
      en: [
        "Cosmic Slate Dark Theme: Deep charcoal fill with high-contrast electric violet details.",
        "Neo-Nordic Light Minimalist: Inter font, vast white negative space, 1px thin grid boundaries."
      ],
      ko: [
        "코스믹 슬레이트(Cosmic Slate): 심해 느낌의 깊은 차콜 바탕에 일렉트릭 일루미네이션 바이올렛 포인트 배색",
        "북유럽풍 미니멀 화이트: Inter 타이포그래피, 극도의 여백 활용 및 1px의 초미세 그리드 분리 배선형 구조"
      ],
      id: [
        "Tema Gelap Cosmic Slate: Isian arang pekat dengan detail violet elektrik kontras tinggi.",
        "Neo-Nordic Light Minimalist: Font Inter, ruang negatif putih yang luas, batas kisi tipis 1px."
      ]
    }
  },
  features: {
    title: {
      en: "MVP Core Use Cases & Features",
      ko: "MVP 핵심 유스케이스 및 기능",
      id: "Kasus Penggunaan & Fitur Inti MVP"
    },
    desc: {
      en: "Focus on indispensable capabilities first. Strip out secondary gold-clutter features to prevent scope bloat and guarantee a highly performant MVP.",
      ko: "최소 기능 구현 품목(MVP)의 바운더리를 설정하십시오. 오버엔지니어링 사태를 유발하는 2차 잡동사니 요소를 완전 배제하고, 사용자 가치를 달성해 줄 핵심 기동 단위를 선별하여 나열합니다.",
      id: "Fokus pada kapabilitas yang sangat penting terlebih dahulu. Hapus fitur-fitur sekunder yang berlarut-larut untuk mencegah perluasan cakupan dan menjamin MVP yang berkinerja tinggi."
    },
    gogumaChat: {
      en: "Ruthlessly strip the secondary noise. Don't add chat, comments, forums, and badges before your core payment or data module even compiles. Tell me what is the absolute critical path of your product's lifecycle!",
      ko: "기획에서 불필요한 거품을 사정없이 걷어내십시오. 핵심 비즈니스 로직조차 제대로 안 돌아가는데 소셜 채팅, 알림 배지, 회원 가이드북 같은 군더더기 장식에 에너지를 낭비하지 마십시오. MVP로서 작동해야만 하는 1급 필수 요로를 지정해 주십시오.",
      id: "Kupas habis kebisingan sekunder dengan kejam. Jangan tambahkan obrolan, komentar, forum, dan lencana sebelum pembayaran atau modul data inti Anda dikompilasi. Beritahu saya apa jalur kritis mutlak dari siklus hidup produk Anda!"
    },
    examples: {
      en: [
        "One-click multi-signature wallet verification proxy.",
        "Real-time resource utilization monitor using low-latency WebSockets."
      ],
      ko: [
        "원클릭 보안 하이브리드 전자 지갑 다중서명 검증 모듈 연동 패스",
        "저지연 웹소켓(WebSocket) 기반의 실시간 리소스 할당 오버헤드 탐지 미터기"
      ],
      id: [
        "Proksi verifikasi dompet multi-tanda tangan sekali klik.",
        "Monitor pemanfaatan sumber daya real-time menggunakan WebSocket latensi rendah."
      ]
    }
  },
  techStack: {
    title: {
      en: "Architectural Tech Stack Selection",
      ko: "아키텍처 인프라 및 기술 스택",
      id: "Pilihan Tumpukan Teknologi Arsitektur"
    },
    desc: {
      en: "Select framework elements based on performance and maintainability. Ensure seamless integration with React, Vite, and Cloud native tools.",
      ko: "확장성, 보안성 및 구축 비용을 모두 주도할 기술 구성을 작성합니다. AI 추천 단추를 기동하면 현재 기획 목적에 최적인 호환 조합과 프레임워크를 심사하여 실시간 추천해 줍니다.",
      id: "Pilih elemen kerangka kerja berdasarkan kinerja dan pemeliharaan. Pastikan integrasi yang mulus dengan alat bawaan React, Vite, dan Cloud."
    },
    gogumaChat: {
      en: "Choose secure, modern, and compatible dependencies. Avoid dead libraries. GOGUMA highly recommends Vite, React 18+, Tailwind v4+, and Google Cloud Run for zero-cold-start performance. Check compatibility before typing!",
      ko: "유지보수가 끊긴 낡은 라이브러리는 기획 설계 시점부터 탈락입니다. 확장성과 무정지 운영을 위해 React 18, Vite 빌더, Tailwind v4 및 서버리스 컨테이너의 핵심인 Google Cloud Run 아키텍처 구성을 적극 고려하십시오. 호환성 궁합이 생명입니다.",
      id: "Pilih dependensi yang aman, modern, dan kompatibel. Hindari pustaka mati. GOGUMA sangat merekomendasikan Vite, React 18+, Tailwind v4+, dan Google Cloud Run untuk kinerja nol cold-start. Periksa kompatibilitas sebelum mengetik!"
    },
    examples: {
      en: [
        "React + Vite + Tailwind CSS v4 + TypeScript + Google Cloud Run.",
        "Next.js App Router + Prisma ORM + PostgreSQL on Serverless Database."
      ],
      ko: [
        "React (Vite) + Tailwind CSS v4 + TypeScript + Google Cloud Run",
        "Next.js App Router + Prisma ORM + Cloud SQL (PostgreSQL Enterprise)"
      ],
      id: [
        "React + Vite + Tailwind CSS v4 + TypeScript + Google Cloud Run.",
        "Next.js App Router + Prisma ORM + PostgreSQL pada Database Serverless."
      ]
    }
  },
  reference: {
    title: {
      en: "Visual References & Design Motifs",
      ko: "시각 디자인 레퍼런스 및 기믹",
      id: "Referensi Visual & Motif Desain"
    },
    desc: {
      en: "Provide specific websites or UI patterns you wish to research. Copying bad layouts leads to poor results; study successful, highly polished platforms.",
      ko: "현재 설계하려는 시각 디자인의 나침반이 되어 줄 레퍼런스를 지정하십시오. 에이전시급 실사례의 시각적 디테일, 여백 배분, 애니메이션 가중치를 적절히 분석해 두는 단계입니다.",
      id: "Berikan situs web khusus atau pola UI yang ingin Anda teliti. Menyalin tata letak yang buruk menyebabkan hasil yang buruk; pelajari platform yang sukses dan dipoles dengan sangat baik."
    },
    gogumaChat: {
      en: "Don't copy bloated templates. Study high-fidelity interaction references: Apple's typography scale, Stripe's smooth gradients, or Vercel's razor-sharp dashboard borders. Describe their design highlights precisely!",
      ko: "그저 그렇고 낡은 중소기업용 무료 템플릿의 조작 패턴을 답습하지 마십시오. 애플(Apple)의 정통 타이포 배율, 스트라이프(Stripe)의 정교한 그라데이션 광원 처리, 버셀(Vercel)의 예리한 카드 테두리 마감 등 명품 아키텍처의 디테일을 기입하십시오.",
      id: "Jangan salin templat yang membengkak. Pelajari referensi interaksi fidelitas tinggi: skala tipografi Apple, gradien mulus Stripe, atau batas dasbor Vercel yang sangat tajam. Jelaskan sorotan desain mereka dengan tepat!"
    },
    examples: {
      en: [
        "Stripe's credit card billing dashboard: ultra-smooth responsive charts and crisp dark modes.",
        "Apple's product highlight grid: robust typographic scale and generous negative space."
      ],
      ko: [
        "Stripe 결제 관리 콘솔: 초정밀 다크 플래시 카드 레이아웃하고 버벅임 없는 리차트(Recharts) 배선 연동",
        "Linear의 관리 대시보드: 미니멀 테크 감성, JetBrains Mono 코딩 폰트 배치 및 단축키 바인딩 레이아웃"
      ],
      id: [
        "Dasbor penagihan kartu kredit Stripe: grafik responsif yang sangat halus dan mode gelap yang tajam.",
        "Kisi sorotan produk Apple: skala tipografi yang kuat dan ruang negatif yang luas."
      ]
    }
  },
  benchmarkUrl: {
    title: {
      en: "Competitive Benchmark TARGET URL",
      ko: "경쟁사 벤치마크 타겟 URL 주소",
      id: "TARGET URL Tolok Ukur Kompetitif"
    },
    desc: {
      en: "Input the precise URL of your competitor or benchmark target. Our Gemini engine will analyze its structural vulnerabilities and opportunities.",
      ko: "분석할 경쟁 모델이나 우수 롤모델 사이트의 전체 URL 주소를 적시하십시오. 구글 제미나이 엔진이 해당 도메인의 시각적 구성뿐 아니라 침투 기술적 장단점까지 실시간으로 파악하여 무기를 장착해 드립니다.",
      id: "Masukkan URL pesaing atau target tolok ukur Anda dengan tepat. Mesin Gemini kami akan menganalisis kerentanan struktural dan peluangnya."
    },
    gogumaChat: {
      en: "Ah, the target to inspect. Make sure the competitor URL is valid and begins with `https://`. GOGUMA's dynamic audit suite will assess its infrastructure structure and uncover secret design opportunities!",
      ko: "흠, 작전을 위해 정찰할 타겟 주소군요. URL 주소의 형식을 완벽히 갖춰 `https://` 프로토콜을 포함하여 조율해 주십시오. 그래야 제미나이 위협 분석기가 해당 도메인의 구성을 쪼개서 공격 포인트를 도출해 냅니다.",
      id: "Ah, target untuk diperiksa. Pastikan URL pesaing valid dan dimulai dengan `https://`. Rangkaian audit dinamis GOGUMA akan menilai struktur infrastruktur dan mengungkap peluang desain rahasia!"
    },
    examples: {
      en: [
        "https://linear.app",
        "https://stripe.com"
      ],
      ko: [
        "https://linear.app",
        "https://stripe.com"
      ],
      id: [
        "https://linear.app",
        "https://stripe.com"
      ]
    }
  },
  benchmarkAnalysis: {
    title: {
      en: "Deep Site Structure & Threat Analysis",
      ko: "벤치마크 심층 분석 및 영토 정찰",
      id: "Struktur Situs Mendalam & Analisis Ancaman"
    },
    desc: {
      en: "Structural analysis reports on the target's visual layouts, features, and security postures. Click 'AI Analyze' to auto-populate GOGUMA's feedback.",
      ko: "벤치마킹 주소의 내부 매핑 보고서입니다. 'AI 분석' 버튼을 기동하여 해당 사이트가 내재하고 있었던 보안적 빈틈, UI 결함, 아키텍처상의 장단점을 분석해 정리하십시오.",
      id: "Laporan analisis struktural tentang tata letak visual, fitur, dan postur keamanan target. Klik 'AI Analisis' untuk mengisi otomatis umpan balik GOGUMA."
    },
    gogumaChat: {
      en: "Here is where the counter-offensive is planned. Review the analyzed architecture flaws and turn them into your application's unique strengths! Keep it objective, professional, and dense with facts.",
      ko: "타겟 경쟁사의 급소와 약점이 여기에 펼쳐집니다. 이 영토 정찰 보고서를 가볍게 넘기지 마시고, 그들이 누락한 핵심 레이아웃이나 인프라 이탈 지점을 우리 아키텍처의 강력한 보강 철근으로 전환하십시오.",
      id: "Di sinilah serangan balik direncanakan. Tinjau kelemahan arsitektur yang dianalisis dan ubah menjadi kekuatan unik aplikasi Anda! Jaga agar tetap objektif, profesional, dan padat dengan fakta."
    },
    examples: {
      en: [
        "Visual: High contrast layout with bold cards. Defect: Loading animations block interactive user inputs.",
        "Infra: Cloudfront CDN with S3. Opportunity: Leverage Cloud Run serverless caching to reduce origin load times."
      ],
      ko: [
        "시각: 극단적인 카테고리화 및 단색 카드 그리퍼. 취약점: 웹소켓 재접속 실패 시 탭 전환 블러킹 발생.",
        "인프라: 정적 스토리지 호스팅으로 데이터 연산 불가. 기회: 우리는 Serverless DB + Dynamic caching 바인딩으로 실시간 데이터 처리 우위 점령."
      ],
      id: [
        "Visual: Tata letak kontras tinggi dengan kartu tebal. Cacat: Animasi pemuatan memblokir input pengguna interaktif.",
        "Infra: Cloudfront CDN dengan S3. Peluang: Manfaatkan caching serverless Cloud Run untuk mengurangi waktu pemuatan asal."
      ]
    }
  }
};

const InputField = ({ 
  label, 
  name, 
  value = '', 
  placeholder, 
  description, 
  icon: Icon,
  autoBullet = false,
  resizable = false,
  rows = 2,
  suggestions = [],
  projectContext = '',
  hideRefine = false,
  actions,
  onChange 
}: { 
  label: string; 
  name: keyof MetadataConfig['projectOverview']; 
  value?: string; 
  placeholder: string; 
  description: string;
  icon: any;
  autoBullet?: boolean;
  resizable?: boolean;
  rows?: number;
  suggestions?: string[];
  projectContext?: string;
  hideRefine?: boolean;
  actions?: React.ReactNode;
  onChange: (name: keyof MetadataConfig['projectOverview'], value: string) => void 
  }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showGuidePanel, setShowGuidePanel] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const focusRef = useRef<HTMLTextAreaElement>(null);
  const { t, language } = useLanguage();
  const { plan } = useSitePlan();


  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement> | string) => {
    let newValue = typeof e === 'string' ? e : e.target.value;
    
    if (autoBullet && typeof e !== 'string') {
      const lines = newValue.split('\n');
      const processedLines = lines.map(line => {
        if (line.trim() !== '' && !line.trim().startsWith('•')) {
          return `• ${line.trim()}`;
        }
        return line;
      });
      newValue = processedLines.join('\n');
    }
    
    onChange(name, newValue);

    if (suggestions.length > 0 && typeof e !== 'string') {
      const cursorPosition = e.target.selectionStart;
      const textBeforeCursor = newValue.substring(0, cursorPosition);
      const words = textBeforeCursor.split(/[\s,]+/);
      const lastWord = words[words.length - 1];

      if (lastWord.length > 1) {
        const filtered = suggestions.filter(s => 
          s.toLowerCase().startsWith(lastWord.toLowerCase()) && 
          !newValue.toLowerCase().includes(s.toLowerCase())
        );
        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setSelectedIndex(0);
      } else {
        setShowSuggestions(false);
      }
    }
  };

  const handlePolish = async () => {
    if (!value || isPolishing) return;
    setIsPolishing(true);
    try {
      const polished = await polishOverviewText(value, label, projectContext, language, undefined, plan.deploymentProfile?.mode, plan.metadata?.platform);
      onChange(name, polished);
    } catch (error: any) {
      console.error("Polishing failed:", error);
      if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') {
        alert(t('gemini_rate_limit'));
      }
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!textareaRef.current) return;

    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    
    const words = textBeforeCursor.split(/([\s,]+)/);
    words[words.length - 1] = suggestion;
    
    const newValue = words.join('') + textAfterCursor;
    onChange(name, newValue);
    setShowSuggestions(false);
    
    // Refocus and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = words.join('').length;
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        handleSuggestionClick(filteredSuggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  const getGuide = (fieldName: string, key: 'title' | 'desc' | 'gogumaChat' | 'examples') => {
    const guide = FIELD_GUIDE_DICTIONARY[fieldName];
    if (!guide) return '';
    const langKey = (language === 'ko' || language === 'en' || language === 'id') ? language : 'en';
    return guide[key][langKey] || guide[key]['en'] || '';
  };

  const handleExampleClick = (example: string) => {
    const newValue = value ? `${value}\n• ${example}` : `• ${example}`;
    onChange(name, newValue);
  };

  const triggerGogumaChat = () => {
    const guide = FIELD_GUIDE_DICTIONARY[name];
    if (!guide) return;
    const customMessage = guide.gogumaChat[language as 'en' | 'ko' | 'id'] || guide.gogumaChat.en;
    
    // Auto toggle/dispatch custom event for GOGUMA Chatbot
    const event = new CustomEvent('master-goguma-trigger', {
      detail: { message: customMessage }
    });
    window.dispatchEvent(event);
  };

  return (
    <>
      <div className="group space-y-2 relative">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Icon size={16} className="text-goguma" />
            {label}
          </label>
          <div className="flex items-center gap-2">
             {actions}
             {FIELD_GUIDE_DICTIONARY[name] && (
               <button
                 type="button"
                 onClick={() => {
                   setShowGuidePanel(!showGuidePanel);
                   if (!showGuidePanel) {
                     triggerGogumaChat();
                   }
                 }}
                 className={`h-8 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all outline-none border cursor-pointer ${
                   showGuidePanel 
                     ? 'bg-goguma text-white border-goguma/20 shadow-lg shadow-goguma/20' 
                     : 'bg-goguma-light text-goguma hover:bg-goguma hover:text-white border-goguma/10 hover:shadow-xs'
                 }`}
               >
                 <MessageSquare size={11} className={showGuidePanel ? 'animate-bounce' : ''} />
                 <span>{language === 'ko' ? '💬 고구마 가이드' : language === 'id' ? '💬 Panduan GOGUMA' : '💬 GOGUMA Guide'}</span>
               </button>
             )}
             <IconButton 
               onClick={() => setIsFocusMode(true)}
               icon={Eye}
               tooltip={t('focus_mode') || 'Focus Mode'}
               variant="ghost"
               size="sm"
               className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
             />
             {!hideRefine && (
               <IconButton 
                 onClick={handlePolish}
                 isLoading={isPolishing}
                 icon={Sparkles}
                 label={t('ai_refine')}
                 tooltip={t('ai_refine')}
                 variant="ai"
                 size="sm"
                 className="h-8 !px-3 shadow-indigo-200/50"
               />
             )}
          </div>
        </div>

        {/* Dynamic, responsive collapsible GOGUMA guide panel */}
        <AnimatePresence>
          {showGuidePanel && FIELD_GUIDE_DICTIONARY[name] && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-3"
            >
              <div className="bg-gradient-to-br from-goguma/5 via-slate-50 to-indigo-50/10 border-2 border-goguma/10 rounded-[20px] p-4.5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-goguma/10 pb-2.5">
                  <h5 className="text-[11px] font-black text-goguma flex items-center gap-1.5 uppercase tracking-wide">
                    <Sparkles size={13} className="text-goguma animate-spin-slow" />
                    {getGuide(name, 'title')}
                  </h5>
                  <span className="text-[9px] bg-indigo-50/80 text-goguma font-black px-2.5 py-0.5 rounded-lg border border-goguma/5">
                    {language === 'ko' ? '인공지능 조율실' : language === 'id' ? 'Ruang AI' : 'AI Room'}
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-700 leading-relaxed font-bold">
                  {getGuide(name, 'desc')}
                </p>

                {/* Best Practice Examples section */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                    {language === 'ko' ? '💡 모범 설계 사례 (클릭 시 자동 삽입)' : language === 'id' ? '💡 Contoh Praktik Terbaik (Klik untuk menyisipkan)' : '💡 Best Practice Examples (Click to insert)'}
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {((getGuide(name, 'examples') as any) || []).map((example: string, i: number) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleExampleClick(example)}
                        className="w-full text-left p-2.5 bg-white hover:bg-goguma-light hover:border-goguma/20 border border-slate-100 rounded-xl text-[11px] font-semibold text-slate-600 hover:text-goguma transition-all duration-200 cursor-pointer flex items-start gap-2 shadow-2xs hover:shadow-xs group/item"
                      >
                        <span className="text-goguma opacity-40 group-hover/item:opacity-100 transition-opacity">•</span>
                        <span className="flex-1">{example}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Ask GOGUMA trigger link */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 text-[10px]">
                  <span className="text-[9px] text-slate-400 font-medium">
                    {language === 'ko' ? '* 본 가이드는 구글 Enterprise AI 보안 정책을 엄격히 준수합니다.' : language === 'id' ? '* Panduan ini mematuhi kebijakan keamanan Google AI secara ketat.' : '* This guide strictly complies with Google Enterprise AI policies.'}
                  </span>
                  <button
                    type="button"
                    onClick={triggerGogumaChat}
                    className="text-goguma hover:underline font-extrabold flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-goguma/10 hover:border-goguma/30 transition-all shadow-2xs"
                  >
                    <MessageSquare size={11} className="text-goguma" />
                    <span>{language === 'ko' ? '제미나이 챗봇에 밀착 가이드 요청' : language === 'id' ? 'Minta Panduan di Chatbot Gemini' : 'Query Gemini Chat for custom help'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative group/input">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            rows={rows}
            className={`w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-[24px] focus:ring-8 focus:ring-goguma/10 focus:border-goguma/30 outline-none transition-all text-sm font-medium leading-relaxed ${resizable ? 'resize-y min-h-[120px]' : 'resize-none'}`}
          />
          
          <div className="absolute right-5 bottom-4 flex items-center gap-4">
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest pointer-events-none">
              {(value || '').length} CHARS
            </div>
          </div>

          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute z-50 left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[24px] shadow-2xl overflow-hidden max-h-64 overflow-y-auto ring-1 ring-black/5"
              >
                <div className="p-2 grid grid-cols-1 gap-1">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full px-4 py-3 text-left text-sm rounded-xl transition-all flex items-center justify-between group ${
                        index === selectedIndex ? 'bg-goguma text-white shadow-lg shadow-goguma/20 scale-[1.02]' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-bold">{suggestion}</span>
                      {index === selectedIndex && (
                        <Sparkles size={14} className="text-white/50 animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="text-[11px] text-slate-400 font-medium ml-1">
          💡 {description}
        </p>
      </div>

      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {isFocusMode && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-12 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-5xl h-full rounded-[48px] shadow-2xl overflow-hidden flex flex-col border-4 border-slate-900"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-goguma rounded-2xl flex items-center justify-center text-white">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{label}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('focus_mode_editing') || 'Focus Mode Editing'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <IconButton 
                    onClick={handlePolish}
                    isLoading={isPolishing}
                    icon={Sparkles}
                    label={t('ai_refine')}
                    tooltip={t('ai_refine')}
                    variant="ai"
                  />
                  <IconButton 
                    onClick={() => setIsFocusMode(false)}
                    icon={Check}
                    tooltip={t('finish')}
                    variant="primary"
                    className="!px-8"
                  />
                </div>
              </div>
              <div className="flex-1 p-12 bg-white relative">
                <textarea
                  ref={focusRef}
                  autoFocus
                  value={value}
                  onChange={(e) => handleChange(e)}
                  className="w-full h-full text-2xl font-bold text-slate-800 placeholder:text-slate-100 outline-none resize-none leading-relaxed"
                  placeholder={placeholder}
                />
                <div className="absolute right-12 bottom-12 text-sm font-black text-slate-200 tracking-widest uppercase">
                  {(value || '').length} Characters
                </div>
              </div>
              <div className="p-8 bg-slate-900 text-white/50 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-between">
                <span>{t('auto_saved')}</span>
                <span className="text-goguma">{t('goguma_architect_ai')}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const SectionTitle = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="pt-6 pb-2 border-b border-slate-100 mb-6">
    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
      {title}
    </h3>
    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">{subtitle}</p>
  </div>
);

export default function ProjectOverviewForm({ activeStep, onStepChange, onSave }: { activeStep: number; onStepChange: (step: number) => void; onSave: () => void }) {
  const { plan, setPlan: onChange } = useSitePlan();
  const { t, language } = useLanguage();
  const [isRecommending, setIsRecommending] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCriticizing, setIsCriticizing] = useState(false);
  const [isRecommendingTech, setIsRecommendingTech] = useState(false);
  const [isStrategizing, setIsStrategizing] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // GOGUMA Domain Strategy handlers (The Infallible Vibe-to-Code Orchestrator)
  const handleDomainStrategyChange = (mode: 'own' | 'goguma', subdomainVal?: string, ownDomainVal?: string) => {
    const currentMode = mode;
    const currentGogumaSub = subdomainVal !== undefined 
      ? subdomainVal 
      : (plan.metadata?.projectOverview?.gogumaSubdomain || '');
    
    let currentOwn = ownDomainVal !== undefined 
      ? ownDomainVal 
      : (plan.metadata?.projectOverview?.targetUrl || '')
          .replace(/^(https?:\/\/)?(www\.)?/, '')
          .split('/')[0]
          .split(':')[0];
          
    if (currentOwn.includes('goguma.app')) {
      currentOwn = '';
    }
    
    if (currentMode === 'goguma') {
      const formattedSub = currentGogumaSub.toLowerCase().replace(/[^a-z0-9-]/g, '');
      const testUrl = `https://${formattedSub || 'goguma-app'}.goguma.app`;
      onChange({
        ...plan,
        metadata: {
          ...plan.metadata,
          projectOverview: {
            ...plan.metadata?.projectOverview,
            domainMode: 'goguma',
            gogumaSubdomain: formattedSub,
            targetUrl: testUrl
          }
        }
      });
    } else {
      const cleanOwn = currentOwn.trim();
      const testUrl = cleanOwn ? `https://${cleanOwn}` : '';
      onChange({
        ...plan,
        metadata: {
          ...plan.metadata,
          projectOverview: {
            ...plan.metadata?.projectOverview,
            domainMode: 'own',
            targetUrl: testUrl
          }
        }
      });
    }
  };

  const getSlugFromName = (name: string) => {
    // 한글의 영문 발음 변환 혹은 한글은 공백으로 날리고 깔끔하게 영문자만 남기는 미니 슬러그 변환기
    const englishAndNumeric = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    return englishAndNumeric || 'goguma-brand';
  };

  useEffect(() => {
    if (activeStep === 1) {
      const currentMode = plan.metadata?.projectOverview?.domainMode;
      const currentGogumaSub = plan.metadata?.projectOverview?.gogumaSubdomain;
      const projName = plan.metadata?.projectName || '';
      
      const updates: any = {};
      let hasUpdates = false;

      if (!currentMode) {
        updates.domainMode = 'goguma';
        hasUpdates = true;
      }

      if (!currentGogumaSub && projName) {
        const generated = getSlugFromName(projName);
        if (generated) {
          updates.gogumaSubdomain = generated;
          hasUpdates = true;
        }
      }

      if (hasUpdates) {
        onChange({
          ...plan,
          metadata: {
            ...plan.metadata,
            projectOverview: {
              ...plan.metadata?.projectOverview,
              ...updates,
              targetUrl: (updates.domainMode || currentMode || 'goguma') === 'goguma'
                ? `https://${updates.gogumaSubdomain || currentGogumaSub || 'goguma-app'}.goguma.app`
                : plan.metadata?.projectOverview?.targetUrl || ''
            }
          }
        });
      }
    }
  }, [activeStep, plan.metadata?.projectName]);

  const handleRecommend = async () => {
    if (isRecommending) return;
    setIsRecommending(true);
    setAiError(null);
    try {
      const context = `
        Purpose: ${plan.metadata?.projectOverview?.purpose || ''}
        Target Audience: ${plan.metadata?.projectOverview?.target || ''}
        KPI: ${plan.metadata?.projectOverview?.kpi || ''}
        Tone & Manner: ${plan.metadata?.projectOverview?.toneAndManner || ''}
      `;
      const recommendation = await recommendReferences(context, language, undefined, plan.deploymentProfile?.mode, plan.metadata?.platform);
      handleOverviewChange('reference', recommendation);
    } catch (error: any) {
      console.error("Failed to recommend references:", error);
      if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') {
        setAiError(t('gemini_rate_limit'));
      } else {
        setAiError(t('common_error'));
      }
    } finally {
      setIsRecommending(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (isGeneratingRoadmap) return;
    setIsGeneratingRoadmap(true);
    setAiError(null);
    try {
      const topMenus = (plan?.navigation?.pageStructure || []).filter(p => p.depth === 0).map(p => p.name);
      const menusContext = topMenus.join(', ');
      const pagesContext = (plan?.navigation?.pageStructure || []).map(p => `- ${p.name} (${p.slug})`).join('\n');
      
      const context = `
        Project Name: ${plan?.metadata?.projectName || 'Untitled'}
        Purpose: ${plan?.metadata?.projectOverview?.purpose}
        Target Audience: ${plan?.metadata?.projectOverview?.target}
        KPI: ${plan?.metadata?.projectOverview?.kpi}
        Tech Stack: ${plan?.metadata?.projectOverview?.techStack}
        Tone & Manner: ${plan?.metadata?.projectOverview?.toneAndManner}
        
        Site Scale (Menus): ${menusContext}
        Page Structure:
        ${pagesContext}
      `;
      
      const roadmap = await generateRoadmap(context, language, undefined, plan.deploymentProfile?.mode, plan.metadata?.platform);
      handleOverviewChange('schedule', roadmap);
      setShowChart(true);
    } catch (error: any) {
      console.error("Failed to generate roadmap:", error);
      if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') {
        setAiError(t('gemini_rate_limit'));
      } else {
        setAiError(t('common_error'));
      }
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleAnalyze = async () => {
    if (isAnalyzing || !plan.metadata?.projectOverview?.benchmarkUrl) return;
    setIsAnalyzing(true);
    setAiError(null);
    try {
      const context = `
        Purpose: ${plan.metadata?.projectOverview?.purpose || ''}
        Target Audience: ${plan.metadata?.projectOverview?.target || ''}
        KPI: ${plan.metadata?.projectOverview?.kpi || ''}
        Tone & Manner: ${plan.metadata?.projectOverview?.toneAndManner || ''}
      `;
      const analysis = await analyzeBenchmarkSite(plan.metadata?.projectOverview?.benchmarkUrl || '', context, language, undefined, plan.deploymentProfile?.mode, plan.metadata?.platform);
      handleOverviewChange('benchmarkAnalysis', analysis);
    } catch (error: any) {
      console.error("Failed to analyze benchmark site:", error);
      if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') {
        setAiError(t('gemini_rate_limit'));
      } else {
        setAiError(t('common_error'));
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addKnowledgeSource = (type: 'file' | 'link') => {
    const newSource = {
      id: Math.random().toString(36).substr(2, 9),
      name: type === 'link' ? 'New Link' : 'New File',
      type,
      url: '',
      description: ''
    };
    
    onChange({
      ...plan,
      metadata: {
        ...plan?.metadata,
        projectOverview: {
          ...plan?.metadata?.projectOverview,
          knowledgeSources: [...(plan?.metadata?.projectOverview?.knowledgeSources || []), newSource]
        }
      }
    });
  };

  const removeKnowledgeSource = (id: string) => {
    onChange({
      ...plan,
      metadata: {
        ...plan?.metadata,
        projectOverview: {
          ...plan?.metadata?.projectOverview,
          knowledgeSources: (plan?.metadata?.projectOverview?.knowledgeSources || []).filter(s => s.id !== id)
        }
      }
    });
  };

  const updateKnowledgeSource = (id: string, updates: any) => {
    onChange({
      ...plan,
      metadata: {
        ...plan?.metadata,
        projectOverview: {
          ...plan?.metadata?.projectOverview,
          knowledgeSources: (plan?.metadata?.projectOverview?.knowledgeSources || []).map(s => 
            s.id === id ? { ...s, ...updates } : s
          )
        }
      }
    });
  };

  const handleRecommendTech = async () => {
    if (isRecommendingTech) return;
    setIsRecommendingTech(true);
    setAiError(null);
    try {
      const context = `
        Purpose: ${plan?.metadata?.projectOverview?.purpose}
        Target Audience: ${plan?.metadata?.projectOverview?.target}
        Features: ${plan?.metadata?.projectOverview?.features}
        KPI: ${plan?.metadata?.projectOverview?.kpi}
      `;
      const techStack = await recommendTechStack(context, language, undefined, plan.deploymentProfile?.mode, plan.metadata?.platform);
      handleOverviewChange('techStack', techStack);
    } catch (error: any) {
      console.error("Failed to recommend tech stack:", error);
      if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') {
        setAiError(t('gemini_rate_limit'));
      } else {
        setAiError(t('common_error'));
      }
    } finally {
      setIsRecommendingTech(false);
    }
  };

  const handleGenerateCriticism = async () => {
    if (isCriticizing) return;
    setIsCriticizing(true);
    setAiError(null);
    try {
      const context = `
        Purpose: ${plan?.metadata?.projectOverview?.purpose}
        Target Audience: ${plan?.metadata?.projectOverview?.target}
        KPI: ${plan?.metadata?.projectOverview?.kpi}
        Reference: ${plan?.metadata?.projectOverview?.reference}
        Benchmark URL: ${plan?.metadata?.projectOverview?.benchmarkUrl}
        Benchmark Analysis: ${plan?.metadata?.projectOverview?.benchmarkAnalysis}
        Tone & Manner: ${plan?.metadata?.projectOverview?.toneAndManner}
        Features: ${plan?.metadata?.projectOverview?.features}
        Tech Stack: ${plan?.metadata?.projectOverview?.techStack}
      `;
      let accumulatedCriticism = '';
      await streamAiCriticism(
        context,
        (chunk) => {
          accumulatedCriticism += chunk;
          handleOverviewChange('aiCriticism', accumulatedCriticism);
        },
        language,
        undefined,
        plan.deploymentProfile?.mode,
        plan.metadata?.platform
      );
    } catch (error: any) {
      console.error("Failed to generate criticism:", error);
      if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') {
        setAiError(t('gemini_rate_limit'));
      } else {
        setAiError(t('common_error'));
      }
    } finally {
      setIsCriticizing(false);
    }
  };

  const handleGenerateStrategy = async () => {
    if (isStrategizing) return;
    setIsStrategizing(true);
    setAiError(null);
    try {
      const knowledgeContext = plan?.metadata?.projectOverview?.knowledgeSources?.map(s => 
        `- [${s.type.toUpperCase()}] ${s.name}: ${s.description || ''}${s.url ? ` (${s.url})` : ''}`
      ).join('\n') || 'None provided';

      const context = `
        Purpose: ${plan?.metadata?.projectOverview?.purpose}
        Target Audience: ${plan?.metadata?.projectOverview?.target}
        KPI: ${plan?.metadata?.projectOverview?.kpi}
        Reference: ${plan?.metadata?.projectOverview?.reference}
        Benchmark URL: ${plan?.metadata?.projectOverview?.benchmarkUrl}
        Benchmark Analysis: ${plan?.metadata?.projectOverview?.benchmarkAnalysis}
        Tone & Manner: ${plan?.metadata?.projectOverview?.toneAndManner}
        Features: ${plan?.metadata?.projectOverview?.features}
        Tech Stack: ${plan?.metadata?.projectOverview?.techStack}
        
        AI Criticism & Risks Analysis:
        ${plan?.metadata?.projectOverview?.aiCriticism || 'No prior analysis available.'}
        
        Knowledge Sources (Critical materials provided by user - PLEASE ANALYZE THESE CAREFULLY):
        ${knowledgeContext}
      `;
      const strategy = await generateProjectStrategy(context, language, undefined, plan.deploymentProfile?.mode, plan.metadata?.platform);
      handleOverviewChange('aiStrategyDirection', strategy);
    } catch (error: any) {
      console.error("Failed to generate strategy:", error);
      if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') {
        setAiError(t('gemini_rate_limit'));
      } else {
        setAiError(t('common_error'));
      }
    } finally {
      setIsStrategizing(false);
    }
  };

  const handleOverviewChange = (name: keyof MetadataConfig['projectOverview'], value: any) => {
    const newPlan = {
      ...plan,
      metadata: {
        ...plan?.metadata,
        projectOverview: {
          ...plan?.metadata?.projectOverview,
          [name]: value
        }
      }
    };
    onChange(newPlan);
  };

  const projectContext = `
    Project Name: ${plan?.metadata?.projectName || 'Untitled'}
    Purpose: ${plan?.metadata?.projectOverview?.purpose}
    Target Audience: ${plan?.metadata?.projectOverview?.target}
    KPI: ${plan?.metadata?.projectOverview?.kpi}
    Tone & Manner: ${plan?.metadata?.projectOverview?.toneAndManner}
    Features: ${plan?.metadata?.projectOverview?.features}
    Tech Stack: ${plan?.metadata?.projectOverview?.techStack}
  `;

  return (
    <div className="space-y-12">
      <AnimatePresence>
        {aiError && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex items-center justify-between gap-4 overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                <ShieldAlert size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-rose-800 uppercase tracking-widest">{t('error_occurred') || 'Error Occurred'}</span>
                <span className="text-sm font-bold text-rose-600">{aiError}</span>
              </div>
            </div>
            <IconButton onClick={() => setAiError(null)} icon={X} variant="ghost" size="sm" className="text-rose-400 hover:text-rose-600" tooltip={t('close')} />
          </motion.div>
        )}
      </AnimatePresence>

      {activeStep === 0 && (
        <div className="space-y-12">
          <StepHeader 
            title={t('start_project_title')}
            subtitle={t('start_project_subtitle')}
            icon={ClipboardList}
            badge="PHASE 01"
            color="slate"
          />
          <div className="max-w-4xl">
            <div className="bg-slate-50 p-12 rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/50">
              <label className="text-xs font-black text-goguma uppercase tracking-[0.3em] mb-4 block">{t('project_name_label')}</label>
              <input
                id="project-name-input"
                type="text"
                autoFocus
                value={plan?.metadata?.projectName || ''}
                onChange={(e) => onChange({ ...plan, metadata: { ...plan?.metadata, projectName: e.target.value } })}
                placeholder={t('project_name_placeholder')}
                className="w-full text-5xl font-black text-slate-800 outline-none placeholder:text-slate-200 bg-transparent"
              />
              <div className="mt-12 space-y-4">
                <label className="text-xs font-black text-goguma uppercase tracking-[0.3em] mb-4 block">{t('select_platform')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { id: 'WEB', name: t('web_platform'), desc: t('web_platform_desc'), icon: Monitor, color: 'goguma' },
                    { id: 'APP', name: t('app_platform'), desc: t('app_platform_desc'), icon: Smartphone, color: 'indigo' }
                  ].map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => onChange({ ...plan, metadata: { ...plan?.metadata, platform: platform.id as 'WEB' | 'APP' } })}
                      className={`relative group p-8 rounded-[32px] border-2 transition-all text-left flex flex-col gap-4 overflow-hidden ${
                        plan.metadata?.platform === platform.id 
                          ? 'border-goguma bg-goguma-light rounded-[32px] shadow-xl shadow-goguma/20' 
                          : 'border-slate-100 hover:border-slate-200 bg-white shadow-sm hover:shadow-xl hover:shadow-slate-100'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        plan.metadata?.platform === platform.id ? 'bg-goguma text-white shadow-lg shadow-goguma/20' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-lg'
                      }`}>
                        <platform.icon size={28} />
                      </div>
                      <div>
                        <h4 className={`text-lg font-black tracking-tight ${plan.metadata?.platform === platform.id ? 'text-goguma' : 'text-slate-800'}`}>
                          {platform.name}
                        </h4>
                        <p className={`text-xs font-medium leading-relaxed mt-1 ${plan.metadata?.platform === platform.id ? 'text-goguma/70' : 'text-slate-400'}`}>
                          {platform.desc}
                        </p>
                      </div>
                      {plan.metadata?.platform === platform.id && (
                        <div className="absolute top-6 right-6 w-6 h-6 bg-goguma rounded-full flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                      
                      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform duration-700 group-hover:scale-150 ${
                        plan.metadata?.platform === platform.id ? 'bg-goguma' : 'bg-slate-900'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-12 space-y-4">
                <label className="text-xs font-black text-goguma uppercase tracking-[0.3em] mb-4 block">{t('select_service_type') || '서비스 형태 선택'}</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'personal', name: t('signup_mode_personal'), desc: t('personal_mode_desc'), icon: User, color: 'goguma' },
                    { id: 'enterprise', name: t('signup_mode_enterprise'), desc: t('enterprise_mode_desc'), icon: Building, color: 'indigo' },
                    { id: 'commercial', name: t('signup_mode_commercial'), desc: t('commercial_mode_desc'), icon: Sparkles, color: 'amber' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => onChange({ ...plan, metadata: { ...plan?.metadata, projectMode: mode.id as 'personal' | 'enterprise' | 'commercial' } })}
                      className={`relative group p-6 rounded-[24px] border-2 transition-all text-left flex flex-col gap-3 overflow-hidden ${
                        (plan.metadata?.projectMode || 'personal') === mode.id 
                          ? 'border-goguma bg-goguma-light rounded-[24px] shadow-xl shadow-goguma/20' 
                          : 'border-slate-100 hover:border-slate-200 bg-white shadow-sm hover:shadow-xl hover:shadow-slate-100'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        (plan.metadata?.projectMode || 'personal') === mode.id ? 'bg-goguma text-white shadow-md shadow-goguma/20' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-md'
                      }`}>
                        <mode.icon size={20} />
                      </div>
                      <div>
                        <h4 className={`text-sm font-black tracking-tight ${(plan.metadata?.projectMode || 'personal') === mode.id ? 'text-goguma' : 'text-slate-800'}`}>
                          {mode.name}
                        </h4>
                        <p className={`text-[11px] font-medium leading-relaxed mt-1 ${(plan.metadata?.projectMode || 'personal') === mode.id ? 'text-goguma/70' : 'text-slate-400'}`}>
                          {mode.desc}
                        </p>
                      </div>
                      {(plan.metadata?.projectMode || 'personal') === mode.id && (
                        <div className="absolute top-4 right-4 w-5 h-5 bg-goguma rounded-full flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                      
                      <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-[0.03] transition-transform duration-700 group-hover:scale-150 ${
                        (plan.metadata?.projectMode || 'personal') === mode.id ? 'bg-goguma' : 'bg-slate-900'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-12 pt-8 border-t border-slate-200 flex items-center gap-4 text-slate-400">
                <Zap size={16} className="text-amber-400" />
                <p className="text-sm font-medium">{t('edit_name_anytime')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeStep === 1 && (
        <div className="space-y-12">
          <StepHeader 
            title={t('goals_objectives_title')}
            subtitle={t('goals_objectives_subtitle')}
            icon={Target}
            badge="PHASE 02"
            color="goguma"
          />
          <div id="vision-context-section" className="max-w-4xl">
            <div className="space-y-12">
            {/* GOGUMA Intelligent Domain Strategy Center */}
            <div className="bg-slate-50 border-2 border-slate-100 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-goguma rounded-2xl flex items-center justify-center text-white">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-800">{t('domain_strategy_title')}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{t('domain_strategy_subtitle')}</p>
                  </div>
                </div>
                <span className="text-[9px] bg-indigo-50 font-black px-2.5 py-1 rounded text-goguma uppercase tracking-wider animate-pulse">
                  {t('domain_goguma_intelligent')}
                </span>
              </div>

              {/* Strategy Modes Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleDomainStrategyChange('goguma')}
                  className={`p-5 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer group ${
                    (plan.metadata?.projectOverview?.domainMode || 'own') === 'goguma'
                      ? 'border-goguma bg-goguma-light font-bold shadow-lg shadow-goguma/5'
                      : 'border-white bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-black flex items-center gap-1.5 ${
                      (plan.metadata?.projectOverview?.domainMode || 'own') === 'goguma' ? 'text-goguma' : 'text-slate-800'
                    }`}>
                      {t('domain_option_goguma_temp')}
                    </span>
                    <span className="text-[8px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      {t('domain_7day_lease')}
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-400 font-semibold group-hover:text-slate-500">
                    {t('domain_option_goguma_desc')}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDomainStrategyChange('own')}
                  className={`p-5 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer group ${
                    (plan.metadata?.projectOverview?.domainMode || 'own') === 'own'
                      ? 'border-goguma bg-goguma-light font-bold shadow-lg shadow-goguma/5'
                      : 'border-white bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-black flex items-center gap-1.5 ${
                      (plan.metadata?.projectOverview?.domainMode || 'own') === 'own' ? 'text-goguma' : 'text-slate-800'
                    }`}>
                      {t('domain_option_own')}
                    </span>
                    <span className="text-[8px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      {t('domain_production_use')}
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-400 font-semibold group-hover:text-slate-500">
                    {t('domain_option_own_desc')}
                  </p>
                </button>
              </div>

              {/* Dynamic Strategy Input Form */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4">
                {(plan.metadata?.projectOverview?.domainMode || 'own') === 'goguma' ? (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">{t('domain_temp_host_label')}</label>
                    <div className="flex items-center border-2 border-slate-100 rounded-xl px-4 py-2.5 bg-slate-50 focus-within:border-goguma/30 focus-within:ring-4 focus-within:ring-goguma/5 transition-all">
                      <span className="text-slate-400 font-mono text-[11px] font-bold select-none pr-1">https://</span>
                      <input
                        type="text"
                        value={plan.metadata?.projectOverview?.gogumaSubdomain || ''}
                        onChange={(e) => {
                          const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                          handleDomainStrategyChange('goguma', sanitized);
                        }}
                        placeholder="my-goguma-brand"
                        className="flex-1 bg-transparent border-none outline-none font-mono font-bold text-xs text-slate-800 p-0"
                      />
                      <span className="text-slate-500 font-mono text-[11px] font-black pl-1">.goguma.app</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 gap-2">
                       <span className="text-[9px] text-slate-400 font-bold">
                        {t('domain_temp_host_tip')}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const projName = plan.metadata?.projectName || '';
                          const backup = getSlugFromName(projName);
                          handleDomainStrategyChange('goguma', backup);
                        }}
                        className="text-[9px] text-goguma hover:underline font-black bg-goguma-light px-2.5 py-1.5 rounded-lg border border-goguma/10 cursor-pointer"
                      >
                        {t('domain_reset_to_slug')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">{t('domain_own_address_label')}</label>
                    <div className="flex items-center border-2 border-slate-100 rounded-xl px-4 py-2.5 bg-slate-50 focus-within:border-goguma/30 focus-within:ring-4 focus-within:ring-goguma/5 transition-all">
                      <span className="text-slate-400 font-mono text-[11px] font-bold select-none pr-1">https://</span>
                      <input
                        type="text"
                        value={(plan.metadata?.projectOverview?.targetUrl || '')
                          .replace(/^(https?:\/\/)?(www\.)?/, '')
                          .split('/')[0]
                          .split(':')[0]}
                        onChange={(e) => {
                          const val = e.target.value.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
                          handleDomainStrategyChange('own', undefined, val);
                        }}
                        placeholder="예: mygoguma.com (또는 event.koreancenter.net)"
                        className="flex-1 bg-transparent border-none outline-none font-mono font-bold text-xs text-slate-800 p-0"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold">
                      {t('domain_protocal_explanation')}
                    </p>
                  </div>
                )}

                {/* Unified Target URL Preview Indicator */}
                <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-400">{t('domain_final_reserved_target_url')}</span>
                  <span className="font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {plan.metadata?.projectOverview?.targetUrl || t('unspecified')}
                  </span>
                </div>
              </div>
            </div>
            <InputField 
              label={t('purpose_label')} 
              name="purpose" 
              value={plan.metadata?.projectOverview?.purpose || ''}
              placeholder={t('purpose_placeholder')}
              description={t('purpose_desc')}
              icon={Target}
              autoBullet={true}
              rows={8}
              projectContext={projectContext}
              onChange={handleOverviewChange}
            />
            <InputField 
              label={t('target_audience_label')} 
              name="target" 
              value={plan.metadata?.projectOverview?.target || ''}
              placeholder={t('target_audience_placeholder')}
              description={t('target_audience_desc')}
              icon={Search}
              autoBullet={true}
              rows={8}
              projectContext={projectContext}
              onChange={handleOverviewChange}
            />
            <InputField 
              label={t('kpi_label')} 
              name="kpi" 
              value={plan.metadata?.projectOverview?.kpi || ''}
              placeholder={t('kpi_placeholder')}
              description={t('kpi_desc')}
              icon={BarChart3}
              autoBullet={true}
              rows={8}
              projectContext={projectContext}
              onChange={handleOverviewChange}
            />
            <InputField 
              label={t('tone_manner_label')} 
              name="toneAndManner" 
              value={plan.metadata?.projectOverview?.toneAndManner || ''}
              placeholder={t('tone_manner_placeholder')}
              description={t('tone_manner_desc')}
              icon={Palette}
              rows={8}
              projectContext={projectContext}
              onChange={handleOverviewChange}
            />
            <InputField 
              label={t('core_features_label')} 
              name="features" 
              value={plan.metadata?.projectOverview?.features || ''}
              placeholder="e.g., User authentication, real-time analytics, dynamic content management"
              description={t('core_features_desc')}
              icon={Zap}
              autoBullet={true}
              rows={8}
              projectContext={projectContext}
              onChange={handleOverviewChange}
            />
            <InputField 
              label={t('tech_stack_label')} 
              name="techStack" 
              value={plan.metadata?.projectOverview?.techStack || ''}
              placeholder={t('tech_stack_placeholder')}
              description={t('tech_stack_desc')}
              icon={Settings}
              suggestions={TECH_STACK_SUGGESTIONS}
              rows={8}
              hideRefine={true}
              actions={
                <IconButton
                  onClick={handleRecommendTech}
                  isLoading={isRecommendingTech}
                  icon={Sparkles}
                  tooltip={t('tech_stack_ai_recommend')}
                  variant="ai"
                  size="sm"
                />
              }
              projectContext={projectContext}
              onChange={handleOverviewChange}
            />
          </div>
        </div>
      </div>
      )}

      {activeStep === 2 && (
        <div className="space-y-12">
          <StepHeader 
            title={t('inspiration_concept_title')}
            subtitle={t('inspiration_concept_subtitle')}
            icon={Search}
            badge="PHASE 03"
            color="rose"
          />
          <div className="max-w-4xl">
            <div className="space-y-12">
            <InputField 
              label={t('reference_label')} 
              name="reference" 
              value={plan.metadata?.projectOverview?.reference || ''}
              placeholder={t('reference_placeholder')}
              description={t('reference_desc') || 'Describe style references and inspiration sources.'}
              icon={Search}
              rows={8}
              hideRefine={true}
              actions={
                <IconButton
                  onClick={handleRecommend}
                  isLoading={isRecommending}
                  icon={Sparkles}
                  tooltip={t('ai_recommend')}
                  variant="ai"
                  size="sm"
                />
              }
              projectContext={projectContext}
              onChange={handleOverviewChange}
            />

            <div className="space-y-8">
              <InputField 
                label={t('benchmark_label')} 
                name="benchmarkUrl" 
                value={plan.metadata?.projectOverview?.benchmarkUrl || ''}
                placeholder={t('benchmark_url_placeholder')}
                description={t('benchmark_url_desc') || 'Enter the URL of a physical benchmark or competitor site.'}
                icon={Globe}
                rows={2}
                hideRefine={true}
                actions={
                  <IconButton
                    onClick={handleAnalyze}
                    isLoading={isAnalyzing}
                    disabled={!plan.metadata?.projectOverview?.benchmarkUrl}
                    icon={Search}
                    tooltip={t('ai_analyze')}
                    variant="ai"
                    size="sm"
                  />
                }
                projectContext={projectContext}
                onChange={handleOverviewChange}
              />

              <InputField 
                label={t('benchmark_analysis_label') || 'Benchmark Analysis'} 
                name="benchmarkAnalysis" 
                value={plan.metadata?.projectOverview?.benchmarkAnalysis || ''}
                placeholder={t('analysis_placeholder')}
                description={t('benchmark_analysis_desc') || 'AI-generated analysis of the benchmark site features and strategy.'}
                icon={BarChart3}
                rows={8}
                projectContext={projectContext}
                onChange={handleOverviewChange}
              />
            </div>

              {/* Knowledge Sources Section */}
              <div className="bg-slate-50 p-10 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Paperclip size={24} className="text-emerald-600" />
                    {t('knowledge_source_title')}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {t('knowledge_source_subtitle')}
                  </p>
                  <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.1em] mt-2 bg-emerald-50 px-2 py-1 rounded inline-block">
                    {t('file_limit_info')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <IconButton
                    onClick={() => addKnowledgeSource('link')}
                    icon={Link}
                    tooltip={t('add_knowledge_link')}
                    variant="primary"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                  />

                  <div className="relative">
                    <IconButton
                      onClick={() => {
                        const input = document.getElementById('knowledge-file-upload');
                        if (input) input.click();
                      }}
                      icon={Paperclip}
                      tooltip={t('upload_knowledge_file')}
                      variant="secondary"
                      size="sm"
                      className="bg-slate-900 hover:bg-slate-800 shadow-slate-200"
                    />
                    <input 
                      id="knowledge-file-upload"
                      type="file" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            alert("File size exceeds 10MB limit.");
                            return;
                          }
                          const newId = Math.random().toString(36).substr(2, 9);
                          const newSource = {
                            id: newId,
                            name: file.name,
                            type: 'file' as const,
                            description: `Uploaded file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`
                          };
                          onChange({
                            ...plan,
                            metadata: {
                              ...plan.metadata,
                              projectOverview: {
                                ...plan.metadata?.projectOverview,
                                knowledgeSources: [...(plan.metadata?.projectOverview?.knowledgeSources || []), newSource]
                              }
                            }
                          });
                        }
                      }} 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {(!plan.metadata?.projectOverview?.knowledgeSources || plan.metadata?.projectOverview?.knowledgeSources?.length === 0) && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl">
                    <p className="text-sm font-medium text-slate-400">{t('knowledge_source_placeholder')}</p>
                  </div>
                )}
                {plan.metadata?.projectOverview?.knowledgeSources?.map((source) => (
                  <motion.div 
                    key={source.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 group relative"
                  >
                    <div className="absolute top-4 right-4">
                      <IconButton
                        onClick={() => removeKnowledgeSource(source.id)}
                        icon={Trash2}
                        tooltip={t('delete')}
                        variant="ghost"
                        size="sm"
                        className="hover:text-red-500 hover:bg-red-50"
                      />
                    </div>

                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        source.type === 'link' ? 'bg-goguma-light text-goguma' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {source.type === 'link' ? <Link size={20} /> : <FileText size={20} />}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase ml-1">
                              {t('knowledge_source_name')}
                            </label>
                            <input 
                              type="text"
                              value={source.name}
                              onChange={(e) => updateKnowledgeSource(source.id, { name: e.target.value })}
                              className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-goguma-light transition-all"
                            />
                          </div>
                          {source.type === 'link' && (
                            <div className="space-y-1">
                              <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase ml-1">
                                URL
                              </label>
                              <input 
                                type="text"
                                value={source.url || ''}
                                onChange={(e) => updateKnowledgeSource(source.id, { url: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase ml-1">
                            {t('knowledge_source_desc_label')}
                          </label>
                          <textarea 
                            value={source.description || ''}
                            onChange={(e) => updateKnowledgeSource(source.id, { description: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all min-h-[60px] resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Architecture Review & System Constraints Panel */}
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-rose-400">
                    <ShieldAlert size={22} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white leading-snug">
                      {t('ai_criticism_title')}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t('ai_criticism_subtitle')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateCriticism}
                    disabled={isCriticizing}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    <ShieldAlert size={14} className={isCriticizing ? 'animate-spin text-rose-400' : 'text-rose-400'} />
                    <span>{isCriticizing ? t('generating') || 'Analyzing...' : t('analyze_criticism')}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1.5">
                  <div className="font-semibold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    <span>{language === 'ko' ? '주요 배제 원칙 (Negative Constraints)' : 'Negative Constraints'}</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    {language === 'ko' 
                      ? '보안 취약점, 비인가 API 키 노출, 불필요한 서드파티 의존성, 모바일 터치 미준수 요소 등 배제해야 할 안티패턴을 기록합니다.'
                      : 'Define security guardrails, prohibited patterns, performance bottlenecks, and non-negotiable constraints.'}
                  </p>
                </div>
                <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1.5">
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>{language === 'ko' ? '아키텍처 무결성 보장' : 'Architectural Integrity'}</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    {language === 'ko'
                      ? '기록된 검토 사항은 프롬프트 허브(SPEC.md) 및 프로젝트 보고서에 규정 제약사항으로 자동 반영됩니다.'
                      : 'Recorded constraints are directly injected into SPEC.md and engineering reports as authoritative project standards.'}
                  </p>
                </div>
              </div>
            </div>

            <InputField 
              label={t('ai_criticism_title')} 
              name="aiCriticism" 
              value={plan.metadata?.projectOverview?.aiCriticism || ''}
              placeholder={t('criticism_placeholder')}
              description={t('ai_criticism_subtitle')}
              icon={Terminal}
              rows={10}
              hideRefine={true}
              actions={
                <IconButton
                  onClick={handleGenerateCriticism}
                  isLoading={isCriticizing}
                  icon={ShieldAlert}
                  tooltip={t('analyze_criticism')}
                  variant="ai"
                  size="sm"
                />
              }
              projectContext={projectContext}
              onChange={handleOverviewChange}
            />

            <InputField 
              label={t('gemini_strategy_title')} 
              name="aiStrategyDirection" 
              value={plan.metadata?.projectOverview?.aiStrategyDirection || ''}
              placeholder={t('strategy_placeholder')}
              description={t('strategy_desc') || 'Define strategic direction, business logic, and implementation phases.'}
              icon={Sparkles}
              rows={10}
              hideRefine={true}
              actions={
                <IconButton
                  onClick={handleGenerateStrategy}
                  isLoading={isStrategizing}
                  icon={Sparkles}
                  tooltip={t('generate')}
                  variant="ai"
                  size="sm"
                />
              }
              projectContext={projectContext}
              onChange={handleOverviewChange}
            />
          </div>
        </div>
      </div>
    )}

      {activeStep === 3 && (
        <div className="space-y-12">
          <StepHeader 
            title={t('tech_roadmap_title')}
            subtitle={t('tech_roadmap_subtitle')}
            icon={Cpu}
            badge="PHASE 04"
            color="amber"
          />
          <div className="max-w-4xl">
            <div className="space-y-12">
                <div className="space-y-4">
                  <InputField 
                    label={t('roadmap_label')} 
                    name="schedule" 
                    value={plan.metadata?.projectOverview?.schedule || ''}
                    placeholder={t('roadmap_placeholder')}
                    description={t('roadmap_desc')}
                    icon={Calendar}
                    rows={8}
                    hideRefine={true}
                    actions={
                      <>
                        <IconButton
                          onClick={handleGenerateRoadmap}
                          isLoading={isGeneratingRoadmap}
                          icon={Sparkles}
                          tooltip={t('generate_roadmap')}
                          variant="ai"
                          size="sm"
                        />
                        <IconButton
                          onClick={() => setShowChart(!showChart)}
                          icon={BarChart3}
                          tooltip={showChart ? t('hide_chart') : t('generate_chart')}
                          variant="secondary"
                          size="sm"
                        />
                      </>
                    }
                    projectContext={projectContext}
                    onChange={handleOverviewChange}
                  />
                </div>
              </div>
            </div>
            
            <AnimatePresence>
            {showChart && plan.metadata?.projectOverview?.schedule && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full"
              >
                <RoadmapChart schedule={plan.metadata?.projectOverview?.schedule || ''} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
