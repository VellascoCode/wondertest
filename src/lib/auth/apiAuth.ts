import type { NextApiRequest } from "next";
import { extractCookie } from "@/utils/cookies";
import { getSessionUser } from "./sessionService";
import { SESSION_COOKIE } from "@/pages/api/auth/login";

export async function getApiSessionUser(req: NextApiRequest) {
  const token = extractCookie(req, SESSION_COOKIE);
  return getSessionUser(token);
}
