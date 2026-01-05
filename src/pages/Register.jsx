import {
    Stack,
    Text,
    TextField,
    PrimaryButton,
    MessageBar,
} from "@fluentui/react";
import { useForm } from "react-hook-form";
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
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        trigger,
    } = useForm({
        mode: "onBlur",
    });

    const [message, setMessage] = useState(null);
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

    const handleBlur = async (fieldName) => {
        await trigger(fieldName);
    };

    const validatePassword = (value) => {
        if (!value) return "Password cannot be blank";
        if (value.length < 8) return "Password needs to be at least 8 characters";
        if (!VALIDATION_PATTERNS.password.test(value)) {
            return "Password must contain: 1 uppercase, 1 lowercase, 1 number, and 1 special character";
        }
        return true;
    };

    const validateUsername = (value) => {
        if (!value) return "Username cannot be empty";
        if (value.length < 3) return "Username must be at least 3 characters";
        if (value.length > 50) return "Username cannot exceed 50 characters";
        if (value.startsWith(' ') || value.endsWith(' ')) {
            return "Username should not start or end with spaces";
        }
        if (!VALIDATION_PATTERNS.username.test(value)) {
            return "Username can contain only letters, numbers and @";
        }
        return true;
    };

    const validateName = (value) => {
        if (!value) return "The name cannot be empty";
        if (value.length < 3) return "Name must be at least 3 characters";
        if (value.length > 50) return "Name cannot exceed 50 characters";
        if (!VALIDATION_PATTERNS.name.test(value)) {
            return "Name can only contain alphabets and spaces";
        }
        return true;
    };

    const onSubmit = async (data) => {
        setMessage(null);

        console.log('Form data:', {
            name: data.name,
            username: data.username,
            nameLength: data.name?.length,
            usernameLength: data.username?.length,
        });

        // NO TRIMMING - send exactly what user typed
        const payload = {
            name: data.name,        // NO .trim()
            username: data.username, // NO .trim()
            password: data.password,
            confirmPassword: data.confirmPassword,
        };

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
                    <form onSubmit={handleSubmit(onSubmit)}>
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

                            {/* Name Field */}
                            <Stack tokens={{ childrenGap: 4 }}>
                                <TextField
                                    placeholder="Full Name (e.g., John Doe)"
                                    {...register("name", {
                                        required: "The name cannot be empty",
                                        validate: validateName,
                                    })}
                                    onBlur={() => handleBlur("name")}
                                    errorMessage={errors.name?.message}
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
                                    Letters and spaces only, 3-50 characters
                                </Text>
                            </Stack>

                            {/* Username Field */}
                            <Stack tokens={{ childrenGap: 4 }}>
                                <TextField
                                    placeholder="Username (e.g., johndoe@123)"
                                    {...register("username", {
                                        required: "Username cannot be empty",
                                        validate: validateUsername,
                                    })}
                                    onBlur={() => handleBlur("username")}
                                    errorMessage={errors.username?.message}
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

                            {/* Password Field */}
                            <Stack tokens={{ childrenGap: 4 }}>
                                <TextField
                                    placeholder="Password"
                                    type="password"
                                    {...register("password", {
                                        required: "Password cannot be empty",
                                        validate: validatePassword,
                                    })}
                                    onBlur={() => handleBlur("password")}
                                    errorMessage={errors.password?.message}
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

                            {/* Confirm Password Field */}
                            <Stack tokens={{ childrenGap: 4 }}>
                                <TextField
                                    placeholder="Confirm Password"
                                    type="password"
                                    {...register("confirmPassword", {
                                        required: "Please confirm your password",
                                        validate: (value) => {
                                            if (!value) return "Please confirm your password";
                                            if (value !== watch("password")) {
                                                return "Passwords do not match";
                                            }
                                            return true;
                                        },
                                    })}
                                    onBlur={() => handleBlur("confirmPassword")}
                                    errorMessage={errors.confirmPassword?.message}
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