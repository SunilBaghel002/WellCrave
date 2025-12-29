// src/pages/ResetPassword.jsx
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiLock, FiCheck, FiArrowLeft } from "react-icons/fi";
import { authAPI } from "../api/auth";
import Button from "../components/common/Button";
import Input from "../components/common/Input";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await authAPI.resetPassword(token, {
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setIsSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to reset password";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <>
        <Helmet>
          <title>Password Reset Successful - DehydratedFoods</title>
        </Helmet>

        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-card p-8 max-w-md w-full text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="text-green-600" size={32} />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Password Reset Successful!
            </h1>

            <p className="text-gray-600 mb-6">
              Your password has been reset successfully. Redirecting you to
              login...
            </p>

            <Link to="/login">
              <Button fullWidth>Go to Login</Button>
            </Link>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Reset Password - DehydratedFoods</title>
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card p-8 max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiLock className="text-primary-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-600">Enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
              leftIcon={<FiLock size={18} />}
              error={errors.password?.message}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message:
                    "Password must include uppercase, lowercase, and number",
                },
              })}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm new password"
              leftIcon={<FiLock size={18} />}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Password must contain:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className={password?.length >= 8 ? "text-green-600" : ""}>
                  • At least 8 characters
                </li>
                <li
                  className={
                    /[A-Z]/.test(password || "") ? "text-green-600" : ""
                  }
                >
                  • One uppercase letter
                </li>
                <li
                  className={
                    /[a-z]/.test(password || "") ? "text-green-600" : ""
                  }
                >
                  • One lowercase letter
                </li>
                <li
                  className={/\d/.test(password || "") ? "text-green-600" : ""}
                >
                  • One number
                </li>
              </ul>
            </div>

            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Reset Password
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600"
            >
              <FiArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ResetPassword;
