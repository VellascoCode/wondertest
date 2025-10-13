import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb'; // Conexão com MongoDB
import { Glass, Token, Counts } from '../../../models/glass'; // Modelo Glass

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/markets';
const BASE_PARAMS = 'vs_currency=usd&price_change_percentage=1h,24h,7d';
const MIN_UPDATE_INTERVAL = 10; // 14 minutos em milissegundos (ajustado)

const STABLE_SET = new Set([
  // ... (todo seu set, igual acima)
  // (não vou truncar nada aqui para facilitar Ctrl+C/Ctrl+V)
  'tether', 'usdt', 'usd-coin', 'usdc', 'dai', 'binance-usd', 'busd', 
  'frax', 'paxos-standard', 'usdp', 'true-usd', 'tusd', 'gemini-dollar', 'gusd',
  'first-digital-usd', 'fdusd', 'usdd', 'paypal-usd', 'pyusd', 'ethena-usde', 'usde',
  'stasis-euro', 'eurs', 'susde', 'origin-dollar', 'ousd', 'flex-usd', 'susd',
  'liquity-usd', 'lusd', 'usdx', 'terrausd', 'ust', 'pax-gold', 'paxg',
  'tether-gold', 'xaut', 'digix-gold', 'dgx', 'celo-dollar', 'cusd',
  'stably-usd', 'usds', 'usdt0', 'usd0', 'honey', 'blackrock-usd-institutional-digital-liquidity-fund', 'buidl',
  'resolv-usr', 'usr', 'bridged-usdc-polygon-pos-bridge', 'usdc.e', 'sonic-bridged-usdc-e-sonic',
  'binance-bridged-usdt-bnb-smart-chain', 'bsc-usd', 'nusd', 'musd', 'xsgd',
  'ceur', 'ageur', 'seur', 'gbpt', 'mimatic', 'mai', 'jpusd', 'jpeur', 'jpgbp',
  'frax-ether', 'alusd', 'ibeur', 'par', 'usdk', 'usdj', 'dusd', 'vai', 'flexusd',
  'zusd', 'rsv', 'tsd', 'usdq', 'usdl', 'usdap', 'usdct', 'usdterc20', 'usdttrc20',
  'usdcerc20', 'usdctrc20', 'usdcbep20', 'usdtbep20', 'usdtsol', 'usdcsol', 'usdtspl',
  'usdcspl', 'usdterc', 'usdcterc', 'usdtbsc', 'usdcbsc', 'usdtpolygon', 'usdcpolygon',
  'usdtavax', 'usdcavax', 'usdtarb', 'usdcarb', 'usdoptimism', 'usdcoptimism', 'usdftm',
  'usdcftm', 'usdtcro', 'usdccro', 'usdtheco', 'usdcheco', 'usdtokt', 'usdcokt',
  'usdtharmony', 'usdcharmony', 'usdtmoonriver', 'usdcmoonriver', 'usdtfuse', 'usdcfuse',
  'usdtelrond', 'usdcelrond', 'usdttelos', 'usdctelos', 'usdtkava', 'usdckava',
  'usdtmetis', 'usdcmetis', 'usdtboba', 'usdcboba', 'usdtron', 'usdcron', 'usdtvelas',
  'usdcvelas', 'usdtzk', 'usdczk', 'usdtmoonbeam', 'usdcmoonbeam', 'usdtastar', 'usdcastar',
  'usdtoasis', 'usdcoasis', 'usdtgodwoken', 'usdcgodwoken', 'usdtronin', 'usdcronin',
  'usdtloopring', 'usdcloopring', 'usdtzksync', 'usdczksync', 'usdtstarknet', 'usdcstarknet',
  'usdtnova', 'usdcnova', 'usdtether', 'usdcether', 'usdtbtt', 'usdcbtt', 'usdtcelo',
  'usdccelo', 'usdtnear', 'usdcnear', 'usdthora', 'usdtaurora', 'usdtosmosis', 'usdcosmosis',
  'usdtsecret', 'usdcsecret', 'usdtinjective', 'usdcinjective', 'usdtterra', 'usdcterra',
  'usdtkujira', 'usdckujira', 'usdtjunoswap', 'usdcjunoswap', 'usdtpersistence', 'usdcpersistence',
  'usdtevm', 'usdcevm', 'usdteverscale', 'usdceverscale', 'usdtwaves', 'usdcwaves',
  'usdtalgorand', 'usdcalgorand', 'usdthedera', 'usdchedera', 'usdtsolana', 'usdcsolana',
  'usdtcardano', 'usdccardano', 'usdtpolkadot', 'usdcpolkadot', 'usdtcosmos', 'usdccosmos',
  'usdtavalanche', 'usdcavalanche', 'usdtfantom', 'usdcfantom', 'usdttezos', 'usdctezos',
  'usdtflow', 'usdcflow', 'usdthashgraph', 'usdchashgraph', 'usdtstellar', 'usdcstellar',
  'usdtvechain', 'usdcvechain', 'usdttron', 'usdctron', 'usdteos', 'usdceos', 'usdtwax',
  'usdcwax', 'usdthive', 'usdchive', 'usdtiost', 'usdciost', 'usdtontology', 'usdcontology',
  'usdtzilliqa', 'usdczilliqa', 'usdtneo', 'usdcneo', 'usdtnem', 'usdcnem', 'usdtqtum',
  'usdcqtum', 'usdtlisk', 'usdclisk', 'usdtardor', 'usdcardor', 'usdtignis', 'usdcignis',
  'usdtsteem', 'usdcsteem', 'usdthive-engine', 'usdchive-engine', 'usdtbitshares', 'usdcbitshares',
  'usdtnano', 'usdcnano', 'usdtbanano', 'usdcbanano', 'usdtiota', 'usdciota'
]);

