import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import Lottie from "lottie-react";

import { useAuth } from "../context/AuthContext";
import theme from "../theme";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import PreLoginNavbar from "../components/PreLoginNavbar";
import universityAnimation from "../assets/animations/universityMemberAnimation.json";

// Function to detect if email is GUC email format
const isGUCEmail = (email) => {
  return /^[a-zA-Z0-9._%+-]+@(student\.)?guc\.edu\.eg$/i.test(email);
};

// Validation schema
const loginSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup.string().required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, loginVendor, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [banInfo, setBanInfo] = useState(null);

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const watchedEmail = watch("email");
  const isUniversityEmail = isGUCEmail(watchedEmail);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Validate email format first
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(data.email)) {
        toast.error(
          "Please enter a valid email address with domain extension (e.g., name@domain.com)"
        );
        setIsSubmitting(false);
        return;
      }

      let result;
      let isVendorLogin = false;

      // Try university login first if it's a GUC email
      if (isGUCEmail(data.email)) {
        result = await loginUser({
          email: data.email,
          password: data.password,
        });
      } else {
        // Try vendor login for non-GUC emails
        result = await loginVendor({
          email: data.email,
          password: data.password,
        });
        isVendorLogin = true;
      }

      if (result.success) {
        if (isVendorLogin) {
          // Vendor login successful
          const accountData = result.data.vendor;
          toast.success(
            `Welcome back, ${
              accountData.organizationName || accountData.email
            }!`
          );
          navigate("/vendor-dashboard", { replace: true });
        } else {
          // University member login successful
          const accountData = result.data.user;
          toast.success(
            `Welcome back, ${accountData.firstName} ${accountData.lastName}!`
          );

          // Route based on user role
          if (
            accountData.role === "admin" ||
            accountData.role === "events_office"
          ) {
            navigate("/admin-dashboard", { replace: true });
          } else {
            navigate(from, { replace: true });
          }
        }
      } else {
        // Check if account is banned (applies to both users and vendors)
        if (result.isBanned) {
          console.log("Account is banned, showing ban info");
          setBanInfo({
            reason: result.banReason,
            bannedAt: result.bannedAt,
          });
          setIsSubmitting(false);
          return;
        }

        // Handle university member verification issues
        if (!isVendorLogin) {
          console.log("Login result:", result);

          // Check if user has pending role (awaiting admin approval)
          if (result.isPending) {
            toast.error(
              result.error ||
                `Your ${
                  result.data?.requestedRole || "role"
                } request is pending admin approval. Please wait for approval to access your account.`,
              {
                duration: 6000,
              }
            );
            return;
          }

          // Check if verification email is required (incomplete registration)
          if (result.requiresVerificationEmail) {
            console.log("Navigating to verification-email-selection");
            navigate("/verification-email-selection", {
              state: {
                userData: result.data?.userData,
                userId: result.data?.userId,
              },
            });
            return;
          }

          // Check if verification email has been sent but user hasn't verified
          if (result.emailVerificationSent && result.canReapply) {
            console.log("Navigating to verification-pending with data:", {
              userId: result.data?.userId,
              email: result.data?.email,
              verificationEmail: result.data?.verificationEmail,
              message: result.error,
            });
            navigate("/verification-pending", {
              state: {
                userId: result.data?.userId,
                email: result.data?.email,
                verificationEmail: result.data?.verificationEmail,
                message: result.error,
              },
            });
            return;
          }
        }

        toast.error(
          result.error || "Login failed. Please check your credentials."
        );
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Login error:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PreLoginNavbar />
      <div
        style={{
          minHeight: "100vh",
          background: theme.colors.background.gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing[8],
          fontFamily: theme.typography.fontFamily.primary,
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: "1000px",
            overflow: "hidden",
            boxShadow: theme.shadows["2xl"],
            background: theme.colors.background.paper,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              minHeight: "600px",
            }}
          >
            {/* Left Side - Login Form */}
            <div
              style={{
                padding: theme.spacing[12],
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                background: theme.colors.background.paper,
                borderRight: `2px solid ${theme.colors.border.light}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: theme.spacing[6],
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: theme.spacing[3],
                  }}
                >
                  <h1
                    style={{
                      color: theme.colors.text.primary,
                      fontSize: theme.typography.fontSize["4xl"],
                      fontWeight: theme.typography.fontWeight.bold,
                      lineHeight: "1.2",
                    }}
                  >
                    SprintX Login
                  </h1>
                  <p
                    style={{
                      color: theme.colors.text.secondary,
                      fontSize: theme.typography.fontSize.lg,
                      lineHeight: "1.5",
                    }}
                  >
                    Access your account to discover and participate in campus
                    events
                  </p>
                </div>

                {/* Login Form */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: theme.spacing[6],
                    marginTop: theme.spacing[8],
                  }}
                >
                  {/* Email Field */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: theme.spacing[2],
                    }}
                  >
                    <label
                      htmlFor="email"
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.text.primary,
                      }}
                    >
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      {...register("email")}
                      error={errors.email?.message}
                      style={{
                        height: "48px",
                      }}
                    />
                  </div>

                  {/* Password Field */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: theme.spacing[2],
                      position: "relative",
                    }}
                  >
                    <label
                      htmlFor="password"
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.text.primary,
                      }}
                    >
                      Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...register("password")}
                        error={errors.password?.message}
                        style={{
                          height: "48px",
                          paddingRight: "48px",
                          marginBottom: 0,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "0",
                          background: "none",
                          border: "none",
                          outline: "none",
                          cursor: "pointer",
                          color: theme.colors.text.secondary,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                          width: "24px",
                          height: "48px",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color =
                            theme.colors.text.primary)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color =
                            theme.colors.text.secondary)
                        }
                      >
                        {showPassword ? (
                          <Eye style={{ width: "20px", height: "20px" }} />
                        ) : (
                          <EyeOff style={{ width: "20px", height: "20px" }} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sign In Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    style={{
                      width: "100%",
                      height: "48px",
                      background: theme.colors.primary.gradient,
                      color: theme.colors.text.white,
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: theme.typography.fontWeight.medium,
                      border: "none",
                      borderRadius: theme.borderRadius.md,
                      cursor:
                        isSubmitting || isLoading ? "not-allowed" : "pointer",
                      opacity: isSubmitting || isLoading ? 0.7 : 1,
                      boxShadow: theme.shadows.lg,
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      !isSubmitting &&
                      !isLoading &&
                      (e.currentTarget.style.opacity = "0.9")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    {isSubmitting || isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>

                {/* Additional Links */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: theme.spacing[3],
                    textAlign: "center",
                    paddingTop: theme.spacing[4],
                  }}
                >
                  <p
                    style={{
                      color: theme.colors.text.secondary,
                      fontSize: theme.typography.fontSize.sm,
                    }}
                  >
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/signup")}
                      style={{
                        background: "none",
                        border: "none",
                        color: theme.colors.primary.main,
                        cursor: "pointer",
                        fontWeight: theme.typography.fontWeight.medium,
                        fontSize: theme.typography.fontSize.sm,
                        padding: 0,
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color =
                          theme.colors.primary.dark)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color =
                          theme.colors.primary.main)
                      }
                    >
                      Sign up Here
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    style={{
                      background: "none",
                      border: "none",
                      color: theme.colors.primary.main,
                      cursor: "pointer",
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium,
                      padding: 0,
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = theme.colors.primary.dark)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = theme.colors.primary.main)
                    }
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Animation */}
            <div
              style={{
                position: "relative",
                background:
                  "linear-gradient(135deg, #694fffff 0%, #724fc4ff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: theme.spacing[8],
              }}
            >
              <Lottie
                animationData={universityAnimation}
                loop={true}
                style={{
                  width: "380px",
                  height: "380px",
                }}
              />
            </div>
          </div>
        </Card>

        {/* Ban Alert Modal */}
        {banInfo && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: theme.zIndex.modal,
              padding: theme.spacing[4],
              animation: 'fadeIn 0.3s ease-out',
            }}
            onClick={() => setBanInfo(null)}
          >
            <div
              style={{
                backgroundColor: theme.colors.background.paper,
                borderRadius: theme.borderRadius.xl,
                boxShadow: theme.shadows['2xl'],
                maxWidth: '500px',
                width: '100%',
                padding: theme.spacing[6],
                animation: 'slideInUp 0.3s ease-out',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: theme.colors.error.light,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  marginBottom: theme.spacing[4],
                }}
              >
                <span style={{ fontSize: '40px' }}>🚫</span>
              </div>
              <h2
                style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.error.dark,
                  textAlign: 'center',
                  marginBottom: theme.spacing[3],
                }}
              >
                Account Suspended
              </h2>
              <p
                style={{
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                  marginBottom: theme.spacing[4],
                }}
              >
                Your account has been suspended and you cannot access the platform at this time.
              </p>
              <div
                style={{
                  backgroundColor: theme.colors.error.light,
                  borderRadius: theme.borderRadius.md,
                  padding: theme.spacing[4],
                  marginBottom: theme.spacing[4],
                  border: `2px solid ${theme.colors.error.main}`,
                }}
              >
                <div
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.error.dark,
                    marginBottom: theme.spacing[2],
                  }}
                >
                  Reason for Suspension:
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.text.primary,
                    lineHeight: theme.typography.lineHeight.relaxed,
                  }}
                >
                  {banInfo.reason}
                </div>
              </div>
              {banInfo.bannedAt && (
                <p
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                    textAlign: 'center',
                    marginBottom: theme.spacing[4],
                  }}
                >
                  Suspended on: {new Date(banInfo.bannedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
              <Button
                variant="primary"
                onClick={() => setBanInfo(null)}
                style={{ width: '100%' }}
              >
                I Understand
              </Button>
              <style>
                {`
                  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                  @keyframes slideInUp { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }
                `}
              </style>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;
