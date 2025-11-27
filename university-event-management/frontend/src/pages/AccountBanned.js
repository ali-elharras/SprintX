import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import theme from "../theme";
import Button from "../components/Button";
import Card from "../components/Card";
import PreLoginNavbar from "../components/PreLoginNavbar";

const AccountBanned = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { banReason, bannedAt } = location.state || {};

  // If no ban info, redirect to login
  React.useEffect(() => {
    if (!banReason && banReason !== "") {
      navigate("/login", { replace: true });
    }
  }, [banReason, navigate]);

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
            maxWidth: "600px",
            padding: theme.spacing[8],
          }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: theme.colors.error.light,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              marginBottom: theme.spacing[6],
            }}
          >
            <span style={{ fontSize: "60px" }}>🚫</span>
          </div>

          <h1
            style={{
              fontSize: theme.typography.fontSize["3xl"],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.error.dark,
              textAlign: "center",
              marginBottom: theme.spacing[4],
            }}
          >
            Account Suspended
          </h1>

          <p
            style={{
              fontSize: theme.typography.fontSize.lg,
              color: theme.colors.text.secondary,
              textAlign: "center",
              marginBottom: theme.spacing[6],
              lineHeight: theme.typography.lineHeight.relaxed,
            }}
          >
            Your account has been suspended and you cannot access the platform
            at this time.
          </p>

          <div
            style={{
              backgroundColor: theme.colors.error.light,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing[5],
              marginBottom: theme.spacing[6],
              border: `2px solid ${theme.colors.error.main}`,
            }}
          >
            <div
              style={{
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.error.dark,
                marginBottom: theme.spacing[3],
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
              {banReason || "No reason provided"}
            </div>
          </div>

          {bannedAt && (
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                textAlign: "center",
                marginBottom: theme.spacing[6],
              }}
            >
              Suspended on:{" "}
              {new Date(bannedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}

          <div
            style={{
              backgroundColor: theme.colors.background.default,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing[5],
              marginBottom: theme.spacing[6],
              border: `1px solid ${theme.colors.border.default}`,
            }}
          >
            <div
              style={{
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[3],
                textAlign: "center",
              }}
            >
              Want to appeal this decision?
            </div>
            <div
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                textAlign: "center",
                marginBottom: theme.spacing[3],
              }}
            >
              Contact our support team at:
            </div>
            <a
              href="mailto:gucevents.noreply@gmail.com?subject=Account%20Suspension%20Appeal"
              style={{
                display: "block",
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.primary.main,
                textAlign: "center",
                textDecoration: "none",
                marginBottom: theme.spacing[3],
              }}
              onMouseEnter={(e) =>
                (e.target.style.textDecoration = "underline")
              }
              onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
            >
              gucevents.noreply@gmail.com
            </a>
            <p
              style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.text.secondary,
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              Please include your account email in your appeal
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => navigate("/login")}
            style={{ width: "100%" }}
          >
            Return to Login
          </Button>
        </Card>
      </div>
    </>
  );
};

export default AccountBanned;
