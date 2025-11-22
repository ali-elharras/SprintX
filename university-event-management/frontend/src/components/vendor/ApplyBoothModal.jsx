import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import BoothMapSelector from "./BoothMapSelector";
import { X, Calendar, MapPin, Upload, Users, DollarSign, Store, Check, Plus, Trash2 } from 'lucide-react';

/* ========================================
   PRICING CONFIGURATION
   ======================================== */
const PRICING = {
  booth: {
    basePrice: {
      "2x2": 150, // Base price per week for 2x2 booth
      "4x4": 300, // Base price per week for 4x4 booth
    },
  },
};

/* ========================================
   SKELETON LOADING
   ======================================== */
const SkeletonShimmer = ({ className = "", rounded = "lg" }) => (
  <div 
    className={`relative overflow-hidden bg-gray-200 ${className} rounded-${rounded}`}
    aria-hidden="true"
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
  </div>
);

const BoothSkeleton = () => (
  <div className="space-y-6">
    <div>
      <SkeletonShimmer className="w-32 h-5 mb-3" rounded="md" />
      <SkeletonShimmer className="w-full h-64" rounded="lg" />
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div>
        <SkeletonShimmer className="w-24 h-5 mb-2" rounded="md" />
        <SkeletonShimmer className="w-full h-11" rounded="md" />
      </div>
      <div>
        <SkeletonShimmer className="w-20 h-5 mb-2" rounded="md" />
        <SkeletonShimmer className="w-full h-11" rounded="md" />
      </div>
    </div>

    <div>
      <SkeletonShimmer className="w-32 h-5 mb-3" rounded="md" />
      <div className="space-y-3">
        <SkeletonShimmer className="w-full h-32" rounded="lg" />
        <SkeletonShimmer className="w-full h-32" rounded="lg" />
      </div>
    </div>

    <SkeletonShimmer className="w-full h-32" rounded="lg" />
  </div>
);

/* ========================================
   MAIN COMPONENT
   ======================================== */
