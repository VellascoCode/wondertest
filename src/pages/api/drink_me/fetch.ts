// pages/api/drink_me/fetch.ts
import type { NextApiRequest, NextApiResponse } from "next";
import type { Filter } from "mongodb";
import clientPromise from "../../../lib/mongodb";
import type { DrinkMe } from "../../../models/drink_me";

function formatarValor(valor: number): string {
  if (valor >= 1e12) return `$${(valor / 1e12).toFixed(2)}T`;
  if (valor >= 1e9) return `$${(valor / 1e9).toFixed(2)}B`;
  if (valor >= 1e6) return `$${(valor / 1e6).toFixed(2)}M`;
  if (valor >= 1e3) return `$${(valor / 1e3).toFixed(2)}K`;
  return `$${valor?.toFixed(2) || "0.00"}`;
}

type DrinkMeDocument = Partial<DrinkMe> & {
  detectionType?: string;
  score?: number;
  classificacao?: string;
  classificacaoExtra?: string;
  risco?: string;
  oportunidade?: number;
  qualityScore?: number;
  riskScore?: number;
  riskLevel?: string;
  opportunityLevel?: string;
  symbol?: string;
  tokenSymbol?: string;
  name?: string;
  tokenName?: string;
  decimals?: number;
  explanation?: string[];
  outrasInfos?: Record<string, unknown>;
  initialLiquidityUSD?: number;
  mintAmount?: number;
  basePriceUSD?: number;
  usdValue?: number;
  totalSupply?: number;
  notaGeral?: string;
  [key: string]: unknown;
};

function criarAnalises(doc: DrinkMeDocument): string[] {
  const analises: string[] = [];
  if (doc.score >= 90) analises.push("🚨 ALTO RISCO");
  else if (doc.score <= 30) analises.push("✅ BAIXO RISCO");
  if (doc.classificacao && doc.classificacao.toLowerCase().includes("excelente")) analises.push("⭐ EXCELENTE");
  if (doc.classificacao && doc.classificacao.toLowerCase().includes("bom")) analises.push("👍 BOM");
  if (doc.classificacao && doc.classificacao.toLowerCase().includes("crítico")) analises.push("❌ CRÍTICO");
  if (doc.risco === "Low" && doc.oportunidade >= 80) analises.push("🚀 OPORTUNIDADE DOURADA");
  else if (doc.risco === "High" && doc.oportunidade >= 60) analises.push("⚡ ALTO RISCO/RETORNO");
  if (doc.initialLiquidityUSD && doc.initialLiquidityUSD > 0) {
    if (doc.initialLiquidityUSD >= 1e6) analises.push("💧 LIQUIDEZ ALTA");
    else if (doc.initialLiquidityUSD >= 1e5) analises.push("💧 LIQUIDEZ MÉDIA");
    else analises.push("💧 LIQUIDEZ BAIXA");
    analises.push(`💧 Liquidez: ${formatarValor(doc.initialLiquidityUSD)}`);
  } else if (doc.subType && doc.subType !== "Elixir de Criação") {
    analises.push("⚠️ SEM LIQUIDEZ DETECTADA");
  }
  if (doc.totalSupply > 0) {
    const supplyFormatted = doc.totalSupply >= 1e9 ? `${(doc.totalSupply / 1e9).toFixed(1)}B` : `${(doc.totalSupply / 1e6).toFixed(1)}M`;
    analises.push(`📊 Supply: ${supplyFormatted}`);
    if (doc.totalSupply >= 1e12) analises.push("🔥 SUPPLY INFLACIONÁRIO");
    else if (doc.totalSupply <= 1e6) analises.push("💎 SUPPLY LIMITADO");
  }
  if (doc.usdValue && doc.usdValue >= 1e6) analises.push("💰 ALTO VALOR");
  else if (doc.usdValue && doc.usdValue <= 1000) analises.push("🪙 BAIXO VALOR");
  if (doc.network === "ETH") analises.push("🔷 ETHEREUM");
  else if (doc.network === "BSC") analises.push("🟡 BSC");
  if (doc.subType === "Dose de Liquidez") analises.push("🧪 DOSE DE LIQUIDEZ");
  else if (doc.subType === "Gole de Listagem") analises.push("🍷 GOLE DE LISTAGEM");
  else if (doc.subType === "Elixir de Criação") analises.push("🧬 ELIXIR DE CRIAÇÃO");
  if (doc.scam) analises.push("🚩 POSSÍVEL SCAM");
  if (doc.risco === "Medium" && doc.oportunidade >= 70 && doc.initialLiquidityUSD > 50000)
    analises.push("🚀 POTENCIAL DE PUMP");
  return analises;
}

