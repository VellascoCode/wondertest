import { randomUUID } from "crypto";
import { readJSON, writeJSON } from "@/lib/fileStore";
import type { AlertLogItem, AlertType } from "@/types";

const ALERT_LOG_FILE = "alerts-log.json";
const MAX_ALERTS = 60;

const baseAlertPool: Array<Omit<AlertLogItem, "id" | "timestamp">> = [
  {
    type: "GROW_ME" as AlertType,
    subtype: "Momentum",
    description: "RSI abaixo de 30 e suporte relevante detectado",
    network: "ETH",
    level: "success",
    resolved: false
  },
  {
    type: "RABBIT_HOLE" as AlertType,
    subtype: "Volatilidade",
    description: "Volatilidade > 6% em 3 minutos com liquidez estável",
    network: "BSC",
    level: "warning",
    resolved: false
  },
  {
    type: "CHESHIRES_GRIN" as AlertType,
    subtype: "Risco",
    description: "SCAM Score acima de 80% em contrato recém-criado",
    network: "SOL",
    level: "error",
    resolved: false
  },
  {
    type: "QUEENS_ORDER" as AlertType,
    subtype: "Risk Control",
    description: "Stop global acionado por drawdown acumulado",
    network: "ETH",
    level: "system",
    resolved: false
  },
  {
    type: "DRINK_ME" as AlertType,
    subtype: "Listagem",
    description: "Novo token auditado com liquidez verificada",
    network: "ARB",
    level: "info",
    resolved: false
  }
];

async function ensureLog(): Promise<AlertLogItem[]> {
  return readJSON<AlertLogItem[]>(ALERT_LOG_FILE, []);
}

export async function getAlertLog(limit?: number): Promise<AlertLogItem[]> {
  const log = await ensureLog();
  return typeof limit === "number" ? log.slice(0, limit) : log;
}

export async function runBaseAlertScan(): Promise<AlertLogItem> {
  const log = await ensureLog();
  const nextIndex = Math.floor(Date.now() / (1000 * 60)) % baseAlertPool.length;
  const base = baseAlertPool[nextIndex];

  const alert: AlertLogItem = {
    ...base,
    id: randomUUID(),
    timestamp: new Date().toISOString()
  };

  const updated = [alert, ...log].slice(0, MAX_ALERTS);
  await writeJSON(ALERT_LOG_FILE, updated);
  return alert;
}

export async function markAlertAsResolved(id: string): Promise<void> {
  const log = await ensureLog();
  const updated = log.map((entry) => (entry.id === id ? { ...entry, resolved: true } : entry));
  await writeJSON(ALERT_LOG_FILE, updated);
}

export async function getLatestAlertsForDisplay(limit = 10) {
  const alerts = await getAlertLog(limit);
  return alerts.map((alert) => ({
    id: alert.id,
    title: `${alert.type} • ${alert.subtype}`,
    description: alert.description,
    level: alert.level,
    network: alert.network,
    timestamp: alert.timestamp,
    resolved: alert.resolved
  }));
}
