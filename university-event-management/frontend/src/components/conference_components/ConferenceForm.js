import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { conferenceService } from '../../services/conference';
import Input from '../Input';
import Button from '../Button';
import Card from '../Card';
import theme from '../../theme';

const ConferenceForm = ({ conference, isEdit = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: conference?.title || '',
    description: conference?.description || '',
    date: conference?.date ? new Date(conference.date).toISOString().split('T')[0] : '',
    location: conference?.location || '',
    capacity: conference?.capacity || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await conferenceService.updateConference(conference._id, formData);
      } else {
        await conferenceService.createConference(formData);
      }
      navigate('/conferences');
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8 p-8 bg-white shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          <Input
            label="Title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full"
            labelStyle={{ color: theme.colors.primary }}
          />
          <div className="space-y-5">
            <label 
              htmlFor="description" 
              className="block text-sm font-semibold" 
              style={{ color: theme.colors.primary }}
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="6"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              style={{ 
                borderColor: theme.colors.border,
                backgroundColor: '#f8fafc'
              }}
              placeholder="Enter conference description..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              labelStyle={{ color: theme.colors.primary }}
            />

            <Input
              label="Location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              labelStyle={{ color: theme.colors.primary }}
            />
            <Input
              label="Capacity"
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
              labelStyle={{ color: theme.colors.primary }}
            />
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <Button
            type="submit"
            variant="primary"
            className="px-8 py-2 text-lg"
          >
            {isEdit ? 'Update Conference' : 'Create Conference'}
          </Button>
        </div>
      </form>
    </Card>
  );

};

export default ConferenceForm;