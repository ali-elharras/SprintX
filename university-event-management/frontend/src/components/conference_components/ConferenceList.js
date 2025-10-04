import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { conferenceService } from '../../services/conference';
import Button from '../Button';
import Card from '../Card';
import theme from '../../theme';

const ConferenceList = () => {
  const [conferences, setConferences] = useState([]);
  const navigate = useNavigate();

  const fetchConferences = async () => {
    try {
      const response = await conferenceService.getAllConferences();
      setConferences(response.data);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  useEffect(() => {
    fetchConferences();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this conference?')) {
      try {
        await conferenceService.deleteConference(id);
        setConferences(conferences.filter(conf => conf._id !== id));
      } catch (error) {
        console.error('Error:', error.message);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-12">
        <h2 className="text-3xl font-bold mb-6" style={{ color: theme.colors.primary }}>
          Conferences
        </h2>
        <Button
          variant="primary"
          onClick={() => navigate('/conferences/create')}
          className="px-6 py-2 text-lg"
        >
          Create New Conference
        </Button>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {conferences.map((conference) => (
          <Card key={conference._id} className="p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-4" style={{ color: theme.colors.primary }}>
              {conference.title}
            </h3>
            <p className="text-gray-600 mb-6 min-h-[80px]">{conference.description}</p>
            <div className="space-y-3 text-sm mb-6">
              <p className="flex items-center">
                <span className="font-medium mr-2" style={{ color: theme.colors.secondary }}>Date:</span> 
                {new Date(conference.date).toLocaleDateString()}
              </p>
              <p className="flex items-center">
                <span className="font-medium mr-2" style={{ color: theme.colors.secondary }}>Location:</span> 
                {conference.location}
              </p>
              <p className="flex items-center">
                <span className="font-medium mr-2" style={{ color: theme.colors.secondary }}>Capacity:</span> 
                {conference.capacity}
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => navigate(`/conferences/edit/${conference._id}`)}
                className="px-4"
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(conference._id)}
                className="px-4"
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ConferenceList;