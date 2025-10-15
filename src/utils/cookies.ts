import type { NextApiRequest } from "next";

export function serializeCookie(name: string, value: string, options: { httpOnly?: boolean; maxAge?: number; path?: string } = {}): string {
  const parts = [`${name}=${value}`];
  if (options.maxAge) {
    parts.push(`Max-Age=${options.maxAge}`);
  }
  parts.push(`Path=${options.path ?? "/"}`);
  if (options.httpOnly) {
    parts.push("HttpOnly");
  }
  parts.push("SameSite=Lax");
  return parts.join("; ");
}

export function extractCookie(req: NextApiRequest, key: string): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;
  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split("=");
    if (name === key) {
      return rest.join("=");
    }
  }
  return undefined;
}
