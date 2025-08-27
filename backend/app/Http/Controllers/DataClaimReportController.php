<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use App\Services\ClaimReportFilter;

class DataClaimReportController extends BaseController
{
    protected $filterService;

    public function __construct(ClaimReportFilter $filterService)
    {
        $this->filterService = $filterService;
    }

    public function getData(Request $request)
    {
        try {
            // สร้าง query หลัก โดยเลือกข้อมูลจาก REP_individual และทำการ join กับ Hcode สองครั้ง
            $query = DB::table('REP_individual AS ri')
                ->select(
                    'ri.id',
                    'ri.REPNo',
                    'ri.HmainOP',
                    'ri.name_type',
                    'ri.unit_price',
                    'ri.type_pay',
                    'ri.note',
                    'ri.HSEND',
                    'ri.month',
                    'ri.period',
                    'ri.id_year',
                    // คำนวณ month_number จากชื่อเดือนภาษาไทย
                    DB::raw("CASE ri.month
                        WHEN 'มกราคม' THEN 1
                        WHEN 'กุมภาพันธ์' THEN 2
                        WHEN 'มีนาคม' THEN 3
                        WHEN 'เมษายน' THEN 4
                        WHEN 'พฤษภาคม' THEN 5
                        WHEN 'มิถุนายน' THEN 6
                        WHEN 'กรกฎาคม' THEN 7
                        WHEN 'สิงหาคม' THEN 8
                        WHEN 'กันยายน' THEN 9
                        WHEN 'ตุลาคม' THEN 10
                        WHEN 'พฤศจิกายน' THEN 11
                        WHEN 'ธันวาคม' THEN 12
                        ELSE NULL
                    END AS month_number"),
                    // รวม HSEND และชื่อโรงพยาบาล HSEND_FULL
                    DB::raw("CONCAT_WS(' ', ri.HSEND, drc_hsend.name_Hcode) AS HSEND_FULL"),
                    'drc_hsend.type_hos AS HSEND_TYPE',
                    'drc_hsend.name_Ampur', // ประเภทโรงพยาบาล HSEND
                    // รวม HmainOP และชื่อโรงพยาบาล HmainOP_FULL
                    DB::raw("CONCAT_WS(' ', ri.HmainOP, drc_hmainop.name_Hcode) AS HmainOP_FULL"),
                    'drc_hmainop.type_hos AS HmainOP_TYPE' // ประเภทโรงพยาบาล HmainOP
                )
                // ทำ Left Join กับตาราง Hcode สำหรับ HSEND
                ->leftJoin('Hcode AS drc_hsend', 'ri.HSEND', '=', 'drc_hsend.Hcode')
                // ทำ Left Join อีกครั้งกับตาราง Hcode สำหรับ HmainOP
                ->leftJoin('Hcode AS drc_hmainop', 'ri.HmainOP', '=', 'drc_hmainop.Hcode')
                ->orderByRaw('CAST(ri.id AS UNSIGNED) ASC'); // เรียงลำดับตาม id แบบตัวเลข

            $Finalquery = $this->filterService->applyFilters($query, $request);
            $query = $this->filterService->applyOrdering($Finalquery);


            $results = $query->get();

            // ส่งคืนข้อมูลในรูปแบบ JSON
            return response()->json([
                'status' => 'success',
                'data' => $results
            ]);
        } catch (\Exception $e) {
            // ดักจับข้อผิดพลาดและส่งคืนข้อความแสดงข้อผิดพลาด
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getDataV2GroupedSummary(Request $request)
    {
        try {
            $query = DB::table('REP_individual AS ri')
                ->select(
                    'ri.name_type',
                    DB::raw('COUNT(*) AS totalCount'),
                    DB::raw("SUM(CASE WHEN ri.type_pay = 'ชดเชย' THEN 1 ELSE 0 END) AS totalCompensatedCount"),
                    DB::raw("SUM(CASE WHEN ri.type_pay = 'ไม่ชดเชย' THEN 1 ELSE 0 END) AS totalNonCompensatedCount"),
                    DB::raw("SUM(CASE WHEN ri.type_pay = 'ชดเชย' THEN ri.unit_price ELSE 0 END) AS totalCompensatedAmount"),
                    DB::raw("SUM(CASE WHEN ri.type_pay = 'ไม่ชดเชย' THEN ri.unit_price ELSE 0 END) AS totalNonCompensatedAmount"),
                    DB::raw("SUM(ri.unit_price) AS totalAmountSum"),

                    // 🎯 เพิ่มการรวมหมายเหตุเฉพาะ “ไม่ชดเชย” พร้อมตัดรหัสนำหน้า
                    DB::raw("GROUP_CONCAT(
                    DISTINCT TRIM(
                        REGEXP_REPLACE(
                            CASE WHEN ri.type_pay = 'ไม่ชดเชย' THEN ri.note ELSE NULL END,
                            '^[A-Z0-9]+#{2,}',
                            ''
                        )
                    )
                    SEPARATOR ', '
                ) AS nonCompensatedRemark")
                )
                ->leftJoin('Hcode AS drc_hsend', 'ri.HSEND', '=', 'drc_hsend.Hcode');

            // ✅ Apply filter ตาม params เดิมจาก frontend
            $query = $this->filterService->applyFilters($query, $request);

            // ✅ Group และเรียงลำดับ
            $query->groupBy('ri.name_type')
                ->orderByDesc('totalAmountSum');

            $results = $query->get();

            return response()->json([
                'status' => 'success',
                'data' => $results
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve grouped summary: ' . $e->getMessage()
            ], 500);
        }
    }
    public function getDetailedV2GroupedData(Request $request)
    {
        try {
            $query = DB::table('REP_individual AS ri')
                ->select(
                    'ri.name_type',
                    'ri.month',
                    'ri.period',
                    'ri.id_year',
                    DB::raw("CONCAT_WS(' ', ri.HmainOP, hmainop.name_Hcode) AS HmainOP_FULL"),
                    DB::raw("CONCAT_WS(' ', ri.HSEND, drc_hsend.name_Hcode) AS HSEND_FULL"),
                    'ri.unit_price',
                    DB::raw("COUNT(*) AS count"),
                    DB::raw("SUM(CASE WHEN ri.type_pay = 'ชดเชย' THEN 1 ELSE 0 END) AS compensate_count"),
                    DB::raw("SUM(CASE WHEN ri.type_pay = 'ไม่ชดเชย' THEN 1 ELSE 0 END) AS no_compensate_count"),
                    DB::raw("SUM(CASE WHEN ri.type_pay = 'ชดเชย' THEN ri.unit_price ELSE 0 END) AS total_compensate"),
                    DB::raw("SUM(CASE WHEN ri.type_pay = 'ไม่ชดเชย' THEN ri.unit_price ELSE 0 END) AS total_no_compensate"),
                    DB::raw("SUM(ri.unit_price) AS total_price")
                )
                ->leftJoin('Hcode AS drc_hsend', 'ri.HSEND', '=', 'drc_hsend.Hcode')
                ->leftJoin('Hcode AS hmainop', 'ri.HmainOP', '=', 'hmainop.Hcode');

            // ✅ Apply dynamic filters
            $query = $this->filterService->applyFilters($query, $request);

            // ✅ Group หลายฟิลด์ตามที่ React ใช้
            $query->groupBy(
                'ri.name_type',
                'ri.unit_price',
                'ri.HSEND',
                'ri.HmainOP',
                'hmainop.name_Hcode',
                'drc_hsend.name_Hcode',
                'ri.month',
                'ri.period',
                'ri.id_year',
            );

            $results = $query->get();

            return response()->json([
                'status' => 'success',
                'data' => $results
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve detailed grouped data: ' . $e->getMessage()
            ], 500);
        }
    }


    public function getListPeriod()
    {
        try {
            $periods = DB::table('REP_individual')
                ->select('period')      // เลือกคอลัมน์ period
                ->distinct()            // เลือกเฉพาะค่าที่ไม่ซ้ำกัน
                ->orderBy('period')     // เรียงลำดับตาม period
                ->get();                // ดึงผลลัพธ์ทั้งหมด

            return response()->json([
                'status' => 'success',
                'data' => $periods,
                'message' => 'Successfully retrieved periods.'
            ]);
        } catch (\Exception $e) {
            // ดักจับข้อผิดพลาดและส่งคืนข้อความแสดงข้อผิดพลาด
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getListSend_FULL()
    {
        try {
            $hsendFullList = DB::table('REP_individual AS ri')
                ->select(
                    DB::raw("CONCAT_WS(' ', ri.HSEND, drc_hsend.name_Hcode) AS HSEND_FULL"),
                    'drc_hsend.name_Ampur',
                    'drc_hsend.type_hos'  // <-- Select the name_Ampur column
                )
                ->leftJoin('Hcode AS drc_hsend', 'ri.HSEND', '=', 'drc_hsend.Hcode')
                ->distinct()
                ->orderBy('HSEND_FULL')
                ->get();
            return response()->json([
                'status' => 'success',
                'data' => $hsendFullList,
                'message' => 'Successfully retrieved HSEND full list.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve HSEND full list: ' . $e->getMessage()
            ], 500);
        }
    }


    public function getListAffiliation()
    {
        try {
            $hmainopFullList = DB::table('REP_individual AS ri')
                ->select(DB::raw("drc_hsend.type_hos"))
                ->leftJoin('Hcode AS drc_hsend', 'ri.HSEND', '=', 'drc_hsend.Hcode')
                ->distinct()
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $hmainopFullList,
                'message' => 'Successfully retrieved type_hos list.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve type_hos  list: ' . $e->getMessage()
            ], 500);
        }
    }
    public function getListHmainOPFull()
    {
        try {
            $hmainopFullList = DB::table('REP_individual AS ri')
                ->select(DB::raw("CONCAT_WS(' ', ri.HmainOP, drc_hmainop.name_Hcode) AS HmainOP_FULL"))
                ->leftJoin('Hcode AS drc_hmainop', 'ri.HmainOP', '=', 'drc_hmainop.Hcode')
                ->distinct()
                ->orderBy('HmainOP_FULL')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $hmainopFullList,
                'message' => 'Successfully retrieved HmainOP full list.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve HmainOP full list: ' . $e->getMessage()
            ], 500);
        }
    }
    public function getListNameType()
    {
        try {
            $hmainopFullList = DB::table('REP_individual')
                ->select('name_type')      // เลือกคอลัมน์ period
                ->distinct()            // เลือกเฉพาะค่าที่ไม่ซ้ำกัน
                ->orderBy('name_type')     // เรียงลำดับตาม period
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $hmainopFullList,
                'message' => 'Successfully retrieved HmainOP full list.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve HmainOP full list: ' . $e->getMessage()
            ], 500);
        }
    }
    public function getListPayType()
    {
        try {
            $hmainopFullList = DB::table('REP_individual')
                ->select('type_pay')      // เลือกคอลัมน์ period
                ->distinct()            // เลือกเฉพาะค่าที่ไม่ซ้ำกัน
                ->orderBy('type_pay')     // เรียงลำดับตาม period
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $hmainopFullList,
                'message' => 'Successfully retrieved HmainOP full list.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve type_pay full list: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAmpurByAffiliation(Request $request)
    {
        try {
            $type_hos = $request->input('type_hos'); // รับมาเป็น array เช่น ['อบจ.', 'สธ.']

            if (!is_array($type_hos) || empty($type_hos)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'กรุณาระบุ type_hos เป็น array อย่างน้อย 1 ค่า'
                ], 400);
            }

            $ampurs = DB::table('REP_individual AS ri')
                ->leftJoin('Hcode AS drc_hsend', 'ri.HSEND', '=', 'drc_hsend.Hcode')
                ->select(DB::raw('DISTINCT drc_hsend.name_Ampur'))
                ->whereIn('drc_hsend.type_hos', $type_hos)
                ->whereNotNull('drc_hsend.name_Ampur')
                ->orderBy('drc_hsend.name_Ampur')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $ampurs,
                'message' => 'Successfully retrieved name_Ampur list.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve name_Ampur list: ' . $e->getMessage()
            ], 500);
        }
    }


    public function getListHmainOP(Request $request)
    {
        try {
            $hmainopFullList = DB::table('REP_individual')
                ->select('HmainOP')      // เลือกคอลัมน์ period
                ->distinct()            // เลือกเฉพาะค่าที่ไม่ซ้ำกัน
                ->orderBy('HmainOP')     // เรียงลำดับตาม period
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $hmainopFullList,
                'message' => 'Successfully retrieved HmainOP full list.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve detailed grouped data: ' . $e->getMessage()
            ], 500);
        }
    }
}
