import axiosClient from "./axiosClient";

// Get DICOM metadata for a hospital
export const getDicomMetadataApi = (hospitalId) => {
    return axiosClient.get(`/hospital/${hospitalId}/dicom`);
};

// Upload DICOM file for a hospital
export const uploadDicomApi = (hospitalId, formData) => {
    return axiosClient.post(`/hospital/${hospitalId}/dicom`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// Get DICOM binary data
export const getDicomBinaryApi = (dicomUrl) => {
    return axiosClient.get(dicomUrl, {
        responseType: "arraybuffer",
    });
};