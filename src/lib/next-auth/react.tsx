import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Session, SessionStatus } from "./index";
import type { SessionUser } from "@/types";

type SignInResponse = {
  ok: boolean;
  status: number;
  error?: string;
};

type SignOutResponse = {
  ok: boolean;
};

interface SessionContextValue {
  data: Session | null;
  status: SessionStatus;
  update: () => Promise<void>;
}

interface SessionManager {
  setSession: (session: Session | null) => void;
  setStatus: (status: SessionStatus) => void;
  refresh: () => Promise<void>;
}

let sessionManagerRef: SessionManager | null = null;

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

async function fetchSession(): Promise<Session | null> {
  const response = await fetch("/api/auth/session");
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  if (data?.user) {
    return { user: data.user as SessionUser };
  }
  return null;
}

export interface SessionProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  const initialSession = useRef(session ?? null);
  const [data, setData] = useState<Session | null>(initialSession.current);
  const [status, setStatus] = useState<SessionStatus>(initialSession.current ? "authenticated" : "loading");

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const latest = await fetchSession();
      if (latest) {
        setData(latest);
        setStatus("authenticated");
      } else {
        setData(null);
        setStatus("unauthenticated");
      }
    } catch (error) {
      console.error("Falha ao atualizar sessão", error);
      setData(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    if (!initialSession.current) {
      refresh().catch((error) => console.error(error));
    } else {
      setStatus("authenticated");
    }
  }, [refresh]);

  useEffect(() => {
    sessionManagerRef = {
      setSession: setData,
      setStatus,
      refresh
    };
    return () => {
      sessionManagerRef = null;
    };
  }, [refresh]);

  const value = useMemo<SessionContextValue>(
    () => ({
      data,
      status,
      update: refresh
    }),
    [data, refresh, status]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession deve ser utilizado dentro de SessionProvider");
  }
  return context;
}

export async function signIn(
  provider: string,
  options: { email: string; password: string; redirect?: boolean }
): Promise<SignInResponse> {
  if (provider !== "credentials") {
    return { ok: false, status: 400, error: "Provedor não suportado" };
  }

  const response = await fetch("/api/auth/callback/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: options.email, password: options.password })
  });

  const data = await response.json();
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: data?.error ?? "Não foi possível entrar"
    };
  }

  if (sessionManagerRef) {
    sessionManagerRef.setSession({ user: data.user as SessionUser });
    sessionManagerRef.setStatus("authenticated");
  }

  return { ok: true, status: response.status };
}

export async function signOut(options: { redirect?: boolean } = {}): Promise<SignOutResponse> {
  void options;
  await fetch("/api/auth/signout", { method: "POST" });
  if (sessionManagerRef) {
    sessionManagerRef.setSession(null);
    sessionManagerRef.setStatus("unauthenticated");
  }
  return { ok: true };
}
