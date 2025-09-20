// src/components/Patients/PatientDetail.js
import React from "react";
import { Typography, Box, Paper, Button } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/patients")}
        sx={{ mb: 2 }}
      >
        Back to Patients
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Patient Details
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Patient ID: {id}
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Full patient details view coming soon...
          <br />
          This will show patient information, medical history, and task logs.
        </Typography>
      </Paper>
    </Box>
  );
};

export default PatientDetail;
