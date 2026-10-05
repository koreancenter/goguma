import { Language, ScreenNode } from '../types';

export interface LocalSEOData {
  title: string;
  description: string;
  keywords: string;
}

/**
 * Deterministic client-side SEO metadata compiler.
 * Generates standards-compliant SEO tags without external API round-trips.
 */
export function compileLocalSEOData(
  pageName: string,
  pageScript: string,
  projectContext: string,
  lang: Language = 'ko',
  platform: 'WEB' | 'APP' = 'WEB'
): LocalSEOData {
  const isKo = lang === 'ko';
  const cleanName = pageName.trim() || (isKo ? '페이지' : 'Page');

  // Extract headings or first text paragraph from script if available
  const textFromScript = pageScript
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract key terms or fallback
  const cleanContext = projectContext.replace(/\s+/g, ' ').trim();
  const contextSnippet = cleanContext.length > 80 ? cleanContext.substring(0, 80) + '...' : cleanContext;

  const title = isKo
    ? `${cleanName} | ${platform === 'APP' ? '모바일 서비스' : '공식 웹사이트'}`
    : `${cleanName} | Official ${platform === 'APP' ? 'Mobile App' : 'Website'}`;

  let description = textFromScript.length > 30
    ? textFromScript.substring(0, 150)
    : (isKo
      ? `${cleanName} 안내 및 상세 기능 명세입니다. ${contextSnippet}`
      : `${cleanName} overview, core features, and architectural specifications.`);

  if (description.length > 155) {
    description = description.substring(0, 152) + '...';
  }

  const defaultKeywords = isKo
    ? `${cleanName}, ${platform === 'APP' ? '앱, 모바일' : '웹사이트, 웹'}, 아키텍처, 기획서, UX`
    : `${cleanName.toLowerCase()}, ${platform === 'APP' ? 'app, mobile' : 'web, website'}, architecture, specification, ux`;

  return {
    title: title.length > 60 ? title.substring(0, 58) + '..' : title,
    description,
    keywords: defaultKeywords,
  };
}

/**
 * Deterministic Screen Decomposer
 * Parses HTML/scripts into structured layout components (Hero, Content, CTA, Footer, etc.)
 * Provides instant layout nodes with 0ms latency and zero external AI failures.
 */
export function decomposeLocalScreenStructure(
  pageName: string,
  script: string,
  lang: Language = 'ko',
  platform: 'WEB' | 'APP' = 'WEB'
): ScreenNode[] {
  const isKo = lang === 'ko';
  const isApp = platform === 'APP';
  const nodes: ScreenNode[] = [];

  // If script contains explicit HTML sections or tags, extract them
  const sectionRegex = /<(section|header|footer|article|main|nav|div|form)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  let counter = 1;

  while ((match = sectionRegex.exec(script)) !== null && counter <= 7) {
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    const inner = match[3].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    // Extract id or class if available
    const idMatch = attrs.match(/id=["']([^"']+)["']/i);
    const classMatch = attrs.match(/class=["']([^"']+)["']/i);
    const identifier = idMatch ? idMatch[1] : (classMatch ? classMatch[1].split(' ')[0] : tag);

    const padCounter = String(counter * 10).padStart(3, '0');
    const nodeId = `SCR-${padCounter}`;

    let label = '';
    let description = '';

    if (tag === 'header' || identifier.includes('header') || identifier.includes('hero') || counter === 1) {
      label = isKo ? (isApp ? '헤더 및 메인 뷰' : '히어로 / 헤더 영역') : 'Hero / Header Section';
      description = isKo ? '상단 비주얼 영역, 주요 타이틀 및 핵심 콜투액션(CTA) 배치' : 'Top visual hero with primary headline and primary CTA.';
    } else if (tag === 'footer' || identifier.includes('footer')) {
      label = isKo ? '푸터 / 정책 영역' : 'Footer & Legal Notice';
      description = isKo ? '하단 사이트맵, 저작권 안내, 이용약관 및 고객지원 링크' : 'Bottom sitemap, copyright notices, and legal disclosures.';
    } else if (tag === 'form' || identifier.includes('form') || identifier.includes('contact')) {
      label = isKo ? '입력 폼 / 데이터 수집' : 'Interactive Form Module';
      description = isKo ? '사용자 데이터 입력, 유효성 검증 및 전송 상호작용 컴포넌트' : 'User input capture, validation logic, and submit handlers.';
    } else if (identifier.includes('faq')) {
      label = isKo ? 'FAQ 아코디언' : 'FAQ Accordion';
      description = isKo ? '자주 묻는 질문 목록 및 접이식 토글 인터랙션' : 'Frequently asked questions list with collapsible toggles.';
    } else if (identifier.includes('feature') || identifier.includes('grid') || identifier.includes('list')) {
      label = isKo ? '주요 특징 그리드' : 'Feature Highlights Grid';
      description = isKo ? '카드형 그리드로 구성된 핵심 기능 및 가치 제안 블록' : 'Grid-based feature highlights and value propositions.';
    } else {
      label = isKo ? `${pageName} 섹션 ${counter}` : `${pageName} Section ${counter}`;
      description = inner.length > 60 ? inner.substring(0, 60) + '...' : (inner || (isKo ? '기능 및 콘텐츠 표시 컨테이너' : 'Content display container'));
    }

    nodes.push({
      id: nodeId,
      label,
      description
    });
    counter++;
  }

  // Fallback if no structured tags found in script
  if (nodes.length === 0) {
    if (isApp) {
      return [
        {
          id: 'SCR-010',
          label: isKo ? '상단 내비게이션 바' : 'Top Navigation Bar',
          description: isKo ? '뒤로가기, 타이틀 및 상단 액션 아이콘' : 'Back navigation, title, and action icons.'
        },
        {
          id: 'SCR-020',
          label: isKo ? '메인 인터랙션 뷰' : 'Main Interaction View',
          description: isKo ? `${pageName} 핵심 데이터 및 리스트 뷰` : `Core view displaying ${pageName} data.`
        },
        {
          id: 'SCR-030',
          label: isKo ? '액션 바 / 바텀 시트' : 'Action Bar / Bottom Sheet',
          description: isKo ? '주요 액션 실행 버튼 및 보조 모달' : 'Primary action triggers and secondary modals.'
        },
        {
          id: 'SCR-040',
          label: isKo ? '하단 탭 내비게이션' : 'Bottom Tab Navigation',
          description: isKo ? '글로벌 탭 전환 및 상태 표시 바' : 'Global tab switching and indicator bar.'
        }
      ];
    } else {
      return [
        {
          id: 'SCR-010',
          label: isKo ? 'GNB 및 히어로 섹션' : 'GNB & Hero Section',
          description: isKo ? `${pageName} 메인 배너 및 주요 안내` : `${pageName} hero introduction and value banner.`
        },
        {
          id: 'SCR-020',
          label: isKo ? '핵심 콘텐츠 블록' : 'Primary Content Block',
          description: isKo ? '상세 정보, 기능 리스트 및 미디어 영역' : 'Detailed information, feature items, and media display.'
        },
        {
          id: 'SCR-030',
          label: isKo ? 'CTA / 전환 컴포넌트' : 'Call To Action Module',
          description: isKo ? '문의하기 또는 주요 전환 유도 버튼' : 'Conversion prompt and primary action button.'
        },
        {
          id: 'SCR-040',
          label: isKo ? '푸터 및 저작권' : 'Footer & Legal Disclosures',
          description: isKo ? '하단 링크, 정책 문서 및 저작권 표시' : 'Bottom footer navigation and copyright.'
        }
      ];
    }
  }

  return nodes;
}
