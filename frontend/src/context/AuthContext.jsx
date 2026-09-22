import { createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { getCurrentUser } from "../api/authApi";
import { clearAuthStorage, getToken, setToken, setUser } from "../utils/storage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-fetch profile when token exists on mount
  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (token) {
        try {
          const res = await getCurrentUser();
          const fetchedUser = res?.data?.user || res?.user || res;
          setUserState(fetchedUser);
        } catch (err) {
          clearAuthStorage();
          setUserState(null);
        }
      }
      setLoading(false);
    };
    init();

    // Listen for token expiry dispatched by axios.js
    const onExpired = () => {
      setUserState(null);
    };
    window.addEventListener("farmio:auth-expired", onExpired);
    return () => window.removeEventListener("farmio:auth-expired", onExpired);
  }, []);

  const login = (token, userData) => {
    setToken(token);
    setUser(userData);
    setUserState(userData);
  };

  const logout = () => {
    clearAuthStorage();
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      <BrowserRouter>{children}</BrowserRouter>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
