// src/hooks/useAuth.js
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "../api/auth";
import { userAPI } from "../api/user";

export const useAuthActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const forgotPassword = useCallback(async (email) => {
    setIsLoading(true);
    setError(null);

    try {
      await authAPI.forgotPassword(email);
      toast.success("Password reset link sent to your email");
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to send reset link";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(
    async (token, passwords) => {
      setIsLoading(true);
      setError(null);

      try {
        await authAPI.resetPassword(token, passwords);
        toast.success("Password reset successful! Please login.");
        navigate("/login");
        return { success: true };
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to reset password";
        setError(message);
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const updatePassword = useCallback(async (passwords) => {
    setIsLoading(true);
    setError(null);

    try {
      await authAPI.updatePassword(passwords);
      toast.success("Password updated successfully");
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update password";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (token) => {
    setIsLoading(true);
    setError(null);

    try {
      await authAPI.verifyEmail(token);
      toast.success("Email verified successfully!");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to verify email";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resendVerification = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authAPI.resendVerification();
      toast.success("Verification email sent!");
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to send verification email";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    forgotPassword,
    resetPassword,
    updatePassword,
    verifyEmail,
    resendVerification,
  };
};

export const useProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await userAPI.updateProfile(data);
      toast.success("Profile updated successfully");
      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update profile";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAvatar = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await userAPI.updateAvatar(formData);
      toast.success("Avatar updated successfully");
      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update avatar";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAvatar = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await userAPI.deleteAvatar();
      toast.success("Avatar deleted");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete avatar";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    updateProfile,
    updateAvatar,
    deleteAvatar,
  };
};

export const useAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await userAPI.getAddresses();
      setAddresses(response.data.data);
      return { success: true, data: response.data.data };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to fetch addresses";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addAddress = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await userAPI.addAddress(data);
      setAddresses(response.data.data);
      toast.success("Address added successfully");
      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to add address";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAddress = useCallback(async (id, data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await userAPI.updateAddress(id, data);
      setAddresses(response.data.data);
      toast.success("Address updated successfully");
      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update address";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAddress = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      await userAPI.deleteAddress(id);
      setAddresses((prev) => prev.filter((addr) => addr._id !== id));
      toast.success("Address deleted");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete address";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setDefaultAddress = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await userAPI.setDefaultAddress(id);
      setAddresses(response.data.data);
      toast.success("Default address updated");
      return { success: true, data: response.data.data };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to set default address";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    addresses,
    isLoading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
};

export default useAuthActions;
