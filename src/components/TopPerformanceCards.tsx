import React from "react";
import { motion } from "framer-motion";
import {
  FaMagic, FaRocket, FaBolt, FaTrophy, FaExclamationTriangle, FaShieldAlt, FaBalanceScale
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";

export interface Token {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  marketCap: number;
  volume: number;
  percentChange24h: number;
  rank: number;
}

interface TopPerformanceCardsProps {
  tokens: Token[];
}

interface Badge {
  label: string;
  color: string;
  icon: React.ReactNode;
  tooltip: string;
  pulse: string;
}

const getAlertIcon = (alert: string): React.ReactNode => {
  if (alert.includes("Maior alta")) return <FaTrophy className="inline mr-1 text-yellow-300" />;
  if (alert.includes("Pump forte")) return <FaRocket className="inline mr-1 text-pink-300" />;
  if (alert.includes("Pump")) return <FaRocket className="inline mr-1 text-pink-300" />;
  if (alert.includes("Forte")) return <FaBolt className="inline mr-1 text-lime-300" />;
  if (alert.includes("Positivo")) return <FaShieldAlt className="inline mr-1 text-green-300" />;
  if (alert.includes("Lateral")) return <FaBalanceScale className="inline mr-1 text-indigo-400" />;
  if (alert.includes("Dump")) return <FaExclamationTriangle className="inline mr-1 text-red-400" />;
  return null;
};

function getStats(tokens: Token[]) {
  const vals = tokens.map(t => t.percentChange24h);
  const max = Math.max(...vals);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const min = Math.min(...vals);
  const median = vals.sort((a, b) => a - b)[Math.floor(vals.length / 2)];
  return { max, avg, min, median };
}

const performanceAnalysis = (token: Token, stats: ReturnType<typeof getStats>) => {
  const v = token.percentChange24h;
  const volRatio = token.marketCap ? token.volume / token.marketCap : 0;
  const isHighVolume = volRatio >= 0.025; // 2.5%+ do market cap = forte convicção

  let badge: Badge = {
    label: "Moderado",
    color: "bg-yellow-700 text-white",
    icon: <FaBalanceScale />,
    tooltip: "Movimento moderado, sem destaque marcante.",
    pulse: ""
  };
  let alert = "Variação moderada.";
  let risk = "";
  let badgeLevel = 0;

  if (v === stats.max && v >= 14 && isHighVolume) {
    badge = {
      label: "Troféu",
      color: "bg-gradient-to-tr from-yellow-200 to-yellow-500 text-gray-900 badge-pulse",
      icon: <FaTrophy />,
      tooltip: "Maior alta do dia com volume real. Principal oportunidade do top12.",
      pulse: "badge-pulse"
    };
    alert = "Maior alta do dia!";
    badgeLevel = 5;
  } else if (v >= 18 && isHighVolume) {
    badge = {
      label: "Pump forte",
      color: "bg-pink-700 text-white badge-pulse",
      icon: <FaRocket />,
      tooltip: "Pump extremo, movimento perigoso: pode ser topo e reversão. Volume confirma.",
      pulse: "badge-pulse"
    };
    alert = "Pump forte — ALTO risco de reversão!";
    risk = " (Alerta de reversão)";
    badgeLevel = 4;
  } else if (v >= 14) {
    badge = {
      label: "Pump",
      color: "bg-pink-400 text-white",
      icon: <FaRocket />,
      tooltip: isHighVolume
        ? "Pump real com volume — movimento relevante e oportunidade para scalp."
        : "Pump de baixo volume — cuidado com armadilha.",
      pulse: isHighVolume ? "badge-pulse" : ""
    };
    alert = isHighVolume ? "Pump real, fique atento!" : "Pump suspeito — baixo volume!";
    risk = isHighVolume ? "" : " (Possível armadilha)";
    badgeLevel = 3;
  } else if (v >= 10) {
    badge = {
      label: "Forte",
      color: "bg-green-300 text-gray-900",
      icon: <FaBolt />,
      tooltip: "Alta forte, mas sem características de pump extremo. Geralmente tendência consistente.",
      pulse: ""
    };
    alert = "Alta forte, tendência clara.";
    badgeLevel = 2;
  } else if (v >= 5) {
    badge = {
      label: "Positivo",
      color: "bg-green-700 text-white",
      icon: <FaShieldAlt />,
      tooltip: "Movimento positivo, mas longe do nível de euforia do mercado.",
      pulse: ""
    };
    alert = "Movimento positivo saudável.";
    badgeLevel = 1;
  } else if (v >= 1.5) {
    badge = {
      label: "Moderado",
      color: "bg-yellow-700 text-white",
      icon: <FaBalanceScale />,
      tooltip: "Movimento moderado, sem trigger claro para entrada.",
      pulse: ""
    };
    alert = "Variação leve/moderada.";
    badgeLevel = 0;
  } else if (v >= 0) {
    badge = {
      label: "Lateral",
      color: "bg-gray-700 text-gray-200",
      icon: <FaBalanceScale />,
      tooltip: "Movimento lateral, sem tendência clara.",
      pulse: ""
    };
    alert = "Lateral — não operar.";
    badgeLevel = 0;
  } else {
    badge = {
      label: "Dump",
      color: "bg-gradient-to-tr from-fuchsia-800 to-red-600 text-white badge-pulse",
      icon: <FaExclamationTriangle />,
      tooltip: "Queda relevante. Avalie stop ou saída.",
      pulse: "badge-pulse"
    };
    alert = "Dump — risco de nova baixa!";
    badgeLevel = -1;
  }
  return { badge, alert, risk, badgeLevel, volRatio };
};

const getPerformanceAction = (token: Token, stats: ReturnType<typeof getStats>, badgeLevel: number, volRatio: number) => {
  const isMicrocap = token.marketCap < 100_000_000;
  if (badgeLevel === 5) return { action: "Entrar", color: "bg-green-700 text-white badge-pulse", tooltip: "Oportunidade principal do dia (momentum máximo)." };
  if (badgeLevel === 4) return { action: "Vender Forte", color: "bg-red-700 text-white", tooltip: "Pump forte, tendência de exaustão — realize lucros rápido!" };
  if (badgeLevel === 3) {
    if (volRatio >= 0.04 && isMicrocap) return { action: "Pular Fora", color: "bg-red-900 text-white", tooltip: "Pump de microcap com volume: grande risco de dump, não entrar!" };
    if (volRatio < 0.02) return { action: "Observar", color: "bg-gray-700 text-white", tooltip: "Pump sem volume — arriscado, evite entradas grandes." };
    return { action: "Comprar Moderado", color: "bg-blue-700 text-white", tooltip: "Pump real — possível scalp, mas use stop curto." };
  }
  if (badgeLevel === 2) return { action: "Acompanhe", color: "bg-blue-800 text-white", tooltip: "Alta forte — acompanhar oportunidade." };
  if (badgeLevel === 1) return { action: "Segure", color: "bg-green-800 text-white", tooltip: "Movimento saudável — manter posição, sem entradas novas grandes." };
  if (badgeLevel === 0) return { action: "Observar", color: "bg-yellow-700 text-white", tooltip: "Moderado/Lateral — evite entradas novas, só mantenha se já está comprado." };
  if (badgeLevel === -1) return { action: "Venda/Stop", color: "bg-red-800 text-white badge-pulse", tooltip: "Dump — recomendado stop ou realizar prejuízo." };
  return { action: "Observar", color: "bg-gray-700 text-white", tooltip: "Sem direção clara." };
};

const formatPrice = (price: number) =>
  price >= 1 ? price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) :
  price >= 0.01 ? price.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 }) :
  price.toLocaleString("en-US", { minimumFractionDigits: 6, maximumFractionDigits: 8 });

