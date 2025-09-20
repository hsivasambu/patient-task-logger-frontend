// src/components/Patients/PatientList.js
// Patient management interface with search, filtering, and CRUD operations

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Fab,
} from "@mui/material";
import {
  Search,
  Add,
  Edit,
  Visibility,
  Delete,
  Person,
  Room,
  LocalHospital,
  Warning,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { patientsAPI, handleApiError } from "../../services/api";

const PatientList = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load patients
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientsAPI.getAll();
      setPatients(response.patients || []);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter(
    (patient) =>
      patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.medical_record_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      patient.room_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle patient selection
  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setDialogOpen(true);
  };

  // Navigate to patient details
  const handleViewPatient = (patientId) => {
    navigate(`/patients/${patientId}`);
    setDialogOpen(false);
  };

  // Navigate to edit patient
  const handleEditPatient = (patientId) => {
    navigate(`/patients/${patientId}/edit`);
    setDialogOpen(false);
  };

  // Navigate to add new patient
  const handleAddPatient = () => {
    navigate("/patients/new");
  };

  // Handle delete patient
  const handleDeleteClick = (patient, e) => {
    e.stopPropagation();
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;

    try {
      setDeleteLoading(true);
      await patientsAPI.delete(patientToDelete.id);

      // Remove patient from local state
      setPatients((prevPatients) =>
        prevPatients.filter((p) => p.id !== patientToDelete.id)
      );

      setDeleteDialogOpen(false);
      setPatientToDelete(null);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPatientToDelete(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  if (loading) {
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
          Loading patients...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Patients
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage patient information and records
          </Typography>
        </Box>

        {isAdmin() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddPatient}
            sx={{ ml: 2 }}
          >
            Add Patient
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button onClick={loadPatients} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      )}

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search patients by name, MRN, or room number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Patients Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>MRN</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Date Added</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ py: 4 }}>
                    <Person
                      sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      {searchTerm
                        ? "No patients found matching your search"
                        : "No patients yet"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {isAdmin()
                        ? 'Click "Add Patient" to create the first patient record'
                        : "Contact an administrator to add patients"}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow
                  key={patient.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => handlePatientClick(patient)}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {patient.first_name} {patient.last_name}
                      </Typography>
                      {patient.date_of_birth && (
                        <Typography variant="body2" color="text.secondary">
                          Born: {formatDate(patient.date_of_birth)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={patient.medical_record_number}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {patient.room_number ? (
                      <Chip
                        icon={<Room />}
                        label={patient.room_number}
                        size="small"
                        color="info"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No room assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {calculateAge(patient.date_of_birth)} years
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(patient.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPatient(patient.id);
                      }}
                      sx={{ mr: 1 }}
                    >
                      <Visibility />
                    </IconButton>
                    {isAdmin() && (
                      <>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPatient(patient.id);
                          }}
                          sx={{ mr: 1 }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleDeleteClick(patient, e)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Patient Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedPatient && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <LocalHospital sx={{ mr: 1, color: "primary.main" }} />
                Patient Information
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Medical Record Number
                    </Typography>
                    <Typography variant="body1">
                      {selectedPatient.medical_record_number}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Room Number
                    </Typography>
                    <Typography variant="body1">
                      {selectedPatient.room_number || "Not assigned"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Date of Birth
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedPatient.date_of_birth)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Age
                    </Typography>
                    <Typography variant="body1">
                      {calculateAge(selectedPatient.date_of_birth)} years
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Added On
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedPatient.created_at)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              <Button
                variant="outlined"
                onClick={() => handleViewPatient(selectedPatient.id)}
                startIcon={<Visibility />}
              >
                View Details
              </Button>
              {isAdmin() && (
                <Button
                  variant="contained"
                  onClick={() => handleEditPatient(selectedPatient.id)}
                  startIcon={<Edit />}
                >
                  Edit Patient
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          <Warning sx={{ mr: 1, color: "error.main" }} />
          Delete Patient
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete patient{" "}
            <strong>
              {patientToDelete?.first_name} {patientToDelete?.last_name}
            </strong>{" "}
            (MRN: {patientToDelete?.medical_record_number})?
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, color: "error.main" }}>
            ⚠️ This action cannot be undone. All associated task logs will also
            be deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={
              deleteLoading ? <CircularProgress size={16} /> : <Delete />
            }
          >
            {deleteLoading ? "Deleting..." : "Delete Patient"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      {isAdmin() && (
        <Fab
          color="primary"
          aria-label="add patient"
          onClick={handleAddPatient}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            display: { xs: "flex", sm: "none" },
          }}
        >
          <Add />
        </Fab>
      )}

      {/* Summary */}
      <Box
        sx={{
          mt: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {filteredPatients.length} of {patients.length} patients
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            icon={<Person />}
            label={`${patients.length} Total Patients`}
            variant="outlined"
            size="small"
          />
          {searchTerm && (
            <Chip
              label={`${filteredPatients.length} Found`}
              color="primary"
              size="small"
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PatientList;
