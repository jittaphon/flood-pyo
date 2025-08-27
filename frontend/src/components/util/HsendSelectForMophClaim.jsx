import React, { useState, useEffect } from 'react';
import { Select, Spin, Checkbox, Tooltip, Typography } from 'antd';
const { Option } = Select;

import { API } from '../../api'; // ตรวจสอบ path ให้ถูกต้อง

export default function HsendSelect({ value = [], onChange, typeAmpur, typeAffiliations }) {
  const [allHsendOptions, setAllHsendOptions] = useState([]);
  const [filteredHsendOptions, setFilteredHsendOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCodeFromFullName = (fullName) => fullName?.split(' ')[0] || '';

  // โหลด Hsend ทั้งหมดครั้งเดียว
  useEffect(() => {
    const fetchAllHsendOptions = async () => {
      setLoading(true);
      try {
        const response = await API.DMIS_KTP.getHSENDFull();
        const raw = response?.data?.data || [];

        const mappedOptions = raw.map(item => ({
          code: getCodeFromFullName(item.HSEND_FULL),
          fullName: item.HSEND_FULL,
          Ampur: item.name_Ampur,
          Affiliation: item.type_hos,
        }));

        setAllHsendOptions(mappedOptions);
      } catch (err) {
        console.error("Error fetching Hsend:", err);
        setError(new Error("ไม่สามารถโหลดหน่วยบริการได้ กรุณาลองใหม่ภายหลัง"));
      } finally {
        setLoading(false);
      }
    };

    fetchAllHsendOptions();
  }, []);

  // กรองตาม Ampur และ Affiliation
  useEffect(() => {
    if (!typeAmpur || typeAmpur.length === 0) {
      setFilteredHsendOptions([]);
      if (value.length > 0) onChange([]);
      return;
    }

    let current = allHsendOptions.filter(opt => typeAmpur.includes(opt.Ampur));

    if (typeAffiliations?.length > 0) {
      current = current.filter(opt => typeAffiliations.includes(opt.Affiliation));
    }

    setFilteredHsendOptions(current);

    // เคลียร์ค่าที่ไม่อยู่ในรายการใหม่
    const validValues = value.filter(v => current.some(opt => opt.code === v));
    if (validValues.length !== value.length) {
      onChange(validValues);
    }

  }, [typeAmpur, typeAffiliations, allHsendOptions]);

  // Loading UI
  if (loading) {
    return (
      <div style={{
        minWidth: 300,
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        border: '1px solid #d9d9d9',
      }}>
        <Spin size="small" style={{ marginRight: 8 }} />
        <Typography.Text>กำลังโหลดรายการตรวจ...</Typography.Text>
      </div>
    );
  }

  // Error UI
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

  const allOptionCodes = filteredHsendOptions.map(opt => opt.code);
  const ALL_OPTION_VALUE = 'ทั้งหมด';

  const handleChange = (selected) => {
    const selectedWithoutAll = selected.filter(v => v !== ALL_OPTION_VALUE);
    const isAllSelected = selected.includes(ALL_OPTION_VALUE) || selectedWithoutAll.length === allOptionCodes.length;

    const finalSelected = isAllSelected ? allOptionCodes : selectedWithoutAll;
    onChange(finalSelected);
  };

  const displayValue = (
    value.length === allOptionCodes.length
      ? [...value, ALL_OPTION_VALUE]
      : value
  );

  return (
    <Select
      mode="multiple"
      size="large"
      placeholder="หน่วยบริการที่ส่งข้อมูล (HSEND)"
      value={displayValue}
      onChange={handleChange}
      style={{ minWidth: 300, borderRadius: 8, backgroundColor: '#f9f9f9' }}
      maxTagCount={2}
      maxTagPlaceholder={(omitted) => `+${omitted.length} ...`}
      optionLabelProp="label"
      tagRender={({ label }) => <span>{label}</span>}
      disabled={!typeAmpur || typeAmpur.length === 0}
    >
      {/* ตัวเลือก "ทั้งหมด" */}
      {filteredHsendOptions.length > 0 && (
        <Option key={ALL_OPTION_VALUE} value={ALL_OPTION_VALUE} label={ALL_OPTION_VALUE}>
          <Checkbox
            checked={value.length === allOptionCodes.length}
            style={{ marginRight: 8 }}
          />
          <Tooltip title="ทั้งหมด" placement="right" arrow>
            <span>{ALL_OPTION_VALUE}</span>
          </Tooltip>
        </Option>
      )}

      {/* ตัวเลือกตามรายการ */}
      {filteredHsendOptions.map(opt => (
        <Option key={opt.code} value={opt.code} label={opt.fullName}>
          <Checkbox checked={value.includes(opt.code)} style={{ marginRight: 8 }} />
          <Tooltip title={opt.fullName} placement="right" arrow>
            <span>{opt.fullName}</span>
          </Tooltip>
        </Option>
      ))}
    </Select>
  );
}
