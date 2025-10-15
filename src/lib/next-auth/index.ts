import type { NextApiRequest, NextApiResponse } from "next";
import type { SessionUser } from "@/types";
import { serializeCookie, extractCookie } from "@/utils/cookies";
import { createSessionToken, getSessionMaxAge, readSessionToken } from "@/lib/auth/sessionToken";
import { getUserByEmail, toSessionUser } from "@/lib/auth/userService";

export interface AuthOptions {
  credentials: {
    authorize: (credentials: Record<string, unknown> | undefined) => Promise<SessionUser>;
  };
  sessionCookieName?: string;
}

export interface Session {
  user: SessionUser;
}

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

const DEFAULT_SESSION_COOKIE = "checkmate_session";

async function resolveSessionUser(token: string | undefined): Promise<SessionUser | null> {
  const payload = readSessionToken(token);
  if (!payload) {
    return null;
  }

  const user = await getUserByEmail(payload.email);
  if (!user || user.status === 2) {
    return null;
  }

  return toSessionUser(user);
}

function resolveCookieName(options?: AuthOptions) {
  return options?.sessionCookieName ?? DEFAULT_SESSION_COOKIE;
}

function resolveSegments(req: NextApiRequest): string[] {
  const segments = req.query.nextauth;
  if (!segments) return [];
  return Array.isArray(segments) ? segments : [segments];
}

export default function NextAuth(options: AuthOptions) {
  const cookieName = resolveCookieName(options);

  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    const segments = resolveSegments(req);

    if (segments.length === 1 && segments[0] === "session" && req.method === "GET") {
      const token = extractCookie(req, cookieName);
      const user = await resolveSessionUser(token);
      return res.status(200).json({ user });
    }

    if (segments.length === 2 && segments[0] === "callback" && segments[1] === "credentials" && req.method === "POST") {
      try {
        const user = await options.credentials.authorize(req.body ?? {});
        const token = createSessionToken(user.email);
        const cookie = serializeCookie(cookieName, token, {
          httpOnly: true,
          maxAge: getSessionMaxAge(),
          path: "/",
          secure: process.env.NODE_ENV === "production"
        });
        res.setHeader("Set-Cookie", cookie);
        return res.status(200).json({ user });
      } catch (error) {
        return res.status(401).json({ error: (error as Error).message });
      }
    }

    if (segments.length === 1 && segments[0] === "signout" && req.method === "POST") {
      void req.body?.token;
      const cookie = serializeCookie(cookieName, "", {
        httpOnly: true,
        maxAge: 0,
        path: "/",
        secure: process.env.NODE_ENV === "production"
      });
      res.setHeader("Set-Cookie", cookie);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Rota ou método não suportado" });
  };
}

export async function getServerSession(
  req: NextApiRequest,
  res: NextApiResponse,
  options?: AuthOptions
): Promise<Session | null> {
  void res;
  const cookieName = resolveCookieName(options);
  const token = extractCookie(req, cookieName);
  const user = await resolveSessionUser(token);
  if (!user) {
    return null;
  }
  return { user };
}
