import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import SectionTitle from "../components/SectionTitle";
import AlertaCard from "../components/AlertaCard";
import {
  AiOutlineRadarChart,
  AiFillSound,
  AiOutlineTags,
  AiFillPieChart
} from "react-icons/ai";
import {
  GiBrain,
  GiRabbit,
  GiAlarmClock,
  GiMineExplosion,
  GiPotionBall,
  GiQueenCrown
} from "react-icons/gi";
import { BsFillLightningFill } from "react-icons/bs";
import { motion } from "framer-motion";
import {
  FaCompass,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCog,
  FaBell,
  FaServer,
  FaTools,
  FaShieldAlt
} from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";
import TokenMonitorCard from "../components/TokenMonitorCards";
import RunAllPanel from "../components/RunAllPanel";
import { useAlerts } from "@/components/Alerts";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import type { AlertLogItem } from "@/types";

type AlertLevel = "info" | "success" | "warning" | "error" | "system";

type AlertCardTemplate = {
  key: string;
  title: string;
  text: string;
  level: AlertLevel;
  icon?: ReactNode;
  colorClass?: string;
  borderClass?: string;
  delay?: number;
};

const levelThemeMap: Record<AlertLevel, { icon: ReactNode; colorClass: string; borderClass: string }> = {
  info: {
    icon: <FaInfoCircle className="text-sky-300" />,
    colorClass: "bg-sky-500/10",
    borderClass: "border-sky-400/40"
  },
  success: {
    icon: <FaCheckCircle className="text-emerald-300" />,
    colorClass: "bg-emerald-500/10",
    borderClass: "border-emerald-400/40"
  },
  warning: {
    icon: <FaExclamationTriangle className="text-amber-300" />,
    colorClass: "bg-amber-500/10",
    borderClass: "border-amber-400/40"
  },
  error: {
    icon: <FaTimesCircle className="text-rose-300" />,
    colorClass: "bg-rose-500/10",
    borderClass: "border-rose-400/40"
  },
  system: {
    icon: <FaCog className="text-fuchsia-300" />,
    colorClass: "bg-fuchsia-500/10",
    borderClass: "border-fuchsia-400/40"
  }
};

const floatingAlerts = [
  { type: "info" as AlertLevel, title: "WHITE RABBIT", message: "Novo token detectado em tempo real." },
  { type: "success" as AlertLevel, title: "GROW_ME", message: "Token $ALICE em zona de suporte com RSI baixo." },
  { type: "warning" as AlertLevel, title: "RABBIT_HOLE", message: "Volatilidade detectada para scalp rápido." },
  { type: "error" as AlertLevel, title: "CHESHIRES_GRIN", message: "SCAM Score elevado em novo token." },
  { type: "system" as AlertLevel, title: "QUEENS_ORDER", message: "Stop global ativado por perda de capital." }
];

const fallbackAlertTemplates: AlertCardTemplate[] = [
  {
    key: "grow-me",
    title: "GROW_ME",
    text: "🌱 Hora de crescer! Token: $ALICE — RSI: 28 — Suporte detectado.",
    level: "success",
    icon: <GiPotionBall className="text-emerald-300" />
  },
  {
    key: "rabbit-hole",
    title: "RABBIT_HOLE",
    text: "🕳️ Entrada rápida! Volatilidade +5% em 2min — Spread ajustado.",
    level: "warning",
    icon: <GiRabbit className="text-amber-300" />
  },
  {
    key: "queens-order",
    title: "QUEENS_ORDER",
    text: "♠️ Stop global ativado! Perda acumulada superior a 10%.",
    level: "system",
    icon: <GiQueenCrown className="text-rose-300" />
  },
  {
    key: "drink-me",
    title: "DRINK_ME",
    text: "🍷 Listagem recente com liquidez verificada e auditoria automática.",
    level: "info",
    icon: <GiAlarmClock className="text-sky-300" />
  },
  {
    key: "eat-me",
    title: "EAT_ME",
    text: "⚡ Pump detectado! Preço subiu +17% em 4min.",
    level: "warning",
    icon: <BsFillLightningFill className="text-fuchsia-300" />
  },
  {
    key: "cheshire",
    title: "CHESHIRES_GRIN",
    text: "⚠️ SCAM Score acima de 80%! Risco elevado.",
    level: "error",
    icon: <GiMineExplosion className="text-purple-300" />
  }
];

