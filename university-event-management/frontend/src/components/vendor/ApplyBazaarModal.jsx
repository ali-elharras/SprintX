import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Upload, Users, MapPin, Info, Check, ChevronRight, ChevronLeft, DollarSign, Trash2, Plus } from 'lucide-react';

/* ========================================
   PRICING CONFIGURATION
   ======================================== */
const PRICING = {
  bazaar: {
    basePrice: {
      "2x2": 100, // Base price for 2x2 booth in dollars
      "4x4": 200, // Base price for 4x4 booth in dollars
    },
    locationMultiplier: {
      "Main Hall": 1.5,
      "Entrance": 1.3,
      "Courtyard": 1.0,
      "default": 1.0,
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

const ModalSkeleton = () => (
  <div className="space-y-6">
    <SkeletonShimmer className="w-full h-12" rounded="lg" />
    <div className="grid grid-cols-2 gap-4">
      <SkeletonShimmer className="w-full h-32" rounded="lg" />
      <SkeletonShimmer className="w-full h-32" rounded="lg" />
    </div>
    <SkeletonShimmer className="w-full h-20" rounded="lg" />
    <SkeletonShimmer className="w-full h-16" rounded="lg" />
  </div>
);

/* ========================================
   MAIN COMPONENT
   ======================================== */
const ApplyBazaarModal = ({ bazaar, isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [boothSize, setBoothSize] = useState("2x2");
  const [attendees, setAttendees] = useState([
    { name: "", email: "", idProofBase64: null, idProofFileName: "" }
  ]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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
    setStep(1);
    setBoothSize("2x2");
    setAttendees([{ name: "", email: "", idProofBase64: null, idProofFileName: "" }]);
    setAgreedToTerms(false);
  };

  if (!isOpen) return null;

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

  const handleNext = () => {
    if (skeletonLoading) return;
    
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
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
      setStep(3);
    }
  };

  const handleBack = () => {
    if (skeletonLoading) return;
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (skeletonLoading) return;
    
    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions.");
      return;
    }
    
    const finalAttendees = attendees.filter(a => a.name && a.email);
    onSubmit({ boothSize, attendees: finalAttendees });
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Calculate total cost
  const basePrice = PRICING.bazaar.basePrice[boothSize];
  const locationMultiplier = PRICING.bazaar.locationMultiplier[bazaar?.location] || PRICING.bazaar.locationMultiplier.default;
  const totalCost = Math.round(basePrice * locationMultiplier);

  const steps = [
    { number: 1, label: 'Booth size', icon: <MapPin size={14} /> },
    { number: 2, label: 'Attendees', icon: <Users size={14} /> },
    { number: 3, label: 'Review', icon: <Check size={14} /> },
  ];

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
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Apply to {bazaar?.name || bazaar?.title}
              </h2>
              <p className="text-xs text-gray-600 mt-1">Step {step} of 3</p>
            </div>
            <button 
              onClick={handleClose} 
              className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="text-gray-500" size={20} />
            </button>
          </div>

          {/* Progress Stepper */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              {steps.map((s, idx) => (
                <React.Fragment key={s.number}>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                      s.number < step 
                        ? 'bg-emerald-500 text-white' 
                        : s.number === step 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {s.number < step ? <Check size={14} /> : s.icon}
                    </div>
                    <span className={`hidden sm:inline text-xs font-medium ${
                      s.number <= step ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 rounded-full transition-colors ${
                      s.number < step ? 'bg-emerald-500' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {skeletonLoading ? (
                <ModalSkeleton />
              ) : (
                <>
                  {/* Step 1: Booth Size */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                        <p className="text-sm text-blue-900">
                          Select your preferred booth size. Larger booths provide more space for product displays.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {Object.keys(PRICING.bazaar.basePrice).map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setBoothSize(size)}
                            className={`relative p-5 border-2 rounded-lg text-left transition-all ${
                              boothSize === size
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className={`w-12 h-12 rounded-md flex items-center justify-center ${
                                boothSize === size ? 'bg-indigo-600' : 'bg-gray-100'
                              }`}>
                                <MapPin className={boothSize === size ? 'text-white' : 'text-gray-600'} size={20} />
                              </div>
                              {boothSize === size && (
                                <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                  <Check className="text-white" size={12} />
                                </div>
                              )}
                            </div>
                            <h4 className="text-base font-semibold text-gray-900 mb-1">{size} meters</h4>
                            <p className="text-sm text-gray-600">
                              Base: ${PRICING.bazaar.basePrice[size]}
                            </p>
                          </button>
                        ))}
                      </div>

                      {/* Location Info */}
                      {bazaar?.location && (
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin size={16} className="text-gray-600" />
                            <span className="text-sm font-medium text-gray-900">Location</span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {bazaar.location} 
                            {locationMultiplier !== 1.0 && (
                              <span className="ml-2 text-xs text-indigo-600 font-medium">
                                ({locationMultiplier}x multiplier)
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Attendees */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <Users className="text-purple-600 flex-shrink-0 mt-0.5" size={16} />
                        <p className="text-sm text-purple-900">
                          Add up to 5 attendees. Each attendee must have valid ID proof uploaded.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {attendees.map((attendee, index) => (
                          <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
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
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Full name
                                </label>
                                <input
                                  type="text"
                                  value={attendee.name}
                                  onChange={(e) => handleAttendeeChange(index, 'name', e.target.value)}
                                  disabled={skeletonLoading}
                                  placeholder="Enter full name"
                                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Email address
                                </label>
                                <input
                                  type="email"
                                  value={attendee.email}
                                  onChange={(e) => handleAttendeeChange(index, 'email', e.target.value)}
                                  disabled={skeletonLoading}
                                  placeholder="Enter email address"
                                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  ID proof
                                </label>
                                <div className="relative">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(index, e)}
                                    disabled={skeletonLoading}
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
                          </div>
                        ))}
                      </div>

                      {attendees.length < 5 && (
                        <button
                          type="button"
                          onClick={addAttendeeRow}
                          className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                        >
                          <Plus size={16} className="inline mr-2" />
                          Add attendee
                        </button>
                      )}
                    </div>
                  )}

                  {/* Step 3: Review */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-indigo-600 rounded-md flex items-center justify-center">
                            <Check className="text-white" size={20} />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">Application summary</h3>
                            <p className="text-xs text-gray-600">Review your details before submitting</p>
                          </div>
                        </div>

                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center py-2 border-b border-indigo-100">
                            <span className="text-gray-700">Bazaar</span>
                            <span className="font-semibold text-gray-900">{bazaar?.name || bazaar?.title}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-indigo-100">
                            <span className="text-gray-700">Booth size</span>
                            <span className="font-semibold text-gray-900">{boothSize} meters</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-indigo-100">
                            <span className="text-gray-700">Attendees</span>
                            <span className="font-semibold text-gray-900">
                              {attendees.filter(a => a.name && a.email).length}
                            </span>
                          </div>
                          {bazaar?.location && (
                            <div className="flex justify-between items-center py-2 border-b border-indigo-100">
                              <span className="text-gray-700">Location</span>
                              <span className="font-semibold text-gray-900">{bazaar.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cost Summary */}
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-900 rounded-md flex items-center justify-center">
                            <DollarSign className="text-white" size={20} />
                          </div>
                          <h3 className="text-base font-semibold text-gray-900">Cost breakdown</h3>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-gray-700">
                            <span>Base price ({boothSize})</span>
                            <span className="font-medium">${basePrice}</span>
                          </div>
                          {locationMultiplier !== 1.0 && (
                            <div className="flex justify-between text-gray-700">
                              <span>Location multiplier</span>
                              <span className="font-medium">{locationMultiplier}x</span>
                            </div>
                          )}
                          <div className="h-px bg-gray-200 my-3" />
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900">Total cost</span>
                            <span className="text-2xl font-bold text-indigo-600">${totalCost}</span>
                          </div>
                        </div>
                      </div>

                      {/* Terms */}
                      <label className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          disabled={skeletonLoading}
                          className="mt-0.5 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-amber-900">
                          I agree to the terms and conditions. Payment is required within 48 hours of approval.
                        </span>
                      </label>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={skeletonLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={skeletonLoading}
                    className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    Continue
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!agreedToTerms || skeletonLoading}
                    className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit application
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ApplyBazaarModal;