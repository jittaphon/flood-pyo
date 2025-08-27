// src/components/filters/PeriodSelect.jsx

import React, { useState, useEffect } from 'react';
import { Select, Spin, Alert, Form, Checkbox, Tooltip ,Typography  } from 'antd';
  const { Option } = Select;
import { API } from '../api'; // ปรับ path ให้ถูกต้อง



const ALL_OPTION_VALUE = 'ทั้งหมด';

export default function PeriodSelect({ value, onChange }) {

  const [periodOptions, setPeriodOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPeriodOptions() {
      setLoading(true);
      setError(null);
      try {
        const response = await API.DMIS_KTP.getPeriods();
        if (response.data && Array.isArray(response.data.data)) {
          setPeriodOptions(response.data.data);
        } else {
          setError(new Error("รูปแบบข้อมูลที่ได้รับจาก API ไม่ถูกต้อง"));
        }
      } catch (err) {
        setError(new err("ไม่สามารถโหลดประเภทรายการตรวจได้ กรุณาลองใหม่ภายหลัง"));
      } finally {
        setLoading(false);
      }
    }
    fetchPeriodOptions();
  }, []);

  const allOptionValues = periodOptions.map(option => option.period);

  const handleChange = (selectedValues) => {
    const isAllSelected = selectedValues.includes(ALL_OPTION_VALUE);
    const wasAllSelected = value.includes(ALL_OPTION_VALUE) || (periodOptions.length > 0 && value.length === allOptionValues.length);

    let nextValue = [];

    if (isAllSelected && !wasAllSelected) {
      // เลือกทั้งหมด
      nextValue = [...allOptionValues, ALL_OPTION_VALUE];
    } else if (!isAllSelected && wasAllSelected) {
      // ยกเลิกเลือกทั้งหมด
      nextValue = [];
    } else {
      // เลือกบางตัว
      const filteredValues = selectedValues.filter(val => val !== ALL_OPTION_VALUE);
      const allSelectedNow = allOptionValues.length > 0 && allOptionValues.every(opt => filteredValues.includes(opt));
      if (allSelectedNow) {
        nextValue = [...filteredValues, ALL_OPTION_VALUE];
      } else {
        nextValue = filteredValues;
      }
    }

    // ส่งค่ากลับโดยกรอง 'ทั้งหมด' ออกเสมอ
    onChange(nextValue.filter(val => val !== ALL_OPTION_VALUE));
  };

  // แสดงข้อความใน Select: ถ้าทุกตัวเลือกถูกเลือกให้แสดง "ทั้งหมด"

 if (loading) {
  return (
    <div style={{
      minWidth: 300,  // 🔁 ปรับให้เท่ากับ Select
      padding: 8,
      borderRadius: 8,
      backgroundColor: '#f9f9f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 40, // 🔁 ความสูงพอกัน
      border: '1px solid #d9d9d9',
    }}>
      <Spin size="small" style={{ marginRight: 8 }} />
      <Typography.Text>กำลังโหลดรายการตรวจ...</Typography.Text>
    </div>
  );
}


  if (error) {
    return (
      <div style={{
        minWidth: 200,
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        color: '#f5222d',
      }}>
        <Typography.Text>{error.message}</Typography.Text>
      </div>
    );
  }

  // สร้าง Option ของ Select พร้อม Checkbox และ Tooltip
  // note: Antd Select option ไม่รองรับ Checkbox แบบเต็มรูปแบบเหมือน MUI แต่สามารถ render custom ได้

  return (
    <Select
     size="large"
      mode="multiple"
      placeholder="เลือกงวด"
      value={
        (value.includes(ALL_OPTION_VALUE) || (periodOptions.length > 0 && value.length === allOptionValues.length))
          ? [...value, ALL_OPTION_VALUE]
          : value
      }
      onChange={handleChange}
      style={{ minWidth: 200, borderRadius: 8, backgroundColor: '#f9f9f9' }}
    
      maxTagCount={2}
      maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} ...`}
      optionLabelProp="label"
      // render selected values ใน tag
      tagRender={({ label }) => <span>{label}</span>}
    >
      {/* Option: ทั้งหมด */}
      <Option key={ALL_OPTION_VALUE} value={ALL_OPTION_VALUE} label={ALL_OPTION_VALUE}>
        <Checkbox
          checked={
            value.includes(ALL_OPTION_VALUE) ||
            (periodOptions.length > 0 && value.length === allOptionValues.length)
          }
          style={{ marginRight: 8 }}
  // ป้องกันคลิก checkbox ซ้ำกับ select
        />
        <Tooltip title="ทั้งหมด" placement="right" arrow>
          <span>{ALL_OPTION_VALUE}</span>
        </Tooltip>
      </Option>

      {/* Options: รายการงวด */}
      {periodOptions.map((option) => (
        <Option key={option.period} value={option.period} label={option.period}>
          <Checkbox
            checked={value.includes(option.period)}
            style={{ marginRight: 8 }}
           
          />
          <Tooltip title={option.period} placement="right" arrow>
            <span>{option.period}</span>
          </Tooltip>
        </Option>
      ))}
    </Select>
  );
}
