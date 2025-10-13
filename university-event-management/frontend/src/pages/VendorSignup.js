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
    .test(
      "email-format",
      "Please enter a valid email address with domain extension (e.g., name@company.com)",
      function (value) {
        if (!value) return true;
        // Check for basic email format with TLD
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(value);
      }
    )
    .test(
      "not-university",
      "Please use your company email address. University emails should use the University Member registration.",
      function (value) {
        if (!value) return true;
        const universityPattern = /^[a-zA-Z0-9._%+-]+@guc\.edu\.eg$/i;
        return !universityPattern.test(value);
      }
    ),
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
    .nullable()
    .oneOf(
      [null, "", "startup", "small", "medium", "large", "enterprise"],
      "Please select a valid company size"
    ),
  phoneNumber: yup
    .string()
    .nullable()
    .test(
      "phone-format",
      "Please enter a valid phone number",
      function (value) {
        // If empty or null, it's valid (optional field)
        if (!value || value.trim() === "") return true;
        // If has value, validate format
        return /^[+]?[\d\s-()]{10,}$/.test(value);
      }
    ),
  website: yup
    .string()
    .nullable()
    .test(
      "website-format",
      "Please enter a valid website URL (e.g., https://company.com)",
      function (value) {
        if (!value || value.trim() === "") return true;
        const urlPattern =
          /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        return urlPattern.test(value) || urlPattern.test(`https://${value}`);
      }
    ),
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
    .nullable()
    .test("zip-format", "Please enter a valid zip code", function (value) {
      // If empty or null, it's valid (optional field)
      if (!value || value.trim() === "") return true;
      // If has value, validate format
      return /^[\d\-\s]{5,10}$/.test(value);
    }),
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

      // Structure the data properly and filter out empty strings to prevent DB unique index issues
      const submitData = {
        ...otherData,
        interestedEventTypes: selectedEventTypes,
      };

      // Remove empty string fields that have unique indexes in the database
      if (submitData.businessRegistrationNumber === "") {
        delete submitData.businessRegistrationNumber;
      }
      if (submitData.industry === "") {
        delete submitData.industry;
      }
      if (submitData.companySize === "") {
        delete submitData.companySize;
      }
      if (submitData.phoneNumber === "") {
        delete submitData.phoneNumber;
      }
      if (submitData.website === "") {
        delete submitData.website;
      }
      if (submitData.description === "") {
        delete submitData.description;
      }
      if (submitData.contactPersonFirstName === "") {
        delete submitData.contactPersonFirstName;
      }
      if (submitData.contactPersonLastName === "") {
        delete submitData.contactPersonLastName;
      }

      // Clean up website URL - ensure it has protocol
      if (submitData.website && submitData.website.trim()) {
        const website = submitData.website.trim();
        if (!website.startsWith("http://") && !website.startsWith("https://")) {
          submitData.website = `https://${website}`;
        }
      }

      // Clean up phone number - remove extra spaces and formatting
      if (submitData.phoneNumber && submitData.phoneNumber.trim()) {
        submitData.phoneNumber = submitData.phoneNumber.trim();
      }

      // Only include address if at least one field has a value
      const addressFields = { street, city, state, zipCode, country };
      const hasAddressData = Object.values(addressFields).some(
        (value) => value && value.trim() !== ""
      );

      if (hasAddressData) {
        // Clean up address fields
        const cleanAddress = {};
        Object.keys(addressFields).forEach((key) => {
          if (addressFields[key] && addressFields[key].trim()) {
            cleanAddress[key] = addressFields[key].trim();
          }
        });
        submitData.address = cleanAddress;
      }

      console.log(
        "🔍 [DEBUG] Submitting vendor data:",
        JSON.stringify(submitData, null, 2)
      );

      const result = await registerVendor(submitData);

      if (result.success) {
        toast.success("Registration successful! Welcome to GUC Events!");
        navigate("/vendor-dashboard");
      } else {
        console.error("🚨 [ERROR] Registration failed:", result.error);
        toast.error(result.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("🚨 [ERROR] Registration exception:", error);
      if (error.data && error.data.errors) {
        console.error("🚨 [VALIDATION ERRORS]:", error.data.errors);
        // Show specific validation errors
        const errorMessages = error.data.errors
          .map((err) => err.msg)
          .join(", ");
        toast.error(`Validation failed: ${errorMessages}`);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Red/Orange theme overrides to match vendor login
  const vendorTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      primary: {
        main: "#ea580c", // orange-600
        light: "#fb923c", // orange-400
        dark: "#c2410c", // orange-700
      },
      background: {
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // purple gradient to match main theme
      },
    },
  };

  const containerStyles = {
    minHeight: "100vh",
    background: vendorTheme.colors.background.gradient,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: vendorTheme.spacing[4],
    fontFamily: vendorTheme.typography.fontFamily.primary,
  };

  const cardStyles = {
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
  };

  const headerStyles = {
    textAlign: "center",
    marginBottom: vendorTheme.spacing[8],
  };

  const titleStyles = {
    fontSize: vendorTheme.typography.fontSize["3xl"],
    fontWeight: vendorTheme.typography.fontWeight.bold,
    color: vendorTheme.colors.text.primary,
    marginBottom: vendorTheme.spacing[2],
  };

  const subtitleStyles = {
    fontSize: vendorTheme.typography.fontSize.lg,
    color: vendorTheme.colors.text.secondary,
    marginBottom: vendorTheme.spacing[4],
  };

  const sectionStyles = {
    marginBottom: vendorTheme.spacing[8],
    paddingBottom: vendorTheme.spacing[6],
    borderBottom: `1px solid ${vendorTheme.colors.border.light}`,
  };

  const sectionTitleStyles = {
    fontSize: vendorTheme.typography.fontSize.xl,
    fontWeight: vendorTheme.typography.fontWeight.semibold,
    color: vendorTheme.colors.text.primary,
    marginBottom: vendorTheme.spacing[4],
  };

  const formStyles = {
    display: "grid",
    gap: vendorTheme.spacing[4],
  };

  const rowStyles = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: vendorTheme.spacing[4],
  };

  const checkboxGroupStyles = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: vendorTheme.spacing[3],
    marginTop: vendorTheme.spacing[2],
  };

  const checkboxItemStyles = {
    display: "flex",
    alignItems: "center",
    gap: vendorTheme.spacing[2],
    padding: vendorTheme.spacing[3],
    border: `2px solid ${vendorTheme.colors.border.light}`,
    borderRadius: vendorTheme.borderRadius.md,
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const linkStyles = {
    textAlign: "center",
    marginTop: vendorTheme.spacing[6],
    fontSize: vendorTheme.typography.fontSize.sm,
    color: vendorTheme.colors.text.secondary,
  };

  const linkAnchorStyles = {
    color: vendorTheme.colors.primary.main,
    textDecoration: "none",
    fontWeight: vendorTheme.typography.fontWeight.medium,
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
                  label="Business Registration Number"
                  type="text"
                  placeholder="Enter registration number"
                  error={errors.businessRegistrationNumber?.message}
                  {...register("businessRegistrationNumber")}
                />
                <Select
                  label="Company Size"
                  placeholder="Select company size"
                  options={companySizeOptions}
                  error={errors.companySize?.message}
                  {...register("companySize")}
                />
              </div>

              <div style={rowStyles}>
                <Input
                  label="Industry"
                  type="text"
                  placeholder="e.g., Technology, Food & Beverage"
                  error={errors.industry?.message}
                  {...register("industry")}
                />
                <Input
                  label="Website"
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
                  Company Description
                </label>
                <textarea
                  placeholder="Describe your company and what you offer..."
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
                  label="Contact Person First Name"
                  type="text"
                  placeholder="Enter first name"
                  error={errors.contactPersonFirstName?.message}
                  {...register("contactPersonFirstName")}
                />
                <Input
                  label="Contact Person Last Name"
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
                  placeholder="name@company.com"
                  required
                  error={errors.email?.message}
                  {...register("email")}
                />
                <Input
                  label="Phone Number"
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
                label="Street Address"
                type="text"
                placeholder="Enter street address"
                error={errors.street?.message}
                {...register("street")}
              />

              <div style={rowStyles}>
                <Input
                  label="City"
                  type="text"
                  placeholder="Enter city"
                  error={errors.city?.message}
                  {...register("city")}
                />
                <Input
                  label="State/Province"
                  type="text"
                  placeholder="Enter state or province"
                  error={errors.state?.message}
                  {...register("state")}
                />
              </div>

              <div style={rowStyles}>
                <Input
                  label="Zip/Postal Code"
                  type="text"
                  placeholder="Enter zip code"
                  error={errors.zipCode?.message}
                  {...register("zipCode")}
                />
                <Input
                  label="Country"
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
            <h2 style={sectionTitleStyles}>Event Interests</h2>
            <p
              style={{
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[4],
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              Select the types of events you're interested in participating in :
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
            style={{
              width: "100%",
              marginTop: vendorTheme.spacing[4],
              background: vendorTheme.colors.primary.main,
              backgroundColor: vendorTheme.colors.primary.main,
              borderColor: vendorTheme.colors.primary.main,
              color: "white",
              backgroundImage: "none",
            }}
          >
            {isSubmitting || isLoading
              ? "Submitting Application..."
              : "Submit Vendor Application"}
          </Button>

          {/* Links */}
          <div style={linkStyles}>
            Already have an account?{" "}
            <Link to="/" style={linkAnchorStyles}>
              Sign in here
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default VendorSignup;
