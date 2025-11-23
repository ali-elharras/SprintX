import React from "react";
import AdminReports from "../components/Reports";
import theme from "../theme";

const ReportsPage = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: theme.colors.background.default,
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: theme.spacing[6],
        }}
      >
        <h1
          style={{
            fontSize: theme.typography.fontSize["3xl"],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing[2],
            fontFamily: theme.typography.fontFamily.primary,
            textAlign: "center",
          }}
        >
          Reports Dashboard
        </h1>
        <p
          style={{
            fontSize: theme.typography.fontSize.base,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing[6],
            fontFamily: theme.typography.fontFamily.primary,
            textAlign: "center",
          }}
        >
          View attendee and sales reports for all events
        </p>
        <AdminReports />
      </div>
    </div>
  );
};

export default ReportsPage;
