import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ThemeSwitch } from "./ThemeSwitch";
import { UserChip } from "./UserChip";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { FiMenu, FiX } from "react-icons/fi";

const statusColors: Record<number, string> = {
  1: "bg-emerald-500/20 text-emerald-300",
  2: "bg-amber-500/20 text-amber-200",
  3: "bg-sky-500/20 text-sky-200",
  4: "bg-rose-500/20 text-rose-200"
};

const statusLabels: Record<number, string> = {
  1: "Operacional",
  2: "Manutenção",
  3: "Atualização",
  4: "Restrito"
};

const navLinks = [
  { href: "/", label: "Landing" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/alerts-test", label: "Alert test" }
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { status } = useSystemStatus();
  const [open, setOpen] = useState(false);

  const extendedNav = user?.isAdmin
    ? [...navLinks, { href: "/admin", label: "Admin base" }]
    : navLinks;

  const toggleMenu = () => setOpen((prev) => !prev);
  const closeMenu = () => setOpen(false);

  return (
    <div className="min-h-screen text-current">
      <header className="theme-glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/checkmate-logo.svg"
              alt="Checkmate"
              width={40}
              height={40}
              className="rounded-xl shadow-lg"
            />
            <div>
              <p className="text-lg font-bold uppercase tracking-widest">Checkmate</p>
              <p className="text-xs uppercase text-white/60">Crypto intelligence</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {extendedNav.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link text-sm font-semibold uppercase tracking-wide">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            {status && (
              <span className={`status-badge rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${statusColors[status.status] ?? "bg-white/10 text-white/70"}`}>
                {statusLabels[status.status] ?? "Desconhecido"}
              </span>
            )}
            <ThemeSwitch />
            <UserChip />
          </div>

          <button className="menu-button flex h-10 w-10 items-center justify-center rounded-lg border md:hidden" onClick={toggleMenu} aria-label="Abrir menu">
            {open ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>

        {open && (
          <div className="theme-glass border-t px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              {extendedNav.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link text-sm uppercase tracking-wide" onClick={closeMenu}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-3">
              {status && (
                <span className={`status-badge w-fit rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${statusColors[status.status] ?? "bg-white/10 text-white/70"}`}>
                  {statusLabels[status.status] ?? "Desconhecido"}
                </span>
              )}
              <ThemeSwitch />
              <UserChip />
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10">{children}</main>

      <footer className="theme-glass mt-16 border-t py-6 text-center text-xs uppercase tracking-[0.3em]">
        © {new Date().getFullYear()} Checkmate Intelligence. All rights reserved.
      </footer>
    </div>
  );
};
