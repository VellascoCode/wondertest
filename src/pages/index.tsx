import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import { motion } from "framer-motion";
import SectionTitle from "@/components/SectionTitle";
import AlertaCard from "@/components/AlertaCard";
import TokenMonitorCard from "@/components/TokenMonitorCards";
import RunAllPanel from "@/components/RunAllPanel";
import { AiFillPieChart, AiOutlineRadarChart } from "react-icons/ai";
import {
  GiAlarmClock,
  GiBrain,
  GiMineExplosion,
  GiPotionBall,
  GiQueenCrown,
  GiRabbit
} from "react-icons/gi";
import { BsFillLightningFill } from "react-icons/bs";
import {
  FaBell,
  FaChartLine,
  FaCompass,
  FaCrown,
  FaFeatherAlt,
  FaGlobe,
  FaServer,
  FaShieldAlt,
  FaTools,
  FaUsersCog
} from "react-icons/fa";
import { FiArrowRight, FiArrowUpRight, FiCheckCircle, FiPlayCircle } from "react-icons/fi";
import { useAlerts } from "@/components/Alerts";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { useAuth } from "@/context/AuthContext";
import type { AlertLogItem } from "@/types";

type AlertLevel = "info" | "success" | "warning" | "error" | "system";

type AlertCardTemplate = {
  key: string;
  title: string;
  text: string;
  level: AlertLevel;
  colorClass?: string;
  borderClass?: string;
  icon?: ReactElement;
  delay?: number;
};

const levelThemeMap: Record<
  AlertLevel,
  { icon: ReactElement; colorClass: string; borderClass: string }
> = {
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
    icon: <FaShieldAlt className="text-fuchsia-300" />,
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
    level: "success"
  },
  {
    key: "rabbit-hole",
    title: "RABBIT_HOLE",
    text: "🕳️ Entrada rápida! Volatilidade +5% em 2min — Spread ajustado.",
    level: "warning"
  },
  {
    key: "queens-order",
    title: "QUEENS_ORDER",
    text: "♠️ Stop global ativado! Perda acumulada superior a 10%.",
    level: "system"
  },
  {
    key: "drink-me",
    title: "DRINK_ME",
    text: "🍷 Listagem recente com liquidez verificada e auditoria automática.",
    level: "info"
  },
  {
    key: "eat-me",
    title: "EAT_ME",
    text: "⚡ Pump detectado! Preço subiu +17% em 4min.",
    level: "warning"
  },
  {
    key: "cheshire",
    title: "CHESHIRES_GRIN",
    text: "⚠️ SCAM Score acima de 80%! Risco elevado.",
    level: "error"
  }
];

const commandSectors = [
  {
    title: "Observatório do Coelho Branco",
    description: "Varredura multi-chain com curadoria automática, correlação macro e filtros anti-rug.",
    accent: "from-emerald-400/30 via-sky-500/20 to-indigo-500/20",
    promptId: "hero-rabbit"
  },
  {
    title: "Quartel da Rainha",
    description: "Governança de risco, tiers configuráveis e manutenção global orquestrada.",
    accent: "from-rose-400/30 via-fuchsia-500/20 to-amber-500/20",
    promptId: "queen-guardian"
  },
  {
    title: "Laboratório do Alquimista",
    description: "Simulações quantitativas, scorecards e backtests que alimentam o motor de alertas.",
    accent: "from-violet-400/30 via-purple-500/20 to-blue-500/20",
    promptId: "alchemist-lab"
  }
];

const storylineBeats = [
  {
    title: "1. Rastreamento vivo",
    description:
      "O Coelho Branco acompanha blockchains, liquidez e derivativos, disparando gatilhos quando o relógio acusa anomalias.",
    accent: "from-emerald-400/20 via-emerald-500/10 to-transparent"
  },
  {
    title: "2. Curadoria temática",
    description:
      "Cheshire e Queen of Hearts aplicam políticas, tiers e SCAM Score antes do alerta chegar ao cockpit.",
    accent: "from-rose-400/20 via-fuchsia-500/10 to-transparent"
  },
  {
    title: "3. Execução guiada",
    description:
      "Alert Engine entrega contexto acionável para cards, APIs e integrações externas com SLA controlado.",
    accent: "from-sky-400/20 via-indigo-500/10 to-transparent"
  },
  {
    title: "4. Retroalimentação",
    description:
      "Mock Turtle registra métricas, fecha a operação e alimenta scorecards para a próxima rodada.",
    accent: "from-violet-400/20 via-purple-500/10 to-transparent"
  }
];

