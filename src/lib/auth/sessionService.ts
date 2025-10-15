import { randomBytes } from "crypto";
import type { Collection } from "mongodb";
import clientPromise from "@/lib/mongodb";
import type { SessionUser } from "@/types";
import { getUserById, toSessionUser } from "./userService";

const SESSION_TTL_HOURS = 8;

interface SessionDocument {
  token: string;
  userId: string;
  createdAt: Date | string;
  expiresAt: Date | string;
}

let sessionsCollectionPromise: Promise<Collection<SessionDocument>> | null = null;

async function getSessionsCollection(): Promise<Collection<SessionDocument>> {
  if (!sessionsCollectionPromise) {
    sessionsCollectionPromise = (async () => {
      const client = await clientPromise;
      const collection = client.db().collection<SessionDocument>("sessions");
      await collection.createIndex({ token: 1 }, { unique: true });
      await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      return collection;
    })();
  }
  return sessionsCollectionPromise;
}

export async function createSession(userId: string): Promise<string> {
  const collection = await getSessionsCollection();
  const token = randomBytes(24).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_HOURS * 60 * 60 * 1000);

  await collection.insertOne({
    token,
    userId,
    createdAt: now,
    expiresAt
  });

  return token;
}

export async function revokeSession(token: string): Promise<void> {
  const collection = await getSessionsCollection();
  await collection.deleteOne({ token });
}

export async function getSessionUser(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;

  const collection = await getSessionsCollection();
  const session = await collection.findOne({ token });
  if (!session) {
    return null;
  }

  const expiresAt = session.expiresAt instanceof Date ? session.expiresAt : new Date(session.expiresAt);

  if (expiresAt.getTime() <= Date.now()) {
    await collection.deleteOne({ token });
    return null;
  }

  const user = await getUserById(session.userId);
  if (!user) return null;
  return toSessionUser(user);
}

export async function purgeExpiredSessions(): Promise<void> {
  const collection = await getSessionsCollection();
  await collection.deleteMany({ expiresAt: { $lte: new Date() } });
}
