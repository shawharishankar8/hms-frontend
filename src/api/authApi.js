import axiosClient from './axiosClient';

export const loginApi =(payload)=>
    axiosClient.post("/api/auth/login",payload);

export const registerApi =(payload)=>
    axiosClient.post("/api/auth/register",payload);


export const refreshTokenApi = (refreshToken) =>
  axiosClient.post(
    "/api/auth/refresh",
    {},
    { headers: { "Refresh-Token": refreshToken } }
  );

export const logoutApi = () =>
    axiosClient.post("/api/auth/logout");
