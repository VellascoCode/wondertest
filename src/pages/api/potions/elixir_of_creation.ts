// pages/api/potions/elixir_of_creation.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { JsonRpcProvider, Contract, Log } from "ethers";
import clientPromise from "@/lib/mongodb";

// Configuração dos RPCs
const ANKR_API_KEY = process.env.ANKR_API_KEY!;
const ETH_RPC = `https://rpc.ankr.com/eth/${ANKR_API_KEY}`;
const BSC_RPC = `https://rpc.ankr.com/bsc/${ANKR_API_KEY}`;
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const ZERO_ADDR = "0x0000000000000000000000000000000000000000";
const BLOCKS_BACK = 50;

// Listas de exclusão
const IGNORE_NAMES = new Set((process.env.IGNORE_NAMES || "").split(",").map(s => s.trim().toUpperCase()).filter(Boolean));
const IGNORE_SYMBOLS = new Set((process.env.IGNORE_SYMBOLS || "").split(",").map(s => s.trim().toUpperCase()).filter(Boolean));
const WHITELIST = new Set(["USDT", "USDC", "BNB", "ETH", "BTC", "CAKE", "UNI", "AAVE", "DAI"]);

// ABI completa com totalSupply
const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)"
];

// Utilitário de serialização seguro
function safeJson(obj: any) {
  return JSON.parse(JSON.stringify(obj, (_, val) =>
    typeof val === "bigint" ? Number(val) : val
  ));
}

// Classificação por score
function classifyScore(score: number): string {
  if (score >= 81) return "Excelente";
  if (score >= 61) return "Bom";
  if (score >= 41) return "Risco médio";
  if (score >= 21) return "Risco alto";
  return "Crítico";
}

// Filtro de bloqueio
function isBlocked(name: string, symbol: string): boolean {
  const nameUC = name.toUpperCase();
  const symbolUC = symbol.toUpperCase();
  if (IGNORE_NAMES.has(nameUC) || IGNORE_SYMBOLS.has(symbolUC)) return true;
  if ([...IGNORE_NAMES].some(item => nameUC.includes(item))) return true;
  if ([...IGNORE_SYMBOLS].some(item => symbolUC.includes(item))) return true;
  return false;
}

// Validação básica de campos
function validateTokenFields(name: string, symbol: string, decimals: number) {
  const symbolValid = symbol.length >= 3 && symbol.length <= 12;
  const nameValid = name.length >= 5 && name.length <= 30;
  const decimalsValid = decimals >= 6 && decimals <= 18;
  const symbolClean = !/[^a-zA-Z0-9]/.test(symbol);
  const nameClean = !/[^a-zA-Z0-9\s]/.test(name);
  const symbolNameDifferent = symbol.toUpperCase() !== name.toUpperCase();
  return {
    symbolValid, nameValid, decimalsValid, symbolClean, nameClean, symbolNameDifferent
  };
}

