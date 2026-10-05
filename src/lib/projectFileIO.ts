import { SitePlan, normalizePlan } from '../types';
import { db, addDoc, updateDoc, collection, query, where, getDocs, doc, serverTimestamp } from './localDb';

export interface GogumaProjectFile {
  format: 'goguma-project';
  version: '2.0';
  exportedAt: string;
  generator: string;
  projectId?: string;
  projectName: string;
  platform: 'WEB' | 'APP';
  plan: SitePlan;
  summary: {
    title: string;
    pageCount: number;
    pages: string[];
    purpose?: string;
    target?: string;
    techStack?: string;
    layout?: string;
    themeColor?: string;
    updatedAt?: string;
  };
}

export interface ProjectValidationResult {
  isValid: boolean;
  error?: string;
  projectFile?: GogumaProjectFile;
  normalizedPlan?: SitePlan;
  summary?: {
    projectName: string;
    platform: 'WEB' | 'APP';
    pageCount: number;
    pages: string[];
    purpose: string;
    target: string;
    techStack: string;
    exportedAt?: string;
    version?: string;
  };
}

/**
 * Creates a standardized GOGUMA project export package.
 */
export function createProjectExportPackage(plan: SitePlan, projectId?: string): GogumaProjectFile {
  const normalized = normalizePlan(plan);
  const projectName = normalized.metadata?.projectName?.trim() || 'Untitled Project';
  const platform = normalized.metadata?.platform === 'APP' ? 'APP' : 'WEB';
  const pages = (normalized.navigation?.pageStructure || []).map(p => p.name || 'Untitled Page');

  return {
    format: 'goguma-project',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    generator: 'GOGUMA Web Architecture Suite (v2.0-open)',
    projectId,
    projectName,
    platform,
    plan: normalized,
    summary: {
      title: normalized.metadata?.title || projectName,
      pageCount: pages.length,
      pages,
      purpose: normalized.metadata?.projectOverview?.purpose || '',
      target: normalized.metadata?.projectOverview?.target || '',
      techStack: normalized.metadata?.projectOverview?.techStack || '',
      layout: normalized.design?.layout || 'standard',
      themeColor: normalized.design?.themeColor || '#3B82F6',
      updatedAt: new Date().toISOString()
    }
  };
}

/**
 * Downloads single project file as `<projectName>.goguma.json`.
 */
