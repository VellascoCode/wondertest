// // workers/drink_me.ts
// import {
//   JsonRpcProvider,
//   Contract,
//   keccak256,
//   toUtf8Bytes,
//   formatUnits,
//   Interface,
//   TransactionResponse,
//   Block,
// } from "ethers";
// import axios from "axios";
// import { MongoClient, Collection } from "mongodb";
// import {
//   DrinkMe,

//   Network,
//   SubType,
// } from "../../../models/drink_me";
// import clientPromise from "../../../lib/mongodb";

// export type DrinkMe = {
//   detectionType: "PAIR_CREATED" | "TOKEN_MINTED";
// };

// const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

// // ─── ENV VARS ──────────────────────────────────────────────────────────────
// const ETH_RPC = process.env.ETH_RPC || "";
// const BSC_RPC = process.env.BSC_RPC || "";
// const PAIR_BLOCK_WINDOW = parseInt(process.env.PAIR_WINDOW || "1000");
// const LIQ_THRESHOLD = parseFloat(process.env.PAIR_LIQUIDITY_THRESHOLD || "200");
// const MINT_THRESHOLD = parseFloat(process.env.MINT_USD_THRESHOLD || "1000");
// const IGNORE_SYMBOLS = new Set((process.env.IGNORE_SYMBOLS || "").split(","));
// const IGNORE_NAMES = new Set((process.env.IGNORE_NAMES || "").split(","));
// const SCAM_FLAGS = new Set((process.env.SCAM_FLAGS || "").split(","));
// const MAX_EVENTS = 20;

// // ─── CONTRACT ADDRESSES ────────────────────────────────────────────────────
// const FACTORIES = {
//   ETH: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f", // Uniswap V2 Factory
//   BSC: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73", // PancakeSwap Factory
// };

// // Certifique-se de ter tópicos com 64 caracteres após o 0x

// const PAIR_SIG = "0x0d3648bd0f6baeace89e99397fc76bcfafc98464000000000000000000000000"; // PairCreated
// const TRANSFER_SIG = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"; // Transfer
// const ADD_LIQ_SIG = "0xe8e3370000000000000000000000000000000000000000000000000000000000"; // AddLiquidity
// const SYNC_SIG = "0x1c411e9a942d4b3b0dcd7f62f54ce9a09f2379a93967ca53ad9c00f1d91d0d6d6";
// const SUSPICIOUS_FUNCTIONS = [
//   keccak256(toUtf8Bytes("transferFrom(address,address,uint256,bool)")).slice(0, 10),
//   keccak256(toUtf8Bytes("setFee(uint256)")).slice(0, 10),
// ];

// const OZ_ERC20_HASHES = [
//   "0x0819bf71",
//   "0x12210e8a",
//   "0x1738ae67",
//   "0x27e23902",
//   "0x35a00d02",
//   "0x41c728b9",
//   "0x47157eff",
//   "0x59569a1f",
//   "0x70a08231",
//   "0x7a250d56",
//   "0x95d89b41",
//   "0x95d89b41",
//   "0xa9059cbb",
//   "0xbaab7dbf",
//   "0xc0ee0b8a",
//   "0xddf252ad",
//   "0xf8a1ac6d",
// ].map((h) => h.toLowerCase());

// // ─── HELPERS ───────────────────────────────────────────────────────────────
// function getProvider(network: Network): JsonRpcProvider {
//   const url = network === "ETH" ? ETH_RPC : BSC_RPC;
//   return new JsonRpcProvider(url);
// }

// async function safeGetLogs(provider: JsonRpcProvider, filter: any): Promise<any[]> {
//   try {
//     // Garantir que todos os tópicos sejam 32 bytes (64 chars + '0x')
//     const formattedFilter = {
//       ...filter,
//       topics: filter.topics?.map((topic: string) => {
//         if (!topic.startsWith("0x")) topic = "0x" + topic;
//         return topic.padStart(66, "0x").padEnd(66, "0"); // força 32 bytes
//       }),
//     };

//     return await provider.getLogs(formattedFilter);
//   } catch (err) {
//     console.error(`[drink_me] Erro ao buscar logs`, err);
//     return [];
//   }
// }

