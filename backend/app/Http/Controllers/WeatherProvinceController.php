<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WeatherProvinceController extends Controller
{
    public function getData(Request $request)
    {
        $starttime = $request->query('starttime', '');
        return response()->json($this->fetchProvince("พะเยา", $starttime));
    }

    private function fetchProvince($province, $starttime)
    {
        $cacheFile = storage_path("tmd_cache_{$province}.json");
        $cacheTime = 600; // 10 นาที

        // ใช้ cache ถ้ามี
        if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTime)) {
            $data = json_decode(file_get_contents($cacheFile), true);
            return $this->extractData($province, $data, $starttime);
        }

        $url = "https://data.tmd.go.th/nwpapi/v1/forecast/area/place";
        $query = http_build_query([
            "domain" => 1,
            "province" => $province,
            "fields" => "rain,cond,tc,rh,slp,ws10m,wd10m",
        ]) . "&starttime=" . $starttime;

        $ch = curl_init("{$url}?{$query}");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "accept: application/json",
            "authorization: " . env("TMD_API_KEY")
        ]);
        $response = curl_exec($ch);
        curl_close($ch);

        if ($response) {
            file_put_contents($cacheFile, $response);
            $data = json_decode($response, true);
            return $this->extractData($province, $data, $starttime);
        }

        return $this->emptyData($province, "ไม่มีข้อมูลจาก API");
    }

    private function extractData($province, $data, $starttime)
    {
        try {
            $forecast = $data["WeatherForecasts"][0]["forecasts"][0]["data"];

            $rain = $forecast["rain"] ?? 0;
            $cond = $forecast["cond"] ?? 0;
            $tc   = $forecast["tc"] ?? 0;
            $rh   = $forecast["rh"] ?? 0;
            $slp  = $forecast["slp"] ?? 0;
            $ws10m = $forecast["ws10m"] ?? 0;
            $wd10m = $forecast["wd10m"] ?? 0;

            // แปลงความเร็วลมจาก m/s → knots
            $ws10m_knots = round($ws10m * 1.94, 1);

            return [
                "province" => $province,
                "rain"   => $rain,
                "cond"   => $cond,
                "tc"     => $tc,
                "rh"     => $rh,
                "slp"    => $slp,
                "ws10m"  => $ws10m,
                "ws10m_knots" => $ws10m_knots,
                "wd10m"  => $wd10m,
                "starttime" => $starttime,
                "risk"   => $this->floodRisk($rain, $cond, $rh),
            ];
        } catch (\Throwable $e) {
            return $this->emptyData($province, $e->getMessage());
        }
    }

    private function floodRisk($rain, $cond, $rh = null, $cloud = null)
    {
        // ฝนหนักแน่ ๆ
        if ($rain >= 50 || in_array($cond, [6, 7, 8])) {
            return "พื้นที่เสี่ยงฝนตกหนักมาก";
        }

        // ยังไม่มีฝน แต่บ่งชี้ว่ามีโอกาส
        if (($rh !== null && $rh >= 80) || ($cloud !== null && $cloud >= 70) || in_array($cond, [5])) {
            return "พื้นที่เสี่ยงฝนตกหนัก";
        }

        return "ปลอดภัย";
    }

    private function emptyData($province, $errorMsg = null)
    {
        return [
            "province" => $province,
            "rain" => 0,
            "cond" => 0,
            "tc" => 0,
            "rh" => 0,
            "slp" => 0,
            "ws10m" => 0,
            "ws10m_knots" => 0,
            "wd10m" => 0,
            "risk" => "ไม่มีข้อมูล",
            "error" => $errorMsg,
        ];
    }
}
