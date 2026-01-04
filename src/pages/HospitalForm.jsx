import { useForm } from "react-hook-form";
import {
  TextField,
  PrimaryButton,
  DefaultButton,
  MessageBar,
} from "@fluentui/react";
import { createHospitalApi } from "../api/hospitalApi";
import { useState } from "react";

export default function HospitalForm({ onSuccess, onCancel }) {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    try {
      await createHospitalApi({
        hospitalName: data.hospitalName,
        hospitalAddress: data.hospitalAddress,
        firstContact: {
          name: data.firstContactName,
          email: data.firstContactEmail,
          contactNumber: data.firstContactNumber,
        },
        secondContact: {
          name: data.secondContactName,
          email: data.secondContactEmail,
          contactNumber: data.secondContactNumber,
        },
      });

      onSuccess();
    } catch {
      setError("Hospital creation failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="Hospital Name"
        {...register("hospitalName", { required: true })}
      />

      <TextField
        label="Hospital Address"
        multiline
        {...register("hospitalAddress", { required: true })}
      />

      <TextField label="First Contact Name" {...register("firstContactName")} />
      <TextField label="First Contact Email" {...register("firstContactEmail")} />
      <TextField
        label="First Contact Number"
        {...register("firstContactNumber")}
      />

      <TextField
        label="Second Contact Name"
        {...register("secondContactName")}
      />
      <TextField
        label="Second Contact Email"
        {...register("secondContactEmail")}
      />
      <TextField
        label="Second Contact Number"
        {...register("secondContactNumber")}
      />

      {error && <MessageBar messageBarType={3}>{error}</MessageBar>}

      <PrimaryButton type="submit" text="Save" />
      <DefaultButton text="Cancel" onClick={onCancel} />
    </form>
  );
}