// function isIgnored(symbol: string, name: string): boolean {
//   return IGNORE_SYMBOLS.has(symbol) || IGNORE_NAMES.has(name);
// }

// function isScamCandidate(symbol: string, name: string): boolean {
//   return (
//     symbol.startsWith("LP") ||
//     name.includes("Token") ||
//     name.includes("Coin") ||
//     SCAM_FLAGS.has(symbol) ||
//     SCAM_FLAGS.has(name)
//   );
// }

// type RiskLevel = "High" | "Medium" | "Low";

// function computeRiskLevel(score: number): RiskLevel {
//   if (score >= 70) return "High";
//   if (score >= 40) return "Medium";
//   return "Low";
// }

// type OpportunityLevel = "High" | "Medium" | "Low";

// function computeOpportunityLevel(quality: number): OpportunityLevel {
//   if (quality >= 70) return "High";
//   if (quality >= 40) return "Medium";
//   return "Low";
// }

// // ─── SCORE COMPUTATION ─────────────────────────────────────────────────────
// async function computeScores(
//   provider: JsonRpcProvider,
//   tokenAddress: string,
//   pairAddress: string | undefined,
//   creationTx: string,
//   blockNumber: number,
//   initialLiquidityUSD: number,
//   mintUSD: number,
//   ageDays: number,
//   sym: string,
//   name: string,
//   decimals: number,
//   subType: SubType,
//   network: Network
// ): Promise<{
//   subType: any;
//   riskScore: number;
//   qualityScore: number;
//   riskLevel: RiskLevel;
//   opportunityLevel: OpportunityLevel;
//   scoreDetails: any;
// }> {
//   let risk = 0;
//   let quality = 0;
//   const scoreDetails: any = {};

//   // 1. Token Name/Symbol Match
//   const scamCandidate = isScamCandidate(sym, name);
//   risk += scamCandidate ? 8.33 : 0;
//   quality += scamCandidate ? 0 : 8.33;
//   scoreDetails["scamCandidate"] = { value: scamCandidate, risk: scamCandidate ? 8.33 : 0, quality: scamCandidate ? 0 : 8.33 };
//   console.log(`[drink_me] Critério Scam Candidate: ${scamCandidate ? "Sim" : "Não"} -> ${scamCandidate ? "+8.33 risco" : "+8.33 qualidade"}`);

//   // 2. Owner Renounced/No Owner
//   let hasOwner = false;
//   try {
//     const owner = await new Contract(tokenAddress, ["function owner() view returns(address)"], provider).owner();
//     hasOwner = owner !== ZERO_ADDR;
//   } catch {
//     hasOwner = false;
//   }

//   risk += hasOwner ? 8.33 : 0;
//   quality += hasOwner ? 0 : 8.33;
//   scoreDetails["hasOwner"] = { value: hasOwner, risk: hasOwner ? 8.33 : 0, quality: hasOwner ? 0 : 8.33 };
//   console.log(`[drink_me] Critério Owner: ${hasOwner ? "Owner presente" : "Sem owner"} -> ${hasOwner ? "+8.33 risco" : "+8.33 qualidade"}`);

//   // 3. Bytecode Size
//   let bytecodeSize = 0;
//   let bytecodeOk = false;
//   try {
//     const bytecode = await provider.getCode(tokenAddress);
//     bytecodeSize = (bytecode.length - 2) / 2; // Remove '0x' and count bytes
//     bytecodeOk = bytecodeSize > 1500;
//   } catch {
//     bytecodeSize = 0;
//     bytecodeOk = false;
//   }

//   risk += bytecodeOk ? 0 : 8.33;
//   quality += bytecodeOk ? 8.33 : 0;
//   scoreDetails["bytecodeSize"] = { value: bytecodeSize, risk: bytecodeOk ? 0 : 8.33, quality: bytecodeOk ? 8.33 : 0 };
//   console.log(`[drink_me] Critério Tamanho do Bytecode: ${bytecodeSize} bytes -> ${bytecodeOk ? "+8.33 qualidade" : "+8.33 risco"}`);

