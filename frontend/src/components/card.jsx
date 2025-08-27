// Card.jsx
import React, { useState } from 'react'; // ต้อง import useState
import { BadgeCheck, AlertCircle, Info } from 'lucide-react';

export default function Card({ data }) {
  const [isHovered, setIsHovered] = useState(false); // เพิ่ม State นี้เข้ามา

  const isPaid = data.type_pay === 'ชดเชย';

  // ตรวจสอบและฟอร์แมตค่า count และ totalAmount
  const formattedCount = data.count ? data.count.toLocaleString() : '0';
  const formattedTotalAmount = data.totalAmount
    ? data.totalAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '0.00';

  // กำหนด class สีสำหรับยอดรวมตามสถานะ
  // ถ้า 'ชดเชย' เป็นสีเขียว, ถ้า 'ไม่ชดเชย' เป็นสีส้ม
  const totalAmountTextColorClass = isPaid ? 'text-green-700' : 'text-orange-600'; 

  return (
    // ✅ เพิ่ม className สำหรับ transition และ transform ที่นี่
    // ✅ เพิ่ม onMouseEnter และ onMouseLeave
    <div
      className={`
        bg-white rounded-2xl shadow-sm p-5 border border-gray-200 
        h-full flex flex-col justify-between
        transform transition-all duration-300 ease-in-out /* <-- เพิ่ม 3 บรรทัดนี้ */
        ${isHovered ? 'scale-105 z-10 shadow-lg' : 'hover:shadow-md'} /* <-- และปรับตรงนี้ */
      `}
      onMouseEnter={() => setIsHovered(true)} /* <-- เพิ่มบรรทัดนี้ */
      onMouseLeave={() => setIsHovered(false)} /* <-- เพิ่มบรรทัดนี้ */
      // สำหรับการกดค้างบนมือถือ (active state)
      // หากต้องการรองรับการกดค้าง อาจจะต้องเพิ่ม onTouchStart และ onTouchEnd
      // แต่ scale-105 อาจจะดูเล็กไปหน่อยสำหรับมือถือ (จะดูไม่ค่อยเต็ม field)
      // onTouchStart={() => setIsHovered(true)}
      // onTouchEnd={() => setIsHovered(false)}
      // onTouchCancel={() => setIsHovered(false)}
    >
      <div>
        {/* ชื่อรายการประเภทที่ขอเบิก */}
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2" title={data.name_type}>
          {data.name_type}
        </h3>

        {/* สถานะ ชดเชย / ไม่ชดเชย */}
        <div className="flex items-center gap-2 text-sm mb-1">
          {isPaid ? (
            <>
              <BadgeCheck className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-medium">ชดเชย</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-orange-600 font-medium">ไม่ชดเชย</span>
            </>
          )}
        </div>

        {/* เหตุผล (ถ้ามี) */}
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
          <Info className="w-4 h-4 mt-0.5" />
          <span className="line-clamp-2" title={data.reason}>
            {data.reason || 'ไม่มีเหตุผลระบุ'}
          </span>
        </div>

        {/* === ส่วนที่ปรับปรุง: ย้ายจำนวนและยอดรวมขึ้นมา === */}
        {/* เส้นคั่นบางๆ */}
        <div className="border-t border-dashed border-gray-200 pt-3"></div>

        <div className="flex justify-between items-center mt-3">
          {/* จำนวนเอกสาร/รายการที่ขอเบิก */}
          <div className="text-left">
            <p className="text-gray-600 text-xs">จำนวนรายการ:</p>
            {/* ✅ คงสีน้ำเงินไว้ตามที่เพื่อนต้องการ */}
            <p className="text-blue-700 font-bold text-base"> 
              {formattedCount} (ครั้ง)
            </p>
          </div>

          {/* ยอดรวมเงิน */}
          <div className="text-right">
            <p className="text-gray-600 text-xs">ยอดเงินรวม:</p>
            {/* ✅ ใช้ totalAmountTextColorClass เพื่อเปลี่ยนสีตามสถานะ */}
            <p className={`font-bold text-lg ${totalAmountTextColorClass}`}>
              {formattedTotalAmount} บาท
            </p>
          </div>
        </div>
        {/* === สิ้นสุดส่วนที่ปรับปรุง === */}

      </div>
    </div>
  );
}