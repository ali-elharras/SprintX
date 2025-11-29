import React, { useState, useEffect } from "react";
import api from "../services/api";
import theme from "../theme";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";

const LoyaltyProgram = () => {
  const [loyaltyPrograms, setLoyaltyPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const { user } = useAuth();

  // Check if user is admin or events_office
  const canViewDocuments = user && (user.role === "admin" || user.role === "events_office");

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

  const handleViewDocument = (program) => {
    const getFileExtensionAndType = (url) => {
      if (!url) return { extension: 'pdf', isImage: false };
      try {
        // Extract extension from URL path
        const urlPath = new URL(url).pathname;
        const parts = urlPath.split('.');
        const extension = parts.length > 1 ? parts.pop().toLowerCase() : '';
        
        // Common image extensions
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
        if (imageExtensions.includes(extension)) {
          return { extension, isImage: true };
        }
        
        // Common document extensions
        if (['pdf', 'doc', 'docx'].includes(extension)) {
          return { extension, isImage: false };
        }
        
        // Check if URL contains image indicators (ImageKit pattern)
        if (url.includes('ik.imagekit.io') || url.includes('tax-cards') || url.includes('logos')) {
          // Likely an image from ImageKit, default to jpg
          return { extension: extension || 'jpg', isImage: true };
        }
        
        // Default to pdf
        return { extension: extension || 'pdf', isImage: false };
      } catch (e) {
        return { extension: 'pdf', isImage: false };
      }
    };

    const fileInfo = getFileExtensionAndType(program.Vendor?.taxCardUrl);
    
    setSelectedDocument({
      vendorName: program.Vendor?.companyName || "Unknown Vendor",
      documentUrl: program.Vendor?.taxCardUrl,
      uploadedAt: program.Vendor?.taxCardUploadedAt,
      fileExtension: fileInfo.extension,
      isImage: fileInfo.isImage,
    });
    setShowDocumentModal(true);
  };

  const handleCloseModal = () => {
    setShowDocumentModal(false);
    setSelectedDocument(null);
  };

  const handleDownloadDocument = async () => {
    if (selectedDocument?.documentUrl) {
      try {
        // Fetch the document as a blob
        const response = await fetch(selectedDocument.documentUrl);
        const blob = await response.blob();
        
        // Create a temporary URL for the blob
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Create a temporary link and trigger download
        const link = document.createElement("a");
        link.href = blobUrl;
        const extension = selectedDocument.fileExtension || 'pdf';
        link.download = `${selectedDocument.vendorName}_tax_card.${extension}`;
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Error downloading document:", error);
        // Fallback: open in new tab
        window.open(selectedDocument.documentUrl, "_blank");
      }
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

  const viewDocumentButtonStyles = {
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.text.white,
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    borderRadius: theme.components.button.borderRadius,
    border: "none",
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: "pointer",
    transition: "all 0.3s ease",
    width: "100%",
    marginTop: theme.spacing[4],
  };

  const modalOverlayStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: theme.spacing[4],
  };

  const modalContentStyles = {
    backgroundColor: theme.colors.text.white,
    borderRadius: theme.components.card.borderRadius,
    padding: theme.spacing[8],
    maxWidth: "900px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    position: "relative",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  };

  const modalHeaderStyles = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[6],
    paddingBottom: theme.spacing[4],
    borderBottom: `2px solid ${theme.colors.neutral.gray200}`,
  };

  const modalTitleStyles = {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    margin: 0,
  };

  const closeButtonStyles = {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "28px",
    cursor: "pointer",
    color: theme.colors.text.secondary,
    padding: theme.spacing[2],
    lineHeight: 1,
    transition: "color 0.3s ease",
  };

  const documentViewerStyles = {
    width: "100%",
    height: "600px",
    border: `1px solid ${theme.colors.neutral.gray200}`,
    borderRadius: "8px",
    marginBottom: theme.spacing[6],
    backgroundColor: theme.colors.neutral.gray50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "auto",
    padding: theme.spacing[2],
  };

  const modalButtonsContainerStyles = {
    display: "flex",
    gap: theme.spacing[4],
    justifyContent: "flex-end",
  };

  const downloadButtonStyles = {
    backgroundColor: theme.colors.status.approved,
    color: theme.colors.text.white,
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    borderRadius: theme.components.button.borderRadius,
    border: "none",
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[2],
  };

  const cancelButtonStyles = {
    backgroundColor: theme.colors.neutral.gray200,
    color: theme.colors.text.primary,
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    borderRadius: theme.components.button.borderRadius,
    border: "none",
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: "pointer",
    transition: "all 0.3s ease",
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

                {/* View Document Button - Only for Admin and Events Office */}
                {canViewDocuments && program.Vendor?.taxCardUrl && (
                  <button
                    style={viewDocumentButtonStyles}
                    onClick={() => handleViewDocument(program)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.primary.dark;
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.primary.main;
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    📄 View Vendor Document
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {showDocumentModal && selectedDocument && (
        <div style={modalOverlayStyles} onClick={handleCloseModal}>
          <div style={modalContentStyles} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={modalHeaderStyles}>
              <h2 style={modalTitleStyles}>
                📄 Vendor Document - {selectedDocument.vendorName}
              </h2>
              <button
                style={closeButtonStyles}
                onClick={handleCloseModal}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme.colors.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.colors.text.secondary;
                }}
              >
                ×
              </button>
            </div>

            {/* Document Info */}
            {selectedDocument.uploadedAt && (
              <p style={{ 
                fontSize: theme.typography.fontSize.sm, 
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[4] 
              }}>
                📅 Uploaded: {new Date(selectedDocument.uploadedAt).toLocaleDateString()}
              </p>
            )}

            {/* Document Viewer */}
            <div style={documentViewerStyles}>
              {selectedDocument.documentUrl ? (
                selectedDocument.isImage ? (
                  <img
                    src={selectedDocument.documentUrl}
                    alt="Tax Card"
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = '<p style="color: ' + theme.colors.text.secondary + '">Failed to load image</p>';
                    }}
                  />
                ) : (
                  <iframe
                    src={selectedDocument.documentUrl}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      borderRadius: "8px",
                    }}
                    title="Vendor Document"
                  />
                )
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: theme.colors.text.secondary,
                  }}
                >
                  <p>No document available</p>
                </div>
              )}
            </div>

            {/* Modal Buttons */}
            <div style={modalButtonsContainerStyles}>
              <button
                style={cancelButtonStyles}
                onClick={handleCloseModal}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.neutral.gray300;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.neutral.gray200;
                }}
              >
                Close
              </button>
              {selectedDocument.documentUrl && (
                <button
                  style={downloadButtonStyles}
                  onClick={handleDownloadDocument}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.status.approved + "dd";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.status.approved;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span>⬇️</span>
                  <span>Download Document</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyProgram;
