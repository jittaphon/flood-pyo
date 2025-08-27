<?php

namespace App\Services;

use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClaimReportFilterForMC
{
    /**
     * ใช้เงื่อนไข filter ต่างๆ กับ query.
     *
     * @param Builder $query
     * @param Request $request
     * @return Builder
     */
    public function applyFilters(Builder $query, Request $request): Builder
    {

        $startYear = $request->input('start_year'); // เช่น 2567
        $startMonthName = $request->input('start_month'); // เช่น 'มกราคม'
        $endYear = $request->input('end_year'); // เช่น 2568
        $endMonthName = $request->input('end_month'); // เช่น 'พฤษภาคม'
        $startMonthNumber = $this->getMonthNumberFromName($startMonthName);
        $endMonthNumber = $this->getMonthNumberFromName($endMonthName);


        $period = $request->input('period');
        $Hsend = $request->input('Hsend');
        $HmainOP = $request->input('HmainOP');
        $name_type = $request->input('name_type');
        $type_pay = $request->input('type_pay');
        $type_affiliation = $request->input('type_affiliation');
        $name_Ampur = $request->input('name_Ampur');



        if ($startYear && $startMonthNumber !== null) {
            $startCombined = ($startYear * 100) + $startMonthNumber;
            $endCombined = $startCombined;

            if ($endYear && $endMonthNumber !== null) {
                $endCombined = ($endYear * 100) + $endMonthNumber;
            }

            // สร้าง SQL CASE WHEN เพื่อแปลง ri.month เป็นเลข
            $monthCase = "
            CASE ri.month
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
                ELSE 0
            END
        ";

            // ใช้ whereRaw ครอบเงื่อนไขช่วงเวลา
            $query->whereRaw("(ri.id_year * 100 + $monthCase) BETWEEN ? AND ?", [
                $startCombined,
                $endCombined
            ]);
        }







        if ($period !== null) {

            if (is_array($period) && count($period) > 0) {
                $query->whereIn('ri.period', $period); // เพิ่มเงื่อนไข whereIn สำหรับคอลัมน์ period
            } else if (!is_array($period) && $period !== '') {
                // ตรวจสอบว่ามีค่า period ส่งมาหรือไม่
                $query->where('ri.period', $period); // เพิ่มเงื่อนไข where สำหรับคอลัมน์ period
            }
        }

        // **ส่วนที่แก้ไขสำหรับ Hsend**
        if ($Hsend !== null) {
            if (is_array($Hsend) && count($Hsend) > 0) {
                $query->whereIn(DB::raw("LEFT(ri.HSEND, LOCATE(' ', ri.HSEND) - 1)"), $Hsend);
            } else if (!is_array($Hsend) && $Hsend !== '') {
                $query->where(DB::raw("LEFT(ri.HSEND, LOCATE(' ', ri.HSEND) - 1)"), $Hsend);
            }
        }

        // **ส่วนที่แก้ไขสำหรับ HmainOP**
        if ($HmainOP !== null) {
            if (is_array($HmainOP) && count($HmainOP) > 0) {
                $query->whereIn('ri.HmainOP', $HmainOP);
            } else if (!is_array($HmainOP) && $HmainOP !== '') {
                $query->where('ri.HmainOP', $HmainOP);
            }
        }

        // ส่วนสำหรับ name_type ยังคงเหมือนเดิม
        if ($name_type !== null) {
            if (is_array($name_type) && count($name_type) > 0) {
                $query->whereIn('ri.name_type', $name_type);
            } else if (!is_array($name_type) && $name_type !== '') {
                $query->where('ri.name_type', $name_type);
            }
        }

        if ($type_pay !== null) {
            if (is_array($type_pay) && count($type_pay) > 0) {
                $query->whereIn('ri.type_pay', $type_pay);
            } else if (!is_array($type_pay) && $type_pay !== '') {
                $query->where('ri.type_pay', $type_pay);
            }
        }

        if ($type_affiliation !== null) {
            if (is_array($type_affiliation) && count($type_affiliation) > 0) {
                $query->whereIn('drc_hsend.type_hos', $type_affiliation);
            } else if (!is_array($type_affiliation) && $type_affiliation !== '') {
                $query->where('drc_hsend.type_hos', $type_affiliation);
            }
        }
        if ($name_Ampur !== null) {
            if (is_array($name_Ampur) && count($name_Ampur) > 0) {
                $query->whereIn('drc_hsend.name_Ampur', $name_Ampur);
            } else if (!is_array($name_Ampur) && $name_Ampur !== '') {
                $query->where('drc_hsend.name_Ampur', $name_Ampur);
            }
        }

        return $query;
    }

    /**
     * ใช้เงื่อนไข order by กับ query.
     *
     * @param Builder $query
     * @param Request $request
     * @return Builder
     */
    public function applyOrdering(Builder $query): Builder
    {
        $query->orderByRaw('CAST(ri.Id AS UNSIGNED INT) ASC');
        return $query;
    }

    /**
     * แปลงชื่อเดือนภาษาไทยให้เป็นตัวเลขเดือน (1-12).
     *
     * @param string|null $monthName
     * @return int|null
     */
    private function getMonthNumberFromName(?string $monthName): ?int
    {
        if ($monthName === null) {
            return null;
        }

        switch ($monthName) {
            case 'มกราคม':
                return 1;
            case 'กุมภาพันธ์':
                return 2;
            case 'มีนาคม':
                return 3;
            case 'เมษายน':
                return 4;
            case 'พฤษภาคม':
                return 5;
            case 'มิถุนายน':
                return 6;
            case 'กรกฎาคม':
                return 7;
            case 'สิงหาคม':
                return 8;
            case 'กันยายน':
                return 9;
            case 'ตุลาคม':
                return 10;
            case 'พฤศจิกายน':
                return 11;
            case 'ธันวาคม':
                return 12;
            default:
                return null; // หรือจะจัดการ error ตามความเหมาะสม
        }
    }
}
