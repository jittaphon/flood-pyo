import React, { useState, useEffect , useMemo } from 'react';

import { Select, Spin, Alert, Form, Checkbox, Tooltip ,Typography } from 'antd';
  const { Option } = Select;
import { API } from '../api'; // ตรวจสอบ path ของ API ของคุณให้ถูกต้อง

export default function HmainSelect({ value, onChange , ListFiltter}) {



  const [HmainOptions, setHmainOptions] = useState([]); // เก็บ { code: '6530', fullName: '6530 Name' }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ฟังก์ชันช่วยในการแยก Code จาก Full Name (สมมติว่า Code อยู่หน้าสุดและมีช่องว่างคั่น)
  const getCodeFromFullName = (fullName) => {
    return fullName.split(' ')[0];
  };

  useEffect(() => {
    const fetchHmainOptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.ListFiltter.getHmainOPFull();

        if (response.data && Array.isArray(response.data.data)) {

       
           const filterSet = new Set(ListFiltter.map(item => item.HmainOP));
    
          // Map data ให้มี code และ fullName
          const mappedOptions = response.data.data.map(item => ({
            code: getCodeFromFullName(item.HmainOP_FULL), // แยกเอารหัส
            fullName: item.HmainOP_FULL // เก็บชื่อเต็มไว้แสดง
          }));

          const fittered = mappedOptions.filter(item => filterSet.has(item.code));

          setHmainOptions(fittered);
        } else {
          setError(new Error("รูปแบบข้อมูลที่ได้รับจาก API ไม่ถูกต้อง"));
        }
      } catch (err) {
        console.error("Error fetching Hmain options:", err);
        setError(new Error("ไม่สามารถโหลดหน่วยบริการเเม่ขายได้ กรุณาลองใหม่ภายหลัง"));
      } finally {
        setLoading(false);
      }
    };

    fetchHmainOptions();
  }, [ListFiltter]);



  // สร้าง array ของรหัสทั้งหมด (เช่น ['6530', '1234'])
  const allOptionCodes = useMemo(() => HmainOptions.map(option => option.code), [HmainOptions]);
  // ค่าพิเศษสำหรับ "ทั้งหมด"
  const ALL_OPTION_VALUE = 'ทั้งหมด';


  const handleChange = (selectedValues) => {
    const isAllSelected = selectedValues.includes(ALL_OPTION_VALUE);
    const wasAllSelected = value.includes(ALL_OPTION_VALUE) || (allOptionCodes.length > 0 && value.length === allOptionCodes.length);

    let nextValue = [];

    if (isAllSelected && !wasAllSelected) {
      // เลือกทั้งหมด
      nextValue = [...allOptionCodes, ALL_OPTION_VALUE];
    } else if (!isAllSelected && wasAllSelected) {
      // ยกเลิกเลือกทั้งหมด
      nextValue = [];
    } else {
      // เลือกบางตัว
      const filteredValues = selectedValues.filter(val => val !== ALL_OPTION_VALUE);
      const allSelectedNow = allOptionCodes.length > 0 && allOptionCodes.every(opt => filteredValues.includes(opt));
      if (allSelectedNow) {
        nextValue = [...filteredValues, ALL_OPTION_VALUE];
      } else {
        nextValue = filteredValues;
      }
    }

    // ส่งค่ากลับโดยกรอง 'ทั้งหมด' ออกเสมอ
    onChange(nextValue.filter(val => val !== ALL_OPTION_VALUE));
  };

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
  return (
  <Select
  mode="multiple"
  size="large"
  placeholder="หน่วยบริการแม่ข่าย (HmainOP)"
  value={
    (value.includes(ALL_OPTION_VALUE) || (HmainOptions.length > 0 && value.length === allOptionCodes.length))
      ? [...value, ALL_OPTION_VALUE]
      : value
  }
  onChange={handleChange}
  style={{ minWidth: 400, borderRadius: 8, backgroundColor: '#f9f9f9' }}
  maxTagCount={2}
  maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} ...`}
  optionLabelProp="label"
  tagRender={({ label }) => <span>{label}</span>}
>
  {/* Option: ทั้งหมด */}
  <Option key={ALL_OPTION_VALUE} value={ALL_OPTION_VALUE} label={ALL_OPTION_VALUE}>
    <Checkbox
      checked={
        value.includes(ALL_OPTION_VALUE) ||
        (allOptionCodes.length > 0 && value.length === allOptionCodes.length)
      }
      style={{ marginRight: 8 }}

    />
    <Tooltip title="ทั้งหมด" placement="right" arrow>
      <span>{ALL_OPTION_VALUE}</span>
    </Tooltip>
  </Option>

  {/* Option: รายการโรงพยาบาล */}
  {[...HmainOptions]
    .sort((a, b) => {
      const priorityPrefixes = ['107', '111', '407'];

      const aPrefixMatch = priorityPrefixes.findIndex(prefix => a.code.startsWith(prefix));
      const bPrefixMatch = priorityPrefixes.findIndex(prefix => b.code.startsWith(prefix));

      const aPriority = aPrefixMatch !== -1 ? aPrefixMatch : Infinity;
      const bPriority = bPrefixMatch !== -1 ? bPrefixMatch : Infinity;

      if (aPriority !== bPriority) {
        return aPriority - bPriority; // priority ก่อน
      }

      return b.code.localeCompare(a.code); // ที่เหลือเรียงรหัสย้อนกลับ
    })
    .map(option => (
      <Option key={option.code} value={option.code} label={option.fullName}>
        <Checkbox
          checked={value.includes(option.code)}
          style={{ marginRight: 8 }}
         
        />
        <Tooltip title={option.fullName} placement="right" arrow>
          <span>{option.fullName}</span>
        </Tooltip>
      </Option>
    ))}
</Select>

  );
}