function isStable(token: any): boolean {
  if (!token || !token.id) return false;
  const id = token.id.toLowerCase();
  const name = (token.name || '').toLowerCase();
  const symbol = (token.symbol || '').toLowerCase();
  if (STABLE_SET.has(id) || STABLE_SET.has(symbol)) return true;
  if (/(usd|stable|peg|fiat|tokenized|cash|coin)/i.test(name) || /(usd|stable|peg|fiat)/i.test(symbol)) return true;
  if (token.current_price && token.current_price >= 0.9 && token.current_price <= 1.1) return true;
  return false;
}

function isWrapped(token: any): boolean {
  if (!token || !token.id) return false;
  if (token.id === 'bitcoin' || token.id === 'ethereum') return false;
  const id = token.id.toLowerCase();
  const name = (token.name || '').toLowerCase();
  const symbol = (token.symbol || '').toLowerCase();

  const WRAPPED_TOKEN_SET = new Set([
    'solv-btc', 'solvbtc', 'solvbtc.bbn', 'wrapped-bitcoin', 'wbtc', 'wrapped-ether', 'weth',
    'staked-ether', 'steth', 'rocket-pool-eth', 'reth', 'ankreth', 'ankr-staked-eth',
    'cbeth', 'coinbase-wrapped-staked-eth', 'lido-staked-ether', 'staked-usdt', 'stusdt'
  ]);

  if (WRAPPED_TOKEN_SET.has(id) || WRAPPED_TOKEN_SET.has(symbol)) return true;

  const WRAPPED_PATTERNS = [
    /^wrapped\s/i, /^w[\w-]{2,}$/i, /^(erc|bep|hrc|prc|trc|arb|opt|ftm)\d*/i,
    /peg(g?ed)?/i, /bridge(d)?/i, /cross-?chain/i, /wormhole/i, /multichain/i,
    /allbridge/i, /axelar/i, /anytoken/i, /^w\w{3,}$/i, /\.(eth|btc)$/i, /^(h|p|f|a)w\w+/i,
    /staked/i, /stake/i, /liquid/i
  ];

  return WRAPPED_PATTERNS.some(pattern => pattern.test(id) || pattern.test(name) || pattern.test(symbol));
}

function filterTokens(tokens: any[]): any[] {
  return tokens.filter(token => {
    if (!token || !token.id) return false;
    if (token.id === 'bitcoin' || token.id === 'ethereum') return true;
    return !isStable(token) && !isWrapped(token);
  });
}