//   // 4. Pure ERC-20
//   const erc20Funcs = [
//     keccak256(toUtf8Bytes("totalSupply()")).slice(0, 10),
//     keccak256(toUtf8Bytes("balanceOf(address)")).slice(0, 10),
//     keccak256(toUtf8Bytes("transfer(address,uint256)")).slice(0, 10),
//     keccak256(toUtf8Bytes("approve(address,uint256)")).slice(0, 10),
//   ];

//   let isPureErc20 = true;
//   try {
//     const bytecode = await provider.getCode(tokenAddress);
//     for (const func of erc20Funcs) {
//       if (!bytecode.includes(func.slice(2))) {
//         isPureErc20 = false;
//         break;
//       }
//     }
//   } catch {
//     isPureErc20 = false;
//   }

//   risk += isPureErc20 ? 0 : 8.33;
//   quality += isPureErc20 ? 8.33 : 0;
//   scoreDetails["pureErc20"] = { value: isPureErc20, risk: isPureErc20 ? 0 : 8.33, quality: isPureErc20 ? 8.33 : 0 };
//   console.log(`[drink_me] Critério ERC-20 Puro: ${isPureErc20 ? "Padrão" : "Funções extras"} -> ${isPureErc20 ? "+8.33 qualidade" : "+8.33 risco"}`);

//   // 5. No Suspicious Functions
//   let hasSuspicious = false;
//   try {
//     const bytecode = await provider.getCode(tokenAddress);
//     for (const func of SUSPICIOUS_FUNCTIONS) {
//       if (bytecode.includes(func.slice(2))) {
//         hasSuspicious = true;
//         break;
//       }
//     }
//   } catch {
//     hasSuspicious = false;
//   }

//   risk += hasSuspicious ? 8.33 : 0;
//   quality += hasSuspicious ? 0 : 8.33;
//   scoreDetails["noSuspiciousFuncs"] = { value: !hasSuspicious, risk: hasSuspicious ? 8.33 : 0, quality: hasSuspicious ? 0 : 8.33 };
//   console.log(`[drink_me] Critério Sem Funções Suspeitas: ${!hasSuspicious ? "Nenhuma" : "Encontrada"} -> ${hasSuspicious ? "+8.33 risco" : "+8.33 qualidade"}`);

//   // 6. OpenZeppelin Template
//   let isOZ = false;
//   try {
//     const bytecode = await provider.getCode(tokenAddress);
//     const hash = keccak256(bytecode);
//     isOZ = OZ_ERC20_HASHES.includes(hash.toLowerCase());
//   } catch {
//     isOZ = false;
//   }

//   risk += isOZ ? 0 : 8.33;
//   quality += isOZ ? 8.33 : 0;
//   scoreDetails["openZeppelin"] = { value: isOZ, risk: isOZ ? 0 : 8.33, quality: isOZ ? 8.33 : 0 };
//   console.log(`[drink_me] Critério OpenZeppelin: ${isOZ ? "Coincide" : "Custom"} -> ${isOZ ? "+8.33 qualidade" : "+8.33 risco"}`);

//   // 7. LP Locked
//   let lpLocked = false;
//   if (pairAddress) {
//     try {
//       const locker = await new Contract(pairAddress, ["function locked() view returns(bool)"], provider)
//         .locked()
//         .catch(() => false);
//       lpLocked = locker;
//     } catch {
//       lpLocked = false;
//     }
//   }

//   risk += lpLocked ? 0 : 8.33;
//   quality += lpLocked ? 8.33 : 0;
//   scoreDetails["lpLocked"] = { value: lpLocked, risk: lpLocked ? 0 : 8.33, quality: lpLocked ? 8.33 : 0 };
//   console.log(`[drink_me] Critério LP Locked: ${lpLocked ? "Sim" : "Não"} -> ${lpLocked ? "+8.33 qualidade" : "+8.33 risco"}`);

//   // 8. Contract Age
//   const contractAgeOk = ageDays <= 3;
//   risk += contractAgeOk ? 0 : 10;
//   quality += contractAgeOk ? 10 : 0;
//   scoreDetails["contractAge"] = { value: ageDays, risk: contractAgeOk ? 0 : 10, quality: contractAgeOk ? 10 : 0 };
//   console.log(`[drink_me] Critério Idade Contrato: ${ageDays} dias -> ${contractAgeOk ? "+10 qualidade" : "+10 risco"}`);

