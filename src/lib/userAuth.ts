import { toast } from "sonner";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | undefined;
  enrolledCourses: string[]; // List of course IDs
}

type AuthUserFromServer = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | undefined | null;
};

type AuthResponse = {
  token: string;
  user: AuthUserFromServer;
};

type EnrollmentsResponse = {
  courseIds: string[];
};

type CreateOrderResponse = {
  orderId: string | null;
  amountCents: number;
  currency: string;
  free: boolean;
  courseId: string;
  razorpayKeyId?: string;
};

type CaptureResponse = { ok: boolean };

const USERS_TOKEN_KEY = "codefront_token";
const CURRENT_USER_KEY = "codefront_user_cache";

// Local demo fallback (so login/enrollment works even if backend isn't running)
const USERS_KEY = "codefront_users"; // mirrors the older mock implementation

function isNetworkFailure(err: any): boolean {
  const msg = String(err?.message || "");
  return /Failed to fetch|NetworkError|ECONNREFUSED|ECONNRESET|ENOTFOUND|socket|timed out/i.test(msg);
}

function getUsersLocal(): Record<string, User> {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored) as Record<string, User>;
  } catch {
    return {};
  }
}

function saveUsersLocal(users: Record<string, User>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setLocalUserCache(user: User | null) {
  setCachedUser(user);
}

function mockRegister(name: string, email: string, password?: string, avatar?: string): { user: User } {
  const users = getUsersLocal();
  const lowerEmail = email.toLowerCase().trim();

  if (users[lowerEmail] && password) {
    throw new Error("An account with this email already exists.");
  }

  const existing = users[lowerEmail];
  const id = existing?.id || `user_${Date.now()}`;
  const enrolledCourses = existing?.enrolledCourses || [];

  const newUser: User = {
    id,
    name: name.trim(),
    email: lowerEmail,
    enrolledCourses,
    avatar:
      avatar ||
      existing?.avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
  };

  users[lowerEmail] = newUser;
  saveUsersLocal(users);
  setLocalUserCache(newUser);
  setToken("demo_token");
  return { user: newUser };
}

function mockLoginCredentials(email: string, _password?: string): { user: User } {
  const users = getUsersLocal();
  const lowerEmail = email.toLowerCase().trim();
  const user = users[lowerEmail];
  if (!user) throw new Error("No account found with this email.");
  setLocalUserCache(user);
  return { user };
}

function mockLoginGoogle(): { user: User } {
  // Match the frontend mock google user
  const mockGoogleUser = {
    name: "Alex Dev",
    email: "alex@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  };

  return mockRegister(mockGoogleUser.name, mockGoogleUser.email, undefined, mockGoogleUser.avatar);
}

function mockEnrollCourse(courseId: string): boolean {
  const user = getCurrentUser();
  if (!user) {
    toast.error("Please login to enroll in courses.");
    return false;
  }
  if (user.enrolledCourses.includes(courseId)) {
    toast.error("You are already enrolled in this course.");
    return false;
  }

  const users = getUsersLocal();
  const lowerEmail = user.email.toLowerCase().trim();
  const updated: User = { ...user, enrolledCourses: [...user.enrolledCourses, courseId] };
  users[lowerEmail] = updated;
  saveUsersLocal(users);
  setLocalUserCache(updated);

  toast.success("Enrolled successfully (demo mode)!");
  return true;
}

function getApiBaseUrl(): string {
  const fromEnv = (import.meta as any)?.env?.VITE_BACKEND_URL as string | undefined;
  return fromEnv || "http://localhost:4000";
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USERS_TOKEN_KEY);
}

function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) localStorage.removeItem(USERS_TOKEN_KEY);
  else localStorage.setItem(USERS_TOKEN_KEY, token);
}

function getCachedUser(): User | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

function setCachedUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (!user) localStorage.removeItem(CURRENT_USER_KEY);
  else localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function getCurrentUser(): User | null {
  return getCachedUser();
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl();
  const token = getToken();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }

  return (await res.json()) as T;
}

async function refreshEnrolledCourses(user: AuthUserFromServer): Promise<User> {
  const enrollments = await apiFetch<EnrollmentsResponse>("/api/enrollments/me");
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatarUrl ?? undefined,
    enrolledCourses: enrollments.courseIds,
  };
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

async function ensureRazorpayScriptLoaded(): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.Razorpay) return;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset["razorpay"] = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.head.appendChild(script);
  });
}

