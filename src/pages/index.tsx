import Head from "next/head";
import SectionTitle from "../components/SectionTitle";
import AlertaCard from "../components/AlertaCard"; // Garante que esteja vindo de AlertaCard.tsx
import { AiOutlineRadarChart, AiFillSound, AiOutlineTags, AiFillPieChart } from "react-icons/ai";
import { GiBrain, GiRabbit, GiAlarmClock, GiMineExplosion, GiPotionBall, GiQueenCrown } from "react-icons/gi";
import { BsFillLightningFill } from "react-icons/bs";
import { motion } from "framer-motion";
import { FaCompass } from "react-icons/fa";
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle, FaCog, FaBell } from "react-icons/fa";
import { useEffect } from "react";
import toast from "react-hot-toast";
import TokenMonitorCard from "../components/TokenMonitorCards";

const alertSamples = [
  { type: "info", title: "WHITE RABBIT", message: "Novo token detectado em tempo real." },
  { type: "success", title: "GROW_ME", message: "Token $ALICE em zona de suporte com RSI baixo." },
  { type: "warning", title: "RABBIT_HOLE", message: "Volatilidade detectada para scalp rápido." },
  { type: "error", title: "CHESHIRES_GRIN", message: "SCAM Score elevado em novo token." },
  { type: "system", title: "QUEENS_ORDER", message: "Stop global ativado por perda de capital." },
];

const alertColors: Record<string, string> = {
  info: "border-blue-700 border",
  success: "border-green-700 border",
  warning: "border-yellow-700 border",
  error: "border-red-700 border",
  system: "border-cyan-700 border"
};

