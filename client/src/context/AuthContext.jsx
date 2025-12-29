// src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { data } = await authAPI.getMe();
          setUser(data.data);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = useCallback(
    async (credentials) => {
      try {
        const { data } = await authAPI.login(credentials);
        const { token, user: userData } = data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        toast.success(`Welcome back, ${userData.firstName}!`);
        navigate("/");

        return { success: true };
      } catch (error) {
        const message = error.response?.data?.message || "Login failed";
        toast.error(message);
        return { success: false, error: message };
      }
    },
    [navigate]
  );

  const register = useCallback(
    async (userData) => {
      try {
        const { data } = await authAPI.register(userData);
        const { token, user: newUser } = data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(newUser));

        setUser(newUser);
        setIsAuthenticated(true);

        toast.success("Account created successfully!");
        navigate("/");

        return { success: true };
      } catch (error) {
        const message = error.response?.data?.message || "Registration failed";
        toast.error(message);
        return { success: false, error: message };
      }
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
      toast.success("Logged out successfully");
      navigate("/");
    }
  }, [navigate]);

  const updateUser = useCallback(
    (updatedData) => {
      setUser((prev) => ({ ...prev, ...updatedData }));
      localStorage.setItem("user", JSON.stringify({ ...user, ...updatedData }));
    },
    [user]
  );

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
