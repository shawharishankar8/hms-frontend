import {
    Stack,
    Text,
    TextField,
    PrimaryButton,
    MessageBar,
    MessageBarType,
    Label,
} from "@fluentui/react";
import { useState, useEffect } from "react";
import { loginApi } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

const cardStyles = {
    root: {
        background: "#FFFFFF",
        padding: "20px 40px",
        borderRadius: "24px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
        width: "100%",
        maxWidth: "450px",
    },
};

// Updated styles to match HospitalForm
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

// Error state styles
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

export default function Login() {
    const {login} = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({
        username: '',
        password: ''
    });

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

    const validateForm = (username, password) => {
        const errors = {};
        let isValid = true;

        if (!username || username.trim() === '') {
            errors.username = "Username is required";
            isValid = false;
        } else if (username.trim().length < 3) {
            errors.username = "Minimum 3 characters required";
            isValid = false;
        }

        if (!password || password.trim() === '') {
            errors.password = "Password is required";
            isValid = false;
        } else if (password.trim().length < 6) {
            errors.password = "Minimum 6 characters required";
            isValid = false;
        }

        setFieldErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const username = e.target.username.value;
        const password = e.target.password.value;

        // Clear previous errors
        setError(null);

        // Validate fields
        if (!validateForm(username, password)) {
            return;
        }

        try {
            const res = await loginApi({username, password});
            login(res.data);
            navigate("/hospital");
        } catch {
            setError("Invalid credentials");
        }
    };

    const handleInputChange = (fieldName) => {
        // Clear field error when user starts typing
        if (fieldErrors[fieldName]) {
            setFieldErrors(prev => ({
                ...prev,
                [fieldName]: ''
            }));
        }
        // Clear general error when user modifies any field
        if (error) {
            setError(null);
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
                },
            }}
        >
            <Stack styles={{root: {position: 'absolute', top: 40, left: 60}}} horizontal verticalAlign="center"
                   tokens={{childrenGap: 4}}>
                <div style={{width: 24, height: 24, backgroundColor: '#00C2FF', borderRadius: 6}}/>
                <Text variant="large" styles={{root: {fontWeight: 700, color: '#1A1C1E'}}}>HMS</Text>
            </Stack>

            {/* Main Content Layout */}
            <Stack
                horizontal
                verticalAlign="center"
                tokens={{childrenGap: 60}}
                styles={{root: {width: '100%', maxWidth: '1200px'}}}
            >

                {/* LEFT SIDE: Login Card */}
                <Stack styles={cardStyles}>
                    <form onSubmit={handleSubmit} noValidate>
                        <Stack tokens={{childrenGap: 10}}>
                            <Text variant="xxLarge"
                                  styles={{root: {textAlign: 'center', fontWeight: 500, marginBottom: 0}}}>Welcome
                                Back</Text>
                            <Text variant="xLarge"
                                  styles={{root: {textAlign: 'center', fontWeight: 300, marginTop: 0, fontSize: 20}}}>Log
                                In to get access</Text>

                            {/* Error Message */}
                            <div style={{minHeight: 30}}>
                                {error && (
                                    <MessageBar
                                        messageBarType={MessageBarType.error}
                                        styles={{root: {borderRadius: 8}}}
                                        onDismiss={() => setError(null)}
                                    >
                                        {error}
                                    </MessageBar>
                                )}
                            </div>

                            {/* Login Form Fields */}
                            <Stack tokens={{childrenGap: 16}}>

                                {/* Username field - Matching HospitalForm style */}
                                <div style={{minHeight: '72px'}}>
                                    <Label
                                        required
                                        styles={{
                                            root: {
                                                fontWeight: 600,
                                                fontSize: '14px',
                                                marginBottom: '4px',
                                                color: '#323130',
                                                padding: '0'
                                            }
                                        }}
                                    >
                                        Username
                                    </Label>
                                    <TextField
                                        name="username"
                                        placeholder="Enter your username"

                                        styles={{
                                            root: {width: '100%', marginBottom: 2},
                                            fieldGroup: [
                                                inputStyles.fieldGroup,
                                                fieldErrors.username && errorFieldStyles.fieldGroup
                                            ],
                                            field: inputStyles.field,
                                        }}
                                        errorMessage={fieldErrors.username}
                                        onChange={() => handleInputChange('username')}
                                    />
                                    {/* Manual error display to match HospitalForm */}

                                </div>

                                {/* Password field - Matching HospitalForm style */}
                                <div style={{minHeight: '72px'}}>
                                    <Label
                                        required
                                        styles={{
                                            root: {
                                                fontWeight: 600,
                                                fontSize: '14px',
                                                marginBottom: '8px',
                                                color: '#323130',
                                                padding: '0'
                                            }
                                        }}
                                    >
                                        Password
                                    </Label>
                                    <TextField
                                        name="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        canRevealPassword
                                        styles={{
                                            root: {width: '100%', marginBottom: 6},
                                            fieldGroup: [
                                                inputStyles.fieldGroup,
                                                fieldErrors.password && errorFieldStyles.fieldGroup
                                            ],
                                            field: inputStyles.field,
                                            revealButton: {
                                                height: '30px',
                                                width: '30px',
                                                backgroundColor: 'transparent',
                                                selectors: {
                                                    ':hover': {
                                                        backgroundColor: '#f3f2f1'
                                                    }
                                                }
                                            }
                                        }}
                                        errorMessage={fieldErrors.password}
                                        onChange={() => handleInputChange('password')}
                                    />
                                    {/* Manual error display to match HospitalForm */}
                                </div>

                                {/* Login Button */}
                                <PrimaryButton
                                    text="Login"
                                    type="submit"
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
                                            marginTop: 16,
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

                            <Text styles={{root: {textAlign: 'center', fontSize: 13, marginTop: 20}}}>
                                Don't have an account yet? <Link to="/register"
                                                                 style={{color: '#005FB8', fontWeight: 600}}>Register
                                with us</Link>
                            </Text>
                        </Stack>
                    </form>
                </Stack>

                {/* RIGHT SIDE: Hero Illustration */}
                <Stack styles={{root: {display: 'none', selectors: {'@media (min-width: 1024px)': {display: 'flex'}}}}}>
                    <img
                        src="/Login_page.jpg"
                        alt="Medical Hero Illustration"
                        style={{width: '100%', maxWidth: '550px', height: 'auto'}}
                    />
                </Stack>
            </Stack>
        </Stack>
    );
}
