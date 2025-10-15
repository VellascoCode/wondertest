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

export type UserType = 0 | 1 | 8 | 9 | 10;

export type UserStatus = 0 | 1 | 2;

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  type: UserType;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  type: UserType;
  status: UserStatus;
}

export interface SessionUser extends PublicUser {
  isAdmin: boolean;
}

export type SystemStatusCode = 1 | 2 | 3 | 4;

export interface SystemStatusState {
  status: SystemStatusCode;
  label: string;
  message: string;
  updatedAt: string | null;
}

export interface AlertLogItem extends Alert {
  level: "info" | "success" | "warning" | "error" | "system";
  resolved: boolean;
}