const orchestrationChecklist = [
  {
    title: "Pocket Watch",
    description: "Varredura multi-chain de emergentes com filtros anti-rug.",
    icon: "🕰️"
  },
  {
    title: "Looking Glass",
    description: "Atualiza thresholds, z-scores e clusters quantitativos.",
    icon: "🔍"
  },
  {
    title: "Drink Me",
    description: "Integra oráculo de listagens auditadas e liquidez verificada.",
    icon: "🧪"
  }
];

const apiModules = [
  {
    name: "White Rabbit",
    description: "Feeds de monitoramento em tempo real (pocket watch, looking glass, discover).",
    icon: <GiRabbit className="text-emerald-300" />,
    endpoints: ["/api/whiterabbit/pocket_watch", "/api/whiterabbit/looking_glass", "/api/whiterabbit/discover"]
  },
  {
    name: "Drink Me",
    description: "Consulta listagens auditadas, golden opportunities e estatísticas de risco.",
    icon: <GiPotionBall className="text-sky-300" />,
    endpoints: ["/api/drink_me/fetch", "/api/potions/catalog"]
  },
  {
    name: "Alert Engine",
    description: "Criação, log e resolução dos alertas quant. Base para o lab de QA.",
    icon: <FaBell className="text-amber-300" />,
    endpoints: ["/api/alerts/run", "/api/alerts/log", "/api/alerts/resolve"]
  },
  {
    name: "Sistema & Admin",
    description: "Status global, controle de manutenção e gestão de usuários.",
    icon: <FaServer className="text-fuchsia-300" />,
    endpoints: ["/api/system/status", "/api/admin/users", "/admin"]
  }
];

const verifiers = [
  { emoji: "🐇", nome: "WHITE RABBIT", desc: "Coleta dados multi-chain em tempo real via WebSocket/API." },
  { emoji: "😼", nome: "CHESHIRE CAT", desc: "Pontua riscos e SCAM Score em contratos recém-criados." },
  { emoji: "🎩", nome: "MAD HATTER", desc: "Identifica volatilidade extrema e padrões de pump." },
  { emoji: "♥️", nome: "QUEEN OF HEARTS", desc: "Gerencia stops globais e congelamento de operações." },
  { emoji: "🐛", nome: "CATERPILLAR", desc: "Executa análise técnica (RSI, Fibonacci e Liquidez)." },
  { emoji: "🐢", nome: "MOCK TURTLE", desc: "Realiza backtests contínuos de setups vencedores." }
];

const alertTypes = [
  ["🍷 DRINK_ME", "Novo Token listado com liquidez saudável."],
  ["🍰 EAT_ME", "Pump acima de 15% em 5 minutos."],
  ["🌱 GROW_ME", "RSI abaixo de 30 sinalizando suporte."],
  ["🍪 SHRINK_ME", "RSI acima de 70 em resistência relevante."],
  ["🕳️ RABBIT_HOLE", "Volatilidade extrema para scalp estratégico."],
  ["🫖 TEA_PARTY", "Zona de acumulação com RSI inferior a 35."],
  ["♟️ CHECKMATE", "Sinal de oportunidade multi-indicadores."]
];

