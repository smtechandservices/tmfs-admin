// The session cookie holds the token issued by tmfs-backend's /api/auth/login.
// The backend verifies it on every call; this app only stores and forwards it.

export const SESSION_COOKIE = 'tm_admin';
export const SESSION_TTL = 60 * 60 * 24 * 14; // 14 days, same as the backend token
