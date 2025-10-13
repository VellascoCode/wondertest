import { ObjectId } from "mongodb";

export type Network = "ETH" | "BSC";
export type SubType = "Elixir de Criação" | "Dose de Liquidez" | "Gole de Listagem";

export interface DrinkMe {
  _id?: ObjectId;
  network: Network;
  subType: SubType;              // Identifica o tipo: Elixir, Dose, Gole etc
  tokenAddress: string;
  txHash: string;
  blockNumber: number;
  timestamp: Date | string;      // ISO ou Date
  name: string;
  symbol: string;
  decimals: number;
  score: number;
  classification: string;
  scam: boolean;
  ranking: number;
  classificacao: string;
  risco: string;
  oportunidade: number;
  nivelDescam: string;
  notaGeral: string;
  outrasInfos: {
    symbolValid: boolean;
    nameValid: boolean;
    decimalsValid: boolean;
    symbolNameDifferent: boolean;
    symbolClean: boolean;
    nameClean: boolean;
    isLP: boolean;
    completeERC20: boolean;
  };
  explanation: string[];

  // CAMPOS DE PAR, LIQUIDEZ, PREÇO (para Dose e Gole, ficam null no Elixir)
  pairAddress?: string;               // Endereço do par (Uniswap, Pancake etc)
  pairedTokenAddress?: string;        // Endereço do token pareado (ex: WETH, BNB, USDT)
  pairedTokenSymbol?: string;         // Símbolo do token pareado
  pairedTokenName?: string;           // Nome do token pareado
  pairedTokenDecimals?: number;       // Decimais do token pareado
  initialLiquidityUSD?: number;       // Liquidez inicial do par (USD)
  poolPrice?: number;                 // Preço do token na pool (USD ou outra moeda base)
  mintAmount?: number;                // Quantidade mintada (Gole/Dose)
  basePriceUSD?: number;              // Preço base (caso tenha)
  usdValue?: number;                  // Valor do token em USD (caso tenha)
  totalSupply?: number;               // Supply total
  holderCount?: number;               // Número de holders
  creationTx?: string;                // Tx de criação do contrato/pair

  // Flags de envio de alerta
  sentTelegram?: boolean;
  sentWhatsApp?: boolean;
  sentTwitter?: boolean;
  sentDesktop?: boolean;
  sentEmail?: boolean;

  // Controle de registro
  createdAt?: Date;
  updatedAt?: Date;
}
