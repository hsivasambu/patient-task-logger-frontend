// src/context/AuthContext.js
// Global authentication state management

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI } from "../services/api";

// System Design Concept: Context Pattern
// - Global state management for authentication
// - Centralized user session handling
// - Automatic token persistence
// - Role-based access control

// Auth state shape
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth actions
const authActions = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  LOAD_USER_FROM_STORAGE: "LOAD_USER_FROM_STORAGE",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case authActions.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case authActions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case authActions.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case authActions.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case authActions.LOAD_USER_FROM_STORAGE:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: action.payload.token ? true : false,
        isLoading: false,
      };

    case authActions.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch({
          type: authActions.LOAD_USER_FROM_STORAGE,
          payload: { user: parsedUser, token },
        });
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        dispatch({
          type: authActions.LOAD_USER_FROM_STORAGE,
          payload: { user: null, token: null },
        });
      }
    } else {
      dispatch({
        type: authActions.LOAD_USER_FROM_STORAGE,
        payload: { user: null, token: null },
      });
    }
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: authActions.LOGIN_START });

    try {
      const response = await authAPI.login(credentials);

      // Store in localStorage
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: {
          user: response.user,
          token: response.token,
        },
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Login failed";
      dispatch({
        type: authActions.LOGIN_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: authActions.LOGIN_START });

    try {
      const response = await authAPI.register(userData);

      // Store in localStorage
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: {
          user: response.user,
          token: response.token,
        },
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Registration failed";
      dispatch({
        type: authActions.LOGIN_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    authAPI.logout();
    dispatch({ type: authActions.LOGOUT });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: authActions.CLEAR_ERROR });
  };

  // Helper functions for role-based access
  const isAdmin = () => {
    return state.user?.role === "admin";
  };

  const isClinician = () => {
    return state.user?.role === "clinician";
  };

  const hasRole = (roles) => {
    if (!state.user) return false;
    return Array.isArray(roles)
      ? roles.includes(state.user.role)
      : state.user.role === roles;
  };

  // Context value
  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    login,
    register,
    logout,
    clearError,

    // Helpers
    isAdmin,
    isClinician,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