const guardians = [
  { icon: "🐇", name: "WHITE RABBIT", description: "Sentinela em tempo real (feeds + heurísticas anti-rug)." },
  { icon: "😼", name: "CHESHIRE CAT", description: "Analisa liquidez, contratos e SCAM Score." },
  { icon: "🎩", name: "MAD HATTER", description: "Escuta volatilidade extrema para scalps controlados." },
  { icon: "♥️", name: "QUEEN OF HEARTS", description: "Aplica travas globais e bloqueios de emergência." },
  { icon: "🐛", name: "CATERPILLAR", description: "Calcula RSI, Fibonacci e clusters de preço." },
  { icon: "🐢", name: "MOCK TURTLE", description: "Audita resultados e mantém scorecards históricos." }
];

const integrationMatrix = [
  {
    name: "White Rabbit",
    icon: <GiRabbit className="text-emerald-300 text-xl" />,
    description: "Pocket Watch, Looking Glass e Discover em um hub único.",
    endpoints: ["/api/whiterabbit/pocket_watch", "/api/whiterabbit/looking_glass", "/api/whiterabbit/discover"]
  },
  {
    name: "Drink Me",
    icon: <GiPotionBall className="text-sky-300 text-xl" />,
    description: "Listagens auditadas, métricas de risco e filtros temáticos.",
    endpoints: ["/api/drink_me/fetch", "/api/potions/catalog"]
  },
  {
    name: "Alert Engine",
    icon: <FaBell className="text-amber-300 text-xl" />,
    description: "Geração, log e resolução de alertas cinematográficos.",
    endpoints: ["/api/alerts/run", "/api/alerts/log", "/api/alerts/resolve"]
  },
  {
    name: "Sistema & Admin",
    icon: <FaServer className="text-fuchsia-300 text-xl" />,
    description: "Status global, gestão de usuários e manutenção temática.",
    endpoints: ["/api/system/status", "/api/admin/users", "/admin"]
  }
];

const artPrompts = [
  {
    id: "hero-rabbit",
    title: "Observatório do Coelho Branco",
    usage: "Hero background e cards principais",
    prompt:
      "Ultra-detailed anime illustration of a cyberpunk white rabbit sentinel in a crystal observatory, glowing holographic clocks, teal and indigo lighting, cinematic lighting, volumetric fog, particles, dynamic angle, studio quality"
  },
  {
    id: "queen-guardian",
    title: "Quartel da Rainha",
    usage: "Sessão de governança e cards administrativos",
    prompt:
      "Regal anime queen of hearts in futuristic war room, golden holographic dashboards, crimson and magenta light, ornate armor, intricate details, dramatic rim lighting, 4k concept art"
  },
  {
    id: "alchemist-lab",
    title: "Laboratório do Alquimista",
    usage: "Sessão de laboratório e pipelines quantitativos",
    prompt:
      "Fantastical anime alchemist mixing glowing potions inside a high-tech laboratory, floating formulas, sapphire and violet palette, soft bloom, cinematic composition, painterly textures"
  },
  {
    id: "runall-atrium",
    title: "Atrium de Orquestração",
    usage: "Painel `/api/runall` e destaque final",
    prompt:
      "Wide shot anime scene of a control atrium with floating monitors, steampunk consoles, characters coordinating data streams, turquoise and amethyst lighting, depth of field, ultra high resolution"
  }
];

const badgeGlossary = [
  {
    label: "Smart Money",
    description: "Detecta baleias e carteiras institucionais entrando no ativo.",
    emoji: "💰"
  },
  {
    label: "SCAM Score",
    description: "Score de risco baseado em liquidez, owner e auditorias automáticas.",
    emoji: "🔒"
  },
  {
    label: "Pump Potential",
    description: "Volume + momentum acima dos thresholds estatísticos.",
    emoji: "⚡"
  },
  {
    label: "Black Swan",
    description: "Eventos macro ou on-chain com impacto global.",
    emoji: "🦢"
  }
];

type HeroMetric = {
  label: string;
  value: string;
  description: string;
};