const riskBadges = [
  ["🔴 SCAM HIGH", "Contrato não verificado + liquidez solta + owner >30%."],
  ["🟠 SCAM MEDIUM", "Liquidez inferior a 50% ou owner não renunciado."],
  ["🟢 SCAM LOW", "Contrato verificado + liquidez travada + owner renunciado."],
  ["🟡 PUMP POTENTIAL", "Volume 5x acima da média aliado a RSI < 35."],
  ["🟣 DUMP WARNING", "Queda >10% em 15min + funding negativo."],
  ["🔵 SMART MONEY IN", "Wallets institucionais movimentando > $100k."],
  ["⚫ BLACK SWAN", "Eventos macro que impactam derivativos."],
  ["🟩 RECOVERY", "Retomada após liquidação agressiva."]
];

const tiers = [
  ["Micro", "$0.50 – $5", "0.5–2%", "🔴"],
  ["Standard", "$1 – $10", "1–3%", "🟠"],
  ["Premium", "$5 – $50", "2–5%", "🟢"],
  ["Institutional", ">$50", "3–8%", "🟣"]
];

const watchers = [
  {
    name: "Pocket Watch",
    summary: "Agrega tokens emergentes e suas métricas principais.",
    endpoint: "/api/whiterabbit/pocket_watch"
  },
  {
    name: "Looking Glass",
    summary: "Atualiza thresholds estatísticos com base no mercado.",
    endpoint: "/api/whiterabbit/looking_glass"
  },
  {
    name: "Discover",
    summary: "Snapshot consolidado para dashboards e rankings.",
    endpoint: "/api/whiterabbit/discover"
  },
  {
    name: "Drink Me",
    summary: "Listagens auditadas e métricas de risco agregadas.",
    endpoint: "/api/drink_me/fetch"
  },
  {
    name: "Alert Cron",
    summary: "Gera e resolve alertas para o laboratório de QA.",
    endpoint: "/api/alerts/run"
  }
];

const marketPulse = [
  { token: "$BTC", value: "+2.5%", description: "Momentum positivo em 24h", color: "text-emerald-400" },
  { token: "$ETH", value: "-1.2%", description: "Correção após rally", color: "text-rose-400" },
  { token: "$ALICE", value: "0.0%", description: "Consolidação estável", color: "text-amber-300" }
];

