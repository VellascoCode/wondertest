import type { NextApiRequest, NextApiResponse } from "next";
import { markAlertAsResolved } from "@/lib/alertsEngine";
import { getApiSessionUser } from "@/lib/auth/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não suportado" });
  }

  const sessionUser = await getApiSessionUser(req, res);
  if (!sessionUser || !sessionUser.isAdmin) {
    return res.status(403).json({ error: "Apenas administradores podem resolver alertas" });
  }

  const { id } = req.body ?? {};
  if (!id) {
    return res.status(400).json({ error: "ID obrigatório" });
  }

  await markAlertAsResolved(id);
  res.status(200).json({ ok: true });
}
