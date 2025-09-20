// src/App.js
// Main application component with routing

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Components
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import PatientList from "./components/Patients/PatientList";
import PatientDetail from "./components/Patients/PatientDetail";
import PatientForm from "./components/Patients/PatientForm";
import TaskLogList from "./components/TaskLogs/TaskLogList";
import Layout from "./components/Layout/Layout";
import LoadingSpinner from "./components/Common/LoadingSpinner";

// System Design Concepts:
// - Route-based code splitting (can add React.lazy later)
// - Protected routes pattern
// - Global theme management
// - Loading states
// - Error boundaries (can add later)

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Medical blue
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#dc004e", // Medical red for alerts
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // Don't uppercase button text
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Role-based Route Component
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user, hasRole } = useAuth();

  if (!hasRole(allowedRoles)) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <p>Your role: {user?.role}</p>
        <p>
          Required roles:{" "}
          {Array.isArray(allowedRoles) ? allowedRoles.join(", ") : allowedRoles}
        </p>
      </Box>
    );
  }

  return children;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <PatientList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients/new"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <PatientForm mode="create" />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients/:id/edit"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <PatientForm mode="edit" />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients/:id"
          element={
            <ProtectedRoute>
              <PatientDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task-logs"
          element={
            <ProtectedRoute>
              <TaskLogList />
            </ProtectedRoute>
          }
        />

        {/* Admin Only Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <div>Admin Panel - Coming Soon</div>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="*"
          element={
            <Box sx={{ p: 3, textAlign: "center" }}>
              <h2>Page Not Found</h2>
              <p>The page you're looking for doesn't exist.</p>
            </Box>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