function useLandingData(): { heroMetrics: HeroMetric[]; alertCards: AlertCardTemplate[] } {
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

  const heroMetrics = useMemo(
    () => [
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
    ],
    [activeAlertsCount, fetchingAlerts, liveAlerts.length, systemStatus?.label, systemStatus?.message, systemStatusLoading]
  );

  const alertCards: AlertCardTemplate[] = useMemo(() => {
    const source = liveAlerts.length > 0 ? liveAlerts : fallbackAlertTemplates;

    return source.map((item, index) => {
      if ("level" in item && "text" in item) {
        const theme = levelThemeMap[item.level as AlertLevel];
        return {
          key: item.key,
          title: item.title,
          text: item.text,
          level: item.level,
          colorClass: theme.colorClass,
          borderClass: theme.borderClass,
          icon: theme.icon,
          delay: index * 0.08
        } satisfies AlertCardTemplate;
      }

      const theme = levelThemeMap[item.level];
      return {
        key: item.id,
        title: `${item.type} • ${item.subtype}`,
        text: `${item.description} • Rede ${item.network} • ${item.resolved ? "Resolvido" : "Ativo"}`,
        level: item.level,
        colorClass: theme.colorClass,
        borderClass: theme.borderClass,
        icon: theme.icon,
        delay: index * 0.08
      } satisfies AlertCardTemplate;
    });
  }, [liveAlerts]);

  return { heroMetrics, alertCards };
}

const featurePillars = [
  {
    title: "Pipeline orquestrado",
    description:
      "Combine scanners on-chain, análise quantitativa e governança em um único cockpit com checkpoints auditáveis.",
    icon: <FaChartLine className="text-emerald-300" />
  },
  {
    title: "Segurança operacional",
    description:
      "Controles de manutenção, bloqueios da Rainha de Copas e trilhas de auditoria integradas em todas as rotas críticas.",
    icon: <FaShieldAlt className="text-sky-300" />
  },
  {
    title: "Colaboração em Wonderland",
    description:
      "Organize equipes, compartilhe insights e ofereça experiências temáticas sem perder o foco nos dados reais.",
    icon: <FaUsersCog className="text-fuchsia-300" />
  }
];

const credibilityStats = [
  {
    label: "Rotinas automatizadas",
    value: "12",
    description: "Jobs agendados entre scanners, alertas e governança"
  },
  {
    label: "Mercados monitorados",
    value: "5",
    description: "ETH • BSC • SOL • ARB • MATIC"
  },
  {
    label: "Tempo médio de reação",
    value: "< 40s",
    description: "Da detecção ao alerta publicado"
  }
];

const journeySteps = [
  {
    title: "Observe o relógio do coelho",
    text: "Colete históricos, TVL e dados sociais com redundância de provedores.",
    accent: "🕰️"
  },
  {
    title: "Ajuste a governança",
    text: "Defina políticas, whitelists e travas globais direto do painel administrativo.",
    accent: "♟️"
  },
  {
    title: "Dispare alertas confiáveis",
    text: "Receba notificações temáticas com metadados completos para agir rápido.",
    accent: "⚡"
  }
];

const quantModules = [
  {
    title: "White Rabbit",
    summary: "Varredura de mercado com múltiplos fornecedores de preço e risco.",
    highlights: ["Pocket Watch", "Looking Glass", "Discover"]
  },
  {
    title: "Drink Me",
    summary: "Tokens recém-descobertos com score de qualidade e badges de segurança.",
    highlights: ["Risk tiers", "Golden Opportunities", "SCAM Guard"]
  },
  {
    title: "Alert Engine",
    summary: "Workflows de disparo, QA e resolução com histórico completo.",
    highlights: ["Cron jobs", "Audit log", "Webhooks"]
  },
  {
    title: "Governança",
    summary: "Status global, gestão de usuários e sinalizações de manutenção.",
    highlights: ["System Gate", "User directory", "Status API"]
  }
];

