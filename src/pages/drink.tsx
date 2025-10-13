import { useEffect, useState } from "react";
import {
  FaHatWizard,
  FaFlask,
  FaClock,
  FaCoins,
  FaEthereum,
  FaSkull,
  FaMagic,
  FaBookDead,
  FaTelegramPlane,
  FaTwitter,
  FaDesktop,
  FaEnvelope,
  FaWhatsapp,
  FaChevronDown,
  FaChevronUp,
  FaCube,
  FaTag,
  FaTint,
  FaLayerGroup,
  FaQuestion,
  FaArrowUp,
  FaExpandArrowsAlt,
  FaTrophy,
  FaCalendar,
  FaPuzzlePiece,
  FaRocket,
  FaTimes,
} from "react-icons/fa";
import { GiDrinkMe, GiRabbit } from "react-icons/gi";

const theme = {
  card: "bg-gradient-to-br from-[#1f1336] via-[#221541] to-[#130726] border border-fuchsia-800 rounded-md shadow-xl",
  head: "bg-gradient-to-r from-fuchsia-900 via-purple-900 to-indigo-800 text-white",
  zebra: "even:bg-[#150c23]/80 odd:bg-[#200f36]/80",
  modalBg:
    "fixed inset-0 bg-[#11081b]/90 z-40 flex items-center justify-center",
  modal:
    "relative max-w-3xl w-full bg-gradient-to-br from-[#24113c] via-[#1d0d27] to-[#11081b] border border-fuchsia-900 rounded-2xl shadow-2xl p-6",
};

type Registro = {
  _id?: string;
  detectionType?: string;
  subType?: string;
  network: "ETH" | "BSC";
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  decimals: number;
  initialLiquidityUSD?: number;
  initialLiquidityFormatted?: string;
  poolPrice?: number;
  mintAmount?: number;
  basePriceUSD?: number;
  usdValue?: number;
  usdValueFormatted?: string;
  totalSupply?: number;
  riskScore?: number;
  qualityScore?: number;
  riskLevel?: string;
  opportunityLevel?: string;
  oportunidade?: number;
  detectionTimestamp?: string;
  blockNumber?: number;
  creationTx?: string;
  analises: string[];
  addressShort: string;
  isGoldenOpportunity?: boolean;
  isHighRisk?: boolean;
  pairedTokenAddress?: string;
  pairedTokenSymbol?: string;
  pairedTokenName?: string;
  pairedTokenDecimals?: number;
  notaGeral?: string;
  explanation?: string[];
  outrasInfos?: any;
  sentTelegram?: boolean;
  sentWhatsApp?: boolean;
  sentTwitter?: boolean;
  sentDesktop?: boolean;
  sentEmail?: boolean;
  createdAt?: string;
  updatedAt?: string;
  pairAddress?: string;
  scam?: boolean;
  classificacao?: string;
  risco?: string;
};

const iconForType = (type?: string) => {
  switch (type) {
    case "Elixir de Criação":
      return <FaFlask className="inline mr-1 text-cyan-400" />;
    case "Dose de Liquidez":
      return <FaCoins className="inline mr-1 text-yellow-400" />;
    case "Gole de Listagem":
      return <FaClock className="inline mr-1 text-pink-300" />;
    default:
      return <FaHatWizard className="inline mr-1 text-fuchsia-400" />;
  }
};
const networkIcon = (net?: string) => {
  if (net === "ETH")
    return <FaEthereum className="inline text-purple-300 mr-1" />;
  if (net === "BSC")
    return <GiRabbit className="inline text-yellow-300 mr-1" />;
  return null;
};
const riskIcon = (risk?: string) => {
  if (risk === "High")
    return <FaSkull className="inline text-red-400 mr-1 animate-pulse" />;
  if (risk === "Medium")
    return <FaBookDead className="inline text-yellow-400 mr-1" />;
  if (risk === "Low") return <FaMagic className="inline text-green-300 mr-1" />;
  return <FaQuestion className="inline text-gray-400 mr-1" />;
};
const oppIcon = () => <FaArrowUp className="inline text-green-300 mr-1" />;
const sentIcons = (r: Registro) => (
  <span>
    {r.sentTelegram && (
      <FaTelegramPlane className="inline text-blue-300 mr-1" title="Telegram" />
    )}
    {r.sentWhatsApp && (
      <FaWhatsapp className="inline text-green-400 mr-1" title="WhatsApp" />
    )}
    {r.sentTwitter && (
      <FaTwitter className="inline text-sky-400 mr-1" title="Twitter" />
    )}
    {r.sentDesktop && (
      <FaDesktop className="inline text-indigo-300 mr-1" title="Desktop" />
    )}
    {r.sentEmail && (
      <FaEnvelope className="inline text-yellow-100 mr-1" title="Email" />
    )}
  </span>
);