const wonderlandCard = "from-pink-900 via-indigo-900 to-blue-900 border-2 border-fuchsia-600 shadow-xl shadow-indigo-800/40";

const TopPerformanceCards: React.FC<TopPerformanceCardsProps> = ({ tokens }) => {
  const stats = getStats(tokens);

  return (
    <div className="p-2 font-wonderland">
      <h2 className="text-xl md:text-2xl font-extrabold text-white mb-3 text-center tracking-wider drop-shadow-wonderland flex items-center justify-center gap-2">
        <FaMagic className="text-pink-400 animate-bounce" /> Top 12 Performance 24h
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {tokens.map((token, idx) => {
          const { badge, alert, risk, badgeLevel, volRatio } = performanceAnalysis(token, stats);
          const action = getPerformanceAction(token, stats, badgeLevel, volRatio);

          return (
            <motion.div
              key={token.id}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, type: "spring", bounce: 0.18 }}
              className={`relative rounded-xl p-2.5 ${wonderlandCard} flex flex-col min-h-[94px] transition-all group hover:scale-105 hover:shadow-2xl hover:border-pink-400`}
              style={{ fontSize: '0.95rem' }}
            >
              {/* Rank badge */}
              <span className="absolute -left-2 -top-2 bg-gradient-to-tr from-pink-600 to-yellow-300 text-gray-900 text-xs px-2 py-1 rounded-full shadow z-10 font-extrabold border-2 border-pink-300">
                #{token.rank}
              </span>
              {/* Token image */}
              <div className="absolute top-2 right-3 w-8 h-8 opacity-85 rounded-full bg-white border border-pink-400 z-0 shadow"
                style={{
                  backgroundImage: `url(${token.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              {/* Nome e símbolo */}
              <div className="flex items-center gap-2 z-10 relative mb-1">
                <h3 className="text-base md:text-lg font-bold text-white tracking-wide flex items-center gap-1">
                  {token.name}
                  <span className="ml-1 text-xs text-pink-200 font-bold">{token.symbol.toUpperCase()}</span>
                </h3>
              </div>
              {/* Linha do 24h + badges */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[1rem] font-mono font-extrabold text-pink-400">
                  24h:{" "}
                  <span className={token.percentChange24h >= 0 ? "text-green-400" : "text-red-400"}>
                    {token.percentChange24h.toFixed(2)}%
                  </span>
                </span>
                <span
                  className={`flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold shadow cursor-pointer ${badge.color} ${badge.pulse}`}
                  data-tooltip-id={`perf-badge-tooltip-${token.id}`}
                >
                  {badge.icon} {badge.label}
                </span>
                <Tooltip id={`perf-badge-tooltip-${token.id}`} content={badge.tooltip} />
                <span
                  className={`flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold shadow cursor-pointer ${action.color}`}
                  data-tooltip-id={`perf-action-tooltip-${token.id}`}
                >
                  {action.action}
                </span>
                <Tooltip id={`perf-action-tooltip-${token.id}`} content={action.tooltip} />
              </div>
              {/* Linha: Preço | Vol | MC | Vol/MC */}
              <div className="flex flex-wrap items-center justify-between text-xs text-pink-100 font-mono font-bold mb-1 gap-x-1 gap-y-0.5">
                <span><span className="text-pink-300">Preço:</span> ${formatPrice(token.price)}</span>
                <span><span className="text-pink-300">Vol:</span> ${token.volume.toLocaleString()}</span>
                <span><span className="text-pink-300">MC:</span> ${token.marketCap.toLocaleString()}</span>
                <span><span className="text-pink-300">Vol/MC:</span> {(volRatio*100).toFixed(1)}%</span>
              </div>
              {/* ALERTA FINAL – Destacado com ícone */}
              {alert && (
                <div className="mt-0.5 text-xs flex items-center gap-1 font-bold bg-black/20 px-2 py-1 rounded-lg shadow group-hover:scale-105 transition-all">
                  {getAlertIcon(alert)}
                  <span className="text-yellow-100">{alert}{risk}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TopPerformanceCards;
