// Simple admin authentication
const ADMIN_STORAGE_KEY = 'codefront_admin_session';
const ADMIN_CREDENTIALS_KEY = 'codefront_admin_credentials';

export interface AdminCredentials {
  username: string;
  passwordHash: string;
}

// Simple hash function (for demo purposes - use bcrypt in production)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Initialize default admin credentials (username: admin, password: admin123)
export function initializeAdminCredentials(): void {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
  if (!stored) {
    const defaultCredentials: AdminCredentials = {
      username: 'admin',
      passwordHash: simpleHash('admin123'),
    };
    localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(defaultCredentials));
  }
}

export function login(username: string, password: string): boolean {
  if (typeof window === 'undefined') return false;

  initializeAdminCredentials();

  const stored = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
  if (!stored) return false;

  try {
    const credentials: AdminCredentials = JSON.parse(stored);
    const passwordHash = simpleHash(password);

    if (credentials.username === username && credentials.passwordHash === passwordHash) {
      // Create session
      const session = {
        username,
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!stored) return false;

  try {
    const session = JSON.parse(stored);
    const expiresAt = new Date(session.expiresAt);

    if (expiresAt > new Date()) {
      return true;
    } else {
      logout();
      return false;
    }
  } catch {
    return false;
  }
}

export function changePassword(currentPassword: string, newPassword: string): boolean {
  if (typeof window === 'undefined') return false;

  const stored = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
  if (!stored) return false;

  try {
    const credentials: AdminCredentials = JSON.parse(stored);
    const currentPasswordHash = simpleHash(currentPassword);

    if (credentials.passwordHash === currentPasswordHash) {
      credentials.passwordHash = simpleHash(newPassword);
      localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(credentials));
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function getAdminUsername(): string | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!stored) return null;

  try {
    const session = JSON.parse(stored);
    return session.username;
  } catch {
    return null;
  }
}