//   // 9. Pair Bytecode Size
//   let pairBytecodeSize = 0;
//   let pairBytecodeOk = false;
//   if (pairAddress) {
//     try {
//       const pairBytecode = await provider.getCode(pairAddress);
//       pairBytecodeSize = (pairBytecode.length - 2) / 2;
//       pairBytecodeOk = pairBytecodeSize > 1000;
//     } catch {
//       pairBytecodeSize = 0;
//       pairBytecodeOk = false;
//     }
//   }

//   risk += pairBytecodeOk ? 0 : 10;
//   quality += pairBytecodeOk ? 10 : 0;
//   scoreDetails["pairBytecodeSize"] = { value: pairBytecodeSize, risk: pairBytecodeOk ? 0 : 10, quality: pairBytecodeOk ? 10 : 0 };
//   console.log(`[drink_me] Critério Tamanho Bytecode Par: ${pairBytecodeSize} bytes -> ${pairBytecodeOk ? "+10 qualidade" : "+10 risco"}`);

//   // 10. Symbol Length
//   const symLengthOk = sym && sym.length >= 3 && sym.length <= 12;
//   risk += symLengthOk ? 0 : 8.33;
//   quality += symLengthOk ? 8.33 : 0;
//   scoreDetails["symbolLength"] = { value: sym.length, risk: symLengthOk ? 0 : 8.33, quality: symLengthOk ? 8.33 : 0 };
//   console.log(`[drink_me] Critério Comprimento Símbolo: ${sym.length} -> ${symLengthOk ? "+8.33 qualidade" : "+8.33 risco"}`);

//   // 11. Name Length
//   const nameLengthOk = name && name.length >= 5 && name.length <= 30;
//   risk += nameLengthOk ? 0 : 8.33;
//   quality += nameLengthOk ? 8.33 : 0;
//   scoreDetails["nameLength"] = { value: name.length, risk: nameLengthOk ? 0 : 8.33, quality: nameLengthOk ? 8.33 : 0 };
//   console.log(`[drink_me] Critério Comprimento Nome: ${name.length} -> ${nameLengthOk ? "+8.33 qualidade" : "+8.33 risco"}`);

//   // 12. Single Mint Event
//   let singleMint = false;
//   if (mintUSD > 0) {
//     try {
//       const mintLogs = await provider.getLogs({
//         address: tokenAddress,
//         topics: [TRANSFER_SIG, ZERO_ADDR],
//         fromBlock: blockNumber - 100,
//         toBlock: blockNumber + 100,
//       });
//       singleMint = mintLogs.length === 1;
//     } catch {
//       singleMint = false;
//     }
//   }

//   risk += singleMint ? 0 : 8.33;
//   quality += singleMint ? 8.33 : 0;
//   scoreDetails["singleMint"] = { value: singleMint, risk: singleMint ? 0 : 8.33, quality: singleMint ? 8.33 : 0 };
//   console.log(`[drink_me] Critério Único Mint: ${singleMint ? "Sim" : "Não"} -> ${singleMint ? "+8.33 qualidade" : "+8.33 risco"}`);

//   // Finalize
//   const finalRiskScore = Math.round(Math.min(100, risk));
//   const finalQualityScore = Math.round(Math.min(100, quality));
//   const riskLevel = computeRiskLevel(finalRiskScore);
//   const opportunityLevel = computeOpportunityLevel(finalQualityScore);

//   return {
//     subType,
//     riskScore: finalRiskScore,
//     qualityScore: finalQualityScore,
//     riskLevel,
//     opportunityLevel,
//     scoreDetails,
//   };
// }

// // ─── DETECT PAIRS ───────────────────────────────────────────────────────────
// async function detectPairs(
//   network: Network,
//   col: Collection<DrinkMe>,
//   savedSet: Set<string>
// ): Promise<{ valid: DrinkMe[]; scam: DrinkMe[] }> {
//   const provider = getProvider(network);
//   let latest: number;

//   try {
//     latest = await provider.getBlockNumber();
//   } catch {
//     console.log(`[drink_me] Falha ao obter último bloco em ${network}`);
//     return { valid: [], scam: [] };
//   }

