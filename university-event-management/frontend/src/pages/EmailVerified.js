import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import theme from "../theme";
import Card from "../components/Card";
import Button from "../components/Button";
import PreLoginNavbar from "../components/PreLoginNavbar";
import { useAuth } from "../context/AuthContext";

const EmailVerified = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, isLoading } = useAuth();
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  // Parse query parameters
  const urlParams = new URLSearchParams(location.search);
  const success = urlParams.get("success") === "true";
  const reason = urlParams.get("reason");
  const email = urlParams.get("email");

  // If user is authenticated (e.g., admin who approved), log them out
  useEffect(() => {
    if (isAuthenticated && !isLoading && !hasLoggedOut) {
      console.log("Logging out current user to allow verified user to login");
      logout();
      setHasLoggedOut(true);
    }
  }, [isAuthenticated, isLoading, hasLoggedOut, logout]);

  const handleContinue = () => {
    navigate("/login");
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
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "center",
  };

  const iconStyles = {
    fontSize: "4rem",
    marginBottom: theme.spacing[6],
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
  };

  const messageStyles = {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    lineHeight: "1.6",
    marginBottom: theme.spacing[8],
  };

  const infoBoxStyles = {
    backgroundColor: theme.colors.background.light,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[8],
    border: `1px solid ${theme.colors.border.light}`,
  };

  // Success view
  if (success) {
    return (
      <>
        <PreLoginNavbar />
        <div style={containerStyles}>
          <Card style={cardStyles}>
            <div style={{ ...iconStyles, color: theme.colors.success.main }}>
              ✅
            </div>

            <h1 style={titleStyles}>Email Verified Successfully!</h1>

            <p style={messageStyles}>
              Your email address has been verified and your account is now
              active. You can now log in to access all features.
            </p>

            {email && (
              <div style={infoBoxStyles}>
                <p
                  style={{
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.text.secondary,
                    margin: 0,
                  }}
                >
                  <strong>Email:</strong> {decodeURIComponent(email)}
                </p>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              onClick={handleContinue}
              style={{
                width: "100%",
                maxWidth: "300px",
              }}
            >
              Continue to Login
            </Button>

            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.muted,
                marginTop: theme.spacing[4],
              }}
            >
              Ready to explore campus events and activities!
            </p>
          </Card>
        </div>
      </>
    );
  }

  // Error view
  let errorTitle = "Verification Failed";
  let errorMessage = "We couldn't verify your email address.";

  if (reason === "expired") {
    errorTitle = "Verification Link Expired";
    errorMessage =
      "Your verification link has expired. Please contact the administrator to request a new verification email.";
  } else if (reason === "invalid") {
    errorTitle = "Invalid Verification Link";
    errorMessage =
      "The verification link is invalid or has already been used. Please contact the administrator for assistance.";
  } else if (reason === "no-token") {
    errorTitle = "Invalid Link Format";
    errorMessage =
      "The verification link format is invalid. Please use the link provided in your email.";
  }

  return (
    <>
      <PreLoginNavbar />
      <div style={containerStyles}>
        <Card style={cardStyles}>
          <div style={{ ...iconStyles, color: theme.colors.error.main }}>
            ❌
          </div>

          <h1 style={titleStyles}>{errorTitle}</h1>

          <p style={messageStyles}>{errorMessage}</p>

          <div
            style={{
              ...infoBoxStyles,
              borderColor: theme.colors.error.light,
              backgroundColor: theme.colors.error.lighter || "#fef2f2",
            }}
          >
            <p
              style={{
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.secondary,
                margin: 0,
              }}
            >
              💡 <strong>Need help?</strong> Contact your system administrator
              for assistance with your account verification.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleContinue}
            style={{
              width: "100%",
              maxWidth: "300px",
            }}
          >
            Back to Login
          </Button>
        </Card>
      </div>
    </>
  );
};

export default EmailVerified;
