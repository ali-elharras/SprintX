import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import theme from "../theme";
import Card from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";

// Validation schema
const vendorSchema = yup.object({
  companyName: yup
    .string()
    .required("Company name is required")
    .max(100, "Company name must be less than 100 characters"),
  contactPersonFirstName: yup
    .string()
    .max(50, "First name must be less than 50 characters")
    .nullable(),
  contactPersonLastName: yup
    .string()
    .max(50, "Last name must be less than 50 characters")
    .nullable(),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
  businessRegistrationNumber: yup.string().nullable(),
  industry: yup
    .string()
    .max(100, "Industry must be less than 100 characters")
    .nullable(),
  companySize: yup
    .string()
    .oneOf(
      ["startup", "small", "medium", "large", "enterprise"],
      "Please select a valid company size"
    )
    .nullable(),
  phoneNumber: yup
    .string()
    .matches(/^[\+]?[\d\s\-\(\)]{10,}$/, "Please enter a valid phone number")
    .nullable(),
  website: yup.string().url("Please enter a valid website URL").nullable(),
  street: yup
    .string()
    .max(200, "Street address must be less than 200 characters")
    .nullable(),
  city: yup.string().max(50, "City must be less than 50 characters").nullable(),
  state: yup
    .string()
    .max(50, "State must be less than 50 characters")
    .nullable(),
  zipCode: yup
    .string()
    .matches(/^[\d\-\s]{5,10}$/, "Please enter a valid zip code")
    .nullable(),
  country: yup
    .string()
    .max(50, "Country must be less than 50 characters")
    .nullable(),
  description: yup
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .nullable(),
  interestedEventTypes: yup.array().nullable(),
});

