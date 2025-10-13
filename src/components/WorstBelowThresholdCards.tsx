import React from "react";
import { motion } from "framer-motion";
import {
  FaMagic, FaBomb, FaArrowDown, FaBalanceScale, FaArrowUp, FaExclamationTriangle
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { Token } from "../types";

interface WorstBelowThresholdCardsProps {
  tokens: Token[];
}

const getBadge = (token: Token) => {
  const { percentChange24h, volume, marketCap } = token;
  const volRatio = marketCap ? volume / marketCap : 0;
  let badge = {
    label: "Neutro",
    color: "bg-gray-800 text-gray-100",
    icon: <span className="flex items-center"><FaBalanceScale className="mr-1 text-indigo-300" /></span>,
    tooltip: "Lateralização ou pouca variação.",
    level: 0
  };

  // Dump
  if (percentChange24h <= -7 && volRatio > 0.07) {
    badge = {
      label: "Dump Forte",
      color: "bg-gradient-to-tr from-red-900 to-fuchsia-900 text-white badge-pulse",
      icon: <span className="flex items-center"><FaBomb className="mr-1 text-fuchsia-400" /></span>,
      tooltip: "Queda brusca com alto volume. Evite a todo custo.",
      level: -3
    };
  } else if (percentChange24h <= -5) {
    badge = {
      label: "Dump",
      color: "bg-red-900 text-fuchsia-100",
      icon: <span className="flex items-center"><FaBomb className="mr-1 text-red-300" /></span>,
      tooltip: "Dump expressivo. Evite.",
      level: -2
    };
  } else if (percentChange24h <= -2.5) {
    badge = {
      label: "Queda Forte",
      color: "bg-fuchsia-800 text-fuchsia-100",
      icon: <span className="flex items-center"><FaArrowDown className="mr-1 text-fuchsia-400" /></span>,
      tooltip: "Queda acentuada.",
      level: -1
    };
  } else if (percentChange24h <= -1) {
    badge = {
      label: "Negativo",
      color: "bg-indigo-900 text-fuchsia-100",
      icon: <span className="flex items-center"><FaArrowDown className="mr-1 text-indigo-400" /></span>,
      tooltip: "Leve queda.",
      level: 0
    };
  } else if (percentChange24h > -1 && percentChange24h < 1.5) {
    badge = {
      label: "Lateral",
      color: "bg-indigo-950 text-indigo-200",
      icon: <span className="flex items-center"><FaBalanceScale className="mr-1 text-blue-400" /></span>,
      tooltip: "Movimento lateral, sem trigger.",
      level: 1
    };
  } else if (percentChange24h >= 1.5 && volRatio > 0.04) {
    badge = {
      label: "Alerta",
      color: "bg-blue-900 text-blue-200",
      icon: <span className="flex items-center"><FaExclamationTriangle className="mr-1 text-yellow-200" /></span>,
      tooltip: "Recuperação ou reversão possível. Cuidado!",
      level: 2
    };
  } else if (percentChange24h >= 1.5) {
    badge = {
      label: "Recuperação?",
      color: "bg-blue-800 text-blue-100",
      icon: <span className="flex items-center"><FaArrowUp className="mr-1 text-blue-300" /></span>,
      tooltip: "Movimento positivo, mas atenção ao volume.",
      level: 3
    };
  }
  return badge;
};

const getAction = (level: number) => {
  if (level <= -2) return { label: "Fuja!", color: "bg-black text-fuchsia-200 badge-pulse", tooltip: "Dump forte. Não opere!" };
  if (level === -1) return { label: "Evite", color: "bg-red-800 text-red-200", tooltip: "Queda acentuada. Evite entrada." };
  if (level === 1) return { label: "Aguarde", color: "bg-indigo-800 text-indigo-200", tooltip: "Mercado lateral, melhor esperar." };
  if (level === 2) return { label: "Observar", color: "bg-blue-700 text-blue-100", tooltip: "Acompanhe se vira reversão." };
  if (level === 3) return { label: "Scalp?", color: "bg-green-800 text-green-100", tooltip: "Talvez possível scalp, só para experientes." };
  return { label: "Sem Ação", color: "bg-gray-800 text-gray-100", tooltip: "Sem sinal claro." };
};

const formatPrice = (price: number) =>
  price >= 1 ? price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) :
  price >= 0.01 ? price.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 }) :
  price.toLocaleString("en-US", { minimumFractionDigits: 6, maximumFractionDigits: 8 });

