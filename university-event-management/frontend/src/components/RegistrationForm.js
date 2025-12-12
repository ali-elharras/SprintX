import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import theme from "../theme";
import Button from "./Button";
import Input from "./Input";
import { registrationAPI } from "../services/api";
import PaymentModal from "./PaymentModal";
import RewardPointsRedemption from "./RewardPointsRedemption";
import { useAuth } from "../context/AuthContext";

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
      /^[A-Za-z0-9-]+$/,
      "University/Staff ID can only contain letters, numbers, and dashes"
    )
    .max(20, "University/Staff ID cannot exceed 20 characters"),
});

const RegistrationForm = ({ event, onSuccess, onCancel }) => {
  const { user } = useAuth(); // Get authenticated user data
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [rewardInfo, setRewardInfo] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(registrationSchema),
  });

  const isPaidEvent = event?.cost && event.cost > 0;

  // Auto-fill form with user data when component mounts
  useEffect(() => {
    if (user) {
      console.log("Auto-filling form with user data:", user);
      
      // Set form values with user data
      setValue("firstName", user.firstName || "", { shouldValidate: false });
      setValue("lastName", user.lastName || "", { shouldValidate: false });
      setValue("email", user.email || "", { shouldValidate: false });
      setValue("universityId", user.universityId || "", { shouldValidate: false });
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    console.log("Submitting registration for event:", event);
    console.log("Event cost:", event?.cost);
    console.log("Is paid event:", isPaidEvent);

    try {
      // Prepare registration data
      const regData = {
        eventId: event._id,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.toLowerCase().trim(),
        universityId: data.universityId.trim(),
        role: user?.role || "student", // Use authenticated user's role
        useRewardPoints: rewardInfo?.pointsToUse > 0,
        pointsToRedeem: rewardInfo?.pointsToUse || 0,
      };

      const response = await registrationAPI.registerForEvent(regData);

      console.log("Full registration response:", response);
      console.log("Response data:", response.data);

      // Check if user was added to waiting list
      if (response.data.onWaitingList) {
        setIsSubmitting(false);
        toast.success(`You've been added to the waiting list (Position #${response.data.waitingListPosition})`, {
          duration: 6000,
          icon: "⏳",
        });
        if (onSuccess) {
          onSuccess({
            onWaitingList: true,
            waitingListPosition: response.data.waitingListPosition,
            event: event
          });
        }
        return;
      }

      const requiresPayment = response.data.requiresPayment;
      const registrationRecord = response.data.data;

      console.log("Requires payment?", requiresPayment);
      console.log("Registration record:", registrationRecord);

      // Check if payment is required
      if (requiresPayment) {
        const regDataForPayment =
          response.data.registrationData || registrationRecord;
        setRegistrationData(regDataForPayment);
        setShowPaymentModal(true);
        toast("Please complete payment to confirm your registration", {
          icon: "💳",
          duration: 4000,
        });
      } else {
        // Free event - registration complete
        // Note: Success toast is shown by parent component (EventCard)
        
        // Notify other tabs/windows
        try {
        const payload = JSON.stringify({
          eventId: event._id,
          ts: Date.now(),
          userId: user?.id
        });
        localStorage.setItem("registration_made", payload);
      } catch (err) {
        // Ignore storage errors
      }
        
        setIsSubmitting(false);
       if (onSuccess) {
        onSuccess({
          ...registrationRecord,
          event: event
        });
      }
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
      // Note: Success toast is shown by PaymentModal for balance payments
      // For Stripe payments, success is shown on PaymentSuccess page
      
      // Notify other tabs/windows
      try {
        const payload = JSON.stringify({ eventId: event._id, ts: Date.now() });
        localStorage.setItem("registration_made", payload);
      } catch (err) {
        // Ignore storage errors
      }
      
     // ✅ IMPORTANT: Pass the registration data back to parent
    // This will trigger a refresh of user registrations
    if (onSuccess) {
      onSuccess({
        ...registrationData,
        event: event,
        status: 'confirmed',
        paymentStatus: 'completed'
      });
    }
  } else {
    toast.error("Payment cancelled. No registration was created.");
    onCancel && onCancel();
  }
};

  // Reset form to user's original data
  const handleResetForm = () => {
    if (user) {
      setValue("firstName", user.firstName || "");
      setValue("lastName", user.lastName || "");
      setValue("email", user.email || "");
      setValue("universityId", user.universityId || "");
      toast.success("Form reset to your profile information");
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
          {event.type.charAt(0).toUpperCase() + event.type.slice(1)} •{" "}
          {new Date(event.startDate).toLocaleDateString()} • {event.location}
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
        
        {/* Auto-fill notification */}
        {user && (
          <div
            style={{
              background: theme.colors.success.light,
              padding: theme.spacing[3],
              borderRadius: "8px",
              marginTop: theme.spacing[3],
              border: `1px solid ${theme.colors.success.main}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2] }}>
              <span style={{ fontSize: "1.2rem" }}>✨</span>
              <p
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.success.dark,
                  margin: 0,
                }}
              >
                Form auto-filled with your profile data. You can edit if needed.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetForm}
              style={{
                fontSize: theme.typography.fontSize.xs,
                padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
              }}
            >
              Reset
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Reward Points Redemption - Only for paid events */}
        {isPaidEvent && user && (
          <div style={{ marginBottom: theme.spacing[6] }}>
            <RewardPointsRedemption
              eventCost={event.cost}
              onPointsChange={(info) => setRewardInfo(info)}
            />
          </div>
        )}

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
          registrationId={registrationData._id}
          registrationData={registrationData._id ? null : registrationData}
          amount={event.cost || 0}
          title={`Registration for ${event.title}`}
          type="event"
        />
      )}
    </div>
  );
};

export default RegistrationForm;