// src/services/api.js
// Centralized API service for the Patient Tracker frontend

import axios from "axios";

// System Design Concept: API Client Layer
// - Centralized HTTP client configuration
// - Automatic token management
// - Error handling
// - Request/response interceptors

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3000/api";

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Automatically add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },
};

// Patients API calls
export const patientsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get("/patients", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  create: async (patientData) => {
    const response = await api.post("/patients", patientData);
    return response.data;
  },

  update: async (id, patientData) => {
    const response = await api.put(`/patients/${id}`, patientData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },
};

// Task Logs API calls
export const taskLogsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get("/task-logs", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/task-logs/${id}`);
    return response.data;
  },

  getByPatient: async (patientId) => {
    const response = await api.get(`/task-logs/patient/${patientId}`);
    return response.data;
  },

  create: async (taskLogData) => {
    const response = await api.post("/task-logs", taskLogData);
    return response.data;
  },

  update: async (id, taskLogData) => {
    const response = await api.put(`/task-logs/${id}`, taskLogData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/task-logs/${id}`);
    return response.data;
  },
};

// Utility function for handling API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.error || "An error occurred";
    return {
      message,
      status: error.response.status,
      details: error.response.data,
    };
  } else if (error.request) {
    // Network error
    return {
      message: "Network error. Please check your connection.",
      status: 0,
    };
  } else {
    // Other error
    return {
      message: error.message || "An unexpected error occurred",
      status: -1,
    };
  }
};

export default api;
