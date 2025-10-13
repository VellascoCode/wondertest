import { motion } from "framer-motion";
import React from "react";

interface SectionTitleProps {
  title: string;
  icon: React.ReactNode;
  color?: string;
}

export default function SectionTitle({ title, icon, color = "border-white/30" }: SectionTitleProps) {
  return (
    <motion.h2
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className={`text-2xl font-semibold mb-4 border-l-4 pl-3 flex items-center gap-2 ${color}`}
    >
      <span className="text-xl">{icon}</span>
      {title}
    </motion.h2>
  );
}
