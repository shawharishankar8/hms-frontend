import {
  Stack,
  Text,
  TextField,
  PrimaryButton,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
import { useState, useEffect } from "react";
import { loginApi } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";
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
  },
  field: { fontSize: "14px" },
};

export default function Login() {
  const { login } = useAuth();
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
      errors.username = "Email or username is required";
      isValid = false;
    }

    if (!password || password.trim() === '') {
      errors.password = "Password is required";
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
      const res = await loginApi({ username, password });
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
        <Stack styles={{ root: { position: 'absolute', top: 40, left: 60 } }} horizontal verticalAlign="center" tokens={{ childrenGap: 4 }}>
          <div style={{ width: 24, height: 24, backgroundColor: '#00C2FF', borderRadius: 6 }} />
          <Text variant="large" styles={{ root: { fontWeight: 700, color: '#1A1C1E' } }}>HMS</Text>
        </Stack>

        {/* Main Content Layout */}
        <Stack
            horizontal
            verticalAlign="center"
            tokens={{ childrenGap: 100 }}
            styles={{ root: { width: '100%', maxWidth: '1200px' } }}
        >

          {/* LEFT SIDE: Login Card */}
          <Stack styles={cardStyles}>
            <form onSubmit={handleSubmit} noValidate>
              <Stack tokens={{ childrenGap: 10 }}>
                <Text variant="xxLarge" styles={{ root: { textAlign: 'center', fontWeight: 500, marginBottom: 0 } }}>Welcome Back</Text>
                <Text variant="xLarge" styles={{ root: { textAlign: 'center', fontWeight: 300, marginTop: 0, fontSize: 20 } }}>Log In to get access</Text>

                <div style={{ minHeight: 30 }}>
                  {error && (
                      <MessageBar
                          messageBarType={MessageBarType.error}
                          styles={{ root: { borderRadius: 8 } }}
                          onDismiss={() => setError(null)}
                      >
                        {error}
                      </MessageBar>
                  )}
                </div>
                {/* Reserve space for error messages without shifting layout */}
                <Stack tokens={{ childrenGap: 10 }} styles={{ root: { position: 'relative', minHeight: 160 } }}>

                  {/* Error container at the top */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    minHeight: 60
                  }}>

                  </div>

                  {/* Username field with reserved space for error */}
                  <div style={{ minHeight: 80 }}>
                    <TextField
                        name="username"
                        placeholder="Email or Username"
                        required
                        styles={{
                          ...inputStyles,
                          fieldGroup: fieldErrors.username ? {
                            ...inputStyles.fieldGroup,
                            borderColor: '#a4262c'
                          } : inputStyles.fieldGroup
                        }}
                        errorMessage={fieldErrors.username}
                        onChange={() => handleInputChange('username')}
                    />
                  </div>

                  {/* Password field with reserved space for error */}
                  <div style={{ minHeight: 80 }}>
                    <TextField
                        name="password"
                        type="password"
                        placeholder="Password"
                        required
                        canRevealPassword
                        styles={{
                          ...inputStyles,
                          fieldGroup: fieldErrors.password ? {
                            ...inputStyles.fieldGroup,
                            borderColor: '#a4262c'
                          } : inputStyles.fieldGroup
                        }}
                        errorMessage={fieldErrors.password}
                        onChange={() => handleInputChange('password')}
                    />
                  </div>

                  {/* Login Button */}
                  <PrimaryButton
                      text="Login"
                      type="submit"
                      styles={{
                        root: {
                          height: 50,
                          width: '65%',
                          alignSelf: 'center',
                          borderRadius: 12,
                          backgroundColor: '#005FB8',
                          ':hover': {
                            backgroundColor: '#001950',
                          },
                          border: 'none',
                          marginTop: 20
                        }
                      }}
                  />
                </Stack>

                <Text styles={{ root: { textAlign: 'center', fontSize: 13, marginTop: 20 } }}>
                  Don't have an account yet? <Link to="/register" style={{ color: '#005FB8', fontWeight: 600 }}>Register with us</Link>
                </Text>
              </Stack>
            </form>
          </Stack>

          {/* RIGHT SIDE: Hero Illustration */}
          <Stack styles={{ root: { display: 'none', selectors: { '@media (min-width: 1024px)': { display: 'flex' } } } }}>
            <img
                src="/Login_page.jpg"
                alt="Medical Hero Illustration"
                style={{ width: '100%', maxWidth: '550px', height: 'auto' }}
            />
          </Stack>
        </Stack>
      </Stack>
  );
}