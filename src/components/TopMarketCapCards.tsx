import React from "react";
import { motion } from "framer-motion";
import { FaShieldAlt, FaExclamationTriangle, FaBomb, FaMagic } from "react-icons/fa";
import { Token } from "../types";
import { Tooltip } from "react-tooltip"; 
interface TopMarketCapCardsProps {
  tokens: Token[];
}

// Análise de risco para badges
const scamAnalysis = (token: Token) => {
  let risk = 1;
  let alerts: string[] = [];
  if (token.marketCap < 15_000_000) { risk += 2; alerts.push('Market cap muito baixo'); }
  if (token.volume < 400_000) { risk += 2; alerts.push('Volume extremamente baixo'); }
  if (token.marketCap > 0 && token.volume / token.marketCap < 0.001) { risk += 1; alerts.push('Volume/MCAP muito baixo'); }
  if (Math.abs(token.percentChange24h) > 70) { risk += 2; alerts.push('Pump/Dump agressivo'); }
  if (token.name.toLowerCase().includes("elon") || token.name.toLowerCase().includes("inu")) { risk += 1; alerts.push('Nome meme/suspeito'); }
  if (token.rank > 600) { risk += 1; alerts.push('Rank muito alto'); }
  if (risk < 1) risk = 1;
  if (risk > 5) risk = 5;

  let badge = {
    label: "Baixo",
    color: "bg-gradient-to-tr from-teal-500 to-green-400 text-white",
    icon: <FaShieldAlt />,
    tooltip: "Token com risco baixo de SCAM e fundamentos sólidos.",
    pulse: "",
  };
  if (risk === 2) badge = {
    label: "Médio",
    color: "bg-gradient-to-tr from-yellow-400 to-yellow-600 text-gray-900 badge-pulse",
    icon: <FaShieldAlt />,
    tooltip: "Risco moderado. Atenção a liquidez e variação.",
    pulse: "badge-pulse"
  };
  if (risk === 3) badge = {
    label: "Alto",
    color: "bg-gradient-to-tr from-orange-400 to-orange-700 text-white badge-pulse",
    icon: <FaExclamationTriangle />,
    tooltip: "Risco elevado! Possível manipulação de preço ou baixa liquidez.",
    pulse: "badge-pulse"
  };
  if (risk === 4) badge = {
    label: "Crítico",
    color: "bg-gradient-to-tr from-red-500 to-red-900 text-white badge-pulse",
    icon: <FaExclamationTriangle />,
    tooltip: "Risco crítico! Sinais claros de possível SCAM.",
    pulse: "badge-pulse"
  };
  if (risk >= 5) badge = {
    label: "SCAM?",
    color: "bg-gradient-to-tr from-black to-yellow-900 text-yellow-200 badge-pulse",
    icon: <FaBomb />,
    tooltip: "Provável SCAM! Evite negociar esse ativo.",
    pulse: "badge-pulse"
  };

  return { badge, alerts };
};

// Ação sugerida
const getActionSuggestion = (token: Token) => {
  const change = token.percentChange24h;
  const risk = scamAnalysis(token).badge.label;
  if (risk === "SCAM?") return { action: "FUJA!", color: "bg-black text-yellow-200 badge-pulse", tooltip: "Tudo indica SCAM: não invista!" };
  if (risk === "Crítico" || risk === "Alto") return { action: "Venda/Alerta", color: "bg-orange-900 text-orange-200 badge-pulse", tooltip: "Risco altíssimo. Vender pode ser prudente." };
  if (change > 10 && token.volume > 1_000_000) return { action: "Compra", color: "bg-green-700 text-green-100 badge-pulse", tooltip: "Sinal técnico e volume alto, bom para entrada." };
  if (change < -10) return { action: "Venda", color: "bg-red-700 text-red-100 badge-pulse", tooltip: "Queda forte: avaliar stop loss." };
  if (Math.abs(change) <= 3) return { action: "Segure", color: "bg-gray-700 text-gray-100", tooltip: "Movimento lateral: aguarde nova tendência." };
  return { action: "Acompanhe", color: "bg-blue-700 text-blue-100", tooltip: "Movimento relevante, acompanhe antes de agir." };
};