export async function register(
  name: string,
  email: string,
  password?: string,
  avatar?: string,
): Promise<{ success: boolean; message: string; user?: User }> {
  const avatarUrl =
    avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`;

  try {
    const payload = {
      name: name.trim(),
      email: email.trim(),
      password,
      avatarUrl,
    };

    const result = await apiFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setToken(result.token);
    const user = await refreshEnrolledCourses(result.user);
    setCachedUser(user);

    return { success: true, message: "Account created successfully!", user };
  } catch (err: any) {
    if (isNetworkFailure(err)) {
      const demo = mockRegister(name, email, password, avatarUrl);
      return { success: true, message: "Account created (demo mode) — backend not reachable", user: demo.user };
    }

    return { success: false, message: err?.message || "Register failed" };
  }
}

export async function loginWithCredentials(
  email: string,
  password?: string,
): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const payload = {
      email,
      password,
    };

    const result = await apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setToken(result.token);
    const user = await refreshEnrolledCourses(result.user);
    setCachedUser(user);

    return { success: true, message: "Logged in successfully!", user };
  } catch (err: any) {
    if (isNetworkFailure(err)) {
      const demoUser = mockLoginCredentials(email, password);
      return { success: true, message: "Logged in (demo mode) — backend not reachable", user: demoUser.user };
    }

    return { success: false, message: err?.message || "Login failed" };
  }
}

export async function loginWithGoogle(): Promise<{ success: boolean; message: string; user: User }> {
  const mockGoogleUser = {
    name: "Alex Dev",
    email: "alex@example.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  };

  try {
    const result = await apiFetch<AuthResponse>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify(mockGoogleUser),
    });

    setToken(result.token);
    const user = await refreshEnrolledCourses(result.user);
    setCachedUser(user);

    return { success: true, message: "Logged in with Google successfully!", user };
  } catch (err: any) {
    if (isNetworkFailure(err)) {
      const demo = mockLoginGoogle();
      return { success: true, message: "Google login (demo mode) — backend not reachable", user: demo.user };
    }

    throw new Error(err?.message || "Google login failed");
  }
}

export function logoutUser(): void {
  setToken(null);
  setCachedUser(null);
}

export function isEnrolled(courseId: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return user.enrolledCourses.includes(courseId);
}

// Back-compat alias (older code may import isEnrolledSync)
export function isEnrolledSync(courseId: string): boolean {
  return isEnrolled(courseId);
}

export async function enrollCourse(courseId: string): Promise<boolean> {
  const user = getCurrentUser();
  const token = getToken();

  if (!user || !token) {
    toast.error("Please login to enroll in courses.");
    return false;
  }

  try {
    const create = await apiFetch<CreateOrderResponse>("/api/payments/create-order", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    });

    if (create.free) {
      // server unlocked enrollment already
      const refreshed = await refreshEnrolledCourses({
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar,
      });
      setCachedUser(refreshed);
      toast.success("Enrolled successfully!");
      return true;
    }

    const orderId = create.orderId;
    if (!orderId) {
      toast.error("Payment order not found.");
      return false;
    }

    await ensureRazorpayScriptLoaded();

    return await new Promise<boolean>((resolve) => {
      const RazorpayCtor = window.Razorpay;
      if (!RazorpayCtor) {
        toast.error("Razorpay checkout is not available.");
        resolve(false);
        return;
      }

      const checkout = new RazorpayCtor({
        key: create.razorpayKeyId,
        amount: create.amountCents,
        currency: create.currency,
        name: "CodeFront Academy",
        description: "Course enrollment",
        order_id: orderId,
        handler: async (response: any) => {
          try {
            const cap = await apiFetch<CaptureResponse>("/api/payments/capture", {
              method: "POST",
              body: JSON.stringify({
                courseId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!cap.ok) throw new Error("Payment capture failed");

            const refreshed = await refreshEnrolledCourses({
              id: user.id,
              name: user.name,
              email: user.email,
              avatarUrl: user.avatar,
            });
            setCachedUser(refreshed);
            toast.success("Payment successful — enrollment unlocked!");
            resolve(true);
          } catch (err: any) {
            toast.error(err?.message || "Payment verification failed");
            resolve(false);
          }
        },
        modal: {
          ondismiss: () => {
            // User closed the modal
            resolve(false);
          },
        },
      });

      checkout.on('payment.failed', function () {
        toast.error("Payment failed. Please try again.");
        resolve(false);
      });

      checkout.open();
    });
  } catch (err: any) {
    toast.error(err?.message || "Failed to start payment");
    return false;
  }
}
