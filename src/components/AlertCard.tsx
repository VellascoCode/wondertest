import React from "react";
import {
  BeakerIcon,
  CakeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BoltIcon,
  ClockIcon,
  ShieldExclamationIcon,
  FaceFrownIcon,
} from "@heroicons/react/24/solid";
import type { Alert, AlertType } from "../types";

// Neon Wonderland theme configuration with explicit Tailwind classes
const CONFIG: Record<AlertType, {
  borderClass: string;
  bgClass: string;
  ringClass: string;
  shadowClass: string;
  textClass: string;
  icon: React.ReactNode;
}> = {
  DRINK_ME:      { borderClass: "border-cyan-400",    bgClass: "bg-black/80", ringClass: "ring-cyan-400/50", shadowClass: "shadow-lg shadow-cyan-400/50", textClass: "text-cyan-400",    icon: <BeakerIcon className="w-8 h-8 text-cyan-400 animate-pulse" /> },
  EAT_ME:        { borderClass: "border-fuchsia-400", bgClass: "bg-black/80", ringClass: "ring-fuchsia-400/50", shadowClass: "shadow-lg shadow-fuchsia-400/50", textClass: "text-fuchsia-400", icon: <CakeIcon className="w-8 h-8 text-fuchsia-400 animate-pulse" /> },
  GROW_ME:       { borderClass: "border-lime-400",    bgClass: "bg-black/80", ringClass: "ring-lime-400/50", shadowClass: "shadow-lg shadow-lime-400/50", textClass: "text-lime-400",    icon: <ArrowTrendingUpIcon className="w-8 h-8 text-lime-400 animate-pulse" /> },
  SHRINK_ME:     { borderClass: "border-rose-400",    bgClass: "bg-black/80", ringClass: "ring-rose-400/50", shadowClass: "shadow-lg shadow-rose-400/50", textClass: "text-rose-400",    icon: <ArrowTrendingDownIcon className="w-8 h-8 text-rose-400 animate-pulse" /> },
  RABBIT_HOLE:   { borderClass: "border-amber-400",   bgClass: "bg-black/80", ringClass: "ring-amber-400/50", shadowClass: "shadow-lg shadow-amber-400/50", textClass: "text-amber-400",   icon: <BoltIcon className="w-8 h-8 text-amber-400 animate-pulse" /> },
  TEA_PARTY:     { borderClass: "border-teal-400",    bgClass: "bg-black/80", ringClass: "ring-teal-400/50", shadowClass: "shadow-lg shadow-teal-400/50", textClass: "text-teal-400",    icon: <ClockIcon className="w-8 h-8 text-teal-400 animate-pulse" /> },
  QUEENS_ORDER:  { borderClass: "border-red-400",     bgClass: "bg-black/80", ringClass: "ring-red-400/50", shadowClass: "shadow-lg shadow-red-400/50", textClass: "text-red-400",     icon: <ShieldExclamationIcon className="w-8 h-8 text-red-400 animate-pulse" /> },
  CHESHIRES_GRIN:{ borderClass: "border-violet-400",  bgClass: "bg-black/80", ringClass: "ring-violet-400/50", shadowClass: "shadow-lg shadow-violet-400/50", textClass: "text-violet-400",  icon: <FaceFrownIcon className="w-8 h-8 text-violet-400 animate-pulse" /> },
};

export function AlertCard({ id, type, subtype, description, timestamp, token_address, affected_tokens, network }: Alert) {
  const { borderClass, bgClass, ringClass, shadowClass, textClass, icon } = CONFIG[type];

  return (
    <div
      key={id}
      className={
        `relative ${bgClass} ${shadowClass} border-l-4 ${borderClass} ring-1 ${ringClass} rounded-md py-2 px-3 flex items-center gap-2 transition-transform hover:-translate-y-0.5 duration-150`
      }
    >
      {/* Neon glow icon */}
      <div className={`flex-shrink-0 p-1 bg-black/60 rounded-full ring-1 ${ringClass}`}>{icon}</div>

      <div className="flex-1 text-white text-sm flex flex-col gap-0.5">
        <div className="flex justify-between items-center">
          <h3 className={`font-bold uppercase tracking-wide ${textClass}`}>{type.replace(/_/g, " ")}</h3>
          <span className="text-[10px] text-gray-300">{new Date(timestamp).toLocaleTimeString()}</span>
        </div>
        <p className="leading-tight">{description}</p>
        <p className="italic text-[10px] text-gray-400">{subtype}</p>
        {token_address && <p className="text-[10px] text-gray-400">Token: {token_address}</p>}
        {affected_tokens && <p className="text-[10px] text-gray-400">Affected: {affected_tokens.join(", ")}</p>}
      </div>
    </div>
  );
}

export default AlertCard;
