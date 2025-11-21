import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import theme from "../theme";
import Button from "./Button";
import Input from "./Input";
import { registrationAPI } from "../services/api";
import PaymentModal from "./PaymentModal";

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registrationSchema),
  });

  const isPaidEvent = event?.cost && event.cost > 0;

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    console.log("Submitting registration for event:", event); // Debug
    console.log("Event cost:", event?.cost); // Debug
    console.log("Is paid event:", isPaidEvent); // Debug

    try {
      // Prepare registration data
      const regData = {
        eventId: event._id,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.toLowerCase().trim(),
        universityId: data.universityId.trim(),
        role: "student", // Default role since we removed the role field
      };

      const response = await registrationAPI.registerForEvent(regData);

      console.log("Full registration response:", response); // Debug log
      console.log("Response data:", response.data); // Debug log

      // The response structure is: response.data = { success, message, data, requiresPayment }
      const requiresPayment = response.data.requiresPayment;
      const registrationRecord = response.data.data;

      console.log("Requires payment?", requiresPayment); // Debug log
      console.log("Registration record:", registrationRecord); // Debug log

      // Check if payment is required
      if (requiresPayment) {
        // For paid events, backend returns registrationData (not a DB record)
        // Store this data to pass to payment
        const regDataForPayment =
          response.data.registrationData || registrationRecord;
        setRegistrationData(regDataForPayment);
        setShowPaymentModal(true);
        toast("Please complete payment to confirm your registration", {
          icon: "💳",
          duration: 4000,
        });
        // Don't reset isSubmitting here - keep it true until payment is complete
      } else {
        // Free event - registration complete
        toast.success("Registration successful!");
        // Notify other tabs/windows that a registration occurred so they can refresh
        try {
          const payload = JSON.stringify({
            eventId: event._id,
            ts: Date.now(),
          });
          localStorage.setItem("registration_made", payload);
        } catch (err) {
          // Ignore storage errors (e.g., quota)
        }
        setIsSubmitting(false);
        onSuccess && onSuccess(registrationRecord);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handlePaymentComplete = (success) => {
    setShowPaymentModal(false);
    setIsSubmitting(false);

    if (success) {
      toast.success("Registration and payment successful!");
      // Notify other tabs/windows that a registration occurred so they can refresh
      try {
        const payload = JSON.stringify({ eventId: event._id, ts: Date.now() });
        localStorage.setItem("registration_made", payload);
      } catch (err) {
        // Ignore storage errors (e.g., quota)
      }
      onSuccess && onSuccess(registrationData);
    } else {
      // Payment was cancelled - no registration was created
      toast.error("Payment cancelled. No registration was created.");
      onCancel && onCancel();
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
        {isPaidEvent && (
          <div
            style={{
              background: theme.colors.primary.light,
              padding: theme.spacing[3],
              borderRadius: "8px",
              textAlign: "center",
              marginTop: theme.spacing[3],
              border: `1px solid ${theme.colors.primary.main}`,
            }}
          >
            <p
              style={{
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.primary.dark,
                fontWeight: theme.typography.fontWeight.semibold,
                margin: 0,
                marginBottom: theme.spacing[1],
              }}
            >
              💳 Paid Event - ${event.cost}
            </p>
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.primary.dark,
                margin: 0,
              }}
            >
              Payment required after registration to secure your spot
            </p>
          </div>
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
            {isSubmitting
              ? "Registering..."
              : isPaidEvent
              ? "Register & Pay"
              : "Register"}
          </Button>
        </div>
      </form>

      {/* Payment Modal */}
      {showPaymentModal && registrationData && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentComplete}
          registrationId={registrationData._id} // Legacy: for old pending registrations
          registrationData={registrationData._id ? null : registrationData} // New flow: pass data if no _id
          amount={event.cost || 0}
          title={`Registration for ${event.title}`}
          type="event"
        />
      )}
    </div>
  );
};

export default RegistrationForm;