const formatNumber = (num?: number | null) => {
  if (num === undefined || num === null || isNaN(Number(num))) return "-";
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return Number(num).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
};
function getOpportunityLevel(op: number | undefined) {
  if (typeof op !== "number")
    return { level: "-", sigla: "-", icon: null, className: "text-gray-400" };
  if (op >= 80)
    return {
      level: "Dourada",
      sigla: "TOP",
      icon: "👑",
      className: "text-yellow-400",
    };
  if (op >= 60)
    return {
      level: "Alta",
      sigla: "H",
      icon: "🚀",
      className: "text-green-400",
    };
  if (op >= 40)
    return {
      level: "Média",
      sigla: "M",
      icon: "⚠️",
      className: "text-yellow-300",
    };
  if (op >= 20)
    return {
      level: "Baixa",
      sigla: "L",
      icon: "🛑",
      className: "text-orange-400",
    };
  return {
    level: "Péssima",
    sigla: "VL",
    icon: "💀",
    className: "text-red-500",
  };
}

export default function DrinkMeAlerts() {
  const [records, setRecords] = useState<Registro[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Filtros
  const [networkFilter, setNetworkFilter] = useState<string>("ALL");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [opportunityFilter, setOpportunityFilter] = useState<string>("ALL");
  const [subTypeFilter, setSubTypeFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Paginação
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 20;

  // Modal expandido
  const [modalRec, setModalRec] = useState<Registro | null>(null);

  useEffect(() => setMounted(true), []);
  const fetchData = async () => {
    if (!mounted) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (networkFilter !== "ALL") params.append("network", networkFilter);
      if (riskFilter !== "ALL") params.append("riskLevel", riskFilter);
      if (opportunityFilter !== "ALL")
        params.append("opportunityLevel", opportunityFilter);
      if (subTypeFilter !== "ALL") params.append("subType", subTypeFilter);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());
      params.append("limit", String(itemsPerPage));
      params.append("skip", String((page - 1) * itemsPerPage));
      const res = await fetch(`/api/drink_me/fetch?${params.toString()}`);
      const json = await res.json();
      if (!json.success)
        throw new Error(json.error || "Erro ao carregar dados");
      setRecords(json.records);
      setStats(json.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    mounted,
    page,
    networkFilter,
    riskFilter,
    opportunityFilter,
    subTypeFilter,
    searchTerm,
  ]);

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return "Data Inválida";
    const date = new Date(timestamp);
    return isNaN(date.getTime())
      ? "Data Inválida"
      : date.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const resetFilters = () => {
    setNetworkFilter("ALL");
    setRiskFilter("ALL");
    setOpportunityFilter("ALL");
    setSubTypeFilter("ALL");
    setSearchTerm("");
    setPage(1);
  };

  const exportToCSV = () => {
    const csvRows = [
      [
        "Token",
        "Símbolo",
        "Endereço",
        "Supply",
        "Tipo",
        "SubTipo",
        "Rede",
        "Valor USD",
        "Risco",
        "Oportunidade",
        "Data",
        "Bloco",
        "Análise",
      ],
      ...records.map((r) => [
        `"${r.tokenName}"`,
        `"${r.tokenSymbol}"`,
        `"${r.tokenAddress}"`,
        `"${formatNumber(r.totalSupply)}"`,
        `"${r.detectionType}"`,
        `"${r.subType}"`,
        `"${r.network}"`,
        `"${r.usdValueFormatted}"`,
        `"${r.riskLevel} (${r.riskScore})"`,
        `"${typeof r.oportunidade === "number" ? r.oportunidade + "%" : "-"}"`,
        `"${formatDate(r.detectionTimestamp)}"`,
        `"${r.blockNumber || ""}"`,
        `"${r.analises.join("; ")}"`,
      ]),
    ];
    const csv = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "tokens_monitorados.csv");
    link.click();
  };

  if (!mounted) return <div>Carregando...</div>;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#1a1a1a] to-black text-white font-[cursive]">
      {/* Header Wonderland */}
      <div className="mb-6 flex flex-row items-center gap-2 max-w-7xl mx-auto">
        <GiDrinkMe size={32} className="text-purple-400 animate-bounce" />
        <h1 className="text-2xl font-semibold text-purple-400">
         Drink Me Alerts
        </h1>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6 max-w-7xl mx-auto">
          <div className={`${theme.card} p-1 flex flex-col items-center`}>
            <FaMagic size={20} className="mb-1" />
            <span className="text-xl font-bold text-indigo-200">
              {stats.total}
            </span>
            <span className="text-xs text-indigo-200">Total</span>
          </div>
          <div className={`${theme.card} p-1 flex flex-col items-center`}>
            <FaFlask size={20} className="mb-1" />
            <span className="text-xl font-bold text-pink-200">
              {stats.returned}
            </span>
            <span className="text-xs text-pink-200">Filtrados</span>
          </div>
          <div className={`${theme.card} p-1 flex flex-col items-center`}>
            <FaCoins size={20} className="mb-1 animate-pulse" />
            <span className="text-xl font-bold text-yellow-300">
              {stats.goldenOpportunities}
            </span>
            <span className="text-xs text-yellow-200">
              <FaRocket size={14} className="inline animate animate-pulse" />{" "}
              Golden
            </span>
          </div>
          <div className={`${theme.card} p-1 flex flex-col items-center`}>
            <FaSkull size={20} className="mb-1 animate-pulse" />
            <span className="text-xl font-bold text-red-400">
              {stats.possibleScams}
            </span>
            <span className="text-xs text-red-300">Alto Risco</span>
          </div>
          <div className={`${theme.card} p-1 flex flex-col items-center`}>
            <FaEthereum size={20} className="mb-1" />
            <span className="text-xl font-bold text-purple-300">
              {stats.byNetwork.ETH}
            </span>
            <span className="text-xs text-purple-200">ETH</span>
          </div>
          <div className={`${theme.card} p-1 flex flex-col items-center`}>
            <GiRabbit size={20} className="mb-1" />
            <span className="text-xl font-bold text-orange-300">
              {stats.byNetwork.BSC}
            </span>
            <span className="text-xs text-orange-200">BSC</span>
          </div>
        </div>
      )}

      {/* Filtros/Ações */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6 max-w-7xl mx-auto">
        <div className="flex flex-row gap-4 w-full md:w-auto">
          <div>
            <label className="block text-xs font-bold text-fuchsia-300 mb-1">
              Rede
            </label>
            <select
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className="border-2 border-fuchsia-600 bg-black text-white rounded px-3 py-1 text-sm shadow-inner"
            >
              <option value="ALL">Todas</option>
              <option value="ETH">ETH</option>
              <option value="BSC">BSC</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-fuchsia-300 mb-1">
              Risco
            </label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="border-2 border-fuchsia-600 bg-black text-white rounded px-3 py-1 text-sm shadow-inner"
            >
              <option value="ALL">Todos</option>
              <option value="Low">Baixo</option>
              <option value="Medium">Médio</option>
              <option value="High">Alto</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-fuchsia-300 mb-1">
              Oportunidade
            </label>
            <select
              value={opportunityFilter}
              onChange={(e) => setOpportunityFilter(e.target.value)}
              className="border-2 border-fuchsia-600 bg-black text-white rounded px-3 py-1 text-sm shadow-inner"
            >
              <option value="ALL">Todas</option>
              <option value="Low">Baixa</option>
              <option value="Medium">Média</option>
              <option value="High">Alta</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-fuchsia-300 mb-1">
              SubTipo
            </label>
            <select
              value={subTypeFilter}
              onChange={(e) => setSubTypeFilter(e.target.value)}
              className="border-2 border-fuchsia-600 bg-black text-white rounded px-3 py-1 text-sm shadow-inner"
            >
              <option value="ALL">Todos</option>
              <option value="Elixir de Criação">Elixir de Criação</option>
              <option value="Dose de Liquidez">Dose de Liquidez</option>
              <option value="Gole de Listagem">Gole de Listagem</option>
            </select>
          </div>
          <div>
            <button
              onClick={exportToCSV}
              className="px-4 py-1 bg-indigo-500 text-white rounded-md font-semibold border-b-4 border-indigo-800 hover:bg-indigo-600 transition-all mt-5"
            >
              {" "}
              Exportar CSV
            </button>
          </div>{" "}
        </div>
        <button
          onClick={resetFilters}
          className="px-4 py-1 bg-fuchsia-500 text-white rounded-md font-semibold border-b-4 border-fuchsia-800 hover:bg-fuchsia-600 transition-all"
        >
          Limpar Filtros
        </button>
      </div>
      <div className="mb-6 max-w-7xl mx-auto">
        <input
          type="text"
          placeholder="Buscar por nome, símbolo ou endereço..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border-2 border-fuchsia-700 bg-black text-pink-200 rounded px-3 py-2 text-md font-bold shadow-inner focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {error && (
        <div className="bg-pink-950 border-2 border-pink-800 text-pink-300 px-4 py-3 rounded mb-4">
          <strong>Erro:</strong> {error}
        </div>
      )}
      {loading && (
        <div className="bg-indigo-950 border-2 border-indigo-700 text-indigo-200 px-4 py-3 rounded mb-4">
          Carregando dados...
        </div>
      )}

      {/* Tabela Wonderland */}
      {!loading && !error && (
        <div className="overflow-x-auto mb-4 max-w-7xl mx-auto rounded-md">
        <table className={`min-w-full  rounded-lg shadow shadow-black`}>
          <thead className={theme.head}>
            <tr>
              <th className="px-3 py-3 text-left text-sm font-semibold">#</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Token</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Supply</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Tipo</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Rede</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Valor USD</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Risco</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Oportunidade</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Data</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.map((r, i) => (
                <tr key={r._id || r.tokenAddress + i} className={`${theme.zebra} hover:bg-fuchsia-950/30`}>
                  <td className="px-3 py-3 text-sm font-medium">{i + 1}</td>
                  
                  <td className="px-2 py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-indigo-200">{r.tokenSymbol || "-"}</span>
                      <span className="text-xs text-indigo-400 truncate max-w-[120px]">{r.tokenName || "-"}</span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3 text-right font-bold text-pink-300">
                    {formatNumber(r.totalSupply)}
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-pink-200 font-medium">{r.detectionType || "-"}</span>
                      <span className="text-xs text-fuchsia-400">{r.subType || "-"}</span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      r.network === "ETH" 
                        ? "bg-purple-950 text-purple-300" 
                        : "bg-yellow-950 text-yellow-300"
                    }`}>
                      {r.network}
                    </span>
                  </td>
                  
                  <td className="px-4 py-3 text-right">
                    <div className="font-bold text-green-300">{r.usdValueFormatted ?? "0.00"}</div>
                   
                  </td>
                  
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`font-bold ${
                        r.riskLevel === "High" ? "text-red-400" :
                        r.riskLevel === "Medium" ? "text-yellow-300" :
                        r.riskLevel === "Low" ? "text-green-300" : "text-gray-300"
                      }`}>
                        {r.riskLevel || "-"}
                      </span>
                      {typeof r.riskScore === "number" && (
                        <span className="text-xs text-gray-400">{r.riskScore}%</span>
                      )}
                    </div>
                  </td>
      
                  <td className="px-4 py-3 text-center">
                    {(() => {
                      const opp = getOpportunityLevel(r.oportunidade);
                      return (
                        <div className="flex flex-col items-center">
                          <span className={`font-bold ${opp.className}`}>{opp.level}</span>
                          <span className="text-xs text-gray-300">{r.oportunidade ?? "-"}%</span>
                        </div>
                      );
                    })()}
                  </td>
      
                  <td className="px-4 py-3">
                    <div className="text-xs text-indigo-200">{formatDate(r.detectionTimestamp)}</div>
                    {r.blockNumber && (
                      <div className="text-xs text-fuchsia-300">Block: {r.blockNumber}</div>
                    )}
                  </td>
                  
                  <td className="px-4 py-3 text-center">
                    <button
                      className="px-3 py-1 rounded bg-fuchsia-700 text-white hover:bg-fuchsia-600 transition-colors text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalRec(r);
                      }}
                    >
                      Ver Mais
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-500">
                  Nenhum registro encontrado com os filtros aplicados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Modal de detalhes reorganizado */}
      {modalRec && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-fuchsia-700 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <FaCube className="text-fuchsia-400" />
                <h2 className="text-2xl font-bold text-indigo-200">
                  {modalRec.tokenSymbol} - Detalhes Completos
                </h2>
              </div>
              <button
                onClick={() => setModalRec(null)}
                className="text-gray-400 hover:text-white p-2 hover:bg-slate-800 rounded"
              >
                <FaTimes />
              </button>
            </div>
            
            {/* Primeira linha - Informações básicas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <div className="bg-slate-800 p-4 rounded-lg border border-fuchsia-700/30">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-fuchsia-300 mb-3">
                  <FaTag /> Informações do Token
                </h3>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-400">Símbolo:</span> <span className="text-indigo-200 font-bold">{modalRec.tokenSymbol}</span></div>
                  <div><span className="text-gray-400">Nome:</span> <span className="text-indigo-200">{modalRec.tokenName}</span></div>
                  <div><span className="text-pink-400 font-mono text-xs break-all">{modalRec.tokenAddress || modalRec.addressShort}</span></div>
                  <div className="grid grid-cols-2 gap-2"><div><span className="text-gray-400">Supply Total:</span> <span className="text-pink-300 font-bold">{formatNumber(modalRec.totalSupply)}</span></div>
                  <div>
                    <span className={`ml-4 px-2 py-1 rounded text-xs font-bold ${
                      modalRec.network === "ETH" 
                        ? "bg-purple-950 text-purple-300" 
                        : "bg-yellow-950 text-yellow-300"
                    }`}>
                      {modalRec.network}
                    </span>
                  </div></div>
                  
                </div>
              </div>
              
              <div className="bg-slate-800 p-2 rounded-lg border border-fuchsia-700/30">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-fuchsia-300 mb-3">
                  <FaTint /> Métricas Financeiras
                </h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-400">Valor USD:</span> <span className="text-green-300 font-bold text-lg">{modalRec.usdValueFormatted ?? "0.00"}</span></div>
                  {modalRec.initialLiquidityUSD && (
                    <div><span className="text-gray-400">Liquidez Inicial:</span> <span className="text-fuchsia-300 font-bold">{modalRec.initialLiquidityFormatted}</span></div>
                  )}
                  {modalRec.initialLiquidityUSD && (
                    <div><span className="text-gray-400">Liquidez USD:</span> <span className="text-fuchsia-300">${modalRec.initialLiquidityUSD.toLocaleString()}</span></div>
                  )}
                  <div><span className="text-gray-400">Preço Pool:</span> <span className="text-cyan-300">{modalRec.poolPrice ?? "-"}</span></div>
                  <div className="grid grid-cols-2 gap-2"><div><span className="text-gray-400">Par Address:</span> <span className="text-pink-400 font-mono text-xs break-all">{modalRec.pairAddress ?? "-"}</span></div>
                  <div><span className="text-gray-400">Pareado com:</span> <span className="text-indigo-200">{modalRec.pairedTokenSymbol ?? "-"}</span></div></div>
                </div>
              </div>

              <div className="bg-slate-800 p-4 rounded-lg border border-fuchsia-700/30">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-fuchsia-300 mb-3">
                  <FaPuzzlePiece /> Classificação
                </h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-400">Tipo Principal:</span> <span className="text-pink-200 font-bold">{modalRec.detectionType}</span></div>
                  <div><span className="text-gray-400">Subtipo:</span> <span className="text-fuchsia-400">{modalRec.subType}</span></div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Tipo Icon:</span>
                    {iconForType(modalRec.subType)}
                  </div>
                 
                </div>
              </div>
            </div>

            {/* Segunda linha - Riscos e oportunidades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div className="bg-slate-800 p-2 rounded-lg border border-fuchsia-700/30">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-fuchsia-300 mb-2">
                  <FaSkull /> Análise de Risco
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {riskIcon(modalRec.riskLevel)}
                    <span className={`font-bold text-lg ${
                      modalRec.riskLevel === "High" ? "text-red-400" :
                      modalRec.riskLevel === "Medium" ? "text-yellow-300" :
                      modalRec.riskLevel === "Low" ? "text-green-300" : "text-gray-300"
                    }`}>
                      {modalRec.riskLevel}
                    </span>
                  </div>
                  {typeof modalRec.riskScore === "number" && (
                    <div className="bg-slate-700 p-1 px-2 rounded">
                      <div className="text-xs text-gray-400 mb-1">Score de Risco</div>
                      <div className="text-lg font-bold text-red-400">{modalRec.riskScore}%</div>
                    </div>
                  )}
                  <div className="bg-slate-700 p-1 px-2 rounded">
                    <div className="text-xs text-gray-400 mb-1">Status de Segurança</div>
                    <div className="flex items-center gap-2">
                      {modalRec.scam ? (
                        <span className="text-red-400 font-semibold flex items-center gap-1">
                          🚩 Possível SCAM
                        </span>
                      ) : (
                        <span className="text-green-300 font-semibold flex items-center gap-1">
                          ✅ neutro
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 p-2 rounded-lg border border-fuchsia-700/30">
                <h3 className="flex items-center gap-2 text-md font-semibold text-fuchsia-300 mb-1">
                  <FaTrophy /> Oportunidade de Investimento
                </h3>
                <div className="space-y-2">
                  {(() => {
                    const opp = getOpportunityLevel(modalRec.oportunidade);
                    return (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{opp.icon}</span>
                          <span className={`font-bold text-lg ${opp.className}`}>
                            {opp.level}
                          </span>
                        </div>
                        <div className="bg-slate-700 p-1 px-2 rounded">
                          <div className="text-xs text-gray-400 mb-1">Score de Oportunidade</div>
                          <div className="text-lg font-bold text-yellow-300">{modalRec.oportunidade ?? "-"}%</div>
                        </div>
                        <div className="bg-slate-700 p-1 px-2 rounded">
                          <div className="text-xs text-gray-400 mb-1">Nível de Oportunidade</div>
                          <div className="text-lg font-bold text-cyan-300">{modalRec.opportunityLevel || "-"}</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
            
            {/* Terceira linha - Dados da blockchain e notas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div className="bg-slate-800 p-2 rounded-lg border border-fuchsia-700/30">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-fuchsia-300 mb-3">
                  <FaCalendar /> Informações de Detecção
                </h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-400">Data de Detecção:</span> <span className="text-indigo-200 font-bold">{formatDate(modalRec.detectionTimestamp)}</span></div>
                  <div><span className="text-gray-400">Timestamp:</span> <span className="text-indigo-200 font-mono text-xs">{modalRec.detectionTimestamp}</span></div>
                  {modalRec.blockNumber && (
                    <div><span className="text-gray-400">Número do Block:</span> <span className="text-fuchsia-300 font-mono">{modalRec.blockNumber}</span></div>
                  )}
                  <div><span className="text-gray-400">Rede de Detecção:</span> 
                    <span className="flex items-center gap-2 mt-1 inline ml-2">
                      {networkIcon(modalRec.network)}
                      <span className="text-indigo-200">{modalRec.network}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 p-2 rounded-lg border border-fuchsia-700/30">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-fuchsia-300 mb-2">
                  <FaEthereum /> Notas e Avaliação
                </h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-400">Nota Geral:</span> <span className="text-yellow-300 font-bold">{modalRec.notaGeral ?? "-"}</span></div>
                  <div className="bg-slate-700 p-2 rounded">
                    <div className="text-xs text-gray-400 mb-1">Avaliação Geral</div>
                    <div className="flex items-center gap-2">
                      {modalRec.scam ? (
                        <span className="text-red-400 font-bold">🚩 Alto Risco</span>
                      ) : (
                        <span className="text-green-300 font-bold">✅ Verificado</span>
                      )}
                      {modalRec.notaGeral && (
                        <span className="text-yellow-300 font-bold">{modalRec.notaGeral}</span>
                      )}
                    </div>
                  </div>
                  {typeof modalRec.riskScore === "number" && (
                    <div className="text-xs text-gray-400">
                      Score de Risco: <span className="text-red-400 font-bold">{modalRec.riskScore}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quarta linha - Explicações e análises */}
            <div className="grid grid-cols-1 gap-2">
              <div className="bg-slate-800 p-2 rounded-lg border border-fuchsia-700/30">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-fuchsia-300 mb-3">
                  Explicações Detalhadas
                </h3>
                <div className="gap-2  grid grid-cols-2">
                  {modalRec.explanation && modalRec.explanation.length > 0 ? (
                    modalRec.explanation.map((exp, idx) => (
                      <div key={idx} className="bg-blue-900/50 text-blue-200 px-2 rounded-lg border border-blue-700/30">
                        <div className="flex items-start gap-2">
                          <span className="text-sm leading-relaxed mt-1">{exp}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm italic col-span-2">Nenhuma explicação disponível</div>
                  )}
                </div>
              </div>
              
              <div className="bg-slate-800 p-2 rounded-lg border border-fuchsia-700/30">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-fuchsia-300 mb-3">
                Análises Detalhadas
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {modalRec.analises && modalRec.analises.length > 0 ? (
                    modalRec.analises.map((txt, idx) => (
                      <div key={idx} className="bg-fuchsia-900/50 text-pink-200 p-1 rounded-lg border border-fuchsia-700/30">
                        <div className="flex items-start gap-2">
                          <span className="text-sm leading-relaxed">{txt}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm italic">Nenhuma análise disponível</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paginação e Exportação */}
      <div className="flex justify-between items-center mt-2 max-w-7xl mx-auto">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-pink-300 font-bold">Página {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          Próxima
        </button>
      </div>
     
    </div>
  );
}
