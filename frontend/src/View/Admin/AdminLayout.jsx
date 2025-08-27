import React, { useState } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

export default function AdminDashboard() {
  const [selectedTable, setSelectedTable] = useState("");
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);

  const tables = ["DMIS-KTP", "DMIS-TB", "DMIS-NAP", "DMIS-CKD", "DMIS-MOPH-Claim"];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx")) {
      alert("รองรับเฉพาะไฟล์ .xlsx เท่านั้น");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (jsonData.length > 0) {
        const keys = Object.keys(jsonData[0]);
        const columnHelper = createColumnHelper();
        const cols = keys.map((key) =>
          columnHelper.accessor(key, {
            header: key,
            cell: (info) => info.getValue(),
          })
        );

        setColumns(cols);
        setTableData(jsonData);
      } else {
        setColumns([]);
        setTableData([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-start p-6 bg-gradient-to-br from-blue-50 to-white overflow-hidden">
      {/* Background */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 opacity-30 blur-3xl rounded-full animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-200 opacity-30 blur-3xl rounded-full animate-pulse delay-2000" />

      <motion.div
        className="relative z-10 w-full h-full backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl rounded-2xl p-6 flex flex-col"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-blue-900 mb-6">📂 Admin Dashboard</h1>

        {/* Select Table */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            เลือก Table
          </label>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/60 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          >
            <option value="" disabled>
              -- เลือก Table --
            </option>
            {tables.map((table, idx) => (
              <option key={idx} value={table}>
                {table}
              </option>
            ))}
          </select>
        </div>

        {/* Upload Section */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="border-2 border-dashed border-blue-400 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-white/30 hover:bg-white/40 transition cursor-pointer mb-6"
        >
          <input
            type="file"
            id="fileUpload"
            accept=".xlsx"
            className="hidden"
            onChange={handleFileChange}
          />
          <label htmlFor="fileUpload" className="cursor-pointer">
            <p className="text-blue-700 font-semibold">
              ลากไฟล์ .xlsx มาวาง หรือกดเลือกเพื่ออัปโหลด
            </p>
            <div className="mt-4">
              <span className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-700 transition">
                เลือกไฟล์
              </span>
            </div>
          </label>
        </motion.div>

        {/* Preview Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="table-auto min-w-full border border-gray-300 bg-white rounded-xl shadow-md">
            <thead className="bg-blue-600 text-white sticky top-0">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 border border-gray-300 text-left text-sm font-semibold"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.slice(0, 10).map((row, i) => (
                  <tr
                    key={row.id}
                    className={`${i % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 transition`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-3 border border-gray-200 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length || 1}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    ยังไม่มีข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
