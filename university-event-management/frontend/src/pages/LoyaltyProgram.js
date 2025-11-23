import React, { useState, useEffect } from "react";
import api from "../services/api";
import theme from "../theme";
import LoadingScreen from "../components/LoadingScreen";

const LoyaltyProgram = () => {
  const [loyaltyPrograms, setLoyaltyPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLoyaltyPrograms();
  }, []);

  const fetchLoyaltyPrograms = async () => {
    try {
      setLoading(true);
      const response = await api.get("/loyalty/all");
      setLoyaltyPrograms(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching loyalty programs:", err);
      setError("Failed to load loyalty programs. Please try again later.");
      setLoyaltyPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const pageStyles = {
    minHeight: "100vh",
    backgroundColor: theme.colors.background.light,
    paddingBottom: theme.spacing[8],
  };

  const containerStyles = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: theme.spacing[6],
    fontFamily: theme.typography.fontFamily.primary,
  };

  const headerStyles = {
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
  };

  const gridStyles = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: theme.spacing[6],
    marginTop: theme.spacing[6],
  };

  const cardStyles = {
    backgroundColor: theme.colors.text.white,
    borderRadius: theme.components.card.borderRadius,
    padding: theme.spacing[6],
    boxShadow: theme.components.card.boxShadow,
    transition: "all 0.3s ease",
    border: "1px solid " + theme.colors.neutral.gray200,
  };

  const vendorLogoStyles = {
    width: "100%",
    height: "150px",
    borderRadius: "8px",
    marginBottom: theme.spacing[4],
    backgroundColor: theme.colors.neutral.gray100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    fontSize: theme.typography.fontSize["3xl"],
  };

  const vendorNameStyles = {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  };

  const vendorIndustryStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[4],
    textTransform: "capitalize",
  };

  const discountBadgeStyles = {
    display: "inline-block",
    backgroundColor: theme.colors.status.approved + "20",
    color: theme.colors.status.approved,
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    borderRadius: theme.components.badge.borderRadius,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[4],
    border: `2px solid ${theme.colors.status.approved}`,
  };

  const promoCodeContainerStyles = {
    backgroundColor: theme.colors.neutral.gray50,
    padding: theme.spacing[4],
    borderRadius: "8px",
    marginBottom: theme.spacing[4],
    border: `1px solid ${theme.colors.neutral.gray200}`,
  };

  const promoCodeLabelStyles = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
    marginBottom: theme.spacing[2],
  };

  const promoCodeStyles = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.main,
    fontFamily: "monospace",
    wordBreak: "break-all",
  };

  const termsStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 1.6,
    marginTop: theme.spacing[4],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.neutral.gray50,
    borderRadius: "8px",
    borderLeft: `4px solid ${theme.colors.primary.main}`,
  };

  const emptyStateStyles = {
    textAlign: "center",
    padding: theme.spacing[12],
    color: theme.colors.text.secondary,
  };

  const emptyStateIconStyles = {
    fontSize: "48px",
    marginBottom: theme.spacing[4],
  };

  const errorStyles = {
    backgroundColor: theme.colors.status.rejected + "20",
    color: theme.colors.status.rejected,
    padding: theme.spacing[4],
    borderRadius: theme.components.card.borderRadius,
    border: `1px solid ${theme.colors.status.rejected}`,
    marginTop: theme.spacing[4],
    textAlign: "center",
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div style={pageStyles}>
      <div style={containerStyles}>
        {/* Header */}
        <div style={headerStyles}>
          <h1 style={titleStyles}>💳 Loyalty Program Partners</h1>
          <p style={subtitleStyles}>
            Discover our partner vendors and enjoy exclusive discounts with your loyalty program membership
          </p>
        </div>

        {/* Error Message */}
        {error && <div style={errorStyles}>{error}</div>}

        {/* Content */}
        {loyaltyPrograms.length === 0 ? (
          <div style={emptyStateStyles}>
            <div style={emptyStateIconStyles}>🏪</div>
            <h2 style={{ fontSize: theme.typography.fontSize.xl, marginBottom: theme.spacing[2] }}>
              No Partners Yet
            </h2>
            <p>Check back soon for our loyalty program partners and exclusive discounts!</p>
          </div>
        ) : (
          <div style={gridStyles}>
            {loyaltyPrograms.map((program) => (
              <div
                key={program._id}
                style={cardStyles}
              >
                {/* Vendor Logo */}
                <div style={vendorLogoStyles}>
                  {program.Vendor?.logo ? (
                    <img
                      src={program.Vendor.logo}
                      alt={program.Vendor.companyName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: "48px" }}>🏢</span>
                  )}
                </div>

                {/* Vendor Name */}
                <h3 style={vendorNameStyles}>{program.Vendor?.companyName || "Unknown Vendor"}</h3>

                {/* Industry */}
                {program.Vendor?.industry && (
                  <p style={vendorIndustryStyles}>{program.Vendor.industry}</p>
                )}

                {/* Discount Badge */}
                <div style={discountBadgeStyles}>{program.discountRate}% OFF</div>

                {/* Promo Code */}
                <div style={promoCodeContainerStyles}>
                  <div style={promoCodeLabelStyles}>Promo Code</div>
                  <div style={promoCodeStyles}>{program.promoCode}</div>
                </div>

                {/* Terms and Conditions */}
                {program.termsAndConditions && (
                  <div style={{ marginTop: theme.spacing[4] }}>
                    <h4
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.semibold,
                        marginBottom: theme.spacing[2],
                        color: theme.colors.text.primary,
                      }}
                    >
                      Terms & Conditions
                    </h4>
                    <div style={termsStyles}>{program.termsAndConditions}</div>
                  </div>
                )}

                {/* Description */}
                {program.Vendor?.description && (
                  <div style={{ marginTop: theme.spacing[4] }}>
                    <h4
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.semibold,
                        marginBottom: theme.spacing[2],
                        color: theme.colors.text.primary,
                      }}
                    >
                      About
                    </h4>
                    <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, lineHeight: 1.6 }}>
                      {program.Vendor.description}
                    </p>
                  </div>
                )}

                {/* Contact Information */}
                <div
                  style={{
                    marginTop: theme.spacing[4],
                    paddingTop: theme.spacing[4],
                    borderTop: `1px solid ${theme.colors.neutral.gray200}`,
                  }}
                >
                  {program.Vendor?.email && (
                    <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing[2] }}>
                      📧 {program.Vendor.email}
                    </p>
                  )}
                  {program.Vendor?.phoneNumber && (
                    <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing[2] }}>
                      📱 {program.Vendor.phoneNumber}
                    </p>
                  )}
                  {program.Vendor?.website && (
                    <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                      🌐{" "}
                      <a
                        href={program.Vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: theme.colors.primary.main, textDecoration: "none" }}
                      >
                        {program.Vendor.website}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoyaltyProgram;
