// ============================================================
// XÁC NHẬN THAM DỰ <-> FIREBASE (REST, không cần SDK): Auth + Realtime Database
// - Khách: đăng nhập ẩn danh, chỉ được TẠO xác nhận của chính mình, không đọc được của người khác.
// - Admin: đăng nhập Email/Password; quyền admin do node "admins" trong database quyết định.
// ============================================================
import { firebaseConfig, rsvpConfig } from "./firebase-config.js";

const GUEST_SESSION_KEY = "taz-imap-gala-guest-session";
const ADMIN_SESSION_KEY = "taz-imap-gala-admin-session";
let guestSession = null;
let adminSession = null;

async function request(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      redirect: "error",
      headers: { "Content-Type": "application/json" },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error("Firebase request failed");
      error.status = response.status;
      error.code = (payload && payload.error && payload.error.message) || (payload && payload.error) || "REQUEST_FAILED";
      throw error;
    }
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

const authUrl = (method) =>
  `https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${encodeURIComponent(firebaseConfig.apiKey)}`;

function toSession(result, extra = {}) {
  const token = result.idToken || result.id_token;
  const uid = result.localId || result.user_id;
  const refreshToken = result.refreshToken || result.refresh_token;
  if (!token || !uid) throw new Error("Auth unavailable");
  const seconds = Number(result.expiresIn || result.expires_in || 3600);
  return { token, uid, refreshToken, expiresAt: Date.now() + (seconds - 60) * 1000, ...extra };
}

async function refreshSession(session) {
  const result = await request(
    `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(firebaseConfig.apiKey)}`,
    { method: "POST", body: JSON.stringify({ grant_type: "refresh_token", refresh_token: session.refreshToken }) }
  );
  return toSession(result, { email: session.email });
}

function dbUrl(path, params = {}) {
  const url = new URL(`${firebaseConfig.databaseURL.replace(/\/$/, "")}/${path}.json`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url;
}

const rsvpUrl = (segments, params) =>
  dbUrl([...rsvpConfig.path.split("/"), ...segments].map(encodeURIComponent).join("/"), params);

// Khách: localStorage (giữ lâu). Admin: sessionStorage (đóng tab là phải đăng nhập lại).
function readStored(key, storage = localStorage) {
  try { return JSON.parse(storage.getItem(key)); } catch { return null; }
}

function store(key, value, storage = localStorage) {
  try {
    if (value) storage.setItem(key, JSON.stringify(value));
    else storage.removeItem(key);
  } catch { /* bộ nhớ bị chặn: dùng phiên tạm */ }
}

export function newRsvpId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- Khách ----------

// Giữ phiên ẩn danh trong trình duyệt để không tạo tài khoản mới mỗi lần mở thiệp
async function getGuestSession() {
  if (guestSession && guestSession.expiresAt > Date.now()) return guestSession;
  if (!guestSession) guestSession = readStored(GUEST_SESSION_KEY);
  try {
    if (guestSession && guestSession.refreshToken && guestSession.expiresAt <= Date.now()) {
      guestSession = await refreshSession(guestSession);
    }
  } catch {
    guestSession = null;
  }
  if (!guestSession || !guestSession.token || guestSession.expiresAt <= Date.now()) {
    guestSession = toSession(await request(authUrl("signUp"), {
      method: "POST",
      body: JSON.stringify({ returnSecureToken: true }),
    }));
  }
  store(GUEST_SESSION_KEY, guestSession);
  return guestSession;
}

// Gửi lại với cùng id thì ghi đè đúng bản đó, mạng chập chờn cũng không tạo bản trùng
export async function sendRsvp({ id, name, attend, region, eventId, urlName, createdAt }) {
  const session = await getGuestSession();
  const body = { name, attend, region, eventId, urlName, createdAt, authorId: session.uid };
  await request(rsvpUrl([id], { auth: session.token }), { method: "PUT", body: JSON.stringify(body) });
}

// ---------- Admin ----------

async function getAdminToken() {
  if (!adminSession) adminSession = readStored(ADMIN_SESSION_KEY, sessionStorage);
  if (!adminSession) throw Object.assign(new Error("NOT_SIGNED_IN"), { code: "NOT_SIGNED_IN" });
  if (adminSession.expiresAt <= Date.now()) {
    adminSession = await refreshSession(adminSession);
    store(ADMIN_SESSION_KEY, adminSession, sessionStorage);
  }
  return adminSession.token;
}

export function currentAdmin() {
  if (!adminSession) adminSession = readStored(ADMIN_SESSION_KEY, sessionStorage);
  return adminSession ? { email: adminSession.email, uid: adminSession.uid } : null;
}

export async function signInAdmin(email, password) {
  const result = await request(authUrl("signInWithPassword"), {
    method: "POST",
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const session = toSession(result, { email: result.email || email });
  // Quyền admin chỉ tin dữ liệu trong database, không tin trình duyệt
  const isAdmin = await request(
    dbUrl(`${rsvpConfig.adminsPath}/${encodeURIComponent(session.uid)}`, { auth: session.token }),
    { method: "GET" }
  ).catch(() => null);
  if (isAdmin !== true) throw Object.assign(new Error("NOT_ADMIN"), { code: "NOT_ADMIN" });
  adminSession = session;
  store(ADMIN_SESSION_KEY, session, sessionStorage);
  return { email: session.email, uid: session.uid };
}

export function signOutAdmin() {
  adminSession = null;
  store(ADMIN_SESSION_KEY, null, sessionStorage);
}

export async function loadAllRsvps() {
  const token = await getAdminToken();
  const payload = await request(rsvpUrl([], { auth: token }), { method: "GET" });
  if (!payload || typeof payload !== "object") return [];
  return Object.entries(payload).map(([id, item]) => ({ id, ...item }));
}

export async function deleteRsvp(id) {
  const token = await getAdminToken();
  await request(rsvpUrl([id], { auth: token }), { method: "DELETE" });
}
