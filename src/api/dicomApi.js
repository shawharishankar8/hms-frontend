import axiosClient from "./axiosClient";

export const getDicomMetadataApi = (hospitalId) => {
    return axiosClient.get(`/hospital/${hospitalId}/dicom`);
};

export const getDicomBinaryApi = (dicomUrl) => {
    return axiosClient.get(dicomUrl, {
        responseType: "arraybuffer",
    });
};
