import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Stack,
    Text,
    MessageBar,
    MessageBarType,
    PrimaryButton,
    Icon,
    Spinner,
    SpinnerSize,
} from "@fluentui/react";
import { getDicomMetadataApi } from "../api/dicomApi";
import DicomViewer from "../components/DicomViewer";
import ErrorBoundary from "../components/ErrorBoundary";

export default function HospitalDetails() {
    const { hospitalId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dicomMeta, setDicomMeta] = useState(null);
    const [imageId, setImageId] = useState(null);
    const [dicomLoading, setDicomLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        let objectUrl = null;

        async function fetchDicom() {
            setLoading(true);
            setError(null);
            setImageId(null);
            setDicomLoading(false);

            try {
                const res = await getDicomMetadataApi(hospitalId);
                if (cancelled) return;

                const responseData = res.data;

                if (responseData && responseData.hasFile && responseData.dicomFileBase64) {
                    // Map backend structure to frontend
                    setDicomMeta({
                        hospitalCode: responseData.hospitalCode,
                        hasFile: responseData.hasFile,
                        dicomId: responseData.dicomId,
                        patientDetails: responseData.patientDetails || {
                            patientName: 'N/A',
                            patientId: 'N/A',
                            age: 'N/A',
                            sex: 'N/A',
                            birthDate: 'N/A',
                            uploadDate: 'N/A'
                        }
                    });

                    // Start loading DICOM
                    setDicomLoading(true);

                    try {
                        // Convert Base64 to Blob and create imageId
                        const base64Data = responseData.dicomFileBase64;

                        // Clean the Base64 string (remove whitespace and data URL prefix if present)
                        let cleanBase64 = base64Data.trim();

                        // Remove data URL prefix if present (e.g., "data:application/dicom;base64,")
                        if (cleanBase64.includes('base64,')) {
                            cleanBase64 = cleanBase64.split('base64,')[1];
                        }

                        // Remove any remaining whitespace
                        cleanBase64 = cleanBase64.replace(/\s/g, '');

                        // Validate Base64
                        if (!cleanBase64 || cleanBase64.length < 100) {
                            throw new Error('Invalid DICOM data: Base64 string too short or empty');
                        }

                        // Convert Base64 to binary
                        const binaryString = atob(cleanBase64);
                        const bytes = new Uint8Array(binaryString.length);

                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }

                        // Create Blob with DICOM MIME type
                        const blob = new Blob([bytes], {
                            type: 'application/dicom'
                        });

                        // Verify blob size
                        if (blob.size === 0) {
                            throw new Error('Created blob is empty');
                        }

                        // Create Object URL
                        objectUrl = URL.createObjectURL(blob);

                        // Create imageId for Cornerstone
                        const newImageId = `wadouri:${objectUrl}`;

                        if (!cancelled) {
                            setImageId(newImageId);
                            setDicomLoading(false);
                        }
                    } catch (convertErr) {
                        console.error("Error converting Base64 to DICOM:", convertErr);
                        if (!cancelled) {
                            setError(`Failed to load DICOM image: ${convertErr.message}`);
                            setDicomLoading(false);
                        }
                    }
                } else if (responseData && responseData.hasFile) {
                    // Has file but no Base64 data
                    setDicomMeta({
                        hospitalCode: responseData.hospitalCode,
                        hasFile: responseData.hasFile,
                        patientDetails: responseData.patientDetails || {
                            patientName: 'N/A',
                            patientId: 'N/A',
                            age: 'N/A',
                            sex: 'N/A',
                            birthDate: 'N/A',
                            uploadDate: 'N/A'
                        }
                    });
                    setError("DICOM file data is missing from server response.");
                } else {
                    setDicomMeta({ hasFile: false });
                }
            } catch (err) {
                console.error("API error:", err);
                if (!cancelled) {
                    if (err.response?.status === 404) {
                        setDicomMeta({ hasFile: false });
                    } else {
                        setError("Failed to load DICOM details from server");
                    }
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchDicom();

        // Cleanup function
        return () => {
            cancelled = true;
            // Revoke the object URL to prevent memory leaks
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [hospitalId]);

    // Cleanup when imageId changes
    useEffect(() => {
        return () => {
            if (imageId && imageId.startsWith('wadouri:')) {
                const url = imageId.replace('wadouri:', '');
                URL.revokeObjectURL(url);
            }
        };
    }, [imageId]);

    if (loading) {
        return (
            <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { padding: 40 } }}>
                <Spinner label="Loading DICOM data..." size={SpinnerSize.large} />
            </Stack>
        );
    }

    if (error && !dicomMeta?.hasFile) {
        return (
            <Stack tokens={{ childrenGap: 24 }} styles={{ root: { padding: 24 } }}>
                <MessageBar messageBarType={MessageBarType.error}>
                    {error}
                </MessageBar>
                <Stack horizontal horizontalAlign="start">
                    <PrimaryButton
                        text="Back to Hospital List"
                        iconProps={{ iconName: 'Back' }}
                        onClick={() => window.history.back()}
                    />
                </Stack>
            </Stack>
        );
    }

    if (!dicomMeta || dicomMeta.hasFile === false) {
        return (
            <Stack tokens={{ childrenGap: 24 }} styles={{ root: { padding: 24 } }}>
                <Stack horizontalAlign="center" tokens={{ childrenGap: 20 }} styles={{ root: { padding: 40 } }}>
                    <Icon iconName="DocumentSearch" styles={{ root: { fontSize: 64, color: '#d0d0d0' } }} />
                    <Stack horizontalAlign="center" tokens={{ childrenGap: 12 }}>
                        <Text variant="xLarge" styles={{ root: { fontWeight: 600 } }}>
                            No DICOM File Found
                        </Text>
                        <Text variant="medium" styles={{ root: { color: '#605e5c', textAlign: 'center' } }}>
                            This hospital doesn't have any DICOM files attached yet.
                        </Text>
                        <Text variant="small" styles={{ root: { color: '#a19f9d', textAlign: 'center' } }}>
                            Hospital ID: {hospitalId}
                        </Text>
                    </Stack>
                </Stack>
                <Stack horizontal horizontalAlign="start">
                    <PrimaryButton
                        text="Back to Hospital List"
                        iconProps={{ iconName: 'Back' }}
                        onClick={() => window.history.back()}
                    />
                </Stack>
            </Stack>
        );
    }

    const { patientDetails, hospitalCode } = dicomMeta;

    return (
        <Stack tokens={{ childrenGap: 24 }} styles={{ root: { padding: 24 } }}>
            {/* Header */}
            <Stack tokens={{ childrenGap: 8 }}>
                <Text variant="xLarge" styles={{ root: { fontWeight: 600 } }}>
                    DICOM Viewer – Hospital {hospitalCode || hospitalId}
                </Text>
                <Text variant="small" styles={{ root: { color: '#605e5c' } }}>
                    View medical imaging data and patient information
                </Text>
            </Stack>

            {/* Error Message (if any) */}
            {error && (
                <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setError(null)}>
                    {error}
                </MessageBar>
            )}

            {/* Patient Metadata */}
            <Stack
                tokens={{ childrenGap: 12 }}
                styles={{
                    root: {
                        backgroundColor: '#faf9f8',
                        padding: 20,
                        borderRadius: 8,
                        border: '1px solid #e1dfdd',
                        maxWidth: 600,
                    }
                }}
            >
                <Text variant="mediumPlus" styles={{ root: { fontWeight: 600, marginBottom: 8 } }}>
                    Patient Information
                </Text>
                <Stack horizontal tokens={{ childrenGap: 40 }}>
                    <Stack tokens={{ childrenGap: 10 }}>
                        <Text><b>Patient Name:</b> {patientDetails?.patientName || 'N/A'}</Text>
                        <Text><b>Patient ID:</b> {patientDetails?.patientId || 'N/A'}</Text>
                        <Text><b>Age:</b> {patientDetails?.age || 'N/A'}</Text>
                    </Stack>
                    <Stack tokens={{ childrenGap: 10 }}>
                        <Text><b>Sex:</b> {patientDetails?.sex || 'N/A'}</Text>
                        <Text><b>Birth Date:</b> {patientDetails?.birthDate || 'N/A'}</Text>
                        <Text><b>Upload Date:</b> {patientDetails?.uploadDate || 'N/A'}</Text>
                    </Stack>
                </Stack>
            </Stack>

            {/* DICOM Viewer */}
            <Stack tokens={{ childrenGap: 12 }}>
                <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
                    Medical Image
                </Text>
                <ErrorBoundary>
                    {dicomLoading ? (
                        <div style={{
                            width: "100%",
                            height: "512px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f3f2f1",
                            borderRadius: 4,
                        }}>
                            <Spinner label="Loading DICOM image..." size={SpinnerSize.large} />
                        </div>
                    ) : imageId ? (
                        <DicomViewer imageId={imageId} />
                    ) : (
                        <MessageBar messageBarType={MessageBarType.warning}>
                            No DICOM image available. The file may be corrupted or missing.
                        </MessageBar>
                    )}
                </ErrorBoundary>
            </Stack>

            {/* Navigation/Back Button */}
            <Stack horizontal horizontalAlign="start">
                <PrimaryButton
                    text="Back to Hospital List"
                    iconProps={{ iconName: 'Back' }}
                    onClick={() => window.history.back()}
                    styles={{
                        root: {
                            marginTop: 16,
                        }
                    }}
                />
            </Stack>
        </Stack>
    );
}