const VendorSignup = () => {
  const navigate = useNavigate();
  const { registerVendor, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(vendorSchema),
    defaultValues: {
      companyName: "",
      contactPersonFirstName: "",
      contactPersonLastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      businessRegistrationNumber: "",
      industry: "",
      companySize: "",
      phoneNumber: "",
      website: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      description: "",
      interestedEventTypes: [],
    },
  });

  const companySizeOptions = [
    { value: "startup", label: "Startup (1-10 employees)" },
    { value: "small", label: "Small (11-50 employees)" },
    { value: "medium", label: "Medium (51-200 employees)" },
    { value: "large", label: "Large (201-1000 employees)" },
    { value: "enterprise", label: "Enterprise (1000+ employees)" },
  ];

  const eventTypeOptions = [
    { value: "bazaar", label: "Bazaar" },
    { value: "career_fair", label: "Career Fair" },
    { value: "conference", label: "Conference" },
    { value: "workshop", label: "Workshop" },
  ];

  const [selectedEventTypes, setSelectedEventTypes] = useState([]);

  const handleEventTypeChange = (eventType) => {
    const updated = selectedEventTypes.includes(eventType)
      ? selectedEventTypes.filter((type) => type !== eventType)
      : [...selectedEventTypes, eventType];

    setSelectedEventTypes(updated);
    setValue("interestedEventTypes", updated);
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Remove confirmPassword from data
      const {
        confirmPassword,
        street,
        city,
        state,
        zipCode,
        country,
        ...otherData
      } = data;

      // Structure the data properly
      const submitData = {
        ...otherData,
        address: {
          street,
          city,
          state,
          zipCode,
          country,
        },
        interestedEventTypes: selectedEventTypes,
      };

      const result = await registerVendor(submitData);

      if (result.success) {
        toast.success(
          "Registration successful! Your account is pending admin approval."
        );
        navigate("/dashboard");
      } else {
        toast.error(result.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyles = {
    minHeight: "100vh",
    background: theme.colors.background.gradient,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[4],
    fontFamily: theme.typography.fontFamily.primary,
  };

  const cardStyles = {
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
  };

  const headerStyles = {
    textAlign: "center",
    marginBottom: theme.spacing[8],
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  };

  const subtitleStyles = {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[4],
  };

  const sectionStyles = {
    marginBottom: theme.spacing[8],
    paddingBottom: theme.spacing[6],
    borderBottom: `1px solid ${theme.colors.border.light}`,
  };

  const sectionTitleStyles = {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
  };

  const formStyles = {
    display: "grid",
    gap: theme.spacing[4],
  };

  const rowStyles = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing[4],
  };

  const checkboxGroupStyles = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: theme.spacing[3],
    marginTop: theme.spacing[2],
  };

  const checkboxItemStyles = {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[2],
    padding: theme.spacing[3],
    border: `2px solid ${theme.colors.border.light}`,
    borderRadius: theme.borderRadius.md,
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const linkStyles = {
    textAlign: "center",
    marginTop: theme.spacing[6],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  };

  const linkAnchorStyles = {
    color: theme.colors.primary.main,
    textDecoration: "none",
    fontWeight: theme.typography.fontWeight.medium,
  };

  return (
    <div style={containerStyles}>
      <Card style={cardStyles}>
        <div style={headerStyles}>
          <h1 style={titleStyles}>Vendor Registration</h1>
          <p style={subtitleStyles}>
            Join Campus Events Hub as a vendor to participate in university
            events
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Company Information */}
          <div style={sectionStyles}>
            <h2 style={sectionTitleStyles}>Company Information</h2>
            <div style={formStyles}>
              <Input
                label="Company Name"
                type="text"
                placeholder="Enter your company name"
                required
                error={errors.companyName?.message}
                {...register("companyName")}
              />

              <div style={rowStyles}>
                <Input
                  label="Business Registration Number (Optional)"
                  type="text"
                  placeholder="Enter registration number"
                  error={errors.businessRegistrationNumber?.message}
                  {...register("businessRegistrationNumber")}
                />
                <Select
                  label="Company Size (Optional)"
                  placeholder="Select company size"
                  options={companySizeOptions}
                  error={errors.companySize?.message}
                  {...register("companySize")}
                />
              </div>

              <div style={rowStyles}>
                <Input
                  label="Industry (Optional)"
                  type="text"
                  placeholder="e.g., Technology, Food & Beverage"
                  error={errors.industry?.message}
                  {...register("industry")}
                />
                <Input
                  label="Website (Optional)"
                  type="url"
                  placeholder="https://www.yourcompany.com"
                  error={errors.website?.message}
                  {...register("website")}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: theme.spacing[2],
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.primary,
                  }}
                >
                  Company Description *
                </label>
                <textarea
                  placeholder="Describe your company and what you offer... (Optional)"
                  style={{
                    ...theme.components.input.base,
                    width: "100%",
                    minHeight: "100px",
                    resize: "vertical",
                    fontFamily: theme.typography.fontFamily.primary,
                    borderColor: errors.description
                      ? theme.colors.error.main
                      : theme.colors.border.light,
                  }}
                  {...register("description")}
                />
                {errors.description && (
                  <div
                    style={{
                      marginTop: theme.spacing[1],
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.error.main,
                    }}
                  >
                    {errors.description.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div style={sectionStyles}>
            <h2 style={sectionTitleStyles}>Contact Information</h2>
            <div style={formStyles}>
              <div style={rowStyles}>
                <Input
                  label="Contact Person First Name (Optional)"
                  type="text"
                  placeholder="Enter first name"
                  error={errors.contactPersonFirstName?.message}
                  {...register("contactPersonFirstName")}
                />
                <Input
                  label="Contact Person Last Name (Optional)"
                  type="text"
                  placeholder="Enter last name"
                  error={errors.contactPersonLastName?.message}
                  {...register("contactPersonLastName")}
                />
              </div>

              <div style={rowStyles}>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter company email"
                  required
                  error={errors.email?.message}
                  {...register("email")}
                />
                <Input
                  label="Phone Number (Optional)"
                  type="tel"
                  placeholder="Enter phone number"
                  error={errors.phoneNumber?.message}
                  {...register("phoneNumber")}
                />
              </div>

              <div style={rowStyles}>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Create a strong password"
                  required
                  error={errors.password?.message}
                  {...register("password")}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  required
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div style={sectionStyles}>
            <h2 style={sectionTitleStyles}>Business Address</h2>
            <div style={formStyles}>
              <Input
                label="Street Address (Optional)"
                type="text"
                placeholder="Enter street address"
                error={errors.street?.message}
                {...register("street")}
              />

              <div style={rowStyles}>
                <Input
                  label="City (Optional)"
                  type="text"
                  placeholder="Enter city"
                  error={errors.city?.message}
                  {...register("city")}
                />
                <Input
                  label="State/Province (Optional)"
                  type="text"
                  placeholder="Enter state or province"
                  error={errors.state?.message}
                  {...register("state")}
                />
              </div>

              <div style={rowStyles}>
                <Input
                  label="Zip/Postal Code (Optional)"
                  type="text"
                  placeholder="Enter zip code"
                  error={errors.zipCode?.message}
                  {...register("zipCode")}
                />
                <Input
                  label="Country (Optional)"
                  type="text"
                  placeholder="Enter country"
                  error={errors.country?.message}
                  {...register("country")}
                />
              </div>
            </div>
          </div>

          {/* Event Interests */}
          <div style={sectionStyles}>
            <h2 style={sectionTitleStyles}>Event Interests (Optional)</h2>
            <p
              style={{
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[4],
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              Select the types of events you're interested in participating in
              (optional):
            </p>

            <div style={checkboxGroupStyles}>
              {eventTypeOptions.map((option) => (
                <div
                  key={option.value}
                  style={{
                    ...checkboxItemStyles,
                    borderColor: selectedEventTypes.includes(option.value)
                      ? theme.colors.primary.main
                      : theme.colors.border.light,
                    backgroundColor: selectedEventTypes.includes(option.value)
                      ? theme.colors.primary.light + "20"
                      : "transparent",
                  }}
                  onClick={() => handleEventTypeChange(option.value)}
                >
                  <input
                    type="checkbox"
                    checked={selectedEventTypes.includes(option.value)}
                    onChange={() => handleEventTypeChange(option.value)}
                    style={{ accentColor: theme.colors.primary.main }}
                  />
                  <label
                    style={{
                      cursor: "pointer",
                      fontWeight: theme.typography.fontWeight.medium,
                    }}
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>

            {errors.interestedEventTypes && (
              <div
                style={{
                  marginTop: theme.spacing[2],
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.error.main,
                }}
              >
                {errors.interestedEventTypes.message}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
            style={{ width: "100%", marginTop: theme.spacing[4] }}
          >
            {isSubmitting || isLoading
              ? "Submitting Application..."
              : "Submit Vendor Application"}
          </Button>

          {/* Links */}
          <div style={linkStyles}>
            Already have an account?{" "}
            <Link to="/login" style={linkAnchorStyles}>
              Sign in here
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default VendorSignup;
