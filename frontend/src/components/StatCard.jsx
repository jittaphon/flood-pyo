import React from "react";

export default function StatCard({ title, value, description, className = "" }) {
  return (
    <div className={`bg-white/50 backdrop-blur-sm p-4 rounded-lg shadow-lg flex-grow ${className}`}>
    <h3 className="text text-sm font-medium">{title}</h3> {/* เปลี่ยนสีตัวอักษรให้เข้ากับ background */}
    <p className="text-3xl font-bold text mt-1">{value}</p> {/* เปลี่ยนสีตัวอักษรให้เข้ากับ background */}
    <p className="text text-xs mt-2">{description}</p> {/* เปลี่ยนสีตัวอักษรให้เข้ากับ background */}
  </div>
  );
}
