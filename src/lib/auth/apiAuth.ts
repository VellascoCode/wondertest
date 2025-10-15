import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import type { SessionUser } from "@/types";
import { authOptions } from "./nextAuthOptions";

export async function getApiSessionUser(req: NextApiRequest, res: NextApiResponse): Promise<SessionUser | null> {
  const session = await getServerSession(req, res, authOptions);
  return (session?.user as SessionUser | undefined) ?? null;
}
