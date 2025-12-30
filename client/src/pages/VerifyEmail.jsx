// src/pages/VerifyEmail.jsx
import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { FiCheck, FiX, FiMail, FiLoader } from "react-icons/fi";
import { authAPI } from "../api/auth";
import Button from "../components/common/Button";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading, success, error, no-token
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("no-token");
        setMessage("No verification token provided.");
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Verification failed. The link may have expired."
        );
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiLoader className="text-primary-600 animate-spin" size={36} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying your email...
            </h1>
            <p className="text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FiCheck className="text-green-600" size={36} />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email Verified!
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to login page in 3 seconds...
            </p>
            <Link to="/login">
              <Button>Go to Login</Button>
            </Link>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FiX className="text-red-600" size={36} />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Failed
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link to="/login">
                <Button fullWidth>Go to Login</Button>
              </Link>
              <p className="text-sm text-gray-500">
                Need a new verification link?{" "}
                <Link to="/login" className="text-primary-600 hover:underline">
                  Login and request a new one
                </Link>
              </p>
            </div>
          </div>
        );

      case "no-token":
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiMail className="text-yellow-600" size={36} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Link
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link to="/login">
                <Button fullWidth>Go to Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" fullWidth>
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Verify Email | DehydratedFoods</title>
      </Helmet>

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-card p-8">
            {renderContent()}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default VerifyEmail;
