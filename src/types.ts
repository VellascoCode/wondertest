// types.ts
export interface Token {
    id: string;
    symbol: string;
    name: string;
    image: string;
    price: number;
    marketCap: number;
    rank: number;
    volume: number;
    change24h: number;
    percentChange24h: number;
  }
  
  export type AlertType =
  | "DRINK_ME"
  | "EAT_ME"
  | "GROW_ME"
  | "SHRINK_ME"
  | "RABBIT_HOLE"
  | "TEA_PARTY"
  | "QUEENS_ORDER"
  | "CHESHIRES_GRIN";

export interface Alert {
  id: string;
  type: AlertType;
  subtype: string;
  description: string;
  timestamp: string;              // ISO
  token_address?: string;
  affected_tokens?: string[];     // só para QUEENS_ORDER subtipo “Operação Bloqueada”
  network: string;                // ex: "ETH" ou "BSC"
}
