import React from 'react';
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

const truncateText = (text, maxLength = 40) => {
  if (!text) return '-';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export default function NameTypeWithStatusTable({ data }) {
  const [tableDisplayData, setTableDisplayData] = React.useState([]);

  const [sorting, setSorting] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  
React.useEffect(() => {
  if (!data || data.length === 0) {
    setTableDisplayData([]);
    return;
  }

  const rowsForTable = data.map((item) => ({
    ...item,
    display_name_type: truncateText(item.name_type, 40),
    nonCompensatedRemark: truncateText(item.nonCompensatedRemark || '', 60),
  }));

  setTableDisplayData(rowsForTable);
}, [data]);


  const filteredTableData = React.useMemo(() => {
    if (!globalFilter) return tableDisplayData;

    const lowerCaseFilter = globalFilter.toLowerCase();
    return tableDisplayData.filter(item =>
      item.name_type.toLowerCase().includes(lowerCaseFilter) ||
      String(item.totalCount).includes(lowerCaseFilter) ||
      String(item.totalAmountSum).includes(lowerCaseFilter) ||
      String(item.totalCompensatedAmount).includes(lowerCaseFilter) ||
      String(item.totalNonCompensatedAmount).includes(lowerCaseFilter) ||
      String(item.totalCompensatedCount).includes(lowerCaseFilter) ||
      String(item.totalNonCompensatedCount).includes(lowerCaseFilter) ||
      (item.nonCompensatedRemark && item.nonCompensatedRemark.toLowerCase().includes(lowerCaseFilter))
    );
  }, [tableDisplayData, globalFilter]);

  const columns = React.useMemo(() => [
    // ใส่ทุก column ลงใน group เพื่อให้ header ไม่เปิ้ล
    columnHelper.group({
      id: 'basicInfo',
      header: '', // header ว่างเพื่อไม่แสดงอะไร
      columns: [
        columnHelper.display({
          id: 'ลำดับ',
          header: 'ลำดับ',
          cell: info => {
            const currentPageRows = table.getRowModel().rows;
            const currentRowId = info.row.id;
            const indexInCurrentPage = currentPageRows.findIndex(row => row.id === currentRowId);
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return pageIndex * pageSize + indexInCurrentPage + 1;
          },
          enableSorting: false,
          enableFiltering: false,
          size: 50,
          meta: {
            style: { textAlign: 'center' },
          },
        }),
        columnHelper.accessor('display_name_type', {
          header: 'รายการประเภทที่ขอเบิก',
          cell: info => (
            <span title={info.row.original.name_type}>
              {info.getValue()}
            </span>
          ),
          enableSorting: true,
          meta: {
            style: { textAlign: 'center' },
          },
        }),
        columnHelper.accessor('totalCount', {
          header: 'รวม (ครั้ง)',
         cell: info => {
  const value = info.getValue().toLocaleString();
  return (
    <span className="px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap bg-blue-100 text-blue-800" style={{ display: 'inline-block',textAlign: 'center', minWidth: 50 }}>
      {value}
    </span>
  );
}

        }),
      ],
    }),
    columnHelper.group({
      id: 'compensatedGroup',
      header: 'ชดเชย',
      columns: [
        columnHelper.accessor('totalCompensatedCount', {
          header: 'ครั้ง',
         cell: info => {
            const value = info.getValue();
            const formatted = value.toLocaleString(undefined, {
            });
            return (
              <span className="px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap bg-green-100 text-green-800" style={{ display: 'inline-block', textAlign: 'center', minWidth: 70 }}>
                {formatted}
              </span>
            );
          },
          enableSorting: true,
          meta: {
            style: { textAlign: 'center' },
          },
        }),
        columnHelper.accessor('totalCompensatedAmount', {
          header: 'บาท',
          cell: info => {
            const value = info.getValue();
            const formatted = value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            return (
              <span className="px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap bg-green-100 text-green-800" style={{ display: 'inline-block', textAlign: 'center', minWidth: 70 }}>
                {formatted}
              </span>
            );
          },
          enableSorting: true,
          meta: {
            style: { textAlign: 'center' },
          },
        }),
      ],
    }),
    columnHelper.group({
      id: 'nonCompensatedGroup',
      header: 'ไม่ชดเชย',
      columns: [
        columnHelper.accessor('totalNonCompensatedCount', {
          header: 'ครั้ง',
          cell: info => {
            const value = info.getValue();
            const formatted = value.toLocaleString(undefined, {
            });
            return (
              <span className="px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap bg-orange-100 text-orange-800" style={{ display: 'inline-block', textAlign: 'center', minWidth: 70 }}>
                {formatted}
              </span>
            );
          },
          enableSorting: true,
          meta: {
            style: { textAlign: 'center' },
          },
        }),
        columnHelper.accessor('totalNonCompensatedAmount', {
          header: 'บาท',
          cell: info => {
            const value = info.getValue();
            const formatted = value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            return (
              <span className="px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap bg-orange-100 text-orange-800" style={{ display: 'inline-block', textAlign: 'center', minWidth: 70 }}>
                {formatted}
              </span>
            );
          },
          enableSorting: true,
          meta: {
            style: { textAlign: 'center' },
          },
        }),
        columnHelper.accessor('nonCompensatedRemark', {
          header: 'หมายเหตุ',
          cell: info => (
            <span title={info.getValue()}>
              {info.getValue() || '-'}
            </span>
          ),
          enableSorting: false,
          enableFiltering: true,
          meta: {
            style: { textAlign: 'center' },
          },
        }),
      ],
    }),
  ], []);

  const table = useReactTable({
    data: filteredTableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,

    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
    debugTable: false,
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg h-auto">
      <h2 className="text-xl font-bold mb-2 text-gray-800">สรุปรายการตามประเภทที่ขอเบิก</h2>

      <input
        type="text"
        value={globalFilter ?? ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="ค้นหา..."
        className="w-full px-3 py-2 my-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
         <thead className="bg-blue-100">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-gray-300">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ textAlign: 'center', borderRight: '1px solid #d1d5db' }}
                    className="px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center justify-center">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' ? ' 🔼' : ''}
                      {header.column.getIsSorted() === 'desc' ? ' 🔽' : ''}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50 border-b border-gray-200">
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    style={{ textAlign: 'left', borderRight: '1px solid #e5e7eb' }}
                    className="px-6 py-4 text-sm text-gray-800"
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
      <div className="flex justify-between items-center mt-4 text-sm text-gray-700">
        <div className="space-x-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            {'<'}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            {'>>'}
          </button>
        </div>
        <div>
          หน้า {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
        </div>
      </div>
    </div>
  );
}