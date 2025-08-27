import React, { useEffect, useState ,useRef ,useCallback } from 'react';
import { ScaleLoader } from 'react-spinners';
import StatCard from '../components/StatCard';
import DateRangeFilter from '../components/DateSelect';
import NameTypeSelect from '../components/NameTypeSelect';
import PayTypeSelect from '../components/PayTypeSelect';
import HmainSelect from '../components/HmainSelect';
import { FaEraser } from 'react-icons/fa';
import PeriodSelect from '../components/PeriodSelect';
import AffiliationSelect from '../components/AffiliationSelect';
import AmpurSelect from '../components/AmpurSelect';
import { API } from '../api';
import CustomTable from '../components/Table';
import { FiFilter } from 'react-icons/fi';
import CustomChart from '../components/Chart';
import TableListAllCountNameType from '../components/TableListAllCountNameType';
import { AlertCircle } from "lucide-react";
export default function DMIS_NAP() {
const defaultFilters = {
  dateRange: {
    startMonthName: 'กรกฎาคม',
    startYear: '2568',
    endMonthName: '',
    endYear: '', 
    startDate: null,  // ← เพิ่มตรงนี้
    endDate: null     // ← เพิ่มตรงนี้
  },
  nameType: [],
  type_pay: [],
  HmainOP: [],
  period: [],
  type_affiliation: [],
  name_Ampur: [], // ✅ ต้องเพิ่มตรงนี้

};



 const abortControllerRef = useRef(null);

  const [mode, setMode] = useState('hmain');
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState(null);
  const [filteredDataDetail, setFilteredDataDetail] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [list, setlist] = useState([]); // ✅ สร้าง state สำหรับ nameType
  const [list_hamin, setlist_hamin] = useState([]); // ✅ สร้าง state สำหรับ hmainOP

   const fetchAppointments = useCallback(async () => {
    // 3.1. ตั้งค่าสถานะ Loading ทันที และเคลียร์ข้อมูลเก่า
    setLoading(true);

    setFilteredData(null);
    setFilteredDataDetail(null);
    // 3.2. จัดการ AbortController: ยกเลิก Request เก่าถ้ามี
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // สั่งยกเลิก Request ที่กำลังทำงานอยู่
    }

    // 3.3. สร้าง AbortController ตัวใหม่สำหรับ Request นี้
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal; // ดึง signal มาใช้กับ Request

    try {
      const requestParams = {
        start_month: filters.dateRange.startMonthName,
        start_year: filters.dateRange.startYear,
        end_month: filters.dateRange.endMonthName,
        end_year: filters.dateRange.endYear,
        'name_type[]': filters.nameType,
        'type_pay[]': filters.type_pay,
        'HmainOP[]': filters.HmainOP,
        'period[]': filters.period,
        'type_affiliation[]': filters.type_affiliation,
        'name_Ampur[]': filters.name_Ampur,
        
      };


      
      const options = { signal };

      console.log("Request Params:", requestParams); // ✅ แสดง Request Params ใน Console
   

      const responsedSummary = await API.DMIS_NAP.getDMIS_NAP_Summary(requestParams, options); 
      const responsedeatailData = await API.DMIS_NAP.getDMIS_NAP_Detail(requestParams, options);
      const ListNameType = await API.DMIS_NAP.getDMIS_NAP_ListNameType(options);  // <-- ส่ง options ไปด้วย
      const list_hmainOP = await API.DMIS_NAP.getDMIS_NAP_LlistHaminaOP(options); // <-- ส่ง options ไปด้วย
     
 
      setFilteredDataDetail(responsedeatailData.data.data);
      setFilteredData(responsedSummary.data.data);
      setlist(ListNameType.data.data)
      setlist_hamin(list_hmainOP.data.data); // ✅ เก็บข้อมูล hmainOP ลงใน state
    
 

      // 3.5. ตรวจสอบว่า Request ไม่ได้ถูกยกเลิกก่อนที่จะ Set State
      // ป้องกัน Error "Can't perform a React state update on an unmounted component"
      // หรือการ Set State ด้วยข้อมูลที่ล้าสมัย
      if (!signal.aborted) {
        setFilteredData(responsedSummary.data.data);
        setFilteredDataDetail(responsedeatailData.data.data);
        setlist(ListNameType.data.data)
        setlist_hamin(list_hmainOP.data.data);
        setInitialLoadDone(true); 
      }

    } catch (error) {
      // 3.6. จัดการ Error: ตรวจสอบว่าเป็น Error จากการยกเลิก Request หรือไม่
      if (error.name === 'AbortError') {
        console.log('Fetch aborted by user action (new filter applied).');
        // ไม่ต้องทำอะไรเพิ่ม หรือแสดง Error บน UI เพราะเป็นการยกเลิกที่ตั้งใจ
      } else {
        console.error("Error fetching appointments:", error);
        // แสดง Error บน UI ถ้าเป็น Error อื่นๆ
      }
    } finally {
      // 3.7. ตั้งค่าสถานะ Loading เป็น false เสมอ
      // ไม่ว่าจะสำเร็จ, ล้มเหลว หรือถูกยกเลิก เพื่อเปิด UI กลับมา
      setLoading(false);
      // 3.8. ล้าง AbortController เมื่อ Request เสร็จสิ้น (หรือไม่ใช้แล้ว)
      // เพื่อป้องกันการยกเลิก Request ถัดไปโดยไม่ได้ตั้งใจ
      abortControllerRef.current = null;
    }
  }, [filters]); // Dependency array สำหรับ useCallback: ฟังก์ชันจะถูกสร้างใหม่เมื่อ filters เปลี่ยน



