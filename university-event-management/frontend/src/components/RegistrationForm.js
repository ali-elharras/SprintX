import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import theme from "../theme";
import Button from "./Button";
import Input from "./Input";
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
      /^[A-Za-z0-9\-]+$/,
      "University/Staff ID can only contain letters, numbers, and dashes"
    )
    .max(20, "University/Staff ID cannot exceed 20 characters"),
});

const RegistrationForm = ({ event, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registrationSchema),
  });

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
        role: "student", // Default role since we removed the role field
      };

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
          {event.type.charAt(0).toUpperCase() + event.type.slice(1)} â€¢{" "}
          {new Date(event.startDate).toLocaleDateString()} â€¢ {event.location}
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

          <div style={{ marginBottom: theme.spacing[4] }}>
            <Input
              label="University/Staff ID *"
              {...register("universityId")}
              error={errors.universityId?.message}
              placeholder="Enter your University/Staff ID"
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