import { readJSON, writeJSON } from "@/lib/fileStore";
import type { SystemStatusState, SystemStatusCode } from "@/types";

const STATUS_FILE = "system-status.json";

const DEFAULT_STATUS: SystemStatusState = {
  status: 1,
  label: "Operacional",
  message: "Tudo funcionando normalmente",
  updatedAt: null
};

export async function getSystemStatus(): Promise<SystemStatusState> {
  return readJSON<SystemStatusState>(STATUS_FILE, DEFAULT_STATUS);
}

export async function setSystemStatus(status: SystemStatusCode, label: string, message: string): Promise<SystemStatusState> {
  const next: SystemStatusState = {
    status,
    label,
    message,
    updatedAt: new Date().toISOString()
  };
  await writeJSON<SystemStatusState>(STATUS_FILE, next);
  return next;
}
