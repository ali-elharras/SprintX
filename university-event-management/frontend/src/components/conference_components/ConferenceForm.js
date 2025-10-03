import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import theme from "../../theme";
import { createConference, editConference } from "../../services/conference";

const ConferenceForm = ({ conferenceData }) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullAgenda, setFullAgenda] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [budget, setBudget] = useState("");
  const [fundingSource, setFundingSource] = useState("external");
  const [extraResources, setExtraResources] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (conferenceData) {
      setName(conferenceData.name);
      setStartDate(conferenceData.startDate);
      setEndDate(conferenceData.endDate);
      setShortDescription(conferenceData.shortDescription);
      setFullAgenda(conferenceData.fullAgenda);
      setWebsiteLink(conferenceData.websiteLink);
      setBudget(conferenceData.budget);
      setFundingSource(conferenceData.fundingSource);
      setExtraResources(conferenceData.extraResources);
    }
  }, [conferenceData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const conferenceDetails = {
      name,
      startDate,
      endDate,
      shortDescription,
      fullAgenda,
      websiteLink,
      budget,
      fundingSource,
      extraResources,
    };

    try {
      if (conferenceData) {
        await editConference(conferenceData._id, conferenceDetails);
        toast.success("Conference updated successfully!");
      } else {
        await createConference(conferenceDetails);
        toast.success("Conference created successfully!");
      }
      navigate("/conference-management");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: theme.spacing[4] }}>
      <h2 style={{ fontFamily: theme.typography.fontFamily.primary }}>Conference Form</h2>
      <input
        type="text"
        placeholder="Conference Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        style={{ marginBottom: theme.spacing[2], width: "100%" }}
      />
      <input
        type="datetime-local"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        required
        style={{ marginBottom: theme.spacing[2], width: "100%" }}
      />
      <input
        type="datetime-local"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        required
        style={{ marginBottom: theme.spacing[2], width: "100%" }}
      />
      <textarea
        placeholder="Short Description"
        value={shortDescription}
        onChange={(e) => setShortDescription(e.target.value)}
        required
        style={{ marginBottom: theme.spacing[2], width: "100%" }}
      />
      <textarea
        placeholder="Full Agenda"
        value={fullAgenda}
        onChange={(e) => setFullAgenda(e.target.value)}
        required
        style={{ marginBottom: theme.spacing[2], width: "100%" }}
      />
      <input
        type="url"
        placeholder="Website Link"
        value={websiteLink}
        onChange={(e) => setWebsiteLink(e.target.value)}
        required
        style={{ marginBottom: theme.spacing[2], width: "100%" }}
      />
      <input
        type="number"
        placeholder="Required Budget"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        required
        style={{ marginBottom: theme.spacing[2], width: "100%" }}
      />
      <select
        value={fundingSource}
        onChange={(e) => setFundingSource(e.target.value)}
        style={{ marginBottom: theme.spacing[2], width: "100%" }}
      >
        <option value="external">External</option>
        <option value="guc">GUC</option>
      </select>
      <textarea
        placeholder="Extra Required Resources"
        value={extraResources}
        onChange={(e) => setExtraResources(e.target.value)}
        style={{ marginBottom: theme.spacing[2], width: "100%" }}
      />
      <button type="submit" style={theme.components.button.primary}>
        {conferenceData ? "Update Conference" : "Create Conference"}
      </button>
    </form>
  );
};

export default ConferenceForm;