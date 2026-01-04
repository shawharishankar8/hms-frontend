import {
  Stack,
  Text,
  TextField,
  PrimaryButton,
  MessageBar,
  IconButton,
  Checkbox,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      username: e.target.username.value,
      password: e.target.password.value,
    };

    try {
      const res = await loginApi(payload);
      login(res.data);
      navigate("/hospital");
    } catch {
      setError("Invalid credentials");
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
        <Stack styles={{ root: { position: 'absolute', top: 40, left: 60 } }} horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
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
            <form onSubmit={handleSubmit}>
              <Stack tokens={{ childrenGap: 25 }}>
                <Text variant="xxLarge" styles={{ root: { textAlign: 'center', fontWeight: 700 } }}>Create an account</Text>
                <Text variant="xLarge" styles={{ root: { textAlign: 'center', fontWeight: 500 } }}>LogIn to get access</Text>

                <TextField
                    name="username"
                    placeholder="Email or Username"
                    required
                    styles={inputStyles}
                    iconProps={{ iconName: 'Contact' }}
                />

                <TextField
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                    canRevealPassword
                    styles={inputStyles}
                    iconProps={{ iconName: 'Lock' }}
                />

                <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                  <Checkbox label="Remember Password" styles={{ text: { fontSize: 12 } }} />
                  <Link to="/forgot" style={{ fontSize: 12, color: '#000', fontWeight: 600, textDecoration: 'none' }}>Forgot Password?</Link>
                </Stack>

                <PrimaryButton
                    text="Login"
                    type="submit"
                    styles={{
                      root: {
                        height: 50,
                        borderRadius: 12,
                        backgroundColor: '#000829', // Dark navy from image
                        border: 'none'
                      }
                    }}
                />

                <Text styles={{ root: { textAlign: 'center', fontSize: 13 } }}>
                  Don't have an account yet? <Link to="/register" style={{ color: '#005FB8', fontWeight: 600 }}>Register with us</Link>
                </Text>

                {error && <MessageBar messageBarType={1}>{error}</MessageBar>}
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