import {
    Stack,
    Text,
    TextField,
    PrimaryButton,
    MessageBar,
    MessageBarType,
    Label,
    DefaultButton,
} from "@fluentui/react";
import { useState, useEffect } from "react";
import { registerApi } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";

const cardStyles = {
    root: {
        background: "#FFFFFF",
        padding: "24px 32px", // Reduced from 40px 60px
        borderRadius: "12px", // Reduced from 24px
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)", // Lighter shadow
        width: "100%",
        maxWidth: "420px", // Slightly reduced
    },
};

// HospitalForm-like styles
const inputStyles = {
    root: {
        width: '100%',
        marginBottom: 2,
    },
    fieldGroup: {
        height: '32px',
        borderRadius: '2px',
        border: '1px solid rgb(138, 136, 134)',
        backgroundColor: 'transparent',
        transition: 'border-color 0.2s',
        selectors: {
            ':hover': {
                borderColor: 'rgb(50, 49, 48)',
            },
            ':focus': {
                borderColor: 'rgb(0, 120, 212)',
                outline: '1px solid rgb(0, 120, 212)'
            },
            ':focus-within': {
                borderColor: 'rgb(0, 120, 212)'
            },
            '.ms-TextField.is-disabled &': {
                borderColor: 'rgb(225, 223, 221)'
            }
        }
    },
    field: {
        fontSize: '14px',
        lineHeight: '20px',
        color: 'rgb(50, 49, 48)',
        padding: '0 8px'
    },
    label: {
        fontSize: '14px',
        fontWeight: 600,
        color: 'rgb(50, 49, 48)',
        marginBottom: '4px',
        display: 'block',
        padding: '0'
    },
    errorMessage: {
        fontSize: '12px',
        color: '#a4262c',
        marginTop: '2px'
    }
};

// Error state styles (matches HospitalForm error styling)
const errorFieldStyles = {
    fieldGroup: {
        borderColor: '#a4262c !important',
        selectors: {
            ':hover': {
                borderColor: '#a4262c',
            },
            ':focus': {
                borderColor: '#a4262c',
            }
        }
    }
};

const imageContainerStyles = {
    root: {
        display: 'none',
        selectors: {
            '@media (min-width: 1024px)': {
                display: 'flex',
                padding: '20px',
            }
        }
    }
};

const glowingImageStyles = {
    width: '100%',
    maxWidth: '500px', // Reduced slightly
    height: 'auto',
    filter: 'drop-shadow(0 0 15px rgba(0, 194, 255, 0.2))', // Reduced glow
    borderRadius: '8px', // Reduced
};

