import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { AlertLogItem, AlertType } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useAlerts } from "@/components/Alerts";
import type { AlertType as UiAlertType } from "@/components/Alerts";

const levelStyles: Record<UiAlertType, string> = {
  error: "bg-rose-500/10 border-rose-400/40 text-rose-200",
  warning: "bg-amber-500/10 border-amber-400/40 text-amber-200",
  notification: "bg-orange-500/10 border-orange-400/40 text-orange-200",
  info: "bg-sky-500/10 border-sky-400/40 text-sky-200",
  success: "bg-emerald-500/10 border-emerald-400/40 text-emerald-200",
  system: "bg-fuchsia-500/10 border-fuchsia-400/40 text-fuchsia-200"
};

const simulatedAlerts: Array<{
  id: string;
  type: AlertType;
  level: UiAlertType;
  description: string;
  message: string;
  network: string;
}> = [
  {
    id: "sim-grow",
    type: "GROW_ME",
    level: "success",
    description: "Token $ALICE com RSI 28 e suporte em confluência.",
    message: "🌱 Pullback controlado identificado.",
    network: "ETH"
  },
  {
    id: "sim-hole",
    type: "RABBIT_HOLE",
    level: "warning",
    description: "Volatilidade > 6% em 3 minutos com liquidez estável.",
    message: "⚠️ Perna rápida disponível para scalp.",
    network: "BSC"
  },
  {
    id: "sim-order",
    type: "QUEENS_ORDER",
    level: "system",
    description: "Stop global acionado por drawdown acumulado.",
    message: "♠️ Fluxos bloqueados até revisão.",
    network: "ETH"
  },
  {
    id: "sim-drink",
    type: "DRINK_ME",
    level: "info",
    description: "Novo token auditado com liquidez verificada.",
    message: "🍷 Listagem liberada para triagem.",
    network: "ARB"
  },
  {
    id: "sim-grin",
    type: "CHESHIRES_GRIN",
    level: "error",
    description: "SCAM Score acima de 80% em contrato recém-criado.",
    message: "🚨 Bloqueio recomendado até confirmação.",
    network: "SOL"
  }
];

const pipelineMatrix = [
  {
    name: "White Rabbit • Pocket Watch",
    endpoint: "/api/whiterabbit/pocket_watch",
    status: "OK",
    description: "Feed principal de tokens emergentes com métricas resumidas."
  },
  {
    name: "White Rabbit • Looking Glass",
    endpoint: "/api/whiterabbit/looking_glass",
    status: "OK",
    description: "Atualiza thresholds, contagens e janelas de mercado."
  },
  {
    name: "White Rabbit • Discover",
    endpoint: "/api/whiterabbit/discover",
    status: "OK",
    description: "Snapshot consolidado utilizado pelo dashboard principal."
  },
  {
    name: "Drink Me",
    endpoint: "/api/drink_me/fetch",
    status: "Cron",
    description: "Consulta listagens auditadas e estatísticas de risco por rede."
  },
  {
    name: "Alert Engine",
    endpoint: "/api/alerts/run",
    status: "Manual",
    description: "Gera alertas mock para testes e habilita a fila do laboratório."
  },
  {
    name: "Admin • Users",
    endpoint: "/api/admin/users",
    status: "OK",
    description: "Patch para type/status e sincronização do painel administrativo."
  }
];

const statusBadgeStyles: Record<string, string> = {
  OK: "bg-emerald-500/15 text-emerald-200",
  Cron: "bg-sky-500/15 text-sky-200",
  Manual: "bg-amber-500/15 text-amber-200"
};

export default function AlertsTestPage() {
  const { user } = useAuth();
  const { pushAlert } = useAlerts();
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

  const triggerSimulatedAlert = (id: string) => {
    const simulated = simulatedAlerts.find((alert) => alert.id === id);
    if (!simulated) return;
    pushAlert(simulated.message, simulated.level, simulated.type);
    toast.success(`Alerta ${simulated.type} publicado no topo.`);
  };

  const triggerAllSimulations = () => {
    simulatedAlerts.forEach((alert, index) => {
      setTimeout(() => {
        pushAlert(alert.message, alert.level as keyof typeof levelStyles, alert.type);
      }, index * 400);
    });
    toast.success("Lote de alertas simulados enviado.");
  };

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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold uppercase tracking-[0.25em]">Alertas simulados</h2>
              <p className="mt-1 max-w-xl text-sm text-contrast-muted">
                Utilize estes disparos para validar as animações flutuantes exibidas no dashboard. Todos eles usam o mesmo provider do topo.
              </p>
            </div>
            <button
              onClick={triggerAllSimulations}
              className="rounded-full border border-emerald-400/60 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 transition hover:bg-emerald-500/10"
            >
              Disparar todos
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {simulatedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-2xl border px-4 py-4 ${levelStyles[alert.level] ?? "bg-white/10 border-white/10 text-white"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em]">{alert.network}</p>
                    <h3 className="text-lg font-semibold">{alert.type}</h3>
                  </div>
                  <button
                    onClick={() => triggerSimulatedAlert(alert.id)}
                    className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em] transition hover:border-emerald-400/60"
                  >
                    Disparar
                  </button>
                </div>
                <p className="mt-2 text-sm text-contrast-muted">{alert.description}</p>
              </div>
            ))}
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
          <h2 className="text-2xl font-semibold uppercase tracking-[0.25em]">Matriz de APIs monitoradas</h2>
          <p className="mt-2 text-sm text-contrast-muted">
            Cada endpoint abaixo alimenta módulos diferentes da aplicação. Use esta visão para validar se há rotinas faltando ou que precisam de expansão.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pipelineMatrix.map((pipeline) => (
              <div key={pipeline.endpoint} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em]">{pipeline.name}</p>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${statusBadgeStyles[pipeline.status] ?? "bg-white/10 text-white/70"}`}>
                    {pipeline.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-contrast-muted">{pipeline.description}</p>
                <code className="mt-3 inline-block rounded-full bg-black/40 px-3 py-1 text-[11px] text-emerald-200">{pipeline.endpoint}</code>
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
