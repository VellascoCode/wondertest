import Head from "next/head";
import Link from "next/link";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { FaLock } from "react-icons/fa";

export default function RestrictedPage() {
  const { status } = useSystemStatus();

  return (
    <>
      <Head>
        <title>Acesso restrito • Checkmate</title>
      </Head>
      <div className="mx-auto max-w-2xl space-y-8 text-center">
        <div className="theme-glass rounded-3xl border px-10 py-12 shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-rose-400/40 bg-rose-500/10 text-4xl">
            <FaLock className="text-rose-300" />
          </div>
          <h1 className="mt-6 text-3xl font-bold uppercase tracking-[0.25em]">Acesso restrito</h1>
          <p className="mt-4 text-base text-contrast-muted">
            {status?.message ?? "Esta área está acessível apenas para contas autorizadas."}
          </p>
        </div>
        <Link href="/auth/signin" className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] hover:border-emerald-400/60">
          Entrar com outra conta
        </Link>
      </div>
    </>
  );
}