// Validation patterns matching your backend
const VALIDATION_PATTERNS = {
    name: /^[A-Za-z]+( [A-Za-z]+)*$/,
    username: /^[a-zA-Z0-9@]+$/,
    password: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const prevHtmlOverflow = document.documentElement.style.overflow;
        const prevBodyOverflow = document.body.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        return () => {
            document.documentElement.style.overflow = prevHtmlOverflow;
            document.body.style.overflow = prevBodyOverflow;
        };
    }, []);

    const handleInputChange = (fieldName, value) => {
        console.log(`Field ${fieldName} change:`, value);
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));

        // Clear error for this field
        if (errors[fieldName]) {
            setErrors(prev => ({
                ...prev,
                [fieldName]: ''
            }));
        }

        // Clear any general message
        if (message) {
            setMessage(null);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Name validation (matches HospitalForm pattern)
        if (!formData.name.trim()) {
            newErrors.name = "Full name is required";
        } else if (formData.name.trim().length < 3) {
            newErrors.name = "Minimum 3 characters required";
        } else if (formData.name.trim().length > 50) {
            newErrors.name = "Maximum 50 characters allowed";
        } else if (!VALIDATION_PATTERNS.name.test(formData.name.trim())) {
            newErrors.name = "Name can only contain alphabets and spaces";
        }

        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
        } else if (formData.username.trim().length < 3) {
            newErrors.username = "Minimum 3 characters required";
        } else if (formData.username.trim().length > 50) {
            newErrors.username = "Maximum 50 characters allowed";
        } else if (!VALIDATION_PATTERNS.username.test(formData.username.trim())) {
            newErrors.username = "Username can contain only letters, numbers and @";
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Minimum 8 characters required";
        } else if (!VALIDATION_PATTERNS.password.test(formData.password)) {
            newErrors.password = "Must contain: uppercase, lowercase, number, and special character";
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e) => {
        e?.preventDefault();
        setMessage(null);

        console.log('Form data before validation:', {
            name: formData.name,
            username: formData.username,
            password: formData.password,
            nameLength: formData.name?.length,
            usernameLength: formData.username?.length,
            passwordLength: formData.password?.length,
        });

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        // Send EXACTLY what's in state
        const payload = {
            name: formData.name.trim(),
            username: formData.username.trim(),
            password: formData.password,
            confirmPassword: formData.confirmPassword,
        };

        console.log('Payload being sent:', {
            ...payload,
            nameLength: payload.name?.length,
            usernameLength: payload.username?.length,
            passwordLength: payload.password?.length,
        });

        try {
            const response = await registerApi(payload);
            console.log('Registration successful:', response.data);

            setMessage({
                type: "success",
                text: "User created successfully. Redirecting to login..."
            });
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            console.error('Registration error:', err.response?.data || err);

            let errorMessage = "Registration failed. Please try again.";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.response?.status === 409) {
                errorMessage = "Username already exists. Please choose a different username.";
            } else if (err.response?.status === 400) {
                errorMessage = "Invalid registration data. Please check your inputs.";
            } else if (err.message) {
                errorMessage = err.message;
            }

            setMessage({
                type: "error",
                text: errorMessage
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate("/login");
    };

    return (
        <Stack
            horizontal
            verticalAlign="center"
            horizontalAlign="center"
            styles={{
                root: {
                    height: "100vh",
                    backgroundColor: "#FDFBF7",
                    padding: "20px",
                    overflowY: 'auto',
                },
            }}
        >
            {/* Logo - Made smaller and moved closer to top */}
            <Stack styles={{
                root: {
                    position: 'absolute',
                    top: 24,
                    left: 24,
                    zIndex: 10
                }
            }} horizontal verticalAlign="center" tokens={{ childrenGap: 6 }}>
                <div style={{ width: 20, height: 20, backgroundColor: '#00C2FF', borderRadius: 4 }} />
                <Text variant="medium" styles={{ root: { fontWeight: 700, color: '#1A1C1E', fontSize: '16px' } }}>HMS</Text>
            </Stack>

            <Stack
                horizontal
                verticalAlign="center"
                tokens={{ childrenGap: 80 }} // Reduced from 100
                styles={{ root: { width: '100%', maxWidth: '1100px' } }} // Reduced max width
            >
                <Stack styles={cardStyles}>
                    <form onSubmit={onSubmit} noValidate>
                        <Stack tokens={{ childrenGap: 16 }}> {/* Reduced from 20 */}
                            {/* Header - More compact */}
                            <Stack tokens={{ childrenGap: 4 }}> {/* Reduced spacing */}
                                <Text variant="xLarge" styles={{
                                    root: {
                                        textAlign: 'center',
                                        fontWeight: 600,
                                        color: '#323130',
                                        fontSize: '20px', // Slightly smaller
                                        margin: 0,
                                        padding: 0
                                    }
                                }}>
                                    Register
                                </Text>

                                <Text variant="small" styles={{
                                    root: {
                                        textAlign: 'center',
                                        color: '#605e5c',
                                        fontSize: '12px',
                                        margin: 0,
                                        padding: 0
                                    }
                                }}>
                                    Create your account to get started
                                </Text>
                            </Stack>

                            {/* Fields - Reduced spacing between them */}
                            <Stack tokens={{ childrenGap: 12 }}> {/* Reduced from 20 */}
                                {/* Name Field */}
                                <div style={{ minHeight: '68px' }}> {/* Reduced from 72px */}
                                    <Label
                                        required
                                        styles={{
                                            root: {
                                                fontWeight: 600,
                                                fontSize: '13px', // Slightly smaller
                                                marginBottom: '3px',
                                                color: '#323130',
                                                padding: '0'
                                            }
                                        }}
                                    >
                                        Full Name
                                    </Label>
                                    <TextField
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={(e, value) => handleInputChange('name', value)}
                                        disabled={isSubmitting}
                                        styles={{
                                            root: { width: '100%', marginBottom: 2 },
                                            fieldGroup: [
                                                inputStyles.fieldGroup,
                                                errors.name && errorFieldStyles.fieldGroup
                                            ],
                                            field: inputStyles.field,
                                        }}
                                    />
                                    {errors.name && (
                                        <Text
                                            variant="small"
                                            styles={{
                                                root: {
                                                    color: '#a4262c',
                                                    fontSize: '11px',
                                                    marginTop: '1px',
                                                    display: 'block'
                                                }
                                            }}
                                        >
                                            {errors.name}
                                        </Text>
                                    )}
                                </div>

                                {/* Username Field */}
                                <div style={{ minHeight: '68px' }}>
                                    <Label
                                        required
                                        styles={{
                                            root: {
                                                fontWeight: 600,
                                                fontSize: '13px',
                                                marginBottom: '3px',
                                                color: '#323130',
                                                padding: '0'
                                            }
                                        }}
                                    >
                                        Username
                                    </Label>
                                    <TextField
                                        placeholder="Enter your username"
                                        value={formData.username}
                                        onChange={(e, value) => handleInputChange('username', value)}
                                        disabled={isSubmitting}
                                        styles={{
                                            root: { width: '100%', marginBottom: 2 },
                                            fieldGroup: [
                                                inputStyles.fieldGroup,
                                                errors.username && errorFieldStyles.fieldGroup
                                            ],
                                            field: inputStyles.field,
                                        }}
                                    />
                                    {errors.username && (
                                        <Text
                                            variant="small"
                                            styles={{
                                                root: {
                                                    color: '#a4262c',
                                                    fontSize: '11px',
                                                    marginTop: '1px',
                                                    display: 'block'
                                                }
                                            }}
                                        >
                                            {errors.username}
                                        </Text>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div style={{ minHeight: '68px' }}>
                                    <Label
                                        required
                                        styles={{
                                            root: {
                                                fontWeight: 600,
                                                fontSize: '13px',
                                                marginBottom: '3px',
                                                color: '#323130',
                                                padding: '0'
                                            }
                                        }}
                                    >
                                        Password
                                    </Label>
                                    <TextField
                                        placeholder="Enter your password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e, value) => handleInputChange('password', value)}
                                        canRevealPassword
                                        disabled={isSubmitting}
                                        styles={{
                                            root: { width: '100%', marginBottom: 2 },
                                            fieldGroup: [
                                                inputStyles.fieldGroup,
                                                errors.password && errorFieldStyles.fieldGroup
                                            ],
                                            field: inputStyles.field,
                                            revealButton: {
                                                height: '28px', // Smaller
                                                width: '28px',
                                                backgroundColor: 'transparent',
                                                selectors: {
                                                    ':hover': {
                                                        backgroundColor: '#f3f2f1'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                    {errors.password && (
                                        <Text
                                            variant="small"
                                            styles={{
                                                root: {
                                                    color: '#a4262c',
                                                    fontSize: '11px',
                                                    marginTop: '1px',
                                                    display: 'block'
                                                }
                                            }}
                                        >
                                            {errors.password}
                                        </Text>
                                    )}
                                </div>

                                {/* Confirm Password Field */}
                                <div style={{ minHeight: '68px' }}>
                                    <Label
                                        required
                                        styles={{
                                            root: {
                                                fontWeight: 600,
                                                fontSize: '13px',
                                                marginBottom: '3px',
                                                color: '#323130',
                                                padding: '0'
                                            }
                                        }}
                                    >
                                        Confirm Password
                                    </Label>
                                    <TextField
                                        placeholder="Confirm your password"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e, value) => handleInputChange('confirmPassword', value)}
                                        canRevealPassword
                                        disabled={isSubmitting}
                                        styles={{
                                            root: { width: '100%', marginBottom: 2 },
                                            fieldGroup: [
                                                inputStyles.fieldGroup,
                                                errors.confirmPassword && errorFieldStyles.fieldGroup
                                            ],
                                            field: inputStyles.field,
                                            revealButton: {
                                                height: '28px',
                                                width: '28px',
                                                backgroundColor: 'transparent',
                                                selectors: {
                                                    ':hover': {
                                                        backgroundColor: '#f3f2f1'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                    {errors.confirmPassword && (
                                        <Text
                                            variant="small"
                                            styles={{
                                                root: {
                                                    color: '#a4262c',
                                                    fontSize: '11px',
                                                    marginTop: '1px',
                                                    display: 'block'
                                                }
                                            }}
                                        >
                                            {errors.confirmPassword}
                                        </Text>
                                    )}
                                </div>
                            </Stack>

                            {/* Buttons - More compact */}
                            <Stack horizontal tokens={{ childrenGap: 8 }} horizontalAlign="end" style={{ marginTop: 16 }}>
                                <PrimaryButton
                                    type="submit"
                                    text={isSubmitting ? "Creating..." : "Register"}
                                    disabled={isSubmitting}
                                    styles={{
                                        root: {
                                            height: 36,
                                            width: 'auto', // Auto width
                                            minWidth: 120, // Minimum width
                                            borderRadius: 4,
                                            padding: '8px 32px', // Reduced horizontal padding
                                            backgroundColor: '#0078d4',
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            marginTop: 12,
                                            border: 'none',
                                            display: 'block',
                                            marginLeft: 'auto',
                                            marginRight: 'auto',
                                            selectors: {
                                                ':hover': {
                                                    backgroundColor: '#106ebe',
                                                },
                                                ':active': {
                                                    backgroundColor: '#005a9e',
                                                }
                                            }
                                        }
                                    }}
                                />
                            </Stack>

                            {/* Login Link */}
                            <Text styles={{
                                root: {
                                    textAlign: 'center',
                                    fontSize: '12px',
                                    marginTop: 16,
                                }
                            }}>
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    style={{
                                        color: '#005FB8',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        fontSize: '12px'
                                    }}
                                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                >
                                    Login here
                                </Link>
                            </Text>

                            {/* Success/Error Messages */}
                            {message && (
                                <MessageBar
                                    messageBarType={message.type === "error" ? MessageBarType.error : MessageBarType.success}
                                    styles={{
                                        root: {
                                            marginTop: 12,
                                            borderRadius: 4,
                                            fontSize: '12px'
                                        }
                                    }}
                                    onDismiss={message.type === "error" ? () => setMessage(null) : undefined}
                                >
                                    {message.text}
                                </MessageBar>
                            )}
                        </Stack>
                    </form>
                </Stack>

                {/* Image Container - More compact */}
                <Stack styles={imageContainerStyles}>
                    <img
                        src="/Login_page.jpg"
                        alt="Medical Hero Illustration"
                        style={glowingImageStyles}
                    />
                </Stack>
            </Stack>
        </Stack>
    );
}