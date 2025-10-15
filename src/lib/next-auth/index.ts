import type { NextApiRequest, NextApiResponse } from "next";
import type { SessionUser } from "@/types";
import { serializeCookie, extractCookie } from "@/utils/cookies";
import { createSession, getSessionUser, purgeExpiredSessions, revokeSession } from "@/lib/auth/sessionService";

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
      await purgeExpiredSessions();
      const token = extractCookie(req, cookieName);
      const user = await getSessionUser(token);
      return res.status(200).json({ user, token });
    }

    if (segments.length === 2 && segments[0] === "callback" && segments[1] === "credentials" && req.method === "POST") {
      await purgeExpiredSessions();
      try {
        const user = await options.credentials.authorize(req.body ?? {});
        const token = await createSession(user.id);
        const cookie = serializeCookie(cookieName, token, {
          httpOnly: true,
          maxAge: 60 * 60 * 8,
          path: "/"
        });
        res.setHeader("Set-Cookie", cookie);
        return res.status(200).json({ user });
      } catch (error) {
        return res.status(401).json({ error: (error as Error).message });
      }
    }

    if (segments.length === 1 && segments[0] === "signout" && req.method === "POST") {
      const token = extractCookie(req, cookieName) ?? req.body?.token;
      if (token) {
        await revokeSession(token);
      }
      const cookie = serializeCookie(cookieName, "", {
        httpOnly: true,
        maxAge: 0,
        path: "/"
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
  const user = await getSessionUser(token);
  if (!user) {
    return null;
  }
  return { user };
}
