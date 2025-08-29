import { useEffect, useState } from "react";
import React from "react";
import Papa from 'papaparse';
import { motion } from "framer-motion";
import StatCard from "../components/StatCard"; // 👈 import ที่ทำไว้ด้านบน
import PhayaoMap from "../components/Map";
export default function HomePage() {
  const [rawData, setRawData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSHP-40KTigcsNS4ZZH5LizIrWf8HXH9OpmH0P9X9_JFfxPed5b87wg_Ow_Em1STHa-wFgWyztAOKr1/pub?output=csv';

    Papa.parse(url, {
      download: true,
      header: false, // ไม่ใช้ header auto เพราะมี merged cells
      skipEmptyLines: true,
      complete: (results) => {

        setRawData(results.data);
        
        // ประมวลผลข้อมูล
        const processed = processFloodData(results.data);
        setProcessedData(processed);
        setLoading(false);
      },
      error: (err) => {
        console.error('Error parsing CSV:', err);
        setError(err.message);
        setLoading(false);
      },
    });
  }, []);

const columnMap = {
  A: "อำเภอ",
  B: "เสียชีวิตวันนี้",
  C: "เสียชีวิตสะสม",
  D: "สูญหายวันนี้",
  E: "สูญหายสะสม",
  F: "บาดเจ็บวันนี้",
  G: "บาดเจ็บสะสม",
  H: "รวมวันนี้",
  I: "รวมสะสม",
  J: "หมายเหตุ (พื้นที่ที่ได้รับผลกระทบ) ชื่อตำบล",
  K: "จำนวนอำเภอที่ได้รับผลกระทบ",
  L: "จำนวนตำบลที่ได้รับผลกระทบ",
  M: "จำนวนหมู่บ้านที่ได้รับผลกระทบ",
  N: "รพวันนี้",
  O: "รพสตวันนี้",
  P: "สสอวันนี้",
  Q: "รพสะสม",
  R: "รพสตสะสม",
  S: "สสอสะสม",
  T: "ชื่อสถานบริการที่ได้รับผลกระทบ",
  U: "บุคลากรสาธารณสุข ได้รับผลกระทบ",
  V: "ครัวเรือนที่ได้รับผลกระทบ",
  W: "ประชาชนที่ได้รับผลกระทบ",
  X: "จำนวนศูนย์พักพิง",
  Y: "ชื่อศูนย์พักพิง",
  Z: "จำนวนผู้พักพิง",
  AA: "ตั้งครรภ์ ปัจจุบัน",
  AB: "ตั้งครรภ์ที่ สะสม",
  AC: "เด็ก 0-12 ปี_ปัจจุบัน",
  AD: "เด็ก 0-12 ปี_สะสม",
  AE: "สูงอายุ 60 ปีขึ้นไป_ปัจจุบัน",
  AF: "สูงอายุ 60 ปีขึ้นไป_สะสม",
  AG: "ผู้พิการ_ปัจจุบัน",
  AH: "ผู้พิการ_สะสม",
  AI: "ติดบ้าน_ติดเตียง_ปัจจุบัน",
  AJ: "ติดบ้าน_ติดเตียง_สะสม",
  AK: "ประชาชนทั่วไป_ปัจจุบัน",
  AL: "ประชาชนทั่วไป_สะสม",
  AM: "บาดเจ็บรวม_วันนี้",
  AN: "บากเจ็บรวม_สะสม",
  AO: "บาดเจ็บรุนแรง_วันนี้",
  AP: "บาดเจ็บรุนแรง_สะสม",
  AQ: "การบาดเจ็บเล็กน้อยถึงปานกลาง_วันนี้",
  AR: "การบาดเจ็บเล็กน้อยถึงปานกลาง_สะสม",
  AS: "หมายเหตุ_(ผู้บาดเจ็บ)",
  AT: "หญิงตั้งครรภ์_วันนี้(กลุ่มเปราะบางในพื้นที่เสียง)",
  AU: "หญิงตั้งครรภ์_สะสม(กลุ่มเปราะบางในพื้นที่เสียง)",
  AV: "ติดบ้าน/ติดเตียง_วันนี้(กลุ่มเปราะบางในพื้นที่เสียง)",
  AW: "ติดบ้าน/ติดเตียง_สะสม(กลุ่มเปราะบางในพื้นที่เสียง)",
  AX: "ผู้สูงอายุ_วันนี้(กลุ่มเปราะบางในพื้นที่เสียง)",
  AY: "ผู้สูงอายุ_สะสม(กลุ่มเปราะบางในพื้นที่เสียง)",
  AZ: "การเคลื่อนย้าย(ไปยังที่ปลอดภัย)_วันนี้",
  BA: "การเคลื่อนย้าย(ไปยังที่ปลอดภัย)_สะสม",
  BB: "การเคลื่อนย้าย(ไปยังที่ปลอดภัย)จำแนกเป็นเด็ก 0-12 ปี สะสม",
  BC: "การเคลื่อนย้าย(ไปยังที่ปลอดภัย)จำแนกเป็นตั้งครรภ์สะสม",
  BD: "การเคลื่อนย้าย(ไปยังที่ปลอดภัย)จำแนกเป็นเสูงอายุ 60 ปีขึ้นไปสะสม",
  BE: "การเคลื่อนย้าย(ไปยังที่ปลอดภัย)จำแนกเป็นผู้พิการสะสม",
  BF: "การเคลื่อนย้าย(ไปยังที่ปลอดภัย)จำแนกเป็นผู้ป่วยติดบ้าน/ติดเตียงสะสม",
  BG: "การเคลื่อนย้าย(ไปยังที่ปลอดภัย)จำแนกเป็นประชาชนทั่วไปสะสม",
  BH: "MERT",
  BI: "Mini MERT",
  BJ: "SEhRT",
  BK: "CDCU",
  BL: "SRRT",
  BM: "อื่นๆ (กู้ชีพ กู้ภัย)",
  BN: "รวมจำนวนทีม",
  BO: "เยี่ยมบ้าน",
  BP: "ตรวจรักษา",
  BQ: "ให้สุขศึกษา",
  BR: "สุขภาพจิต",
  BS: "ส่งต่อ",
  BT: "มอบชุดดูแลสิ่งแวดล้อมV_clean",
  BU: "มอบชุดยาเวชภัณฑ์",
  BV: "leptospirosis_today",
  BW: "leptospirosis_accumulated",
  BX: "dengue_fever_today",
  BY: "dengue_fever_accumulated",
  BZ: "food_poisoning_diarrhea_today",
  CA: "food_poisoning_diarrhea_accumulated",
  CB: "influenza_today",
  CC: "influenza_accumulated",
  CD: "Respiritory_tract_infection_URI_today",
  CE: "Respiritory_tract_infection_URI_accumulated",
  CF: "Respiritory_tract_infection_penumonia_today",
  CG: "Respiritory_tract_infection_penumonia_accumulated",
};


