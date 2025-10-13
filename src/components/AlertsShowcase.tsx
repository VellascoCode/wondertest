// components/AlertsShowcase.tsx
import React from "react";
import AlertCard from "./AlertCard";
import type { Alert } from "../types";

const sampleAlerts: Alert[] = [
  // DRINK_ME
  {
    id: "1",
    type: "DRINK_ME",
    subtype: "Novo Token Listado",
    description: "Token $ALICE listado com pool de 50k USD.",
    timestamp: "2025-06-28T12:00:00Z",
    token_address: "0x123...",
    network: "ETH",
  },
  {
    id: "2",
    type: "DRINK_ME",
    subtype: "Listagem Relevante",
    description: "Token $CHESHIRE agora em DEX principal.",
    timestamp: "2025-06-28T12:05:00Z",
    token_address: "0xabc...",
    network: "BSC",
  },
  // EAT_ME
  {
    id: "3",
    type: "EAT_ME",
    subtype: "Pump Detectado",
    description: "Preço de $MADHAT ↑18% em 4min.",
    timestamp: "2025-06-28T12:10:00Z",
    token_address: "0x456...",
    network: "ETH",
  },
  {
    id: "4",
    type: "EAT_ME",
    subtype: "Pump Extremo",
    description: "Preço de $MADHAT ↑30% em 3min!",
    timestamp: "2025-06-28T12:12:00Z",
    token_address: "0x456...",
    network: "ETH",
  },
  // GROW_ME
  {
    id: "5",
    type: "GROW_ME",
    subtype: "Hora de Crescer",
    description: "RSI 25 e candle tocou suporte em $QUEEN.",
    timestamp: "2025-06-28T12:15:00Z",
    token_address: "0x789...",
    network: "BSC",
  },
  {
    id: "6",
    type: "GROW_ME",
    subtype: "Alta Consistente",
    description: "3 candles de alta suave em $RABBIT.",
    timestamp: "2025-06-28T12:20:00Z",
    token_address: "0x101...",
    network: "ETH",
  },
  // SHRINK_ME
  {
    id: "7",
    type: "SHRINK_ME",
    subtype: "Resistência Forte",
    description: "RSI 75 e candle tocou resistência em $DRINK.",
    timestamp: "2025-06-28T12:25:00Z",
    token_address: "0x202...",
    network: "BSC",
  },
  {
    id: "8",
    type: "SHRINK_ME",
    subtype: "Reversão Iminente",
    description: "Topo duplo detectado em $DRINK.",
    timestamp: "2025-06-28T12:30:00Z",
    token_address: "0x202...",
    network: "BSC",
  },
  // RABBIT_HOLE
  {
    id: "9",
    type: "RABBIT_HOLE",
    subtype: "Entrada Rápida",
    description: "Variação 6% em 2min, spread 0.2%.",
    timestamp: "2025-06-28T12:35:00Z",
    token_address: "0x303...",
    network: "ETH",
  },
  {
    id: "10",
    type: "RABBIT_HOLE",
    subtype: "Movimento Anormal",
    description: "Spike de volume 12% MC em 2.5min.",
    timestamp: "2025-06-28T12:40:00Z",
    token_address: "0x303...",
    network: "ETH",
  },
  // TEA_PARTY
  {
    id: "11",
    type: "TEA_PARTY",
    subtype: "Zona de Compra",
    description: "RSI em 32 por 6min.",
    timestamp: "2025-06-28T12:45:00Z",
    token_address: "0x404...",
    network: "BSC",
  },
  {
    id: "12",
    type: "TEA_PARTY",
    subtype: "Acumulação Técnica",
    description: "Volume cresce e candles pequenos.",
    timestamp: "2025-06-28T12:50:00Z",
    token_address: "0x404...",
    network: "BSC",
  },
  // QUEENS_ORDER
  {
    id: "13",
    type: "QUEENS_ORDER",
    subtype: "Stop Global",
    description: "P&L < –10% na sessão, stop ativado.",
    timestamp: "2025-06-28T12:55:00Z",
    affected_tokens: ["0x123...", "0x202..."],
    network: "ETH",
  },
  {
    id: "14",
    type: "QUEENS_ORDER",
    subtype: "Operação Bloqueada",
    description: "Pump extremo + SCAM crítico.",
    timestamp: "2025-06-28T13:00:00Z",
    affected_tokens: ["0x456..."],
    network: "ETH",
  },
  // CHESHIRES_GRIN
  {
    id: "15",
    type: "CHESHIRES_GRIN",
    subtype: "SCAM Alto",
    description: "SCAM Score 82% em $CHESHIRE.",
    timestamp: "2025-06-28T13:05:00Z",
    token_address: "0x505...",
    network: "BSC",
  },
  {
    id: "16",
    type: "CHESHIRES_GRIN",
    subtype: "SCAM Crítico",
    description: "SCAM Score 95% em $CHESHIRE.",
    timestamp: "2025-06-28T13:10:00Z",
    token_address: "0x505...",
    network: "BSC",
  },
];

export default function AlertsShowcase() {
  return (
    <div className=" p-6 bg-gray-900  grid grid-cols-3 gap-2">
      {sampleAlerts.map(alert => (
        <AlertCard key={alert.id} {...alert} />
      ))}
    </div>
  );
}
