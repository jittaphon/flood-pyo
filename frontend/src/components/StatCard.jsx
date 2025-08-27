import React from "react";

export default function StatCard({ title, total, today, color }) {
  return (
    <div
      className={`rounded-2xl p-4 sm:p-6 shadow-lg text-center ${color}`}
    
    >
      <p className="text-sm sm:text-base font-medium text-gray-700">{title}</p>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
        {total ?? "-"}
      </h2>
  
    </div>
  );
}
