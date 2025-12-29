// src/components/checkout/AddressForm.jsx
import { useForm } from "react-hook-form";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";

const indianStates = [
  { value: "AN", label: "Andaman and Nicobar Islands" },
  { value: "AP", label: "Andhra Pradesh" },
  { value: "AR", label: "Arunachal Pradesh" },
  { value: "AS", label: "Assam" },
  { value: "BR", label: "Bihar" },
  { value: "CH", label: "Chandigarh" },
  { value: "CT", label: "Chhattisgarh" },
  { value: "DL", label: "Delhi" },
  { value: "GA", label: "Goa" },
  { value: "GJ", label: "Gujarat" },
  { value: "HR", label: "Haryana" },
  { value: "HP", label: "Himachal Pradesh" },
  { value: "JK", label: "Jammu and Kashmir" },
  { value: "JH", label: "Jharkhand" },
  { value: "KA", label: "Karnataka" },
  { value: "KL", label: "Kerala" },
  { value: "MP", label: "Madhya Pradesh" },
  { value: "MH", label: "Maharashtra" },
  { value: "MN", label: "Manipur" },
  { value: "ML", label: "Meghalaya" },
  { value: "MZ", label: "Mizoram" },
  { value: "NL", label: "Nagaland" },
  { value: "OR", label: "Odisha" },
  { value: "PB", label: "Punjab" },
  { value: "RJ", label: "Rajasthan" },
  { value: "SK", label: "Sikkim" },
  { value: "TN", label: "Tamil Nadu" },
  { value: "TG", label: "Telangana" },
  { value: "TR", label: "Tripura" },
  { value: "UP", label: "Uttar Pradesh" },
  { value: "UK", label: "Uttarakhand" },
  { value: "WB", label: "West Bengal" },
];

const AddressForm = ({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Save Address",
  showSaveOption = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      street: "",
      apartment: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          placeholder="John"
          required
          error={errors.firstName?.message}
          {...register("firstName", { required: "First name is required" })}
        />

        <Input
          label="Last Name"
          placeholder="Doe"
          required
          error={errors.lastName?.message}
          {...register("lastName", { required: "Last name is required" })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+91 98765 43210"
          required
          error={errors.phone?.message}
          {...register("phone", {
            required: "Phone number is required",
            pattern: {
              value:
                /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
              message: "Please enter a valid phone number",
            },
          })}
        />

        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          required
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email",
            },
          })}
        />
      </div>

      <Input
        label="Street Address"
        placeholder="123 Main Street"
        required
        error={errors.street?.message}
        {...register("street", { required: "Street address is required" })}
      />

      <Input
        label="Apartment, suite, etc. (optional)"
        placeholder="Apt 4B"
        {...register("apartment")}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="City"
          placeholder="Mumbai"
          required
          error={errors.city?.message}
          {...register("city", { required: "City is required" })}
        />

        <Select
          label="State"
          options={indianStates}
          required
          error={errors.state?.message}
          {...register("state", { required: "State is required" })}
        />

        <Input
          label="PIN Code"
          placeholder="400001"
          required
          error={errors.zipCode?.message}
          {...register("zipCode", {
            required: "PIN code is required",
            pattern: {
              value: /^[1-9][0-9]{5}$/,
              message: "Please enter a valid 6-digit PIN code",
            },
          })}
        />
      </div>

      <Input label="Country" value="India" disabled {...register("country")} />

      {showSaveOption && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            {...register("saveAddress")}
          />
          <span className="text-sm text-gray-600">
            Save this address for future orders
          </span>
        </label>
      )}

      <Button type="submit" fullWidth isLoading={isLoading}>
        {submitLabel}
      </Button>
    </form>
  );
};

export default AddressForm;
