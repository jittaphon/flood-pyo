import axiosClient from './axiosClient';

const DMIS_M_CLIAM = {
  /**
   * Retrieves claim reports with optional filters and pagination.
   * @param {Object} params - Query parameters for filtering and pagination.
   * @returns {Promise} - Axios promise for the GET request.
   *
   */

  getDMIS_MCLIAM_Summary(params) {
    
    return axiosClient.get('/api/v2/moph-claim-reports/summary',{params});
  },
  getDMIS_MCLIAM_Detail(params) { 
    return axiosClient.get('/api/v2/moph-claim-reports/detail',{params});
  },
  getDMIS_MCLIAM_ListNameType() {
    return axiosClient.get('/api/v2/moph-claim-reports/listnametype');
  },
   getDMIS_MCLIAM_LlistHaminaOP() {
    return axiosClient.get('/api/v2/moph-claim-reports/lsithmainop');
  },
 

};

export default DMIS_M_CLIAM;