// Formatação de preço
const formatPrice = (price: number) => {
  if (price >= 1) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 0.01) return price.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  return price.toLocaleString("en-US", { minimumFractionDigits: 6, maximumFractionDigits: 8 });
};

const TopMarketCapCards: React.FC<TopMarketCapCardsProps> = ({ tokens }) => (
  <div className="p-2 font-wonderland">
    <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-5 text-center tracking-wider drop-shadow-wonderland flex items-center justify-center gap-2">
      <FaMagic className="text-yellow-400 animate-pulse" /> Top 15 Market Cap
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {tokens.map(token => {
        const { badge, alerts } = scamAnalysis(token);
        const action = getActionSuggestion(token);
        return (
          <motion.div
            key={token.id}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, type: "spring", bounce: 0.26 }}
            className={`wonderland-card flex flex-col min-h-[108px] p-4 transition-all group`}
          >
            {/* Badge rank */}
            <span className="absolute -left-2 -top-2 bg-gradient-to-tr from-yellow-500 to-yellow-400 text-gray-900 text-xs px-2 py-1 rounded-full shadow z-10 font-extrabold border-2 border-yellow-300">
              #{token.rank}
            </span>
            {/* Imagem topo direito */}
            <div className="absolute top-2 right-3 w-10 h-10 opacity-80 rounded-full bg-white border border-indigo-400 z-0 shadow-lg"
              style={{
                backgroundImage: `url(${token.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            {/* Nome, símbolo e badges */}
            <div className="flex items-center gap-2 mb-1 z-10 relative">
              <h3 className="text-lg md:text-xl font-bold text-white tracking-wide drop-shadow-wonderland flex items-center gap-1">
                {token.name}
                <span className="ml-1 text-sm text-indigo-200 font-bold drop-shadow">{token.symbol.toUpperCase()}</span>
              </h3>
              <span
                className={`flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold shadow-lg cursor-pointer ml-1 transition-all ${badge.color} ${badge.pulse}`}
                data-tooltip-id={`risk-tooltip-${token.id}`}
              >
                {badge.icon} {badge.label}
              </span>
              <Tooltip id={`risk-tooltip-${token.id}`} content={badge.tooltip + (alerts.length ? " | " + alerts.join(" | ") : "")} />
              <span
                className={`flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold shadow cursor-pointer ml-1 ${action.color}`}
                data-tooltip-id={`action-tooltip-${token.id}`}
              >
                {action.action}
              </span>
              <Tooltip id={`action-tooltip-${token.id}`} content={action.tooltip} />
            </div>
            {/* Linha 1: Preço (<<) MCAP (>>) */}
            <div className="flex items-center justify-between text-sm text-indigo-100 font-mono font-bold mt-1 mb-0.5">
              <span>
                 ${formatPrice(token.price)}
              </span>
              <span>
                <span className="text-indigo-300">MCap:</span> ${token.marketCap.toLocaleString()}
              </span>
            </div>
            {/* Linha 2: Vol (<<) 24h (>>) */}
            <div className="flex items-center justify-between text-sm text-indigo-200 font-mono mb-0.5">
              <span>
                <span className="text-indigo-400">Vol:</span> ${token.volume.toLocaleString()}
              </span>
              <span>
                <span className="text-indigo-400">24h:</span>{" "}
                <span className={token.percentChange24h >= 0 ? "text-green-400 font-extrabold" : "text-red-400 font-extrabold"}>
                  {token.percentChange24h.toFixed(2)}%
                </span>
              </span>
            </div>
            {/* Alertas compactos, só se hover */}
            {alerts.length > 0 && (
              <div className="mt-1 text-[10px] text-yellow-100 italic group-hover:opacity-100 opacity-60 transition-all duration-200">
                {alerts.slice(0, 2).join(" | ")}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  </div>
);

export default TopMarketCapCards;
