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
      <Stack tokens={{ childrenGap: 24 }} styles={{ root: { padding: 24, minHeight: '100vh', position: 'relative' } }}>
        {/* Header */}
        <Stack tokens={{ childrenGap: 8 }}>
          <Text variant="xLarge" styles={{ root: { fontWeight: 600, color: '#323130' } }}>
            Hospital Management
          </Text>
        </Stack>

        {/* Action Bar */}
        <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
          <PrimaryButton
              text="Create New Hospital"
              iconProps={{ iconName: 'Add' }}
              onClick={handleCreateHospital}
              styles={{
                root: {
                  borderRadius: 4,
                  padding: '0 20px',
                }
              }}
          />
        </Stack>
          {/* Search Bar */}
          <Stack horizontal tokens={{ childrenGap: 10 }} verticalAlign="end">
              <Stack.Item grow>
                  <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign="end">
                      {/* Search Type Dropdown */}
                      <div style={{ width: 120 }}>
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
                      <div style={{ flex: 1 }}>
                          <input
                              type="text"
                              placeholder={`Search by ${searchType === 'name' ? 'hospital name' : 'hospital code'}...`}
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              style={{
                                  width: '50%',
                                  padding: '6px 12px',
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
                                  borderRadius: 10,
                                  padding: '0 20px',
                                  marginLeft: '10px',
                              }
                          }}
                      />

                      {/* Clear Button (only show when there's a search term) */}
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
                  </Stack>
              </Stack.Item>
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
                No hospitals registered yet. Click "Create New Hospital" to add one.
              </MessageBar>
            </Stack>
        )}

        {/* Data Table */}
        {!loading && hospitals.length > 0 && (
            <HospitalTable
                hospitals={hospitals}
                onEditHospital={handleEditHospital}
                onViewDicom={handleViewDicom}
            />
        )}

        {/* Create/Edit Hospital Form Modal */}
        <Modal
            isOpen={showForm}
            onDismiss={handleFormCancel}
            isBlocking={true}
            styles={{
              main: {
                maxWidth: 650,
                width: '90%',
                borderRadius: 8,
                padding: 0,
              },
              scrollableContent: {
                maxHeight: '90vh',
                overflow: 'auto',
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