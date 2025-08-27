import React, { useState, useEffect } from 'react';
import { Select, Spin, Checkbox, Tooltip, Typography } from 'antd';
const { Option } = Select;

import { API } from '../api'; // ตรวจสอบ path ของ API ของคุณให้ถูกต้อง

export default function HsendSelect({ value, onChange, typeAmpur, typeAffiliations }) {
    const [allHsendOptions, setAllHsendOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredHsendOptions, setFilteredHsendOptions] = useState([]);

    const getCodeFromFullName = (fullName) => {
        return fullName.split(' ')[0];
    };

    // --- useEffect 1: Fetch ALL HSEND options ONCE when the component mounts ---
    useEffect(() => {
        const fetchAllHsendOptions = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await API.DMIS_KTP.getHSENDFull();
                if (response.data && Array.isArray(response.data.data)) {
                    const mappedOptions = response.data.data.map(item => ({
                        code: getCodeFromFullName(item.HSEND_FULL),
                        fullName: item.HSEND_FULL,
                        Ampur: item.name_Ampur,
                        Affiliation: item.type_hos // Ensure backend sends this field
                    }));
                    setAllHsendOptions(mappedOptions);
                } else {
                    setError(new Error("รูปแบบข้อมูลที่ได้รับจาก API ไม่ถูกต้อง"));
                }
            } catch (err) {
                console.error("Error fetching Hsend options:", err);
                setError(new Error("ไม่สามารถโหลดหน่วยบริการได้ กรุณาลองใหม่ภายหลัง"));
            } finally {
                setLoading(false);
            }
        };

        fetchAllHsendOptions();
    }, []); // Empty dependency array ensures this runs only on mount

    // --- useEffect 2: Filter the options whenever `typeAmpur` or `typeAffiliations` changes ---
    useEffect(() => {
        let currentFilteredOptions = [];

        // 1. ตรวจสอบว่ามี Ampur ถูกเลือกหรือไม่
        // ถ้าไม่มี Ampur ถูกเลือกเลย, ไม่ต้องแสดง HSENDs ใดๆ และเคลียร์ค่าที่เลือกไว้
        if (!typeAmpur || typeAmpur.length === 0) {
            currentFilteredOptions = [];
        } else {
            // 2. ถ้ามี Ampur ถูกเลือก, กรองตาม Ampur
            currentFilteredOptions = allHsendOptions.filter(option =>
                typeAmpur.includes(option.Ampur)
            );

            // 3. กรองตาม Affiliation (สังกัด) เพิ่มเติม (ถ้ามีการเลือก Affiliation)
            if (typeAffiliations && typeAffiliations.length > 0) {
                currentFilteredOptions = currentFilteredOptions.filter(option =>
                    typeAffiliations.includes(option.Affiliation)
                );
            }
        }

        setFilteredHsendOptions(currentFilteredOptions);

        // --- สำคัญ: เคลียร์ค่าที่ถูกเลือกไว้ หากไม่อยู่ในรายการที่ถูกกรองแล้ว ---
        const validValues = value.filter(v => currentFilteredOptions.some(opt => opt.code === v));
        if (validValues.length !== value.length) {
            onChange(validValues);
        }

    }, [typeAmpur, typeAffiliations, allHsendOptions, onChange, value]); // Dependencies

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
                minWidth: 300,
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

    const allFilteredOptionCodes = filteredHsendOptions.map(option => option.code);
    const ALL_OPTION_VALUE = 'ทั้งหมด';

    const handleChange = (selectedValues) => {
        const isAllSelected = selectedValues.includes(ALL_OPTION_VALUE);
        const wasAllSelected = value.includes(ALL_OPTION_VALUE) || (filteredHsendOptions.length > 0 && value.length === allFilteredOptionCodes.length);

        let nextValue = [];

        if (isAllSelected && !wasAllSelected) {
            nextValue = [...allFilteredOptionCodes, ALL_OPTION_VALUE];
        } else if (!isAllSelected && wasAllSelected) {
            nextValue = [];
        } else {
            const selectedCodes = selectedValues.filter(val => val !== ALL_OPTION_VALUE);
            const allSelectedNow = allFilteredOptionCodes.length > 0 && allFilteredOptionCodes.every(opt => selectedCodes.includes(opt));
            if (allSelectedNow) {
                nextValue = [...selectedCodes, ALL_OPTION_VALUE];
            } else {
                nextValue = selectedCodes;
            }
        }
        onChange(nextValue.filter(val => val !== ALL_OPTION_VALUE));
    };

    return (
        <Select
            mode="multiple"
            size="large"
            placeholder="หน่วยบริการที่ส่งข้อมูล (HSEND)"
            value={
                (value.includes(ALL_OPTION_VALUE) || (filteredHsendOptions.length > 0 && value.length === allFilteredOptionCodes.length))
                    ? [...value, ALL_OPTION_VALUE]
                    : value
            }
            onChange={handleChange}
            style={{ minWidth: 300, borderRadius: 8, backgroundColor: '#f9f9f9' }}
            maxTagCount={2}
            maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} ...`}
            optionLabelProp="label"
            tagRender={({ label }) => <span>{label}</span>}
            // *** เงื่อนไข disabled ที่แก้ไข ***
            disabled={!typeAmpur || typeAmpur.length === 0}
        >
            {/* Option for "ทั้งหมด" */}
            {filteredHsendOptions.length > 0 && ( // แสดง "ทั้งหมด" ถ้ามีตัวเลือกให้เลือก
                <Option key={ALL_OPTION_VALUE} value={ALL_OPTION_VALUE} label={ALL_OPTION_VALUE}>
                    <Checkbox
                        checked={
                            value.includes(ALL_OPTION_VALUE) ||
                            (filteredHsendOptions.length > 0 && value.length === allFilteredOptionCodes.length)
                        }
                        style={{ marginRight: 8 }}
                     
                    />
                    <Tooltip title="ทั้งหมด" placement="right" arrow>
                        <span>{ALL_OPTION_VALUE}</span>
                    </Tooltip>
                </Option>
            )}

            {/* Render the filtered options */}
            {filteredHsendOptions.map(option => (
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