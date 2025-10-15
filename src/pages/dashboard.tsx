import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps, NextApiRequest, NextApiResponse } from "next";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import SectionTitle from "@/components/SectionTitle";
import AlertaCard from "@/components/AlertaCard";
import TokenMonitorCard from "@/components/TokenMonitorCards";
import { useAlerts } from "@/components/Alerts";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import type { AlertLogItem, SessionUser } from "@/types";
import { authOptions } from "@/lib/auth/nextAuthOptions";
import {
  AiOutlineRadarChart,
  AiFillSound,
  AiOutlineTags,
  AiFillPieChart
} from "react-icons/ai";
import { GiBrain, GiRabbit } from "react-icons/gi";
import { FaCompass } from "react-icons/fa";
import { BsFillLightningFill } from "react-icons/bs";
import { GiPotionBall, GiQueenCrown, GiRabbit as GiRabbitAlt, GiAlarmClock, GiMineExplosion } from "react-icons/gi";

interface DashboardPageProps {
  session?: Session | null;
}

const floatingAlerts = [
  { type: "info" as AlertLevel, title: "WHITE RABBIT", message: "Novo token detectado em tempo real." },
  { type: "success" as AlertLevel, title: "GROW_ME", message: "Token $ALICE em zona de suporte com RSI baixo." },
  { type: "warning" as AlertLevel, title: "RABBIT_HOLE", message: "Volatilidade detectada para scalp rápido." },
  { type: "error" as AlertLevel, title: "CHESHIRES_GRIN", message: "SCAM Score elevado em novo token." },
  { type: "system" as AlertLevel, title: "QUEENS_ORDER", message: "Stop global ativado por perda de capital." }
];

const orchestrationChecklist = [
  { title: "Pocket Watch", description: "Varredura multi-chain de emergentes com filtros anti-rug.", icon: "🕰️" },
  { title: "Looking Glass", description: "Atualiza thresholds, z-scores e clusters quantitativos.", icon: "🔍" },
  { title: "Drink Me", description: "Integra oráculo de listagens auditadas e liquidez verificada.", icon: "🧪" }
];

