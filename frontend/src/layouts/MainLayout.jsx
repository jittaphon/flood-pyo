import NavBar from '../components/NavBar';
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import React from "react";

export default function MainLayout() {
  
   const location = useLocation();
  const isHome = location.pathname === "/"; // หรือ "/home" ถ้า path เป็นแบบนั้น
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />

      <div className="flex flex-1 overflow-hidden">
   
        <main className={isHome ? "flex-1 overflow-auto" : "flex-1 overflow-auto "}>
        <Outlet />
      </main>
      </div>

      <Footer />
    </div>
  );
}
