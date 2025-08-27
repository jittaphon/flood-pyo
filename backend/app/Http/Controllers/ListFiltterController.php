<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use App\Services\ClaimReportFilter;

class ListFiltterController extends BaseController
{
    protected $filterService;

    public function __construct(ClaimReportFilter $filterService)
    {
        $this->filterService = $filterService;
    }

    public function getHcodeListFull()
    {
        try {
            $hcodeFullList = DB::table('Hcode')
                ->select(DB::raw("CONCAT(Hcode, ' ', name_Hcode) AS HmainOP_FULL"))
                ->orderBy('HmainOP_FULL')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $hcodeFullList,
                'message' => 'Successfully retrieved Hcode full list.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve Hcode full list: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getListNameType()
    {
        try {
            $nameTypes = DB::select("
            SELECT DISTINCT name_type FROM (
                SELECT name_type FROM REP_individual WHERE name_type IS NOT NULL
                UNION
                SELECT name_type FROM DMIS_TB WHERE name_type IS NOT NULL
                UNION
                SELECT name_type FROM DMIS_NAP WHERE name_type IS NOT NULL
                UNION
                SELECT name_type FROM DMIS_M_CLAIM WHERE name_type IS NOT NULL
                UNION
                SELECT name_type FROM DMIS_CKD WHERE name_type IS NOT NULL
            ) AS combined
            ORDER BY name_type
        ");

            return response()->json([
                'status' => 'success',
                'data' => $nameTypes,
                'message' => 'Successfully retrieved name_type list from all sources.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve name_type list: ' . $e->getMessage()
            ], 500);
        }
    }
    public function getListAffiliation()
    {
        try {
            $typeHosList = DB::table('Hcode')
                ->select('type_hos')
                ->whereNotNull('type_hos') // ป้องกันไม่ให้เอาค่า NULL มาแสดงใน filter
                ->distinct()
                ->orderBy('type_hos')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $typeHosList,
                'message' => 'Successfully retrieved type_hos list.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve type_hos list: ' . $e->getMessage()
            ], 500);
        }
    }
    public function getAmpurByAffiliation(Request $request)
    {
        try {
            // รับค่าจาก frontend เป็น array เช่น ['สธ.', 'อบจ.']
            $type_hos = $request->input('type_hos');

            // ตรวจสอบว่ามีค่า และเป็น array จริง
            if (!is_array($type_hos) || empty($type_hos)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'กรุณาระบุ type_hos เป็น array อย่างน้อย 1 ค่า'
                ], 400);
            }

            // ดึงอำเภอที่ไม่ซ้ำกันจาก Hcode ตาม type_hos ที่เลือก
            $ampurs = DB::table('Hcode')
                ->select('name_Ampur')
                ->whereIn('type_hos', $type_hos)
                ->whereNotNull('name_Ampur')
                ->distinct()
                ->orderBy('name_Ampur')
                ->get();

            // ตรวจสอบกรณีไม่พบข้อมูล
            if ($ampurs->isEmpty()) {
                return response()->json([
                    'status' => 'success',
                    'data' => [],
                    'message' => 'ไม่พบข้อมูลอำเภอสำหรับสังกัดที่เลือก'
                ], 200);
            }

            // ส่งข้อมูลกลับแบบ JSON
            return response()->json([
                'status' => 'success',
                'data' => $ampurs,
                'message' => 'ดึงข้อมูลอำเภอสังกัดสำเร็จ'
            ]);
        } catch (\Exception $e) {
            // หากเกิด Exception ใด ๆ
            return response()->json([
                'status' => 'error',
                'message' => 'เกิดข้อผิดพลาดในการดึงข้อมูล: ' . $e->getMessage()
            ], 500);
        }
    }
}
