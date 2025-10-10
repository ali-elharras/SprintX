import React from "react";
import theme from "../theme";

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: theme.zIndex?.modal || 1050,
  },
  content: {
    background: theme.colors.background.default,
    padding: theme.spacing[5],
    borderRadius: theme.borderRadius.lg,
    width: "92%",
    maxWidth: "760px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: theme.shadows.md,
  },
};

const Modal = ({ isOpen, onClose, children, ariaLabel }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose} role="dialog" aria-label={ariaLabel || "Modal"}>
      <div style={styles.content} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
