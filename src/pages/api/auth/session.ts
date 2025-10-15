import type { NextApiRequest, NextApiResponse } from "next";
import { getSessionUser, purgeExpiredSessions } from "@/lib/auth/sessionService";
import { extractCookie } from "@/utils/cookies";
import { SESSION_COOKIE } from "./login";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método não suportado" });
  }

  await purgeExpiredSessions();
  const token = extractCookie(req, SESSION_COOKIE);
  const user = await getSessionUser(token);
  return res.status(200).json({ user, token });
}
