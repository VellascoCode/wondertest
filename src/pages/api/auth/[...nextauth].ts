import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/nextAuthOptions";

export default NextAuth(authOptions);