export default function Home() {
  const { heroMetrics, alertCards } = useLandingData();
  const { user } = useAuth();

  const primaryHref = user ? "/dashboard" : "/auth/signup";
  const primaryLabel = user ? "Ir para o dashboard" : "Começar agora";
  const secondaryHref = user ? "/auth/signin" : "#como-funciona";
  const secondaryLabel = user ? "Entrar com outra conta" : "Ver como funciona";

  return (
    <>
      <Head>
        <title>Wonderland Command Center</title>
        <meta
          name="description"
          content="Cockpit profissional inspirado em Alice no País das Maravilhas com scanners multi-chain, governança de risco e arte temática."
        />
      </Head>

      <main className="relative min-h-screen bg-[#030014] text-slate-100 overflow-hidden">
        <section className="relative overflow-hidden pt-28 pb-24">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-fuchsia-500/10 to-indigo-600/20 blur-3xl opacity-60" />
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(148, 163, 255, 0.25), transparent 55%)" }} />

          <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 lg:flex-row lg:items-center">
            <div className="flex-1 space-y-8">
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.3em]"
              >
                Wonderland Intelligence
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="text-4xl font-bold leading-tight text-slate-100 md:text-5xl lg:text-6xl"
              >
                Comande o reino dos alertas com estética cinematográfica e precisão institucional.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="max-w-2xl text-lg text-slate-300"
              >
                O cockpit integra scanners multi-chain, governança de risco e storytelling temático. Monte operações, monitore métricas e apresente dados com a elegância de uma produção premium — agora acompanhado de prompts para gerar artes anime/cartoon exclusivas.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href="/admin"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500 px-6 py-3 font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:brightness-110"
                >
                  Entrar no painel
                  <FiArrowUpRight className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/api/runall"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200/40 bg-white/5 px-6 py-3 font-semibold text-emerald-200 transition hover:bg-emerald-200/10"
                >
                  Rodar orquestração completa
                </Link>
              </motion.div>

              <div className="space-y-4">
                {heroMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.1 * index }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                  >
                    <p className="text-sm uppercase tracking-wide text-slate-400">{metric.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-100">{metric.value}</p>
                    <p className="mt-1 text-sm text-slate-300">{metric.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative rounded-[32px] border border-white/10 bg-gradient-to-br from-emerald-500/10 via-fuchsia-500/10 to-indigo-500/10 p-[1px] shadow-2xl"
              >
                <div
                  className="relative h-full w-full overflow-hidden rounded-[32px] bg-[#050021]/90 p-8"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at top, rgba(56, 189, 248, 0.25), transparent 55%), radial-gradient(circle at bottom, rgba(217, 70, 239, 0.2), transparent 60%)"
                  }}
                >
                  <div className="absolute inset-0 bg-[url('/illustrations/hero-rabbit-observatory.png')] bg-cover bg-center opacity-60 mix-blend-screen" />
                  <div className="relative space-y-6">
                    <p className="text-sm uppercase tracking-[0.4em] text-emerald-200/80">Storytelling Visual</p>
                    <p className="text-2xl font-semibold leading-snug text-slate-100">
                      Conecte seu time criativo: utilize os prompts temáticos e substitua esta camada pelo PNG gerado para uma apresentação impecável.
                    </p>
                    <div className="space-y-4">
                      {commandSectors.map((sector) => (
                        <div key={sector.title} className={`rounded-xl border border-white/10 bg-gradient-to-br ${sector.accent} p-4 backdrop-blur`}> 
                          <p className="text-sm uppercase tracking-wide text-slate-300/80">{sector.title}</p>
                          <p className="mt-2 text-xs text-slate-200/80">Prompt: <span className="font-semibold text-emerald-200">{sector.promptId}</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/5 bg-[#040018]/90 py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.18),transparent_60%),radial-gradient(circle_at_85%_80%,rgba(217,70,239,0.18),transparent_60%)] opacity-80" />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6">
            <SectionTitle title="Setores de comando" icon={<AiOutlineRadarChart />} color="border-emerald-300/60" />
            <div className="space-y-6">
              {commandSectors.map((sector, index) => (
                <motion.div
                  key={sector.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${sector.accent} p-[1px] shadow-xl`}
                >
                  <div className="relative h-full w-full rounded-3xl bg-[#030012]/90 p-6">
                    <div className="absolute -top-16 right-0 h-40 w-40 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-3xl transition group-hover:scale-125" />
                    <div className="relative space-y-4">
                      <h3 className="text-xl font-semibold text-white">{sector.title}</h3>
                      <p className="text-sm text-slate-300">{sector.description}</p>
                      <div className="rounded-full border border-emerald-200/40 bg-emerald-300/10 px-3 py-1 text-xs uppercase tracking-widest text-emerald-200">
                        Referência de prompt: {sector.promptId}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/5 bg-[#05001f]/90 py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.2),transparent_65%)]" />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6">
            <SectionTitle title="Alertas cinematográficos" icon={<FaCompass />} color="border-indigo-300/60" />
            <div className="space-y-5">
              {alertCards.map((alert) => (
                <motion.div
                  key={alert.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: alert.delay ?? 0 }}
                >
                  <AlertaCard
                    title={alert.title}
                    text={alert.text}
                    colorClass={`${alert.colorClass ?? ""} backdrop-blur`}
                    borderClass={alert.borderClass ?? ""}
                    icon={alert.icon ?? levelThemeMap[alert.level].icon}
                    delay={alert.delay}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/5 bg-[#030012]/95 py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12),transparent_60%)]" />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6">
            <SectionTitle title="Trama operacional" icon={<GiBrain />} color="border-violet-300/60" />
            <div className="space-y-6">
              {storylineBeats.map((beat, index) => (
                <motion.div
                  key={beat.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.1 }}
                  className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${beat.accent} p-[1px] shadow-lg`}
                >
                  <div className="relative h-full rounded-3xl bg-[#040018]/80 p-6 backdrop-blur">
                    <div className="relative space-y-3">
                      <h3 className="text-lg font-semibold text-white">{beat.title}</h3>
                      <p className="text-sm text-slate-300">{beat.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/5 bg-[#05001f]/95 py-20">
          <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6">
            <SectionTitle title="Guardião de personagens" icon={<GiQueenCrown />} color="border-rose-300/60" />
            <div className="space-y-6">
              {guardians.map((guardian, index) => (
                <motion.div
                  key={guardian.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <p className="text-2xl">{guardian.icon}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{guardian.name}</p>
                  <p className="mt-1 text-sm text-slate-300">{guardian.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="rounded-3xl border border-emerald-300/40 bg-emerald-300/5 p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-200">Badges de inteligência</p>
              <div className="mt-4 space-y-4">
                {badgeGlossary.map((badge) => (
                  <div key={badge.label} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <span className="text-2xl">{badge.emoji}</span>
                    <div>
                      <p className="text-base font-semibold text-white">{badge.label}</p>
                      <p className="text-sm text-slate-300">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/5 bg-[#030015]/95 py-20">
          <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6">
            <SectionTitle title="Integrações e APIs" icon={<AiFillPieChart />} color="border-sky-300/60" />
            <div className="space-y-6">
              {integrationMatrix.map((module, index) => (
                <motion.div
                  key={module.name}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                >
                  <div className="flex items-center gap-3 text-slate-100">
                    {module.icon}
                    <h3 className="text-lg font-semibold">{module.name}</h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{module.description}</p>
                  <div className="mt-4 space-y-2">
                    {module.endpoints.map((endpoint) => (
                      <code
                        key={endpoint}
                        className="block rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-emerald-200"
                      >
                        {endpoint}
                      </code>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/5 bg-[#050020]/95 py-20">
          <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6">
            <SectionTitle title="Ateliê de Arte" icon={<FaFeatherAlt />} color="border-purple-300/60" />
            <p className="max-w-3xl text-sm text-slate-300">
              As imagens originais foram substituídas por um pipeline profissional: abaixo estão prompts detalhados para gerar PNGs em estilo cartoon/anime. Utilize ferramentas como Midjourney, DALL·E ou Stable Diffusion XL, exporte em 4K com fundo transparente e salve em <code className="rounded-md bg-black/40 px-2 py-1">public/illustrations</code> usando o ID sugerido. Cada sessão da landing indica qual arte incorporar.
            </p>
            <div className="space-y-6">
              {artPrompts.map((art, index) => (
                <motion.div
                  key={art.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.1 }}
                  className="flex h-full flex-col gap-3 rounded-3xl border border-white/10 bg-[#070026]/80 p-6 backdrop-blur"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{art.id}</p>
                      <h3 className="mt-1 text-lg font-semibold text-white">{art.title}</h3>
                    </div>
                    <span className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">
                      {art.usage}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">{art.prompt}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/5 bg-[#020010]/95 py-20">
          <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6">
            <SectionTitle title="Execução e monitoramento" icon={<FaTools />} color="border-emerald-300/60" />
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <RunAllPanel />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <TokenMonitorCard />
              </motion.div>
            </div>
          </div>
        </section>

        <section className="theme-glass relative overflow-hidden rounded-3xl border px-10 py-16 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-fuchsia-500/5 to-transparent" aria-hidden />
          <div className="relative grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-black/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">
                Wonderland Intelligence
              </span>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                Plataforma completa para <span className="text-emerald-300">orquestrar trading cripto</span> do primeiro alerta à ação.
              </h1>
              <p className="max-w-xl text-lg text-contrast-muted">
                Conecte múltiplas fontes de dados, automatize decisões com narrativas temáticas e mantenha o controle com governança transparente.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={primaryHref}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-black shadow-lg transition hover:translate-y-[-2px] hover:bg-emerald-400"
                >
                  {primaryLabel}
                  <FiArrowRight />
                </Link>
                <Link
                  href={secondaryHref}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-contrast-muted transition hover:border-emerald-400/60 hover:text-white"
                >
                  {secondaryLabel}
                  <FiPlayCircle />
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {credibilityStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-inner">
                    <p className="text-xs uppercase tracking-[0.3em] text-contrast-muted">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
                    <p className="mt-2 text-xs text-contrast-muted">{stat.description}</p>
                  </div>
                ))}
              </div>
            </div>
              <div className="relative">
                <div className="theme-glass h-full rounded-3xl border px-8 py-8 shadow-lg">
                  <SectionTitle title="Por que Checkmate?" icon={<FaCompass />} />
                  <div className="mt-6 space-y-6">
                    {featurePillars.map((feature) => (
                      <div key={feature.title} className="flex gap-4">
                        <div className="mt-1 text-xl">{feature.icon}</div>
                        <div>
                          <h3 className="text-lg font-semibold">{feature.title}</h3>
                          <p className="mt-1 text-sm text-contrast-muted">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-emerald-200">
                    <FiCheckCircle />
                    Autenticação segura, design responsivo e narrativas imersivas.
                  </div>
                </div>
                <div className="absolute -bottom-16 left-1/2 hidden w-[420px] -translate-x-1/2 rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 via-fuchsia-500/10 to-transparent p-6 text-center shadow-2xl shadow-emerald-500/20 lg:block">
                  <p className="text-xs uppercase tracking-[0.4em] text-emerald-200">Preview tático</p>
                  <p className="mt-4 text-lg font-semibold text-white">Tokens, alertas e governança sincronizados em um cockpit mágico.</p>
                </div>
              </div>
          </div>
        </section>

        <section id="como-funciona" className="space-y-10">
          <SectionTitle title="Como funciona" icon={<FaGlobe />} />
          <div className="grid gap-6 md:grid-cols-3">
            {journeySteps.map((step) => (
              <div key={step.title} className="theme-glass rounded-3xl border px-6 py-6 shadow-lg">
                <span className="text-3xl">{step.accent}</span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-contrast-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="catalogo-apis" className="theme-glass rounded-3xl border px-10 py-12 shadow-xl">
          <SectionTitle title="Módulos quantitativos" icon={<FaChartLine />} />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {quantModules.map((module) => (
              <div key={module.title} className="rounded-2xl border border-white/10 bg-black/30 p-6">
                <h3 className="text-lg font-semibold">{module.title}</h3>
                <p className="mt-2 text-sm text-contrast-muted">{module.summary}</p>
                <ul className="mt-4 space-y-2 text-xs text-emerald-200">
                  {module.highlights.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="theme-glass rounded-3xl border px-10 py-12 shadow-xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <SectionTitle title="Pronto para entrar no País das Maravilhas?" icon={<FaShieldAlt />} />
              <p className="text-sm text-contrast-muted">
                Configure sua conta, conecte suas integrações e desbloqueie uma experiência onde dados e storytelling trabalham lado a lado.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href={primaryHref}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-black shadow-lg transition hover:translate-y-[-2px] hover:bg-emerald-400"
              >
                {primaryLabel}
                <FiArrowRight />
              </Link>
              <Link
                href="#catalogo-apis"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-contrast-muted transition hover:border-emerald-400/60 hover:text-white"
              >
                Explorar módulos quant
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 bg-[#010008]/95 py-12">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-slate-200">Wonderland Command Center</p>
              <p>
                Documentação completa disponível nos arquivos <span className="text-emerald-200">Guia.md</span> e <span className="text-emerald-200">README.md</span> na raiz do repositório.
              </p>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <FaCrown className="text-emerald-300" />
              <span>Feito para apresentações premium e testes operacionais.</span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
