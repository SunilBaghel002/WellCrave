// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCamera,
  FiLock,
  FiMapPin,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../api/user";
import { authAPI } from "../api/auth";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Modal from "../components/common/Modal";
import Card from "../components/common/Card";
import Loader from "../components/common/Loader";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    formState: { errors: addressErrors },
    reset: resetAddress,
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const { data } = await userAPI.getAddresses();
      setAddresses(data.data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const onProfileSubmit = async (formData) => {
    try {
      setIsLoading(true);
      const { data } = await userAPI.updateProfile(formData);
      updateUser(data.data);
      toast.success("Profile updated successfully");
      reset(formData);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setIsUploadingAvatar(true);
      const { data } = await userAPI.updateAvatar(formData);
      updateUser({ avatar: data.data.avatar });
      toast.success("Avatar updated successfully");
    } catch (error) {
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onAddressSubmit = async (formData) => {
    try {
      setIsLoading(true);
      if (editingAddress) {
        await userAPI.updateAddress(editingAddress._id, formData);
        toast.success("Address updated successfully");
      } else {
        await userAPI.addAddress(formData);
        toast.success("Address added successfully");
      }
      fetchAddresses();
      setIsAddressModalOpen(false);
      setEditingAddress(null);
      resetAddress();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      await userAPI.deleteAddress(addressId);
      toast.success("Address deleted successfully");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await userAPI.setDefaultAddress(addressId);
      toast.success("Default address updated");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to update default address");
    }
  };

  const onPasswordSubmit = async (formData) => {
    try {
      setIsLoading(true);
      await authAPI.updatePassword(formData);
      toast.success("Password updated successfully");
      setIsPasswordModalOpen(false);
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditAddress = (address) => {
    setEditingAddress(address);
    resetAddress(address);
    setIsAddressModalOpen(true);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "addresses", label: "Addresses", icon: FiMapPin },
    { id: "security", label: "Security", icon: FiLock },
  ];

  return (
    <>
      <Helmet>
        <title>My Profile | DehydratedFoods</title>
      </Helmet>

      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                {/* Avatar Section */}
                <div className="text-center pb-6 border-b border-gray-100">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 mx-auto">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.firstName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                          <span className="text-3xl font-bold text-primary-600">
                            {user?.firstName?.charAt(0)}
                            {user?.lastName?.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                      <FiCamera className="text-white" size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={isUploadingAvatar}
                      />
                    </label>
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>

                {/* Navigation */}
                <nav className="pt-4 space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary-50 text-primary-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <tab.icon size={20} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Personal Information
                    </h2>
                    <form
                      onSubmit={handleSubmit(onProfileSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        <Input
                          label="First Name"
                          {...register("firstName", {
                            required: "First name is required",
                          })}
                          error={errors.firstName?.message}
                          leftIcon={<FiUser size={18} />}
                        />
                        <Input
                          label="Last Name"
                          {...register("lastName", {
                            required: "Last name is required",
                          })}
                          error={errors.lastName?.message}
                          leftIcon={<FiUser size={18} />}
                        />
                      </div>

                      <Input
                        label="Email Address"
                        type="email"
                        {...register("email")}
                        disabled
                        leftIcon={<FiMail size={18} />}
                        helperText="Email cannot be changed"
                      />

                      <Input
                        label="Phone Number"
                        type="tel"
                        {...register("phone", {
                          pattern: {
                            value:
                              /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
                            message: "Please enter a valid phone number",
                          },
                        })}
                        error={errors.phone?.message}
                        leftIcon={<FiPhone size={18} />}
                        placeholder="+91 98765 43210"
                      />

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          isLoading={isLoading}
                          disabled={!isDirty}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Card>
                </motion.div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Saved Addresses
                      </h2>
                      <Button
                        size="sm"
                        leftIcon={<FiPlus size={18} />}
                        onClick={() => {
                          setEditingAddress(null);
                          resetAddress();
                          setIsAddressModalOpen(true);
                        }}
                      >
                        Add Address
                      </Button>
                    </div>

                    {addresses.length === 0 ? (
                      <div className="text-center py-12">
                        <FiMapPin
                          className="mx-auto text-gray-300 mb-4"
                          size={48}
                        />
                        <p className="text-gray-500">No addresses saved yet</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {addresses.map((address) => (
                          <div
                            key={address._id}
                            className={`relative p-4 border rounded-xl ${
                              address.isDefault
                                ? "border-primary-500 bg-primary-50"
                                : "border-gray-200"
                            }`}
                          >
                            {address.isDefault && (
                              <span className="absolute top-2 right-2 text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                            <div className="mb-3">
                              <span className="text-xs font-medium text-gray-500 uppercase">
                                {address.type}
                              </span>
                              <p className="font-medium text-gray-900 mt-1">
                                {address.firstName} {address.lastName}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600">
                              {address.street}
                              {address.apartment && `, ${address.apartment}`}
                              <br />
                              {address.city}, {address.state} {address.zipCode}
                              <br />
                              {address.country}
                            </p>
                            {address.phone && (
                              <p className="text-sm text-gray-600 mt-2">
                                {address.phone}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                              <button
                                onClick={() => openEditAddress(address)}
                                className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600"
                              >
                                <FiEdit2 size={14} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(address._id)}
                                className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600"
                              >
                                <FiTrash2 size={14} />
                                Delete
                              </button>
                              {!address.isDefault && (
                                <button
                                  onClick={() =>
                                    handleSetDefaultAddress(address._id)
                                  }
                                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 ml-auto"
                                >
                                  <FiCheck size={14} />
                                  Set Default
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Security Settings
                    </h2>

                    <div className="space-y-6">
                      {/* Password Section */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <FiLock className="text-gray-600" size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Password
                            </p>
                            <p className="text-sm text-gray-500">
                              Last changed 30 days ago
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsPasswordModalOpen(true)}
                        >
                          Change Password
                        </Button>
                      </div>

                      {/* Two-Factor Auth */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <FiLock className="text-gray-600" size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Two-Factor Authentication
                            </p>
                            <p className="text-sm text-gray-500">
                              Add extra security to your account
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                          Coming Soon
                        </Button>
                      </div>

                      {/* Connected Accounts */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-4">
                          Connected Accounts
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-red-600 font-bold">
                                  G
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  Google
                                </p>
                                <p className="text-sm text-gray-500">
                                  {user?.authProvider === "google"
                                    ? "Connected"
                                    : "Not connected"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div className="pt-6 border-t border-gray-200">
                        <h3 className="font-medium text-red-600 mb-4">
                          Danger Zone
                        </h3>
                        <Button variant="danger" size="sm">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
          resetAddress();
        }}
        title={editingAddress ? "Edit Address" : "Add New Address"}
        size="lg"
      >
        <form
          onSubmit={handleAddressSubmit(onAddressSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              {...registerAddress("firstName", { required: "Required" })}
              error={addressErrors.firstName?.message}
            />
            <Input
              label="Last Name"
              {...registerAddress("lastName", { required: "Required" })}
              error={addressErrors.lastName?.message}
            />
          </div>

          <Input
            label="Street Address"
            {...registerAddress("street", { required: "Required" })}
            error={addressErrors.street?.message}
          />

          <Input
            label="Apartment, Suite, etc. (optional)"
            {...registerAddress("apartment")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              {...registerAddress("city", { required: "Required" })}
              error={addressErrors.city?.message}
            />
            <Input
              label="State"
              {...registerAddress("state", { required: "Required" })}
              error={addressErrors.state?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="PIN Code"
              {...registerAddress("zipCode", { required: "Required" })}
              error={addressErrors.zipCode?.message}
            />
            <Input
              label="Country"
              {...registerAddress("country", { required: "Required" })}
              error={addressErrors.country?.message}
              defaultValue="India"
            />
          </div>

          <Input
            label="Phone Number"
            type="tel"
            {...registerAddress("phone", { required: "Required" })}
            error={addressErrors.phone?.message}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              {...registerAddress("isDefault")}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700">
              Set as default address
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddressModalOpen(false);
                setEditingAddress(null);
                resetAddress();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {editingAddress ? "Update" : "Add"} Address
            </Button>
          </div>
        </form>
      </Modal>

      {/* Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          resetPassword();
        }}
        title="Change Password"
      >
        <form
          onSubmit={handlePasswordSubmit(onPasswordSubmit)}
          className="space-y-4"
        >
          <Input
            label="Current Password"
            type="password"
            {...registerPassword("currentPassword", {
              required: "Current password is required",
            })}
            error={passwordErrors.currentPassword?.message}
          />

          <Input
            label="New Password"
            type="password"
            {...registerPassword("newPassword", {
              required: "New password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message:
                  "Password must contain uppercase, lowercase and number",
              },
            })}
            error={passwordErrors.newPassword?.message}
          />

          <Input
            label="Confirm New Password"
            type="password"
            {...registerPassword("confirmPassword", {
              required: "Please confirm your password",
              validate: (val) =>
                val === watch("newPassword") || "Passwords do not match",
            })}
            error={passwordErrors.confirmPassword?.message}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsPasswordModalOpen(false);
                resetPassword();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Profile;
