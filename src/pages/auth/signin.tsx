import Head from "next/head";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

export default function SignInPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [router, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Entrar - Checkmate</title>
      </Head>
      <section className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/5 p-10 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-bold uppercase tracking-[0.2em]">Login</h1>
        <p className="mt-2 text-contrast-muted">Acesse a inteligência de alertas do Checkmate.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="text-sm font-semibold uppercase tracking-wide">E-mail</label>
            <input
              type="email"
              className="theme-input mt-2 w-full rounded-xl px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold uppercase tracking-wide">Senha</label>
            <input
              type="password"
              className="theme-input mt-2 w-full rounded-xl px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && <p className="rounded-lg border border-red-400/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold uppercase tracking-wide text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-contrast-muted">
          Ainda não possui acesso? {" "}
          <Link href="/auth/signup" className="font-semibold text-emerald-300">
            Cadastre-se agora
          </Link>
        </p>
      </section>
    </>
  );
}
