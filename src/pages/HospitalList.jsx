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
import {logoutApi} from "../api/authApi";
import {clearAccessToken} from "../api/axiosClient.js";
import { useAuth } from "../hooks/useAuth";




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
    const { authState } = useAuth();
    const username = authState.user?.username || '';

    console.log('AuthState in HospitalList:', authState);
       
    // You should add this back:
useEffect(() => {
    fetchHospitals();
}, []);



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

            const hospitalsWithDicomStatus = (res.data.data || []).map(hospital => ({
                ...hospital,
                hasDicomFile: false // Default to false
            }));
            setHospitals(hospitalsWithDicomStatus);
        } catch (err) {
            console.error('Error fetching hospitals:', err);
            setError("Failed to fetch hospitals. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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
    const handleLogout = async () => {
        try {
            await logoutApi();
            // Clear all user data
            clearAccessToken();
            localStorage.clear();
            window.location.href = "/login";
        } catch (e) {
            console.error("Logout failed", e);
            // Even if API fails, still clear local data
            clearAccessToken();
            localStorage.clear();
            window.location.href = "/login";
        }
    };


    // Handle View/Upload DICOM button click
    const handleViewDicom = (hospital) => {
        setSelectedHospital(hospital);
        setShowDicomModal(true);
    };
    const handleDicomUploadComplete = (hospitalId) => {
        // Update the specific hospital's hasDicomFile status
        setHospitals(prevHospitals =>
            prevHospitals.map(hospital =>
                hospital.id === hospitalId
                    ? { ...hospital, hasDicomFile: true }
                    : hospital
            )
        );
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
        <Stack styles={{ root: { minHeight: '100vh', padding: 0, margin: 0 } }}>
            {/* Banner/Header - NO extra padding */}
            <div style={{
                padding: '16px 24px 12px 24px', // Matches your current spacing
                margin: 0,
                borderBottom: '1px solid #e1dfdd',
                backgroundColor: '#faf9f8'
            }}>
                {/* Top Row: Title + Logout (right top) */}
   {/* Top Row: Title + User Info & Logout */}
<Stack horizontal horizontalAlign="space-between" verticalAlign="center" styles={{ root: { marginBottom: 16 } }}>
    <Text variant="xLarge" styles={{ root: { fontWeight: 600, color: '#323130' } }}>
        Hospital Management
    </Text>

    {/* User Info & Logout - right top */}
    <Stack horizontal tokens={{ childrenGap: 12 }} verticalAlign="center">
    {username && (
        <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign="center">
           
            
            {/* User avatar/icon */}
            <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#0078d4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '12px',
                flexShrink: 0
            }}>
                {username.charAt(0).toUpperCase()}
            </div>
            
            {/* Username text */}
            <Text variant="medium" styles={{ 
                root: { 
                    color: '#605e5c', 
                    fontWeight: 500,
                    fontSize: '14px'
                } 
            }}>
                {username}
            </Text>
        </Stack>
    )}
    
    <PrimaryButton
        text="Logout"
        onClick={handleLogout}
        styles={{
            root: {
                backgroundColor: '#e1f5fe',
                color: '#0078d4',
                borderRadius: 4,
                padding: '0 20px',
                height: 32,
                border: 'none',
                minWidth: 100,
                ':hover': {
                    backgroundColor: '#b3e5fc',
                },
                ':active': {
                    backgroundColor: '#81d4fa',
                }
            }
        }}
    />
</Stack>
</Stack>

                {/* Bottom Row: Search (left) + Count & Add Hospital (right) */}
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                    {/* Search Section - left bottom */}
                    <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign="center">
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
                                    height: 32,
                                }}
                            >
                                <option value="name">Hospital Name</option>
                                <option value="code">Hospital Code</option>
                            </select>
                        </div>

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
                                    height: 32,
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <PrimaryButton
                            text="Search"
                            onClick={() => fetchHospitals()}
                            styles={{
                                root: {
                                    backgroundColor: '#e1f5fe',
                                    color: '#0078d4',
                                    borderRadius: 4,
                                    padding: '0 20px',
                                    height: 32,
                                    border: 'none',
                                    minWidth: 100,
                                    ':hover': {
                                        backgroundColor: '#b3e5fc',
                                    },
                                    ':active': {
                                        backgroundColor: '#81d4fa',
                                    }
                                }
                            }}
                        />

                        {searchTerm && (
                            <DefaultButton
                                text="Clear"
                                onClick={() => {
                                    setSearchTerm("");
                                    fetchHospitals();
                                }}
                                styles={{
                                    root: {
                                        backgroundColor: '#e1f5fe',
                                        color: '#0078d4',
                                        borderRadius: 4,
                                        padding: '0 20px',
                                        height: 32,
                                        border: 'none',
                                        minWidth: 100,
                                        ':hover': {
                                            backgroundColor: '#b3e5fc',
                                        },
                                        ':active': {
                                            backgroundColor: '#81d4fa',
                                        }
                                    }
                                }}
                            />
                        )}
                    </Stack>

                    {/* Right Section: Count + Add Hospital - right bottom */}
                    <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
                        <Text variant="medium" styles={{ root: { color: '#605e5c' } }}>
                            ({hospitals.length}) Registered Hospital{hospitals.length !== 1 ? 's' : ''}
                        </Text>

                        <PrimaryButton
                            text="Add Hospital"
                            onClick={handleCreateHospital}
                            styles={{
                                root: {
                                    backgroundColor: '#e1f5fe',
                                    color: '#0078d4',
                                    borderRadius: 4,
                                    padding: '0 20px',
                                    height: 32,
                                    border: 'none',
                                    minWidth: 100,
                                    ':hover': {
                                        backgroundColor: '#b3e5fc',
                                    },
                                    ':active': {
                                        backgroundColor: '#81d4fa',
                                    }
                                }
                            }}
                        />
                    </Stack>
                </Stack>
            </div>

            {/* Main Content - NO extra padding */}
            <div style={{ padding: '24px', margin: 0 }}>
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
                    <Stack styles={{ root: { width: '100%', margin: 0, padding: 0 , overflowX: 'hidden',} }}>
                        <HospitalTable
                            hospitals={hospitals}
                            onEditHospital={handleEditHospital}
                            onViewDicom={handleViewDicom}
                            onDeleteHospital={deleteHospital}
                        />
                    </Stack>
                )}
            </div>

            {/* Modals (unchanged) */}
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
                    },                        overflow: 'visible',

                    scrollableContent: {
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

            <DicomModal
                hospital={selectedHospital}
                isOpen={showDicomModal}
                onDismiss={() => {
                    setShowDicomModal(false);
                    setSelectedHospital(null);
                }}
                onUploadComplete={handleDicomUploadComplete}
            />
        </Stack>
    );
}