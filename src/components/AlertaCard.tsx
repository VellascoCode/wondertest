import React from "react";
import { motion } from "framer-motion";

const AlertaCard = ({
  icon,
  title,
  text,
  colorClass,
  borderClass,
  delay = 0
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  colorClass: string;
  borderClass: string;
  delay?: number;
}) => {
  return (
    <motion.div
      className={`flex items-start gap-3 p-4 rounded-lg ${colorClass} ${borderClass} border shadow-md relative group transition-all`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0px 0px 12px rgba(255,255,255,0.15)"
      }}
    >
      <div className="text-2xl">{icon}</div>
      <div>
        <h3 className="font-semibold text-sm md:text-base">{title}</h3>
        <p className="text-xs md:text-sm opacity-80">{text}</p>
      </div>
    </motion.div>
  );
};

export default AlertaCard;