const ApplyBoothModal = ({ isOpen, onClose, onSubmit }) => {
  const [boothSize, setBoothSize] = useState("2x2");
  const [startDate, setStartDate] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(1);
  const [selectedBoothId, setSelectedBoothId] = useState(null);
  const [attendees, setAttendees] = useState([
    { name: "", email: "", idProofBase64: null, idProofFileName: "" }
  ]);
  const [skeletonLoading, setSkeletonLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setSkeletonLoading(true);
      const timer = setTimeout(() => setSkeletonLoading(false), 2000);
      return () => clearTimeout(timer);
    } else {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setSkeletonLoading(false);
    setBoothSize("2x2");
    setStartDate("");
    setDurationWeeks(1);
    setSelectedBoothId(null);
    setAttendees([{ name: "", email: "", idProofBase64: null, idProofFileName: "" }]);
  };

  if (!isOpen) return null;

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];

  const handleAttendeeChange = (index, field, value) => {
    const newAttendees = [...attendees];
    newAttendees[index][field] = value;
    setAttendees(newAttendees);
  };

  const handleFileChange = (index, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAttendees = [...attendees];
        newAttendees[index].idProofBase64 = reader.result;
        newAttendees[index].idProofFileName = file.name;
        setAttendees(newAttendees);
      };
      reader.readAsDataURL(file);
    } else {
      const newAttendees = [...attendees];
      newAttendees[index].idProofBase64 = null;
      newAttendees[index].idProofFileName = "";
      setAttendees(newAttendees);
    }
  };

  const addAttendeeRow = () => {
    if (attendees.length < 5) {
      setAttendees([...attendees, { name: "", email: "", idProofBase64: null, idProofFileName: "" }]);
    }
  };

  const removeAttendeeRow = (index) => {
    if (attendees.length > 1) {
      setAttendees(attendees.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (skeletonLoading) return;

    const finalAttendees = attendees.filter(a => a.name && a.email);
    
    if (finalAttendees.length === 0) {
      toast.error("Please add at least one attendee.");
      return;
    }

    for (const attendee of finalAttendees) {
      if (attendee.name && attendee.email && !attendee.idProofBase64) {
        toast.error(`Please upload an ID proof for ${attendee.name}.`);
        return;
      }
    }

    if (!selectedBoothId) {
      toast.error("Please select a booth location on the map.");
      return;
    }

    if (!startDate) {
      toast.error("Please select a start date.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + (durationWeeks * 7));

    onSubmit({ 
      boothSize, 
      startDate: start.toISOString(), 
      endDate: end.toISOString(), 
      durationWeeks, 
      location: selectedBoothId,
      attendees: finalAttendees 
    });

    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Calculate total cost using pricing configuration
  const basePrice = PRICING.booth.basePrice[boothSize];
  const totalCost = basePrice * durationWeeks;

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      >
        <div 
          className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-md flex items-center justify-center">
                <Store className="text-indigo-700" size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Request Standalone Booth</h2>
                <p className="text-xs text-gray-600">Book a permanent booth location</p>
              </div>
            </div>
            <button 
              onClick={handleClose} 
              className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="text-gray-500" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {skeletonLoading ? (
                <BoothSkeleton />
              ) : (
                <div className="space-y-6">
                  {/* Booth Size Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Booth size
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.keys(PRICING.booth.basePrice).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setBoothSize(size)}
                          className={`relative p-4 border-2 rounded-lg text-left transition-all ${
                            boothSize === size
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900">{size}</span>
                            {boothSize === size && (
                              <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                <Check className="text-white" size={12} />
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-600">
                            EGP{PRICING.booth.basePrice[size]}/week
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location Selector */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <MapPin size={16} className="text-indigo-600" />
                      Booth location
                    </label>
                    <BoothMapSelector
                      onSelectBooth={setSelectedBoothId}
                      selectedBoothId={selectedBoothId}
                      startDate={startDate}
                      durationWeeks={durationWeeks}
                    />
                  </div>

                  {/* Date and Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={16} className="text-indigo-600" />
                        Start date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={tomorrow}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <select 
                        value={durationWeeks} 
                        onChange={(e) => setDurationWeeks(parseInt(e.target.value))} 
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value={1}>1 week</option>
                        <option value={2}>2 weeks</option>
                        <option value={3}>3 weeks</option>
                        <option value={4}>4 weeks</option>
                      </select>
                    </div>
                  </div>

                  {/* Attendees */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <Users size={16} className="text-indigo-600" />
                      Attendees (Max 5)
                    </label>

                    <div className="space-y-3">
                      {attendees.map((attendee, index) => (
                        <div 
                          key={index} 
                          className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-white text-xs font-semibold">
                                {index + 1}
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                Attendee {index + 1}
                              </span>
                            </div>
                            {attendees.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAttendeeRow(index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                aria-label="Remove attendee"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>

                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Full name"
                              value={attendee.name}
                              onChange={(e) => handleAttendeeChange(index, "name", e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              required
                            />
                            
                            <input
                              type="email"
                              placeholder="Email address"
                              value={attendee.email}
                              onChange={(e) => handleAttendeeChange(index, "email", e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              required
                            />

                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(index, e)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                required
                              />
                              <div className={`flex items-center gap-3 px-3 py-2 border-2 border-dashed rounded-md transition-colors ${
                                attendee.idProofFileName 
                                  ? 'border-emerald-300 bg-emerald-50' 
                                  : 'border-gray-300 bg-white hover:border-gray-400'
                              }`}>
                                <Upload size={16} className={attendee.idProofFileName ? 'text-emerald-600' : 'text-gray-400'} />
                                <span className={`text-sm flex-1 ${
                                  attendee.idProofFileName ? 'text-emerald-700 font-medium' : 'text-gray-600'
                                }`}>
                                  {attendee.idProofFileName || 'Upload ID proof'}
                                </span>
                                {attendee.idProofFileName && (
                                  <Check size={16} className="text-emerald-600" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {attendees.length < 5 && (
                      <button
                        type="button"
                        onClick={addAttendeeRow}
                        className="w-full mt-3 py-2.5 border-2 border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                      >
                        <Plus size={16} className="inline mr-2" />
                        Add attendee
                      </button>
                    )}
                  </div>

                  {/* Cost Summary */}
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-indigo-600 rounded-md flex items-center justify-center">
                        <DollarSign className="text-white" size={20} />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">Cost summary</h3>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-700">
                        <span>Booth size</span>
                        <span className="font-medium">{boothSize}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Weekly rate</span>
                        <span className="font-medium">EGP{basePrice}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Duration</span>
                        <span className="font-medium">{durationWeeks} week{durationWeeks > 1 ? 's' : ''}</span>
                      </div>
                      <div className="h-px bg-indigo-200 my-3" />
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total cost</span>
                        <span className="text-2xl font-bold text-indigo-600">EGP{totalCost}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={skeletonLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit request
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ApplyBoothModal;