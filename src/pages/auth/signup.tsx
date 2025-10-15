import Head from "next/head";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

export default function SignUpPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await register(name, email, password);
      setSuccess(true);
      setTimeout(() => router.push("/auth/signin"), 1200);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Cadastro - Checkmate</title>
      </Head>
      <section className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/5 p-10 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-bold uppercase tracking-[0.2em]">Cadastrar</h1>
        <p className="mt-2 text-contrast-muted">Crie sua conta padrão e comece a explorar a plataforma.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="text-sm font-semibold uppercase tracking-wide">Nome completo</label>
            <input
              type="text"
              className="theme-input mt-2 w-full rounded-xl px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
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
              minLength={6}
              className="theme-input mt-2 w-full rounded-xl px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && <p className="rounded-lg border border-red-400/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
          {success && <p className="rounded-lg border border-emerald-400/60 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Cadastro realizado! Redirecionando...</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold uppercase tracking-wide text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Enviando..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-contrast-muted">
          Já possui login? {" "}
          <Link href="/auth/signin" className="font-semibold text-emerald-300">
            Entrar agora
          </Link>
        </p>
      </section>
    </>
  );
}
