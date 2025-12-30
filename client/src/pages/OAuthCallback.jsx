// src/pages/OAuthCallback.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { FiLoader, FiCheck, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api/auth";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  useEffect(() => {
    const handleCallback = async () => {
      if (errorParam) {
        setStatus("error");
        setError("Authentication failed. Please try again.");
        return;
      }

      if (!token) {
        setStatus("error");
        setError("No authentication token received.");
        return;
      }

      try {
        // Store token
        localStorage.setItem("token", token);

        // Fetch user data
        const { data } = await authAPI.getMe();
        const user = data.data;

        // Update auth context
        localStorage.setItem("user", JSON.stringify(user));
        updateUser(user);

        setStatus("success");

        // Redirect after short delay
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } catch (err) {
        setStatus("error");
        setError("Failed to complete authentication.");
        localStorage.removeItem("token");
      }
    };

    handleCallback();
  }, [token, errorParam, navigate, updateUser]);

  return (
    <>
      <Helmet>
        <title>Authenticating... | DehydratedFoods</title>
      </Helmet>

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-card p-8 text-center">
            {status === "loading" && (
              <>
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiLoader
                    className="text-primary-600 animate-spin"
                    size={36}
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Completing sign in...
                </h1>
                <p className="text-gray-600">
                  Please wait while we complete your authentication.
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <FiCheck className="text-green-600" size={36} />
                </motion.div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome!
                </h1>
                <p className="text-gray-600">
                  Redirecting you to the homepage...
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <FiX className="text-red-600" size={36} />
                </motion.div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Authentication Failed
                </h1>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                >
                  Back to Login
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default OAuthCallback;
