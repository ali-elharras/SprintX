import React from 'react';
import ConferenceForm from '../../components/conference_components/ConferenceForm';
import theme from '../../theme';

const CreateConference = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12" style={{ color: theme.colors.primary }}>
          Create New Conference
        </h1>
        <ConferenceForm />
      </div>
    </div>
  );
};

export default CreateConference;