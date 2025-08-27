import axiosClient from './axiosClient';

const DMIS_TB = {
  /**
   * Retrieves claim reports with optional filters and pagination.
   * @param {Object} params - Query parameters for filtering and pagination.
   * @returns {Promise} - Axios promise for the GET request.
   */
  getDMIS_TB_Summary(params) {
    
    return axiosClient.get('/api/v2/tp-reports/summary',{params});
  },

  getDMIS_TB_Detail(params) {
    
    return axiosClient.get('/api/v2/tp-reports/detail',{params});
  },
  getDMIS_TB_ListNameType() {
    
    return axiosClient.get('/api/v2/tp-reports/listnametype');
  },

    getDMIS_TB_LlistHaminaOP() {
    return axiosClient.get('/api/v2/tp-reports/lsithmainop');
  },
 
 


};

export default DMIS_TB;