import { useEffect, useState } from "react";
import {
  Stack,
  Text,
  PrimaryButton,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
import { getHospitalsApi } from "../api/hospitalApi";
import HospitalTable from "../components/HospitalTable";
import HospitalForm from "./HospitalForm";

export default function HospitalList() {
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchHospitals = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getHospitalsApi();
      setHospitals(res.data.data || []);
    } catch {
      setError("Failed to fetch hospitals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  return (
    <Stack tokens={{ childrenGap: 24 }} styles={{ root: { padding: 24 } }}>
      {/* Header */}
      <Stack tokens={{ childrenGap: 8 }}>
        <Text variant="xLarge">Hospital Management</Text>
        <Text variant="small">
          Manage registered hospitals and their details
        </Text>
      </Stack>

      {/* Action Bar */}
      <Stack horizontal horizontalAlign="space-between">
        <PrimaryButton
          text="Create Hospital"
          onClick={() => setShowForm(true)}
        />
      </Stack>

      {/* Error State */}
      {error && (
        <MessageBar messageBarType={MessageBarType.error}>
          {error}
        </MessageBar>
      )}

      {/* Empty State */}
      {!loading && hospitals.length === 0 && !error && (
        <MessageBar messageBarType={MessageBarType.info}>
          No hospitals registered yet.
        </MessageBar>
      )}

      {/* Data Table */}
      {hospitals.length > 0 && (
        <HospitalTable hospitals={hospitals} />
      )}

      {/* Create Form */}
      {showForm && (
        <HospitalForm
          onSuccess={() => {
            setShowForm(false);
            fetchHospitals();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </Stack>
  );
}
