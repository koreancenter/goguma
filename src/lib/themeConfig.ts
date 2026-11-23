export type ThemeId = 'sejong' | 'spring' | 'summer' | 'autumn' | 'winter';

export interface StudioThemeDefinition {
  id: ThemeId;
  seasonLabel: string;
  name: string;
  subtitle: string;
  description: string;
  isDark: boolean;
  swatches: {
    canvas: string;
    stage: string;
    ink: string;
    accent: string;
  };
  tokens: {
    canvas: string;
    stage: string;
    subtle: string;
    elevated: string;
    inkStrong: string;
    inkPrimary: string;
    inkBody: string;
    inkSecondary: string;
    inkMuted: string;
    borderHairline: string;
    borderStrong: string;
    barBg: string;
    barText: string;
    barAccent: string;
    btnBg: string;
    btnText: string;
    activeBg: string;
    activeText: string;
    hoverBg: string;
    hoverText: string;
    seal: string;
    success: string;
    successBg: string;
    danger: string;
    dangerBg: string;
    warning: string;
    warningBg: string;
    d3Link: string;
  };
}

export const THEME_STORAGE_KEY = 'goguma_theme';
export const DEFAULT_THEME_ID: ThemeId = 'sejong';

export const STUDIO_THEMES: StudioThemeDefinition[] = [
  {
    id: 'sejong',
    seasonLabel: 'DEFAULT · 기본',
    name: '세종 · 먹과 한지',
    subtitle: 'Sejong Ink & Hanji',
    description: '순백 갤러리 화이트와 미색 한지, 진묵 블랙, 인장 주홍이 조화된 기본 에디토리얼 테마입니다.',
    isDark: false,
    swatches: {
      canvas: '#FFFFFF',
      stage: '#F6F5F1',
      ink: '#000000',
      accent: '#DC2626',
    },
    tokens: {
      canvas: '#FFFFFF',
      stage: '#F6F5F1',
      subtle: '#EFEDE7',
      elevated: '#FFFFFF',
      inkStrong: '#000000',
      inkPrimary: '#111111',
      inkBody: '#2B2B29',
      inkSecondary: '#52524E',
      inkMuted: '#8C8B85',
      borderHairline: '#E4E2DC',
      borderStrong: '#CBC8BF',
      barBg: '#000000',
      barText: '#FFFFFF',
      barAccent: '#FFE600',
      btnBg: '#000000',
      btnText: '#FFFFFF',
      activeBg: '#000000',
      activeText: '#FFE600',
      hoverBg: '#DC2626',
      hoverText: '#FFE600',
      seal: '#DC2626',
      success: '#1F5132',
      successBg: '#F3F7F4',
      danger: '#DC2626',
      dangerBg: '#FEF2F2',
      warning: '#8A5314',
      warningBg: '#FAF6EE',
      d3Link: '#CBD5E1',
    },
  },
  {
    id: 'spring',
    seasonLabel: 'SPRING · 봄',
    name: '봄 · 매화와 유록',
    subtitle: 'Spring Plum & Young Leaf',
    description: '봄 햇살이 감도는 따뜻한 한지 위에 짙은 송엽 먹과 홍매화·유채빛 포인트를 담았습니다.',
    isDark: false,
    swatches: {
      canvas: '#FCFBF7',
      stage: '#F2F5EB',
      ink: '#1B2616',
      accent: '#B83B55',
    },
    tokens: {
      canvas: '#FCFBF7',
      stage: '#F2F5EB',
      subtle: '#E7ECE0',
      elevated: '#FFFFFF',
      inkStrong: '#182214',
      inkPrimary: '#1F2B1A',
      inkBody: '#2D3828',
      inkSecondary: '#4E5C47',
      inkMuted: '#7C8A75',
      borderHairline: '#DCE2D2',
      borderStrong: '#BFC9B2',
      barBg: '#1B2616',
      barText: '#FCFBF7',
      barAccent: '#F7DF68',
      btnBg: '#1B2616',
      btnText: '#FCFBF7',
      activeBg: '#1B2616',
      activeText: '#F7DF68',
      hoverBg: '#B83B55',
      hoverText: '#FFF8FA',
      seal: '#B83B55',
      success: '#1F5132',
      successBg: '#EEF5EE',
      danger: '#B83B55',
      dangerBg: '#FDF2F4',
      warning: '#8A5A14',
      warningBg: '#FAF6EA',
      d3Link: '#C5D1B8',
    },
  },
  {
    id: 'summer',
    seasonLabel: 'SUMMER · 여름',
    name: '여름 · 청자와 쪽빛',
    subtitle: 'Summer Celadon & Indigo',
    description: '모시처럼 서늘한 청백 캔버스와 고려청자 비색, 깊은 쪽빛 먹과 윤슬 금빛을 담았습니다.',
    isDark: false,
    swatches: {
      canvas: '#F8FBFB',
      stage: '#ECF4F3',
      ink: '#0B252B',
      accent: '#0E6E6E',
    },
    tokens: {
      canvas: '#F8FBFB',
      stage: '#ECF4F3',
      subtle: '#E0ECEB',
      elevated: '#FFFFFF',
      inkStrong: '#0B2228',
      inkPrimary: '#112C33',
      inkBody: '#1F3940',
      inkSecondary: '#476369',
      inkMuted: '#738E94',
      borderHairline: '#D1E0DF',
      borderStrong: '#B2C9C7',
      barBg: '#0B252B',
      barText: '#F8FBFB',
      barAccent: '#FCE17A',
      btnBg: '#0B252B',
      btnText: '#F8FBFB',
      activeBg: '#0B252B',
      activeText: '#FCE17A',
      hoverBg: '#0E6E6E',
      hoverText: '#FFFBEB',
      seal: '#0E6E6E',
      success: '#0F5E4D',
      successBg: '#ECF6F4',
      danger: '#B83232',
      dangerBg: '#FEF2F2',
      warning: '#9A5D12',
      warningBg: '#FBF6EA',
      d3Link: '#B8CECC',
    },
  },
  {
    id: 'autumn',
    seasonLabel: 'AUTUMN · 가을',
    name: '가을 · 단풍과 닥종이',
    subtitle: 'Autumn Maple & Mulberry',
    description: '가을볕에 익은 닥종이와 고목의 갈먹, 단풍 홍시와 은행잎 황색의 깊은 서정을 담았습니다.',
    isDark: false,
    swatches: {
      canvas: '#FDF9F2',
      stage: '#F5ECE0',
      ink: '#2B1B12',
      accent: '#B83B1D',
    },
    tokens: {
      canvas: '#FDF9F2',
      stage: '#F5ECE0',
      subtle: '#ECE0D0',
      elevated: '#FFFDF9',
      inkStrong: '#261A12',
      inkPrimary: '#302117',
      inkBody: '#3F2E22',
      inkSecondary: '#695547',
      inkMuted: '#968172',
      borderHairline: '#E3D5C3',
      borderStrong: '#CCBA9F',
      barBg: '#2B1B12',
      barText: '#FDF9F2',
      barAccent: '#F9CA56',
      btnBg: '#2B1B12',
      btnText: '#FDF9F2',
      activeBg: '#2B1B12',
      activeText: '#F9CA56',
      hoverBg: '#B83B1D',
      hoverText: '#FEF7E6',
      seal: '#B83B1D',
      success: '#2C5926',
      successBg: '#F2F6EE',
      danger: '#B83B1D',
      dangerBg: '#FDF2EE',
      warning: '#92530E',
      warningBg: '#FBF4E6',
      d3Link: '#D4C2AA',
    },
  },
  {
    id: 'winter',
    seasonLabel: 'WINTER · 겨울 (DARK)',
    name: '겨울 · 동짓달 야간 수묵',
    subtitle: 'Winter Nocturnal Ink',
    description: '고요한 동짓달 밤의 흑먹 캔버스와 달빛 안개, 백자 텍스트와 놋쇠 포인트로 눈의 피로를 줄인 야간 다크 모드입니다.',
    isDark: true,
    swatches: {
      canvas: '#0D1014',
      stage: '#141920',
      ink: '#EAE5DA',
      accent: '#D4B475',
    },
    tokens: {
      canvas: '#0D1014',
      stage: '#141920',
      subtle: '#1C232D',
      elevated: '#12171E',
      inkStrong: '#F2EFE9',
      inkPrimary: '#E6E2D8',
      inkBody: '#CFCAC0',
      inkSecondary: '#9A9891',
      inkMuted: '#6E737D',
      borderHairline: '#252C37',
      borderStrong: '#3A4556',
      barBg: '#06080B',
      barText: '#F2EFE9',
      barAccent: '#D4B475',
      btnBg: '#EAE5DA',
      btnText: '#0D1014',
      activeBg: '#222A36',
      activeText: '#E5C57B',
      hoverBg: '#B9382E',
      hoverText: '#FFF7D6',
      seal: '#D96258',
      success: '#6CC088',
      successBg: '#13261B',
      danger: '#F07167',
      dangerBg: '#2A1516',
      warning: '#E5B567',
      warningBg: '#261F13',
      d3Link: '#3A4556',
    },
  },
];

