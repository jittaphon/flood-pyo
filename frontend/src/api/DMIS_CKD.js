import axiosClient from './axiosClient';

const DMIS_CKD = {
  /**
   * Retrieves claim reports with optional filters and pagination.
   * @param {Object} params - Query parameters for filtering and pagination.
   * @returns {Promise} - Axios promise for the GET request.
   */
  getDMIS_CKD_Summary(params) {
    
    return axiosClient.get('/api/v2/ckd-reports/summary',{params});
  },

  getDMIS_CKD_Detail(params) {
    
    return axiosClient.get('/api/v2/ckd-reports/detail',{params});
  },
  getDMIS_CKD_ListNameType() {
    return axiosClient.get('/api/v2/ckd-reports/listnametype');
  },
   getDMIS_CKD_LlistHaminaOP() {
    return axiosClient.get('/api/v2/ckd-reports/lsithmainop');
  },
 
 


};

export default DMIS_CKD;