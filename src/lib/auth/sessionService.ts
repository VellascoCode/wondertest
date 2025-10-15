import { randomBytes } from "crypto";
import { readJSON, writeJSON } from "@/lib/fileStore";
import type { SessionUser } from "@/types";
import { getUserById, toSessionUser } from "./userService";

const SESSIONS_FILE = "sessions.json";
const SESSION_TTL_HOURS = 8;

interface StoredSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

async function getSessions(): Promise<StoredSession[]> {
  return readJSON<StoredSession[]>(SESSIONS_FILE, []);
}

export async function createSession(userId: string): Promise<string> {
  const sessions = await getSessions();
  const token = randomBytes(24).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_HOURS * 60 * 60 * 1000);

  sessions.push({
    token,
    userId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  });

  await writeJSON(SESSIONS_FILE, sessions);
  return token;
}

export async function revokeSession(token: string): Promise<void> {
  const sessions = await getSessions();
  const filtered = sessions.filter((session) => session.token !== token);
  await writeJSON(SESSIONS_FILE, filtered);
}

export async function getSessionUser(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const sessions = await getSessions();
  const now = Date.now();
  const activeSession = sessions.find((session) => session.token === token && new Date(session.expiresAt).getTime() > now);
  if (!activeSession) {
    return null;
  }

  const user = await getUserById(activeSession.userId);
  if (!user) return null;
  return toSessionUser(user);
}

export async function purgeExpiredSessions(): Promise<void> {
  const sessions = await getSessions();
  const now = Date.now();
  const active = sessions.filter((session) => new Date(session.expiresAt).getTime() > now);
  if (active.length !== sessions.length) {
    await writeJSON(SESSIONS_FILE, active);
  }
}
