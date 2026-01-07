import { useForm, Controller } from "react-hook-form";
import {
    Stack,
    Text,
    TextField,
    PrimaryButton,
    DefaultButton,
    MessageBar,
    MessageBarType,
    Label,
} from "@fluentui/react";
import { createHospitalApi, updateHospitalApi } from "../api/hospitalApi";
import { useState, useEffect } from "react";

export default function HospitalForm({ hospital, mode = 'create', onSuccess, onCancel }) {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            hospitalName: '',
            hospitalAddress: '',
            firstContactName: '',
            firstContactEmail: '',
            firstContactNumber: '',
            secondContactName: '',
            secondContactEmail: '',
            secondContactNumber: '',
        }
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Pre-fill form if in edit mode
    useEffect(() => {
        if (mode === 'edit' && hospital) {
            const formValues = {
                hospitalName: hospital.name || '',
                hospitalAddress: hospital.address || '',
                firstContactName: '',
                firstContactEmail: '',
                firstContactNumber: '',
                secondContactName: '',
                secondContactEmail: '',
                secondContactNumber: '',
            };

            // Set primary contact (contactType = 0)
            const primaryContact = hospital.contacts?.find(c => c.contactType === 0);
            if (primaryContact) {
                formValues.firstContactName = primaryContact.name || '';
                formValues.firstContactEmail = primaryContact.email || '';
                formValues.firstContactNumber = primaryContact.phone || '';
            }

            // Set secondary contact (contactType = 1)
            const secondaryContact = hospital.contacts?.find(c => c.contactType === 1);
            if (secondaryContact) {
                formValues.secondContactName = secondaryContact.name || '';
                formValues.secondContactEmail = secondaryContact.email || '';
                formValues.secondContactNumber = secondaryContact.phone || '';
            }

            reset(formValues);
        }
    }, [hospital, mode, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);

        try {
            const payload = {
                hospitalName: data.hospitalName,
                hospitalAddress: data.hospitalAddress,
                firstContact: {
                    name: data.firstContactName || '',
                    email: data.firstContactEmail || '',
                    contactNumber: data.firstContactNumber || '',
                },
                secondContact: {
                    name: data.secondContactName || '',
                    email: data.secondContactEmail || '',
                    contactNumber: data.secondContactNumber || '',
                },
            };

            if (mode === 'edit' && hospital) {
                await updateHospitalApi(hospital.id, payload);
            } else {
                await createHospitalApi(payload);
            }

            onSuccess();
        } catch (err) {
            console.error('Form submission error:', err);
            setError(mode === 'edit' ? "Failed to update hospital" : "Failed to create hospital");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack
            styles={{
                root: {
                    backgroundColor: 'white',
                    padding: 24,
                    borderRadius: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    maxWidth: 600,
                    margin: '0 auto',
                    width: '100%'
                }
            }}
            tokens={{ childrenGap: 12 }}
        >
            <Text variant="xLarge" styles={{ root: { fontWeight: 600, marginBottom: 4 } }}>
                {mode === 'edit' ? 'Edit Hospital' : 'Create New Hospital'}
            </Text>

            {mode === 'edit' && hospital && (
                <Text variant="small" styles={{ root: { color: '#605e5c', marginBottom: 12 } }}>
                    Hospital Code: {hospital.hospitalCode}
                </Text>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack tokens={{ childrenGap: 20}}>
                    {/* Hospital Information */}
                    <Stack tokens={{ childrenGap: 4 }}>
                        <Label styles={{ root: { fontWeight: 600, fontSize: 14,marginBottom:0 } }}>Hospital Information</Label>
                        <div style={{ minHeight: '72px' }}>
                        <Controller
                            name="hospitalName"
                            control={control}
                            rules={{
                                required: "Hospital name is required",
                                minLength: { value: 3, message: "Minimum 3 characters required" }
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Hospital Name"
                                    required
                                    errorMessage={errors.hospitalName?.message}
                                    disabled={loading}
                                    styles={{ root: { width: '100%' ,marginBottom:2} }}
                                />
                            )}
                        />
                        </div>

                        <div style={{ minHeight: '112px' }}>
                            <Controller
                                name="hospitalAddress"
                                control={control}
                                rules={{
                                    required: "Hospital address is required",
                                    minLength: { value: 10, message: "Minimum 10 characters required" }
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Hospital Address"
                                        multiline
                                        rows={3}
                                        required
                                        errorMessage={errors.hospitalAddress?.message}
                                        disabled={loading}
                                        styles={{ root: { width: '100%',marginTop: 0 } }}
                                    />
                                )}
                            />
                        </div>

                    </Stack>

                    {/* Primary Contact */}
                    <Stack tokens={{ childrenGap: 0}} style={{ marginTop: 20 } }>
                        <Label styles={{ root: { fontWeight: 600, fontSize: 14 , marginBottom: 0} }}>Primary Contact</Label>
                        <div style={{ minHeight: '72px' }}>
                            <Controller
                                name="firstContactName"
                                control={control}
                                rules={{ required: "Primary contact name is required" }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Contact Name"
                                        required
                                        errorMessage={errors.firstContactName?.message}
                                        disabled={loading}
                                        styles={{ root: { width: '100%' ,  marginBottom: 4} }}
                                    />
                                )}
                            />
                        </div>

                        <Stack horizontal tokens={{ childrenGap: 16 }}>
                            <Controller
                                name="firstContactEmail"
                                control={control}
                                rules={{
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Email"
                                        type="email"
                                        required
                                        errorMessage={errors.firstContactEmail?.message}
                                        disabled={loading}
                                        styles={{ root: { flex: 1 } }}
                                    />
                                )}
                            />

                            <Controller
                                name="firstContactNumber"
                                control={control}
                                rules={{
                                    required: "Phone number is required",
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: "Must be 10 digits"
                                    }
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Phone Number"
                                        required
                                        errorMessage={errors.firstContactNumber?.message}
                                        disabled={loading}
                                        styles={{ root: { flex: 1 } }}
                                    />
                                )}
                            />
                        </Stack>
                    </Stack>

                    {/* Secondary Contact */}
                    <Stack tokens={{ childrenGap: 0 }} style={{ marginTop: 20 }}>
                        <Label styles={{ root: { fontWeight: 600, fontSize: 14,marginBottom:0 } }}>Secondary Contact (Optional)</Label>
                        <Controller
                            name="secondContactName"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Contact Name"
                                    disabled={loading}
                                    styles={{ root: { width: '100%',   marginBottom: 4  } }}
                                />
                            )}
                        />

                        <Stack horizontal tokens={{ childrenGap: 16 }}>
                            <Controller
                                name="secondContactEmail"
                                control={control}
                                rules={{
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Email"
                                        type="email"
                                        errorMessage={errors.secondContactEmail?.message}
                                        disabled={loading}
                                        styles={{ root: { flex: 1 } }}
                                    />
                                )}
                            />

                            <Controller
                                name="secondContactNumber"
                                control={control}
                                rules={{
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: "Must be 10 digits"
                                    }
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Phone Number"
                                        errorMessage={errors.secondContactNumber?.message}
                                        disabled={loading}
                                        styles={{ root: { flex: 1 } }}
                                    />
                                )}
                            />
                        </Stack>
                    </Stack>

                    {/* Error Message */}
                    {error && (
                        <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setError(null)}>
                            {error}
                        </MessageBar>
                    )}

                    {/* Action Buttons */}
                    <Stack horizontal tokens={{ childrenGap: 8 }} horizontalAlign="end" style={{ marginTop: 24 }}>
                        <DefaultButton
                            text="Cancel"
                            onClick={onCancel}
                            disabled={loading}
                            styles={{ root: { minWidth: 80 } }}
                        />
                        <PrimaryButton
                            type="submit"
                            text={loading ? "Saving..." : (mode === 'edit' ? 'Save' : 'Create Hospital')}
                            disabled={loading}
                            styles={{
                                root: {
                                    minWidth: 120,
                                    backgroundColor: mode === 'edit' ? '#0078d4' : '#175cb8',
                                    borderColor: mode === 'edit' ? '#0078d4' : '#175cb8',
                                }
                            }}
                        />
                    </Stack>
                </Stack>
            </form>
        </Stack>
    );
}