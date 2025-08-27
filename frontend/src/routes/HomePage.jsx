import React from "react";
import { motion } from "framer-motion";

export default function HomePage() {

  const quickLinks = [
  {
    title: "DMIS-KTP กรุงไทย 2568",
    desc: "ภาพรวมข้อมูลเบิกจ่ายปี 2568",
    href: "#/report/DMIS-KTP",
    icon: "💳",
    disabled: false,
  },
  {
    title: "DMIS-TB วัณโรค 2568",
    desc: "ภาพรวมข้อมูลเบิกจ่ายปี 2568",
    href: "#/report/DMIS-TB",
    icon: "🫁",
    disabled: false,
  },
   {
    title: "DMIS-NAP เอดส์ 2568",
    desc: "ภาพรวมข้อมูลเบิกจ่ายปี 2568",
    href: "#/report/DMIS-NAP",
    icon: "🧬",
    disabled: false,
  },
  {
    title: "DMIS-CKD ไตวาย 2568",
    desc: "ภาพรวมข้อมูลเบิกจ่ายปี 2568",
    href: "#/report/DMIS-CKD",
    icon: "🩺",
    disabled: false,
  },

  {
    title: "DMIS-MOPH-CLAIM 2568",
    desc: "ภาพรวมข้อมูลเบิกจ่ายปี 2568",
    href: "#/report/DMIS-MOPH-Claim",
    icon: "📥",
    disabled: false,
  },
  {
    title: "DMIS-TTM แผนไทย 2568",
    desc: "อยู่ระหว่างพัฒนา",
    href: "#/report/DMIS-TTM",
    icon: "🌿",
    disabled: true,
  },
  {
    title: "DMIS-TDT ธาลัสซีเมีย 2568",
    desc: "อยู่ระหว่างพัฒนา",
    href: "#/report/DMIS-TDT",
    icon: "🩸",
    disabled: true,
  },
  ];

  // ปรับปรุง Variants สำหรับ Welcome Text - ใช้ transform แทน y เพื่อลดการ reflow
  const welcomeVariants = {
    hidden: { 
      opacity: 0, 
      transform: "translateY(-20px)",
      filter: "blur(4px)"
    },
    visible: { 
      opacity: 1, 
      transform: "translateY(0px)", 
      filter: "blur(0px)",
      transition: { 
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuart - ลื่นกว่า
      }
    },
  };

  // ปรับปรุง Variants สำหรับ Card - ลดการใช้ scale และปรับ easing
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      transform: "translateY(20px) scale(0.98)",
    },
    visible: {
      opacity: 1,
      transform: "translateY(0px) scale(1)",
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart - ลื่นและธรรมชาติ
      },
    },
  };

  // ปรับปรุง Container Variants
  const containerVariants = {
    hidden: { opacity: 1 }, // เปลี่ยนจาก 0 เป็น 1 เพื่อไม่ให้มีการกระตุก
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // ลดเวลา stagger ให้เร็วขึ้น
        delayChildren: 0.3,    // เพิ่มหน่วงเล็กน้อยหลัง welcome text
      },
    },
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-start pt-8 sm:pt-16 md:pt-20 px-4 sm:px-6 bg-gradient-to-br from-blue-50 to-white overflow-hidden"
      style={{ 
        // บังคับให้ใช้ hardware acceleration
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        perspective: '1000px'
      }}
    >
      {/* Background Blob - ปรับให้ animation ลื่นขึ้น */}
      <div 
        className="absolute -top-24 -left-24 w-80 h-80 sm:w-96 sm:h-96 bg-green-300 opacity-30 blur-3xl rounded-full"
        style={{
          animation: 'pulse 4s ease-in-out infinite',
          transform: 'translateZ(0)'
        }}
      />
      <div 
        className="absolute -bottom-24 -right-24 w-80 h-80 sm:w-96 sm:h-96 bg-teal-300 opacity-30 blur-3xl rounded-full"
        style={{
          animation: 'pulse 4s ease-in-out infinite 2s',
          transform: 'translateZ(0)'
        }}
      />

      {/* Welcome Section */}
      <motion.h1
        className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-800 mb-6 sm:mb-8 text-center px-2"
        variants={welcomeVariants}
        initial="hidden"
        animate="visible"
        style={{ 
          // บังคับให้ใช้ GPU acceleration
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      >
        👋 ยินดีต้อนรับสู่ Budget Claim Center Phayao
      </motion.h1>

      {/* Quick Access Section */}
      <motion.div
        className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ 
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      >
       {quickLinks.map((item, idx) =>
  item.disabled ? (
    <motion.div
      key={idx}
      className="bg-gray-200 text-gray-500 rounded-xl p-4 sm:p-5 border border-white/10 group opacity-60 cursor-not-allowed"
      variants={cardVariants}
      title="อยู่ระหว่างพัฒนา"
      style={{ 
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
    >
      <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 transition-transform duration-200">
        {item.icon}
      </div>
      <div className="text-base sm:text-lg font-semibold text-gray-600 leading-tight">
        {item.title}
      </div>
      <div className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
        {item.desc}
      </div>
    </motion.div>
  ) : (
    <motion.a
      key={idx}
      href={item.href}
      className="bg-white/20 backdrop-blur-sm rounded-xl p-4 sm:p-5 shadow-md border border-white/10 group cursor-pointer"
      variants={cardVariants}
      style={{ 
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
    >
      <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-200">
        {item.icon}
      </div>
      <div className="text-base sm:text-lg font-semibold text-blue-900 leading-tight">
        {item.title}
      </div>
      <div className="text-xs sm:text-sm text-gray-700 mt-1 leading-relaxed">
        {item.desc}
      </div>
    </motion.a>
  )
)}
      </motion.div>

      {/* Footer spacing */}
      <div className="mt-8 sm:mt-12 pb-8"></div>
    </div>
  );
}