useEffect(() => {
  fetchAppointments(); 
}, []); 


 const resetFilters = () => {
  setFilters({
    ...defaultFilters,
    dateRange: {
      ...defaultFilters.dateRange,
      startDate: null,
      endDate: null
    }
  });
 };
  const handleNameTypeChange = (newSelectedNameTypes) => {
    setFilters(prev => ({ ...prev, nameType: newSelectedNameTypes }));
  };
  const handlePayTypeChange = (newSelectedPayType) => {
    setFilters(prev => ({ ...prev, type_pay: newSelectedPayType }));
  };
  const handleHmainOPChange = (newSelectedHmainOP) => {
    setFilters(prev => ({ ...prev, HmainOP: newSelectedHmainOP }));
  };
  const handlePeriodChange = (newSelectedPeriod) => {
    setFilters(prev => ({ ...prev, period: newSelectedPeriod }));
  };
  const handleDateRangeChange = ({ startMonthName, startYear, endMonthName, endYear }) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { startMonthName, startYear, endMonthName, endYear }
    }));
  };
const handleAffiliationChange = (newSelectedAffiliation) => {
  setFilters(prev => ({
    ...prev,
    type_affiliation: newSelectedAffiliation,
    name_Ampur: []  // ✅ เคลียร์ค่าอำเภอทุกครั้งที่สังกัดเปลี่ยน
  }));
};
const handleAmpurChange = (newSelectedAmpur) => {
  setFilters(prev => ({ ...prev, name_Ampur: newSelectedAmpur }));
};


  return (
    <div className="p-6 bg-gradient-to-br from-blue-400 via-blue-100 to-blue-200 min-h-screen relative">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400 opacity-30 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400 opacity-30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-green-400 opacity-30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>

      <h1 className="text-3xl font-bold text-white mb-6 z-10 relative">🧬 ภาพรวมข้อมูล DMIS NAP เอดส์</h1>

      <div className="relative z-10 mb-6">
        
 {/* ✅ Overlay Loading เฉพาะตัวกรอง 
  {loading && (
    <div className="absolute inset-0 bg-white/60 backdrop-blur-xs z-50 flex items-center justify-center pointer-events-auto rounded-lg">
      <div className="flex flex-col items-center">
        <ScaleLoader color="#2593da" />
        <p className="mt-4 text-gray-700 text-lg font-semibold">กำลังโหลด...</p>
        <p className="text-gray-600 text-sm">กำลังโหลดตัวกรองข้อมูล</p>
      </div>
    </div>
  )}*/}

       
               <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-xl p-4">
                {/* หัวข้อ */}
                 <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                   <FiFilter className="text-blue-600 text-2xl mr-2" />
                   <h2 className="text-xl font-semibold text-gray-800">ตัวกรองข้อมูล</h2>
                 </div>
       
                 
                   {/* กลุ่ม: กรองทั่วไป */}
                   <div className="grid gap-4 mb-6">
                     <DateRangeFilter
                       onDateRangeChange={handleDateRangeChange}
                       initialStartDate={filters.dateRange.startDate}
                       initialEndDate={filters.dateRange.endDate}
                     />
                     <div className="grid md:grid-cols-3 gap-4">
                     <NameTypeSelect value={filters.nameType} onChange={handleNameTypeChange} options={list} />
                     <PeriodSelect value={filters.period} onChange={handlePeriodChange} />
                     <PayTypeSelect value={filters.type_pay} onChange={handlePayTypeChange} />
                     </div>
                   </div>
                 
               
       
                {/* Toggle เลือกประเภทการกรองสถานพยาบาล */}
                 <div className="mb-6">
                   <h2 className="text-sm text-gray-700 mb-2">วิธีการกรองสถานพยาบาล</h2>
                   <div className="flex gap-4 mb-4">
                     <label className="flex items-center gap-2">
                      <input
                 type="radio"
                 name="filterMode"
                 value="hmain"
                 checked={mode === 'hmain'}
                 onChange={() => setMode('hmain')}
               />
                       หน่วยบริการแม่ข่าย
                     </label>
                     <label className="flex items-center gap-2">
                 <input
                 type="radio"
                 name="filterMode"
                 value="area"
                 checked={mode === 'area'}
                 onChange={() => setMode('area')}
               />
                       หน่วยบริการปลายทางที่ส่ง
                     </label>
                   </div>
               
                   {/* กลุ่ม: หน่วยบริการแม่ข่าย */}
                   {mode === 'hmain' && (
                     <div className="grid md:grid-cols-1 gap-4">
                       <HmainSelect value={filters.HmainOP} onChange={handleHmainOPChange} ListFiltter={list_hamin} />
                       
                     </div>
                   )}
               
                   {/* กลุ่ม: หน่วยบริการปลายทาง */}
                   {mode === 'area' && (
                     <div className="grid md:grid-cols-3 gap-4">
                     <AffiliationSelect  value={filters.type_affiliation} onChange={handleAffiliationChange} />
                     <AmpurSelect value={filters.name_Ampur} onChange={handleAmpurChange} typeAffiliations={filters.type_affiliation} />
                     </div>
                   )}
                 </div>
       
           
       
       
                 
                   {/* ปุ่มล้างตัวกรอง */}
                  <div className="mt-6 flex items-center gap-4">
                   <button
                     onClick={fetchAppointments}
                     className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                   >
                     🔍 ดูข้อมูล
                   </button>
                   <button
                     onClick={resetFilters}
                     className="flex items-center gap-2 bg-white text-red-500 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors border border-red-500"
                   >
                     <FaEraser />
                     ล้างตัวกรอง
                   </button>
                   
                 </div>
               </div>
       

      </div>

      <div className="relative z-10 bg-white/30 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 min-h-[500px] flex items-center justify-center">
            
          {loading && (
       <div className="absolute inset-0 bg-white/60 backdrop-blur-xs z-50 flex items-center justify-center pointer-events-auto rounded-lg">
         <div className="flex flex-col items-center">
           <ScaleLoader color="#2593da" />
           <p className="mt-4 text-gray-700 text-lg font-semibold">กำลังโหลด...</p>
           <p className="text-gray-600 text-sm">กำลังโหลดข้อมูล</p>
         </div>
       </div>
     )}
     
     {!loading && !initialLoadDone && (
       <div className="p-4 text-center text-gray-700">
         <p className="text-lg text-gray-500">กำลังโหลดข้อมูลเริ่มต้น...</p>
       </div>
     )}
     
     {!loading && initialLoadDone && (!filteredData || filteredData.length === 0) && (
       <div className="p-4 text-center text-gray-700">
  <div className="flex flex-col items-center justify-center">
    <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
    <p className="text-xl font-semibold mb-2">ไม่พบข้อมูลสำหรับเงื่อนไขที่เลือก</p>
    <p>กรุณาลองปรับตัวกรองข้อมูลแล้วลองใหม่อีกครั้ง</p>
  </div>
</div>
     )}
     
     {!loading && initialLoadDone && filteredData && filteredData.length > 0 && (
       <div className="w-full">
         <div className="flex flex-col md:flex-row gap-4 mb-4">
           <div className="bg-white/50 backdrop-blur-sm md:w-[32%] p-4 rounded-lg shadow-lg">
             <CustomChart data={filteredData} />
           </div>
           <div className="backdrop-blur-sm md:w-[68%] p-4 rounded-lg shadow-lg">
             <TableListAllCountNameType data={filteredData} />
           </div>
         </div>
     
         <div className="flex flex-col gap-4">
           <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg shadow-lg flex-grow">
             <CustomTable data={filteredDataDetail} />
               <p className="text-base text-gray-600 mt-4">
      แหล่งที่มาข้อมูล :{" "}
      <a
        href="https://seamlessfordmis.nhso.go.th/seamlessfordmis/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        https://seamlessfordmis.nhso.go.th/seamlessfordmis/
      </a>
    </p>
           </div>
         </div>
       </div>
     )}
     
     
     
     
           </div>
    </div>
  );
}
