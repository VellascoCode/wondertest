import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('glass');

    // Busca o documento mais recente
    let glassData = await collection.findOne({}, { sort: { updatedAt: -1 } });

    // Se não houver dados, insere um documento padrão
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
        marketStatus: "undefined",
        counts: {
          top15MarketCap: 0,
          top12Performance: 0,
          bestBelowThreshold: 0,
          worstBelowThreshold: 0,
          positiveTop12: 0
        },
        createdAt: now,
        updatedAt: now
      });

      // Reexecuta a busca com segurança
      glassData = await collection.findOne({}, { sort: { updatedAt: -1 } });

      // Se ainda assim falhar, lançamos erro explícito
      if (!glassData) {
        throw new Error("Falha ao inicializar a coleção 'glass'.");
      }
    }

    // A partir daqui, TypeScript sabe que `glassData` é válido
    const responseData = {
      success: true,
      top15MarketCap: glassData.top15MarketCap,
      top12Performance: glassData.top12Performance,
      bestBelowThreshold: glassData.bestBelowThreshold,
      worstBelowThreshold: glassData.worstBelowThreshold
    };

    return res.status(200).json(responseData);
  } catch (error: any) {
    console.error('Erro ao consultar dados do Glass:', error);
    return res.status(500).json({ success: false, error: 'Erro interno ao consultar os dados do Glass.' });
  }
}
