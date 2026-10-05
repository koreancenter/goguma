/**
 * GOGUMA DATA SCHEMA SPECIFICATION (matching docs/06_DATA_SCHEMA.md)
 */

export interface ProjectEntity {
  id: string;                  // UUIDv4 (e.g. "goguma-proj-7f8a...")
  name: string;                // Project title
  slug: string;                // URL/file friendly slug
  createdAt: string;           // ISO 8601
  updatedAt: string;           // ISO 8601
  currentChapter: number;      // Active chapter (1 ~ 8)
  currentSection: string;      // Active sub-section key
}

export interface FormInputEntity {
  id: string;                  // Composite key: `${projectId}_${chapterId}_${sectionKey}`
  projectId: string;           // Associated Project ID
  chapterId: number;           // Chapter number (1: Proposal, 2: Target, 3: Feature, 4: Data...)
  sectionKey: string;          // Section key (e.g. "target_user", "happy_path", "data_columns")
  userRawInput: string;        // Raw natural language input from user
  refinedGuideText?: string;   // Refined 1-line guidance text from AI tier
  lastSavedAt: string;         // ISO timestamp
}

export interface CompiledArtifactEntity {
  projectId: string;           // Associated Project ID
  proposalMd: string;          // 01_proposal.md content
  roadmapMd: string;           // 02_roadmap.md content
  designMd: string;            // 03_DESIGN.md content
  specMd: string;              // 04_SPEC.md content
  archConstitutionMd: string;  // 05_ARCH_CONSTITUTION.md content
  dataSchemaMd: string;        // 06_DATA_SCHEMA.md content
  securityMd: string;          // 07_SECURITY.md content
  testChecklistMd: string;     // 08_TEST_CHECKLIST.md content
  envSetupMd: string;          // 09_ENV_SETUP.md content
  systemInstructionsMd: string;// 11_system-instructions.md content
  prototypeHtml: string;       // Standalone single-file prototype.html source
  compiledAt: string;          // Compilation ISO timestamp
}

export interface TargetAppItem {
  id: string;
  createdAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED';
  title: string;
  contact?: string;
  scheduledAt?: string;
  memo?: string;
  [key: string]: any;
}

export interface LocalStoreAdapter {
  getItems: () => TargetAppItem[];
  addItem: (item: Omit<TargetAppItem, 'id' | 'createdAt'>) => TargetAppItem;
  updateStatus: (id: string, status: TargetAppItem['status']) => void;
  deleteItem: (id: string) => void;
}
