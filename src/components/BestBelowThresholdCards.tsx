import React from "react";
import { motion } from "framer-motion";
import {
  FaChessQueen, FaMagic, FaBolt, FaBalanceScale, FaExclamationTriangle, FaBomb, FaArrowUp, FaArrowDown
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { Token } from "../types";

interface BestBelowThresholdCardsProps {
  tokens: Token[];
}

// Badge multifatorial (tema Wonderland, visual garantido)
const getBadge = (token: Token) => {
  const { percentChange24h, volume, marketCap, rank } = token;
  const volRatio = marketCap ? volume / marketCap : 0;
  let badge = {
    label: "Neutro",
    color: "bg-gray-700 text-gray-100",
    icon: <FaBalanceScale className="mr-1 text-indigo-300" />,
    tooltip: "Ativo lateral, sem tendência.",
    level: 0
  };
  if (percentChange24h >= 4 && volRatio > 0.07 && rank > 40) {
    badge = {
      label: "Oportunidade Oculta",
      color: "bg-gradient-to-tr from-fuchsia-800 to-blue-900 text-yellow-100 badge-pulse",
      icon: <FaChessQueen className="mr-1 text-yellow-300" />,
      tooltip: "Grande alta e liquidez em tokens pouco visíveis. Radar máximo.",
      level: 4
    };
  } else if (percentChange24h >= 2 && volRatio > 0.05) {
    badge = {
      label: "Alerta de Alta",
      color: "bg-gradient-to-tr from-fuchsia-700 to-fuchsia-500 text-white",
      icon: <FaBolt className="mr-1 text-blue-300" />,
      tooltip: "Movimento positivo com bom volume.",
      level: 3
    };
  } else if (percentChange24h > 0.5) {
    badge = {
      label: "Positivo",
      color: "bg-fuchsia-900 text-fuchsia-100",
      icon: <FaArrowUp className="mr-1 text-fuchsia-400" />,
      tooltip: "Pequena alta ou reversão. Sinal inicial.",
      level: 2
    };
  } else if (percentChange24h >= -1) {
    badge = {
      label: "Lateral",
      color: "bg-indigo-950 text-indigo-200",
      icon: <FaBalanceScale className="mr-1 text-indigo-200" />,
      tooltip: "Sem tendência clara.",
      level: 1
    };
  } else if (percentChange24h < -4) {
    badge = {
      label: "Dump",
      color: "bg-gradient-to-tr from-red-900 to-fuchsia-900 text-white badge-pulse",
      icon: <FaBomb className="mr-1 text-fuchsia-400" />,
      tooltip: "Dump expressivo. Fuja desse ativo.",
      level: -2
    };
  } else if (percentChange24h < -2) {
    badge = {
      label: "Queda Moderada",
      color: "bg-red-900 text-red-200",
      icon: <FaArrowDown className="mr-1 text-red-300" />,
      tooltip: "Queda moderada.",
      level: -1
    };
  }
  return badge;
};

// Ação sugerida
const getAction = (level: number) => {
  if (level === 4) return { label: "Entrar Parcial", color: "bg-yellow-900 text-yellow-200", tooltip: "Entrada estratégica, pequena alocação." };
  if (level === 3) return { label: "Observar Forte", color: "bg-blue-900 text-blue-200", tooltip: "Alta real, scalp/trade curto." };
  if (level === 2) return { label: "Observar", color: "bg-blue-700 text-blue-100", tooltip: "Alta leve, apenas monitorar." };
  if (level === 1) return { label: "Aguarde", color: "bg-indigo-900 text-indigo-100", tooltip: "Mercado lateral, sem trigger." };
  if (level === -1) return { label: "Evite", color: "bg-red-700 text-red-100", tooltip: "Queda moderada, evite entrada." };
  if (level === -2) return { label: "Fuja", color: "bg-black text-fuchsia-200 badge-pulse", tooltip: "Dump, fuja imediatamente!" };
  return { label: "Sem Ação", color: "bg-gray-800 text-gray-100", tooltip: "Sem sinal claro." };
};

const formatPrice = (price: number) =>
  price >= 1 ? price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) :
  price >= 0.01 ? price.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 }) :
  price.toLocaleString("en-US", { minimumFractionDigits: 6, maximumFractionDigits: 8 });

const BestBelowThresholdCards: React.FC<BestBelowThresholdCardsProps> = ({ tokens }) => (
  <div className="p-2 font-wonderland">
    <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-5 text-center tracking-wider drop-shadow-wonderland flex items-center justify-center gap-2">
      <FaMagic className="text-fuchsia-400 animate-pulse" /> Melhores Fora do Radar (Wonderland Radar)
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
            transition={{ duration: 0.28, type: "spring", bounce: 0.15 }}
            className={`relative rounded-2xl p-3 bg-gradient-to-tr from-black/70 via-fuchsia-950 to-indigo-950 border-2 border-fuchsia-700 shadow-lg flex flex-col min-h-[94px] group hover:scale-105 transition-all`}
          >
            {/* Rank e Imagem */}
            <span className="absolute -left-2 -top-2 bg-gradient-to-tr from-fuchsia-700 to-pink-200 text-gray-900 text-xs px-2 py-1 rounded-full shadow z-10 font-extrabold border-2 border-fuchsia-200">
              #{token.rank}
            </span>
            <div className="absolute top-2 right-3 w-8 h-8 rounded-full bg-white border border-fuchsia-600 shadow"
              style={{
                backgroundImage: `url(${token.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            {/* Nome, símbolo, badge, ação */}
            <div className="flex items-center gap-2 mb-1 z-10 relative">
              <h3 className="text-base md:text-lg font-bold text-white tracking-wide flex items-center gap-1">
                {token.name}
                <span className="ml-1 text-xs text-fuchsia-200 font-bold">{token.symbol.toUpperCase()}</span>
              </h3>
              <span
                className="flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold shadow cursor-pointer ml-1 transition-all"
                style={{ background: "rgba(18,19,54,0.9)" }}
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
            <div className="flex items-center gap-1 text-[1rem] font-mono font-extrabold text-fuchsia-400 mb-1">
              24h:{" "}
              <span className={token.percentChange24h >= 0 ? "text-green-400" : "text-red-400"}>
                {token.percentChange24h.toFixed(2)}%
              </span>
            </div>
            {/* Linha: Preço, Vol, MC, Vol/MC */}
            <div className="flex flex-wrap items-center justify-between text-xs text-fuchsia-100 font-mono font-bold mb-1 gap-x-2 gap-y-0.5">
              <span><span className="text-fuchsia-300">Preço:</span> ${formatPrice(token.price)}</span>
              <span><span className="text-fuchsia-300">Vol:</span> ${token.volume.toLocaleString()}</span>
              <span><span className="text-fuchsia-300">MC:</span> ${token.marketCap.toLocaleString()}</span>
              <span><span className="text-fuchsia-300">Vol/MC:</span> {(volRatio * 100).toFixed(1)}%</span>
            </div>
            {/* Rodapé/Alerta */}
            <div className="mt-0.5 text-xs flex items-center gap-1 font-bold bg-black/20 px-2 py-1 rounded-lg shadow group-hover:scale-105 transition-all">
              <FaMagic className="text-fuchsia-400 mr-1" />
              <span className="text-fuchsia-100">{badge.tooltip}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
);

export default BestBelowThresholdCards;