export default function Home() {
  const { pushAlert } = useAlerts();
  const { status: systemStatus, loading: systemStatusLoading } = useSystemStatus();
  const [liveAlerts, setLiveAlerts] = useState<AlertLogItem[]>([]);
  const [fetchingAlerts, setFetchingAlerts] = useState(false);

  useEffect(() => {
    let iteration = 0;
    const timer = setInterval(() => {
      const sample = floatingAlerts[iteration % floatingAlerts.length];
      pushAlert(sample.message, sample.type, sample.title);
      iteration += 1;
      if (iteration >= floatingAlerts.length * 2) {
        clearInterval(timer);
      }
    }, 3600);

    return () => clearInterval(timer);
  }, [pushAlert]);

  useEffect(() => {
    let active = true;

    const loadAlerts = async () => {
      setFetchingAlerts(true);
      try {
        const response = await fetch("/api/alerts/log?limit=6");
        if (!response.ok) {
          throw new Error("Falha ao carregar alertas");
        }
        const data = await response.json();
        if (active) {
          setLiveAlerts(Array.isArray(data.alerts) ? data.alerts : []);
        }
      } catch (error) {
        console.error("Não foi possível buscar alertas recentes", error);
        if (active) {
          setLiveAlerts([]);
        }
      } finally {
        if (active) {
          setFetchingAlerts(false);
        }
      }
    };

    loadAlerts();
    const interval = setInterval(loadAlerts, 60_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const activeAlertsCount = useMemo(
    () => liveAlerts.filter((alert) => !alert.resolved).length,
    [liveAlerts]
  );

  const heroMetrics = [
    {
      label: "Scanners ativos",
      value: "04",
      description: "Pocket Watch, Looking Glass, Drink Me e Discover"
    },
    {
      label: "Alertas em triagem",
      value: (liveAlerts.length > 0 ? activeAlertsCount : fallbackAlertTemplates.length)
        .toString()
        .padStart(2, "0"),
      description: fetchingAlerts ? "Atualizando feed em tempo real" : "Integração com Alert Engine"
    },
    {
      label: "Cobertura de redes",
      value: "05",
      description: "ETH • BSC • SOL • ARB • MATIC"
    },
    {
      label: "Status do sistema",
      value: systemStatusLoading ? "..." : systemStatus?.label ?? "--",
      description: systemStatus?.message ?? "Monitoramento central"
    }
  ];

  const alertCards: AlertCardTemplate[] = (liveAlerts.length > 0
    ? liveAlerts.map((alert) => {
        const theme = levelThemeMap[alert.level];
        return {
          key: alert.id,
          title: `${alert.type} • ${alert.subtype}`,
          text: `${alert.description} • Rede ${alert.network} • ${alert.resolved ? "Resolvido" : "Ativo"}`,
          level: alert.level,
          icon: theme.icon,
          colorClass: theme.colorClass,
          borderClass: theme.borderClass
        } satisfies AlertCardTemplate;
      })
    : fallbackAlertTemplates).map((item, index) => {
    const theme = levelThemeMap[item.level];
    return {
      ...item,
      icon: item.icon ?? theme.icon,
      colorClass: item.colorClass ?? theme.colorClass,
      borderClass: item.borderClass ?? theme.borderClass,
      delay: index * 0.05
    };
  });

  return (
    <>
      <Head>
        <title>Checkmate Intelligence</title>
      </Head>
      <div className="space-y-12">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)]">
          <div className="theme-glass rounded-3xl border px-10 py-12 shadow-lg">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl space-y-6">
                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">
                  Wonderland Quant Deck
                </span>
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                    🎩 Automação tática para <span className="text-emerald-300">operadores cripto</span>
                  </h1>
                  <p className="text-lg text-contrast-muted">
                    Combine scanners, sinais e controles de risco em um cockpit único. O Checkmate orquestra alertas temáticos com narrativa de Wonderland e profundidade quantitativa.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="#runall"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-black shadow-lg shadow-emerald-500/30 transition hover:translate-y-[-1px] hover:bg-emerald-400"
                  >
                    Rodar agora <FiArrowUpRight />
                  </a>
                  <Link
                    href="/alerts-test"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-contrast-muted transition hover:border-emerald-400/60 hover:text-white"
                  >
                    Ver alert lab <FiArrowUpRight />
                  </Link>
                </div>
              </div>
              <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
                {heroMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 shadow-inner"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-contrast-muted">{metric.label}</p>
                    <p className="mt-2 text-3xl font-bold text-white">{metric.value}</p>
                    <p className="mt-1 text-xs text-contrast-muted">{metric.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {orchestrationChecklist.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-2xl">{item.icon}</p>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em]">{item.title}</p>
                  <p className="mt-2 text-sm text-contrast-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div id="runall" className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <SectionTitle title="🧩 Orquestração Wonderland" icon={<FaTools />} />
              </div>
              <div className="mt-4">
                <RunAllPanel />
              </div>
            </div>

            <div className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <SectionTitle title="🛡️ Governança & Admin" icon={<FaShieldAlt />} />
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-400/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 transition hover:bg-emerald-500/10"
                >
                  Abrir painel <FiArrowUpRight />
                </Link>
              </div>
              <p className="mt-3 text-sm text-contrast-muted">
                Ajuste mensagens de manutenção, libere usuários e acompanhe o status global da plataforma. Toda alteração reflete instantaneamente nos clientes conectados.
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                {watchers.map((item) => (
                  <li key={item.endpoint} className="flex flex-col rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold uppercase tracking-[0.2em] text-white">{item.name}</span>
                      <code className="rounded-full bg-black/40 px-3 py-1 text-[11px] text-emerald-200">{item.endpoint}</code>
                    </div>
                    <p className="mt-2 text-xs text-contrast-muted">{item.summary}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)]">
          <div className="space-y-6">
            <div className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
              <SectionTitle title="📡 Pulse de Mercado" icon={<AiOutlineRadarChart />} />
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {marketPulse.map(({ token, value, description, color }) => (
                  <motion.div
                    key={token}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <p className="text-xs uppercase tracking-wide text-contrast-muted">Token</p>
                    <h3 className="text-xl font-bold">{token}</h3>
                    <p className={`${color} mt-1 font-semibold`}>{value}</p>
                    <p className="mt-2 text-xs text-contrast-muted">{description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
              <SectionTitle title="📢 Alertas Ativos" icon={<AiFillSound />} />
              <p className="mt-2 text-sm text-contrast-muted">
                Visualização rápida dos alertas mais recentes vindos do motor. Use o laboratório para confirmar a resolução.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {alertCards.map(({ key, icon, title, text, colorClass, borderClass, delay }) => (
                  <AlertaCard
                    key={key}
                    icon={icon}
                    title={title}
                    text={text}
                    colorClass={colorClass}
                    borderClass={borderClass}
                    delay={delay}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
            <SectionTitle title="🐇 WHITE RABBIT – Tokens Monitorados" icon={<GiRabbit />} />
            <div className="mt-4">
              <TokenMonitorCard className="p-0" />
            </div>
          </div>
        </section>

        <section className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
          <SectionTitle title="🔌 APIs e módulos" icon={<FaServer />} />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {apiModules.map((module) => (
              <div key={module.name} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-white">
                  {module.icon}
                  {module.name}
                </div>
                <p className="mt-2 text-sm text-contrast-muted">{module.description}</p>
                <ul className="mt-3 space-y-2 text-[11px] text-emerald-200">
                  {module.endpoints.map((endpoint) => (
                    <li key={endpoint} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      <code>{endpoint}</code>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
            <SectionTitle title="🧠 Sistemas de Verificação" icon={<GiBrain />} />
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {verifiers.map(({ emoji, nome, desc }) => (
                <motion.div
                  key={nome}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35 }}
                >
                  <h3 className="text-lg font-semibold">{emoji} {nome}</h3>
                  <p className="mt-1 text-sm text-contrast-muted">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
            <SectionTitle title="🧭 Tipos de Alerta" icon={<FaCompass />} />
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {alertTypes.map(([nome, desc]) => (
                <motion.div
                  key={nome}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35 }}
                >
                  <h3 className="text-lg font-semibold">{nome}</h3>
                  <p className="mt-1 text-sm text-contrast-muted">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
            <SectionTitle title="🏷️ Badges de Risco" icon={<AiOutlineTags />} />
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {riskBadges.map(([badge, desc]) => (
                <motion.div
                  key={badge}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35 }}
                >
                  <h3 className="text-lg font-semibold">{badge}</h3>
                  <p className="mt-1 text-sm text-contrast-muted">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
            <SectionTitle title="📊 Tiers de Operação" icon={<AiFillPieChart />} />
            <table className="mt-6 w-full overflow-hidden rounded-2xl text-sm">
              <thead className="bg-black/30 text-left text-xs uppercase tracking-wide text-contrast-muted">
                <tr>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Alocação</th>
                  <th className="px-4 py-3">Risco</th>
                </tr>
              </thead>
              <tbody className="bg-black/10">
                {tiers.map(([tier, valor, alocacao, risco]) => (
                  <tr key={tier} className="border-t border-white/5">
                    <td className="px-4 py-3 font-semibold">{tier}</td>
                    <td className="px-4 py-3 text-contrast-muted">{valor}</td>
                    <td className="px-4 py-3 text-contrast-muted">{alocacao}</td>
                    <td className="px-4 py-3 text-xl">{risco}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
