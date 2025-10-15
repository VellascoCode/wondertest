import type { Collection, WithId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import type { SystemStatusState, SystemStatusCode } from "@/types";

const STATUS_DOCUMENT_ID = "global";

const DEFAULT_STATUS: SystemStatusState = {
  status: 1,
  label: "Operacional",
  message: "Tudo funcionando normalmente",
  updatedAt: null
};

interface SystemStatusDocument extends Omit<SystemStatusState, "updatedAt"> {
  _id: string;
  updatedAt: Date | null | string;
}

let statusCollectionPromise: Promise<Collection<SystemStatusDocument>> | null = null;

async function getStatusCollection(): Promise<Collection<SystemStatusDocument>> {
  if (!statusCollectionPromise) {
    statusCollectionPromise = (async () => {
      const client = await clientPromise;
      const collection = client.db().collection<SystemStatusDocument>("system_status");
      await collection.createIndex({ _id: 1 }, { unique: true });
      return collection;
    })();
  }
  return statusCollectionPromise;
}

function toIsoString(value: Date | null | string): string | null {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date(value).toISOString();
}

function mapStatusDocument(doc: WithId<SystemStatusDocument>): SystemStatusState {
  return {
    status: doc.status,
    label: doc.label,
    message: doc.message,
    updatedAt: toIsoString(doc.updatedAt)
  };
}

export async function getSystemStatus(): Promise<SystemStatusState> {
  const collection = await getStatusCollection();
  const doc = await collection.findOne({ _id: STATUS_DOCUMENT_ID });
  if (!doc) {
    const inserted: SystemStatusDocument = {
      _id: STATUS_DOCUMENT_ID,
      status: DEFAULT_STATUS.status,
      label: DEFAULT_STATUS.label,
      message: DEFAULT_STATUS.message,
      updatedAt: null
    };
    await collection.insertOne(inserted);
    return DEFAULT_STATUS;
  }
  return mapStatusDocument(doc);
}

export async function setSystemStatus(status: SystemStatusCode, label: string, message: string): Promise<SystemStatusState> {
  const collection = await getStatusCollection();
  const now = new Date();
  await collection.updateOne(
    { _id: STATUS_DOCUMENT_ID },
    {
      $set: {
        status,
        label,
        message,
        updatedAt: now
      }
    },
    { upsert: true }
  );

  return {
    status,
    label,
    message,
    updatedAt: now.toISOString()
  };
}