//   const logs = await safeGetLogs(provider, {
//     address: FACTORIES[network],
//     topics: [PAIR_SIG], // certifique-se que tem 64 chars
//     fromBlock: latest - PAIR_BLOCK_WINDOW,
//     toBlock: latest,
//   });

//   console.log(`[drink_me] ${network} PAIR_CREATED: ${logs.length} logs encontrados`);

//   const iface = new Interface(["event PairCreated(address indexed token0, address indexed token1, address pair, uint256)"]);
//   const valid: DrinkMe[] = [];
//   const scamList: DrinkMe[] = [];

//   for (const log of logs.slice(0, MAX_EVENTS)) {
//     try {
//       const parsedLog = iface.parseLog(log);
//       if (!parsedLog || !parsedLog.args) throw new Error("Falha ao parsear evento");

//       const { token0, token1, pair } = parsedLog.args;
//       const tokenAddress = token0 as string;
//       const pairAddr = pair as string;

//       const erc = new Contract(tokenAddress, ["function symbol() view returns(string)", "function name() view returns(string)", "function decimals() view returns(uint8)"], provider);
//       const [sym, nm, dec] = await Promise.all([
//         erc.symbol().catch(() => ""),
//         erc.name().catch(() => ""),
//         erc.decimals().catch(() => 18),
//       ]);

//       const tokenName = nm || sym;
//       if (isIgnored(sym, tokenName)) {
//         console.log(`[drink_me] ${network} Par ${tokenAddress} ignorado: symbol=${sym}, name=${tokenName}`);
//         continue;
//       }

//       const base = network === "ETH" ? 3000 : 300;
//       let liqUsd = 0;
//       let amt = 0;
//       const isW0 = token0.toLowerCase() === token1.toLowerCase();

//       try {
//         const pool = new Contract(pairAddr, ["function getReserves() view returns(uint112,uint112,uint32)"], provider);
//         const [r0, r1] = await pool.getReserves();
//         amt = Number(formatUnits(isW0 ? r1 : r0, 18));
//         liqUsd = amt * base;
//       } catch {
//         console.log(`[drink_me] ${network} Par ${tokenAddress} falha ao obter reservas`);
//         continue;
//       }

//       if (liqUsd < LIQ_THRESHOLD) {
//         console.log(`[drink_me] ${network} Par ${tokenAddress} liquidez abaixo do limiar: ${liqUsd} USD`);
//         continue;
//       }

//       const blk: Block | null = await provider.getBlock(log.blockNumber);
//       const ageDays = blk ? (Date.now() / 1000 - blk.timestamp) / 86400 : 0;

//       const scores = await computeScores(
//         provider,
//         tokenAddress,
//         pairAddr,
//         log.transactionHash,
//         log.blockNumber,
//         liqUsd,
//         0,
//         ageDays,
//         sym,
//         tokenName,
//         dec,
//         "Dose de Liquidez",
//         network
//       );

//       const key = `${tokenAddress}:${scores.subType}`;
//       if (savedSet.has(key)) {
//         console.log(`[drink_me] ${network} Par ${tokenAddress} já processado como ${scores.subType}`);
//         continue;
//       }

//       const doc: DrinkMe = {
//         detectionType: "PAIR_CREATED",
//         subType: "Dose de Liquidez",
//         network,
//         tokenAddress,
//         pairAddress: pairAddr,
//         tokenSymbol: sym,
//         tokenName,
//         decimals: dec,
//         initialLiquidityUSD: liqUsd,
//         poolPrice: 0,
//         mintAmount: 0,
//         basePriceUSD: base,
//         usdValue: liqUsd,
//         holderCount: 0,
//         totalSupply: 0,
//         riskScore: scores.riskScore,
//         qualityScore: scores.qualityScore,
//         riskLevel: scores.riskLevel,
//         opportunityLevel: scores.opportunityLevel,
//         creationTx: log.transactionHash,
//         detectionTimestamp: new Date(),
//         blockNumber: log.blockNumber,
//         ageDays,
//         topHolderPct: 0,
//         audited: false,
//         scoreDetails: scores.scoreDetails,
//       };