// Regras extras de score
function extraChecks(name: string, symbol: string): { extraScore: number, reasons: string[] } {
  let extraScore = 0;
  let reasons: string[] = [];
  const SUSPICIOUS_TERMS = ["TEST", "DUMMY", "MOCK", "LP", "AIRDROP", "FAUCET", "POOL", "V2", "V3", "WRAPPED", "PEG", "YIELD"];
  if (SUSPICIOUS_TERMS.some(term => name.toUpperCase().includes(term) || symbol.toUpperCase().includes(term))) {
    extraScore -= 10;
    reasons.push("⚠️ Prefixo/sufixo suspeito detectado (–10)");
  }
  if (/(.)\1\1/.test(name) || /(.)\1\1/.test(symbol)) {
    extraScore -= 10;
    reasons.push("⚠️ Caracteres repetidos em sequência (–10)");
  }
  const FAMOUS = ["ETH", "BTC", "USDT", "PANCAKE", "UNISWAP", "AAVE", "BINANCE", "SHIBA", "DOGE", "PEPE"];
  if (
    FAMOUS.some(term => (name.toUpperCase().includes(term) || symbol.toUpperCase().includes(term)))
    && !WHITELIST.has(symbol.toUpperCase())
  ) {
    extraScore -= 15;
    reasons.push("⚠️ Nome/símbolo famoso sem ser oficial (–15)");
  }
  if (name === name.toUpperCase() || name === name.toLowerCase()) {
    extraScore -= 5;
    reasons.push("⚠️ Nome sem casing padrão (–5)");
  }
  if (symbol === symbol.toUpperCase() || symbol === symbol.toLowerCase()) {
    extraScore -= 5;
    reasons.push("⚠️ Símbolo sem casing padrão (–5)");
  }
  if (/[\s\-_]/.test(symbol) || /\d/.test(symbol.replace(/[a-zA-Z]/g, ""))) {
    extraScore -= 5;
    reasons.push("⚠️ Símbolo com caracteres especiais/números (–5)");
  }
  if (symbol.toUpperCase() === name.toUpperCase()) {
    extraScore -= 5;
    reasons.push("⚠️ Símbolo idêntico ao nome (–5)");
  }
  if (/^(.)\1+$/.test(name) || /^(.)\1+$/.test(symbol)) {
    extraScore -= 10;
    reasons.push("⚠️ Nome/símbolo totalmente repetido (–10)");
  }
  return { extraScore, reasons };
}

// Buscar até 5 tokens únicos de cada rede
async function fetchMintsQuick(rpc: string, label: "ETH" | "BSC"): Promise<any[]> {
  const provider = new JsonRpcProvider(rpc);
  const latestBlock = await provider.getBlockNumber();
  const logs: Log[] = await provider.getLogs({
    fromBlock: latestBlock - BLOCKS_BACK,
    toBlock: latestBlock,
    topics: [TRANSFER_TOPIC, "0x" + ZERO_ADDR.slice(2).padStart(64, "0")],
  });

  const seen = new Set<string>();
  const raw: any[] = [];
  for (const log of logs) {
    const tokenAddress = log.address.toLowerCase();
    if (seen.has(tokenAddress)) continue;
    seen.add(tokenAddress);
    let name = "", symbol = ""; let decimals = 0; let totalSupply = null;
    try {
      const contract = new Contract(tokenAddress, ERC20_ABI, provider);
      name = await contract.name();
      symbol = await contract.symbol();
      decimals = Number(await contract.decimals());
      // SUPPLY com ajuste de casas decimais
      try {
        totalSupply = await contract.totalSupply();
        if (typeof totalSupply === "bigint") totalSupply = Number(totalSupply);
        if (!isNaN(totalSupply) && decimals >= 0) {
          totalSupply = totalSupply / Math.pow(10, decimals);
        }
      } catch { totalSupply = null; }
    } catch { continue; }
    const block = await provider.getBlock(log.blockNumber);
    if (!block) continue;
    const timestamp = new Date(
      typeof block.timestamp === "bigint"
        ? Number(block.timestamp) * 1000
        : block.timestamp * 1000
    ).toISOString();
    raw.push({
      network: label,
      tokenAddress,
      txHash: log.transactionHash,
      blockNumber: Number(log.blockNumber),
      timestamp,
      name,
      symbol,
      decimals,
      totalSupply // <-- SUPPLY salvo aqui!
    });
    if (raw.length >= 5) break;
  }
  return raw;
}

