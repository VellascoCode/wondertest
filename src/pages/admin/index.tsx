import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { useMemo, useState } from "react";
import { FiArrowUpRight, FiCheckCircle } from "react-icons/fi";
import { FaTools, FaShieldAlt, FaUsersCog } from "react-icons/fa";
import toast from "react-hot-toast";
import SectionTitle from "@/components/SectionTitle";
import RunAllPanel from "@/components/RunAllPanel";
import { getSystemStatus } from "@/lib/systemStatus";
import { getAllUsers, toPublicUser } from "@/lib/auth/userService";
import type { PublicUser, SessionUser, SystemStatusState } from "@/types";
import { authOptions } from "@/lib/auth/nextAuthOptions";

const statusOptions: Array<{ value: number; label: string; message: string; accent: string }> = [
  { value: 1, label: "Operacional", message: "Sistema aberto para todos os usuários.", accent: "bg-emerald-500/15 text-emerald-200" },
  { value: 2, label: "Manutenção", message: "Serviços temporariamente indisponíveis para ajustes.", accent: "bg-amber-500/15 text-amber-200" },
  { value: 3, label: "Atualização", message: "Novos módulos estão sendo implantados.", accent: "bg-sky-500/15 text-sky-200" },
  { value: 4, label: "Restrito", message: "Apenas contas autorizadas podem acessar.", accent: "bg-rose-500/15 text-rose-200" }
];

const typeOptions = [
  { value: 0, label: "0 - Explorer" },
  { value: 1, label: "1 - Trader" },
  { value: 8, label: "8 - Admin" },
  { value: 9, label: "9 - Super Admin" },
  { value: 10, label: "10 - Root" }
];

const statusUserOptions = [
  { value: 0, label: "0 - OK" },
  { value: 1, label: "1 - Promo" },
  { value: 2, label: "2 - Ban" }
];

const deckHighlights = [
  {
    title: "Status global em segundos",
    description: "Atualize mensagens exibidas no gate e mantenha coesão entre temas e manutenção."
  },
  {
    title: "Gestão de credenciais",
    description: "Promova administradores, congele contas suspeitas e monitore campanhas promocionais."
  },
  {
    title: "Orquestrações auditáveis",
    description: "Execute pipelines completos com logs centralizados e feedback em tempo real."
  }
];

const governanceWatchers = [
  {
    name: "Pocket Watch",
    summary: "Agrega tokens emergentes e suas métricas principais.",
    endpoint: "/api/whiterabbit/pocket_watch"
  },
  {
    name: "Looking Glass",
    summary: "Atualiza thresholds estatísticos com base no mercado.",
    endpoint: "/api/whiterabbit/looking_glass"
  },
  {
    name: "Discover",
    summary: "Snapshot consolidado para dashboards e rankings.",
    endpoint: "/api/whiterabbit/discover"
  },
  {
    name: "Drink Me",
    summary: "Listagens auditadas e métricas de risco agregadas.",
    endpoint: "/api/drink_me/fetch"
  },
  {
    name: "Alert Cron",
    summary: "Gera e resolve alertas para o laboratório de QA.",
    endpoint: "/api/alerts/run"
  }
];

interface AdminProps {
  systemStatus: SystemStatusState;
  users: PublicUser[];
}

type AdminPageProps = AdminProps & { session?: Session | null };

