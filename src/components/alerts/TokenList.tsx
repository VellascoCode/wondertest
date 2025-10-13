"use client";
import { useEffect, useState } from "react";

interface Token {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
}

export default function TokenList() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/white-rabbit")
      .then((res) => res.json())
      .then((data) => {
        setTokens(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-white/70">⏳ Consultando o Coelho Branco...</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {tokens.map((token) => {
        const color =
          token.change24h > 0 ? "text-green-400" :
          token.change24h < 0 ? "text-red-400" :
          "text-yellow-400";

        return (
          <div key={token.symbol} className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-sm text-gray-400">{token.name}</p>
            <h3 className="text-xl font-bold">{token.symbol}</h3>
            <p className={`${color} mt-1`}>
              ${token.price.toFixed(4)} ({token.change24h.toFixed(2)}%)
            </p>
          </div>
        );
      })}
    </div>
  );
}
