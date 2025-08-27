import axiosClient from './axiosClient';

const DMIS_KTP = {
  /**
   * Retrieves claim reports with optional filters and pagination.
   * @param {Object} params - Query parameters for filtering and pagination.
   * @returns {Promise} - Axios promise for the GET request.
   */
  getClaimReports(params) {
    return axiosClient.get('/api/v1/claim-reports',{params});
  },
  getClaimReportsV2(params) {
    return axiosClient.get('/api/v1/claim-reportsV2',{params});
  },

  getClaimReportsDeatailV2(params) {
    return axiosClient.get('/api/v1/claim-reportsDetailV2',{params});
  },
  /**
   * Retrieves a list of unique periods.
   * @returns {Promise} - Axios promise for the GET request.
   */
  getPeriods() {
    return axiosClient.get('/api/v1/claim-reports/listperiod');
  },

  /**
   * Retrieves a list of unique HSEND_FULL values (Hospital Send).
   * @returns {Promise} - Axios promise for the GET request.
   */

  /**
   * Retrieves a list of unique HmainOP_FULL values (Hospital Main Operation).
   * @returns {Promise} - Axios promise for the GET request.
   */
  getHmainOPFull() {
    return axiosClient.get('/api/v1/claim-reports/listHMainOP');
  },
  getListNameType() {
    return axiosClient.get('/api/v1/claim-reports/listnametype');
  },

  getListPayType() {
    return axiosClient.get('/api/v1/claim-reports/listpaytype');
  },
   getListAffiliation() {
    return axiosClient.get('/api/v1/claim-reports/listAffiliation');
  },
  getListAmpurByAffiliation(typeAffiliations) {
  return axiosClient.get('/api/v1/claim-reports/listAmpurByAffiliation', {
    params: { type_hos: typeAffiliations }
  });
},

  getHSENDFull() {
    return axiosClient.get('/api/v1/claim-reports/listHSENDFull');
  },
  
   getlistHmainOP() {
    return axiosClient.get('/api/v1/claim-reports/lsithmainop');
  },
  


};

export default DMIS_KTP;