//       if (scores.riskScore >= 70) {
//         scamList.push(doc);
//         console.log(`[drink_me] ${network} Par ${tokenAddress} classificado como scam: risk=${scores.riskScore}`);
//       } else {
//         valid.push(doc);
//         console.log(`[drink_me] ${network} Par ${tokenAddress} válido: risk=${scores.riskScore}, quality=${scores.qualityScore}`);
//       }

//     } catch (err) {
//       console.error(`[drink_me] Erro processando par ${log.transactionHash}:`, err);
//       continue;
//     }
//   }

//   return { valid, scam: scamList };
// }

// // ─── DETECT MINTS ───────────────────────────────────────────────────────────
// async function detectMints(
//   network: Network,
//   col: Collection<DrinkMe>,
//   savedSet: Set<string>
// ): Promise<{ valid: DrinkMe[]; scam: DrinkMe[] }> {
//   const provider = getProvider(network);
//   let latest: number;

//   try {
//     latest = await provider.getBlockNumber();
//   } catch {
//     console.log(`[drink_me] Falha ao obter último bloco em ${network}`);
//     return { valid: [], scam: [] };
//   }

//   const logs = await safeGetLogs(provider, {
//     topics: [TRANSFER_SIG, ZERO_ADDR],
//     fromBlock: latest - PAIR_BLOCK_WINDOW,
//     toBlock: latest,
//   });

//   console.log(`[drink_me] ${network} TOKEN_MINTED: ${logs.length} logs encontrados`);

//   const { eth, bnb } = await fetchBasePrices();
//   const base = network === "ETH" ? eth : bnb;

//   const valid: DrinkMe[] = [];
//   const scamList: DrinkMe[] = [];

//   for (const lg of logs.slice(0, MAX_EVENTS)) {
//     try {
//       const tokenAddress = lg.address;
//       const key = `${tokenAddress}:TOKEN_MINTED`;
//       if (savedSet.has(key)) {
//         console.log(`[drink_me] ${network} Mint ${tokenAddress} já processado`);
//         continue;
//       }

//       const erc = new Contract(
//         tokenAddress,
//         [
//           "function symbol() view returns(string)",
//           "function name() view returns(string)",
//           "function decimals() view returns(uint8)",
//           "function totalSupply() view returns(uint256)",
//         ],
//         provider
//       );

//       const [sym, nm, dec, ts] = await Promise.all([
//         erc.symbol().catch(() => ""),
//         erc.name().catch(() => ""),
//         erc.decimals().catch(() => 18),
//         erc.totalSupply().catch(() => 0),
//       ]);

//       const tokenName = nm || sym;
//       if (isIgnored(sym, tokenName)) {
//         console.log(`[drink_me] ${network} Mint ${tokenAddress} ignorado: symbol=${sym}, name=${tokenName}`);
//         continue;
//       }

//       const raw = lg.data;
//       if (typeof raw !== "string" || !/^0x[0-9a-fA-F]+$/.test(raw)) {
//         console.log(`[drink_me] ${network} Mint ${tokenAddress} dados inválidos: ${raw}`);
//         continue;
//       }

//       const mintAmt = Number(formatUnits(raw, dec));
//       const mintedUSD = mintAmt * base;

//       if (mintedUSD < MINT_THRESHOLD) {
//         console.log(`[drink_me] ${network} Mint ${tokenAddress} valor abaixo do limiar: ${mintedUSD} USD`);
//         continue;
//       }

//       const blk: Block | null = await provider.getBlock(lg.blockNumber);
//       const ageDays = blk ? (Date.now() / 1000 - blk.timestamp) / 86400 : 0;

//       const scores = await computeScores(
//         provider,
//         tokenAddress,
//         undefined,
//         lg.transactionHash,
//         lg.blockNumber,
//         0,
//         mintedUSD,
//         ageDays,
//         sym,
//         tokenName,
//         dec,
//         "Elixir de Contrato",
//         network
//       );

