<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Laravel\Lumen\Routing\Controller as BaseController;

class TableController extends BaseController
{
    public function showTables()
    {
        try {
            // whitelist tables ที่อนุญาตให้ user เลือก
            $whitelistTables = [
                'DMIS_CKD' => 'CKD Data',
                'users' => 'User Accounts',
                'products' => 'Products List',
                'orders' => 'Orders History'
            ];

            // แปลงเป็น array ของ id + label
            $tableList = [];
            $id = 1;
            foreach ($whitelistTables as $tableName => $label) {
                $tableList[] = [
                    'id' => $id++,         // id ให้ frontend เลือก
                    'table' => $tableName, // ใช้ backend mapping ไม่ expose frontend
                    'label' => $label       // ชื่อสวย ๆ ให้ user
                ];
            }

            return response()->json([
                'status' => 'success',
                'data' => $tableList
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve table list: ' . $e->getMessage()
            ], 500);
        }
    }
}
