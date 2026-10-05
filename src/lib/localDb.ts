export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, shouldThrow = false) {
  const errMsg = error instanceof Error ? error.message : String(error);
  console.warn(`[GOGUMA Local Data Manager] ${operationType} on ${path}:`, errMsg);
  if (shouldThrow) {
    throw new Error(errMsg);
  }
}

export interface DocRef {
  __type: 'doc';
  collectionName: string;
  id: string;
}

export interface CollectionRef {
  __type: 'collection';
  collectionName: string;
}

export interface QueryConstraint {
  type: 'where' | 'orderBy' | 'limit';
  field?: string;
  op?: string;
  value?: any;
  direction?: 'asc' | 'desc';
  count?: number;
}

export interface QueryRef {
  __type: 'query';
  collectionName: string;
  constraints: QueryConstraint[];
}

export interface DocSnapshot<T = any> {
  id: string;
  exists: () => boolean;
  data: () => T;
}

export interface QuerySnapshot<T = any> {
  docs: DocSnapshot<T>[];
  empty: boolean;
  size: number;
  forEach: (callback: (doc: DocSnapshot<T>) => void) => void;
}

// Initial seed data generator
function getInitialCollectionData(name: string): Record<string, any> {
  const now = new Date().toISOString();
  if (name === 'users') {
    return {
      'admin_kwave': {
        email: 'mrpark@kwavemission.org',
        displayName: 'Administrator Park',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: now,
      },
      'dev_sumin': {
        email: 'dev.sumin@goguma.app',
        displayName: 'Sumin Lim',
        role: 'USER',
        status: 'ACTIVE',
        createdAt: now,
      },
      'user_sample': {
        email: 'director.kim@enterprise.io',
        displayName: 'Director Kim',
        role: 'USER',
        status: 'ACTIVE',
        createdAt: now,
      },
    };
  }

  if (name === 'usage_stats') {
    const stats: Record<string, any> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      stats[dateKey] = {
        date: dateKey,
        apiCalls: 100 + (6 - i) * 85 + Math.floor(Math.random() * 30),
        updatedAt: now,
      };
    }
    return stats;
  }

  if (name === 'system_config') {
    return {
      'general': {
        maintenanceMode: false,
        announcement: 'GOGUMA Web Architecture Suite is running in high performance mode.',
        updatedAt: now,
      },
    };
  }

  if (name === 'inquiries') {
    return {
      'inq_sample_1': {
        id: 'inq_sample_1',
        name: 'Alex Johnson',
        email: 'alex.j@partnercorp.com',
        message: 'Looking to integrate GOGUMA site planner into our engineering workflows. Please provide enterprise pricing details.',
        status: 'pending',
        adminReply: '',
        repliedBy: '',
        repliedAt: null,
        createdAt: now,
        updatedAt: now,
      },
      'inq_sample_2': {
        id: 'inq_sample_2',
        name: 'Hana Lee',
        email: 'hana@startup.kr',
        message: 'Master GOGUMA AI prompt extraction is fantastic! Can we export directly to Terraform?',
        status: 'resolved',
        adminReply: 'Hi Hana! Terraform export is planned in our Q4 roadmap. Thank you for your feedback!',
        repliedBy: 'Admin Park',
        repliedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    };
  }

  return {};
}

function readCollection(name: string): Record<string, any> {
  try {
    const key = `goguma_col_${name}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      const init = getInitialCollectionData(name);
      localStorage.setItem(key, JSON.stringify(init));
      return init;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to read collection ${name}`, e);
    return {};
  }
}

function writeCollection(name: string, data: Record<string, any>) {
  try {
    const key = `goguma_col_${name}`;
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(`goguma_db_change_${name}`, { detail: data }));
  } catch (e) {
    console.error(`Failed to write collection ${name}`, e);
  }
}

export const db = {
  type: 'local_storage_db',
};

export function collection(_dbInstance: any, name: string): CollectionRef {
  return { __type: 'collection', collectionName: name };
}

export function doc(first: any, ...segments: string[]): DocRef {
  if (first && first.__type === 'collection') {
    return { __type: 'doc', collectionName: first.collectionName, id: segments[0] };
  }
  // format doc(db, 'users', 'uid')
  return { __type: 'doc', collectionName: segments[0], id: segments[1] };
}

