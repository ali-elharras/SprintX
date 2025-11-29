import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Percent, Tag, FileText, Sparkles } from 'lucide-react';

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

const FormSkeleton = () => (
  <div className="space-y-6">
    <div>
      <SkeletonShimmer className="w-32 h-4 mb-2" rounded="md" />
      <SkeletonShimmer className="w-full h-11" rounded="md" />
    </div>
    <div>
      <SkeletonShimmer className="w-24 h-4 mb-2" rounded="md" />
      <SkeletonShimmer className="w-full h-11" rounded="md" />
    </div>
    <div>
      <SkeletonShimmer className="w-40 h-4 mb-2" rounded="md" />
      <SkeletonShimmer className="w-full h-24" rounded="md" />
    </div>
  </div>
);

/* ========================================
   MAIN COMPONENT
   ======================================== */
const LoyaltyEnrollmentModal = ({ isOpen, onClose, onEnroll }) => {
  const [formData, setFormData] = useState({
    discountRate: '',
    promoCode: '',
    termsAndConditions: ''
  });
  const [submitting, setSubmitting] = useState(false);
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
    setFormData({
      discountRate: '',
      promoCode: '',
      termsAndConditions: ''
    });
    setSubmitting(false);
    setSkeletonLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (skeletonLoading) return;

    // Validate discount rate
    const discountRate = Number(formData.discountRate);
    if (isNaN(discountRate) || discountRate < 0 || discountRate > 100) {
      toast.error('Discount rate must be between 0 and 100');
      return;
    }

    // Validate promo code
    if (!formData.promoCode.trim()) {
      toast.error('Promo code is required');
      return;
    }

    // Validate terms
    if (!formData.termsAndConditions.trim()) {
      toast.error('Terms and conditions are required');
      return;
    }

    setSubmitting(true);
    try {
      await onEnroll({
        ...formData,
        discountRate: Number(formData.discountRate),
        promoCode: formData.promoCode.trim().toUpperCase(),
        termsAndConditions: formData.termsAndConditions.trim()
      });
      resetForm();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to create loyalty program');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

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
          className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-md flex items-center justify-center">
                <Sparkles className="text-indigo-700" size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Create Loyalty Program</h2>
                <p className="text-xs text-gray-600">Set up a new promotional discount code</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={submitting}
              className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close modal"
            >
              <X className="text-gray-500" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {skeletonLoading ? (
                <FormSkeleton />
              ) : (
                <div className="space-y-6">
                  {/* Discount Rate */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Percent size={16} className="text-indigo-600" />
                      Discount rate
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="discountRate"
                        value={formData.discountRate}
                        onChange={handleChange}
                        placeholder="Enter discount percentage"
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                        disabled={submitting}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                        %
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">
                      Enter a value between 0 and 100
                    </p>
                  </div>

                  {/* Promo Code */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Tag size={16} className="text-indigo-600" />
                      Promo code
                    </label>
                    <input
                      type="text"
                      name="promoCode"
                      value={formData.promoCode}
                      onChange={handleChange}
                      placeholder="e.g., SUMMER2025"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
                      required
                      disabled={submitting}
                      maxLength={20}
                    />
                    <p className="mt-1.5 text-xs text-gray-500">
                      This code will be used by customers to redeem the discount
                    </p>
                  </div>

                  {/* Terms and Conditions */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <FileText size={16} className="text-indigo-600" />
                      Terms and conditions
                    </label>
                    <textarea
                      name="termsAndConditions"
                      value={formData.termsAndConditions}
                      onChange={handleChange}
                      placeholder="Describe the terms, restrictions, and validity period..."
                      rows={5}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      required
                      disabled={submitting}
                    />
                    <p className="mt-1.5 text-xs text-gray-500">
                      Specify any limitations or requirements for using this promo code
                    </p>
                  </div>

                  {/* Warning Banner */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-900">
                      <strong className="font-semibold">Important:</strong> You can only have <strong>ONE</strong> active loyalty program at a time. Creating this program will reach your limit.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || skeletonLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Create program
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoyaltyEnrollmentModal;