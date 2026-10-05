/**
 * Client-Side Deterministic Slugify & URL Path Generator
 * Converts page names into clean, URL-safe English slugs without requiring AI calls.
 */

// Common Korean web & app navigational terms mapped to standard English slugs
const KOREAN_SLUG_MAP: Record<string, string> = {
  // Main & Overview
  '홈': 'home',
  '메인': 'home',
  '홈페이지': 'home',
  '대시보드': 'dashboard',
  '개요': 'overview',

  // About & Brand
  '소개': 'about',
  '회사소개': 'about',
  '서비스소개': 'services',
  '브랜드': 'brand',
  '비전': 'vision',
  '연혁': 'history',
  '팀': 'team',
  '조직도': 'organization',
  '오시는길': 'location',
  '위치': 'location',

  // Products & Services
  '서비스': 'services',
  '주요서비스': 'services',
  '제품': 'products',
  '상품': 'products',
  '상품목록': 'products',
  '상품상세': 'product-detail',
  '기능': 'features',
  '솔루션': 'solutions',
  '포트폴리오': 'portfolio',
  '프로젝트': 'projects',
  '사례': 'case-studies',
  '고객사': 'clients',

  // Pricing & Billing
  '가격': 'pricing',
  '요금': 'pricing',
  '요금제': 'pricing',
  '플랜': 'plans',
  '견적': 'estimate',
  '결제': 'checkout',
  '주문': 'order',
  '장바구니': 'cart',
  '주문내역': 'orders',
  '배송조회': 'delivery',

  // Support & Notices
  '공지': 'notices',
  '공지사항': 'notices',
  '뉴스': 'news',
  '보도자료': 'press',
  '블로그': 'blog',
  '아티클': 'articles',
  '자료실': 'resources',
  '다운로드': 'downloads',
  '고객센터': 'support',
  '고객지원': 'support',
  '문의': 'contact',
  '문의하기': 'contact',
  '도움말': 'help',
  '자주묻는질문': 'faq',
  '이용안내': 'guide',

  // User & Account
  '로그인': 'login',
  '로그아웃': 'logout',
  '회원가입': 'signup',
  '아이디찾기': 'find-id',
  '비밀번호찾기': 'find-password',
  '마이페이지': 'mypage',
  '내정보': 'profile',
  '프로필': 'profile',
  '설정': 'settings',
  '알림': 'notifications',
  '보안': 'security',

  // Legal & System
  '이용약관': 'terms',
  '약관': 'terms',
  '개인정보처리방침': 'privacy',
  '개인정보': 'privacy',
  '관리자': 'admin',
  '관리': 'management',
  '통계': 'analytics',
  '검색': 'search'
};

// Korean Hangul Jamo table for phonetic Romanization fallback
const CHOSUNG = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const JUNGSUNG = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
const JONGSUNG = ['', 'k', 'k', 'ks', 'n', 'nj', 'nh', 't', 'l', 'lg', 'lm', 'lb', 'ls', 'lt', 'lp', 'lh', 'm', 'p', 'ps', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 'h'];

/**
 * Phonetically romanizes Hangul characters
 */
function romanizeHangul(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Hangul Syllables range: 0xAC00 to 0xD7A3
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const syllableIndex = code - 0xAC00;
      const chosungIndex = Math.floor(syllableIndex / (21 * 28));
      const jungsungIndex = Math.floor((syllableIndex % (21 * 28)) / 28);
      const jongsungIndex = syllableIndex % 28;

      result += CHOSUNG[chosungIndex] + JUNGSUNG[jungsungIndex] + JONGSUNG[jongsungIndex];
    } else {
      result += text[i];
    }
  }
  return result;
}

/**
 * Local deterministic slugifier.
 * 1. Checks known dictionary matches.
 * 2. Phonetically romanizes Korean words if necessary.
 * 3. Sanitizes into clean lowercase kebab-case.
 */
export function generateLocalSlug(input: string): string {
  if (!input || !input.trim()) return '';

  const cleanInput = input.trim();

  // 1. Direct dictionary match
  const stripped = cleanInput.replace(/\s+/g, '');
  if (KOREAN_SLUG_MAP[stripped]) {
    return KOREAN_SLUG_MAP[stripped];
  }

  // 2. Substring dictionary search (e.g. "우리 회사 소개" -> "about")
  for (const [key, slug] of Object.entries(KOREAN_SLUG_MAP)) {
    if (cleanInput.includes(key)) {
      return slug;
    }
  }

  // 3. If contains Korean, phonetically romanize
  let processed = cleanInput;
  if (/[\uAC00-\uD7A3]/.test(processed)) {
    processed = romanizeHangul(processed);
  }

  // 4. Sanitize to kebab-case
  return processed
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')    // remove non-alphanumeric
    .trim()
    .replace(/\s+/g, '-')           // spaces to hyphens
    .replace(/-+/g, '-');           // collapse multiple hyphens
}
