import { SitePlan } from '../types';

export const INITIAL_SITE_PLAN: SitePlan = {
  metadata: {
    projectName: '',
    title: '',
    slogan: '',
    subtitle: '',
    description: '',
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
    },
    footerInfo: {
      companyName: '',
      address: '',
      phone: '',
      email: '',
      representative: '',
    },
    platform: 'WEB',
    projectMode: 'personal',
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
    mobileConfig: {
      widgetCount: 6,
      columns: 2,
      rows: 3,
      showNotifications: true,
      showUserProfile: true,
      bottomNav: true,
      showMenuDrawer: true,
      widgetNames: Array.from({ length: 12 }, (_, i) => `Widget ${i + 1}`),
    },
  },
  navigation: {
    pageStructure: [],
    menus: []
  },
  deploymentProfile: {
    mode: 'PRODUCTION',
    region: 'asia-northeast3',
    infraConfig: {
      provider: 'GOOGLE_CLOUD_RUN',
      secretManagement: 'SECRET_MANAGER',
      budgetLimit: '$100/mo'
    },
    adminAudit: {
      budgetCode: 'KR-ID-2026-EXP',
      legalApproval: 'DONE',
      institutionalSignOff: 'PENDING'
    }
  }
};
