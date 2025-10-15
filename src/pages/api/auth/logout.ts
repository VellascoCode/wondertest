import type { NextApiRequest, NextApiResponse } from "next";
import { revokeSession } from "@/lib/auth/sessionService";
import { extractCookie, serializeCookie } from "@/utils/cookies";
import { SESSION_COOKIE } from "./login";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não suportado" });
  }

  const token = extractCookie(req, SESSION_COOKIE) ?? req.body?.token;
  if (token) {
    await revokeSession(token);
  }

  const cookie = serializeCookie(SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/"
  });

  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ ok: true });
}
