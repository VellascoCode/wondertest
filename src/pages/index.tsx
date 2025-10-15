import Head from "next/head";
import Link from "next/link";
import { FiArrowRight, FiCheckCircle, FiPlayCircle } from "react-icons/fi";
import { FaChartLine, FaShieldAlt, FaUsersCog, FaCompass, FaGlobe } from "react-icons/fa";
import SectionTitle from "@/components/SectionTitle";
import { useAuth } from "@/context/AuthContext";

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

export default function LandingPage() {
  const { user } = useAuth();

  const primaryHref = user ? "/dashboard" : "/auth/signup";
  const primaryLabel = user ? "Ir para o dashboard" : "Começar agora";
  const secondaryHref = user ? "/auth/signin" : "#como-funciona";
  const secondaryLabel = user ? "Entrar com outra conta" : "Ver como funciona";

  return (
    <>
      <Head>
        <title>Wonderland Trading Bot • Checkmate Intelligence</title>
      </Head>
      <div className="space-y-20">
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
      </div>
    </>
  );
}
