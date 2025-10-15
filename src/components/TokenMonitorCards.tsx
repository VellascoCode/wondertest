// TokenMonitorCards.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TopMarketCapCards from './TopMarketCapCards';
import { Token } from '../types';
import TopPerformanceCards from './TopPerformanceCards';
import BestBelowThresholdCards from './BestBelowThresholdCards';
import WorstBelowThresholdCards from './WorstBelowThresholdCards';

interface DiscoverData {
  top15MarketCap: Token[];
  top12Performance: Token[];
  bestBelowThreshold: Token[];
  worstBelowThreshold: Token[];
  counts: {
    top15MarketCap: number;
    top12Performance: number;
    bestBelowThreshold: number;
    worstBelowThreshold: number;
    positiveTop12: number;
  };
  threshold: number;
  worstThreshold: number;
  marketStatus: string;
  updatedAt?: string;
}

interface TokenMonitorCardsProps {
  className?: string;
}

const TokenMonitorCards: React.FC<TokenMonitorCardsProps> = ({ className = "" }) => {
  const [data, setData] = useState<DiscoverData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/whiterabbit/discover');
        if (res.data && res.data.success) {
          setData({
            top15MarketCap: res.data.top15MarketCap,
            top12Performance: res.data.top12Performance,
            bestBelowThreshold: res.data.bestBelowThreshold,
            worstBelowThreshold: res.data.worstBelowThreshold,
            counts: res.data.counts,
            threshold: res.data.threshold,
            worstThreshold: res.data.worstThreshold,
            marketStatus: res.data.marketStatus,
            updatedAt: res.data.updatedAt,
          });
        } else {
          setError('Erro ao carregar os dados.');
        }
      } catch (err) {
        console.error(err);
        setError('Erro na chamada da API.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-white text-center mt-8">Carregando dados...</div>;
  if (error) return <div className="text-white text-center mt-8">{error}</div>;
  if (!data) return null;

  const lastUpdated = data.updatedAt ? new Date(data.updatedAt) : null;

  const containerClasses = ["space-y-8", className].filter(Boolean).join(" ");

  return (
    <div className={containerClasses}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-900/70 to-purple-900/40 border border-indigo-600/60 rounded-2xl p-4 shadow-lg text-indigo-50">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            🌤️ Status do Mercado
          </h3>
          <p className="text-sm leading-relaxed">{data.marketStatus}</p>
          {lastUpdated && (
            <p className="text-xs text-indigo-200 mt-2">
              Atualizado em {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <div className="bg-gradient-to-br from-emerald-900/70 to-teal-900/40 border border-emerald-600/60 rounded-2xl p-4 shadow-lg text-emerald-50">
          <h3 className="text-lg font-bold mb-2">📊 Distribuição</h3>
          <ul className="text-sm space-y-1">
            <li>Top 15 Market Cap: {data.counts.top15MarketCap}</li>
            <li>Top 12 Performance: {data.counts.top12Performance} ({data.counts.positiveTop12} positivos)</li>
            <li>Melhores Fora do Radar: {data.counts.bestBelowThreshold}</li>
            <li>Piores Fora do Radar: {data.counts.worstBelowThreshold}</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-rose-900/70 to-fuchsia-900/40 border border-rose-600/60 rounded-2xl p-4 shadow-lg text-rose-50">
          <h3 className="text-lg font-bold mb-2">🎯 Thresholds</h3>
          <p className="text-sm">Melhores abaixo de <strong>${data.threshold.toFixed(2)}</strong></p>
          <p className="text-sm mt-1">Piores abaixo de <strong>${data.worstThreshold.toFixed(2)}</strong></p>
          <p className="text-xs text-rose-200 mt-2">Use estes valores como filtros rápidos para caça a oportunidades.</p>
        </div>
      </div>

      <TopMarketCapCards tokens={data.top15MarketCap} />
      <TopPerformanceCards tokens={data.top12Performance} />
      <BestBelowThresholdCards tokens={data.bestBelowThreshold} />
      <WorstBelowThresholdCards tokens={data.worstBelowThreshold} />
    </div>
  );
};

export default TokenMonitorCards;
