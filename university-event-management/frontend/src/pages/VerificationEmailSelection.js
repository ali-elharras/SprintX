import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/auth";
import theme from "../theme";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

// Validation schema for verification email
const verificationEmailSchema = yup.object({
  verificationEmail: yup
    .string()
    .required("Please select or enter an email for verification")
    .email("Please enter a valid email address"),
});

const VerificationEmailSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(verificationEmailSchema),
    defaultValues: {
      verificationEmail: "",
    },
  });

  // Get user data from registration
  const userData = location.state?.userData;
  const originalEmail = userData?.email;

  // If no user data, redirect back to signup
  if (!userData || !originalEmail) {
    navigate("/signup/user");
    return null;
  }

  const watchedEmail = watch("verificationEmail");

  // Handle clicking on the original email button
  const handleSelectOriginalEmail = () => {
    setSelectedEmail(originalEmail);
    setValue("verificationEmail", originalEmail);
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Call API to complete registration with verification email
      const completeRegistrationData = {
        userId: location.state?.userId,
        verificationEmail: data.verificationEmail,
      };

      // Use API service to complete registration
      const responseData = await authAPI.completeUserRegistration(
        completeRegistrationData
      );

      if (responseData.success) {
        // Store auth data if provided
        if (responseData.data?.token) {
          const authData = {
            token: responseData.data.token,
            user: responseData.data.user,
            userType: "user",
          };

          // Store in localStorage
          localStorage.setItem("token", responseData.data.token);
          localStorage.setItem("user", JSON.stringify(responseData.data.user));
          localStorage.setItem("userType", "user");
        }

        // Navigate to success page instead of showing toast
        navigate("/verification-success");
      } else {
        toast.error(
          responseData.message || "Registration failed. Please try again."
        );
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
    maxWidth: "500px",
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

  const formStyles = {
    display: "grid",
    gap: theme.spacing[6],
  };

  const emailOptionStyles = {
    padding: theme.spacing[4],
    border: `2px solid ${
      selectedEmail === originalEmail
        ? theme.colors.primary.main
        : theme.colors.border.light
    }`,
    borderRadius: theme.borderRadius.lg,
    backgroundColor:
      selectedEmail === originalEmail
        ? theme.colors.primary.light + "20"
        : "white",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textAlign: "center",
  };

  const orDividerStyles = {
    display: "flex",
    alignItems: "center",
    margin: `${theme.spacing[4]} 0`,
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  };

  const dividerLineStyles = {
    flex: 1,
    height: "1px",
    backgroundColor: theme.colors.border.light,
  };

  return (
    <div style={containerStyles}>
      <Card style={cardStyles}>
        <div style={headerStyles}>
          <h1 style={titleStyles}>Choose Verification Email</h1>
          <p style={subtitleStyles}>
            Select an email address to receive your verification link
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={formStyles}>
          {/* Original Email Option */}
          <div style={emailOptionStyles} onClick={handleSelectOriginalEmail}>
            <h3
              style={{
                margin: "0 0 8px 0",
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.medium,
              }}
            >
              Use your registered email:
            </h3>
            <p
              style={{
                margin: 0,
                color: theme.colors.primary.main,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
              }}
            >
              {originalEmail}
            </p>
          </div>

          {/* OR Divider */}
          <div style={orDividerStyles}>
            <div style={dividerLineStyles}></div>
            <span style={{ margin: `0 ${theme.spacing[4]}` }}>OR</span>
            <div style={dividerLineStyles}></div>
          </div>

          {/* Custom Email Input */}
          <div>
            <Input
              label="Enter a different email address"
              type="email"
              placeholder="Enter alternative email for verification"
              error={errors.verificationEmail?.message}
              {...register("verificationEmail")}
              style={{
                borderColor:
                  selectedEmail !== originalEmail && watchedEmail
                    ? theme.colors.primary.main
                    : undefined,
              }}
              onChange={(e) => {
                setSelectedEmail(e.target.value);
                setValue("verificationEmail", e.target.value);
              }}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting || !watchedEmail}
            style={{
              marginTop: theme.spacing[4],
            }}
          >
            {isSubmitting
              ? "Completing Registration..."
              : "Complete Registration"}
          </Button>
        </form>

        {/* Back Link */}
        <div
          style={{
            textAlign: "center",
            marginTop: theme.spacing[6],
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
          }}
        >
          Need to go back?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup/user")}
            style={{
              background: "none",
              border: "none",
              color: theme.colors.primary.main,
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "inherit",
            }}
          >
            Return to registration
          </button>
        </div>
      </Card>
    </div>
  );
};

export default VerificationEmailSelection;
