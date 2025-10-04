import React, { useEffect, useState } from "react";
import { fetchConferences } from "../../services/conference";
import { conferenceService } from '../../services/conference';
import ConferenceCard from "./ConferenceCard";
import theme from "../../theme";

const ConferenceList = () => {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadConferences = async () => {
      try {
        const response = await conferenceService.getAllConferences();
        setConferences(response.data);
      } catch (error) {
        console.error('Error fetching conferences:', error);
      }
    };
    
    loadConferences();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: theme.spacing[4] }}>
        <h2 style={{ fontFamily: theme.typography.fontFamily.primary }}>
          Loading conferences...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: theme.spacing[4] }}>
        <h2 style={{ fontFamily: theme.typography.fontFamily.primary, color: theme.colors.error.main }}>
          Error: {error}
        </h2>
      </div>
    );
  }

  const handleDelete = (deletedId) => {
    setConferences(conferences.filter(conf => conf._id !== deletedId));
  };

  return (
    <div>
      <h1 style={{ fontFamily: theme.typography.fontFamily.primary }}>Conference List</h1>
      <div>
        {conferences.map((conference) => (
          <ConferenceCard 
          key={conference._id} 
          conference={conference} 
          onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default ConferenceList;