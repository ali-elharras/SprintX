import React from "react";
import { useNavigate } from "react-router-dom";
import theme from "../../theme";

const ConferenceCard = ({ conference, onDelete }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    const handleEdit = () => {
      navigate(`/conferences/edit/${conference._id}`);
    };
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this conference?")) {
      onDelete(conference._id);
    }
  };

  return (
    <div style={theme.components.card}>
      <h3 style={theme.typography.fontSize.lg}>{conference.name}</h3>
      <p style={theme.typography.fontSize.md}>
        {conference.shortDescription}
      </p>
      <p>
        <strong>Start:</strong> {new Date(conference.startDate).toLocaleString()}
      </p>
      <p>
        <strong>End:</strong> {new Date(conference.endDate).toLocaleString()}
      </p>
      <div style={theme.components.buttonGroup}>
        <button onClick={handleEdit} style={theme.components.button.primary}>
          Edit
        </button>
        <button onClick={handleDelete} style={theme.components.button.danger}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default ConferenceCard;