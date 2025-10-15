import type { NextApiRequest, NextApiResponse } from "next";
import { extractCookie } from "@/utils/cookies";
import { readSessionToken, getSessionMaxAge } from "@/lib/auth/sessionToken";
import { getUserByEmail, toPublicUser } from "@/lib/auth/userService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método não suportado" });
  }

  const token = extractCookie(req, ".session");
  const payload = readSessionToken(token);

  if (!payload) {
    return res.status(200).json({ authenticated: false });
  }

  const user = await getUserByEmail(payload.email);
  if (!user) {
    return res.status(200).json({ authenticated: false });
  }

  if (user.status === 2) {
    return res.status(200).json({ authenticated: false, reason: "USER_BANNED" });
  }

  const issuedAtIso = new Date(payload.issuedAt).toISOString();
  const expiresAtIso = new Date(payload.issuedAt + getSessionMaxAge() * 1000).toISOString();

  return res.status(200).json({
    authenticated: true,
    user: toPublicUser(user),
    session: {
      email: user.email,
      issuedAt: issuedAtIso,
      expiresAt: expiresAtIso,
      isAdmin: user.type >= 8
    }
  });
}
