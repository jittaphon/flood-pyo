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

        // ถ้ามี cache และยังสดอยู่
        if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTime)) {
            $data = json_decode(file_get_contents($cacheFile), true);
            return $this->extractData($amphoe, $data);
        }

        $url = "https://data.tmd.go.th/nwpapi/v1/forecast/area/place";
        $query = http_build_query([
            "domain" => 2,
            "province" => "พะเยา",
            "amphoe" => $amphoe,
            "fields" => "rain,cond",
            "starttime" => $starttime,
        ]);

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
            return $this->extractData($amphoe, $data);
        }

        return [
            "amphoe" => $amphoe,
            "rain" => 0,
            "cond" => 0,
            "risk" => "ไม่มีข้อมูล"
        ];
    }

    private function extractData($amphoe, $data)
    {
        try {
            $forecast = $data["WeatherForecasts"][0]["forecasts"][0]["data"];
            $rain = $forecast["rain"] ?? 0;
            $cond = $forecast["cond"] ?? 0;
            return [
                "amphoe" => $amphoe,
                "rain" => $rain,
                "cond" => $cond,
                "risk" => $this->floodRisk($rain, $cond),
            ];
        } catch (\Throwable $e) {
            return [
                "amphoe" => $amphoe,
                "rain" => 0,
                "cond" => 0,
                "risk" => "ไม่มีข้อมูล"
            ];
        }
    }

    private function floodRisk($rain, $cond)
    {
        if ($rain >= 80 || ($rain >= 50 && $cond == 1)) return "เสี่ยงสูง";
        if ($rain >= 30) return "เฝ้าระวัง";
        return "ปลอดภัย";
    }
}