const verifiers = [
  { emoji: "🐇", nome: "WHITE RABBIT", desc: "Coleta dados multi-chain em tempo real via WebSocket/API." },
  { emoji: "😼", nome: "CHESHIRE CAT", desc: "Pontua riscos e SCAM Score em contratos recém-criados." },
  { emoji: "🎩", nome: "MAD HATTER", desc: "Identifica volatilidade extrema e padrões de pump." },
  { emoji: "♥️", nome: "QUEEN OF HEARTS", desc: "Gerencia stops globais e congelamento de operações." },
  { emoji: "🐛", nome: "CATERPILLAR", desc: "Executa análise técnica (RSI, Fibonacci e Liquidez)." },
  { emoji: "🐢", nome: "MOCK TURTLE", desc: "Realiza backtests contínuos de Setups vencedores." }
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

const marketPulse = [
  { token: "$BTC", value: "+2.5%", description: "Momentum positivo em 24h", color: "text-emerald-400" },
  { token: "$ETH", value: "-1.2%", description: "Correção após rally", color: "text-rose-400" },
  { token: "$ALICE", value: "0.0%", description: "Consolidação estável", color: "text-amber-300" }
];

type AlertLevel = "info" | "success" | "warning" | "error" | "system";

interface AlertCardTemplate {
  key: string;
  title: string;
  text: string;
  level: AlertLevel;
  icon?: ReactNode;
  colorClass?: string;
  borderClass?: string;
  delay?: number;
}

const levelThemeMap: Record<AlertLevel, { icon: ReactNode; colorClass: string; borderClass: string }> = {
  info: {
    icon: <GiAlarmClock className="text-sky-300" />,
    colorClass: "bg-sky-500/10",
    borderClass: "border-sky-400/40"
  },
  success: {
    icon: <GiPotionBall className="text-emerald-300" />,
    colorClass: "bg-emerald-500/10",
    borderClass: "border-emerald-400/40"
  },
  warning: {
    icon: <BsFillLightningFill className="text-amber-300" />,
    colorClass: "bg-amber-500/10",
    borderClass: "border-amber-400/40"
  },
  error: {
    icon: <GiMineExplosion className="text-rose-300" />,
    colorClass: "bg-rose-500/10",
    borderClass: "border-rose-400/40"
  },
  system: {
    icon: <GiQueenCrown className="text-fuchsia-300" />,
    colorClass: "bg-fuchsia-500/10",
    borderClass: "border-fuchsia-400/40"
  }
};

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
    icon: <GiRabbitAlt className="text-amber-300" />
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

const quickLinks = [
  { label: "Alert Lab", href: "/alerts-test", description: "Testes controlados e QA dos disparos." },
  { label: "Drink Station", href: "/drink", description: "Tokens monitorados e filtros dinâmicos." }
];

export default function DashboardPage() {
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
        <title>Dashboard • Checkmate</title>
      </Head>
      <div className="space-y-12">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="theme-glass rounded-3xl border px-10 py-10 shadow-lg">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <SectionTitle title="Resumo operacional" icon={<FaCompass />} />
                <p className="mt-2 text-sm text-contrast-muted">
                  Visão consolidada dos scanners ativos, status do sistema e checklist da última sincronização.
                </p>
              </div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-contrast-muted transition hover:border-emerald-400/60 hover:text-white"
              >
                Requer governança?
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {heroMetrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-white/10 bg-black/20 p-4 shadow-inner">
                  <p className="text-xs uppercase tracking-[0.3em] text-contrast-muted">{metric.label}</p>
                  <p className="mt-2 text-3xl font-bold text-white">{metric.value}</p>
                  <p className="mt-1 text-xs text-contrast-muted">{metric.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
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
            <div className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
              <SectionTitle title="Atalhos rápidos" icon={<GiRabbit />} />
              <ul className="mt-4 space-y-3 text-sm">
                {quickLinks.map((link) => (
                  <li key={link.href} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-contrast-muted">{link.label}</p>
                      <p className="mt-1 text-xs text-contrast-muted">{link.description}</p>
                    </div>
                    <Link
                      href={link.href}
                      className="rounded-full border border-emerald-400/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 transition hover:bg-emerald-500/10"
                    >
                      Abrir
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
              <SectionTitle title="Market pulse" icon={<AiOutlineRadarChart />} />
              <div className="mt-6 grid gap-4">
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
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)]">
          <div className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
            <SectionTitle title="📢 Alertas ativos" icon={<AiFillSound />} />
            <p className="mt-2 text-sm text-contrast-muted">
              Visualização rápida dos alertas mais recentes vindos do motor. Use o laboratório para confirmar a resolução.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {alertCards.map(({ key, icon, title, text, colorClass = "", borderClass = "", delay }) => (
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

          <div className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
            <SectionTitle title="🐇 WHITE RABBIT – Tokens monitorados" icon={<GiRabbit />} />
            <div className="mt-4">
              <TokenMonitorCard className="p-0" />
            </div>
          </div>
        </section>

        <section className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
          <SectionTitle title="🔌 APIs e módulos" icon={<FaCompass />} />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { name: "White Rabbit", description: "Feeds em tempo real para pocket watch, looking glass e discover." },
              { name: "Drink Me", description: "Listagens auditadas com filtros de risco e liquidez." },
              { name: "Alert Engine", description: "Criação, log e resolução dos alertas quantitativos." },
              { name: "Sistema & Admin", description: "Status global, controle de manutenção e governança." }
            ].map((module) => (
              <div key={module.name} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-lg font-semibold text-white">{module.name}</div>
                <p className="mt-2 text-sm text-contrast-muted">{module.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
            <SectionTitle title="🧠 Sistemas de verificação" icon={<GiBrain />} />
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
                  <h3 className="text-lg font-semibold">
                    {emoji} {nome}
                  </h3>
                  <p className="mt-1 text-sm text-contrast-muted">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
            <SectionTitle title="🧭 Tipos de alerta" icon={<FaCompass />} />
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
            <SectionTitle title="🏷️ Badges de risco" icon={<AiOutlineTags />} />
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
            <SectionTitle title="📊 Tiers de operação" icon={<AiFillPieChart />} />
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

export const getServerSideProps: GetServerSideProps<DashboardPageProps> = async (context) => {
  const session = await getServerSession(
    context.req as NextApiRequest,
    context.res as NextApiResponse,
    authOptions
  );
  const sessionUser = session?.user as SessionUser | undefined;

  if (!sessionUser) {
    return {
      redirect: {
        destination: `/auth/signin?callbackUrl=${encodeURIComponent("/dashboard")}`,
        permanent: false
      }
    };
  }

  return {
    props: {
      session
    }
  };
};
