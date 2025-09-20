// src/components/Dashboard/Dashboard.js
// Main dashboard with overview statistics and quick actions

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  People,
  Assignment,
  PersonAdd,
  NoteAdd,
  LocalHospital,
  TrendingUp,
  AccessTime,
  CheckCircle,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { patientsAPI, taskLogsAPI } from "../../services/api";
import { handleApiError } from "../../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayTasks: 0,
    recentTasks: [],
    recentPatients: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load patients
        const patientsResponse = await patientsAPI.getAll({ limit: 5 });

        // Load recent task logs
        const taskLogsResponse = await taskLogsAPI.getAll({ limit: 10 });

        // Calculate today's tasks
        const today = new Date().toISOString().split("T")[0];
        const todayTasks =
          taskLogsResponse.taskLogs?.filter((task) =>
            task.completed_at.startsWith(today)
          ).length || 0;

        setStats({
          totalPatients: patientsResponse.count || 0,
          todayTasks: todayTasks,
          recentTasks: taskLogsResponse.taskLogs?.slice(0, 5) || [],
          recentPatients: patientsResponse.patients || [],
        });
      } catch (err) {
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Quick action handlers
  const handleAddPatient = () => {
    navigate("/patients/new");
  };

  const handleAddTaskLog = () => {
    navigate("/task-logs/new");
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getTaskTypeColor = (taskType) => {
    const colors = {
      Medication: "error",
      Vitals: "info",
      Assessment: "warning",
      Treatment: "success",
      Documentation: "default",
    };
    return colors[taskType] || "default";
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
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening at your hospital today.
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <People sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.totalPatients}
                  </Typography>
                  <Typography color="text.secondary">Total Patients</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Assignment
                  sx={{ fontSize: 40, color: "secondary.main", mr: 2 }}
                />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.todayTasks}
                  </Typography>
                  <Typography color="text.secondary">Today's Tasks</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <LocalHospital
                  sx={{ fontSize: 40, color: "success.main", mr: 2 }}
                />
                <Box>
                  <Typography variant="h4" component="div">
                    {user?.role === "admin" ? "Admin" : "Clinician"}
                  </Typography>
                  <Typography color="text.secondary">Your Role</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TrendingUp sx={{ fontSize: 40, color: "info.main", mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.recentTasks.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Recent Activities
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {isAdmin() && (
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={handleAddPatient}
                >
                  Add New Patient
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<NoteAdd />}
                onClick={handleAddTaskLog}
              >
                Log New Task
              </Button>
              <Button variant="outlined" onClick={() => navigate("/patients")}>
                View All Patients
              </Button>
              <Button variant="outlined" onClick={() => navigate("/task-logs")}>
                View Task History
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Task Logs */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <AccessTime sx={{ mr: 1 }} />
              Recent Task Logs
            </Typography>
            {stats.recentTasks.length === 0 ? (
              <Typography color="text.secondary">
                No recent task logs found.
              </Typography>
            ) : (
              <List>
                {stats.recentTasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CheckCircle color={getTaskTypeColor(task.task_type)} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2">
                              {task.patient_first_name} {task.patient_last_name}
                            </Typography>
                            <Chip
                              label={task.task_type}
                              size="small"
                              color={getTaskTypeColor(task.task_type)}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {task.description}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDate(task.completed_at)} at{" "}
                              {formatTime(task.completed_at)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < stats.recentTasks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
            <Box sx={{ mt: 2 }}>
              <Button size="small" onClick={() => navigate("/task-logs")}>
                View All Task Logs
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Patients */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <People sx={{ mr: 1 }} />
              Recent Patients
            </Typography>
            {stats.recentPatients.length === 0 ? (
              <Typography color="text.secondary">No patients found.</Typography>
            ) : (
              <List>
                {stats.recentPatients.map((patient, index) => (
                  <React.Fragment key={patient.id}>
                    <ListItem
                      sx={{ px: 0, cursor: "pointer" }}
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body1">
                            {patient.first_name} {patient.last_name}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              MRN: {patient.medical_record_number}
                            </Typography>
                            {patient.room_number && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Room: {patient.room_number}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < stats.recentPatients.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
            <Box sx={{ mt: 2 }}>
              <Button size="small" onClick={() => navigate("/patients")}>
                View All Patients
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
