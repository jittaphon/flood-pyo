import { useState } from "react";
import {
  FiHome,
  FiFileText,
  FiSettings,
  FiChevronDown,
} from "react-icons/fi";
import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const menuItems = [
  {
    icon: <FiHome />,
    label: "ภาพรวม",
    path: "/",
  },
  {
    icon: <FiFileText />,
    label: "รายงาน",
    children: [
      { label: "📑 DMIS-KTP-กรุงไทย 2568", path: "/report/DMIS-KTP" },
      { label: "📑 DMIS-TB-วัณโรค 2568", path: "/report/DMIS-TB" },
    ],
  },
];


export default function Sidebar() {
  const [collapsed] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [reportExpanded, setReportExpanded] = useState(false);
  const navigate = useNavigate();

  const expanded = hovered || !collapsed;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
      setHovered(false);
      setReportExpanded(false); // ปิด sub-menu ทันทีเมื่อ mouse ออก
  }}
      
      className={`min-h-screen border-r bg-white shadow-md flex flex-col transition-all duration-300 ${
        expanded ? "w-64" : "w-16"
      }`}


    >
      {/* Menu Items */}
      <nav className="flex-1 mt-4">
        {menuItems.map((item, index) => (
          <div key={index}>
            {/* Main menu item */}
            <div
              className="group flex items-center gap-4 px-4 py-3 hover:bg-gray-100 cursor-pointer transition"
              onClick={() => {
                if (item.children) {
                  setReportExpanded(!reportExpanded);
                } else if (item.path) {
                  navigate(item.path);
                }
              }}
            >
              <span className="text-blue-600 text-xl">{item.icon}</span>
              <div className="flex-1 flex items-center justify-between">
                <span
                  className={`text-gray-800 whitespace-nowrap overflow-hidden transition-opacity duration-300 ${
                    expanded ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {item.label}
                </span>
                {item.children && expanded && (
                  <FiChevronDown
                    className={`text-gray-500 text-sm transition-transform ${
                      reportExpanded ? "rotate-180" : ""
                    }`}
                  />
                )}
              </div>
            </div>

           <div
  className={`ml-10 mt-1 space-y-1 transition-all ease-in-out duration-300 overflow-hidden ${
    item.children && expanded && reportExpanded ? "max-h-screen opacity-100 visible" : "max-h-0 opacity-0 invisible"
  }`}
>
  {item.children?.map((child, childIndex) => (
    <Link
      key={childIndex}
      to={child.path}
      className="block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded"
    >
      {child.label}
    </Link>
  ))}
</div>
          </div>
        ))}
      </nav>
    </div>
  );
}