export async function getDoc(docRef: DocRef): Promise<DocSnapshot> {
  const col = readCollection(docRef.collectionName);
  const data = col[docRef.id];
  return {
    id: docRef.id,
    exists: () => data !== undefined && data !== null,
    data: () => (data ? { ...data } : undefined),
  };
}

export async function setDoc(docRef: DocRef, data: any, options?: { merge?: boolean }): Promise<void> {
  const col = readCollection(docRef.collectionName);
  const existing = col[docRef.id] || {};
  
  // Resolve special values
  const resolvedData = { ...data };
  for (const k of Object.keys(resolvedData)) {
    const val = resolvedData[k];
    if (val && typeof val === 'object' && val.__op === 'increment') {
      const currentVal = typeof existing[k] === 'number' ? existing[k] : 0;
      resolvedData[k] = currentVal + val.delta;
    }
  }

  col[docRef.id] = options?.merge ? { ...existing, ...resolvedData } : resolvedData;
  writeCollection(docRef.collectionName, col);
}

export async function updateDoc(docRef: DocRef, data: any): Promise<void> {
  return setDoc(docRef, data, { merge: true });
}

export async function deleteDoc(docRef: DocRef): Promise<void> {
  const col = readCollection(docRef.collectionName);
  delete col[docRef.id];
  writeCollection(docRef.collectionName, col);
}

export async function addDoc(colRef: CollectionRef, data: any): Promise<DocRef> {
  const id = 'doc_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
  const docRef: DocRef = { __type: 'doc', collectionName: colRef.collectionName, id };
  await setDoc(docRef, { ...data, id });
  return docRef;
}

export function query(colRef: CollectionRef | QueryRef, ...constraints: QueryConstraint[]): QueryRef {
  const existingConstraints = colRef.__type === 'query' ? colRef.constraints : [];
  return {
    __type: 'query',
    collectionName: colRef.collectionName,
    constraints: [...existingConstraints, ...constraints],
  };
}

export function where(field: string, op: string, value: any): QueryConstraint {
  return { type: 'where', field, op, value };
}

export function orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): QueryConstraint {
  return { type: 'orderBy', field, direction };
}

export function limit(count: number): QueryConstraint {
  return { type: 'limit', count };
}

export async function getDocs(target: CollectionRef | QueryRef): Promise<QuerySnapshot> {
  const colName = target.collectionName;
  const col = readCollection(colName);
  let items = Object.entries(col).map(([id, val]) => ({ id, ...val }));

  if (target.__type === 'query') {
    for (const c of target.constraints) {
      if (c.type === 'where' && c.field && c.op) {
        items = items.filter((item) => {
          const itemVal = item[c.field!];
          if (c.op === '==') return itemVal === c.value;
          if (c.op === '!=') return itemVal !== c.value;
          if (c.op === '>') return itemVal > c.value;
          if (c.op === '>=') return itemVal >= c.value;
          if (c.op === '<') return itemVal < c.value;
          if (c.op === '<=') return itemVal <= c.value;
          return true;
        });
      }

      if (c.type === 'orderBy' && c.field) {
        items.sort((a, b) => {
          const valA = a[c.field!];
          const valB = b[c.field!];
          if (valA === valB) return 0;
          if (valA === undefined || valA === null) return 1;
          if (valB === undefined || valB === null) return -1;
          const cmp = valA > valB ? 1 : -1;
          return c.direction === 'desc' ? -cmp : cmp;
        });
      }

      if (c.type === 'limit' && typeof c.count === 'number') {
        items = items.slice(0, c.count);
      }
    }
  }

  const docs: DocSnapshot[] = items.map((item) => ({
    id: item.id,
    exists: () => true,
    data: () => ({ ...item }),
  }));

  return {
    docs,
    empty: docs.length === 0,
    size: docs.length,
    forEach: (cb) => docs.forEach(cb),
  };
}

export function onSnapshot(
  target: DocRef | CollectionRef | QueryRef,
  onNext: (snapshot: any) => void,
  _onError?: (err: any) => void
): () => void {
  const colName = target.collectionName;

  const run = async () => {
    try {
      if (target.__type === 'doc') {
        const snap = await getDoc(target);
        onNext(snap);
      } else {
        const snap = await getDocs(target);
        onNext(snap);
      }
    } catch (e) {
      if (_onError) _onError(e);
    }
  };

  run();

  const handler = () => {
    run();
  };

  const eventName = `goguma_db_change_${colName}`;
  window.addEventListener(eventName, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(eventName, handler);
    window.removeEventListener('storage', handler);
  };
}

