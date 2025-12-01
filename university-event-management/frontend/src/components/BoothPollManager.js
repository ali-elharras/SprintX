import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { boothPollAPI } from '../services/api';
import theme from '../theme';

const BoothPollManager = ({ onPollCreated }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: 'GUC Cairo',
    startDate: '',
    durationWeeks: 1,
    boothSize: '2x2',
    pollEndDate: '',
    vendors: [
      { companyName: '', description: '' },
      { companyName: '', description: '' }
    ],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newValues = { ...prev, [name]: value };
      if (name === 'startDate') {
        // if startDate is cleared or is now before pollEndDate, clear pollEndDate
        if (!value || (prev.pollEndDate && new Date(value) < new Date(prev.pollEndDate))) {
          newValues.pollEndDate = '';
        }
      }
      return newValues;
    });
  };

  const handleVendorChange = (index, field, value) => {
    const newVendors = [...formData.vendors];
    newVendors[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      vendors: newVendors,
    }));
  };

  const addVendorOption = () => {
    setFormData((prev) => ({
      ...prev,
      vendors: [...prev.vendors, { companyName: '', description: '' }],
    }));
  };

  const removeVendorOption = (index) => {
    if (formData.vendors.length <= 2) {
      toast.error('A poll must have at least two vendor options');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      vendors: prev.vendors.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.title.trim()) {
      toast.error('Poll title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Poll description is required');
      return;
    }
    if (formData.vendors.length < 2) {
      toast.error('At least two vendor options are required for a poll');
      return;
    }
    
    // Validate vendors have company names
    const invalidVendors = formData.vendors.filter(v => !v.companyName || v.companyName.trim() === '');
    if (invalidVendors.length > 0) {
      toast.error('All vendors must have a company name');
      return;
    }
    
    if (!formData.startDate || !formData.pollEndDate) {
      toast.error('Start date and poll end date are required');
      return;
    }

    const startDateObj = new Date(formData.startDate);
    const pollEndDateObj = new Date(formData.pollEndDate);
    const now = new Date();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0,0,0,0);

    if (startDateObj < tomorrow) {
        toast.error('Start date must be tomorrow or later.');
        return;
    }
    
    if (pollEndDateObj > startDateObj) {
        toast.error('Voting must end on or before the event starts.');
        return;
    }

    if (pollEndDateObj < now) {
      toast.error('Poll end date cannot be in the past.');
      return;
    }

    // Check if voting ends at least 2 days before the start date
    const twoDaysBeforeStart = new Date(startDateObj);
    twoDaysBeforeStart.setDate(twoDaysBeforeStart.getDate() - 2);
    
    if (pollEndDateObj > twoDaysBeforeStart) {
      toast.error('Voting must end at least 2 days before the event start date.');
      return;
    }
    
    // Calculate end date from start date and duration
    const startDate = new Date(formData.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (formData.durationWeeks * 7));
    
    if (new Date(formData.pollEndDate) >= endDate) {
      toast.error('Poll end date must be before the booth period ends');
      return;
    }

    setIsCreating(true);
    try {
      // Calculate end date before sending
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (formData.durationWeeks * 7));
      
      const pollDataToSubmit = {
        ...formData,
        endDate: endDate.toISOString(),
      };
      
      const response = await boothPollAPI.createPoll(pollDataToSubmit);
      toast.success('Booth poll created successfully!');
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: 'GUC Cairo',
        startDate: '',
        durationWeeks: 1,
        boothSize: '2x2',
        pollEndDate: '',
        vendors: [
          { companyName: '', description: '' },
          { companyName: '', description: '' }
        ],
      });
      
      // Call the callback to refresh polls
      if (onPollCreated) {
        onPollCreated();
      }
    } catch (error) {
      console.error('Poll creation error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create poll';
      toast.error(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minStartDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}T00:00`;

  const now = new Date();
  const minPollEndDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Calculate max poll end date (2 days before start date)
  let maxPollEndDate = '';
  if (formData.startDate) {
    const startDate = new Date(formData.startDate);
    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(maxEndDate.getDate() - 2);
    maxPollEndDate = `${maxEndDate.getFullYear()}-${String(maxEndDate.getMonth() + 1).padStart(2, '0')}-${String(maxEndDate.getDate()).padStart(2, '0')}T${String(maxEndDate.getHours()).padStart(2, '0')}:${String(maxEndDate.getMinutes()).padStart(2, '0')}`;
  }


  return (
    <div
      style={{
        background: theme.colors.background.paper,
        padding: theme.spacing[6],
        borderRadius: theme.borderRadius.lg,
        boxShadow: theme.shadows.md,
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: theme.spacing[4], color: theme.colors.text.primary }}>
        Create Booth Poll
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4] }}>
        {/* Poll Title & Description */}
        <div>
          <label style={{ fontWeight: 600, color: theme.colors.text.primary, marginBottom: theme.spacing[2], display: 'block' }}>
            Poll Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Spring Bazaar Vendor Selection"
            style={{
              width: '100%',
              padding: theme.spacing[2],
              border: `1px solid ${theme.colors.border.light}`,
              borderRadius: theme.borderRadius.sm,
              fontSize: '1rem',
            }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 600, color: theme.colors.text.primary, marginBottom: theme.spacing[2], display: 'block' }}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the booth event details..."
            style={{
              width: '100%',
              padding: theme.spacing[2],
              border: `1px solid ${theme.colors.border.light}`,
              borderRadius: theme.borderRadius.sm,
              fontSize: '1rem',
              minHeight: '100px',
            }}
          />
        </div>

        {/* Booth Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing[4] }}>
          <div>
            <label style={{ fontWeight: 600, color: theme.colors.text.primary, marginBottom: theme.spacing[2], display: 'block' }}>
              Location *
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: theme.spacing[2],
                border: `1px solid ${theme.colors.border.light}`,
                borderRadius: theme.borderRadius.sm,
                fontSize: '1rem',
              }}
            >
              <option value="GUC Cairo">GUC Cairo</option>
              <option value="GUC Berlin">GUC Berlin</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 600, color: theme.colors.text.primary, marginBottom: theme.spacing[2], display: 'block' }}>
              Booth Size *
            </label>
            <select
              name="boothSize"
              value={formData.boothSize}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: theme.spacing[2],
                border: `1px solid ${theme.colors.border.light}`,
                borderRadius: theme.borderRadius.sm,
                fontSize: '1rem',
              }}
            >
              <option value="2x2">2x2</option>
              <option value="4x4">4x4</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing[4] }}>
          <div>
            <label style={{ fontWeight: 600, color: theme.colors.text.primary, marginBottom: theme.spacing[2], display: 'block' }}>
              Start Date *
            </label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              min={minStartDate}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: theme.spacing[2],
                border: `1px solid ${theme.colors.border.light}`,
                borderRadius: theme.borderRadius.sm,
                fontSize: '1rem',
              }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 600, color: theme.colors.text.primary, marginBottom: theme.spacing[2], display: 'block' }}>
               End Date
            </label>
            <div style={{
              padding: theme.spacing[2],
              border: `1px solid ${theme.colors.border.light}`,
              borderRadius: theme.borderRadius.sm,
              fontSize: '1rem',
              backgroundColor: '#f9fafb',
              color: theme.colors.text.secondary,
            }}>
              {formData.startDate && formData.durationWeeks ? 
                new Date(new Date(formData.startDate).getTime() + (formData.durationWeeks * 7 * 24 * 60 * 60 * 1000))
                  .toLocaleString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                : 'Select start date and duration'
              }
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing[4] }}>
          <div>
            <label style={{ fontWeight: 600, color: theme.colors.text.primary, marginBottom: theme.spacing[2], display: 'block' }}>
              Duration (Weeks) *
            </label>
            <input
              type="number"
              name="durationWeeks"
              value={formData.durationWeeks}
              onChange={handleInputChange}
              min="1"
              max="4"
              style={{
                width: '100%',
                padding: theme.spacing[2],
                border: `1px solid ${theme.colors.border.light}`,
                borderRadius: theme.borderRadius.sm,
                fontSize: '1rem',
              }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 600, color: theme.colors.text.primary, marginBottom: theme.spacing[2], display: 'block' }}>
              Voting Ends *
            </label>
            <input
              type="datetime-local"
              name="pollEndDate"
              value={formData.pollEndDate}
              onChange={handleInputChange}
              min={minPollEndDate}
              max={maxPollEndDate || ''}
              disabled={!formData.startDate}
              style={{
                width: '100%',
                padding: theme.spacing[2],
                border: `1px solid ${theme.colors.border.light}`,
                borderRadius: theme.borderRadius.sm,
                fontSize: '1rem',
                backgroundColor: !formData.startDate ? '#f3f4f6' : 'white',
              }}
            />
            {formData.startDate && (
              <small style={{ display: 'block', marginTop: '0.25rem', color: theme.colors.text.secondary }}>
                Must be at least 2 days before start date
              </small>
            )}
          </div>
        </div>

        {/* Vendor Options */}
        <div style={{ borderTop: `1px solid ${theme.colors.border.light}`, paddingTop: theme.spacing[4] }}>
          <h3 style={{ marginTop: 0, marginBottom: theme.spacing[3], color: theme.colors.text.primary }}>
            Vendor Options *
          </h3>

          {formData.vendors.map((vendor, index) => (
            <div key={index} style={{ marginBottom: theme.spacing[3], padding: theme.spacing[3], background: '#f9fafb', borderRadius: theme.borderRadius.sm }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing[2] }}>
                <h4 style={{ margin: 0, color: theme.colors.text.primary }}>Option {index + 1}</h4>
                {formData.vendors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVendorOption(index)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: theme.borderRadius.sm,
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div style={{ marginBottom: theme.spacing[2] }}>
                <label style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  value={vendor.companyName}
                  onChange={(e) => handleVendorChange(index, 'companyName', e.target.value)}
                  placeholder="Company Name"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: `1px solid ${theme.colors.border.light}`,
                    borderRadius: theme.borderRadius.sm,
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                  Description
                </label>
                <textarea
                  value={vendor.description}
                  onChange={(e) => handleVendorChange(index, 'description', e.target.value)}
                  placeholder="Describe this vendor option (optional)"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: `1px solid ${theme.colors.border.light}`,
                    borderRadius: theme.borderRadius.sm,
                    fontSize: '0.875rem',
                    minHeight: '60px',
                  }}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addVendorOption}
            style={{
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: theme.borderRadius.sm,
              cursor: 'pointer',
              fontSize: '0.875rem',
              marginBottom: theme.spacing[4],
            }}
          >
            + Add Vendor Option
          </button>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', gap: theme.spacing[3], justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={isCreating}
            style={{
              padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
              background: theme.colors.primary.main,
              color: 'white',
              border: 'none',
              borderRadius: theme.borderRadius.sm,
              cursor: isCreating ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              opacity: isCreating ? 0.6 : 1,
            }}
          >
            {isCreating ? 'Creating...' : 'Create Poll'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoothPollManager;
