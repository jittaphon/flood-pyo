// routes.js
import React from "react";
import MainLayout from '../layouts/MainLayout';
import { createHashRouter } from "react-router-dom"; // ✅ เปลี่ยนจาก createBrowserRouter
import Login from '../View/Admin/Login';
import AdminLayout from '../View/Admin/AdminLayout';

import Report from './Report';
import HomePage from './HomePage';

export const routes = createHashRouter([
   {
        path: '/authentication/member',
        element: <AdminLayout />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'report/:type',
        element: <Report />,
      },
    ],
  },
]);

// ❌ ไม่ต้องมี basename อีกแล้ว เพราะ HashRouter ไม่สน path จริงบน server