//       const doc: DrinkMe = {
//         detectionType: "TOKEN_MINTED",
//         subType: "Elixir de Contrato",
//         network,
//         tokenAddress,
//         pairAddress: undefined,
//         tokenSymbol: sym,
//         tokenName,
//         decimals: dec,
//         initialLiquidityUSD: 0,
//         poolPrice: 0,
//         mintAmount: mintAmt,
//         basePriceUSD: base,
//         usdValue: mintedUSD,
//         holderCount: 0,
//         totalSupply: Number(formatUnits(ts, dec)),
//         riskScore: scores.riskScore,
//         qualityScore: scores.qualityScore,
//         riskLevel: scores.riskLevel,
//         opportunityLevel: scores.opportunityLevel,
//         creationTx: lg.transactionHash,
//         detectionTimestamp: new Date(),
//         blockNumber: lg.blockNumber,
//         ageDays,
//         topHolderPct: 0,
//         audited: false,
//         scoreDetails: scores.scoreDetails,
//       };

//       if (scores.riskScore >= 70) {
//         scamList.push(doc);
//         console.log(`[drink_me] ${network} Mint ${tokenAddress} classificado como scam: risk=${scores.riskScore}`);
//       } else {
//         valid.push(doc);
//         console.log(`[drink_me] ${network} Mint ${tokenAddress} válido: risk=${scores.riskScore}, quality=${scores.qualityScore}`);
//       }

//     } catch (err) {
//       console.error(`[drink_me] Erro processando mint ${lg.transactionHash}:`, err);
//       continue;
//     }
//   }

//   return { valid, scam: scamList };
// }

// // ─── BASE PRICES ────────────────────────────────────────────────────────────
// async function fetchBasePrices(): Promise<{ eth: number; bnb: number }> {
//   try {
//     const res = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum%2Cbinancecoin&vs_currencies=usd");
//     const eth = res.data.ethereum.usd;
//     const bnb = res.data.binancecoin.usd;
//     return { eth, bnb };
//   } catch (err) {
//     console.warn("[drink_me] Falha ao obter preços da API, usando valores padrão");
//     return { eth: 3000, bnb: 300 };
//   }
// }

// // ─── API HANDLER ────────────────────────────────────────────────────────────
// export default async function handler(req: any, res: any) {
//   try {
//     const client = await clientPromise;
//     const col = client.db().collection<DrinkMe>("drink_me");

//     console.log("[drink_me] Iniciando worker");

//     const raw = await col.find().sort({ detectionTimestamp: -1 }).limit(20).toArray();
//     const savedSet = new Set(raw.map((d) => d.tokenAddress + ":" + d.detectionType));

//     const [{ valid: pEth, scam: sEth }, { valid: pBsc, scam: sBsc }, { valid: mEth, scam: msEth }, { valid: mBsc, scam: msBsc }] = await Promise.all([
//       detectPairs("ETH", col, savedSet),
//       detectPairs("BSC", col, savedSet),
//       detectMints("ETH", col, savedSet),
//       detectMints("BSC", col, savedSet),
//     ]);

//     const detected = [...pEth, ...pBsc, ...mEth, ...mBsc].filter((v, i, a) =>
//       a.findIndex((x) => x.tokenAddress === v.tokenAddress && x.detectionType === v.detectionType) === i
//     );

//     const scamsByKey = [...sEth, ...sBsc, ...msEth, ...msBsc].filter(
//       (s) => !savedSet.has(s.tokenAddress + ":" + s.detectionType)
//     ).reduce((acc: Record<string, DrinkMe[]>, s) => {
//       const key = `${s.network}:${s.subType}`;
//       if (!acc[key]) acc[key] = [];
//       acc[key].push(s);
//       return acc;
//     }, {});

//     const scamList = Object.values(scamsByKey).flatMap((list) => list.slice(0, 2)).slice(0, 10);
//     if (detected.length > 0) await col.insertMany(detected);
//     if (scamList.length > 0) await col.insertMany(Object.values(scamsByKey).flat());

//     console.log(`[drink_me] Detectados: pairs ETH=${pEth.length}, BSC=${pBsc.length}, mints ETH=${mEth.length}, BSC=${mBsc.length}`);

//     res.status(200).json({
//       success: true,
//       inserted: detected.length + scamList.length,
//       stats: {
//         pairs: { eth: pEth.length, bsc: pBsc.length },
//         mints: { eth: mEth.length, bsc: mBsc.length },
//         scams: scamList.length,
//       },
//     });
//   } catch (err: any) {
//     console.error("[drink_me] Erro no handler:", err.message || err);
//     res.status(500).json({ success: false, error: err.message || "Erro interno" });
//   }
// }