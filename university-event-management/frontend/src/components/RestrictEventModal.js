import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "./Button";
import api from "../services/api";
import toast from "react-hot-toast";

const ROLES = ["student", "ta", "professor", "staff"];

const RestrictEventModal = ({ event, isOpen, onClose, onSuccess }) => {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event && event.eligibleRoles) {
      setSelectedRoles(event.eligibleRoles);
    } else {
      setSelectedRoles(ROLES);
    }
  }, [event]);

  if (!event) return null;

  const handleRoleChange = (role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.put(`/events/${event._id}`, { eligibleRoles: selectedRoles });
      toast.success("Event restrictions updated successfully!");
      onSuccess();
    } catch (error) {
      console.error("Failed to update event restrictions", error);
      toast.error(
        error.response?.data?.message || "Failed to update restrictions."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Restrict Event Access">
      <div>
        <h3 style={{ marginTop: 0 }}>Restrict Access for {event.title}</h3>
        <p>Select the roles that should be able to see and register for this event.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
          {ROLES.map((role) => (
            <label key={role} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={selectedRoles.includes(role)}
                onChange={() => handleRoleChange(role)}
                style={{ marginRight: "0.5rem" }}
              />
              <span style={{ textTransform: "capitalize" }}>{role}</span>
            </label>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Restrictions"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RestrictEventModal;
