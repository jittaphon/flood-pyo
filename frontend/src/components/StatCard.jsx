// components/StatCard.jsx
import { motion } from "framer-motion";
import { AlertTriangle, UserX, Activity, PlusCircle } from "lucide-react";
import React from "react";
const iconMap = {
  "เสียชีวิต": <UserX className="w-6 h-6" />,
  "สูญหาย": <AlertTriangle className="w-6 h-6" />,
  "บาดเจ็บ": <Activity className="w-6 h-6" />,
  "รวม": <PlusCircle className="w-6 h-6" />
};

export default function StatCard({ title, total, today, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col items-center justify-center 
                  text-white font-bold backdrop-blur-xl ${color}
                  bg-gradient-to-br from-white/20 to-white/5 border border-white/20`}
    >
      <div className="flex items-center gap-2 mb-2">
        {iconMap[title]}
        <h3 className="text-lg">{title}</h3>
      </div>
      <p className="text-3xl sm:text-4xl">{total}</p>
      {today > 0 && (
        <p className="text-sm font-medium mt-1 text-white/80">+{today} วันนี้</p>
      )}
    </motion.div>
  );
}
