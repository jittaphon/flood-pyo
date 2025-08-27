<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use App\Services\ClaimReportFilterForMC;

class DataMCReportController extends BaseController
{
    protected $filterService;

    public function __construct(ClaimReportFilterForMC $filterService)
    {
        $this->filterService = $filterService;
    }


    public function getSummary(Request $request)
    {
        try {
            $query = DB::table('DMIS_M_CLAIM AS ri')
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
                ->leftJoin('Hcode AS drc_hsend', DB::raw("LEFT(ri.HSEND, LOCATE(' ', ri.HSEND) - 1)"), '=', 'drc_hsend.Hcode');

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
    public function getDetail(Request $request)
    {
        try {
            $query = DB::table('DMIS_M_CLAIM AS ri')
                ->select(
                    'ri.name_type',
                    'ri.month',
                    'ri.period',
                    'ri.id_year',
                    DB::raw("CONCAT_WS(' ', ri.HmainOP, hmainop.name_Hcode) AS HmainOP_FULL"),
                    DB::raw("CONCAT_WS(' ', LEFT(ri.HSEND, LOCATE(' ', ri.HSEND) - 1), drc_hsend.name_Hcode) AS HSEND_FULL"),
                    'ri.unit_price',
                    DB::raw("COUNT(*) AS count"),
                    DB::raw("SUM(CASE WHEN ri.type_pay = 'ชดเชย' THEN 1 ELSE 0 END) AS compensate_count"),
                    DB::raw("SUM(CASE WHEN ri.type_pay = 'ไม่ชดเชย' THEN 1 ELSE 0 END) AS no_compensate_count"),
                    DB::raw("SUM(CASE WHEN ri.type_pay = 'ชดเชย' THEN ri.unit_price ELSE 0 END) AS total_compensate"),
                    DB::raw("SUM(CASE WHEN ri.type_pay = 'ไม่ชดเชย' THEN ri.unit_price ELSE 0 END) AS total_no_compensate"),
                    DB::raw("SUM(ri.unit_price) AS total_price")
                )
                ->leftJoin('Hcode AS hmainop', 'ri.HmainOP', '=', 'hmainop.Hcode')
                ->leftJoin('Hcode AS drc_hsend', DB::raw("LEFT(ri.HSEND, LOCATE(' ', ri.HSEND) - 1)"), '=', 'drc_hsend.Hcode');



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
    public function getListNameType(Request $request)
    {
        try {
            $hmainopFullList = DB::table('DMIS_M_CLAIM')
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
                'message' => 'Failed to retrieve detailed grouped data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getListHmainOP(Request $request)
    {
        try {
            $hmainopFullList = DB::table('DMIS_M_CLAIM')
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
