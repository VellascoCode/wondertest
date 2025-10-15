import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { AlertLogItem } from "@/types";
import { useAuth } from "@/context/AuthContext";

const levelStyles: Record<string, string> = {
  info: "bg-sky-500/10 border-sky-400/40 text-sky-200",
  success: "bg-emerald-500/10 border-emerald-400/40 text-emerald-200",
  warning: "bg-amber-500/10 border-amber-400/40 text-amber-200",
  error: "bg-rose-500/10 border-rose-400/40 text-rose-200",
  system: "bg-fuchsia-500/10 border-fuchsia-400/40 text-fuchsia-200"
};

export default function AlertsTestPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRun, setLastRun] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/alerts/log?limit=30");
      const data = await response.json();
      setAlerts(data.alerts ?? []);
      setLastRun(new Date().toISOString());
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar alertas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleManualScan = async () => {
    try {
      const response = await fetch("/api/alerts/run", { method: "POST" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Falha ao rodar scanner");
      }
      const data = await response.json();
      toast.success(`Novo alerta ${data.alert.type} gerado`);
      fetchAlerts();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const response = await fetch("/api/alerts/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Não foi possível resolver alerta");
      }
      toast.success("Alerta marcado como resolvido");
      fetchAlerts();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const stats = useMemo(() => {
    const total = alerts.length;
    const resolved = alerts.filter((alert) => alert.resolved).length;
    const active = total - resolved;
    return { total, resolved, active };
  }, [alerts]);

  return (
    <>
      <Head>
        <title>Alert Lab • Checkmate</title>
      </Head>
      <div className="space-y-10">
        <section className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-[0.3em]">Lab de alertas</h1>
              <p className="mt-2 max-w-xl text-sm text-contrast-muted">
                Monitore o resultado do motor base a cada 5 minutos. Utilize esta página para depurar alertas reais gerados pelo cron.
              </p>
            </div>
            {user?.isAdmin && (
              <button
                onClick={handleManualScan}
                className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-black hover:bg-emerald-400"
              >
                Rodar scanner agora
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-contrast-muted">Alertas ativos</p>
              <p className="mt-2 text-3xl font-bold text-emerald-300">{stats.active}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-contrast-muted">Resolvidos</p>
              <p className="mt-2 text-3xl font-bold text-sky-300">{stats.resolved}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-contrast-muted">Última atualização</p>
              <p className="mt-2 text-sm text-contrast-muted">{lastRun ? new Date(lastRun).toLocaleTimeString() : "--"}</p>
            </div>
          </div>
        </section>

        <section className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold uppercase tracking-[0.25em]">Fila de alertas</h2>
            <button onClick={fetchAlerts} className="text-xs uppercase tracking-[0.3em] text-emerald-300 hover:text-emerald-200">
              Atualizar
            </button>
          </div>
          <div className="mt-6 space-y-4">
            {loading && <p className="text-sm text-contrast-muted">Carregando registros...</p>}
            {!loading && alerts.length === 0 && <p className="text-sm text-contrast-muted">Nenhum alerta registrado ainda. Execute o cron ou rode manualmente.</p>}
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-2xl border px-4 py-4 ${levelStyles[alert.level] ?? "bg-white/10 border-white/10 text-white"}`}
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em]">{alert.network}</p>
                    <h3 className="text-lg font-semibold">{alert.type} • {alert.subtype}</h3>
                    <p className="text-sm text-contrast-muted">{alert.description}</p>
                  </div>
                  <div className="text-sm text-contrast-muted md:text-right">
                    <p>{new Date(alert.timestamp).toLocaleString()}</p>
                    <p>{alert.resolved ? "Resolvido" : "Ativo"}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  {alert.token_address && <span className="rounded-full border border-white/20 px-3 py-1">Token: {alert.token_address}</span>}
                  {alert.affected_tokens && alert.affected_tokens.length > 0 && (
                    <span className="rounded-full border border-white/20 px-3 py-1">
                      Impacto: {alert.affected_tokens.join(", ")}
                    </span>
                  )}
                  {!alert.resolved && user?.isAdmin && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="rounded-full border border-white/30 px-3 py-1 uppercase tracking-[0.3em] hover:border-emerald-400/60"
                    >
                      Resolver
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
          <h2 className="text-2xl font-semibold uppercase tracking-[0.25em]">Cron job</h2>
          <p className="mt-2 text-sm text-contrast-muted">
            Execute <code className="rounded bg-black/40 px-2 py-1">npm run alert-cron</code> para iniciar um worker que roda a cada 5 minutos. O script adiciona novos registros em <code className="rounded bg-black/40 px-2 py-1">data/alerts-log.json</code>.
          </p>
        </section>
      </div>
    </>
  );
}
