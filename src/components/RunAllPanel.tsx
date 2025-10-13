import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlay, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface StepResult {
  key: string;
  success: boolean;
  durationMs: number;
  summary?: Record<string, unknown>;
  error?: string;
  meta?: Record<string, unknown>;
}

interface RunAllResponse {
  success: boolean;
  steps: StepResult[];
  timestamp: string;
  error?: string;
}

const formatLabel = (label: string) =>
  label
    .split('.')
    .map((segment) => segment.replace(/_/g, ' '))
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' » ');

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return value.toLocaleString('pt-BR');
    return value.toFixed(2);
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

const RunAllPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<RunAllResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/runall');
      const data = (await res.json()) as RunAllResponse;
      if (!res.ok) {
        throw new Error(data?.error || 'Falha ao executar pipeline Wonderland.');
      }
      if (!data.success) {
        setError('Algumas etapas falharam. Consulte o detalhamento abaixo.');
      }
      setResponse(data);
    } catch (err: unknown) {
      console.error('[RunAllPanel] erro ao executar runall:', err);
      const message = err instanceof Error ? err.message : 'Erro inesperado ao acionar /api/runall.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const steps = response?.steps ?? [];

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
            <span role="img" aria-label="rocket">🛠️</span>
            Orquestrar Personagens
          </h3>
          <p className="text-sm text-gray-300 mt-1">
            Executa White Rabbit, Looking Glass, leitura do oráculo Drink Me e agrega o dashboard em uma tacada só.
          </p>
        </div>
        <button
          onClick={handleRun}
          disabled={loading}
          className={`flex items-center justify-center gap-2 px-5 py-2 rounded-full font-semibold transition-all shadow-md shadow-black/30 border-2 border-white/20 ${
            loading ? 'bg-gray-700 cursor-not-allowed text-gray-200' : 'bg-gradient-to-r from-indigo-500 to-fuchsia-600 hover:scale-105 text-white'
          }`}
        >
          {loading ? (
            <>
              <FaClock className="animate-spin" /> Orquestrando...
            </>
          ) : (
            <>
              <FaPlay /> Rodar agora
            </>
          )}
        </button>
      </div>

      {response?.timestamp && (
        <p className="text-xs text-gray-400">
          Última execução registrada em {new Date(response.timestamp).toLocaleString('pt-BR')}
        </p>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-200 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {steps.map((step) => (
            <motion.div
              key={step.key}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className={`border rounded-xl p-4 backdrop-blur-sm bg-black/30 ${
                step.success ? 'border-emerald-600/70' : 'border-red-600/70'
              }`}
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-white font-semibold">
                  {step.success ? (
                    <FaCheckCircle className="text-emerald-400" />
                  ) : (
                    <FaTimesCircle className="text-red-400" />
                  )}
                  <span>{formatLabel(step.key)}</span>
                </div>
                <span className="text-xs text-gray-300">
                  {step.durationMs.toLocaleString('pt-BR')} ms
                </span>
              </div>

              {step.error && (
                <p className="text-sm text-red-200 mt-2">{step.error}</p>
              )}

              {step.summary && (
                <div className="mt-3 space-y-2 text-sm text-gray-200">
                  {Object.entries(step.summary).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-semibold text-gray-100">{key}:</span>{' '}
                      {typeof value === 'object' && value !== null ? (
                        <pre className="mt-1 bg-white/5 border border-white/10 rounded-md p-2 whitespace-pre-wrap text-[11px] text-gray-100">
                          {formatValue(value)}
                        </pre>
                      ) : (
                        <span>{formatValue(value)}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {step.meta && (
                <div className="mt-2 text-xs text-gray-400">
                  {Object.entries(step.meta).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-semibold">{key}:</span> {formatValue(value)}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {!loading && steps.length === 0 && (
          <p className="text-sm text-gray-300">
            Toque o botão acima para rodar todo o fluxo de coleta, análise e consulta. O painel exibirá o status de cada personagem.
          </p>
        )}
      </div>
    </div>
  );
};

export default RunAllPanel;
