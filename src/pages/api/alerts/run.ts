import type { NextApiRequest, NextApiResponse } from "next";
import { runBaseAlertScan } from "@/lib/alertsEngine";
import { getApiSessionUser } from "@/lib/auth/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não suportado" });
  }

  const sessionUser = await getApiSessionUser(req);
  if (!sessionUser || !sessionUser.isAdmin) {
    return res.status(403).json({ error: "Apenas administradores podem disparar o scanner" });
  }

  const alert = await runBaseAlertScan();
  res.status(200).json({ alert });
}
