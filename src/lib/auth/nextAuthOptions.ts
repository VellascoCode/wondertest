import type { AuthOptions } from "next-auth";
import { getUserByEmail, toSessionUser, verifyPassword } from "./userService";

export const authOptions: AuthOptions = {
  sessionCookieName: "checkmate_session",
  credentials: {
    async authorize(credentials) {
      const email = typeof credentials?.email === "string" ? credentials.email : undefined;
      const password = typeof credentials?.password === "string" ? credentials.password : undefined;

      if (!email || !password) {
        throw new Error("E-mail e senha são obrigatórios");
      }

      const user = await getUserByEmail(email);
      if (!user) {
        throw new Error("Credenciais inválidas");
      }

      if (user.status === 2) {
        throw new Error("Usuário banido");
      }

      const valid = verifyPassword(password, user.passwordHash);
      if (!valid) {
        throw new Error("Credenciais inválidas");
      }

      return toSessionUser(user);
    }
  }
};
