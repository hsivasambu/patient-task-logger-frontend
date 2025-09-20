// src/components/Auth/Login.js
// Login form component with Material-UI

import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { LocalHospital, Login as LoginIcon } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";

// System Design Concepts:
// - Form validation and error handling
// - User experience considerations
// - Security best practices (no password visibility toggle by default)
// - Responsive design

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, isAuthenticated, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Basic form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await login(formData);
      // Navigation handled by useEffect above
    } catch (err) {
      // Error is handled by the auth context
      console.error("Login error:", err);
    }
  };

  // Demo credentials helper
  const fillDemoCredentials = (role) => {
    if (role === "admin") {
      setFormData({
        email: "admin@clinic.com",
        password: "admin123",
      });
    } else {
      setFormData({
        email: "clinician@clinic.com",
        password: "password123",
      });
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <LocalHospital
              sx={{ fontSize: 40, color: "primary.main", mr: 1 }}
            />
            <Typography component="h1" variant="h4" color="primary">
              Patient Tracker
            </Typography>
          </Box>

          <Typography component="h2" variant="h5" sx={{ mb: 3 }}>
            Sign In
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              disabled={isLoading}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              disabled={isLoading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isLoading}
              startIcon={
                isLoading ? <CircularProgress size={20} /> : <LoginIcon />
              }
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </Box>

          {/* Demo Credentials */}
          <Divider sx={{ width: "100%", my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Demo Credentials
            </Typography>
          </Divider>

          <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => fillDemoCredentials("admin")}
              disabled={isLoading}
            >
              Admin Demo
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => fillDemoCredentials("clinician")}
              disabled={isLoading}
            >
              Clinician Demo
            </Button>
          </Box>

          {/* Register Link */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: "#1976d2",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Register here
              </Link>
            </Typography>
          </Box>

          {/* System Info */}
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Healthcare Management System v1.0
              <br />
              Secure • HIPAA Compliant • Multi-Tenant
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