async function fetchTokens(perPage: number, order: string): Promise<any[]> {
  const url = `${COINGECKO_URL}?${BASE_PARAMS}&order=${order}&per_page=${perPage}&page=1`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CoinGecko request failed: ${response.status} - ${response.statusText}`);
  }
  return response.json();
}

function cleanTokenData(token: any): Token {
  const {
    fully_diluted_valuation, market_cap_change_24h, market_cap_change_percentage_24h,
    high_24h, low_24h, circulating_supply, total_supply, max_supply,
    ath, ath_change_percentage, ath_date, atl, atl_change_percentage, atl_date,
    last_updated, price_change_percentage_1h_in_currency,
    price_change_percentage_24h_in_currency, price_change_percentage_7d_in_currency,
    current_price, market_cap, market_cap_rank, total_volume, price_change_24h,
    price_change_percentage_24h, ...rest
  } = token;

  return {
    id: rest.id,
    symbol: rest.symbol,
    name: rest.name,
    image: rest.image,
    price: current_price,
    marketCap: market_cap,
    rank: market_cap_rank,
    volume: total_volume,
    change24h: price_change_24h,
    percentChange24h: price_change_percentage_24h,
    roi: rest.roi
  };
}

// NOVO: helpers de exclusividade de tokens nos blocos
function excludeUsedTokens(tokens: any[], usedIds: Set<string>): any[] {
  return tokens.filter(t => !usedIds.has(t.id));
}

function processThresholdTokens(tokens: any[], targetCount: number, isBest: boolean, usedIds: Set<string>): { list: any[], threshold: number } {
  const thresholds = [0.01, 0.06, 0.11, 0.16, 0.21, 0.26, 0.31, 0.36, 0.41, 0.46, 0.51, 0.56, 0.61, 0.66, 0.71, 0.76, 0.81, 0.86, 0.91, 0.96, 1];
  let result: any[] = [];
  let finalThreshold = 0.01;

  for (const threshold of thresholds) {
    let filtered = tokens.filter(t => t.current_price < threshold && !usedIds.has(t.id));
    filtered = filtered.sort((a, b) => isBest
      ? (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
      : (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)
    );
    if (filtered.length >= targetCount) {
      result = filtered.slice(0, targetCount);
      finalThreshold = threshold;
      break;
    }
    result = filtered;
    finalThreshold = threshold;
  }
  return { list: result, threshold: finalThreshold };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('glass');

    const lastData = await collection.findOne({});
    const now = new Date();
    const lastUpdated = lastData?.updatedAt ? new Date(lastData.updatedAt) : null;
    const timeSinceLastUpdate = lastUpdated ? now.getTime() - lastUpdated.getTime() : Infinity;

    if (timeSinceLastUpdate <= MIN_UPDATE_INTERVAL) {
      return res.status(429).json({
        success: false,
        error: `Too soon to update. Last update was ${Math.floor(timeSinceLastUpdate / 1000)} seconds ago. Wait at least ${MIN_UPDATE_INTERVAL / 1000} seconds.`,
        lastUpdated: lastUpdated?.toISOString()
      });
    }

    // 1. Top 15 Market Cap (primeiro bloco de IDs utilizados)
    const top50MarketCapRaw = await fetchTokens(50, 'market_cap_desc');
    const top15MarketCap = filterTokens(top50MarketCapRaw).slice(0, 15).map(cleanTokenData);
    const usedIds = new Set(top15MarketCap.map(t => t.id));

    // 2. Top 12 Performance, SEM REPETIÇÃO dos topMarketCap
    const top200DescRaw = await fetchTokens(200, 'price_change_percentage_24h_desc');
    const top200AscRaw = await fetchTokens(200, 'price_change_percentage_24h_asc');
    const filteredDesc = filterTokens(top200DescRaw);
    const filteredAsc = filterTokens(top200AscRaw);
    const uniqueTokens = Array.from(new Map([...filteredDesc, ...filteredAsc].map(t => [t.id, t])).values());
    const performancePool = excludeUsedTokens(uniqueTokens, usedIds);
    const sortedByPerformance = [...performancePool].sort((a, b) =>
      (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
    );
    const top12Performance = sortedByPerformance.slice(0, 12).map(cleanTokenData);
    top12Performance.forEach(t => usedIds.add(t.id));

    // 3. BestBelowThreshold, SEM REPETIÇÃO dos blocos anteriores
    const bestResult = processThresholdTokens(uniqueTokens, 15, true, usedIds);
    const bestBelowThreshold = bestResult.list.map(cleanTokenData);
    bestBelowThreshold.forEach(t => usedIds.add(t.id));

    // 4. WorstBelowThreshold, SEM REPETIÇÃO de nenhum bloco anterior
    const worstResult = processThresholdTokens(uniqueTokens, 15, false, usedIds);
    const worstBelowThreshold = worstResult.list.map(cleanTokenData);

    const glassData: Glass = {
      success: true,
      top15MarketCap,
      top12Performance,
      bestBelowThreshold,
      worstBelowThreshold,
      threshold: bestResult.threshold,
      worstThreshold: worstResult.threshold,
      marketStatus: sortedByPerformance.filter(t => (t.price_change_percentage_24h || 0) > 0).length < 12
        ? 'Market down: few positives, filled with least negatives'
        : 'Market OK: all positives',
      counts: {
        top15MarketCap: top15MarketCap.length,
        top12Performance: top12Performance.length,
        bestBelowThreshold: bestBelowThreshold.length,
        worstBelowThreshold: worstBelowThreshold.length,
        positiveTop12: sortedByPerformance.filter(t => (t.price_change_percentage_24h || 0) > 0).length > 12 ? 12 : sortedByPerformance.filter(t => (t.price_change_percentage_24h || 0) > 0).length
      },
      createdAt: lastData?.createdAt || now,
      updatedAt: now
    };

    await collection.updateOne(
      {},
      { $set: glassData },
      { upsert: true }
    );

    return res.status(200).json(glassData);

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
}
