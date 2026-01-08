import React, { useState, useEffect, useRef } from 'react';
import { useId } from '@fluentui/react-hooks';
import {
    Modal,
    PrimaryButton,
    DefaultButton,
    IconButton,
    Stack,
    Text,
    Separator,
    Spinner,
    SpinnerSize,
    MessageBar,
    MessageBarType,
} from '@fluentui/react';
import axiosClient from '../api/axiosClient';
import DicomViewer from "./DicomViewer.jsx";// Import your axios client

const DicomModal = ({ isOpen, onDismiss, hospital }) => {
    const [dicomData, setDicomData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [showUpload, setShowUpload] = useState(true);
    const fileInputRef = useRef(null);
    const [imageId, setImageId] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);


    const hospitalId = hospital?.id;
    const toastId = useId('toast');

    // Fetch DICOM data when modal opens
    useEffect(() => {
        if (isOpen && hospitalId) {
            fetchDicomData();
        } else {
            // Reset when modal closes
            setDicomData(null);
            setShowUpload(true);
            setError(null);
            setImageId(null);
        }
    }, [isOpen, hospitalId]);
    // Add cleanup effect
    useEffect(() => {
        // Store the current imageId
        const currentImageId = imageId;

        return () => {
            // Don't revoke immediately - wait 10 seconds
            setTimeout(() => {
                if (currentImageId && currentImageId.startsWith('wadouri:')) {
                    const url = currentImageId.replace('wadouri:', '');
                    URL.revokeObjectURL(url);
                    console.log('Cleaned up blob URL:', url.substring(0, 50) + '...');
                }
            }, 10000);
        };
    }, [imageId]);

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => {
                setToastMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    const fetchDicomData = async () => {
        if (!hospitalId) return;

        setIsLoading(true);
        setError(null);

        try {
            // Use axiosClient which already has interceptor for auth
            const response = await axiosClient.get(`/hospital/${hospitalId}/dicom`);

            const data = response.data;
            console.log('DICOM fetch response:', data);

            // SCENARIO A: Hospital has DICOM file
            if (data.hasFile && data.dicomFileBase64) {
                setDicomData(data);
                setShowUpload(false);
                // Create imageId from Base64
                const newImageId = convertBase64ToImageId(data.dicomFileBase64);
                setImageId(newImageId);
                console.log('fetchDicomData - Created imageId:', newImageId);
            } else {
                // SCENARIO B: No DICOM file
                setDicomData(data);
                setShowUpload(true);
                setImageId(null);
            }
        } catch (err) {
            console.log('DICOM fetch error:', err.response?.status, err.message);

            if (err.response?.status === 404) {
                // No DICOM file exists
                setDicomData({ hasFile: false });
                setShowUpload(true);
            } else if (err.response?.status === 403) {
                setToastMessage('Access forbidden. You may not have permission to view DICOM files.');
            } else if (err.response?.status === 401) {
                setToastMessage('Please log in to access DICOM files.');
            } else {
                setToastMessage('Failed to load DICOM data');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (file) => {
        if (!hospitalId) {
            setError('Hospital ID is missing');
            return;
        }

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Step 1: Upload the file
            const response = await axiosClient.post(`/hospital/${hospitalId}/dicom`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            const result = response.data;
            console.log('DICOM upload success:', result);

            // Step 2: IMMEDIATELY fetch the DICOM data to get Base64
            try {
                const fetchResponse = await axiosClient.get(`/hospital/${hospitalId}/dicom`);
                const fetchedData = fetchResponse.data;

                // Create imageId from Base64
                const newImageId = convertBase64ToImageId(fetchedData.dicomFileBase64);
                setImageId(newImageId);
                console.log('handleUpload - Created imageId:', newImageId);
                // Create new DICOM data with Base64 from fresh fetch
                const newDicomData = {
                    hasFile: true,
                    hospitalCode: fetchedData.hospitalCode,
                    dicomId: fetchedData.dicomId,
                    dicomFileBase64: fetchedData.dicomFileBase64, // This was missing!
                    patientDetails: fetchedData.patientDetails
                };

                // TRANSITION: Update UI with complete data
                setDicomData(newDicomData);
                setShowUpload(false);
                setToastMessage({ type: 'success', text: 'DICOM file uploaded successfully!' });

            } catch (fetchErr) {
                console.error('Failed to fetch after upload:', fetchErr);
                // Fallback: Use upload response even without Base64
                const newDicomData = {
                    hasFile: true,
                    hospitalCode: result.hospitalCode,
                    dicomId: result.detailedResponse?.patientId,
                    patientDetails: result.detailedResponse
                };
                setDicomData(newDicomData);
                setShowUpload(false);
                setError('Upload successful, but could not load image preview. Refresh to view.');
            }

        } catch (err) {
            console.error('DICOM upload error:', err.response?.status, err.message);
            if (err.response?.status === 403) {
                setToastMessage('Access forbidden. You may not have permission to upload DICOM files.');
            } else if (err.response?.status === 401) {
                setToastMessage('Please log in to upload DICOM files.');
            } else {
                setToastMessage('Upload failed. Please try again.');
            }
        } finally {
            setIsUploading(false);
        }



    };
    // Helper to convert Base64 to Cornerstone imageId
    const convertBase64ToImageId = (base64Data) => {
        console.log('convertBase64ToImageId called. Current imageId:', imageId);
        if (!base64Data) return null;

        try {
            // Clean the Base64 string (same as HospitalDetails.jsx)
            let cleanBase64 = base64Data.trim();
            if (cleanBase64.includes('base64,')) {
                cleanBase64 = cleanBase64.split('base64,')[1];
            }
            cleanBase64 = cleanBase64.replace(/\s/g, '');

            if (!cleanBase64 || cleanBase64.length < 100) {
                console.error('Invalid DICOM data: Base64 string too short');
                return null;
            }

            // Convert Base64 to binary
            const binaryString = atob(cleanBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Create Blob with DICOM MIME type
            const blob = new Blob([bytes], { type: 'application/dicom' });
            if (blob.size === 0) {
                console.error('Created blob is empty');
                return null;
            }

            // Create Object URL
            const objectUrl = URL.createObjectURL(blob);
            return `wadouri:${objectUrl}`;
        } catch (convertErr) {
            console.error("Error converting Base64 to DICOM:", convertErr);
            return null;
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.dcm')) {
            setError('Please select a .dcm file');
            return;
        }

        handleUpload(file);
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onDismiss={onDismiss}
            isBlocking={false}
            styles={{  main: {
                    maxWidth: 1100,
                    width: '95%',
                    borderRadius: 8,
                    minHeight: 600,
                    padding: 0,
                    margin: 0
                },
                root: {
                    padding: 0,
                    margin: 0
                },
                scrollableContent: {
                    padding: 0,
                    margin: 0
                } }}
        >
            <div style={{ padding: 0, margin: 0 }}>
                <Stack tokens={{ childrenGap: 20 }} styles={{
                    root: {
                        padding: 20,
                        margin: 0
                    }
                }}>

            <Stack tokens={{ childrenGap: 20 }} styles={{ root: { padding: 20,margin: 0 } }}>
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                    <Text variant="xLarge" styles={{ root: { fontWeight: 600 } }}>
                        DICOM Management
                    </Text>
                    <IconButton iconProps={{ iconName: 'Cancel' }} onClick={onDismiss} />
                </Stack>
                {toastMessage && (
                    <div style={{
                        position: 'fixed',
                        top: 20,
                        right: 20,
                        zIndex: 1000,
                        minWidth: 300,
                        maxWidth: 400,
                        animation: 'fadeIn 0.3s ease-in'
                    }}>
                        <MessageBar
                            messageBarType={toastMessage.type === 'success' ? MessageBarType.success : MessageBarType.error}
                            onDismiss={() => setToastMessage(null)}
                            dismissButtonAriaLabel="Close"
                            styles={{
                                root: {
                                    borderRadius: 4,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                }
                            }}
                        >
                            {toastMessage.text}
                        </MessageBar>
                    </div>
                )}

                <Separator />

                {/* Loading State */}
                {isLoading && (
                    <Stack horizontalAlign="center" verticalAlign="center" style={{ height: 300 }}>
                        <Spinner label="Loading DICOM data..." size={SpinnerSize.medium} />
                    </Stack>
                )}

                {/* Error Message */}
                {error && !isLoading && (
                    <MessageBar
                        messageBarType={MessageBarType.error}
                        onDismiss={() => setError(null)}
                        styles={{ root: { marginBottom: 16 } }}
                    >
                        {error}
                    </MessageBar>
                )}

                {/* SCENARIO B: Upload Interface (when no DICOM or error) */}
                {showUpload && !isLoading && (
                    <Stack tokens={{ childrenGap: 20 }}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".dcm"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />

                        <Stack
                            horizontalAlign="center"
                            verticalAlign="center"
                            tokens={{ childrenGap: 16 }}
                            styles={{
                                root: {
                                    padding: 60,
                                    border: '2px dashed #c7e0f4',
                                    borderRadius: 4,
                                    backgroundColor: '#f3f2f1',
                                    // Removed cursor: 'pointer' from here
                                }
                            }}
                            // Removed onClick handler from here
                        >
                            <span style={{ fontSize: 64, color: '#0078d4' }}>📤</span>
                            <Stack horizontalAlign="center" tokens={{ childrenGap: 8 }}>
                                <Text variant="large" styles={{ root: { fontWeight: 600 } }}>
                                    Ready to upload DICOM file
                                </Text>
                                <Text variant="medium" styles={{ root: { color: '#605e5c' } }}>
                                    Supports .dcm files only
                                </Text>
                                {/* Add a clickable button here */}

                            </Stack>
                        </Stack>
                        <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 12 }}>
                            <PrimaryButton
                                onClick={() => fileInputRef.current?.click()}
                                styles={{ root: { marginTop: 15 ,minWidth: 150} }}
                            >
                                Upload File
                            </PrimaryButton>
                        </Stack>

                        {isUploading && (
                            <Stack horizontalAlign="center">
                                <Spinner label="Uploading..." size={SpinnerSize.medium} />
                            </Stack>
                        )}
                    </Stack>
                )}

                {/* SCENARIO A: DICOM View (when has DICOM file) */}
                {!showUpload && dicomData?.hasFile && (
                    <Stack tokens={{ childrenGap: 24 }}>
                        {/* Horizontal Layout for Image and Data */}
                        <Stack horizontal tokens={{ childrenGap: 20 }} styles={{ root: { alignItems: 'flex-start' } }}>
                            {/* Left Side: DICOM Image */}
                            <Stack
                                styles={{
                                    root: {
                                        flex: 2, // Takes more space
                                        backgroundColor: '#f3f2f1',
                                        padding: 16,
                                        borderRadius: 4,
                                        minHeight: 500,
                                        height: '70vh',
                                        border: '1px solid #e1dfdd',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }
                                }}
                            >
                                {imageId ? (
                                    <DicomViewer imageId={imageId} />
                                ) : dicomData?.dicomFileBase64 ? (
                                    <div style={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "black",
                                        borderRadius: 4,
                                    }}>
                                        <Spinner label="Preparing DICOM viewer..." size={SpinnerSize.medium} />
                                    </div>
                                ) : (
                                    <Stack horizontalAlign="center" tokens={{ childrenGap: 16 }}>
                                        <span style={{ fontSize: 64, color: '#605e5c' }}>🩻</span>
                                        <Text variant="mediumPlus">DICOM Image Loaded</Text>
                                        <Text variant="small" styles={{ root: { color: '#a19f9d' } }}>
                                            (Image data not available in preview)
                                        </Text>
                                    </Stack>
                                )}
                            </Stack>

                            {/* Right Side: Patient Information */}
                            {dicomData?.patientDetails && (
                                <Stack
                                    tokens={{ childrenGap: 8 }} // Reduced from 16
                                    styles={{
                                        root: {
                                            flex: 1,
                                            backgroundColor: '#faf9f8',
                                            padding: 16, // Reduced from 20
                                            borderRadius: 4,
                                            minHeight: 500,
                                            height: '70vh',
                                            border: '1px solid #e1dfdd',
                                            minWidth: 250,
                                            overflowY: 'auto' // Added for scroll if needed
                                        }
                                    }}
                                >
                                    <Text variant="mediumPlus" styles={{ root: { fontWeight: 600, marginBottom: 8 } }}>
                                        Patient Information
                                    </Text>
                                    <Separator />
                                    <Stack tokens={{ childrenGap: 12 }}>
                                        {[
                                            { label: 'Patient Name', value: dicomData.patientDetails.patientName },
                                            { label: 'Patient ID', value: dicomData.patientDetails.patientId },
                                            { label: 'Birth Date', value: dicomData.patientDetails.birthDate },
                                            { label: 'Sex', value: dicomData.patientDetails.sex },
                                            { label: 'Age', value: dicomData.patientDetails.age },
                                            { label: 'Upload Date', value: dicomData.patientDetails.uploadDate },
                                        ].map((item, index) => (
                                            <Stack key={index} tokens={{ childrenGap: 4 }}> {/* Reduced from 8 */}
                                                <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 4 }}>
                                                    <Text variant="smallPlus" styles={{ root: { color: '#605e5c', fontWeight: 600 } }}>
                                                        {item.label}:
                                                    </Text>
                                                    <Text variant="medium" styles={{ root: { marginLeft: 4 } }}>
                                                        {item.value || 'N/A'}
                                                    </Text>
                                                </Stack>
                                                {index < 5 && <Separator />}
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Stack>
                            )}
                        </Stack>

                        {/* Replace/Add New Button */}
                        <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 12 }}>

                            <DefaultButton onClick={onDismiss}  styles={{ root: { minWidth: 150 } }}>Close</DefaultButton>
                            <PrimaryButton
                                onClick={() => {
                                    setShowUpload(true);
                                    setError(null);
                                }}
                                styles={{ root: { minWidth: 150 } }}
                            >
                                Upload
                            </PrimaryButton>

                        </Stack>
                    </Stack>
                )}


            </Stack>
                </Stack>
            </div>
        </Modal>
    );
};

export default DicomModal;