export interface DrinkMeQueryOptions {
  limit?: number;
  skip?: number;
  network?: string;
  subType?: string;
  scam?: boolean | 'ALL';
  classificacao?: string;
  hours?: number;
}

export interface DrinkMeRecord {
  _id: string;
  detectionType: string;
  subType: string;
  network: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  decimals: string | number;
  initialLiquidityUSD: number;
  initialLiquidityFormatted: string;
  poolPrice: unknown;
  mintAmount: unknown;
  basePriceUSD: unknown;
  usdValue: number;
  usdValueFormatted: string;
  totalSupply: unknown;
  riskScore: unknown;
  qualityScore: unknown;
  riskLevel: unknown;
  opportunityLevel: unknown;
  detectionTimestamp: unknown;
  blockNumber: unknown;
  creationTx: unknown;
  analises: string[];
  addressShort: string;
  isGoldenOpportunity: boolean;
  isHighRisk: boolean;
  pairedTokenAddress: unknown;
  pairedTokenSymbol: unknown;
  pairedTokenName: unknown;
  pairedTokenDecimals: unknown;
  notaGeral: unknown;
  explanation: string[];
  outrasInfos: Record<string, unknown>;
  sentTelegram: boolean;
  sentWhatsApp: boolean;
  sentTwitter: boolean;
  sentDesktop: boolean;
  sentEmail: boolean;
  createdAt: unknown;
  updatedAt: unknown;
  pairAddress: unknown;
  scam: boolean;
  classificacao: string;
  risco: string;
  oportunidade: unknown;
}

export interface DrinkMeQueryResult {
  success: boolean;
  records: DrinkMeRecord[];
  stats: {
    total: number;
    returned: number;
    byNetwork: Record<string, number>;
    bySubType: Record<string, number>;
    possibleScams: number;
    withLiquidity: number;
    goldenOpportunities: number;
  };
}

function mapDrinkMeDocuments(docs: DrinkMeDocument[]): DrinkMeRecord[] {
  return docs.map((doc: DrinkMeDocument) => ({
    _id: doc._id?.toString() ?? "",
    detectionType: doc.detectionType ?? "TOKEN_MINTED",
    subType: doc.subType ?? "-",
    network: doc.network,
    tokenAddress: doc.tokenAddress,
    tokenSymbol: doc.symbol ?? doc.tokenSymbol ?? "-",
    tokenName: doc.name ?? doc.tokenName ?? "-",
    decimals: doc.decimals ?? "-",
    initialLiquidityUSD: doc.initialLiquidityUSD ?? 0,
    initialLiquidityFormatted: doc.initialLiquidityUSD ? formatarValor(doc.initialLiquidityUSD) : "-",
    poolPrice: doc.poolPrice ?? "-",
    mintAmount: doc.mintAmount ?? "-",
    basePriceUSD: doc.basePriceUSD ?? "-",
    usdValue: doc.usdValue ?? 0,
    usdValueFormatted: doc.usdValue ? formatarValor(doc.usdValue) : "0.00",
    totalSupply: doc.totalSupply ?? "-",
    riskScore: doc.score ?? doc.riskScore ?? "-",
    qualityScore: doc.qualityScore ?? "-",
    riskLevel: doc.riskLevel ?? doc.risco ?? "-",
    opportunityLevel: doc.opportunityLevel ?? "-",
    detectionTimestamp: doc.timestamp ?? doc.detectionTimestamp ?? "-",
    blockNumber: doc.blockNumber ?? "-",
    creationTx: doc.creationTx ?? "-",
    analises: criarAnalises(doc),
    addressShort: doc.tokenAddress ? `${doc.tokenAddress.slice(0, 6)}...${doc.tokenAddress.slice(-4)}` : "-",
    isGoldenOpportunity: doc.risco === "Low" && doc.oportunidade >= 80,
    isHighRisk: doc.risco === "High",
    pairedTokenAddress: doc.pairedTokenAddress ?? "-",
    pairedTokenSymbol: doc.pairedTokenSymbol ?? "-",
    pairedTokenName: doc.pairedTokenName ?? "-",
    pairedTokenDecimals: doc.pairedTokenDecimals ?? "-",
    notaGeral: doc.notaGeral ?? "-",
    explanation: doc.explanation ?? [],
    outrasInfos: doc.outrasInfos ?? {},
    sentTelegram: !!doc.sentTelegram,
    sentWhatsApp: !!doc.sentWhatsApp,
    sentTwitter: !!doc.sentTwitter,
    sentDesktop: !!doc.sentDesktop,
    sentEmail: !!doc.sentEmail,
    createdAt: doc.createdAt ?? "-",
    updatedAt: doc.updatedAt ?? "-",
    pairAddress: doc.pairAddress ?? "-",
    scam: !!doc.scam,
    classificacao: doc.classificacao ?? "-",
    risco: doc.risco ?? "-",
    oportunidade: doc.oportunidade ?? "-",
  }));
}

