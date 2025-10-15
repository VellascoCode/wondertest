import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSystemStatus } from "@/hooks/useSystemStatus";

const statusRoutes: Record<number, string> = {
  2: "/status/maintenance",
  3: "/status/updating",
  4: "/status/restricted"
};

const bypassRoutes = ["/status/maintenance", "/status/updating", "/status/restricted"];

export const SystemStatusGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { status } = useSystemStatus();
  const router = useRouter();

  useEffect(() => {
    if (!status) return;
    if (status.status === 1) return;
    if (user?.isAdmin) return;

    const target = statusRoutes[status.status];
    if (!target) return;

    if (router.pathname !== target && !bypassRoutes.includes(router.pathname) && !router.pathname.startsWith("/auth")) {
      router.replace(target);
    }
  }, [router, status, user]);

  return <>{children}</>;
};
