"use client";

/**
 * Authentication context and hook for managing JWT-based auth state.
 * Provides AuthProvider wrapper and useAuth() hook.
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for existing token in localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("chef_qwen_token");
    if (savedToken) {
      setToken(savedToken);
      getMe(savedToken)
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // Token is invalid or expired — clear it
          localStorage.removeItem("chef_qwen_token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginWithToken = useCallback((accessToken, userData) => {
    localStorage.setItem("chef_qwen_token", accessToken);
    setToken(accessToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("chef_qwen_token");
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    loginWithToken,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
