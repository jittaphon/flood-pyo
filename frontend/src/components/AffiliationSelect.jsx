import React, { useState, useEffect } from 'react';
import { Select, Spin, Alert, Form, Checkbox, Tooltip,Typography  } from 'antd';
  const { Option } = Select;
  
import { API } from '../api'; // ตรวจสอบ path ของ API ของคุณให้ถูกต้อง

export default function AffiliationSelect({ value, onChange }) {


  const [AffiliationOptions, setAffiliationOptions] = useState([]); // เก็บ { code: '6530', fullName: '6530 Name' }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const FetchListAffiliation = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.ListFiltter.getListAffiliation();
        if (response.data && Array.isArray(response.data.data)) {
        
          setAffiliationOptions(response.data.data);
        } else {
          setError(new Error("รูปแบบข้อมูลที่ได้รับจาก API ไม่ถูกต้อง"));
        }
      } catch (err) {
        console.error("Error fetching Hmain options:", err);
        setError(new Error("ไม่สามารถโหลดรายละเอียดสังกัดได้ กรุณาลองใหม่ภายหลัง"));
      } finally {
        setLoading(false);
      }
    };

    FetchListAffiliation();
  }, []);

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

  // สร้าง array ของรหัสทั้งหมด (เช่น ['6530', '1234'])
  const allOptionCodes = AffiliationOptions.map(option => option.type_hos);

  // ค่าพิเศษสำหรับ "ทั้งหมด"
  const ALL_OPTION_VALUE = 'ทั้งหมด';

  const handleChange = (selectedValues) => {
    const isAllSelected = selectedValues.includes(ALL_OPTION_VALUE);
    const wasAllSelected = value.includes(ALL_OPTION_VALUE) || (AffiliationOptions.length > 0 && value.length === allOptionCodes.length);

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




  return (
   <Select
         mode="multiple"
         size="large"
         placeholder="สังกัด"
         value={
           (value.includes(ALL_OPTION_VALUE) || (AffiliationOptions.length > 0 && value.length === allOptionCodes.length))
             ? [...value, ALL_OPTION_VALUE]
             : value
         }
         onChange={handleChange}
         style={{ minWidth: 300, borderRadius: 8, backgroundColor: '#f9f9f9' }}
   
         maxTagCount={2}
         maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} ...`}
         optionLabelProp="label"
         tagRender={({ label }) => <span>{label}</span>}
       >
         {/* Option ทั้งหมด */}
         <Option key={ALL_OPTION_VALUE} value={ALL_OPTION_VALUE} label={ALL_OPTION_VALUE}>
           <Checkbox
             checked={
               value.includes(ALL_OPTION_VALUE) ||
               (AffiliationOptions.length > 0 && value.length === allOptionCodes.length)
             }
             style={{ marginRight: 8 }}
    
           />
           <Tooltip title="ทั้งหมด" placement="right" arrow>
             <span>{ALL_OPTION_VALUE}</span>
           </Tooltip>
         </Option>
   
         {/* Option รายการสถานะ */}
         {AffiliationOptions.map(option => (

      

           <Option key={option.type_hos} value={option.type_hos} label={option.type_hos}>
             <Checkbox
               checked={value.includes(option.type_hos)}
               style={{ marginRight: 8 }}
        
             />
             <Tooltip title={option.type_hos} placement="right" arrow>
               <span>{option.type_hos}</span>
             </Tooltip>
           </Option>
         ))}
       </Select>
  );
}