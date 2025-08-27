import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";

export default function NavBar() {
  const location = useLocation();
  const [hovering, setHovering] = useState(false);
  const timeoutRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setHovering(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHovering(false);
    }, 250);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path) => location.pathname === path;

  // 🔹 กำหนดเมนู
  const menuItems = [
    {
      icon: <span className="mr-2">📊</span>,
      label: "ภาพรวม",
      path: "/",
      external: false,
    },
    {
      icon: <span className="mr-2">📁</span>,
      label: "รายงาน",
      children: [
        { label: "📑 DMIS-KTP กรุงไทย 2568", path: "/report/DMIS-KTP", disabled: false },
        { label: "📑 DMIS-TB วัณโรค 2568", path: "/report/DMIS-TB", disabled: false },
        { label: "📑 DMIS-NAP เอดส์ 2568", path: "/report/DMIS-NAP", disabled: false },
        { label: "📑 DMIS-CKD ไตวาย 2568", path: "/report/DMIS-CKD", disabled: false },
        { label: "📑 DMIS-MOPH-CLAIM 2568", path: "/report/DMIS-MOPH-Claim", disabled: false },
        { label: "📑 DMIS-TTM แผนไทย 2568", path: "/report/DMIS-TTM", disabled: true },
        { label: "📑 DMIS-TDT ธาลัสซีเมีย 2568", path: "/report/DMIS-TDT", disabled: true },
      ],
    },
    {
      icon: (
        <img
          src="https://pyo.moph.go.th/datahub/bcc-pyo/public/images/sorporsorchor.png" // ✅ รูปจาก public ต้องใช้ /images/xxx
          alt="Seamless"
          className="w-5 h-5 mr-2"
        />
      ),
      label: "Seamless DMIS",
      path: "https://seamlessfordmis.nhso.go.th/seamlessfordmis/",
      external: true, // ✅ บอกว่าเป็น external link
    },
  ];

  return (
    <nav className="bg-sky-700 text-white shadow-md relative z-50">
      <div className="w-full px-6 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* โลโก้ */}
          <div className="flex items-center space-x-2">
            <img
              src="https://pyo.moph.go.th/datahub/bcc-pyo/public/images/icon.png" // ✅ ใช้จาก public เช่นกัน
              alt="Logo"
              className="w-10 h-10"
            />
            <span className="text-xl font-semibold">BCC PHAYAO</span>
          </div>

          {/* ปุ่มเมนูมือถือ */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              )}
            </button>
          </div>

          {/* เมนู Desktop */}
          <div className="hidden md:flex flex-grow items-center justify-start ml-8">
            {menuItems.map((item, index) => (
              <div key={index} className="mr-4">
                {item.path ? (
                  item.external ? (
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-1 rounded-lg hover:bg-gray-700 transition"
                    >
                      {item.icon} {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center px-3 py-1 rounded-lg ${
                        isActive(item.path) ? "bg-indigo-500 text-white" : "hover:bg-gray-700"
                      } transition`}
                    >
                      {item.icon} {item.label}
                    </Link>
                  )
                ) : (
                  <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <div
                      className={`flex items-center px-3 py-1 rounded-lg cursor-pointer ${
                        location.pathname.startsWith("/report") ? "bg-indigo-500 text-white" : "hover:bg-gray-700"
                      } transition`}
                    >
                      {item.icon} {item.label}
                      <FiChevronDown className="ml-1 text-sm" />
                    </div>

                    {/* Dropdown */}
                    {hovering && item.children && (
                      <div className="absolute top-14 left-0 w-80 bg-white text-gray-800 rounded-xl shadow-lg border z-50 p-3">
                        <h3 className="text-sm font-semibold mb-2 text-gray-600">{item.label} Menu</h3>
                        <ul className="space-y-1">
                          {item.children.map((child, childIndex) => (
                            <li key={childIndex}>
                              {child.disabled ? (
                                <div className="block px-3 py-2 rounded text-gray-400 cursor-not-allowed">
                                  {child.label}
                                </div>
                              ) : (
                                <Link to={child.path} className="block px-3 py-2 rounded hover:bg-gray-100 transition">
                                  {child.label}
                                </Link>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
         
        </div>
        

        {/* เมนูมือถือ */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.path ? (
                  item.external ? (
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon} {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center block px-3 py-2 rounded-md text-base font-medium ${
                        isActive(item.path)
                          ? "bg-indigo-500 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon} {item.label}
                    </Link>
                  )
                ) : (
                  <>
                    <button
                      onClick={() => setHovering(!hovering)}
                      className={`flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                        location.pathname.startsWith("/report")
                          ? "bg-indigo-500 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      {item.icon} {item.label}
                      <FiChevronDown className="ml-1 text-sm" />
                    </button>
                    {hovering && item.children && (
                      <div className="pl-4 pr-2 py-2 space-y-1">
                        {item.children.map((child, childIndex) =>
                          child.disabled ? (
                            <div
                              key={childIndex}
                              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-400 cursor-not-allowed"
                            >
                              {child.label}
                            </div>
                          ) : (
                            <Link
                              key={childIndex}
                              to={child.path}
                              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {child.label}
                            </Link>
                          )
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
