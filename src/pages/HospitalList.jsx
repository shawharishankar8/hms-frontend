import { useEffect, useState } from "react";
import {
    Stack,
    Text,
    PrimaryButton,
    DefaultButton,
    MessageBar,
    MessageBarType,
    Spinner,
    SpinnerSize,
    Modal,
} from "@fluentui/react";
import { getHospitalsApi } from "../api/hospitalApi";
import HospitalTable from "../components/HospitalTable";
import HospitalForm from "./HospitalForm";
import DicomModal from "../components/DicomModal";
import { deleteHospitalApi} from "../api/hospitalApi";

export default function HospitalList() {
    const [hospitals, setHospitals] = useState([]);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [showDicomModal, setShowDicomModal] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState("name");
 


    const fetchHospitals = async () => {
        setLoading(true);
        setError(null);

        try {

            const params ={};
            if(searchTerm.trim())
            {
                if(searchType === "name"){
                    params.hospitalName = searchTerm.trim();
                }
                else {
                    params.hospitalCode = searchTerm.trim();
                }
            }
            const res = await getHospitalsApi(params);
            setHospitals(res.data.data || []);
        } catch (err) {
            console.error('Error fetching hospitals:', err);
            setError("Failed to fetch hospitals. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHospitals();
    }, []);

    // Handle Edit Hospital button click
    const handleEditHospital = (hospital) => {
        setSelectedHospital(hospital);
        setFormMode('edit');
        setShowForm(true);
    };
    const deleteHospital = async (hospital) => {
        if (!hospital?.id) return;

        const confirmDelete = window.confirm(`Delete ${hospital.name}?`);
        if (!confirmDelete) return;

        try {
            await deleteHospitalApi(hospital.id);
            fetchHospitals();
        } catch (e) {
            console.error("Delete failed:", e);
            setError("Failed to delete hospital.");
        }
    };



    // Handle View/Upload DICOM button click
    const handleViewDicom = (hospital) => {
        setSelectedHospital(hospital);
        setShowDicomModal(true);
    };

    // Handle Create Hospital button click
    const handleCreateHospital = () => {
        setSelectedHospital(null);
        setFormMode('create');
        setShowForm(true);
    };

    // Handle form success
    const handleFormSuccess = () => {
        setShowForm(false);
        setSelectedHospital(null);
        fetchHospitals();
    };

    // Handle form cancel
    const handleFormCancel = () => {
        setShowForm(false);
        setSelectedHospital(null);
    };


    return (
        <Stack tokens={{ childrenGap: 16 }} styles={{ root: { padding: 0, minHeight: '100vh' } }}>
            {/* Top Row: Hospital Management + Right-side components */}
            <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                {/* Left: Hospital Management Title */}
                <Text variant="xLarge" styles={{ root: { fontWeight: 600, color: '#323130' } }}>
                    Hospital Management
                </Text>

                {/* Right: Registered Hospital count + Add Hospital button */}
                <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
                    {/* Registered Hospital count */}
                    <Text variant="medium" styles={{ root: { color: '#605e5c' } }}>
                        ({hospitals.length}) Registered Hospital{hospitals.length !== 1 ? 's' : ''}
                    </Text>

                    {/* Add Hospital button */}
                    <PrimaryButton
                        text="Add Hospital"
                        onClick={handleCreateHospital}
                        styles={{
                            root: {
                                borderRadius: 4,
                                padding: '0 20px',
                            }
                        }}
                    />
                </Stack>
            </Stack>

            {/* Search Section - Compact */}
            <Stack
                horizontal
                tokens={{ childrenGap: 8 }}
                verticalAlign="center"
                styles={{
                    root: {
                        padding: '8px 0',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }
                }}
            >
                {/* Left: Search section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Search Type Dropdown */}
                    <div style={{ width: 140 }}>
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                border: '1px solid #8a8886',
                                fontSize: '14px',
                                backgroundColor: 'white',
                            }}
                        >
                            <option value="name">Hospital Name</option>
                            <option value="code">Hospital Code</option>
                        </select>
                    </div>

                    {/* Search Input */}
                    <div>
                        <input
                            type="text"
                            placeholder={`Search by ${searchType === 'name' ? 'hospital name' : 'hospital code'}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '6px 12px',
                                width: '250px',
                                borderRadius: '4px',
                                border: '1px solid #8a8886',
                                fontSize: '14px',
                            }}
                        />
                    </div>

                    {/* Search Button */}
                    <PrimaryButton
                        text="Search"
                        onClick={() => fetchHospitals()}
                        styles={{
                            root: {
                                borderRadius: 4,
                                padding: '0 20px',
                            }
                        }}
                    />

                    {/* Clear Button */}
                    {searchTerm && (
                        <DefaultButton
                            text="Clear"
                            onClick={() => {
                                setSearchTerm("");
                                fetchHospitals();
                            }}
                            styles={{
                                root: {
                                    borderRadius: 4,
                                    padding: '0 20px',
                                }
                            }}
                        />
                    )}
                </div>

                {/* Right: Registered Hospital count + Add Hospital button */}
                <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
                    {/* Registered Hospital count */}
                    <Text variant="medium" styles={{ root: { color: '#605e5c' } }}>
                        ({hospitals.length}) Registered Hospital{hospitals.length !== 1 ? 's' : ''}
                    </Text>

                    {/* Add Hospital button */}
                    <PrimaryButton
                        text="Add Hospital"
                        onClick={handleCreateHospital}
                        styles={{
                            root: {
                                borderRadius: 4,
                                padding: '0 20px',
                            }
                        }}
                    />
                </Stack>
            </Stack>

            {/* Loading State */}
            {loading && (
                <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { padding: 40 } }}>
                    <Spinner label="Loading hospitals..." size={SpinnerSize.large} />
                </Stack>
            )}

            {/* Error State */}
            {error && !loading && (
                <MessageBar
                    messageBarType={MessageBarType.error}
                    isMultiline={false}
                    onDismiss={() => setError(null)}
                >
                    {error}
                </MessageBar>
            )}

            {/* Empty State */}
            {!loading && hospitals.length === 0 && !error && (
                <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { padding: 40 } }}>
                    <MessageBar messageBarType={MessageBarType.info}>
                        No hospitals registered yet. Click "Add Hospital" to add one.
                    </MessageBar>
                </Stack>
            )}

            {/* Data Table */}
            {!loading && hospitals.length > 0 && (
                <Stack styles={{ root: { width: '100%', margin: 0, padding: 0 } }}>
                    <HospitalTable
                        hospitals={hospitals}
                        onEditHospital={handleEditHospital}
                        onViewDicom={handleViewDicom}
                        onDeleteHospital={deleteHospital}
                    />
                </Stack>
            )}

            {/* Create/Edit Hospital Form Modal */}
            <Modal
                isOpen={showForm}
                onDismiss={handleFormCancel}
                isBlocking={true}
                scrollable={false}
                scrollableContentClassName=""
                styles={{
                    main: {
                        maxWidth: 600,
                        width: '90%',
                        borderRadius: 6,
                        padding: 0
                    },
                    scrollableContent: {
                        overflow: 'visible',
                        height: 'auto',
                        maxHeight: 'none',
                        padding: 0,
                        margin: 0
                    }
                }}
            >
                <HospitalForm
                    hospital={selectedHospital}
                    mode={formMode}
                    onSuccess={handleFormSuccess}
                    onCancel={handleFormCancel}
                />
            </Modal>

            {/* DICOM Modal for Viewing/Uploading DICOM files */}
            <DicomModal
                hospital={selectedHospital}
                isOpen={showDicomModal}
                onDismiss={() => {
                    setShowDicomModal(false);
                    setSelectedHospital(null);
                }}
            />
        </Stack>

    );
}