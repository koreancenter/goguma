export interface LocalUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  companyName?: string;
  pinHash?: string;
  emailVerified: boolean;
  isAnonymous: boolean;
  role?: 'ADMIN' | 'USER';
  tenantId?: string | null;
  providerData?: { providerId: string; email?: string | null }[];
  lastLoginAt?: string;
}

export const DEFAULT_DIRECTOR_PROFILE: LocalUser = {
  uid: 'local-director-user',
  email: 'mrpark@kwavemission.org',
  displayName: '기획 총괄 디렉터',
  companyName: 'K-Wave Mission Hub',
  emailVerified: true,
  isAnonymous: false,
  role: 'ADMIN',
  providerData: [{ providerId: 'local-first', email: 'mrpark@kwavemission.org' }],
  lastLoginAt: new Date().toISOString(),
};

export const DEFAULT_LOCAL_USER = DEFAULT_DIRECTOR_PROFILE;

type AuthListener = (user: LocalUser | null) => void;

const SESSION_KEY = 'goguma_session_user';
const SAVED_PROFILES_KEY = 'goguma_saved_profiles';

class LocalAuthManager {
  private user: LocalUser | null = null;
  private listeners: Set<AuthListener> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    try {
      // 1. Check for active session
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        this.user = JSON.parse(savedSession);
      } else {
        this.user = null;
      }

      // 2. Ensure initial default profile exists in saved profiles list
      const savedProfiles = localStorage.getItem(SAVED_PROFILES_KEY);
      if (!savedProfiles) {
        localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify([DEFAULT_DIRECTOR_PROFILE]));
      }
    } catch (e) {
      console.warn('Failed to parse local auth session:', e);
      this.user = null;
    }
  }

  get currentUser(): LocalUser | null {
    return this.user;
  }

  get isAuthenticated(): boolean {
    return this.user !== null;
  }

  getSavedProfiles(): LocalUser[] {
    try {
      const raw = localStorage.getItem(SAVED_PROFILES_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch (e) {
      console.warn('Error reading saved profiles:', e);
    }
    return [DEFAULT_DIRECTOR_PROFILE];
  }

  saveProfileToList(profile: LocalUser): void {
    try {
      const list = this.getSavedProfiles();
      const existingIdx = list.findIndex(p => p.uid === profile.uid || (p.email && p.email === profile.email));
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...profile };
      } else {
        list.unshift(profile);
      }
      localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Error saving profile to list:', e);
    }
  }

  removeSavedProfile(uid: string): void {
    try {
      const list = this.getSavedProfiles().filter(p => p.uid !== uid);
      localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Error removing profile:', e);
    }
  }

  onAuthStateChanged(listener: AuthListener): () => void {
    this.listeners.add(listener);
    setTimeout(() => {
      listener(this.user);
    }, 0);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    if (this.user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(this.user));
      // backward compatibility for existing code that checks goguma_current_user
      localStorage.setItem('goguma_current_user', JSON.stringify(this.user));
    } else {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem('goguma_current_user');
    }

    this.listeners.forEach((fn) => {
      try {
        fn(this.user);
      } catch (err) {
        console.error('Auth listener error:', err);
      }
    });
  }

  // 1. Sign in with existing / saved profile
  async signInWithProfile(profile: LocalUser): Promise<LocalUser> {
    const updated: LocalUser = {
      ...profile,
      lastLoginAt: new Date().toISOString(),
    };
    this.user = updated;
    this.saveProfileToList(updated);
    this.notify();
    return updated;
  }

  // 2. Sign in with newly specified director credentials
  async signInLocal(params: {
    displayName: string;
    email?: string;
    companyName?: string;
    pin?: string;
    rememberMe?: boolean;
    role?: 'ADMIN' | 'USER';
  }): Promise<LocalUser> {
    const email = params.email?.trim() || `${params.displayName.toLowerCase().replace(/\s+/g, '')}@goguma.local`;
    const uid = 'dir_' + Math.random().toString(36).substring(2, 10);

    const newUser: LocalUser = {
      uid,
      email,
      displayName: params.displayName.trim(),
      companyName: params.companyName?.trim() || '독립 기획 스튜디오',
      pinHash: params.pin ? btoa(params.pin) : undefined,
      emailVerified: true,
      isAnonymous: false,
      role: params.role || 'ADMIN',
      providerData: [{ providerId: 'local-first', email }],
      lastLoginAt: new Date().toISOString(),
    };

    this.user = newUser;
    if (params.rememberMe !== false) {
      this.saveProfileToList(newUser);
    }
    this.notify();
    return newUser;
  }

  // 3. One-click anonymous guest session
  async signInAsGuest(): Promise<LocalUser> {
    const guestUser: LocalUser = {
      uid: 'guest_' + Math.random().toString(36).substring(2, 9),
      email: 'guest@goguma.local',
      displayName: '게스트 아키텍트',
      companyName: '체험 워크스페이스',
      emailVerified: true,
      isAnonymous: true,
      role: 'USER',
      providerData: [{ providerId: 'local-guest', email: 'guest@goguma.local' }],
      lastLoginAt: new Date().toISOString(),
    };

    this.user = guestUser;
    this.notify();
    return guestUser;
  }

  // 4. Sign out / lock workspace
  async signOut(): Promise<void> {
    this.user = null;
    this.notify();
  }

  // 5. Update active profile
  async updateProfile(updates: Partial<LocalUser>): Promise<void> {
    if (!this.user) return;
    this.user = { ...this.user, ...updates };
    this.saveProfileToList(this.user);
    this.notify();
  }

  // 6. Profile switcher utility
  async switchProfile(profile: 'DIRECTOR' | 'GUEST'): Promise<LocalUser> {
    if (profile === 'GUEST') {
      return this.signInAsGuest();
    } else {
      return this.signInWithProfile(DEFAULT_DIRECTOR_PROFILE);
    }
  }
}

export const auth = new LocalAuthManager();
export const onAuthStateChanged = (authInstance: any, listener: AuthListener) => {
  const target = authInstance && typeof authInstance.onAuthStateChanged === 'function' ? authInstance : auth;
  return target.onAuthStateChanged(listener);
};
export const signOut = (_a?: any) => auth.signOut();
export const updateProfile = (_u: any, updates: Partial<LocalUser>) => auth.updateProfile(updates);

// Compatibility stubs for any existing references
export class GoogleAuthProvider {
  addScope(_scope: string) {
    return this;
  }
  static credentialFromResult(_result: any) {
    return { accessToken: 'mock_local_token' };
  }
}
export const signInWithPopup = async (_a: any, _p: any) => {
  return { user: auth.currentUser };
};
export type User = LocalUser;
