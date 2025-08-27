// routes.js
import React from "react";
import MainLayout from '../layouts/MainLayout';
import { createHashRouter } from "react-router-dom"; // ✅ เปลี่ยนจาก createBrowserRouter
import HomePage from './HomePage';

export const routes = createHashRouter([

  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
    ],
  },
]);

// ❌ ไม่ต้องมี basename อีกแล้ว เพราะ HashRouter ไม่สน path จริงบน server
