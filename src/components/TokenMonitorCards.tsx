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
}

const TokenMonitorCards: React.FC = () => {
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

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Neste exemplo, mostramos o TopMarketCap; os demais subcomponentes podem ser adicionados */}
      <TopMarketCapCards tokens={data.top15MarketCap} />
      <TopPerformanceCards tokens={data.top12Performance} />
          <BestBelowThresholdCards tokens={data.bestBelowThreshold} />
      <WorstBelowThresholdCards tokens={data.worstBelowThreshold} />

    </div>
  );
};

export default TokenMonitorCards;
