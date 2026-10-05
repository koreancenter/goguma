export * from './schema';

export type Language = 'en' | 'ko' | 'id';

export type UserRole = 'USER' | 'ADMIN';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  lastLogin?: string;
}

export interface UsageStat {
  date: string;
  apiCalls: number;
}

export interface UserStat {
  totalApiCalls: number;
  balance?: number;
  lastUsedAt?: string;
}

export interface SystemConfig {
  maintenanceMode: boolean;
  announcement: string;
}

export interface ScreenNode {
  id: string;
  label: string;
  description: string;
}

export interface MetadataConfig {
  projectName: string;
  title: string;
  slogan: string;
  subtitle: string;
  description: string;
  projectOverview: {
    targetUrl: string;
    purpose: string;
    target: string;
    kpi: string;
    reference: string;
    benchmarkUrl: string;
    benchmarkAnalysis: string;
    aiCriticism?: string;
    targetAudience?: string;
    objective?: string;
    aiRoadmap?: string;
    strategicIntent?: string;
    executiveSummary?: string;
    administrativeRoadmap?: string;
    sddSummary?: string;
    negativeConstraints?: string;
    aiDesignPrinciples?: string;
    adminMonitoringPlan?: string;
    aiStrategyDirection?: string;
    domainMode?: 'own' | 'goguma';
    gogumaSubdomain?: string;
    knowledgeSources?: { id: string; name: string; type: 'file' | 'link'; url?: string; description?: string }[];
    toneAndManner: string;
    screenList: string;
    features: string;
    wireframe: string;
    context: string;
    techStack: string;
    schedule: string;
  };
  footerInfo: {
    companyName: string;
    address: string;
    phone: string;
    email: string;
    representative: string;
  };
  platform: 'WEB' | 'APP';
  projectMode?: 'personal' | 'enterprise' | 'commercial';
}

export interface DesignConfig {
  themeColor: string;
  accentColor: string;
  bodyTextColor: string;
  linkColor: string;
  buttonColor: string;
  aesthetic?: string;
  layout: 'standard' | 'sidebar' | 'dashboard';
  sectionTitles: string[];
  sectionColumns: number[];
  sectionContentTypes: ('text' | 'image')[][];
  logoPalette?: string[];
  mobileConfig?: {
    widgetCount: number;
    columns: number;
    rows: number;
    showNotifications: boolean;
    showUserProfile: boolean;
    bottomNav: boolean;
    showMenuDrawer: boolean;
    bottomTabItems?: { label: string; icon: string }[];
    widgetNames?: string[];
  };
}

export interface NavigationConfig {
  pageStructure: {
    id?: string;
    name: string;
    slug?: string;
    depth?: number;
    script?: string;
    route?: string;
    purpose?: string;
    image?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    metaDescription?: string;
    screenStructure?: ScreenNode[];
    analyzedScript?: string;
  }[];
  menus?: string[];
}

export interface DeploymentProfile {
  mode: 'DEVELOPMENT' | 'PRODUCTION';
  region: string;
  infraConfig: {
    provider: string;
    secretManagement: string;
    budgetLimit: string;
  };
  adminAudit: {
    budgetCode: string;
    legalApproval: 'DONE' | 'PENDING';
    institutionalSignOff: 'DONE' | 'PENDING';
  };
}

export interface SitePlan {
  metadata: MetadataConfig;
  design: DesignConfig;
  navigation: NavigationConfig;
  deploymentProfile?: DeploymentProfile;
  features?: {
    list: {
      id: string;
      name: string;
      priority: string;
      description: string;
      mappedScreens: string[];
    }[];
  };
  structure?: {
    pages: {
      id: string;
      path: string;
      description: string;
    }[];
  };
}

export function normalizePlan(p: any): SitePlan {
  if (!p) p = {};
  return {
    ...p,
    metadata: {
      projectName: '',
      title: '',
      slogan: '',
      subtitle: '',
      description: '',
      ...p.metadata,
      projectOverview: {
        targetUrl: '',
        purpose: '',
        target: '',
        kpi: '',
        reference: '',
        benchmarkUrl: '',
        benchmarkAnalysis: '',
        toneAndManner: '',
        screenList: '',
        features: '',
        wireframe: '',
        context: '',
        techStack: '',
        schedule: '',
        aiCriticism: '',
        ...p.metadata?.projectOverview
      },
      footerInfo: {
        companyName: '',
        address: '',
        phone: '',
        email: '',
        representative: '',
        ...p.metadata?.footerInfo
      },
      platform: p.metadata?.platform || 'WEB',
      projectMode: p.metadata?.projectMode || 'personal',
    },
    design: {
      themeColor: '#3B82F6',
      accentColor: '#10B981',
      bodyTextColor: '#1E293B',
      linkColor: '#2563EB',
      buttonColor: '#3B82F6',
      layout: 'standard',
      sectionTitles: [],
      sectionColumns: [],
      sectionContentTypes: [],
      logoPalette: [],
      ...p.design,
      mobileConfig: {
        widgetCount: 6,
        columns: 2,
        rows: 3,
        showNotifications: true,
        showUserProfile: true,
        bottomNav: true,
        showMenuDrawer: true,
        widgetNames: Array.from({ length: 12 }, (_, i) => `Widget ${i + 1}`),
        ...p.design?.mobileConfig
      }
    },
    navigation: {
      pageStructure: [],
      menus: [],
      ...p.navigation
    },
    deploymentProfile: {
      mode: 'PRODUCTION',
      region: 'asia-northeast3',
      ...p.deploymentProfile,
      infraConfig: {
        provider: 'GOOGLE_CLOUD_RUN',
        secretManagement: 'SECRET_MANAGER',
        budgetLimit: '10',
        ...p.deploymentProfile?.infraConfig
      },
      adminAudit: {
        budgetCode: '',
        legalApproval: 'PENDING',
        institutionalSignOff: 'PENDING',
        ...p.deploymentProfile?.adminAudit
      }
    }
  };
}
