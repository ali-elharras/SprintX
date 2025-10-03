import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import theme from "../theme";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";
import { registrationAPI } from "../services/api";

// Validation schema
const registrationSchema = yup.object({
  firstName: yup
    .string()
    .required("First name is required")
    .max(50, "First name cannot exceed 50 characters")
    .trim(),
  lastName: yup
    .string()
    .required("Last name is required")
    .max(50, "Last name cannot exceed 50 characters")
    .trim(),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  universityId: yup
    .string()
    .required("University/Staff ID is required")
    .matches(
      /^[A-Za-z0-9]+$/,
      "University/Staff ID can only contain letters and numbers"
    )
    .max(20, "University/Staff ID cannot exceed 20 characters"),
  role: yup
    .string()
    .required("Role is required")
    .oneOf(["student", "staff", "ta", "professor"], "Please select a valid role"),
  department: yup.string().max(100, "Department name cannot exceed 100 characters"),
  phoneNumber: yup
    .string()
    .matches(
      /^[\+]?[\d\s\-\(\)]{10,}$/,
      "Please enter a valid phone number"
    ),
  yearOfStudy: yup
    .number()
    .when("role", {
      is: "student",
      then: (schema) =>
        schema
          .required("Year of study is required for students")
          .min(1, "Year of study must be at least 1")
          .max(10, "Year of study cannot exceed 10"),
      otherwise: (schema) => schema.nullable(),
    }),
  specialRequirements: yup
    .string()
    .max(500, "Special requirements cannot exceed 500 characters"),
  dietaryRestrictions: yup
    .string()
    .max(300, "Dietary restrictions cannot exceed 300 characters"),
  emergencyContactName: yup
    .string()
    .max(100, "Emergency contact name cannot exceed 100 characters"),
  emergencyContactPhone: yup
    .string()
    .matches(
      /^[\+]?[\d\s\-\(\)]{10,}$/,
      "Please enter a valid emergency contact phone number"
    ),
  emergencyContactRelationship: yup
    .string()
    .max(50, "Relationship cannot exceed 50 characters"),
});

