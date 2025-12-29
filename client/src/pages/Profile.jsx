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
  FiMapPin,
  FiEdit3,
  FiCamera,
  FiLock,
  FiTrash2,
  FiPlus,
  FiCheck,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../api/user";
import { authAPI } from "../api/auth";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Modal from "../components/common/Modal";
import Loader from "../components/common/Loader";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
  } = useForm();

  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    reset: resetAddress,
    formState: { errors: addressErrors },
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors },
  } = useForm();

  const newPassword = watch("newPassword");

  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "",
      });
    }
    fetchAddresses();
  }, [user, resetProfile]);

  const fetchAddresses = async () => {
    try {
      const { data } = await userAPI.getAddresses();
      setAddresses(data.data || []);
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  };

  const onProfileSubmit = async (data) => {
    setIsLoading(true);
    try {
      const { data: response } = await userAPI.updateProfile(data);
      updateUser(response.data);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const { data } = await userAPI.updateAvatar(formData);
      updateUser({ avatar: data.data.avatar });
      toast.success("Avatar updated successfully!");
    } catch (error) {
      toast.error("Failed to update avatar");
    }
  };

  const onAddressSubmit = async (data) => {
    try {
      if (editingAddress) {
        await userAPI.updateAddress(editingAddress._id, data);
        toast.success("Address updated successfully!");
      } else {
        await userAPI.addAddress(data);
        toast.success("Address added successfully!");
      }
      fetchAddresses();
      setIsAddressModalOpen(false);
      setEditingAddress(null);
      resetAddress();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      await userAPI.deleteAddress(addressId);
      toast.success("Address deleted successfully!");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await userAPI.setDefaultAddress(addressId);
      toast.success("Default address updated!");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to set default address");
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await authAPI.updatePassword(data);
      toast.success("Password updated successfully!");
      setIsPasswordModalOpen(false);
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    }
  };

  const openAddressModal = (address = null) => {
    setEditingAddress(address);
    if (address) {
      resetAddress(address);
    } else {
      resetAddress({
        type: "home",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        street: "",
        apartment: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
        phone: user?.phone || "",
      });
    }
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
        <title>My Profile - DehydratedFoods</title>
      </Helmet>

      <div className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-hero text-white rounded-2xl p-8 mb-8"
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-white/20 overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold">
                        {user?.firstName?.charAt(0)}
                        {user?.lastName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-gray-50 transition-colors">
                    <FiCamera className="text-gray-600" size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>

                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-bold mb-1">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <p className="text-white/80">{user?.email}</p>
                  <p className="text-white/60 text-sm mt-1">
                    Member since{" "}
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="flex border-b">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                      activeTab === tab.id
                        ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleProfileSubmit(onProfileSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="First Name"
                        leftIcon={<FiUser size={18} />}
                        error={profileErrors.firstName?.message}
                        {...registerProfile("firstName", {
                          required: "First name is required",
                        })}
                      />
                      <Input
                        label="Last Name"
                        leftIcon={<FiUser size={18} />}
                        error={profileErrors.lastName?.message}
                        {...registerProfile("lastName", {
                          required: "Last name is required",
                        })}
                      />
                    </div>

                    <Input
                      label="Email"
                      type="email"
                      leftIcon={<FiMail size={18} />}
                      disabled
                      {...registerProfile("email")}
                    />

                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="+91 12345 67890"
                      leftIcon={<FiPhone size={18} />}
                      error={profileErrors.phone?.message}
                      {...registerProfile("phone")}
                    />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        isLoading={isLoading}
                        disabled={!isProfileDirty}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </motion.form>
                )}

                {/* Addresses Tab */}
                {activeTab === "addresses" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold">Saved Addresses</h3>
                      <Button
                        size="sm"
                        leftIcon={<FiPlus size={16} />}
                        onClick={() => openAddressModal()}
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
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => openAddressModal()}
                        >
                          Add Your First Address
                        </Button>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {addresses.map((address) => (
                          <div
                            key={address._id}
                            className={`relative p-4 rounded-xl border-2 ${
                              address.isDefault
                                ? "border-primary-500 bg-primary-50"
                                : "border-gray-200"
                            }`}
                          >
                            {address.isDefault && (
                              <span className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}

                            <p className="font-medium text-gray-900">
                              {address.firstName} {address.lastName}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                              {address.street}
                              {address.apartment && `, ${address.apartment}`}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {address.country}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                              {address.phone}
                            </p>

                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => openAddressModal(address)}
                                className="text-sm text-primary-600 hover:text-primary-700"
                              >
                                Edit
                              </button>
                              {!address.isDefault && (
                                <>
                                  <span className="text-gray-300">|</span>
                                  <button
                                    onClick={() =>
                                      handleSetDefault(address._id)
                                    }
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                  >
                                    Set as Default
                                  </button>
                                </>
                              )}
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => handleDeleteAddress(address._id)}
                                className="text-sm text-red-600 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Password
                          </h4>
                          <p className="text-sm text-gray-500">
                            Last updated{" "}
                            {user?.passwordChangedAt
                              ? new Date(
                                  user.passwordChangedAt
                                ).toLocaleDateString()
                              : "Never"}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsPasswordModalOpen(true)}
                        >
                          Change Password
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Email Verification
                          </h4>
                          <p className="text-sm text-gray-500">
                            {user?.isEmailVerified
                              ? "Your email is verified"
                              : "Please verify your email"}
                          </p>
                        </div>
                        {user?.isEmailVerified ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <FiCheck size={18} />
                            Verified
                          </span>
                        ) : (
                          <Button variant="outline" size="sm">
                            Verify Email
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="p-4 border border-red-200 rounded-xl bg-red-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-red-900">
                            Delete Account
                          </h4>
                          <p className="text-sm text-red-700">
                            Permanently delete your account and all data
                          </p>
                        </div>
                        <Button variant="danger" size="sm">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
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
              error={addressErrors.firstName?.message}
              {...registerAddress("firstName", { required: "Required" })}
            />
            <Input
              label="Last Name"
              error={addressErrors.lastName?.message}
              {...registerAddress("lastName", { required: "Required" })}
            />
          </div>

          <Input
            label="Street Address"
            error={addressErrors.street?.message}
            {...registerAddress("street", { required: "Required" })}
          />

          <Input
            label="Apartment, Suite, etc. (Optional)"
            {...registerAddress("apartment")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              error={addressErrors.city?.message}
              {...registerAddress("city", { required: "Required" })}
            />
            <Input
              label="State"
              error={addressErrors.state?.message}
              {...registerAddress("state", { required: "Required" })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="PIN Code"
              error={addressErrors.zipCode?.message}
              {...registerAddress("zipCode", { required: "Required" })}
            />
            <Input
              label="Phone"
              error={addressErrors.phone?.message}
              {...registerAddress("phone", { required: "Required" })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAddressModalOpen(false);
                setEditingAddress(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingAddress ? "Update Address" : "Add Address"}
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
            error={passwordErrors.currentPassword?.message}
            {...registerPassword("currentPassword", {
              required: "Current password is required",
            })}
          />

          <Input
            label="New Password"
            type="password"
            error={passwordErrors.newPassword?.message}
            {...registerPassword("newPassword", {
              required: "New password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />

          <Input
            label="Confirm New Password"
            type="password"
            error={passwordErrors.confirmPassword?.message}
            {...registerPassword("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === newPassword || "Passwords do not match",
            })}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Update Password</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Profile;
