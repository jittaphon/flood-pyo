import React from 'react';
import ExportButton from './ExportButton';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper();

export default function CustomTable({ data }) {
  

  const groupedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return data;
  }, [data]);

  const [internalData, setInternalData] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnFilters, setColumnFilters] = React.useState([]);

  React.useEffect(() => {
    setInternalData(groupedData);
  }, [groupedData]);

  // ✅ ตรวจสอบว่า field มีอยู่หรือไม่
  const hasHSEND = React.useMemo(() => {
    return groupedData?.some(item => item?.HSEND_FULL);
  }, [groupedData]);

  const columns = React.useMemo(() => {
    const maxLengthDisplay = (value, max = 50) => {
      if (!value) return '-';
      return value.length > max ? `${value.substring(0, max)}...` : value;
    };

    const cols = [
      columnHelper.accessor((row, index) => index + 1, {
        id: 'ลำดับ',
        header: () => 'ลำดับ',
        cell: info => info.getValue(),
        enableSorting: false,
        enableFiltering: false,
      }),

      columnHelper.accessor('HmainOP_FULL', {
        header: () => 'หน่วยบริการแม่ข่าย',
        cell: info => {
          const value = info.getValue();
          return <span title={value}>{maxLengthDisplay(value)}</span>;
        },
      }),

      hasHSEND &&
        columnHelper.accessor('HSEND_FULL', {
          header: () => 'หน่วยบริการที่ส่ง',
          cell: info => {
            const value = info.getValue();
            return <span title={value}>{maxLengthDisplay(value)}</span>;
          },
        }),

      columnHelper.accessor('name_type', {
        header: () => 'รายการประเภทที่ขอเบิก',
        cell: info => {
          const value = info.getValue();
          return <span title={value}>{maxLengthDisplay(value, 35)}</span>;
        },
      }),

      columnHelper.accessor('unit_price', {
        header: () => 'ราคา',
        cell: info => info.getValue(),
      }),

      columnHelper.accessor('count', {
        header: () => 'จำนวนเรียกเก็บ (ครั้ง)',
        cell: info => info.getValue(),
        enableSorting: true,
      }),

      columnHelper.accessor('total_price', {
        header: () => 'รวมเงินที่เบิก (บาท)',
        cell: info => {
          const value = parseFloat(info.getValue() || 0);
          const formatted = value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          if (value === 0) return formatted;
          return (
            <span className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap">
              {formatted}
            </span>
          );
        },
      }),

      columnHelper.accessor('total_compensate', {
        header: () => 'ยอดชดเชย (บาท)',
        cell: info => {
          const value = parseFloat(info.getValue() || 0);
          const formatted = value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          if (value === 0) return formatted;
          return (
            <span className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap">
              {formatted}
            </span>
          );
        },
      }),

      columnHelper.accessor('total_no_compensate', {
        header: () => 'ยอดไม่ชดเชย (บาท)',
        cell: info => {
          const value = parseFloat(info.getValue() || 0);
          const formatted = value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          if (value === 0) return formatted;
          return (
            <span className="bg-orange-100 text-orange-800 rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap">
              {formatted}
            </span>
          );
        },
      }),

      columnHelper.accessor('period', {
        header: () => 'งวด',
        cell: info => info.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor('month', {
        header: () => 'เดือน',
        cell: info => info.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor('id_year', {
        header: () => 'ปี',
        cell: info => info.getValue(),
        enableSorting: true,
      }),
    ];

    return cols.filter(Boolean); // เอา undefined ออกจาก array
  }, [hasHSEND]);

  const table = useReactTable({
    data: internalData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });
  if (!internalData || internalData.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 bg-white rounded-lg shadow-lg">
        <p>ไม่พบข้อมูลที่ตรงกัน</p>
        <p className="text-sm mt-1">โปรดลองปรับการค้นหาหรือตัวกรองของคุณ</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="ค้นหาทั้งหมด..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <ExportButton data={data} />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-100 border-b border-blue-300">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc'
                          ? ' 🔼'
                          : header.column.getIsSorted() === 'desc'
                          ? ' 🔽'
                          : ''}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="even:bg-gray-50 hover:bg-blue-50 transition">
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      ['total_price', 'total_compensate', 'total_no_compensate'].includes(cell.column.id)
                        ? 'text-right font-semibold text-gray-700'
                        : 'text-gray-900'
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex space-x-2">
          <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 disabled:opacity-50">{'<<'}</button>
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 disabled:opacity-50">{'<'}</button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 disabled:opacity-50">{'>'}</button>
          <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 disabled:opacity-50">{'>>'}</button>
        </div>

        <span className="flex items-center gap-1 text-sm">
          หน้า <strong>{table.getState().pagination.pageIndex + 1} / {table.getPageCount()}</strong>
        </span>

        <span className="flex items-center gap-1 text-sm">
          | ไปยังหน้า:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="w-16 p-1 border border-gray-300 rounded-md"
          />
        </span>

        <select
          value={table.getState().pagination.pageSize}
          onChange={e => table.setPageSize(Number(e.target.value))}
          className="p-1 border border-gray-300 rounded-md text-sm"
        >
          {[10, 20, 30, 40, 50].map(size => (
            <option key={size} value={size}>แสดง {size}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