export function isValidThemeId(value: string | null | undefined): value is ThemeId {
  return value === 'sejong' || value === 'spring' || value === 'summer' || value === 'autumn' || value === 'winter';
}

export function getThemeDefinition(id?: string | null): StudioThemeDefinition {
  return STUDIO_THEMES.find((t) => t.id === id) || STUDIO_THEMES[0];
}

export function getStoredThemeId(): ThemeId {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (isValidThemeId(saved)) return saved;
  } catch {
    // ignore storage restrictions
  }
  return DEFAULT_THEME_ID;
}

export function applyThemeToDocument(themeId: ThemeId): StudioThemeDefinition {
  const def = getThemeDefinition(themeId);
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.dataset.theme = def.id;
    root.style.colorScheme = def.isDark ? 'dark' : 'light';
    if (def.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
  return def;
}

type SupportedLang = 'ko' | 'en' | 'ja' | 'id';

const THEME_I18N: Record<
  ThemeId,
  Record<SupportedLang, { seasonLabel: string; name: string; description: string }>
> = {
  sejong: {
    ko: {
      seasonLabel: 'DEFAULT · 기본',
      name: '세종 · 먹과 한지',
      description: '순백 갤러리 화이트와 미색 한지, 진묵 블랙, 인장 주홍이 조화된 기본 에디토리얼 테마입니다.',
    },
    en: {
      seasonLabel: 'DEFAULT',
      name: 'Sejong · Ink & Hanji',
      description: 'Pure gallery white paired with warm hanji paper, deep sumi ink, and vermilion seal accents.',
    },
    ja: {
      seasonLabel: 'DEFAULT · 基本',
      name: '世宗 · 墨と韓紙',
      description: '純白のギャラリーホワイトと生成りの韓紙、濃墨、朱印のアクセントが調和した標準テーマです。',
    },
    id: {
      seasonLabel: 'DEFAULT · STANDAR',
      name: 'Sejong · Tinta & Hanji',
      description: 'Putih galeri murni berpadu dengan kertas hanji hangat, tinta pekat, dan aksen merah segel.',
    },
  },
  spring: {
    ko: {
      seasonLabel: 'SPRING · 봄',
      name: '봄 · 매화와 유록',
      description: '봄 햇살이 감도는 따뜻한 한지 위에 짙은 송엽 먹과 홍매화·유채빛 포인트를 담았습니다.',
    },
    en: {
      seasonLabel: 'SPRING',
      name: 'Spring · Plum & Young Leaf',
      description: 'Sunlit pale hanji canvas accented with pine-needle ink, plum blossom crimson, and canola gold.',
    },
    ja: {
      seasonLabel: 'SPRING · 春',
      name: '春 · 紅梅と柳緑',
      description: '春の日差しを感じる温かな韓紙に、松葉墨と紅梅色・菜の花色のアクセントを添えました。',
    },
    id: {
      seasonLabel: 'SPRING · SEMI',
      name: 'Semi · Bunga Plum & Daun Muda',
      description: 'Kanvas hanji hangat bercahaya pagi dengan tinta hijau pinus dan aksen merah plum.',
    },
  },
  summer: {
    ko: {
      seasonLabel: 'SUMMER · 여름',
      name: '여름 · 청자와 쪽빛',
      description: '모시처럼 서늘한 청백 캔버스와 고려청자 비색, 깊은 쪽빛 먹과 윤슬 금빛을 담았습니다.',
    },
    en: {
      seasonLabel: 'SUMMER',
      name: 'Summer · Celadon & Indigo',
      description: 'Crisp ramie-cool canvas finished with Goryeo celadon jade, deep indigo ink, and sunlit gold.',
    },
    ja: {
      seasonLabel: 'SUMMER · 夏',
      name: '夏 · 青磁と藍色',
      description: '麻布のように涼やかな白磁キャンバスに、高麗青磁の翡翠色と深い藍墨を配しました。',
    },
    id: {
      seasonLabel: 'SUMMER · PANAS',
      name: 'Panas · Seladon & Nila',
      description: 'Kanvas sejuk bak kain rami dengan hijau giok seladon, tinta nila pekat, dan kilau emas.',
    },
  },
  autumn: {
    ko: {
      seasonLabel: 'AUTUMN · 가을',
      name: '가을 · 단풍과 닥종이',
      description: '가을볕에 익은 닥종이와 고목의 갈먹, 단풍 홍시와 은행잎 황색의 깊은 서정을 담았습니다.',
    },
    en: {
      seasonLabel: 'AUTUMN',
      name: 'Autumn · Maple & Mulberry',
      description: 'Autumn-cured mulberry paper matched with aged bark ink, persimmon maple, and ginkgo amber.',
    },
    ja: {
      seasonLabel: 'AUTUMN · 秋',
      name: '秋 · 紅葉と楮紙',
      description: '秋色に熟した楮紙と古木の茶墨、熟柿の紅葉色、銀杏の黄金色を組み合わせました。',
    },
    id: {
      seasonLabel: 'AUTUMN · GUGUR',
      name: 'Gugur · Maple & Kertas Mulberi',
      description: 'Kertas mulberi bernuansa senja musim gugur dengan tinta kayu tua, merah kesemek, dan kuning ginkgo.',
    },
  },
  winter: {
    ko: {
      seasonLabel: 'WINTER · 겨울 (DARK)',
      name: '겨울 · 동짓달 야간 수묵',
      description: '고요한 동짓달 밤의 흑먹 캔버스와 달빛 안개, 백자 텍스트와 놋쇠 포인트로 눈의 피로를 줄인 야간 다크 모드입니다.',
    },
    en: {
      seasonLabel: 'WINTER (DARK)',
      name: 'Winter · Nocturnal Ink',
      description: 'Deep winter-night sumi canvas with porcelain text and brushed brass accents for comfortable dark-mode focus.',
    },
    ja: {
      seasonLabel: 'WINTER · 冬 (DARK)',
      name: '冬 · 冬至月の夜間水墨',
      description: '静かな冬の夜の水墨キャンバスに白磁の文字と真鍮のアクセントを配したダークモードです。',
    },
    id: {
      seasonLabel: 'WINTER · DINGIN (GELAP)',
      name: 'Dingin · Tinta Malam',
      description: 'Mode gelap tinta malam musim dingin dengan teks porselen lembut dan aksen kuningan hangat.',
    },
  },
};

export function getLocalizedThemeInfo(themeId: ThemeId, language: SupportedLang) {
  const fallback = getThemeDefinition(themeId);
  const localized = THEME_I18N[themeId]?.[language] || THEME_I18N[themeId]?.en;
  return {
    ...fallback,
    seasonLabel: localized?.seasonLabel || fallback.seasonLabel,
    name: localized?.name || fallback.name,
    description: localized?.description || fallback.description,
  };
}

