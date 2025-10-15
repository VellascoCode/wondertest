import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { MongoServerError, type Collection, type WithId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import type { PlatformUser, PublicUser, SessionUser, UserStatus, UserType } from "@/types";

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  type?: UserType;
  status?: UserStatus;
}

interface UserDocument extends Omit<PlatformUser, "createdAt" | "updatedAt"> {
  createdAt: Date | string;
  updatedAt: Date | string;
}

let usersCollectionPromise: Promise<Collection<UserDocument>> | null = null;

async function getUsersCollection(): Promise<Collection<UserDocument>> {
  if (!usersCollectionPromise) {
    usersCollectionPromise = (async () => {
      const client = await clientPromise;
      const collection = client.db().collection<UserDocument>("users");
      await collection.createIndex({ email: 1 }, { unique: true });
      await collection.createIndex({ id: 1 }, { unique: true });
      return collection;
    })();
  }
  return usersCollectionPromise;
}

function normalizeDate(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date(value).toISOString();
}

function mapUserDocument(doc: WithId<UserDocument>): PlatformUser {
  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
    passwordHash: doc.passwordHash,
    type: doc.type,
    status: doc.status,
    createdAt: normalizeDate(doc.createdAt),
    updatedAt: normalizeDate(doc.updatedAt)
  };
}

export async function getAllUsers(): Promise<PlatformUser[]> {
  const collection = await getUsersCollection();
  const docs = await collection.find({}, { sort: { createdAt: -1 } }).toArray();
  return docs.map(mapUserDocument);
}

export async function getUserByEmail(email: string): Promise<PlatformUser | undefined> {
  const collection = await getUsersCollection();
  const doc = await collection.findOne({ email: email.toLowerCase() });
  return doc ? mapUserDocument(doc) : undefined;
}

export async function getUserById(id: string): Promise<PlatformUser | undefined> {
  const collection = await getUsersCollection();
  const doc = await collection.findOne({ id });
  return doc ? mapUserDocument(doc) : undefined;
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

  const collection = await getUsersCollection();
  const now = new Date();
  const userDocument: UserDocument = {
    id: randomBytes(12).toString("hex"),
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    type,
    status,
    createdAt: now,
    updatedAt: now
  };

  try {
    await collection.insertOne(userDocument);
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      throw new Error("E-mail já está cadastrado");
    }
    throw error;
  }

  const platformUser: PlatformUser = {
    id: userDocument.id,
    name: userDocument.name,
    email: userDocument.email,
    passwordHash: userDocument.passwordHash,
    type: userDocument.type,
    status: userDocument.status,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  return toPublicUser(platformUser);
}

type UpdateUserPatch = Partial<Pick<PlatformUser, "name" | "passwordHash" | "type" | "status">>;

export async function updateUser(id: string, patch: UpdateUserPatch): Promise<PublicUser> {
  const collection = await getUsersCollection();
  const now = new Date();
  const updateFields: Partial<UserDocument> = { updatedAt: now };

  if (patch.name !== undefined) {
    updateFields.name = patch.name;
  }
  if (patch.passwordHash !== undefined) {
    updateFields.passwordHash = patch.passwordHash;
  }
  if (patch.type !== undefined) {
    updateFields.type = patch.type;
  }
  if (patch.status !== undefined) {
    updateFields.status = patch.status;
  }

  const result = await collection.findOneAndUpdate(
    { id },
    { $set: updateFields },
    { returnDocument: "after" }
  );

  if (!result.value) {
    throw new Error("Usuário não encontrado");
  }

  return toPublicUser(mapUserDocument(result.value));
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
