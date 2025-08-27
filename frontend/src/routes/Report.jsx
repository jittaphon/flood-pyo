// KPIOverview.jsx  
import { useParams } from 'react-router-dom';
import DMIS_KTP from '../View/DMIS-KTP';
import DMIS_TB from '../View/DMIS-TB';
import DMIS_NAP from '../View/DMIS-NAP';
import DMIS_M_Claim from '../View/DMIS-M-Claim'; // Import the new component
import DMIS_CKD from '../View/DMIS-CKD';
import React from 'react';

export default function Report() {

 const { type } = useParams();

  if (!type) {
    return <div>❌  ไม่พบ รายงาน ที่ระบุ</div>;
  }

  // ตรวจสอบว่า type เป็นค่าใดบ้าง
 switch (type) {
    case 'DMIS-KTP': return <DMIS_KTP />;
    case 'DMIS-TB': return <DMIS_TB />;
    case 'DMIS-NAP': return <DMIS_NAP />;
    case 'DMIS-MOPH-Claim': return <DMIS_M_Claim />;
    case 'DMIS-CKD' : return <DMIS_CKD/>
    default: return <div>❌ ไม่พบ รายงาน ที่ระบุ</div>;
  }
}
