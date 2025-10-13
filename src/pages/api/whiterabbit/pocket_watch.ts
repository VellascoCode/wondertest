import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * /api/whiterabbit/pocket_watch
 * 
 * 🐇 WHITE RABBIT – POCKET WATCH
 * 
 * Objetivo:
 *  - Buscar dados históricos (15 dias) para 9 moedas fixas:
 *    [ BTC, ETH, BNB, SOL, ADA, MATIC, DOGE, XRP, DOT ]
 *  - Retornar { prices, market_caps, total_volumes } p/ cada,
 *    e exibir logs no console para debug.
 *  - Pode ser executado 1x/dia para armazenar em DB, gerar RSI etc.
 */

export const SELECTED_COINS = [
  'bitcoin',     // BTC
  'ethereum',    // ETH
  'binancecoin', // BNB
  'solana',      // SOL
  'cardano',     // ADA
  'polygon',     // MATIC
  'dogecoin',    // DOGE
  'ripple',      // XRP
  'polkadot',    // DOT
];

// Monta a URL p/ 15 dias
function buildMarketChartUrl(coinId: string) {
  return `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=15&interval=daily`;
}

/** 
 * Histórico 15 dias: prices, market_caps, total_volumes
 */
async function fetchCoinHistory(coinId: string) {
  const url = buildMarketChartUrl(coinId);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Erro ao buscar /market_chart de ${coinId}: ${res.status} - ${res.statusText}`);
  }
  const data = await res.json();
  return {
    prices: data.prices || [],
    market_caps: data.market_caps || [],
    total_volumes: data.total_volumes || [],
  };
}

/** 
 * Info básica p/ exibir name, symbol etc.
 */
async function fetchCoinBasicInfo(coinId: string) {
  const detailUrl = `https://api.coingecko.com/api/v3/coins/${coinId}?tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`;

  const res = await fetch(detailUrl);
  if (!res.ok) {
    throw new Error(`Erro ao buscar detalhe de ${coinId}`);
  }
  const detailData = await res.json();
  return {
    id: coinId,
    name: detailData.name || coinId,
    symbol: detailData.symbol?.toUpperCase() || '',
  };
}

// ------------------------------------------------------------------------
// HANDLER
// ------------------------------------------------------------------------
export interface PocketWatchHistory {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface PocketWatchCoin {
  id: string;
  name: string;
  symbol: string;
  history: PocketWatchHistory;
}

export interface PocketWatchResult {
  success: true;
  count: number;
  coins: PocketWatchCoin[];
}

export async function runPocketWatch(): Promise<PocketWatchResult> {
  const coins = await Promise.all(
    SELECTED_COINS.map(async (coinId) => {
      const basic = await fetchCoinBasicInfo(coinId);
      const history = await fetchCoinHistory(coinId);
      return {
        ...basic,
        history,
      };
    })
  );

  console.log('===== POCKET_WATCH: 15-DAY HISTORICAL =====');
  console.log(JSON.stringify(coins, null, 2));

  return {
    success: true,
    count: coins.length,
    coins,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await runPocketWatch();
    return res.status(200).json(result);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Erro inesperado');
    console.error('Erro no /pocket_watch:', err.message);
    return res.status(500).json({ success: false, error: err.message || 'Erro inesperado' });
  }
}
