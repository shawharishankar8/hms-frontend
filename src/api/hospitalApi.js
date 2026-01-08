
import axiosClient from "./axiosClient";

export const getHospitalsApi =(params={})=>
    axiosClient.get("/hospital/getList", { params });

export const createHospitalApi =(payload)=>
    axiosClient.post("/hospital/addHospital", payload);

export const updateHospitalApi = (hospitalId, payload) =>
    axiosClient.put(`/hospital/${hospitalId}`, payload);

export const deleteHospitalApi = (hospitalId) =>
    axiosClient.delete(`/hospital/deleteHospital/${hospitalId}`);
