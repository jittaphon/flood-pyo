import React from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function ExportButton({ data }) {
  const handleExport = async () => {
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("No data available to export.");
      return;
    }

    const desiredColumnOrder = [
      'HmainOP_FULL', 'HSEND_FULL', 'name_type', 'unit_price', 'count',
      'total_price', 'compensate_count', 'total_compensate',
      'no_compensate_count', 'total_no_compensate',
      'period', 'month', 'id_year',
    ];

    const headerMapping = {
      HmainOP_FULL: 'หน่วยบริการเเม่ข่าย',
      HSEND_FULL: 'หน่วยบริการที่ส่ง',
      name_type: 'รายการประเภทที่ขอเบิก',
      unit_price: 'ราคาต่อหน่วย',
      count: 'จำนวนเรียกเก็บ(ครั้ง)',
      total_price: 'รวมเงินที่เบิก (บาท)',
      compensate_count: 'จำนวนเรียกเก็บชดเชย',
      total_compensate: 'ยอดชดเชย(บาท)',
      no_compensate_count: 'จำนวนเรียกเก็บไม่ชดเชย',
      total_no_compensate: 'ยอดไม่ชดเชย(บาท)',
      period: 'งวด',
      month: 'เดือน',
      id_year: 'ปี',
    };

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Exported Data');

    // Add header row
    const headerRow = desiredColumnOrder.map(key => headerMapping[key] || key);
    worksheet.addRow(headerRow);

    // Style header row
    const header = worksheet.getRow(1);
    header.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D9E1F2' },
      };
      cell.font = { bold: true, color: { argb: '000000' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data rows
    data.forEach(item => {
      const row = desiredColumnOrder.map(key => {
        let value = item[key];
        if (typeof value === 'object' && value !== null) {
          value = value.label || JSON.stringify(value);
        }
        return value ?? '';
      });
      worksheet.addRow(row);
    });

    // Auto width for columns
    worksheet.columns.forEach(column => {
      let maxLength = 10;
      column.eachCell?.(cell => {
        const val = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, val.length);
      });
      column.width = maxLength + 2;
    });

    // Export to file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const now = new Date();
    const timestamp = now.toISOString().replace(/T/, '_').replace(/:/g, '-').replace(/\..+/, '');
    saveAs(blob, `report_${timestamp}.xlsx`);

  };

 return (
  <button
    onClick={handleExport}
    className="
      flex items-center justify-center
      px-4 py-2
      bg-green-600
      border border-green-700
      rounded-md
      shadow-sm
      text-sm font-medium text-white
      hover:bg-green-700
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
      transition-colors duration-200 ease-in-out
    "
    aria-label="Export data"
    title="ส่งออกข้อมูล"
  >
    <ArrowDownTrayIcon className="h-5 w-5 text-white" aria-hidden="true" />
    <span className="ml-2">Export Excel</span>
  </button>
);

}
