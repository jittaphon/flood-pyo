import React from "react";

const getWeatherInfo = (cond) => {
  switch (cond) {
    case 1: return { emoji: "☀️", text: "แจ่มใส" };
    case 2: return { emoji: "🌤", text: "มีเมฆบางส่วน" };
    case 3: return { emoji: "☁️", text: "เมฆเป็นส่วนมาก" };
    case 4: return { emoji: "🌥", text: "มีเมฆมาก" };
    case 5: return { emoji: "🌦", text: "ฝนตกเล็กน้อย" };
    case 6: return { emoji: "🌧", text: "ฝนปานกลาง" };
    case 7: return { emoji: "🌧💦", text: "ฝนตกหนัก" };
    case 8: return { emoji: "⛈", text: "ฝนฟ้าคะนอง" };
    case 9: return { emoji: "🥶", text: "อากาศหนาวจัด" };
    case 10: return { emoji: "🧊", text: "อากาศหนาว" };
    case 11: return { emoji: "🆒", text: "อากาศเย็น" };
    case 12: return { emoji: "🔥", text: "อากาศร้อนจัด" };
    default: return { emoji: "❓", text: "ไม่ทราบ" };
  }
};


export default function ProvinceCard({data}) {

    console.log("Province Data:", data);


const weather = getWeatherInfo(data.cond);

  return (
    <div
      className="
        p-6 rounded-2xl border border-white/30 shadow-xl backdrop-blur-md relative overflow-hidden
        animate-gradient bg-gradient-to-tr from-blue-400 via-blue-600 to-indigo-800
        text-white
      "
    >
      {/* ชื่อจังหวัด */}
      <div className="text-sm uppercase tracking-wide text-white/80 mb-2">
        {data.province}
      </div>

      {/* สภาพอากาศ */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl sm:text-4xl">{weather.emoji}</span>
        <span className="text-2xl sm:text-3xl font-bold">{weather.text}</span>
      </div>

      {/* ปริมาณฝน */}
      <div className="text-sm mb-1 text-white/80">
        🌧 ปริมาณฝน (24 ชม.): {data.rain} mm
      </div>

      {/* อุณหภูมิและความชื้น */}
      <div className="text-sm mb-1 text-white/80">
        🌡 อุณหภูมิ: {data.tc} °C &nbsp;|&nbsp; 💧 ความชื้น: {data.rh}%
      </div>

      {/* ความเสี่ยง */}
      <div className={`text-sm mb-1 font-semibold ${data.risk === "ปลอดภัย" ? "text-green-300" : "text-red-300"}`}>
        ⚡ ความเสี่ยง: {data.risk}
      </div>

      {/* ลม */}
      <div className="text-sm text-white/80">
        🌬 ลม: {data.ws10m_knots} knots ↙ (ทิศ {data.wd10m}°)
      </div>

      {/* เอฟเฟกต์น้ำ overlay */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/waves.png')] animate-water pointer-events-none"></div>
    </div>
  );
}

