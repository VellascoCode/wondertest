// pages/api/drink_me/fetch.ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";
import type { DrinkMe } from "../../../models/drink_me";

function formatarValor(valor: number): string {
  if (valor >= 1e12) return `$${(valor / 1e12).toFixed(2)}T`;
  if (valor >= 1e9) return `$${(valor / 1e9).toFixed(2)}B`;
  if (valor >= 1e6) return `$${(valor / 1e6).toFixed(2)}M`;
  if (valor >= 1e3) return `$${(valor / 1e3).toFixed(2)}K`;
  return `$${valor?.toFixed(2) || "0.00"}`;
}

function criarAnalises(doc: any): string[] {
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await clientPromise;
    const col = client.db().collection<DrinkMe>("drink_me");

    const limit = parseInt(req.query.limit as string) || 100;
    const skip = parseInt(req.query.skip as string) || 0;
    const network = req.query.network as string;
    const subType = req.query.subType as string;
    const scam = req.query.scam;
    const classificacao = req.query.classificacao as string;

    // Busca por createdAt (preferencial). Se não existir, cai para timestamp.
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Filtro base
    const filters: any = {
      $or: [
        { createdAt: { $gte: last24h } },
        { createdAt: { $exists: false }, timestamp: { $gte: last24h } }
      ]
    };
    if (network && network !== "ALL") filters.network = network;
    if (subType && subType !== "ALL") filters.subType = subType;
    if (typeof scam === "string" && scam !== "ALL") filters.scam = scam === "true";
    if (classificacao && classificacao !== "ALL") filters.classificacao = classificacao;

    // (Para premium, descomente e ajuste)
    // const days = req.user?.premiumLevel === "premium++" ? 7 : req.user?.premiumLevel === "premium" ? 3 : 1;
    // const lastNDays = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    // filters.$or = [
    //   { createdAt: { $gte: lastNDays } },
    //   { createdAt: { $exists: false }, timestamp: { $gte: lastNDays } }
    // ];

    const docs = await col.find(filters).sort({ createdAt: -1, timestamp: -1 }).skip(skip).limit(limit).toArray();

    const result = docs.map((doc: any) => ({
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
      oportunidade: doc.oportunidade ?? "-"
    }));

    const stats = {
      total: await col.countDocuments(filters),
      returned: result.length,
      byNetwork: {
        ETH: result.filter(r => r.network === "ETH").length,
        BSC: result.filter(r => r.network === "BSC").length
      },
      bySubType: {
        "Elixir de Criação": result.filter(r => r.subType === "Elixir de Criação").length,
        "Dose de Liquidez": result.filter(r => r.subType === "Dose de Liquidez").length,
        "Gole de Listagem": result.filter(r => r.subType === "Gole de Listagem").length,
      },
      possibleScams: result.filter(r => r.scam).length,
      withLiquidity: result.filter(r => (r.initialLiquidityUSD ?? 0) >= 1e5).length,
      goldenOpportunities: result.filter(r => r.risco === "Low" && r.oportunidade >= 80).length,
    };

    return res.status(200).json({ success: true, records: result, stats });
  } catch (err: any) {
    console.error("[drink_me/fetch] erro:", err);
    return res.status(500).json({ success: false, error: err.message || "Erro interno" });
  }
}
