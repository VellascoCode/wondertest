import Head from "next/head";
import Link from "next/link";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { FaCloudUploadAlt } from "react-icons/fa";

export default function UpdatingPage() {
  const { status } = useSystemStatus();

  return (
    <>
      <Head>
        <title>Atualização em curso • Checkmate</title>
      </Head>
      <div className="mx-auto max-w-2xl space-y-8 text-center">
        <div className="theme-glass rounded-3xl border px-10 py-12 shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-sky-400/40 bg-sky-500/10 text-4xl">
            <FaCloudUploadAlt className="text-sky-300" />
          </div>
          <h1 className="mt-6 text-3xl font-bold uppercase tracking-[0.25em]">Atualização em curso</h1>
          <p className="mt-4 text-base text-contrast-muted">
            {status?.message ?? "Novas features de monitoramento estão sendo integradas."}
          </p>
        </div>
        <Link href="/" className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] hover:border-emerald-400/60">
          Voltar ao início
        </Link>
      </div>
    </>
  );
}
