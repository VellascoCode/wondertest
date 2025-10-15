import Head from "next/head";
import SectionTitle from "../components/SectionTitle";
import AlertaCard from "../components/AlertaCard";
import { AiOutlineRadarChart, AiFillSound, AiOutlineTags, AiFillPieChart } from "react-icons/ai";
import { GiBrain, GiRabbit, GiAlarmClock, GiMineExplosion, GiPotionBall, GiQueenCrown } from "react-icons/gi";
import { BsFillLightningFill } from "react-icons/bs";
import { motion } from "framer-motion";
import {
  FaCompass,
  FaRocket,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCog,
  FaBell
} from "react-icons/fa";
import { useEffect } from "react";
import toast from "react-hot-toast";
import TokenMonitorCard from "../components/TokenMonitorCards";
import RunAllPanel from "../components/RunAllPanel";

const alertSamples = [
  { type: "info", title: "WHITE RABBIT", message: "Novo token detectado em tempo real." },
  { type: "success", title: "GROW_ME", message: "Token $ALICE em zona de suporte com RSI baixo." },
  { type: "warning", title: "RABBIT_HOLE", message: "Volatilidade detectada para scalp rápido." },
  { type: "error", title: "CHESHIRES_GRIN", message: "SCAM Score elevado em novo token." },
  { type: "system", title: "QUEENS_ORDER", message: "Stop global ativado por perda de capital." }
];

const alertColors: Record<string, string> = {
  info: "border-blue-700 border",
  success: "border-green-700 border",
  warning: "border-yellow-700 border",
  error: "border-red-700 border",
  system: "border-cyan-700 border"
};

const marketPulse = [
  { token: "$BTC", value: "+2.5%", description: "Momentum positivo em 24h", color: "text-emerald-400" },
  { token: "$ETH", value: "-1.2%", description: "Correção após rally", color: "text-rose-400" },
  { token: "$ALICE", value: "0.0%", description: "Consolidação estável", color: "text-amber-300" }
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

export default function Home() {
  useEffect(() => {
    let alertIndex = 0;
    let activeToastCount = 0;

    const interval = setInterval(() => {
      if (activeToastCount >= 6) return;

      const { title, message, type } = alertSamples[alertIndex % alertSamples.length];

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full text-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 bg-gray-900 ${alertColors[type] || "border-gray-700"}`}
          >
            <div className={`flex-1 w-0 p-4`}>
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5 text-xl">
                  {type === "success" && <FaCheckCircle className="text-green-400" />}
                  {type === "error" && <FaTimesCircle className="text-red-400" />}
                  {type === "warning" && <FaExclamationTriangle className="text-yellow-400" />}
                  {type === "info" && <FaInfoCircle className="text-blue-400" />}
                  {type === "system" && <FaCog className="text-cyan-400" />}
                  {type === "notification" && <FaBell className="text-orange-400" />}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-1 text-sm text-gray-300">{message}</p>
                </div>
              </div>
            </div>
          </div>
        ),
        { duration: 5000, position: "top-right" }
      );

      activeToastCount++;
      setTimeout(() => {
        activeToastCount--;
      }, 5000);

      alertIndex++;
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Checkmate Intelligence</title>
      </Head>
      <div className="space-y-12">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.8fr)]">
          <div className="theme-glass rounded-3xl border px-10 py-12 shadow-lg">
            <div className="max-w-2xl space-y-6">
              <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">
                Wonderland Quant Deck
              </span>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                🎩 Automação tática para <span className="text-emerald-300">operadores cripto</span>
              </h1>
              <p className="text-lg text-contrast-muted">
                Combine scanners, sinais e controles de risco em um cockpit único. O Checkmate orquestra alertas temáticos com narrativa de Wonderland e profundidade quantitativa.
              </p>
            </div>
            <div className="mt-10">
              <SectionTitle title="🚀 Orquestração Completa" icon={<FaRocket />} />
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <RunAllPanel />
              </div>
            </div>
          </div>

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
              <SectionTitle title="🐇 WHITE RABBIT – Tokens Monitorados" icon={<GiRabbit />} />
              <div className="mt-4">
                <TokenMonitorCard />
              </div>
            </div>
          </div>
        </section>

        <section className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
          <SectionTitle title="📢 Alertas Ativos (Mock)" icon={<AiFillSound />} />
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[ 
              {
                icon: <GiPotionBall className="text-emerald-300" />,
                title: "GROW_ME",
                text: "🌱 Hora de crescer! Token: $ALICE — RSI: 28 — Suporte detectado.",
                colorClass: "bg-emerald-500/10",
                borderClass: "border-emerald-400/40"
              },
              {
                icon: <GiRabbit className="text-amber-300" />,
                title: "RABBIT_HOLE",
                text: "🕳️ Entrada rápida! Volatilidade +5% em 2min — Spread ajustado.",
                colorClass: "bg-amber-500/10",
                borderClass: "border-amber-400/40"
              },
              {
                icon: <GiQueenCrown className="text-rose-300" />,
                title: "QUEENS_ORDER",
                text: "♠️ Stop global ativado! Perda acumulada superior a 10%.",
                colorClass: "bg-rose-500/10",
                borderClass: "border-rose-400/40"
              },
              {
                icon: <GiAlarmClock className="text-sky-300" />,
                title: "DRINK_ME",
                text: "🍷 Listagem recente com liquidez verificada e auditoria automática.",
                colorClass: "bg-sky-500/10",
                borderClass: "border-sky-400/40"
              },
              {
                icon: <BsFillLightningFill className="text-fuchsia-300" />,
                title: "EAT_ME",
                text: "⚡ Pump detectado! Preço subiu +17% em 4min.",
                colorClass: "bg-fuchsia-500/10",
                borderClass: "border-fuchsia-400/40"
              },
              {
                icon: <GiMineExplosion className="text-purple-300" />,
                title: "CHESHIRES_GRIN",
                text: "⚠️ SCAM Score acima de 80%! Risco elevado.",
                colorClass: "bg-purple-500/10",
                borderClass: "border-purple-400/40"
              }
            ].map(({ icon, title, text, colorClass, borderClass }, index) => (
              <AlertaCard
                key={index}
                icon={icon}
                title={title}
                text={text}
                colorClass={colorClass}
                borderClass={borderClass}
                delay={index * 0.05}
              />
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
