import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import type { Glass } from '../../../models/glass';

export interface DiscoverResponse {
  success: boolean;
  top15MarketCap: Glass['top15MarketCap'];
  top12Performance: Glass['top12Performance'];
  bestBelowThreshold: Glass['bestBelowThreshold'];
  worstBelowThreshold: Glass['worstBelowThreshold'];
  counts: Glass['counts'];
  threshold: Glass['threshold'];
  worstThreshold: Glass['worstThreshold'];
  marketStatus: Glass['marketStatus'];
  updatedAt?: string;
}

export async function loadGlassSnapshot(): Promise<DiscoverResponse> {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<Glass>('glass');

  let glassData = await collection.findOne({}, { sort: { updatedAt: -1 } });

  if (!glassData) {
    const now = new Date();
    await collection.insertOne({
      success: true,
      top15MarketCap: [],
      top12Performance: [],
      bestBelowThreshold: [],
      worstBelowThreshold: [],
      threshold: 0,
      worstThreshold: 0,
      marketStatus: 'undefined',
      counts: {
        top15MarketCap: 0,
        top12Performance: 0,
        bestBelowThreshold: 0,
        worstBelowThreshold: 0,
        positiveTop12: 0,
      },
      createdAt: now,
      updatedAt: now,
    } as Glass);

    glassData = await collection.findOne({}, { sort: { updatedAt: -1 } });

    if (!glassData) {
      throw new Error("Falha ao inicializar a coleção 'glass'.");
    }
  }

  return {
    success: true,
    top15MarketCap: glassData.top15MarketCap,
    top12Performance: glassData.top12Performance,
    bestBelowThreshold: glassData.bestBelowThreshold,
    worstBelowThreshold: glassData.worstBelowThreshold,
    counts: glassData.counts,
    threshold: glassData.threshold,
    worstThreshold: glassData.worstThreshold,
    marketStatus: glassData.marketStatus,
    updatedAt: glassData.updatedAt ? new Date(glassData.updatedAt).toISOString() : undefined,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const responseData = await loadGlassSnapshot();
    return res.status(200).json(responseData);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Erro interno ao consultar os dados do Glass.');
    console.error('Erro ao consultar dados do Glass:', err);
    return res
      .status(500)
      .json({ success: false, error: err.message || 'Erro interno ao consultar os dados do Glass.' });
  }
}