export async function findDrinkMeRecords(options: DrinkMeQueryOptions = {}): Promise<DrinkMeQueryResult> {
  const client = await clientPromise;
  const col = client.db().collection<DrinkMeDocument>("drink_me");

  const limit = options.limit ?? 100;
  const skip = options.skip ?? 0;
  const network = options.network;
  const subType = options.subType;
  const scam = options.scam;
  const classificacao = options.classificacao;
  const hours = options.hours ?? 24;

  const now = new Date();
  const since = new Date(now.getTime() - hours * 60 * 60 * 1000);

  const filters: Filter<DrinkMeDocument> = {
    $or: [
      { createdAt: { $gte: since } },
      { createdAt: { $exists: false }, timestamp: { $gte: since } },
    ],
  };

  if (network && network !== "ALL") filters.network = network;
  if (subType && subType !== "ALL") filters.subType = subType;
  if (typeof scam === "boolean") filters.scam = scam;
  if (typeof scam === "string" && scam !== "ALL") filters.scam = scam === "true";
  if (classificacao && classificacao !== "ALL") filters.classificacao = classificacao;

  const docs = await col
    .find(filters)
    .sort({ createdAt: -1, timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const records = mapDrinkMeDocuments(docs);

  const stats = {
    total: await col.countDocuments(filters),
    returned: records.length,
    byNetwork: records.reduce<Record<string, number>>((acc, record) => {
      acc[record.network] = (acc[record.network] || 0) + 1;
      return acc;
    }, {}),
    bySubType: records.reduce<Record<string, number>>((acc, record) => {
      acc[record.subType] = (acc[record.subType] || 0) + 1;
      return acc;
    }, {}),
    possibleScams: records.filter(r => r.scam).length,
    withLiquidity: records.filter(r => (r.initialLiquidityUSD ?? 0) >= 1e5).length,
    goldenOpportunities: records.filter(r => r.risco === "Low" && Number(r.oportunidade) >= 80).length,
  };

  return { success: true, records, stats };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const scamParam = req.query.scam as string | undefined;
    let scamOption: DrinkMeQueryOptions['scam'];
    if (scamParam === 'true') scamOption = true;
    else if (scamParam === 'false') scamOption = false;
    else if (scamParam === 'ALL') scamOption = 'ALL';

    const result = await findDrinkMeRecords({
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      skip: req.query.skip ? parseInt(req.query.skip as string, 10) : undefined,
      network: req.query.network as string | undefined,
      subType: req.query.subType as string | undefined,
      scam: scamOption,
      classificacao: req.query.classificacao as string | undefined,
      hours: req.query.hours ? parseInt(req.query.hours as string, 10) : undefined,
    });
    return res.status(200).json(result);
  } catch (err: unknown) {
    console.error("[drink_me/fetch] erro:", err);
    const message = err instanceof Error ? err.message : "Erro interno";
    return res.status(500).json({ success: false, error: message });
  }
}
