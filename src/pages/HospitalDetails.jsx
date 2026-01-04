import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Stack,
    Text,
    MessageBar,
    MessageBarType,
} from "@fluentui/react";
import { getDicomMetadataApi } from "../api/dicomApi";
import DicomViewer from "../components/DicomViewer";
import ErrorBoundary from "../components/ErrorBoundary.jsx";

/**
 * HospitalDetails
 *
 * Responsibilities:
 * - Fetch DICOM metadata for a hospital
 * - Show patient metadata
 * - Render DicomViewer when file exists
 */
export default function HospitalDetails() {
    const { hospitalId } = useParams();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dicomMeta, setDicomMeta] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchDicom() {
            setLoading(true);
            setError(null);

            try {
                const res = await getDicomMetadataApi(hospitalId);
                if (!cancelled) {
                    setDicomMeta(res.data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError("Failed to load DICOM details");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchDicom();

        return () => {
            cancelled = true;
        };
    }, [hospitalId]);

    if (loading) {
        return <Text>Loading DICOM data...</Text>;
    }

    if (error) {
        return (
            <MessageBar messageBarType={MessageBarType.error}>
                {error}
            </MessageBar>
        );
    }

    if (!dicomMeta || dicomMeta.hasFile === false) {
        return (
            <MessageBar messageBarType={MessageBarType.info}>
                No DICOM file attached to this hospital.
            </MessageBar>
        );
    }

    const { patientDetails, dicomUrl } = dicomMeta;

    // Build Cornerstone imageId
    const imageId = `wadouri:${dicomUrl}`;

    return (
        <Stack tokens={{ childrenGap: 24 }} styles={{ root: { padding: 24 } }}>
            {/* Header */}
            <Text variant="xLarge">
                DICOM Viewer – Hospital {dicomMeta.hospitalCode}
            </Text>

            {/* Patient Metadata */}
            <Stack
                tokens={{ childrenGap: 6 }}
                styles={{ root: { maxWidth: 400 } }}
            >
                <Text><b>Patient Name:</b> {patientDetails.patientName}</Text>
                <Text><b>Patient ID:</b> {patientDetails.patientId}</Text>
                <Text><b>Age:</b> {patientDetails.age}</Text>
                <Text><b>Sex:</b> {patientDetails.sex}</Text>
                <Text><b>Birth Date:</b> {patientDetails.birthDate}</Text>
                <Text><b>Upload Date:</b> {patientDetails.uploadDate}</Text>
            </Stack>

            {/* DICOM Viewer */}
            <ErrorBoundary>
                <DicomViewer imageId={imageId} />
            </ErrorBoundary>
        </Stack>
    );
}
