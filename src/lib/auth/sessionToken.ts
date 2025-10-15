import { createHmac, timingSafeEqual } from "crypto";

const SESSION_TTL_HOURS = 8;
const SESSION_TTL_MS = SESSION_TTL_HOURS * 60 * 60 * 1000;

interface SessionPayload {
  email: string;
  issuedAt: number;
}

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET (ou SESSION_SECRET) é obrigatório para assinar sessões");
  }
  return secret;
}

function toBase64Url(value: string): string {
  return Buffer.from(value).toString("base64").replace(/=+$/u, "").replace(/\+/gu, "-").replace(/\//gu, "_");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/gu, "+").replace(/_/gu, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  return Buffer.from(padded + "=".repeat(padLength), "base64").toString("utf8");
}

export function createSessionToken(email: string): string {
  const payload: SessionPayload = { email: email.toLowerCase(), issuedAt: Date.now() };
  const payloadString = JSON.stringify(payload);
  const encodedPayload = toBase64Url(payloadString);
  const signature = createHmac("sha256", getSecret()).update(encodedPayload).digest();
  const encodedSignature = signature.toString("base64url");
  return `${encodedPayload}.${encodedSignature}`;
}

export function readSessionToken(token: string | undefined): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, encodedSignature] = token.split(".");
  if (!encodedPayload || !encodedSignature) {
    return null;
  }

  const expectedSignature = createHmac("sha256", getSecret()).update(encodedPayload).digest();
  let receivedSignature: Buffer;
  try {
    receivedSignature = Buffer.from(encodedSignature, "base64url");
  } catch (error) {
    console.error("Assinatura de sessão inválida", error);
    return null;
  }

  if (expectedSignature.length !== receivedSignature.length || !timingSafeEqual(expectedSignature, receivedSignature)) {
    return null;
  }

  try {
    const payload: SessionPayload = JSON.parse(fromBase64Url(encodedPayload));
    if (!payload.email || typeof payload.email !== "string" || typeof payload.issuedAt !== "number") {
      return null;
    }

    const expiredAt = payload.issuedAt + SESSION_TTL_MS;
    if (expiredAt <= Date.now()) {
      return null;
    }

    return { email: payload.email.toLowerCase(), issuedAt: payload.issuedAt };
  } catch (error) {
    console.error("Payload de sessão inválido", error);
    return null;
  }
}

export function getSessionMaxAge(): number {
  return SESSION_TTL_MS / 1000;
}
