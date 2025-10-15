import type { NextApiRequest, NextApiResponse } from "next";
import { createUser } from "@/lib/auth/userService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não suportado" });
  }

  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    const user = await createUser({ name, email, password });
    return res.status(201).json({ user });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
}
