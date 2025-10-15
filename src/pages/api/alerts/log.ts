import type { NextApiRequest, NextApiResponse } from "next";
import { getAlertLog } from "@/lib/alertsEngine";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método não suportado" });
  }

  const { limit } = req.query;
  const parsedLimit = typeof limit === "string" ? Number(limit) : undefined;
  const alerts = await getAlertLog(parsedLimit);
  res.status(200).json({ alerts });
}