// Adiciona pontuação e explicações
function enrichTokens(tokens: any[]) {
  return tokens.map((token) => {
    const { symbol, name, decimals } = token;
    const { symbolValid, nameValid, decimalsValid, symbolClean, nameClean, symbolNameDifferent } =
      validateTokenFields(name, symbol, decimals);

    let score = 0;
    const explanation: string[] = [];
    symbolValid && (score += 10, explanation.push("✅ Símbolo válido (+10)"));
    nameValid && (score += 10, explanation.push("✅ Nome válido (+10)"));
    decimalsValid && (score += 10, explanation.push("✅ Decimals padrão (+10)"));
    symbolNameDifferent && (score += 10, explanation.push("✅ Nome ≠ símbolo (+10)"));
    symbolClean && (score += 10, explanation.push("✅ Símbolo limpo (+10)"));
    nameClean && (score += 10, explanation.push("✅ Nome limpo (+10)"));

    const { extraScore, reasons } = extraChecks(name, symbol);
    score += extraScore;
    explanation.push(...reasons);

    score = Math.max(0, Math.min(100, score));
    const scam = score <= 40;

    return {
      ...token,
      score,
      classification: classifyScore(score),
      scam,
      ranking: score,
      classificacao: classifyScore(score),
      risco: classifyScore(score),
      oportunidade: 100 - score,
      nivelDescam: scam ? "Alto" : "Baixo",
      notaGeral: `${score} ${
        score >= 81 ? "🌟" : score >= 61 ? "👍" : score >= 41 ? "⚖️" : score >= 21 ? "⚠️" : "❌"
      }`,
      outrasInfos: {
        symbolValid, nameValid, decimalsValid, symbolNameDifferent, symbolClean, nameClean,
        isLP: false, completeERC20: true,
      },
      explanation,
    };
  });
}

// Filtro estrito: só tokens realmente válidos
function strictFilter(tokens: any[]): any[] {
  return tokens.filter(t =>
    t.outrasInfos.symbolValid &&
    t.outrasInfos.nameValid &&
    t.outrasInfos.decimalsValid &&
    t.outrasInfos.symbolClean &&
    t.outrasInfos.nameClean 
  );
}

// Salva no banco de dados os tokens finais exibidos
async function saveToDB(records: any[]) {
  const client = await clientPromise;
  const db = client.db();
  const col = db.collection("drink_me");
  for (const rec of records) {
    const filter = {
      tokenAddress: rec.tokenAddress,
      blockNumber: rec.blockNumber,
      network: rec.network,
      subType: "Elixir de Criação"
    };
    const update = {
      $setOnInsert: {
        ...rec,
        subType: "Elixir de Criação",
        createdAt: new Date()
      }
    };
    await col.updateOne(filter, update, { upsert: true });
  }
}

// Handler principal
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [ethRaw, bscRaw] = await Promise.all([
      fetchMintsQuick(ETH_RPC, "ETH"),
      fetchMintsQuick(BSC_RPC, "BSC"),
    ]);

    let eth = enrichTokens(ethRaw).filter(t => !isBlocked(t.name, t.symbol));
    let bsc = enrichTokens(bscRaw).filter(t => !isBlocked(t.name, t.symbol));
    let ethFinal = strictFilter(eth);
    let bscFinal = strictFilter(bsc);

    // Válidos? Retorna e salva.
    if (ethFinal.length || bscFinal.length) {
      const records = [...ethFinal, ...bscFinal];
      saveToDB(records).catch(console.error);
      return res.status(200).json(safeJson({
        success: true,
        records,
        ethTokens: ethFinal.length,
        bscTokens: bscFinal.length,
      }));
    }

    // Fallback (até 2 de cada, mesmo scam/ruim)
    let ethFallback = eth.slice(0, 2);
    let bscFallback = bsc.slice(0, 2);

    if (ethFallback.length === 0 && ethRaw.length > 0) {
      ethFallback = enrichTokens(ethRaw).slice(0, 2);
    }
    if (bscFallback.length === 0 && bscRaw.length > 0) {
      bscFallback = enrichTokens(bscRaw).slice(0, 2);
    }
    const records = [...ethFallback, ...bscFallback];
    saveToDB(records).catch(console.error);

    return res.status(200).json(safeJson({
      success: true,
      records,
      ethTokens: ethFallback.length,
      bscTokens: bscFallback.length,
      fallback: true,
      msg: "Sem tokens válidos, exibindo até 2 primeiros de cada rede como fallback.",
    }));

  } catch (err: any) {
    console.error("🔥 ELIXIR ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
