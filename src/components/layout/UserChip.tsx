import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const typeLabels: Record<number, string> = {
  0: "Explorer",
  1: "Trader",
  8: "Admin",
  9: "Super Admin",
  10: "Root"
};

const statusColors: Record<number, string> = {
  0: "bg-emerald-500 text-black",
  1: "bg-amber-400 text-black",
  2: "bg-rose-600 text-white"
};

export const UserChip: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/auth/signin" className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium hover:border-white/40 hover:bg-white/10">
          Entrar
        </Link>
        <Link href="/auth/signup" className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400">
          Criar conta
        </Link>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold">{user.name}</p>
        <p className="text-xs text-contrast-muted">{typeLabels[user.type] ?? "Membro"}</p>
      </div>
      <div className="user-avatar flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold uppercase">{initials}</div>
      <span className={`hidden rounded-full px-3 py-1 text-xs font-semibold capitalize sm:block ${statusColors[user.status] ?? "bg-slate-600"}`}>
        {user.status === 0 && "ok"}
        {user.status === 1 && "promo"}
        {user.status === 2 && "ban"}
      </span>
      <button
        onClick={logout}
        className="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide hover:border-red-400 hover:text-red-300"
      >
        Sair
      </button>
    </div>
  );
};
