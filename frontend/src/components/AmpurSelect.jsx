import React, { useState, useEffect } from 'react';
import { Select, Spin, Typography, Checkbox, Tooltip } from 'antd';
const { Option } = Select;

import { API } from '../api';

export default function AmpurSelect({
  value = [], // ✅ default เพื่อป้องกัน undefined
  onChange,
  typeAffiliations = []
}) {
  const [ampurOptions, setAmpurOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ALL_OPTION_VALUE = 'ทั้งหมด';

  useEffect(() => {
    const fetchAmpurOptions = async () => {
    if (!typeAffiliations || typeAffiliations.length === 0) {
  setAmpurOptions([]);
  setLoading(false); // แก้จุดนี้!
  return;
}


      setLoading(true);
      setError(null);

      try {
       const response = await API.ListFiltter.getListAmpurByAffiliation(typeAffiliations);




       

        if (response.data && Array.isArray(response.data.data)) {
          setAmpurOptions(response.data.data);
        } else {
          setError(new Error("รูปแบบข้อมูลจาก API ไม่ถูกต้อง"));
        }
      } catch (err) {
        console.error("Error fetching ampur options:", err);
        setError(new Error("ไม่สามารถโหลดรายการอำเภอได้ กรุณาลองใหม่ภายหลัง"));
      } finally {
        setLoading(false);
      }
    };

    fetchAmpurOptions();
  }, [typeAffiliations]);

  const handleChange = (selectedValues = []) => {
    const isAllSelected = selectedValues.includes(ALL_OPTION_VALUE);
    const wasAllSelected = value.includes(ALL_OPTION_VALUE) ||
      (ampurOptions.length > 0 && value.length === ampurOptions.length);

    let nextValue = [];

    if (isAllSelected && !wasAllSelected) {
      nextValue = [...ampurOptions.map(opt => opt.name_Ampur), ALL_OPTION_VALUE];
    } else if (!isAllSelected && wasAllSelected) {
      nextValue = [];
    } else {
      const filteredValues = selectedValues.filter(val => val !== ALL_OPTION_VALUE);
      const allSelectedNow = ampurOptions.length > 0 &&
        ampurOptions.every(opt => filteredValues.includes(opt.name_Ampur));

      nextValue = allSelectedNow ? [...filteredValues, ALL_OPTION_VALUE] : filteredValues;
    }
console.log("selectedValues:", selectedValues);
console.log("nextValue to send:", nextValue.filter(val => val !== ALL_OPTION_VALUE));

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

  const resolvedValue = Array.isArray(value) ? value : [];

  return (
    <Select
      mode="multiple"
      size="large"
      placeholder="อำเภอ"
      value={
        (resolvedValue.includes(ALL_OPTION_VALUE) || (ampurOptions.length > 0 && resolvedValue.length === ampurOptions.length))
          ? [...resolvedValue, ALL_OPTION_VALUE]
          : resolvedValue
      }
      onChange={handleChange}
      disabled={typeAffiliations.length === 0}
      style={{ minWidth: 300, borderRadius: 8, backgroundColor: '#f9f9f9' }}
      maxTagCount={2}
      maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} ...`}
      optionLabelProp="label"
      tagRender={({ label }) => <span>{label}</span>}
    >
      <Option key={ALL_OPTION_VALUE} value={ALL_OPTION_VALUE} label={ALL_OPTION_VALUE}>
        <Checkbox
          checked={
            resolvedValue.includes(ALL_OPTION_VALUE) ||
            (ampurOptions.length > 0 && resolvedValue.length === ampurOptions.length)
          }
          style={{ marginRight: 8 }}

        />
        <Tooltip title="ทั้งหมด" placement="right" arrow>
          <span>{ALL_OPTION_VALUE}</span>
        </Tooltip>
      </Option>

      {ampurOptions.map(option => (
        <Option key={option.name_Ampur} value={option.name_Ampur} label={option.name_Ampur}>
          <Checkbox
            checked={resolvedValue.includes(option.name_Ampur)}
            style={{ marginRight: 8 }}
  
          />
          <Tooltip title={option.name_Ampur} placement="right" arrow>
            <span>{option.name_Ampur}</span>
          </Tooltip>
        </Option>
      ))}
    </Select>
  );
}
