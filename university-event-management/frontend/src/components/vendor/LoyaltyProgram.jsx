import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../Button';
import Card from '../Card';
import LoyaltyEnrollmentModal from './LoyaltyEnrollmentModal';
import { Award, Copy, Trash2, Plus, Percent, Calendar, FileText } from 'lucide-react';

/* ========================================
   SKELETON LOADING (YouTube Style)
   ======================================== */
const SkeletonShimmer = ({ className = "", rounded = "lg" }) => (
  <div
    className={`relative overflow-hidden bg-gray-200 ${className} rounded-${rounded}`}
    aria-hidden="true"
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
  </div>
);

const SkeletonProgramCard = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <SkeletonShimmer className="w-32 h-5 mb-2" rounded="md" />
        <SkeletonShimmer className="w-24 h-4" rounded="md" />
      </div>
      <SkeletonShimmer className="w-16 h-8 rounded-full" />
    </div>
    <SkeletonShimmer className="w-full h-4 mb-2" rounded="md" />
    <SkeletonShimmer className="w-5/6 h-4 mb-4" rounded="md" />
    <div className="flex gap-2 mt-4">
      <SkeletonShimmer className="flex-1 h-9" rounded="md" />
      <SkeletonShimmer className="w-20 h-9" rounded="md" />
    </div>
  </div>
);

/* ========================================
   MAIN COMPONENT
   ======================================== */
const LoyaltyProgram = () => {
  const { vendor } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);

  useEffect(() => {
    fetchLoyaltyPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLoyaltyPrograms = async () => {
    setLoading(true);
    try {
      // Wait for both API call and 2 second minimum skeleton display
      const [res] = await Promise.all([
        api.get('/loyalty'),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);
      setPrograms(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      const msg = error?.response?.data?.error || error?.message || 'Failed to fetch loyalty programs';
      toast.error(msg);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async (formData) => {
    try {
      const res = await api.post('/loyalty', formData);
      toast.success('Loyalty program created successfully');
      await fetchLoyaltyPrograms();
      return res.data;
    } catch (error) {
      const msg = error?.response?.data?.error || error?.message || 'Failed to create loyalty program';
      toast.error(msg);
      throw error;
    }
  };

  const handleCancelProgram = async (programId) => {
    if (!window.confirm('Are you sure you want to cancel this loyalty program? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/loyalty/${programId}`);
      toast.success('Loyalty program cancelled successfully');
      await fetchLoyaltyPrograms();
    } catch (error) {
      const msg = error?.response?.data?.error || error?.message || 'Failed to cancel program';
      toast.error(msg);
    }
  };

  const handleCopyCode = (promoCode) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(promoCode);
      toast.success('Promo code copied to clipboard');
    } else {
      toast.error('Could not copy to clipboard');
    }
  };

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

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Loyalty Programs</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create and manage promotional codes for {vendor?.businessName || 'your business'}
            </p>
          </div>

          {programs.length === 0 && (
            <button
              onClick={() => setShowEnrollmentModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
              aria-haspopup="dialog"
            >
              <Plus size={16} />
              Create program
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            role="status"
            aria-busy="true"
            aria-label="Loading loyalty programs"
          >
            <SkeletonProgramCard />
            <SkeletonProgramCard />
            <SkeletonProgramCard />
          </div>
        ) : programs.length === 0 ? (
          <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Award className="text-gray-400" size={32} />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">No loyalty programs yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create promotional programs to reward your customers with discounts
            </p>
            <button
              onClick={() => setShowEnrollmentModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Plus size={16} />
              Create your first program
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((program, index) => (
              <div
                key={program._id}
                className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <Award className="text-indigo-700" size={16} />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {program.promoCode}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Percent size={12} />
                        <span>{program.discountRate}% discount</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-4 pb-4 border-b border-gray-100">
                    <Calendar size={12} />
                    <span>Created {new Date(program.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  </div>

                  {/* Terms */}
                  {program.termsAndConditions && (
                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                        <FileText size={12} />
                        Terms
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {program.termsAndConditions}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyCode(program.promoCode)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <Copy size={14} />
                      Copy code
                    </button>
                    <button
                      onClick={() => handleCancelProgram(program._id)}
                      className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                      aria-label="Cancel program"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <LoyaltyEnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        onEnroll={handleCreateProgram}
      />
    </>
  );
};

export default LoyaltyProgram;