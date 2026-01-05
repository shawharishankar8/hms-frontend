import {
    Stack,
    Text,
    TextField,
    PrimaryButton,
    MessageBar,
} from "@fluentui/react";
import { useState, useEffect } from "react";
import { registerApi } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";

const cardStyles = {
    root: {
        background: "#FFFFFF",
        padding: "40px 60px",
        borderRadius: "24px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
        width: "100%",
        maxWidth: "450px",
    },
};

const inputStyles = {
    fieldGroup: {
        borderRadius: "8px",
        border: "1px solid #E1E1E1",
        height: "45px",
        background: "#F9FAFB",
        transition: "border-color 0.2s ease",
    },
    field: {
        fontSize: "14px",
        lineHeight: "20px",
    },
    errorMessage: {
        marginTop: "4px",
        fontSize: "12px",
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
    maxWidth: '550px',
    height: 'auto',
    filter: 'drop-shadow(0 0 20px rgba(0, 194, 255, 0.3)) drop-shadow(0 0 35px rgba(0, 194, 255, 0.15))',
    borderRadius: '12px',
    transition: 'filter 0.3s ease',
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
    };

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = "The name cannot be empty";
        } else if (formData.name.trim().length < 3) {
            newErrors.name = "Name must be at least 3 characters";
        } else if (formData.name.trim().length > 50) {
            newErrors.name = "Name cannot exceed 50 characters";
        } else if (!VALIDATION_PATTERNS.name.test(formData.name.trim())) {
            newErrors.name = "Name can only contain alphabets and spaces";
        }

        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = "Username cannot be empty";
        } else if (formData.username.trim().length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        } else if (formData.username.trim().length > 50) {
            newErrors.username = "Username cannot exceed 50 characters";
        } else if (!VALIDATION_PATTERNS.username.test(formData.username.trim())) {
            newErrors.username = "Username can contain only letters, numbers and @";
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "Password cannot be empty";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        } else if (!VALIDATION_PATTERNS.password.test(formData.password)) {
            newErrors.password = "Password must contain: 1 uppercase, 1 lowercase, 1 number, and 1 special character";
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
            }

            setMessage({
                type: "error",
                text: errorMessage
            });
        } finally {
            setIsSubmitting(false);
        }
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
            <Stack styles={{ root: { position: 'absolute', top: 40, left: 60 } }} horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
                <div style={{ width: 24, height: 24, backgroundColor: '#00C2FF', borderRadius: 6 }} />
                <Text variant="large" styles={{ root: { fontWeight: 700, color: '#1A1C1E' } }}>HMS</Text>
            </Stack>

            <Stack
                horizontal
                verticalAlign="center"
                tokens={{ childrenGap: 100 }}
                styles={{ root: { width: '100%', maxWidth: '1200px' } }}
            >
                <Stack styles={cardStyles}>
                    <form onSubmit={onSubmit}>
                        <Stack tokens={{ childrenGap: 32 }}>
                            <Text variant="xxLarge" styles={{
                                root: {
                                    textAlign: 'center',
                                    fontWeight: 700,
                                    marginBottom: 8,
                                }
                            }}>
                                Register
                            </Text>

                            <Text variant="small" styles={{
                                root: {
                                    textAlign: 'center',
                                    color: '#605e5c',
                                    marginBottom: 16,
                                }
                            }}>
                                Create your account to get started
                            </Text>

                            {/* Name Field - CONTROLLED */}
                            <Stack tokens={{ childrenGap: 4 }}>
                                <TextField
                                    placeholder="Full Name (e.g., John Doe)"
                                    value={formData.name}
                                    onChange={(e, value) => handleInputChange('name', value)}
                                    errorMessage={errors.name}
                                    required
                                    styles={{
                                        ...inputStyles,
                                        root: {
                                            width: '100%',
                                        }
                                    }}
                                    iconProps={{ iconName: 'Contact' }}
                                    onKeyDown={(e) => {
                                        // Debug key presses
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                                <Text variant="small" styles={{
                                    root: {
                                        color: '#605e5c',
                                        fontSize: '11px',
                                        lineHeight: '14px',
                                        marginTop: '4px',
                                        paddingLeft: '4px',
                                    }
                                }}>
                                    Letters and spaces only, 3-50 characters
                                </Text>
                            </Stack>

                            {/* Username Field - CONTROLLED */}
                            <Stack tokens={{ childrenGap: 4 }}>
                                <TextField
                                    placeholder="Username (e.g., johndoe@123)"
                                    value={formData.username}
                                    onChange={(e, value) => handleInputChange('username', value)}
                                    errorMessage={errors.username}
                                    required
                                    styles={{
                                        ...inputStyles,
                                        root: {
                                            width: '100%',
                                        }
                                    }}
                                    iconProps={{ iconName: 'Contact' }}
                                />
                                <Text variant="small" styles={{
                                    root: {
                                        color: '#605e5c',
                                        fontSize: '11px',
                                        lineHeight: '14px',
                                        marginTop: '4px',
                                        paddingLeft: '4px',
                                    }
                                }}>
                                    Letters, numbers, @ only. No spaces. 3-50 characters
                                </Text>
                            </Stack>

                            {/* Password Field - CONTROLLED */}
                            <Stack tokens={{ childrenGap: 4 }}>
                                <TextField
                                    placeholder="Password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e, value) => handleInputChange('password', value)}
                                    errorMessage={errors.password}
                                    required
                                    canRevealPassword
                                    styles={{
                                        ...inputStyles,
                                        root: {
                                            width: '100%',
                                        }
                                    }}
                                    iconProps={{ iconName: 'Lock' }}
                                />
                                <Text variant="small" styles={{
                                    root: {
                                        color: '#605e5c',
                                        fontSize: '11px',
                                        lineHeight: '14px',
                                        marginTop: '4px',
                                        paddingLeft: '4px',
                                    }
                                }}>
                                    8+ characters with: uppercase, lowercase, number, special character (@$!%*?&)
                                </Text>
                            </Stack>

                            {/* Confirm Password Field - CONTROLLED */}
                            <Stack tokens={{ childrenGap: 4 }}>
                                <TextField
                                    placeholder="Confirm Password"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e, value) => handleInputChange('confirmPassword', value)}
                                    errorMessage={errors.confirmPassword}
                                    required
                                    canRevealPassword
                                    styles={{
                                        ...inputStyles,
                                        root: {
                                            width: '100%',
                                        }
                                    }}
                                    iconProps={{ iconName: 'Lock' }}
                                />
                            </Stack>

                            {/* Submit Button */}
                            <PrimaryButton
                                text={isSubmitting ? "Creating Account..." : "Register"}
                                type="submit"
                                disabled={isSubmitting}
                                styles={{
                                    root: {
                                        height: 50,
                                        borderRadius: 12,
                                        backgroundColor: '#000829',
                                        border: 'none',
                                        marginTop: 8,
                                        ':hover': {
                                            backgroundColor: '#001950',
                                        },
                                        ':disabled': {
                                            backgroundColor: '#e1e1e1',
                                        }
                                    }
                                }}
                            />

                            {/* Login Link */}
                            <Text styles={{
                                root: {
                                    textAlign: 'center',
                                    fontSize: 13,
                                    marginTop: 8,
                                }
                            }}>
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    style={{
                                        color: '#005FB8',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        ':hover': {
                                            textDecoration: 'underline',
                                        }
                                    }}
                                >
                                    Login here
                                </Link>
                            </Text>

                            {/* Success/Error Messages */}
                            {message && (
                                <MessageBar
                                    messageBarType={message.type === "error" ? 1 : 0}
                                    styles={{
                                        root: {
                                            marginTop: 16,
                                            borderRadius: 6,
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

                {/* Image Container */}
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