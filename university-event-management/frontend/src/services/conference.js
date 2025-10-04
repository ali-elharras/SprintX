import api from "./api";

export const conferenceService = {
  // Create new conference
  createConference: async (conferenceData) => {
    try {
      const response = await api.post("/api/conferences", conferenceData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Error creating conference";
    }
  },
  
  // Update conference
  updateConference: async (id, conferenceData) => {
    try {
      const response = await api.put(`/api/conferences/${id}`, conferenceData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Error updating conference";
    }
  },

  // Delete conference
  deleteConference: async (id) => {
    try {
      const response = await api.delete(`/api/conferences/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error deleting conference';
    }
  }
  
};