export default function AdminPage({ systemStatus: initialSystemStatus, users: initialUsers }: AdminPageProps) {
  const [systemStatus, setSystemStatus] = useState<SystemStatusState>(initialSystemStatus);
  const [statusLabel, setStatusLabel] = useState(initialSystemStatus.label);
  const [statusMessage, setStatusMessage] = useState(initialSystemStatus.message);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [users, setUsers] = useState(initialUsers);

  const currentOption = useMemo(
    () => statusOptions.find((option) => option.value === systemStatus.status) ?? statusOptions[0],
    [systemStatus.status]
  );

  const totalUsers = users.length;
  const adminUsersCount = useMemo(() => users.filter((user) => user.type >= 8).length, [users]);
  const promoUsersCount = useMemo(() => users.filter((user) => user.status === 1).length, [users]);
  const blockedUsersCount = useMemo(() => users.filter((user) => user.status === 2).length, [users]);

  const heroMetrics = [
    {
      label: "Usuários totais",
      value: totalUsers.toString().padStart(2, "0"),
      description: "Inclui todos os níveis e estados."
    },
    {
      label: "Admins ativos",
      value: adminUsersCount.toString().padStart(2, "0"),
      description: "Contas com type ≥ 8."
    },
    {
      label: "Promoções ativas",
      value: promoUsersCount.toString().padStart(2, "0"),
      description: "Status 1 - Promo."
    },
    {
      label: "Bloqueados",
      value: blockedUsersCount.toString().padStart(2, "0"),
      description: "Status 2 - Ban."
    }
  ];

  const handleStatusChange = async (value: number, label: string, message: string) => {
    setStatusLabel(label);
    setStatusMessage(message);
    setUpdatingStatus(true);
    try {
      const response = await fetch("/api/system/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value, label, message })
      });
      if (!response.ok) {
        throw new Error("Falha ao atualizar status");
      }
      const data = await response.json();
      setSystemStatus(data);
      toast.success("Status atualizado");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUserUpdate = async (id: string, patch: Partial<Pick<PublicUser, "type" | "status">>) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Não foi possível atualizar usuário");
      }
      const data = await response.json();
      setUsers((prev) => prev.map((user) => (user.id === id ? data.user : user)));
      toast.success("Usuário atualizado");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <>
      <Head>
        <title>Admin • Checkmate</title>
      </Head>
      <div className="space-y-10">
        <section className="theme-glass rounded-3xl border px-10 py-10 shadow-lg">
          <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-black/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">
                Wonderland Quant Deck
              </span>
              <h1 className="text-3xl font-bold leading-tight md:text-4xl">
                Governança e telemetria central do ecossistema Wonderland
              </h1>
              <p className="max-w-2xl text-sm text-contrast-muted">
                Controle o status global da plataforma, ajuste mensagens do gate, promova usuários e mantenha a operação coordenada com os scanners.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {deckHighlights.map((highlight) => (
                  <li key={highlight.title} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <FiCheckCircle className="mt-1 text-emerald-300" />
                    <div>
                      <p className="text-sm font-semibold">{highlight.title}</p>
                      <p className="mt-1 text-xs text-contrast-muted">{highlight.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-white/10 bg-black/30 p-6 shadow-inner">
              <div className={`w-fit rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] ${currentOption.accent}`}>
                {currentOption.label}
              </div>
              <p className="text-sm text-contrast-muted">{systemStatus.message}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-contrast-muted transition hover:border-emerald-400/60 hover:text-white"
                >
                  Ver landing
                  <FiArrowUpRight />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-contrast-muted transition hover:border-emerald-400/60 hover:text-white"
                >
                  Abrir dashboard
                  <FiArrowUpRight />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-white/10 bg-black/20 p-4 shadow-inner">
                <p className="text-xs uppercase tracking-[0.3em] text-contrast-muted">{metric.label}</p>
                <p className="mt-2 text-3xl font-bold text-white">{metric.value}</p>
                <p className="mt-1 text-xs text-contrast-muted">{metric.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
            <SectionTitle title="🧩 Orquestração Wonderland" icon={<FaTools />} />
            <p className="mt-2 text-sm text-contrast-muted">
              Execute o pipeline completo para sincronizar Pocket Watch, Looking Glass, Discover e Drink Me diretamente do painel administrativo.
            </p>
            <div className="mt-4">
              <RunAllPanel />
            </div>
          </div>

          <div className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
            <SectionTitle title="🛡️ Governança & Admin" icon={<FaShieldAlt />} />
            <p className="mt-2 text-sm text-contrast-muted">
              Endpoints críticos monitorados pelo time de operações. Utilize-os para auditorias e verificações rápidas.
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              {governanceWatchers.map((item) => (
                <li key={item.endpoint} className="flex flex-col rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold uppercase tracking-[0.2em] text-white">{item.name}</span>
                    <code className="rounded-full bg-black/40 px-3 py-1 text-[11px] text-emerald-200">{item.endpoint}</code>
                  </div>
                  <p className="mt-2 text-xs text-contrast-muted">{item.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
          <SectionTitle title="Configurações de disponibilidade" icon={<FaShieldAlt />} />
          <p className="mt-2 text-sm text-contrast-muted">
            Ajuste o comportamento das rotas públicas durante manutenção, atualizações ou períodos restritos. Todas as mudanças são aplicadas instantaneamente.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value, option.label, option.message)}
                className={`rounded-2xl border px-5 py-4 text-left transition ${
                  systemStatus.status === option.value ? "border-emerald-400/60 bg-emerald-500/10" : "border-white/10 bg-black/20"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.3em] text-contrast-muted">{option.label}</p>
                <p className="mt-2 text-sm text-contrast-muted">{option.message}</p>
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em]">Título exibido</label>
              <input
                className="theme-input mt-2 w-full rounded-xl px-4 py-3 text-sm"
                value={statusLabel}
                onChange={(event) => setStatusLabel(event.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em]">Mensagem exibida</label>
              <input
                className="theme-input mt-2 w-full rounded-xl px-4 py-3 text-sm"
                value={statusMessage}
                onChange={(event) => setStatusMessage(event.target.value)}
              />
            </div>
          </div>

          <button
            onClick={() => handleStatusChange(systemStatus.status, statusLabel, statusMessage)}
            disabled={updatingStatus}
            className="mt-6 inline-flex items-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {updatingStatus ? "Salvando..." : "Atualizar status"}
          </button>
        </section>

        <section className="theme-glass rounded-3xl border px-8 py-8 shadow-lg">
          <SectionTitle title="Gestão de usuários" icon={<FaUsersCog />} />
          <p className="mt-2 text-sm text-contrast-muted">
            Promova níveis de acesso, defina campanhas promocionais ou bloqueie contas suspeitas diretamente nesta tabela.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-black/30 text-left text-xs uppercase tracking-[0.3em] text-contrast-muted">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="bg-black/10">
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-white/10">
                    <td className="px-4 py-3 font-semibold">{user.name}</td>
                    <td className="px-4 py-3 text-contrast-muted">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        className="theme-input w-full rounded-lg px-3 py-2 text-sm"
                        value={user.type}
                        onChange={(event) => handleUserUpdate(user.id, { type: Number(event.target.value) })}
                      >
                        {typeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="theme-input w-full rounded-lg px-3 py-2 text-sm"
                        value={user.status}
                        onChange={(event) => handleUserUpdate(user.id, { status: Number(event.target.value) })}
                      >
                        {statusUserOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<AdminPageProps> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  const sessionUser = session?.user as SessionUser | undefined;

  if (!sessionUser || !sessionUser.isAdmin) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false
      }
    };
  }

  const [systemStatus, users] = await Promise.all([getSystemStatus(), getAllUsers()]);

  return {
    props: {
      session,
      systemStatus,
      users: users.map(toPublicUser)
    }
  };
};
