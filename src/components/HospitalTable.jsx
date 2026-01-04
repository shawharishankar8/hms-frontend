import { DetailsList, Text } from "@fluentui/react";
import { useNavigate } from "react-router-dom";


export default function HospitalTable({ hospitals }) {
    const navigate = useNavigate();
  const columns = [
    {
      key: "hospitalName",
      name: "Hospital Name",
      fieldName: "hospitalName",
      minWidth: 200,
      onRender: (item) => (
          <span
              style={{ cursor: "pointer", color: "#0078d4" }}
              onClick={() => navigate(`/hospital/${item.hospitalId}`)}
          >
          {item.hospitalName}
        </span>
      ),
    },
    {
      key: "hospitalCode",
      name: "Hospital Code",
      fieldName: "hospitalCode",
      minWidth: 120,
    },
    {
      key: "hospitalAddress",
      name: "Address",
      fieldName: "hospitalAddress",
      minWidth: 300,
    },
  ];

  return (
    <>
      <Text variant="mediumPlus">Registered Hospitals</Text>
      <DetailsList items={hospitals} columns={columns} />
    </>
  );
}
