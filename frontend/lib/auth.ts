import { api, ApiError, getToken, setToken, type UserOut } from "@/lib/api";

const USER_STORAGE_KEY = "uniassist_user";

function readStoredUser(): UserOut | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserOut) : null;
  } catch {
    return null;
  }
}

function storeUser(user: UserOut | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // ignore storage failures
  }
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/**
 * UniAssist lets students triage anonymously, but the backend requires a
 * signed-in account to create cases and book appointments. To keep that
 * "no sign-in needed" feel we transparently provision a guest student
 * account on first use and reuse its token from then on.
 */
async function registerGuest(): Promise<UserOut> {
  const suffix = randomSuffix();
  const { access_token, user } = await api.auth.register({
    // example.com is the RFC 2606 reserved documentation domain; email-validator
    // rejects special-use TLDs like .local, so a real-looking domain is required.
    email: `guest-${suffix}@example.com`,
    password: `g-${suffix}-${randomSuffix()}`,
    full_name: "Guest Student",
  });
  setToken(access_token);
  storeUser(user);
  return user;
}

let bootstrapPromise: Promise<UserOut> | null = null;

export function ensureAuth(): Promise<UserOut> {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const token = getToken();
    if (token) {
      try {
        const user = await api.auth.me();
        storeUser(user);
        return user;
      } catch (err) {
        if (!(err instanceof ApiError) || err.status !== 401) throw err;
        setToken(null);
        storeUser(null);
      }
    }
    return registerGuest();
  })().catch((err) => {
    bootstrapPromise = null;
    throw err;
  });

  return bootstrapPromise;
}

export function getCachedUser(): UserOut | null {
  return readStoredUser();
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

export function signOut() {
  setToken(null);
  storeUser(null);
  bootstrapPromise = null;
}
