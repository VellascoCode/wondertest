import type { NextApiRequest, NextApiResponse } from "next";
import { getSystemStatus, setSystemStatus } from "@/lib/systemStatus";
import { getApiSessionUser } from "@/lib/auth/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const status = await getSystemStatus();
    return res.status(200).json(status);
  }

  if (req.method === "POST") {
    const sessionUser = await getApiSessionUser(req, res);
    if (!sessionUser || !sessionUser.isAdmin) {
      return res.status(403).json({ error: "Apenas administradores podem alterar o status" });
    }

    const { status, label, message } = req.body ?? {};
    if (!status || !label || !message) {
      return res.status(400).json({ error: "Campos obrigatórios: status, label, message" });
    }

    const updated = await setSystemStatus(Number(status), label, message);
    return res.status(200).json(updated);
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Método não suportado" });
}
