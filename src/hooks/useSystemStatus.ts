import { useCallback, useEffect, useState } from "react";
import type { SystemStatusState } from "@/types";

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatusState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/system/status");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Falha ao carregar status do sistema", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { status, loading, refresh };
}
