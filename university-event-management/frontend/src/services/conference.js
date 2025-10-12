import { conferenceAPI } from './api';

export const conferenceService = {
    createConference: async (conferenceData) => {
        try {
            const response = await conferenceAPI.createConference(conferenceData);
            // Remove the success check or adjust to match your API
            return response.data; // Return the entire response data
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create conference';
            throw new Error(errorMessage);
        }
    },
    
    updateConference: async (id, conferenceData) => {
        try {
            const response = await conferenceAPI.updateConference(id, conferenceData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Error updating conference';
            throw new Error(errorMessage);
        }
    },

    getConference: async (id) => {
        try {
            const response = await conferenceAPI.getConference(id);
            return response.data;
        } catch (error) {
            throw new Error('Error fetching conference: ' + (error.message || 'Unknown error'));
        }
    },

    deleteConference: async (id) => {
        try {
            const response = await conferenceAPI.deleteConference(id);
            return response.data;
        } catch (error) {
            throw new Error('Error deleting conference: ' + (error.message || 'Unknown error'));
        }
    }
};