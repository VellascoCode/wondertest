#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const DATA_PATH = path.join(__dirname, "..", "data", "alerts-log.json");
const MAX_ALERTS = 60;

const basePool = [
  {
    type: "GROW_ME",
    subtype: "Momentum",
    description: "RSI abaixo de 30 e suporte relevante detectado",
    network: "ETH",
    level: "success",
    resolved: false
  },
  {
    type: "RABBIT_HOLE",
    subtype: "Volatilidade",
    description: "Volatilidade > 6% em 3 minutos com liquidez estável",
    network: "BSC",
    level: "warning",
    resolved: false
  },
  {
    type: "CHESHIRES_GRIN",
    subtype: "Risco",
    description: "SCAM Score acima de 80% em contrato recém-criado",
    network: "SOL",
    level: "error",
    resolved: false
  },
  {
    type: "QUEENS_ORDER",
    subtype: "Risk Control",
    description: "Stop global acionado por drawdown acumulado",
    network: "ETH",
    level: "system",
    resolved: false
  },
  {
    type: "DRINK_ME",
    subtype: "Listagem",
    description: "Novo token auditado com liquidez verificada",
    network: "ARB",
    level: "info",
    resolved: false
  }
];

function readLog() {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function writeLog(log) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(log, null, 2), "utf-8");
}

function runScan() {
  const log = readLog();
  const index = Math.floor(Date.now() / (1000 * 60)) % basePool.length;
  const base = basePool[index];
  const alert = { ...base, id: randomUUID(), timestamp: new Date().toISOString() };
  const updated = [alert, ...log].slice(0, MAX_ALERTS);
  writeLog(updated);
  console.log(`[${new Date().toISOString()}] alerta ${alert.type} gravado`);
}

console.log("Iniciando cron de alertas (5 min)...");
runScan();
const interval = setInterval(runScan, 5 * 60 * 1000);

process.on("SIGINT", () => {
  clearInterval(interval);
  console.log("Cron finalizado");
  process.exit(0);
});