const mappedData = processedData.map(row => {
  const newRow = {};
  for (const key in row) {
    const newKey = columnMap[key] || key; // ถ้าไม่มีใน map ก็ใช้ key เดิม
    newRow[newKey] = row[key];
  }
  return newRow;
});



// ✅ รวมค่าทุกอำเภอทั้ง วันนี้ + สะสม
const totals = mappedData.reduce(
  (acc, row) => {
    acc.dead.today += Number(row["เสียชีวิตวันนี้"] || 0);
    acc.dead.total += Number(row["เสียชีวิตสะสม"] || 0);

    acc.missing.today += Number(row["สูญหายวันนี้"] || 0);
    acc.missing.total += Number(row["สูญหายสะสม"] || 0);

    acc.injured.today += Number(row["บาดเจ็บวันนี้"] || 0);
    acc.injured.total += Number(row["บาดเจ็บสะสม"] || 0);

    acc.all.today += Number(row["รวมวันนี้"] || 0);
    acc.all.total += Number(row["รวมสะสม"] || 0);

    return acc;
  },
  {
    dead: { today: 0, total: 0 },
    missing: { today: 0, total: 0 },
    injured: { today: 0, total: 0 },
    all: { today: 0, total: 0 },
  }
);




  const processFloodData = (data) => {
    try {
      // หาแถวที่มีข้อมูลจริง (ข้ามหัวตาราง merged cells)
      let dataStartRow = -1;
      let headers = [];
      
      // หาแถวที่มี "อำเภอ" (แถวที่ 5 ตาม index 0)
      for (let i = 0; i < data.length; i++) {
        if (data[i] && data[i][0] && data[i][0].includes('อำเภอ')) {
          dataStartRow = i + 1; // แถวถัดไปคือข้อมูล
          headers = data[i];
          break;
        }
      }

      if (dataStartRow === -1) {
        console.warn('ไม่พบแถวหัวตาราง');
        return [];
      }

     

const indexToLetter = (index) => {
  let letter = '';
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
};

// ใช้แทนชื่อ header
const cleanHeaders = headers.map((header, index) => indexToLetter(index));


      // ประมวลผลข้อมูลแต่ละแถว
      const processedRows = [];
      
      for (let i = dataStartRow; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[0] || row[0].trim() === '') {
          continue; // ข้ามแถวว่าง
        }

        const processedRow = {};
        cleanHeaders.forEach((header, index) => {
          const value = row[index] || '';
          // แปลงตัวเลขถ้าเป็นตัวเลข
          const numValue = parseFloat(value);
          processedRow[header] = !isNaN(numValue) && value !== '' ? numValue : value;
        });

        processedRows.push(processedRow);
      }


      return processedRows;
    } catch (error) {
      console.error('Error processing data:', error);
      return [];
    }
  };

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
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
  };

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 font-medium mb-2">เกิดข้อผิดพลาด:</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-start pt-8 sm:pt-16 md:pt-20 px-4 sm:px-6 bg-gradient-to-br from-blue-50 to-white overflow-hidden"
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        perspective: '1000px'
      }}
    >
      {/* Background Blobs */}
      <div
        className="absolute -top-24 -left-24 w-80 h-80 sm:w-96 sm:h-96 bg-blue-600 opacity-30 blur-3xl rounded-full"
        style={{
          animation: 'pulse 4s ease-in-out infinite',
          transform: 'translateZ(0)'
        }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-80 h-80 sm:w-96 sm:h-96 bg-teal-600 opacity-30 blur-3xl rounded-full"
        style={{
          animation: 'pulse 4s ease-in-out infinite 2s',
          transform: 'translateZ(0)'
        }}
      />

      {/* Title */}
      <motion.h1
        className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-800 mb-6 sm:mb-8 text-center px-2"
        variants={welcomeVariants}
        initial="hidden"
        animate="visible"
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      >
       🌧️ รายงานสถานการณ์อุทกภัย ระดับอำเภอ ประจำปีงบประมาณ 2568
      </motion.h1>

     <motion.div
  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 w-full max-w-none mx-4
            grid grid-cols-[1fr_1.5fr] gap-4 w-full gap-4"
  variants={containerVariants}
  initial="hidden"
  animate="visible"
  style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
>

  {/* Row 1 - Equal columns */}
  <div className="flex flex-col items-center gap-6 py-6  col-span-1 ">

    <h2 className="text-2xl  font-bold mb-3 text-gray-800">
      สถานการณ์จังหวัดพะเยา (สะสม)
  </h2>
      {/* แถวแรก: การ์ด */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full "
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatCard
          title="เสียชีวิต"
          total={totals.dead.total}
          today={totals.dead.today}
          color="bg-red-300"
        />
        <StatCard
          title="สูญหาย"
          total={totals.missing.total}
          today={totals.missing.today}
          color="bg-yellow-300"
        />
        <StatCard
          title="บาดเจ็บ"
          total={totals.injured.total}
          today={totals.injured.today}
          color="bg-orange-300"
        />
        <StatCard
          title="รวม"
          total={totals.all.total}
          today={totals.all.today}
          color="bg-blue-300"
        />
      </motion.div>

      {/* แถวสอง: ตาราง */}
      <div className="w-full  overflow-x-auto">
          {/* หัวตาราง */}
  <h2 className="text-lg sm:text-xl font-bold mb-3 text-gray-800">
    📝 สถานการณ์แยกรายอำเภอ (สะสม)
  </h2>

  <table className="min-w-full rounded-xl overflow-hidden shadow-xl backdrop-blur-xl bg-white/30 border border-white/20">
  <thead>
    <tr className="bg-gradient-to-r from-blue-500/80 to-blue-300/80 text-white">
      <th className="px-4 py-3 text-left">อำเภอ</th>
      <th className="px-4 py-3 text-center">เสียชีวิต</th>
      <th className="px-4 py-3 text-center">สูญหาย</th>
      <th className="px-4 py-3 text-center">บาดเจ็บ</th>
      <th className="px-4 py-3 text-center">รวม</th>
    </tr>
  </thead>
  <tbody>
    {mappedData.map((row, index) => (
      <tr
        key={index}
        className={`transition ${
          index % 2 === 0 ? "bg-white/60" : "bg-white/40"
        } hover:bg-blue-200 hover:shadow-lg`}
      >
        <td className="px-4 py-2 border-b">{row.อำเภอ}</td>
        <td className="px-4 py-2 border-b text-center text-red-600 font-semibold">
          {row.เสียชีวิตสะสม}
        </td>
        <td className="px-4 py-2 border-b text-center text-yellow-600 font-semibold">
          {row.สูญหายสะสม}
        </td>
        <td className="px-4 py-2 border-b text-center text-orange-600 font-semibold">
          {row.บาดเจ็บสะสม}
        </td>
        <td className="px-4 py-2 border-b text-center text-blue-700 font-bold">
          {row.เสียชีวิตสะสม + row.สูญหายสะสม + row.บาดเจ็บสะสม}
        </td>
      </tr>
    ))}
  </tbody>
</table>

      </div>


    </div>

  <div className="bg-white/20 rounded-lg p-4 col-span-2">
    <PhayaoMap />
  </div>
  {/* Row 2 - Equal columns */}
<div className="w-full overflow-x-auto py-6 col-span-3 ">

    <h2 className="text-lg sm:text-xl font-bold mb-3 text-gray-800">
      🏕️ การจัดตั้งศูนย์พักในพื้นที่ที่ได้รับผลกระทบ (สะสม)
    </h2>

    <table className="min-w-full rounded-xl overflow-hidden 
                      shadow-lg bg-white/70 border border-gray-200">
      <thead>
        <tr className="bg-gradient-to-r from-amber-800/90 to-yellow-600/80 text-white shadow-md">
          <th className="px-4 py-3 text-left">📍 อำเภอ</th>
          {mappedData.map((row, index) => (
            <th key={index} className="px-4 py-3 text-center">
              {row.อำเภอ}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {/* แถว 1: จำนวนผู้พักพิง */}
        <tr className="bg-white/60 hover:bg-yellow-200 transition">
          <td className="px-4 py-2 border-b font-semibold text-gray-800">
            👨‍👩‍👧‍👦 จำนวนผู้พักพิง
          </td>
          {mappedData.map((row, index) => (
            <td
              key={index}
              className="px-4 py-2 border-b text-center text-emerald-700 font-semibold"
            >
              {row.จำนวนผู้พักพิง || 0}
            </td>
          ))}
        </tr>

        {/* แถว 2: จำนวนศูนย์พักพิง */}
        <tr className="bg-white/40 hover:bg-yellow-200 transition">
          <td className="px-4 py-2 border-b font-semibold text-gray-800">
            🏠 จำนวนศูนย์พักพิง
          </td>
          {mappedData.map((row, index) => (
            <td
              key={index}
              className="px-4 py-2 border-b text-center text-blue-700 font-semibold"
            >
              {row.จำนวนศูนย์พักพิง || 0}
            </td>
          ))}
        </tr>
      </tbody>
    </table>

</div>

  {/* Row 3 - Equal columns */}
<div className="w-full overflow-x-auto py-6 col-span-3">
  <h2 className="text-lg sm:text-xl font-bold mb-3 text-gray-800">
   🧍 จำนวนผู้รับบริการด้านการเเพทย์เเละสาธารณสุข (สะสม)
  </h2>

<table className="min-w-full rounded-xl overflow-hidden backdrop-blur-xl bg-white/30 border border-white/20">
  <thead>
    <tr className="bg-gradient-to-r from-blue-500/80 to-blue-300/80 text-white">
      <th className="px-4 py-3 text-left">อำเภอ</th>
      <th className="px-4 py-3 text-center">เยี่ยมบ้าน</th>
      <th className="px-4 py-3 text-center">ตรวจรักษา</th>
      <th className="px-4 py-3 text-center">ให้สุขศึกษา</th>
      <th className="px-4 py-3 text-center">สุขภาพจิต</th>
      <th className="px-4 py-3 text-center">ส่งต่อ</th>
      <th className="px-4 py-3 text-center">มอบชุดดูแล สิ่งแวดล้อม/ V-clean</th>
      <th className="px-4 py-3 text-center">มอบชุดยาเวชภัณฑ์</th>
    </tr>
  </thead>

  <tbody>
    {mappedData.map((row, index) => (
      <tr
        key={index}
        className={`transition ${
          index % 2 === 0 ? "bg-white/60" : "bg-white/40"
        } hover:bg-blue-200 hover:shadow-lg`}
      >
        <td className="px-4 py-2 border-b">{row.อำเภอ}</td>
        <td className="px-4 py-2 border-b text-center font-semibold">
          {row.เยี่ยมบ้าน}
        </td>
        <td className="px-4 py-2 border-b text-center font-semibold">
          {row.ตรวจรักษา}
        </td>
        <td className="px-4 py-2 border-b text-center font-semibold">
          {row.ให้สุขศึกษา}
        </td>
        <td className="px-4 py-2 border-b text-center font-semibold">
          {row.สุขภาพจิต}
        </td>
        <td className="px-4 py-2 border-b text-center font-semibold">
          {row.ส่งต่อ}
        </td>
        <td className="px-4 py-2 border-b text-center font-semibold">
          {row.มอบชุดดูแลสิ่งแวดล้อมV_clean}
        </td>
        <td className="px-4 py-2 border-b text-center font-semibold">
          {row.มอบชุดยาเวชภัณฑ์}
        </td>
      </tr>
    ))}
  </tbody>

  {/* ส่วนสรุปผลรวม */}
  <tfoot>
    <tr className="bg-gradient-to-r from-blue-400/70 to-blue-200/70 font-bold text-gray-900">
      <td className="px-4 py-2 text-left">รวม</td>
      <td className="px-4 py-2 text-center">
        {mappedData.reduce((sum, row) => sum + (Number(row.เยี่ยมบ้าน) || 0), 0)}
      </td>
      <td className="px-4 py-2 text-center">
        {mappedData.reduce((sum, row) => sum + (Number(row.ตรวจรักษา) || 0), 0)}
      </td>
      <td className="px-4 py-2 text-center">
        {mappedData.reduce((sum, row) => sum + (Number(row.ให้สุขศึกษา) || 0), 0)}
      </td>
      <td className="px-4 py-2 text-center">
        {mappedData.reduce((sum, row) => sum + (Number(row.สุขภาพจิต) || 0), 0)}
      </td>
      <td className="px-4 py-2 text-center">
        {mappedData.reduce((sum, row) => sum + (Number(row.ส่งต่อ) || 0), 0)}
      </td>
      <td className="px-4 py-2 text-center">
        {mappedData.reduce((sum, row) => sum + (Number(row.มอบชุดดูแลสิ่งแวดล้อมV_clean) || 0), 0)}
      </td>
      <td className="px-4 py-2 text-center">
        {mappedData.reduce((sum, row) => sum + (Number(row.มอบชุดยาเวชภัณฑ์) || 0), 0)}
      </td>
    </tr>
  </tfoot>
</table>

</div>

  {/* Row 4 - Equal columns */}
<div className="w-full overflow-x-auto py-6 col-span-1">
  <h2 className="text-lg sm:text-xl font-bold mb-3 text-gray-800">
    🚣🏽‍♂️  ทีมปฏิบัติการด้านการแพทย์และสาธารณสุข
  </h2>

  <table className="min-w-full border border-gray-300 rounded-xl shadow-md overflow-hidden">
    <thead>
      <tr className="bg-gradient-to-r from-green-400 to-green-200">
        <th className="px-4 py-3 text-left border-b font-semibold text-gray-800">
          ทีม
        </th>
        <th className="px-4 py-3 text-center border-b font-semibold text-gray-800">
          จำนวน
        </th>
      </tr>
    </thead>
    <tbody>
      {["MERT", "Mini MERT", "SEhRT", "CDCU", "SRRT", "อื่นๆ (กู้ชีพ กู้ภัย)"].map((team, index) => {
        const totalTeam = mappedData.reduce((sum, row) => {
          return sum + Number(row[team] || 0);
        }, 0);

        // โทนสีสุขภาพ / หมอ
    

        return (
          <tr key={team}
            className={`transition ${
          index % 2 === 0 ? "bg-white/60" : "bg-white/40"
        } hover:bg-green-200 hover:shadow-lg`}
          >
            <td className="px-4 py-2 border-b font-semibold">{team}</td>
            <td
              className={`px-4 py-2 border-b text-center font-bold `}
            >
              {totalTeam}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>

{/* Row 4 - Equal columns */}
<div className="w-full overflow-x-auto py-6 col-span-1">
  <h2 className="text-lg sm:text-xl font-bold mb-3 text-gray-800">
     🏥 จำนวนหน่วยบริการที่ได้รับผลกระทบ (สะสม)
  </h2>

  <table className="min-w-full border border-gray-300 rounded-xl shadow-md overflow-hidden">
    <thead>
      <tr className="bg-gradient-to-r from-green-400 to-green-200">
        <th className="px-4 py-3 text-left border-b font-semibold text-gray-800">
          หน่วยบริการ
        </th>
        <th className="px-4 py-3 text-center border-b font-semibold text-gray-800">
          จำนวน
        </th>
      </tr>
    </thead>
    <tbody>
      {(() => {
        const labelMap = {
          "รพสะสม": "โรงพยาบาล",
          "รพสตสะสม": "รพ.สต.",
          "สสอสะสม": "สสอ"
        };

        return ["รพสะสม", "รพสตสะสม", "สสอสะสม"].map((team, index) => {
          const totalTeam = mappedData.reduce(
            (sum, row) => sum + Number(row[team] || 0),
            0
          );

          return (
            <tr
              key={team}
              className={`transition ${
                index % 2 === 0 ? "bg-white/60" : "bg-white/40"
              } hover:bg-green-200 hover:shadow-lg`}
            >
              <td className="px-4 py-7 border-b font-semibold">
                {labelMap[team] || team}
              </td>
              <td className="px-4 py-2 border-b text-center font-bold">
                {totalTeam}
              </td>
            </tr>
          );
        });
      })()}
    </tbody>
  </table>
</div>










  {/* Row 3 - Equal columns */}
     </motion.div>
  <div className="mt-8 sm:mt-12 pb-8"></div>
    </div>
  );
}