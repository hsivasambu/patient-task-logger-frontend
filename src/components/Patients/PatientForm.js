// src/components/Patients/PatientForm.js
// Form component for adding/editing patients

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import {
  ArrowBack,
  Save,
  Person,
  LocalHospital,
  Room,
  CalendarToday,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { patientsAPI, handleApiError } from "../../services/api";

const PatientForm = ({ mode = "create" }) => {
  // mode: 'create' or 'edit'
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    medicalRecordNumber: "",
    roomNumber: "",
    dateOfBirth: "",
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === "edit");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Load patient data for editing
  useEffect(() => {
    if (mode === "edit" && id) {
      loadPatient();
    }
  }, [mode, id]);

  const loadPatient = async () => {
    try {
      setInitialLoading(true);
      const response = await patientsAPI.getById(id);
      const patient = response.patient;

      setFormData({
        firstName: patient.first_name || "",
        lastName: patient.last_name || "",
        medicalRecordNumber: patient.medical_record_number || "",
        roomNumber: patient.room_number || "",
        dateOfBirth: patient.date_of_birth
          ? patient.date_of_birth.split("T")[0]
          : "",
      });
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setInitialLoading(false);
    }
  };

  // Handle form input changes
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

    // Clear general error/success messages
    setError(null);
    setSuccess(null);
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!formData.medicalRecordNumber.trim()) {
      errors.medicalRecordNumber = "Medical record number is required";
    }

    // Optional but validate format if provided
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();

      if (birthDate > today) {
        errors.dateOfBirth = "Date of birth cannot be in the future";
      }

      const maxAge = new Date();
      maxAge.setFullYear(maxAge.getFullYear() - 150);
      if (birthDate < maxAge) {
        errors.dateOfBirth = "Please enter a valid date of birth";
      }
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
      setLoading(true);
      setError(null);

      if (mode === "create") {
        await patientsAPI.create(formData);
        setSuccess("Patient created successfully!");

        // Reset form for another entry
        setFormData({
          firstName: "",
          lastName: "",
          medicalRecordNumber: "",
          roomNumber: "",
          dateOfBirth: "",
        });

        // Navigate to patient list after brief delay
        setTimeout(() => {
          navigate("/patients");
        }, 2000);
      } else {
        await patientsAPI.update(id, formData);
        setSuccess("Patient updated successfully!");

        // Navigate back after brief delay
        setTimeout(() => {
          navigate("/patients");
        }, 2000);
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);

      // Handle specific validation errors from server
      if (err.response?.data?.errors) {
        const serverErrors = {};
        err.response.data.errors.forEach((error) => {
          serverErrors[error.param] = error.msg;
        });
        setValidationErrors(serverErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate next MRN suggestion (simple implementation)
  const generateMRN = () => {
    const timestamp = Date.now().toString().slice(-6);
    const hospitalPrefix = user?.hospital_id ? `H${user.hospital_id}` : "H1";
    return `${hospitalPrefix}-${timestamp}`;
  };

  if (initialLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading patient data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
        <IconButton onClick={() => navigate("/patients")} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" gutterBottom>
            {mode === "create" ? "Add New Patient" : "Edit Patient"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {mode === "create"
              ? "Enter patient information to create a new record"
              : "Update patient information"}
          </Typography>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Form */}
      <Paper sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Person sx={{ mr: 1 }} />
                    Personal Information
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        error={!!validationErrors.firstName}
                        helperText={validationErrors.firstName}
                        disabled={loading}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        error={!!validationErrors.lastName}
                        helperText={validationErrors.lastName}
                        disabled={loading}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        error={!!validationErrors.dateOfBirth}
                        helperText={validationErrors.dateOfBirth || "Optional"}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          startAdornment: (
                            <CalendarToday
                              sx={{ mr: 1, color: "action.active" }}
                            />
                          ),
                        }}
                        disabled={loading}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Medical Information */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <LocalHospital sx={{ mr: 1 }} />
                    Medical Information
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Medical Record Number"
                        name="medicalRecordNumber"
                        value={formData.medicalRecordNumber}
                        onChange={handleChange}
                        error={!!validationErrors.medicalRecordNumber}
                        helperText={
                          validationErrors.medicalRecordNumber ||
                          "Unique identifier for this patient"
                        }
                        disabled={loading}
                        InputProps={{
                          endAdornment: mode === "create" && (
                            <Button
                              size="small"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  medicalRecordNumber: generateMRN(),
                                }))
                              }
                            >
                              Generate
                            </Button>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Room Number"
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleChange}
                        error={!!validationErrors.roomNumber}
                        helperText={
                          validationErrors.roomNumber ||
                          "Optional - current room assignment"
                        }
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <Room sx={{ mr: 1, color: "action.active" }} />
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Form Actions */}
          <Box
            sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/patients")}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              disabled={loading}
            >
              {loading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                ? "Create Patient"
                : "Update Patient"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default PatientForm;