const RegistrationForm = ({ event, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registrationSchema),
    defaultValues: {
      role: "student",
    },
  });

  const watchedRole = watch("role");

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Prepare registration data
      const registrationData = {
        eventId: event._id,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.toLowerCase().trim(),
        universityId: data.universityId.trim(),
        role: data.role,
        department: data.department?.trim(),
        phoneNumber: data.phoneNumber?.trim(),
        specialRequirements: data.specialRequirements?.trim(),
        dietaryRestrictions: data.dietaryRestrictions?.trim(),
      };

      // Add year of study for students
      if (data.role === "student" && data.yearOfStudy) {
        registrationData.yearOfStudy = parseInt(data.yearOfStudy);
      }

      // Add emergency contact if provided
      if (data.emergencyContactName?.trim()) {
        registrationData.emergencyContact = {
          name: data.emergencyContactName.trim(),
          phone: data.emergencyContactPhone?.trim(),
          relationship: data.emergencyContactRelationship?.trim(),
        };
      }

      const response = await registrationAPI.registerForEvent(registrationData);
      
      toast.success("Registration successful!");
      onSuccess && onSuccess(response.data);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { value: "student", label: "Student" },
    { value: "staff", label: "Staff" },
    { value: "ta", label: "Teaching Assistant" },
    { value: "professor", label: "Professor" },
  ];

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: theme.spacing[6],
        background: theme.colors.background.paper,
        borderRadius: theme.borderRadius.card,
        boxShadow: theme.shadows.lg,
      }}
    >
      <div style={{ marginBottom: theme.spacing[6] }}>
        <h2
          style={{
            fontSize: theme.typography.fontSize["2xl"],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing[2],
            textAlign: "center",
          }}
        >
          Register for {event.title}
        </h2>
        <p
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
            textAlign: "center",
          }}
        >
          {event.type.charAt(0).toUpperCase() + event.type.slice(1)} •{" "}
          {new Date(event.startDate).toLocaleDateString()} • {event.location}
        </p>
        {event.cost > 0 && (
          <p
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.primary.main,
              fontWeight: theme.typography.fontWeight.semibold,
              textAlign: "center",
              marginTop: theme.spacing[2],
            }}
          >
            Registration Fee: ${event.cost}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Personal Information */}
        <div style={{ marginBottom: theme.spacing[6] }}>
          <h3
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[4],
            }}
          >
            Personal Information
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: theme.spacing[4],
              marginBottom: theme.spacing[4],
            }}
          >
            <Input
              label="First Name *"
              {...register("firstName")}
              error={errors.firstName?.message}
              placeholder="Enter your first name"
            />
            <Input
              label="Last Name *"
              {...register("lastName")}
              error={errors.lastName?.message}
              placeholder="Enter your last name"
            />
          </div>

          <div style={{ marginBottom: theme.spacing[4] }}>
            <Input
              label="Email Address *"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              placeholder="Enter your email address"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: theme.spacing[4],
              marginBottom: theme.spacing[4],
            }}
          >
            <Input
              label="University/Staff ID *"
              {...register("universityId")}
              error={errors.universityId?.message}
              placeholder="Enter your ID"
            />
            <Select
              label="Role *"
              {...register("role")}
              error={errors.role?.message}
              options={roleOptions}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: watchedRole === "student" ? "1fr 1fr" : "1fr",
              gap: theme.spacing[4],
              marginBottom: theme.spacing[4],
            }}
          >
            <Input
              label="Department"
              {...register("department")}
              error={errors.department?.message}
              placeholder="Enter your department"
            />
            {watchedRole === "student" && (
              <Input
                label="Year of Study *"
                type="number"
                min="1"
                max="10"
                {...register("yearOfStudy")}
                error={errors.yearOfStudy?.message}
                placeholder="e.g., 3"
              />
            )}
          </div>

          <Input
            label="Phone Number"
            {...register("phoneNumber")}
            error={errors.phoneNumber?.message}
            placeholder="Enter your phone number"
          />
        </div>

        {/* Additional Information */}
        <div style={{ marginBottom: theme.spacing[6] }}>
          <h3
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[4],
            }}
          >
            Additional Information
          </h3>

          <div style={{ marginBottom: theme.spacing[4] }}>
            <label
              style={{
                display: "block",
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[2],
              }}
            >
              Special Requirements
            </label>
            <textarea
              {...register("specialRequirements")}
              placeholder="Any special requirements or accommodations needed..."
              rows="3"
              style={{
                width: "100%",
                padding: theme.spacing[3],
                border: `2px solid ${
                  errors.specialRequirements
                    ? theme.colors.error.main
                    : theme.colors.border.light
                }`,
                borderRadius: theme.borderRadius.base,
                fontSize: theme.typography.fontSize.base,
                resize: "vertical",
                outline: "none",
                transition: "border-color 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.primary.main;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.specialRequirements
                  ? theme.colors.error.main
                  : theme.colors.border.light;
              }}
            />
            {errors.specialRequirements && (
              <p
                style={{
                  color: theme.colors.error.main,
                  fontSize: theme.typography.fontSize.sm,
                  marginTop: theme.spacing[1],
                }}
              >
                {errors.specialRequirements.message}
              </p>
            )}
          </div>

          <div style={{ marginBottom: theme.spacing[4] }}>
            <label
              style={{
                display: "block",
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[2],
              }}
            >
              Dietary Restrictions
            </label>
            <textarea
              {...register("dietaryRestrictions")}
              placeholder="Any dietary restrictions or allergies..."
              rows="2"
              style={{
                width: "100%",
                padding: theme.spacing[3],
                border: `2px solid ${
                  errors.dietaryRestrictions
                    ? theme.colors.error.main
                    : theme.colors.border.light
                }`,
                borderRadius: theme.borderRadius.base,
                fontSize: theme.typography.fontSize.base,
                resize: "vertical",
                outline: "none",
                transition: "border-color 0.2s ease",
                fontFamily: theme.typography.fontFamily.primary,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.primary.main;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.dietaryRestrictions
                  ? theme.colors.error.main
                  : theme.colors.border.light;
              }}
            />
            {errors.dietaryRestrictions && (
              <p
                style={{
                  color: theme.colors.error.main,
                  fontSize: theme.typography.fontSize.sm,
                  marginTop: theme.spacing[1],
                }}
              >
                {errors.dietaryRestrictions.message}
              </p>
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        <div style={{ marginBottom: theme.spacing[6] }}>
          <h3
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[4],
            }}
          >
            Emergency Contact (Optional)
          </h3>

          <div style={{ marginBottom: theme.spacing[4] }}>
            <Input
              label="Contact Name"
              {...register("emergencyContactName")}
              error={errors.emergencyContactName?.message}
              placeholder="Emergency contact full name"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: theme.spacing[4],
            }}
          >
            <Input
              label="Contact Phone"
              {...register("emergencyContactPhone")}
              error={errors.emergencyContactPhone?.message}
              placeholder="Emergency contact phone"
            />
            <Input
              label="Relationship"
              {...register("emergencyContactRelationship")}
              error={errors.emergencyContactRelationship?.message}
              placeholder="e.g., Parent, Spouse"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div
          style={{
            display: "flex",
            gap: theme.spacing[3],
            justifyContent: "flex-end",
            paddingTop: theme.spacing[4],
            borderTop: `1px solid ${theme.colors.border.light}`,
          }}
        >
          {onCancel && (
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            style={{
              minWidth: "140px",
            }}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;