import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import React from "react";
import L from "leaflet";
import axios from "axios";
import ProvinceCard from "../components/ProvinceCard";
// FitBounds: ซูมให้ครอบจังหวัดพะเยา
function FitBounds({ geoData }) {
  const map = useMap();
  useEffect(() => {
    if (geoData) {
      const layer = L.geoJSON(geoData);
      map.fitBounds(layer.getBounds());
    }
  }, [geoData, map]);
  return null;
}

// Legend: แสดงคำอธิบายสี
function Legend() {
  const map = useMap();
  useEffect(() => {
    const legend = L.control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "legend bg-white p-3 rounded-lg shadow-lg text-sm");
      div.innerHTML = `
        <div class="font-bold mb-1">คำอธิบาย</div>
        <div class="flex items-center gap-2 mb-1">
          <span class="w-4 h-4 inline-block rounded bg-red-500"></span> พื้นที่เสี่ยงฝนตกหนักมาก
        </div>
        <div class="flex items-center gap-2 mb-1">
          <span class="w-4 h-4 inline-block rounded bg-yellow-400"></span> พื้นที่เสี่ยงฝนตกหนัก
        </div>
        <div class="flex items-center gap-2">
          <span class="w-4 h-4 inline-block rounded bg-green-500"></span> ปลอดภัย
        </div>
      `;
      return div;
    };
    legend.addTo(map);
    return () => legend.remove();
  }, [map]);
  return null;
}

export default function PhayaoMap() {
  const amphoes = ["ดอกคำใต้","จุน","เชียงคำ","ปง","ภูซาง","แม่ใจ","ภูกามยาว","เชียงม่วน"];
  const [geoData, setGeoData] = useState(null);
  const [riskData, setRiskData] = useState([]);
  const [ProvinceData, setProvinceData] = useState([]);
  const [geoDataWithRisk, setGeoDataWithRisk] = useState(null);
  const [nowTime, setNowTime] = useState(new Date());
  // อัพเดทเวลา real-time ทุก 1 นาที
  useEffect(() => {
    const interval = setInterval(() => setNowTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

 const formatDateTime = (date) => {
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};
    
function getTmdStarttime() {
  const now = new Date();

  // ปัดขึ้นเป็นชั่วโมงถัดไป
  let slot = now.getHours() + 1;

  // ถ้าเลย 23 → ข้ามไปวันถัดไป 00:00
  if (slot === 24) {
    slot = 0;
    now.setDate(now.getDate() + 1);
  }

  now.setHours(slot, 0, 0, 0);

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
}



  /*function floodRisk(rain, cond) {
    if (rain >= 30 || cond >= 7) return "เสี่ยง";
    if (rain >= 10 || (cond >= 5 && cond <= 6)) return "ระวัง";
    return "ปลอดภัย";
  }*/

  // โหลด GeoJSON เฉพาะพะเยา
  useEffect(() => {
    fetch("/datahub/flood-pyo/public/districts.geojson")
      .then(res => res.json())
      .then(data => {
        const phayao = {
          ...data,
          features: data.features.filter(f => f.properties.pro_th === "พะเยา"),
        };
        setGeoData(phayao);
      });
  }, []);

  // ดึงข้อมูลฝนจาก TMD
useEffect(() => {
  const fetchAll = async () => {
    const tmdStarttime = getTmdStarttime();

    console.log(" starttime:", tmdStarttime);
    try {
      const response = await axios.get(`https://pyo.moph.go.th/datahub/flood-pyo/backend/public/index.php/api/v1/weather/getweather`, {
        params: { starttime: tmdStarttime }
      });
      const response2 = await axios.get(`https://pyo.moph.go.th/datahub/flood-pyo/backend/public/index.php/api/v1/weather/getweatherOfProvince`, {
        params: { starttime: tmdStarttime }
      });
      setProvinceData(response2.data);  
      setRiskData(response.data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setRiskData([]);
      setProvinceData([]);
    }
  };
  fetchAll();
}, []);


  // merge riskData เข้า geoData
  useEffect(() => {
    if (geoData && riskData.length > 0) {
      const riskMap = Object.fromEntries(riskData.map(r => [r.amphoe, r]));
      const updatedFeatures = geoData.features.map(f => {
        const amp = f.properties.amp_th;
        return {
          ...f,
          properties: {
            ...f.properties,
            rain: riskMap[amp]?.rain ?? 0,
            cond: riskMap[amp]?.cond ?? 0,
            risk: riskMap[amp]?.risk ?? "ไม่มีข้อมูล",
            tc: riskMap[amp]?.tc ?? 0
          }
        };
      });
      setGeoDataWithRisk({ ...geoData, features: updatedFeatures });
    }
  }, [geoData, riskData]);

  // style polygon ตาม risk
  const getColor = (risk) => {
    switch (risk) {
      case "พื้นที่เสี่ยงฝนตกหนักมาก": return "#ef4444";
      case "พื้นที่เสี่ยงฝนตกหนัก": return "#facc15";
      case "ปลอดภัย": return "#22c55e";
      default: return "#9ca3af";
    }
  };

  const style = feature => ({
    fillColor: getColor(feature.properties.risk),
    weight: 1,
    color: "white",
    opacity: 1,
    fillOpacity: 0.6,
  });

  const onEachFeature = (feature, layer) => {
    const props = feature.properties;
    layer.bindTooltip(
      `${props.amp_th} <br/>ฝน: ${props.rain} mm <br/>เมฆ: ${props.cond}  <br/>ความร้อน: ${props.tc} °C <br/>Risk: ${props.risk}`,
      { permanent: false, direction: "top", sticky: true, className: "map-label" }
    );
    layer.on({
      mouseover: (e) => e.target.setStyle({ weight: 2, color: "#374151", fillOpacity: 0.8 }),
      mouseout: (e) => e.target.setStyle({ weight: 1, color: "white", fillOpacity: 0.6 }),
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-2 p-4">

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
{/* วันที่ */}
<div className="p-6 rounded-2xl border border-white/40 bg-gradient-to-tr from-blue-300 via-white/30 to-white/50 shadow-lg backdrop-blur-md flex flex-col items-center justify-center text-center">
  <div className="text-xs uppercase tracking-wide text-gray-600 mb-2">
    ข้อมูล ประจำวันที่
  </div>
  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
    {formatDateTime(nowTime)}
  </div>
</div>



{/* Card สภาพอากาศประจำจังหวัด */}


 <ProvinceCard data={ProvinceData}/>




</div>


      <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
        <MapContainer
          center={[19.169, 99.905]}
          zoom={10}
          style={{ height: "420px", width: "100%" }}
          dragging={false}
          zoomControl={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          touchZoom={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {geoDataWithRisk && (
            <>
              <GeoJSON
                data={geoDataWithRisk}
                style={style}
                onEachFeature={onEachFeature}
              />
              <FitBounds geoData={geoDataWithRisk} />
              <Legend />
            </>
          )}
        </MapContainer>
      </div>
      
      
    </div>
  );
}