export function downloadProjectFile(plan: SitePlan, customFilename?: string): { success: boolean; filename: string } {
  const exportPackage = createProjectExportPackage(plan);
  const jsonString = JSON.stringify(exportPackage, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const safeName = (exportPackage.projectName || 'goguma-project')
    .toLowerCase()
    .replace(/[^a-z0-9가-힣_-]/gi, '-')
    .replace(/-+/g, '-');

  const filename = customFilename || `${safeName}.goguma.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, filename };
}

/**
 * Copies formatted project JSON directly to clipboard.
 */
export async function copyProjectJsonToClipboard(plan: SitePlan): Promise<boolean> {
  try {
    const exportPackage = createProjectExportPackage(plan);
    const jsonString = JSON.stringify(exportPackage, null, 2);
    await navigator.clipboard.writeText(jsonString);
    return true;
  } catch (err) {
    console.error('Failed to copy project JSON to clipboard:', err);
    return false;
  }
}

export const MAX_PROJECT_PAYLOAD_SIZE = 5 * 1024 * 1024; // 5 MB safety limit (Article 5 of 07_SECURITY.md)

/**
 * Parses and validates an imported JSON string or object.
 * Accepts both `goguma-project` format and raw `SitePlan` format.
 */
export function parseAndValidateProjectJson(jsonInput: string | any): ProjectValidationResult {
  let parsed: any;

  if (typeof jsonInput === 'string') {
    if (jsonInput.length > MAX_PROJECT_PAYLOAD_SIZE) {
      return { 
        isValid: false, 
        error: `Security exception: Payload size (${(jsonInput.length / (1024 * 1024)).toFixed(1)}MB) exceeds the 5MB safety limit.` 
      };
    }

    const trimmed = jsonInput.trim();
    if (!trimmed) {
      return { isValid: false, error: 'JSON input is empty.' };
    }
    try {
      parsed = JSON.parse(trimmed);
    } catch (err: any) {
      return { isValid: false, error: `Invalid JSON syntax: ${err.message}` };
    }
  } else {
    parsed = jsonInput;
  }

  if (!parsed || typeof parsed !== 'object') {
    return { isValid: false, error: 'Parsed content is not a valid JSON object.' };
  }

  // Case 1: Standard GogumaProjectFile format
  if (parsed.format === 'goguma-project' && parsed.plan) {
    const normalized = normalizePlan(parsed.plan);
    const projectName = parsed.projectName || normalized.metadata?.projectName || 'Imported Project';
    const platform = normalized.metadata?.platform === 'APP' ? 'APP' : 'WEB';
    const pages = (normalized.navigation?.pageStructure || []).map(p => p.name || 'Untitled Page');

    return {
      isValid: true,
      projectFile: parsed,
      normalizedPlan: normalized,
      summary: {
        projectName,
        platform,
        pageCount: pages.length,
        pages,
        purpose: normalized.metadata?.projectOverview?.purpose || '',
        target: normalized.metadata?.projectOverview?.target || '',
        techStack: normalized.metadata?.projectOverview?.techStack || '',
        exportedAt: parsed.exportedAt,
        version: parsed.version || '2.0'
      }
    };
  }

  // Case 2: Raw SitePlan object (contains metadata or navigation or design)
  if (parsed.metadata || parsed.navigation || parsed.design) {
    const normalized = normalizePlan(parsed);
    const projectName = normalized.metadata?.projectName || parsed.projectName || 'Imported Project';
    const platform = normalized.metadata?.platform === 'APP' ? 'APP' : 'WEB';
    const pages = (normalized.navigation?.pageStructure || []).map(p => p.name || 'Untitled Page');

    const syntheticPackage = createProjectExportPackage(normalized);

    return {
      isValid: true,
      projectFile: syntheticPackage,
      normalizedPlan: normalized,
      summary: {
        projectName,
        platform,
        pageCount: pages.length,
        pages,
        purpose: normalized.metadata?.projectOverview?.purpose || '',
        target: normalized.metadata?.projectOverview?.target || '',
        techStack: normalized.metadata?.projectOverview?.techStack || '',
        exportedAt: new Date().toISOString(),
        version: 'raw-siteplan'
      }
    };
  }

  // Case 3: Firestore project record structure (contains id, projectName, plan)
  if (parsed.plan && (parsed.projectName || parsed.id)) {
    const normalized = normalizePlan(parsed.plan);
    const projectName = parsed.projectName || normalized.metadata?.projectName || 'Imported Project';
    const platform = normalized.metadata?.platform === 'APP' ? 'APP' : 'WEB';
    const pages = (normalized.navigation?.pageStructure || []).map(p => p.name || 'Untitled Page');

    const syntheticPackage = createProjectExportPackage(normalized, parsed.id);

    return {
      isValid: true,
      projectFile: syntheticPackage,
      normalizedPlan: normalized,
      summary: {
        projectName,
        platform,
        pageCount: pages.length,
        pages,
        purpose: normalized.metadata?.projectOverview?.purpose || '',
        target: normalized.metadata?.projectOverview?.target || '',
        techStack: normalized.metadata?.projectOverview?.techStack || '',
        exportedAt: parsed.updatedAt || new Date().toISOString(),
        version: 'db-record'
      }
    };
  }

  // Case 4: Full local backup package with collections.projects
  if (parsed.collections?.projects && typeof parsed.collections.projects === 'object') {
    const projectKeys = Object.keys(parsed.collections.projects);
    if (projectKeys.length > 0) {
      const firstProj = parsed.collections.projects[projectKeys[0]];
      if (firstProj?.plan) {
        const normalized = normalizePlan(firstProj.plan);
        const projectName = firstProj.projectName || normalized.metadata?.projectName || 'Imported Project';
        const platform = normalized.metadata?.platform === 'APP' ? 'APP' : 'WEB';
        const pages = (normalized.navigation?.pageStructure || []).map((p: any) => p.name || 'Untitled Page');
        const syntheticPackage = createProjectExportPackage(normalized, firstProj.id);

        return {
          isValid: true,
          projectFile: syntheticPackage,
          normalizedPlan: normalized,
          summary: {
            projectName,
            platform,
            pageCount: pages.length,
            pages,
            purpose: normalized.metadata?.projectOverview?.purpose || '',
            target: normalized.metadata?.projectOverview?.target || '',
            techStack: normalized.metadata?.projectOverview?.techStack || '',
            exportedAt: parsed.exportedAt || new Date().toISOString(),
            version: 'backup-package'
          }
        };
      }
    }
  }

  return {
    isValid: false,
    error: 'Unrecognized project structure. Expected a GOGUMA project file (.goguma.json) or valid SitePlan object.'
  };
}

/**
 * Saves an imported plan directly to the local 'projects' collection.
 */
export async function saveProjectToLibrary(
  plan: SitePlan,
  userId: string,
  customName?: string
): Promise<{ id: string; name: string }> {
  const normalized = normalizePlan(plan);
  const nameToSave = customName?.trim() || normalized.metadata?.projectName?.trim() || 'Imported Project';
  
  // Clone and adapt nested arrays for storage compatibility
  const planToSave = JSON.parse(JSON.stringify(normalized));
  if (planToSave?.design?.sectionContentTypes) {
    planToSave.design.sectionContentTypes = planToSave.design.sectionContentTypes.map((row: any) => ({
      columns: Array.isArray(row) ? row : []
    }));
  }
  planToSave.metadata.projectName = nameToSave;

  // Check if project exists with same name for this user
  const q = query(
    collection(db, 'projects'),
    where('ownerId', '==', userId),
    where('projectName', '==', nameToSave)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    const docId = snap.docs[0].id;
    await updateDoc(doc(db, 'projects', docId), {
      plan: planToSave,
      updatedAt: serverTimestamp()
    });
    return { id: docId, name: nameToSave };
  } else {
    const newDoc = await addDoc(collection(db, 'projects'), {
      projectName: nameToSave,
      plan: planToSave,
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: newDoc.id, name: nameToSave };
  }
}