export function serverTimestamp(): string {
  return new Date().toISOString();
}

export function increment(delta: number): any {
  return { __op: 'increment', delta };
}

export const Timestamp = {
  now: () => ({ seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 }),
  fromDate: (date: Date) => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 }),
};

export interface GogumaBackupPackage {
  version: '2.0-open';
  exportedAt: string;
  collections: Record<string, Record<string, any>>;
  aiSettings?: any;
  meta: {
    projectCount: number;
    appName: string;
    version: string;
  };
}

export function exportAllLocalData(): GogumaBackupPackage {
  const collections: Record<string, Record<string, any>> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('goguma_col_')) {
      const colName = key.replace('goguma_col_', '');
      try {
        collections[colName] = JSON.parse(localStorage.getItem(key) || '{}');
      } catch (e) {
        // ignore
      }
    }
  }

  let aiSettings = null;
  try {
    const rawAi = localStorage.getItem('goguma_ai_settings');
    if (rawAi) aiSettings = JSON.parse(rawAi);
  } catch (e) {
    // ignore
  }

  const projectsCol = collections['projects'] || {};
  const projectCount = Object.keys(projectsCol).length;

  return {
    version: '2.0-open',
    exportedAt: new Date().toISOString(),
    collections,
    aiSettings,
    meta: {
      projectCount,
      appName: 'GOGUMA Web Architecture Suite',
      version: '2.0.0-local'
    }
  };
}

export function importLocalData(backup: any, mode: 'merge' | 'replace' = 'merge'): { success: boolean; projectCount: number; message: string } {
  if (!backup || typeof backup !== 'object' || !backup.collections) {
    throw new Error('Invalid backup file format. Expected a valid GOGUMA backup JSON.');
  }

  let addedProjects = 0;
  const importedCollections = backup.collections;

  if (mode === 'replace') {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('goguma_col_') || k.startsWith('goguma_autosave_'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    for (const [colName, colData] of Object.entries(importedCollections)) {
      writeCollection(colName, (colData as any) || {});
      if (colName === 'projects') {
        addedProjects += Object.keys(colData || {}).length;
      }
    }
  } else {
    for (const [colName, colData] of Object.entries(importedCollections)) {
      const current = readCollection(colName);
      const incoming = (colData as Record<string, any>) || {};
      const merged = { ...current, ...incoming };
      writeCollection(colName, merged);
      if (colName === 'projects') {
        addedProjects += Object.keys(incoming).length;
      }
    }
  }

  if (backup.aiSettings && (!localStorage.getItem('goguma_ai_settings') || mode === 'replace')) {
    localStorage.setItem('goguma_ai_settings', JSON.stringify(backup.aiSettings));
  }

  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('goguma_db_change_projects', { detail: readCollection('projects') }));

  return {
    success: true,
    projectCount: addedProjects,
    message: mode === 'replace' 
      ? `Successfully restored ${addedProjects} project(s) from backup.`
      : `Successfully merged ${addedProjects} project(s) into your workspace.`
  };
}

export function getStorageUsageStats(): {
  usedBytes: number;
  formattedSize: string;
  projectCount: number;
  autosaveCount: number;
} {
  let totalBytes = 0;
  let autosaveCount = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('goguma_')) {
      const val = localStorage.getItem(key) || '';
      totalBytes += (key.length + val.length) * 2;
      if (key.startsWith('goguma_autosave_')) autosaveCount++;
    }
  }

  const projectsCol = readCollection('projects');
  const projectCount = Object.keys(projectsCol).length;

  const formattedSize = totalBytes > 1024 * 1024 
    ? `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
    : `${(totalBytes / 1024).toFixed(1)} KB`;

  return {
    usedBytes: totalBytes,
    formattedSize,
    projectCount,
    autosaveCount,
  };
}

export function clearAllLocalData(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith('goguma_col_') || k.startsWith('goguma_autosave_') || k.startsWith('goguma_projects'))) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('goguma_db_change_projects', { detail: {} }));
}

