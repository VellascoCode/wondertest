import type { NextApiRequest, NextApiResponse } from "next";
import { getApiSessionUser } from "@/lib/auth/apiAuth";
import { getAllUsers, toPublicUser, updateUser } from "@/lib/auth/userService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sessionUser = await getApiSessionUser(req, res);
  if (!sessionUser || !sessionUser.isAdmin) {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }

  if (req.method === "GET") {
    const users = await getAllUsers();
    return res.status(200).json({ users: users.map(toPublicUser) });
  }

  if (req.method === "PATCH") {
    const { id, type, status } = req.body ?? {};
    if (!id) {
      return res.status(400).json({ error: "ID do usuário é obrigatório" });
    }

    try {
      const updated = await updateUser(id, {
        ...(type !== undefined ? { type: Number(type) } : {}),
        ...(status !== undefined ? { status: Number(status) } : {})
      });
      return res.status(200).json({ user: updated });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ error: "Método não suportado" });
}