const WorstBelowThresholdCards: React.FC<WorstBelowThresholdCardsProps> = ({ tokens }) => (
  <div className="p-2 font-wonderland">
    <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-5 text-center tracking-wider drop-shadow-wonderland flex items-center justify-center gap-2">
      <FaMagic className="text-red-500 animate-pulse" /> Piores do Radar Wonderland
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {tokens.map(token => {
        const badge = getBadge(token);
        const action = getAction(badge.level);
        const volRatio = token.marketCap ? token.volume / token.marketCap : 0;

        return (
          <motion.div
            key={token.id}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, type: "spring", bounce: 0.15 }}
            className={`relative rounded-2xl p-3 bg-gradient-to-tr from-black/80 via-fuchsia-950 to-indigo-950 border-2 border-red-700 shadow-lg flex flex-col min-h-[94px] group hover:scale-105 transition-all`}
          >
            {/* Rank e Imagem */}
            <span className="absolute -left-2 -top-2 bg-gradient-to-tr from-red-700 to-pink-200 text-gray-900 text-xs px-2 py-1 rounded-full shadow z-10 font-extrabold border-2 border-red-200">
              #{token.rank}
            </span>
            <div className="absolute top-2 right-3 w-8 h-8 rounded-full bg-white border border-red-600 shadow"
              style={{
                backgroundImage: `url(${token.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            {/* Nome, símbolo, badge e ação */}
            <div className="flex items-center gap-2 mb-1 z-10 relative">
              <h3 className="text-base md:text-lg font-bold text-white tracking-wide flex items-center gap-1">
                {token.name}
                <span className="ml-1 text-xs text-red-200 font-bold">{token.symbol.toUpperCase()}</span>
              </h3>
              <span
                className="flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold shadow cursor-pointer ml-1 transition-all"
                style={{ background: "rgba(36,10,25,0.9)" }}
                data-tooltip-id={`badge-tooltip-${token.id}`}
              >
                {badge.icon}
                {badge.label}
              </span>
              <Tooltip id={`badge-tooltip-${token.id}`} content={badge.tooltip} />
              <span
                className={`flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold shadow cursor-pointer ml-1 ${action.color}`}
                data-tooltip-id={`action-tooltip-${token.id}`}
              >
                {action.label}
              </span>
              <Tooltip id={`action-tooltip-${token.id}`} content={action.tooltip} />
            </div>
            {/* Linha 24h */}
            <div className="flex items-center gap-1 text-[1rem] font-mono font-extrabold text-red-400 mb-1">
              24h:{" "}
              <span className={token.percentChange24h >= 0 ? "text-green-400" : "text-red-400"}>
                {token.percentChange24h.toFixed(2)}%
              </span>
            </div>
            {/* Linha: Preço, Vol, MC, Vol/MC */}
            <div className="flex flex-wrap items-center justify-between text-xs text-red-100 font-mono font-bold mb-1 gap-x-2 gap-y-0.5">
              <span><span className="text-red-300">Preço:</span> ${formatPrice(token.price)}</span>
              <span><span className="text-red-300">Vol:</span> ${token.volume.toLocaleString()}</span>
              <span><span className="text-red-300">MC:</span> ${token.marketCap.toLocaleString()}</span>
              <span><span className="text-red-300">Vol/MC:</span> {(volRatio * 100).toFixed(1)}%</span>
            </div>
            {/* Rodapé/Alerta */}
            <div className="mt-0.5 text-xs flex items-center gap-1 font-bold bg-black/20 px-2 py-1 rounded-lg shadow group-hover:scale-105 transition-all">
              <FaMagic className="text-red-400 mr-1" />
              <span className="text-red-100">{badge.tooltip}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
);

export default WorstBelowThresholdCards;
