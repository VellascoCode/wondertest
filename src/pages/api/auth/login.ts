import type { NextApiRequest, NextApiResponse } from "next";
import { getUserByEmail, toSessionUser, verifyPassword } from "@/lib/auth/userService";
import { createSession, purgeExpiredSessions } from "@/lib/auth/sessionService";
import { serializeCookie } from "@/utils/cookies";

export const SESSION_COOKIE = "checkmate_session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não suportado" });
  }

  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
  }

  await purgeExpiredSessions();

  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  if (user.status === 2) {
    return res.status(403).json({ error: "Usuário banido" });
  }

  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  const token = await createSession(user.id);
  const cookie = serializeCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/"
  });

  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ user: toSessionUser(user) });
}
