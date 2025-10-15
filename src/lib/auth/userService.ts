import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { readJSON, writeJSON } from "@/lib/fileStore";
import type { PlatformUser, PublicUser, SessionUser, UserStatus, UserType } from "@/types";

const USERS_FILE = "users.json";

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  type?: UserType;
  status?: UserStatus;
}

export async function getAllUsers(): Promise<PlatformUser[]> {
  return readJSON<PlatformUser[]>(USERS_FILE, []);
}

export async function getUserByEmail(email: string): Promise<PlatformUser | undefined> {
  const users = await getAllUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export async function getUserById(id: string): Promise<PlatformUser | undefined> {
  const users = await getAllUsers();
  return users.find((user) => user.id === id);
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  const [salt, key] = passwordHash.split(":");
  if (!salt || !key) return false;
  const derivedKey = scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, "hex");
  return timingSafeEqual(derivedKey, keyBuffer);
}

export async function createUser(input: CreateUserInput): Promise<PublicUser> {
  const { name, email, password } = input;
  const type: UserType = input.type ?? 0;
  const status: UserStatus = input.status ?? 0;

  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error("E-mail já está cadastrado");
  }

  const users = await getAllUsers();
  const now = new Date().toISOString();
  const newUser: PlatformUser = {
    id: randomBytes(12).toString("hex"),
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    type,
    status,
    createdAt: now,
    updatedAt: now
  };

  users.push(newUser);
  await writeJSON(USERS_FILE, users);
  return toPublicUser(newUser);
}

export async function updateUser(id: string, patch: Partial<Omit<PlatformUser, "id" | "email" | "createdAt">>): Promise<PublicUser> {
  const users = await getAllUsers();
  const idx = users.findIndex((user) => user.id === id);
  if (idx === -1) {
    throw new Error("Usuário não encontrado");
  }

  const now = new Date().toISOString();
  const updated: PlatformUser = {
    ...users[idx],
    ...patch,
    updatedAt: now
  };
  users[idx] = updated;
  await writeJSON(USERS_FILE, users);
  return toPublicUser(updated);
}

export function toPublicUser(user: PlatformUser): PublicUser {
  const { id, name, email, type, status } = user;
  return { id, name, email, type, status };
}

export function toSessionUser(user: PlatformUser): SessionUser {
  const publicUser = toPublicUser(user);
  const isAdmin = user.type >= 8;
  return { ...publicUser, isAdmin };
}
