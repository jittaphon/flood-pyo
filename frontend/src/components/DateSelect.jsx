import React, { useState, useEffect } from 'react';
import { DatePicker, ConfigProvider } from 'antd';
import thTH from 'antd/lib/locale/th_TH';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

dayjs.locale('th');

const monthNamesThai = [
  '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export default function DateRangeFilter({ onDateRangeChange, initialStartDate, initialEndDate  }) {
  const [startDate, setStartDate] = useState(initialStartDate ? dayjs(initialStartDate) : null);
  const [endDate, setEndDate] = useState(initialEndDate ? dayjs(initialEndDate) : null);



  // ฟังการเปลี่ยนแปลงของ props เพื่อ sync กับ parent component
  useEffect(() => {
    setStartDate(initialStartDate ? dayjs(initialStartDate) : dayjs('2025-07-01'));
    setEndDate(initialEndDate ? dayjs(initialEndDate) : null);
  }, [initialStartDate, initialEndDate]);

  // ส่งข้อมูลกลับไปยัง parent component เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    // ส่งข้อมูลเมื่อมีการเปลี่ยนแปลง
    triggerDateChange(startDate, endDate);
  }, [startDate, endDate]);

  const triggerDateChange = (start, end) => {
    const startMonth = start ? start.month() + 1 : '';
    const startYear = start ? start.year() + 543 : '';
    const endMonth = end ? end.month() + 1 : '';
    const endYear = end ? end.year() + 543 : '';

    onDateRangeChange({
      startMonthName: startMonth ? monthNamesThai[startMonth] : '',
      startYear: startYear.toString(),
      endMonthName: endMonth ? monthNamesThai[endMonth] : '',
      endYear: endYear.toString(),
    });
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (endDate && date && endDate.isBefore(date, 'month')) {
      setEndDate(null);
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const disabledEndDate = (current) => {
    if (!startDate) return false;
    // อนุญาตให้เลือกเดือนเดียวกันหรือหลังจาก startDate
    return current && current.isBefore(startDate, 'month');
  };

  return (
    <ConfigProvider locale={thTH}>
      <div className="flex flex-col sm:flex-row gap-3 rounded-xl w-full sm:items-center">
        <div className="flex flex-col">
          <label className="text-gray-700 text-sm font-medium mb-1">วันที่เริ่มต้น</label>
          <DatePicker
            picker="month"
            value={startDate}
            onChange={handleStartDateChange}
            style={{ minWidth: 160, backgroundColor: '#fff', borderRadius: 6 }}
            allowClear
            format={(value) => {
              if (!value) return '';
              const m = value.month() + 1;
              const y = value.year() + 543;
              return `${monthNamesThai[m]} ${y}`;
            }}
            size="large"
            placeholder="เลือกเดือน/ปี"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 text-sm font-medium mb-1">วันที่สิ้นสุด</label>
          <DatePicker
            picker="month"
            value={endDate}
            onChange={handleEndDateChange}
            disabledDate={disabledEndDate}
            style={{ minWidth: 160, backgroundColor: '#fff', borderRadius: 6 }}
            allowClear
            format={(value) => {
              if (!value) return '';
              const m = value.month() + 1;
              const y = value.year() + 543;
              return `${monthNamesThai[m]} ${y}`;
            }}
            size="large"
            placeholder="เลือกเดือน/ปี"
          />
        </div>
      </div>
    </ConfigProvider>
  );
}