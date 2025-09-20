// src/components/TaskLogs/TaskLogList.js
import React, { useState, useEffect } from "react";
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
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Assignment } from "@mui/icons-material";
import { taskLogsAPI, handleApiError } from "../../services/api";

const TaskLogList = () => {
  const [taskLogs, setTaskLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTaskLogs = async () => {
      try {
        setLoading(true);
        const response = await taskLogsAPI.getAll();
        setTaskLogs(response.taskLogs || []);
      } catch (err) {
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
      } finally {
        setLoading(false);
      }
    };

    loadTaskLogs();
  }, []);

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTaskTypeColor = (taskType) => {
    const colors = {
      Medication: "error",
      Vitals: "info",
      Assessment: "warning",
      Treatment: "success",
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
          Loading task logs...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Task Logs
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View all patient care activities and documentation
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Task Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Completed By</TableCell>
              <TableCell>Completed At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taskLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box sx={{ py: 4 }}>
                    <Assignment
                      sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      No task logs found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Task logs will appear here as they are created
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              taskLogs.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {task.patient_first_name} {task.patient_last_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.task_type}
                      size="small"
                      color={getTaskTypeColor(task.task_type)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{task.description}</Typography>
                    {task.notes && (
                      <Typography variant="caption" color="text.secondary">
                        Notes: {task.notes}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {task.clinician_first_name} {task.clinician_last_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDateTime(task.completed_at)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {taskLogs.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {taskLogs.length} task logs
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TaskLogList;
