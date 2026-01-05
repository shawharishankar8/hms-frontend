import { useEffect, useState } from "react";
import {
  Stack,
  Text,
  PrimaryButton,
  MessageBar,
  MessageBarType,
  Dialog,
  DialogFooter,
  DefaultButton,
  TextField,
  Dropdown,
  Spinner,
  SpinnerSize,
} from "@fluentui/react";
import { getHospitalsApi } from "../api/hospitalApi";
import HospitalTable from "../components/HospitalTable";
import HospitalForm from "./HospitalForm";

export default function HospitalList() {
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showDicomDialog, setShowDicomDialog] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'

  const fetchHospitals = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getHospitalsApi();
      console.log('Fetched hospitals:', res.data.data);
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
    console.log('Editing hospital:', hospital);
    setSelectedHospital(hospital);
    setFormMode('edit');
    setShowForm(true);
  };

  // Handle Add DICOM button click
  const handleAddDicom = (hospital) => {
    console.log('Adding DICOM for hospital:', hospital);
    setSelectedHospital(hospital);
    setShowDicomDialog(true);
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
    fetchHospitals(); // Refresh the list
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedHospital(null);
  };

  // Handle DICOM configuration submit
  const handleDicomSubmit = () => {
    // TODO: Implement actual DICOM configuration API call
    console.log('Submitting DICOM config for:', selectedHospital);

    // Simulate API call
    setTimeout(() => {
      alert(`DICOM configuration saved for ${selectedHospital?.name}`);
      setShowDicomDialog(false);
      setSelectedHospital(null);
    }, 500);
  };

  return (
      <Stack tokens={{ childrenGap: 24 }} styles={{ root: { padding: 24, minHeight: '100vh' } }}>
        {/* Header */}
        <Stack tokens={{ childrenGap: 8 }}>
          <Text variant="xLarge" styles={{ root: { fontWeight: 600, color: '#323130' } }}>
            Hospital Management
          </Text>
          <Text variant="small" styles={{ root: { color: '#605e5c' } }}>
            Manage registered hospitals and their contact details
          </Text>
        </Stack>

        {/* Action Bar */}
        <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
          <Text variant="medium" styles={{ root: { fontWeight: 600 } }}>
            Total Hospitals: {hospitals.length}
          </Text>
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
                onAddDicom={handleAddDicom}
            />
        )}

        {/* Create/Edit Hospital Form */}
        {showForm && (
            <HospitalForm
                hospital={selectedHospital}
                mode={formMode}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
            />
        )}

        {/* DICOM Configuration Dialog */}
        <Dialog
            hidden={!showDicomDialog}
            onDismiss={() => {
              setShowDicomDialog(false);
              setSelectedHospital(null);
            }}
            dialogContentProps={{
              title: `DICOM Configuration - ${selectedHospital?.name}`,
              subText: 'Configure DICOM/PACS settings for this hospital'
            }}
            maxWidth={500}
            modalProps={{
              isBlocking: true,
              styles: { main: { maxWidth: 500 } }
            }}
        >
          <Stack tokens={{ childrenGap: 20 }}>
            <Stack tokens={{ childrenGap: 12 }}>
              <TextField
                  label="DICOM Server IP Address"
                  placeholder="e.g., 192.168.1.100"
                  required
                  styles={{ root: { width: '100%' } }}
              />
              <TextField
                  label="Port Number"
                  placeholder="e.g., 104"
                  type="number"
                  required
                  styles={{ root: { width: '100%' } }}
              />
              <TextField
                  label="AE Title (Application Entity)"
                  placeholder="e.g., HOSPITAL_PACS"
                  required
                  styles={{ root: { width: '100%' } }}
              />
              <Dropdown
                  label="DICOM Protocol"
                  placeholder="Select protocol"
                  options={[
                    { key: 'c-store', text: 'C-STORE - Store images' },
                    { key: 'c-find', text: 'C-FIND - Query/Retrieve' },
                    { key: 'c-move', text: 'C-MOVE - Move images' },
                    { key: 'c-echo', text: 'C-ECHO - Verification' },
                  ]}
                  defaultSelectedKey="c-store"
                  styles={{ root: { width: '100%' } }}
              />
              <TextField
                  label="Retrieve AE Title"
                  placeholder="e.g., LOCAL_PACS"
                  styles={{ root: { width: '100%' } }}
              />
            </Stack>

            <Stack tokens={{ childrenGap: 8 }}>
              <Text variant="smallPlus" styles={{ root: { fontWeight: 600 } }}>
                Connection Test
              </Text>
              <Text variant="small" styles={{ root: { color: '#605e5c' } }}>
                After saving, you can test the DICOM connection from the hospital details page.
              </Text>
            </Stack>
          </Stack>

          <DialogFooter>
            <DefaultButton
                onClick={() => {
                  setShowDicomDialog(false);
                  setSelectedHospital(null);
                }}
                text="Cancel"
            />
            <PrimaryButton
                onClick={handleDicomSubmit}
                text="Save Configuration"
                styles={{
                  root: {
                    backgroundColor: '#107c10',
                    borderColor: '#107c10',
                    ':hover': {
                      backgroundColor: '#0c6b0c',
                      borderColor: '#0c6b0c',
                    }
                  }
                }}
            />
          </DialogFooter>
        </Dialog>
      </Stack>
  );
}