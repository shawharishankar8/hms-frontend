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
    Dropdown,
    SearchBox,
   Tooltip,
    TooltipHost,
    DirectionalHint, 
    IconButton 
} from "@fluentui/react";
import { getHospitalsApi } from "../api/hospitalApi";
import HospitalTable from "../components/HospitalTable";
import HospitalForm from "./HospitalForm";
import DicomModal from "../components/DicomModal";
import { deleteHospitalApi} from "../api/hospitalApi";
import {logoutApi} from "../api/authApi";
import {clearAccessToken} from "../api/axiosClient.js";
import { useAuth } from "../hooks/useAuth";
import { SignOutIcon } from '@fluentui/react-icons-mdl2';


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

            
            // Preserve existing hasDicomFile status when fetching hospitals
            setHospitals(prevHospitals => {
                const existingStatusMap = new Map(prevHospitals.map(h => [h.id, h.hasDicomFile]));
                return (res.data.data || []).map(hospital => ({
                    ...hospital,
                    hasDicomFile: existingStatusMap.get(hospital.id) || false
                }));
            });

           
            
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
            sessionStorage.clear();
            window.location.href = "/login";
        } catch (e) {
            console.error("Logout failed", e);
            // Even if API fails, still clear local data
            clearAccessToken();
            localStorage.clear();
            sessionStorage.clear();
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


    // Dropdown options for search type
    const searchTypeOptions = [
        { key: 'name', text: 'Hospital Name' },
        { key: 'code', text: 'Hospital Code' },
    ];

    return (
        <Stack styles={{ root: { minHeight: '100vh', padding: 0, margin: 0 } }}>
            {/* Header Banner - Only Title and User Controls */}
            <Stack
                horizontal
                horizontalAlign="space-between"
                verticalAlign="center"
                styles={{
                    root: {
                        borderBottom: '1px solid #e1dfdd',
                        backgroundColor: '#faf9f8',
                        padding: '5px 5px',
                    }
                }}
            >
                <Text variant="xLarge" styles={{ root: { fontWeight: 600 } }}>
                    Hospital Management
                </Text>

                <Stack horizontal tokens={{ childrenGap: 's1' }} verticalAlign="center"  styles={{
                    root: {
                            paddingRight: '20px' // Move entire stack left by adding right padding
                        } }}>
                    {username && (
                        <Text variant="medium" styles={{ root: { color: '#605e5c', fontWeight: 500 } }}>
                            {username}
                        </Text>
                    )}
                    <TooltipHost
                        content="Logout"
                        directionalHint={DirectionalHint.bottomCenter}>
                        <IconButton
                            iconProps={{ iconName: 'SignOut' }}
                            onClick={handleLogout}
                            styles={{
                                root: {
                                    backgroundColor: 'transparent',
                                    color: '#0078d4',
                                    borderRadius: 4,
                                    ':hover': {
                                        backgroundColor: '#e1f5fe',
                                    },
                                    ':active': {
                                        backgroundColor: '#b3e5fc',
                                    }
                                },
                                rootHovered: {
                                    backgroundColor: '#e1f5fe',
                                }
                            }}
                            ariaLabel="Logout"
                        />
                    </TooltipHost>
                </Stack>
            </Stack>

            {/* Search and Action Bar - Outside Banner */}
            <Stack
                horizontal
                horizontalAlign="space-between"
                verticalAlign="center"
                tokens={{ padding: 'm' }}
                styles={{
                    root: {
                        padding: '5px 5px',
                    }
                }}
            >
                {/* Search Section - Left */}
                <Stack horizontal tokens={{ childrenGap: 's1' }} verticalAlign="center">
                    <Dropdown
                        selectedKey={searchType}
                        onChange={(event, option) => option && setSearchType(String(option.key))}
                        options={searchTypeOptions}
                        styles={{
                            root: { width: 140 },
                            dropdown: { height: 32 },
                        }}
                        ariaLabel="Search type selection"
                    />

                    <SearchBox
                        placeholder={`Search by ${searchType === 'name' ? 'hospital name' : 'hospital code'}...`}
                        value={searchTerm}
                        onChange={(event, newValue) => setSearchTerm(newValue || '')}
                        onSearch={() => fetchHospitals()}
                        styles={{
                            root: { width: 250, height: 32 },
                            box: { height: 32 },
                        }}
                        ariaLabel="Search hospitals"
                    />

                    <PrimaryButton
                        text="Search"
                        onClick={() => fetchHospitals()}
                        styles={{
                            root: {
                                backgroundColor: '#0078d4',
                                color: '#e1f5fe',
                                borderRadius: 4,
                                padding: '0 20px',
                                height: 32,
                                border: 'none',
                                minWidth: 100,
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
                                    backgroundColor: '#0078d4',
                                    color: '#e1f5fe',
                                    borderRadius: 4,
                                    padding: '0 16px',
                                    height: 32,
                                    border: 'none',
                                    minWidth: 100,

                                }
                            }}
                        />
                    )}
                </Stack>

                {/* Right Section: Count + Add Hospital */}
                <Stack horizontal tokens={{ childrenGap: 'm' }} verticalAlign="center">
                    <Text variant="medium" styles={{ root: { color: '#605e5c' } }}>
                        {hospitals.length} Registered Hospital{hospitals.length !== 1 ? 's' : ''}
                    </Text>

                    <PrimaryButton
                        text="Add Hospital"
                        onClick={handleCreateHospital}
                        styles={{
                            root: {
                                backgroundColor: '#0078d4',
                                color: '#e1f5fe',
                                borderRadius: 4,
                                padding: '0 20px',
                                height: 32,
                                border: 'none',
                                minWidth: 80,
                            }
                        }}
                    />
                </Stack>
            </Stack>

            {/* Main Content - NO extra padding */}
            <div style={{ margin: 0 }}>
                {/* Loading State */}
                {loading && (
                    <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { padding: 20} }}>
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