"use client";

/**
 * Authentication context and hook for managing JWT-based auth state.
 * Provides AuthProvider wrapper and useAuth() hook.
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe, login as apiLogin, register as apiRegister } from "./api";

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

  const login = useCallback(async (email, password) => {
    try {
      const data = await apiLogin(email, password);
      loginWithToken(data.access_token, data.user);
      return true;
    } catch (err) {
      return false;
    }
  }, [loginWithToken]);

  const register = useCallback(async (email, username, password) => {
    try {
      const data = await apiRegister(username, email, password);
      loginWithToken(data.access_token, data.user);
      return true;
    } catch (err) {
      return false;
    }
  }, [loginWithToken]);

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
    login,
    register,
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
