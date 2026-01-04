import {
  Stack,
  Text,
  TextField,
  PrimaryButton,
  MessageBar,
  IconButton,
  Checkbox,
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
  },
  field: { fontSize: "14px" },
};

// Add these styles for the glowing effect
const imageContainerStyles = {
  root: {
    display: 'none',
    selectors: {
      '@media (min-width: 1024px)': {
        display: 'flex',
        padding: '20px', // Add some padding to see the glow better
      }
    }
  }
};

const glowingImageStyles = {
  width: '100%',
  maxWidth: '550px',
  height: 'auto',
  filter: 'drop-shadow(0 0 20px rgba(0, 194, 255, 0.3)) drop-shadow(0 0 35px rgba(0, 194, 255, 0.15))',
  borderRadius: '12px', // Optional: rounded corners for the glow
  transition: 'filter 0.3s ease',
};

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

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

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      username: data.username,
      password: data.password,
      confirmPassword: data.confirmPassword,
    };

    try {
      await registerApi(payload);
      setMessage({ type: "success", text: "User created successfully" });
      setTimeout(() => navigate("/login"), 1500);
    } catch {
      setMessage({ type: "error", text: "Registration failed" });
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

        <Stack
            horizontal
            verticalAlign="center"
            tokens={{ childrenGap: 100 }}
            styles={{ root: { width: '100%', maxWidth: '1200px' } }}
        >
          <Stack styles={cardStyles}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack tokens={{ childrenGap: 25 }}>
                <Text variant="xxLarge" styles={{ root: { textAlign: 'center', fontWeight: 700 } }}>Register</Text>

                <TextField
                    placeholder="Full Name"
                    {...register("name", {
                      required: "The name cannot be empty",
                      minLength: { value: 3, message: "Name must be at least 3 characters" },
                      maxLength: { value: 50, message: "Name cannot exceed 50 characters" },
                      pattern: {
                        value: /^[A-Za-z]+( [A-Za-z]+)*$/,
                        message: "Name can only contain alphabets and spaces",
                      },
                    })}
                    errorMessage={errors.name?.message}
                    required
                    styles={inputStyles}
                    iconProps={{ iconName: 'Contact' }}
                />

                <TextField
                    placeholder="Username"
                    {...register("username", {
                      required: "Username cannot be empty",
                      minLength: { value: 3, message: "Username must be at least 3 characters" },
                      maxLength: { value: 50, message: "Username cannot exceed 50 characters" },
                      pattern: {
                        value: /^[a-zA-Z0-9@]+$/,
                        message: "Username can contain only letters, numbers and @",
                      },
                    })}
                    errorMessage={errors.username?.message}
                    required
                    styles={inputStyles}
                    iconProps={{ iconName: 'Contact' }}
                />

                <TextField
                    placeholder="Password"
                    type="password"
                    {...register("password", {
                      required: "Password cannot be empty",
                      minLength: { value: 8, message: "Password must be at least 8 characters" },
                      pattern: {
                        value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).*$/,
                        message: "Must contain uppercase, lowercase, number and special character",
                      },
                    })}
                    errorMessage={errors.password?.message}
                    required
                    canRevealPassword
                    styles={inputStyles}
                    iconProps={{ iconName: 'Lock' }}
                />

                <TextField
                    placeholder="Confirm Password"
                    type="password"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) => value === watch("password") || "Passwords do not match",
                    })}
                    errorMessage={errors.confirmPassword?.message}
                    required
                    canRevealPassword
                    styles={inputStyles}
                    iconProps={{ iconName: 'Lock' }}
                />

                <PrimaryButton
                    text="Register"
                    type="submit"
                    styles={{
                      root: {
                        height: 50,
                        borderRadius: 12,
                        backgroundColor: '#000829',
                        border: 'none'
                      }
                    }}
                />

                <Text styles={{ root: { textAlign: 'center', fontSize: 13 } }}>
                  Already have an account? <Link to="/login" style={{ color: '#005FB8', fontWeight: 600 }}>Login here</Link>
                </Text>

                {message && (
                    <MessageBar
                        messageBarType={message.type === "error" ? 1 : 0}
                        styles={{
                          root: {
                            marginTop: 10
                          }
                        }}
                    >
                      {message.text}
                    </MessageBar>
                )}
              </Stack>
            </form>
          </Stack>

          {/* Updated Image Container with Glow Effect */}
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