export default function Home() {
  if (!alertSamples || alertSamples.length === 0) return null;

  useEffect(() => {
    if (!alertSamples || alertSamples.length === 0) return;

    let alertIndex = 0;
    let activeToastCount = 0;

    const interval = setInterval(() => {
      if (!alertSamples || alertSamples.length === 0) return;
      if (activeToastCount >= 8) return;

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
        <title>Wonderland Trading Bot</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-black text-white p-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <header>
            <h1 className="text-4xl font-bold mb-4">🎩 Wonderland Trading Bot</h1>
            <p className="text-lg">
              Um universo de alertas temáticos para o mercado cripto. Navegue com os personagens do País das Maravilhas entre oportunidades, riscos e decisões. 🐇♠️🫖
            </p>
          </header>

          {/* Dados Mock */}
          <section>
            <SectionTitle title="📡 Dados em Tempo Real (Simulado)" icon={<AiOutlineRadarChart />} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { token: "$BTC", value: "+2.5%", color: "text-green-400" },
                { token: "$ETH", value: "-1.2%", color: "text-red-400" },
                { token: "$ALICE", value: "0.0%", color: "text-yellow-400" },
              ].map(({ token, value, color }) => (
                <motion.div
                  key={token}
                  className="bg-white/5 border border-white/10 rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-sm text-gray-400">Token</p>
                  <h3 className="text-xl font-bold">{token}</h3>
                  <p className={`${color} mt-1`}>{value} (24h)</p>
                </motion.div>
              ))}
            </div>
          </section>



         {/* Dados em Tempo Real (WHITE RABBIT) */}
<section>
  <SectionTitle title="🐇 WHITE RABBIT – Tokens Monitorados" icon={<GiRabbit />} />
         <TokenMonitorCard />
</section>

          {/* Alertas Mock com componente AlertaCard */}
          <section>
            <SectionTitle title="📢 Alertas Ativos (Mock)" icon={<AiFillSound />} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: <GiPotionBall />,
                  title: "GROW_ME",
                  text: "🌱 Hora de crescer! Token: $ALICE — RSI: 28 — Suporte detectado.",
                  colorClass: "bg-green-900/30",
                  borderClass: "border-green-700"
                },
                {
                  icon: <GiRabbit />,
                  title: "RABBIT_HOLE",
                  text: "🕳️ Entrada rápida! Volatilidade +5% em 2min — Spread apertado.",
                  colorClass: "bg-yellow-900/30",
                  borderClass: "border-yellow-700"
                },
                {
                  icon: <GiQueenCrown />,
                  title: "QUEENS_ORDER",
                  text: "♠️ Stop global ativado! Perda acumulada superior a 10%.",
                  colorClass: "bg-red-900/30",
                  borderClass: "border-red-700"
                },
                {
                  icon: <BsFillLightningFill />,
                  title: "EAT_ME",
                  text: "🍰 Pump detectado! Preço subiu +17% em 4min.",
                  colorClass: "bg-pink-900/30",
                  borderClass: "border-pink-700"
                },
                {
                  icon: <GiAlarmClock />,
                  title: "DRINK_ME",
                  text: "🍷 Novo token listado com liquidez detectada.",
                  colorClass: "bg-blue-900/30",
                  borderClass: "border-blue-700"
                },
                {
                  icon: <GiMineExplosion />,
                  title: "CHESHIRES_GRIN",
                  text: "⚠️ SCAM Score acima de 80%! Risco elevado.",
                  colorClass: "bg-purple-900/30",
                  borderClass: "border-purple-700"
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

          {/* Personagens Verificadores */}
          <section>
            <SectionTitle title="🧠 Sistemas de Verificação (Personagens)" icon={<GiBrain />} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-white/90">
              {[
                { emoji: "🐇", nome: "WHITE RABBIT", desc: "Coleta dados em tempo real via WebSocket/API." },
                { emoji: "😼", nome: "CHESHIRE CAT", desc: "Avalia riscos e SCAM Score de novos tokens." },
                { emoji: "🎩", nome: "MAD HATTER", desc: "Detecta volatilidade extrema e padrões de pump." },
                { emoji: "♥️", nome: "QUEEN OF HEARTS", desc: "Monitora perdas e ativa stop global." },
                { emoji: "🐛", nome: "CATERPILLAR", desc: "Análise técnica avançada (RSI, Fibonacci)." },
                { emoji: "🐢", nome: "MOCK TURTLE", desc: "Executa backtests e avalia histórico." },
              ].map(({ emoji, nome, desc }) => (
                <motion.div 
                  key={nome} 
                  className="bg-white/5 border border-white/10 rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="font-bold">{emoji} {nome}</h3>
                  <p>{desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Tipos de Alerta */}
          <section>
            <SectionTitle title="🧭 Tipos de Alerta" icon={<FaCompass />} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-white/90">
              {[
                ["🍷 DRINK_ME", "Novo Token listado com liquidez."],
                ["🍰 EAT_ME", "Pump >15% em 5min."],
                ["🌱 GROW_ME", "RSI < 30 e preço em suporte."],
                ["🍪 SHRINK_ME", "RSI > 70 e resistência."],
                ["🕳️ RABBIT_HOLE", "Volatilidade extrema para scalp."],
                ["🫖 TEA_PARTY", "Zona de acumulação (RSI < 35)."],
              ].map(([nome, desc]) => (
                <motion.div 
                  key={nome} 
                  className="bg-white/5 border border-white/10 rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="font-bold">{nome}</h3>
                  <p>{desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Badges de Risco */}
          <section>
            <SectionTitle title="🏷️ Badges de Risco" icon={<AiOutlineTags />} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-white/90">
              {[
                ["🔴 SCAM HIGH", "Contrato não verificado + liquidez solta + dono com >30%."],
                ["🟠 SCAM MEDIUM", "Liquidez <50% ou dono não renunciado."],
                ["🟢 SCAM LOW", "Contrato verificado, liquidez travada e dono renunciado."],
                ["🟡 PUMP POTENTIAL", "Volume 5x acima da média + RSI < 35."],
                ["🟣 DUMP WARNING", "Queda >10% em 15min + funding negativo."],
                ["🔵 SMART MONEY IN", "Transações > $100k de wallets institucionais."],
              ].map(([badge, desc]) => (
                <motion.div 
                  key={badge} 
                  className="bg-white/5 border border-white/10 rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="font-bold">{badge}</h3>
                  <p>{desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Tiers de Risco */}
          <section>
            <SectionTitle title="📊 Tiers de Operação" icon={<AiFillPieChart />} />
            <table className="w-full text-sm text-white/90 border border-white/10">
              <thead className="bg-white/10">
                <tr>
                  <th className="p-2 text-left">Tier</th>
                  <th className="p-2 text-left">Valor</th>
                  <th className="p-2 text-left">Alocação</th>
                  <th className="p-2 text-left">Risco</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Micro", "$0.50 – $5", "0.5–2%", "🔴"],
                  ["Standard", "$1 – $10", "1–3%", "🟠"],
                  ["Premium", "$5 – $50", "2–5%", "🟢"],
                ].map(([tier, valor, alocacao, risco]) => (
                  <tr key={tier} className="border-t border-white/10">
                    <td className="p-2">{tier}</td>
                    <td className="p-2">{valor}</td>
                    <td className="p-2">{alocacao}</td>
                    <td className="p-2">{risco}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </>
  );
}
