const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const KEY = "inv_user";
const TOKEN_KEY = "inv_token";

export function getApiUrl(path) {
  return `${API.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(token, user) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(KEY);
}

export function getAuthHeaders() {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Returns true if user has admin role (checks role name case-insensitive). */
export function isAdmin(user) {
  const roles = user?.roles ?? [];
  return roles.some((r) => {
    const name = typeof r === "string" ? r : r?.name;
    return String(name).toLowerCase() === "admin";
  });
}
