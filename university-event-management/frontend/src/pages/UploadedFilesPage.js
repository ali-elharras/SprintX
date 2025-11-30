import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";
import theme from "../theme";
import axios from "axios";

const UploadedFilesPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, vendor_tax_card, vendor_logo, bazaar_id_proof, booth_id_proof
  const [summary, setSummary] = useState(null);
  const auth = useAuth();

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/files/uploads`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (response.data.success) {
        setFiles(response.data.data || []);
        setSummary(response.data.summary || null);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Failed to load uploaded files");
      // Set empty array on error
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      // Fetch the file as a blob
      const response = await fetch(file.url);
      const blob = await response.blob();
      
      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.name || "download";
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success("File downloaded successfully");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file. Opening in new tab instead.");
      // Fallback: open in new tab
      window.open(file.url, "_blank");
    }
  };

  const getFileType = (fileName, fileType, url) => {
    // Check by file type category first
    if (fileType === "Tax Card" || fileType === "Logo" || fileType === "Attendee ID Proof") {
      return "image";
    }
    
    // Fallback to extension check
    const extension = fileName.split(".").pop().toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
    const documentExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "txt"];
    
    if (imageExtensions.includes(extension)) return "image";
    if (documentExtensions.includes(extension)) return "document";
    
    // Check URL pattern for ImageKit
    if (url && url.includes('ik.imagekit.io')) return "image";
    
    return "other";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const isApplicationCategory = (category) => {
    if (!category) return false;
    try {
      return category.toString().toLowerCase().includes("application");
    } catch (e) {
      return false;
    }
  };

  const filteredFiles = files.filter((file) => {
    if (filter === "all") return true;
    return file.type === filter;
  });

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <div>
        {/* Header */}
        <div style={{ marginBottom: theme.spacing[6] }}>
          <h1
            style={{
              fontSize: theme.typography.fontSize["3xl"],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[2],
            }}
          >
            Uploaded Files
          </h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.base }}>
            View and download all uploaded files from applications and submissions
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: theme.spacing[4],
              marginBottom: theme.spacing[6],
            }}
          >
            <div style={{ 
              backgroundColor: theme.colors.background.paper, 
              padding: theme.spacing[4], 
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.sm,
              border: `1px solid ${theme.colors.border.light}`,
            }}>
              <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing[1] }}>
                Tax Cards
              </p>
              <p style={{ fontSize: theme.typography.fontSize["2xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary.main }}>
                {summary.taxCards}
              </p>
            </div>
            <div style={{ 
              backgroundColor: theme.colors.background.paper, 
              padding: theme.spacing[4], 
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.sm,
              border: `1px solid ${theme.colors.border.light}`,
            }}>
              <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing[1] }}>
                Logos
              </p>
              <p style={{ fontSize: theme.typography.fontSize["2xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.success.main }}>
                {summary.logos}
              </p>
            </div>
            <div style={{ 
              backgroundColor: theme.colors.background.paper, 
              padding: theme.spacing[4], 
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.sm,
              border: `1px solid ${theme.colors.border.light}`,
            }}>
              <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing[1] }}>
                Bazaar ID Proofs
              </p>
              <p style={{ fontSize: theme.typography.fontSize["2xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.warning.main }}>
                {summary.bazaarIdProofs}
              </p>
            </div>
            <div style={{ 
              backgroundColor: theme.colors.background.paper, 
              padding: theme.spacing[4], 
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.sm,
              border: `1px solid ${theme.colors.border.light}`,
            }}>
              <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, marginBottom: theme.spacing[1] }}>
                Booth ID Proofs
              </p>
              <p style={{ fontSize: theme.typography.fontSize["2xl"], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.info.main }}>
                {summary.boothIdProofs}
              </p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div
          style={{
            display: "flex",
            gap: theme.spacing[2],
            marginBottom: theme.spacing[6],
            borderBottom: `2px solid ${theme.colors.border.light}`,
            flexWrap: "wrap",
          }}
        >
          {[
            { value: "all", label: "All Files" },
            { value: "vendor_tax_card", label: "Tax Cards" },
            { value: "vendor_logo", label: "Logos" },
            { value: "bazaar_id_proof", label: "Bazaar IDs" },
            { value: "booth_id_proof", label: "Booth IDs" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              style={{
                padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                background: "none",
                border: "none",
                borderBottom: filter === tab.value ? `3px solid ${theme.colors.primary.main}` : "3px solid transparent",
                color: filter === tab.value ? theme.colors.primary.main : theme.colors.text.secondary,
                fontWeight: filter === tab.value ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium,
                fontSize: theme.typography.fontSize.base,
                cursor: "pointer",
                transition: "all 0.2s ease",
                marginBottom: "-2px",
              }}
              onMouseEnter={(e) => {
                if (filter !== tab.value) {
                  e.target.style.color = theme.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== tab.value) {
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Files Grid */}
        {filteredFiles.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: theme.spacing[12],
              backgroundColor: theme.colors.background.paper,
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.sm,
            }}
          >
            <p style={{ fontSize: theme.typography.fontSize.lg, color: theme.colors.text.secondary }}>
              No files found
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: theme.spacing[4],
            }}
          >
            {filteredFiles.map((file, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: theme.colors.background.paper,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing[4],
                  boxShadow: theme.shadows.sm,
                  border: `1px solid ${theme.colors.border.light}`,
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = theme.shadows.md;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = theme.shadows.sm;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* File Preview/Icon */}
                <div
                  style={{
                    width: "100%",
                    height: "150px",
                    backgroundColor: theme.colors.neutral.gray100,
                    borderRadius: theme.borderRadius.md,
                    marginBottom: theme.spacing[3],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {getFileType(file.name, file.fileType, file.url) === "image" ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = '<div style="fontSize: 48px; color: #9ca3af;">📄</div>';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: "48px",
                        color: theme.colors.neutral.gray400,
                      }}
                    >
                      📄
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div style={{ marginBottom: theme.spacing[3], flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Category Badge */}
                  <div
                    style={{
                      display: "inline-block",
                      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                      backgroundColor: isApplicationCategory(file.category)
                        ? theme.colors.primary.main
                        : theme.colors.primary.light,
                      color: isApplicationCategory(file.category) ? "#ffffff" : theme.colors.primary.main,
                      borderRadius: theme.borderRadius.full,
                      fontSize: theme.typography.fontSize.xs,
                      fontWeight: theme.typography.fontWeight.semibold,
                      marginBottom: theme.spacing[2],
                      alignSelf: "flex-start",
                    }}
                  >
                    {file.category}
                  </div>
                  
                  <h3
                    style={{
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing[1],
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {file.name}
                  </h3>
                  <p
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary,
                      marginBottom: theme.spacing[1],
                    }}
                  >
                    Type: {file.fileType}
                  </p>
                  <p
                    style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.text.secondary,
                      marginBottom: theme.spacing[0.5],
                    }}
                  >
                    Uploaded: {formatDate(file.uploadedAt)}
                  </p>
                  {file.uploadedBy && (
                    <p
                      style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.text.secondary,
                        marginBottom: theme.spacing[0.5],
                      }}
                    >
                      Vendor: {file.uploadedBy}
                    </p>
                  )}
                  {file.eventName && (
                    <p
                      style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.text.secondary,
                        marginBottom: theme.spacing[0.5],
                      }}
                    >
                      Event: {file.eventName}
                    </p>
                  )}
                  {file.eventDates && (
                    <p
                      style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.text.secondary,
                        marginBottom: theme.spacing[0.5],
                      }}
                    >
                      Dates: {file.eventDates}
                    </p>
                  )}
                  {file.attendeeName && (
                    <p
                      style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.text.secondary,
                      }}
                    >
                      Attendee: {file.attendeeName} ({file.attendeeEmail})
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: theme.spacing[2] }}>
                  <button
                    onClick={() => handleDownload(file)}
                    style={{
                      ...theme.components.button.primary,
                      flex: 1,
                      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                      fontSize: theme.typography.fontSize.sm,
                    }}
                  >
                    Download
                  </button>
                  <button
                    onClick={() => window.open(file.url, "_blank")}
                    style={{
                      ...theme.components.button.secondary,
                      flex: 1,
                      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                      fontSize: theme.typography.fontSize.sm,
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadedFilesPage;
