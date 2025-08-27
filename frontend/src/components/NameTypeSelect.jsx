import React, { useMemo } from 'react';
import { Select, Checkbox, Tooltip, Typography } from 'antd';

const { Option } = Select;

export default function NameTypeMultiSelectCheckbox({ value, onChange, options }) {
  
  const nameTypeOptions = options ?? [];

  const allOptionValues = useMemo(
    () => nameTypeOptions.map(option => option.name_type),
    [nameTypeOptions]
  );

  const ALL_OPTION_VALUE = 'ทั้งหมด';

  const handleChange = (selectedValues) => {
    const isAllSelected = selectedValues.includes(ALL_OPTION_VALUE);
    const wasAllSelected =
      value.includes(ALL_OPTION_VALUE) ||
      (nameTypeOptions.length > 0 && value.length === allOptionValues.length);

    let nextValue = [];

    if (isAllSelected && !wasAllSelected) {
      nextValue = [...allOptionValues, ALL_OPTION_VALUE];
    } else if (!isAllSelected && wasAllSelected) {
      nextValue = [];
    } else {
      const filteredValues = selectedValues.filter(val => val !== ALL_OPTION_VALUE);
      const allSelectedNow =
        allOptionValues.length > 0 &&
        allOptionValues.every(opt => filteredValues.includes(opt));
      if (allSelectedNow) {
        nextValue = [...filteredValues, ALL_OPTION_VALUE];
      } else {
        nextValue = filteredValues;
      }
    }

    onChange(nextValue.filter(val => val !== ALL_OPTION_VALUE));
  };

  return (
    <Select
      mode="multiple"
      size="large"
      placeholder="รายการประเภทที่ขอเบิก"
      value={
        (value.includes(ALL_OPTION_VALUE) ||
          (nameTypeOptions.length > 0 && value.length === allOptionValues.length))
          ? [...value, ALL_OPTION_VALUE]
          : value
      }
      onChange={handleChange}
      style={{ minWidth: 500, borderRadius: 8, backgroundColor: '#f9f9f9' }}
      maxTagCount={2}
      maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} ...`}
      optionLabelProp="label"
      tagRender={({ label }) => <span>{label}</span>}
    >
      <Option key={ALL_OPTION_VALUE} value={ALL_OPTION_VALUE} label={ALL_OPTION_VALUE}>
        <Checkbox
          checked={
            value.includes(ALL_OPTION_VALUE) ||
            (nameTypeOptions.length > 0 && value.length === allOptionValues.length)
          }
          style={{ marginRight: 8 }}
        />
        <Tooltip title="ทั้งหมด" placement="right" arrow>
          <span>{ALL_OPTION_VALUE}</span>
        </Tooltip>
      </Option>

      {nameTypeOptions.map(option => (
        <Option key={option.name_type} value={option.name_type} label={option.name_type}>
          <Checkbox
            checked={value.includes(option.name_type)}
            style={{ marginRight: 8 }}
          />
          <Tooltip title={option.name_type} placement="right" arrow>
            <span>{option.name_type}</span>
          </Tooltip>
        </Option>
      ))}
    </Select>
  );
}
