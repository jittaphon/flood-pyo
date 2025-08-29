<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WeatherController extends Controller
{
    public function getData(Request $request)
    {
        $starttime = $request->query('starttime', '');
        $amphoes = ["เมืองพะเยา", "ดอกคำใต้", "จุน", "เชียงคำ", "ปง", "ภูซาง", "แม่ใจ", "ภูกามยาว", "เชียงม่วน"];
        $results = [];

        foreach ($amphoes as $amphoe) {
            $results[] = $this->fetchAmphoe($amphoe, $starttime);
        }

        return response()->json($results);
    }

    private function fetchAmphoe($amphoe, $starttime)
    {
        $cacheFile = storage_path("tmd_cache_{$amphoe}.json");
        $cacheTime = 600; // 10 นาที

        // ใช้ cache ถ้ามี
        if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTime)) {
            $data = json_decode(file_get_contents($cacheFile), true);
            return $this->extractData($amphoe, $data, $starttime);
        }

        $url = "https://data.tmd.go.th/nwpapi/v1/forecast/area/place";
        $query = http_build_query([
            "domain" => 2,
            "province" => "พะเยา",
            "amphoe" => $amphoe,
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
            return $this->extractData($amphoe, $data, $starttime);
        }

        return $this->emptyData($amphoe, "ไม่มีข้อมูลจาก API");
    }

    private function extractData($amphoe, $data, $starttime)
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
                "amphoe" => $amphoe,
                "rain"   => $rain,
                "cond"   => $cond,
                "tc"     => $tc,
                "rh"     => $rh,
                "slp"    => $slp,
                "ws10m"  => $ws10m,
                "ws10m_knots" => $ws10m_knots,
                "wd10m"  => $wd10m,
                "starttime" => $starttime,
                "risk"   => $this->floodRisk($rain, $cond),
            ];
        } catch (\Throwable $e) {
            return $this->emptyData($amphoe, $e->getMessage());
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

    private function emptyData($amphoe, $errorMsg = null)
    {
        return [
            "amphoe" => $amphoe,
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
