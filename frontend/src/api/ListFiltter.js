import axiosClient from './axiosClient';

const ListFiltter = {
  /**
   * Retrieves claim reports with optional filters and pagination.
   * @param {Object} params - Query parameters for filtering and pagination.
   * @returns {Promise} - Axios promise for the GET request.
   */
 
  getListAffiliation() {
      return axiosClient.get('/api/v2/list-filtter/listAffiliation');

  },
  getHmainOPFull() {
        return axiosClient.get('/api/v2/list-filtter/listHmainOP');
  
  },
  getListNameType() {
    return axiosClient.get('/api/v2/list-filtter/listNameType'); // name_type ที่รวมทั้งหมด ทุกตาราง ไม่ซ้ำกัน
  },

   getListAmpurByAffiliation(typeAffiliations) {
  return axiosClient.get('/api/v2/list-filtter/listAumpurByAffiliation', {
    params: { type_hos: typeAffiliations }
  });
},

};

export default ListFiltter;