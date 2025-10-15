import { randomUUID } from "crypto";
import type { Collection, FindOptions, WithId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import type { AlertLogItem, AlertType } from "@/types";

const MAX_ALERTS = 60;

interface AlertDocument extends Omit<AlertLogItem, "timestamp"> {
  timestamp: Date;
}

let alertsCollectionPromise: Promise<Collection<AlertDocument>> | null = null;

async function getAlertsCollection(): Promise<Collection<AlertDocument>> {
  if (!alertsCollectionPromise) {
    alertsCollectionPromise = (async () => {
      const client = await clientPromise;
      const collection = client.db().collection<AlertDocument>("alerts_log");
      await collection.createIndex({ id: 1 }, { unique: true });
      await collection.createIndex({ timestamp: -1 });
      return collection;
    })();
  }
  return alertsCollectionPromise;
}

function mapAlertDocument(doc: WithId<AlertDocument>): AlertLogItem {
  return {
    id: doc.id,
    type: doc.type,
    subtype: doc.subtype,
    description: doc.description,
    timestamp: doc.timestamp.toISOString(),
    token_address: doc.token_address,
    affected_tokens: doc.affected_tokens,
    network: doc.network,
    level: doc.level,
    resolved: doc.resolved
  };
}

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

export async function getAlertLog(limit?: number): Promise<AlertLogItem[]> {
  const collection = await getAlertsCollection();
  const options: FindOptions<AlertDocument> = { sort: { timestamp: -1 } };
  if (typeof limit === "number") {
    options.limit = limit;
  }
  const docs = await collection.find({}, options).toArray();
  return docs.map(mapAlertDocument);
}

export async function runBaseAlertScan(): Promise<AlertLogItem> {
  const collection = await getAlertsCollection();
  const nextIndex = Math.floor(Date.now() / (1000 * 60)) % baseAlertPool.length;
  const base = baseAlertPool[nextIndex];

  const alert: AlertLogItem = {
    ...base,
    id: randomUUID(),
    timestamp: new Date().toISOString()
  };

  await collection.insertOne({
    ...alert,
    timestamp: new Date(alert.timestamp)
  });

  const excess = await collection
    .find({}, { sort: { timestamp: -1 }, skip: MAX_ALERTS, projection: { _id: 1 } })
    .toArray();
  if (excess.length > 0) {
    await collection.deleteMany({ _id: { $in: excess.map((doc) => doc._id) } });
  }

  return alert;
}

export async function markAlertAsResolved(id: string): Promise<void> {
  const collection = await getAlertsCollection();
  await collection.updateOne({ id }, { $set: { resolved: true } });
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
