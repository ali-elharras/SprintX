import React, { useState, useEffect } from "react";
import axios from "axios";
import theme from "../theme";
import Navbar from "../components/Navbar";
import LoadingScreen from "../components/LoadingScreen";

const LoyaltyProgram = () => {
  const [loyaltyPrograms, setLoyaltyPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    fetchLoyaltyPrograms();
  }, []);

  const fetchLoyaltyPrograms = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/loyalty-program/all");
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
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "1px solid " + theme.colors.neutral.gray200,
  };

  const cardHoverStyles = {
    ...cardStyles,
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.12)",
    transform: "translateY(-4px)",
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

  const modalOverlayStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: selectedVendor ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const modalContentStyles = {
    backgroundColor: theme.colors.text.white,
    borderRadius: theme.components.card.borderRadius,
    padding: theme.spacing[8],
    maxWidth: "600px",
    maxHeight: "80vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  };

  const closeButtonStyles = {
    float: "right",
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.secondary,
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: theme.spacing[2],
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div style={pageStyles}>
      <Navbar />
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
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, {
                    ...cardHoverStyles,
                  });
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, cardStyles);
                }}
                onClick={() => setSelectedVendor(program)}
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

                {/* Click to View Details */}
                <div
                  style={{
                    textAlign: "center",
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.primary.main,
                    cursor: "pointer",
                  }}
                >
                  Click to view details →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <div style={modalOverlayStyles} onClick={() => setSelectedVendor(null)}>
        <div style={modalContentStyles} onClick={(e) => e.stopPropagation()}>
          <button style={closeButtonStyles} onClick={() => setSelectedVendor(null)}>
            ✕
          </button>

          {selectedVendor && (
            <>
              {/* Vendor Logo in Modal */}
              <div style={{ ...vendorLogoStyles, marginTop: theme.spacing[4] }}>
                {selectedVendor.Vendor?.logo ? (
                  <img
                    src={selectedVendor.Vendor.logo}
                    alt={selectedVendor.Vendor.companyName}
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
              <h2 style={{ ...vendorNameStyles, marginTop: theme.spacing[4] }}>
                {selectedVendor.Vendor?.companyName || "Unknown Vendor"}
              </h2>

              {/* Industry */}
              {selectedVendor.Vendor?.industry && (
                <p style={vendorIndustryStyles}>{selectedVendor.Vendor.industry}</p>
              )}

              {/* Discount */}
              <div style={discountBadgeStyles}>{selectedVendor.discountRate}% OFF</div>

              {/* Promo Code */}
              <div style={promoCodeContainerStyles}>
                <div style={promoCodeLabelStyles}>Promo Code</div>
                <div style={promoCodeStyles}>{selectedVendor.promoCode}</div>
              </div>

              {/* Terms and Conditions */}
              {selectedVendor.termsAndConditions && (
                <div>
                  <h3
                    style={{
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: theme.typography.fontWeight.semibold,
                      marginBottom: theme.spacing[2],
                      marginTop: theme.spacing[4],
                    }}
                  >
                    Terms & Conditions
                  </h3>
                  <div style={termsStyles}>{selectedVendor.termsAndConditions}</div>
                </div>
              )}

              {/* Additional Vendor Info */}
              {selectedVendor.Vendor?.description && (
                <div style={{ marginTop: theme.spacing[6] }}>
                  <h3
                    style={{
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: theme.typography.fontWeight.semibold,
                      marginBottom: theme.spacing[2],
                    }}
                  >
                    About
                  </h3>
                  <p style={{ color: theme.colors.text.secondary, lineHeight: 1.6 }}>
                    {selectedVendor.Vendor.description}
                  </p>
                </div>
              )}

              {/* Contact Information */}
              <div
                style={{
                  marginTop: theme.spacing[6],
                  paddingTop: theme.spacing[4],
                  borderTop: `1px solid ${theme.colors.neutral.gray200}`,
                }}
              >
                <h3
                  style={{
                    fontSize: theme.typography.fontSize.base,
                    fontWeight: theme.typography.fontWeight.semibold,
                    marginBottom: theme.spacing[3],
                  }}
                >
                  Contact Information
                </h3>
                {selectedVendor.Vendor?.email && (
                  <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing[2] }}>
                    📧 Email: {selectedVendor.Vendor.email}
                  </p>
                )}
                {selectedVendor.Vendor?.phoneNumber && (
                  <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing[2] }}>
                    📱 Phone: {selectedVendor.Vendor.phoneNumber}
                  </p>
                )}
                {selectedVendor.Vendor?.website && (
                  <p style={{ color: theme.colors.text.secondary }}>
                    🌐 Website:{" "}
                    <a
                      href={selectedVendor.Vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: theme.colors.primary.main, textDecoration: "none" }}
                    >
                      {selectedVendor.Vendor.website}
                    </a>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyProgram;
