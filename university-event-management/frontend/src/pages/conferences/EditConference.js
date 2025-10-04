import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConferenceForm from '../../components/conference_components/ConferenceForm';
import { conferenceService } from '../../services/conference';
import theme from '../../theme';

const EditConference = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConference = async () => {
      try {
        const response = await conferenceService.getAllConferences();
        const conf = response.data.find(c => c._id === id);
        if (!conf) {
          navigate('/conferences');
          return;
        }
        setConference(conf);
      } catch (error) {
        console.error('Error:', error.message);
        navigate('/conferences');
      } finally {
        setLoading(false);
      }
    };

    fetchConference();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8" style={{ color: theme.colors.primary }}>
        Edit Conference
      </h1>
      <ConferenceForm conference={conference} isEdit={true} />
    </div>
  );
};

export default EditConference;