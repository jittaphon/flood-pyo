import axiosClient from './axiosClient';

const DMIS_NAP = {
  /**
   * Retrieves claim reports with optional filters and pagination.
   * @param {Object} params - Query parameters for filtering and pagination.
   * @returns {Promise} - Axios promise for the GET request.
   */
  getDMIS_NAP_Summary(params) {
    
    return axiosClient.get('/api/v2/nap-reports/summary',{params});
  },

  getDMIS_NAP_Detail(params) {
    
    return axiosClient.get('/api/v2/nap-reports/detail',{params});
  },
  getDMIS_NAP_ListNameType() {
    return axiosClient.get('/api/v2/nap-reports/listnametype');
  },
   getDMIS_NAP_LlistHaminaOP() {
    return axiosClient.get('/api/v2/nap-reports/lsithmainop');
  },
 
 


};

export default DMIS_NAP;