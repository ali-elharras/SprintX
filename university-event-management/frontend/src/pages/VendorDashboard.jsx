import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { eventServices, applicationServices, bazaarServices , paymentSum} from "../services/api";
import toast from "react-hot-toast";
import ApplyBazaarModal from "../components/vendor/ApplyBazaarModal";
import ApplyBoothModal from "../components/vendor/ApplyBoothModal";
import PaymentButton from "../components/vendor/PaymentButton";
import Navbar from "../components/Navbar";
import LoyaltyProgram from '../components/vendor/LoyaltyProgram';
import { 
  Calendar, Store, FileText, Award, DollarSign, Clock, Search, 
  ChevronLeft, ChevronRight, MapPin, TrendingUp, CheckCircle, 
  XCircle, AlertCircle, Sparkles, Zap, Eye, Plus, MoreHorizontal,Banknote
} from 'lucide-react';

/* ========================================
   SKELETON LOADING COMPONENTS (YouTube Style)
   ======================================== */

const SkeletonShimmer = ({ className = "", rounded = "lg" }) => (
  <div 
    className={`relative overflow-hidden bg-gray-200 ${className} rounded-${rounded}`}
    aria-hidden="true"
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
  </div>
);

const SkeletonMetricCard = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-start justify-between mb-3">
      <SkeletonShimmer className="w-10 h-10" rounded="md" />
      <SkeletonShimmer className="w-16 h-5 rounded-full" />
    </div>
    <SkeletonShimmer className="w-20 h-8 mb-2" rounded="md" />
    <SkeletonShimmer className="w-32 h-4" rounded="md" />
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <SkeletonShimmer className="w-3/4 h-6 mb-4" rounded="md" />
    <SkeletonShimmer className="w-full h-4 mb-2" rounded="md" />
    <SkeletonShimmer className="w-5/6 h-4 mb-6" rounded="md" />
    <div className="flex gap-3">
      <SkeletonShimmer className="flex-1 h-10" rounded="md" />
      <SkeletonShimmer className="w-24 h-10" rounded="md" />
    </div>
  </div>
);

const SkeletonListItem = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <SkeletonShimmer className="w-48 h-5 mb-3" rounded="md" />
        <SkeletonShimmer className="w-36 h-4" rounded="md" />
      </div>
      <SkeletonShimmer className="w-24 h-8 rounded-full" />
    </div>
  </div>
);

/* ========================================
   UI COMPONENTS
   ======================================== */

const MetricCard = ({ icon: Icon, label, value, trend, trendDirection, index }) => (
  <div 
    className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
    style={{ animationDelay: `${index * 60}ms` }}
    role="region"
    aria-label={label}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
        <Icon className="text-gray-700" size={20} />
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded ${
          trendDirection === 'up' ? 'text-emerald-700 bg-emerald-50' : 'text-gray-600 bg-gray-100'
        }`}>
          {trend}
        </span>
      )}
    </div>
    <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
    <div className="text-3xl font-semibold text-gray-900">{value}</div>
  </div>
);

const BazaarCard = ({ bazaar, onApply, application, index }) => {
  const registrationClosed = new Date(bazaar.registrationDeadline) < new Date();
  const canApply = !application || application.status === 'rejected';
  
  const getActionState = () => {
    if (registrationClosed && !application) return { 
      text: 'Registration closed', 
      variant: 'disabled',
      icon: null
    };
    if (!application) return { 
      text: 'Apply now', 
      variant: 'primary',
      icon: <Plus size={16} />
    };
    if (application.status === 'approved') return { 
      text: 'Approved', 
      variant: 'success',
      icon: <CheckCircle size={16} />
    };
    if (application.status === 'rejected') return { 
      text: 'Apply again', 
      variant: 'primary',
      icon: <Plus size={16} />
    };
    return { 
      text: 'Pending review', 
      variant: 'pending',
      icon: <Clock size={16} />
    };
  };
  
  const action = getActionState();
  const isDisabled = !canApply || (registrationClosed && !application);

  const PaymentSum = async () => {  
    try {
      const data = await paymentSum.getPendingPaymentsSum();
      return data.data.totalPendingAmount;
    } catch (error) {
      console.error("Failed to fetch payment sum:", error);
      return 0; // or handle the error as needed
    }
  };

  const buttonStyles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
    success: 'bg-emerald-50 text-emerald-700 cursor-default',
    pending: 'bg-amber-50 text-amber-700 cursor-default',
    disabled: 'bg-gray-100 text-gray-400 cursor-not-allowed'
  };
  
  return (
    <article 
      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
      style={{ animationDelay: `${index * 60}ms` }}
      aria-labelledby={`bazaar-${bazaar._id}-title`}
    >
      <div className="p-6">
        {application && (
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
              application.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
              application.status === 'pending' ? 'bg-amber-50 text-amber-700' :
              'bg-red-50 text-red-700'
            }`}>
              {application.status === 'approved' && <CheckCircle size={12} />}
              {application.status === 'pending' && <Clock size={12} />}
              {application.status === 'rejected' && <XCircle size={12} />}
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </span>
          </div>
        )}
        
        <h3 id={`bazaar-${bazaar._id}-title`} className="text-base font-semibold text-gray-900 mb-3">
          {bazaar.name || bazaar.title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Calendar size={14} />
          <span>
            {new Date(bazaar.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(bazaar.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">
          {bazaar.description}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => canApply && !isDisabled && onApply(bazaar)}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            aria-label={action.text}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${buttonStyles[action.variant]}`}
          >
            {action.icon}
            {action.text}
          </button>
          <button 
            className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal size={16} className="text-gray-500" />
          </button>
        </div>
      </div>
    </article>
  );
};

const ApplicationItem = ({ application, onCancel, index }) => {
  const [cancelling, setCancelling] = useState(false);
  const applicationType = application.bazaar ? 'bazaar' : 'booth';
  
  const handleCancel = async () => {
    if (window.confirm('Cancel this application? This action cannot be undone.')) {
      setCancelling(true);
      try {
        await applicationServices.cancelApplication(applicationType, application._id);
        toast.success('Application cancelled successfully');
        onCancel();
      } catch (error) {
        toast.error(error.message || 'Failed to cancel application');
      } finally {
        setCancelling(false);
      }
    }
  };
  
  const canCancel = application.paymentStatus !== 'completed' && application.status !== 'rejected';
  
  const statusConfig = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: <Clock size={14} /> },
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle size={14} /> },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', icon: <XCircle size={14} /> }
  };
  
  const status = statusConfig[application.status] || statusConfig.pending;
  
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
      style={{ animationDelay: `${index * 40}ms` }}
      role="article"
      aria-labelledby={`app-${application._id}-title`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 id={`app-${application._id}-title`} className="text-base font-semibold text-gray-900 mb-2 truncate">
              {application.bazaar?.name || application.bazaar?.title || "Booth Request"}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                Applied {new Date(application.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${status.bg} ${status.text} text-xs font-medium rounded-full`}>
              {status.icon}
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </span>
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel'}
              </button>
            )}
          </div>
        </div>
        
        {application.status === 'approved' && (
          <div className="pt-4 border-t border-gray-100">
            <PaymentButton application={application} applicationType={applicationType} />
          </div>
        )}
      </div>
    </div>
  );
};

const ParticipationItem = ({ participation, index }) => (
  <div 
    className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
    style={{ animationDelay: `${index * 40}ms` }}
    role="article"
    aria-labelledby={`part-${participation._id}-title`}
  >
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-10 h-10 bg-indigo-100 rounded-md flex items-center justify-center flex-shrink-0">
            <MapPin className="text-indigo-700" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id={`part-${participation._id}-title`} className="text-base font-semibold text-gray-900 mb-2">
              {participation.bazaar?.name || participation.bazaar?.title || "Booth Event"}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={14} />
              <span>
                {participation.bazaar 
                  ? new Date(participation.bazaar.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : new Date(participation.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                }
              </span>
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
          <CheckCircle size={14} />
          {participation.status}
        </span>
      </div>
    </div>
  </div>
);

/* ========================================
   MAIN DASHBOARD COMPONENT
   ======================================== */

const VendorDashboard = () => {
  const { vendor } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [upcomingBazaars, setUpcomingBazaars] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);
  const [bazaarApplications, setBazaarApplications] = useState(new Map());
  const [loading, setLoading] = useState({ bazaars: true, applications: true, participations: true , paymentSum: true });
  const [error, setError] = useState({ bazaars: null, applications: null, participations: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBoothModalOpen, setIsBoothModalOpen] = useState(false);
  const [selectedBazaar, setSelectedBazaar] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchBazaars = async () => {
    try {
      setLoading(prev => ({ ...prev, bazaars: true }));
      const data = await eventServices.getUpcomingBazaars();
      setUpcomingBazaars(data.data || []);
      const applications = new Map();
      for (const bazaar of data.data) {
        try {
          const appData = await bazaarServices.getBazaarApplication(bazaar._id);
          if (appData.success) {
            applications.set(bazaar._id, appData.data);
          }
        } catch (error) {
          if (error.status !== 404) {
            console.error(`Failed to fetch application for bazaar ${bazaar._id}`, error);
          }
        }
      }
      setBazaarApplications(applications);
    } catch (err) {
      setError(prev => ({ ...prev, bazaars: err.message || "Failed to fetch bazaars" }));
      toast.error("Could not load upcoming bazaars.");
    } finally {
      setLoading(prev => ({ ...prev, bazaars: false }));
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(prev => ({ ...prev, applications: true }));
      const response = await applicationServices.getMyRequests();
      const applications = (response.data.bazaars || []).concat(response.data.booths || []);
      setMyApplications(applications);
    } catch (err) {
      setError(prev => ({ ...prev, applications: err.message || "Failed to fetch applications" }));
      toast.error("Could not load your applications.");
    } finally {
      setLoading(prev => ({ ...prev, applications: false }));
    }
  };

  const fetchParticipations = async () => {
    try {
      setLoading(prev => ({ ...prev, participations: true }));
      const response = await applicationServices.getMyParticipations();
      const participations = (response.data.bazaars || []).concat(response.data.booths || []);
      setMyParticipations(participations);
    } catch (err) {
      setError(prev => ({ ...prev, participations: err.message || "Failed to fetch participations" }));
      toast.error("Could not load your participations.");
    } finally {
      setLoading(prev => ({ ...prev, participations: false }));
    }
  };

  useEffect(() => {
    fetchBazaars();
    fetchApplications();
    fetchParticipations();
  }, []);

  const handleApplyClick = (bazaar) => {
    const application = bazaarApplications.get(bazaar._id);
    if (!application || application.status === 'rejected') {
      setSelectedBazaar(bazaar);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBazaar(null);
  };

  const handleApplicationSubmit = async (applicationData) => {
    if (!selectedBazaar) return;
    try {
      const response = await applicationServices.applyToBazaar(selectedBazaar._id, applicationData);
      toast.success(response.message || "Successfully applied to bazaar!");
      handleModalClose();
      fetchBazaars();
      fetchApplications();
    } catch (err) {
      toast.error(err.message || "Application failed.");
    }
  };

  const handleBoothApplicationSubmit = async (applicationData) => {
    try {
      const response = await applicationServices.applyForBooth(applicationData);
      toast.success(response.message || "Successfully applied for booth!");
      setIsBoothModalOpen(false);
      fetchApplications();
      fetchParticipations();
    } catch (err) {
      toast.error(err.message || "Booth application failed.");
    }
  };

  const filteredApplications = myApplications.filter(app => 
    (filterStatus === 'all' || app.status === filterStatus) &&
    (searchQuery === '' || (app.bazaar?.name || app.bazaar?.title || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

// In VendorDashboard component, add this state
const [pendingPaymentsSum, setPendingPaymentsSum] = useState(0);


// Add this fetch function
const fetchPendingPaymentsSum = async () => {
  try {
    setLoading(prev => ({ ...prev, paymentSum: true }));
    const data = await paymentSum.getPendingPaymentsSum();
    setPendingPaymentsSum(data.data.totalPendingAmount || 0);
  } catch (error) {
    console.error("Failed to fetch payment sum:", error);
    setPendingPaymentsSum(0);
  } finally {
    setLoading(prev => ({ ...prev, paymentSum: false }));
  }
};

// Call it in useEffect
useEffect(() => {
  fetchBazaars();
  fetchApplications();
  fetchParticipations();
  fetchPendingPaymentsSum(); // Add this line
}, []);

// Update your stats object
const stats = {
  totalApplications: myApplications.length,
  activeEvents: myParticipations.length,
  pendingPayments: myApplications.filter(app => app.paymentStatus === 'pending').length,
  approvedApplications: myApplications.filter(app => app.status === 'approved').length,
  pendingPaymentsSum: pendingPaymentsSum, // Use state value instead
};

// Remove the PaymentSum function from BazaarCard component entirely

  const tabs = [
    { id: 'overview', label: 'Upcoming Events', icon: Eye },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'participations', label: 'Accepted Applications', icon: Calendar },
    { id: 'loyalty', label: 'Loyalty Program', icon: Award },
  ];

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
                  <Store className="text-white" size={18} />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-gray-900">Vendor Dashboard</h1>
                  <p className="text-xs text-gray-500">{vendor?.businessName || "Vendor"}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsBoothModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Plus size={16} />
                Request booth
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {loading.applications ? (
              <>
                <SkeletonMetricCard />
                <SkeletonMetricCard />
                <SkeletonMetricCard />
                <SkeletonMetricCard />
              </>
            ) : (
              <>
                <MetricCard 
                  icon={FileText} 
                  label="Applications" 
                  value={stats.totalApplications} 
                  trend={`${stats.approvedApplications} approved`}
                  trendDirection="up"
                  index={0} 
                />
                <MetricCard 
                  icon={Calendar} 
                  label="Active events" 
                  value={stats.activeEvents} 
                  index={1} 
                />
                <MetricCard 
                  icon={Banknote} 
                  label="Pending payments" 
                  value={stats.pendingPaymentsSum} 
                  trend={stats.pendingPayments > 0 ? 'Action required' : 'All paid'}
                  trendDirection={stats.pendingPayments > 0 ? 'down' : 'up'}
                  index={2} 
                />
                <MetricCard 
                  icon={Award} 
                  label="Account status" 
                  value="Active" 
                  trend="Good standing"
                  trendDirection="up"
                  index={3} 
                />
              </>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="min-h-[400px]">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming opportunities</h2>
                </div>
                
                {loading.bazaars ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="status" aria-busy="true" aria-label="Loading bazaars">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : error.bazaars ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-12 text-center">
                    <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
                    <p className="text-red-600 font-semibold">{error.bazaars}</p>
                  </div>
                ) : upcomingBazaars.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingBazaars.slice(0, 6).map((bazaar, i) => (
                      <BazaarCard 
                        key={bazaar._id}
                        bazaar={bazaar}
                        onApply={handleApplyClick}
                        application={bazaarApplications.get(bazaar._id)}
                        index={i}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Calendar className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">No opportunities available</h3>
                    <p className="text-sm text-gray-600">Check back soon for new bazaar events</p>
                  </div>
                )}
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">My applications</h2>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        aria-label="Search applications"
                      />
                    </div>
                    <select 
                      value={filterStatus} 
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      aria-label="Filter by status"
                    >
                      <option value="all">All status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                
                {loading.applications ? (
                  <div className="space-y-3" role="status" aria-busy="true" aria-label="Loading applications">
                    {Array.from({ length: 4 }).map((_, i) => <SkeletonListItem key={i} />)}
                  </div>
                ) : error.applications ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-12 text-center">
                    <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
                    <p className="text-red-600 font-semibold">{error.applications}</p>
                  </div>
                ) : paginatedApplications.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {paginatedApplications.map((app, i) => (
                        <ApplicationItem 
                          key={app._id}
                          application={app}
                          onCancel={() => {
                            fetchApplications();
                            fetchParticipations();
                          }}
                          index={i}
                        />
                      ))}
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <button 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Previous page"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 text-sm font-medium rounded-md transition-colors ${
                              currentPage === page
                                ? 'bg-indigo-600 text-white'
                                : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                            aria-current={currentPage === page ? 'page' : undefined}
                          >
                            {page}
                          </button>
                        ))}
                        <button 
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Next page"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      {searchQuery || filterStatus !== 'all' ? 'No matching applications' : 'No applications yet'}
                    </h3>
                    <p className="text-sm text-gray-600">Start applying to bazaars to grow your business</p>
                  </div>
                )}
              </div>
            )}

            {/* Participations Tab */}
            {activeTab === 'participations' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming events</h2>
                </div>
                
                {loading.participations ? (
                  <div className="space-y-3" role="status" aria-busy="true" aria-label="Loading participations">
                    {Array.from({ length: 3 }).map((_, i) => <SkeletonListItem key={i} />)}
                  </div>
                ) : error.participations ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-12 text-center">
                    <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
                    <p className="text-red-600 font-semibold">{error.participations}</p>
                  </div>
                ) : myParticipations.length > 0 ? (
                  <div className="space-y-3">
                    {myParticipations.map((participation, i) => (
                      <ParticipationItem 
                        key={participation._id}
                        participation={participation}
                        index={i}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Calendar className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">No upcoming events</h3>
                    <p className="text-sm text-gray-600">Your confirmed events will appear here</p>
                  </div>
                )}
              </div>
            )}

            {/* Loyalty Tab */}
            {activeTab === 'loyalty' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Rewards program</h2>
                </div>
                <LoyaltyProgram />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {selectedBazaar && (
        <ApplyBazaarModal
          bazaar={selectedBazaar}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleApplicationSubmit}
        />
      )}

      <ApplyBoothModal 
        isOpen={isBoothModalOpen}
        onClose={() => setIsBoothModalOpen(false)}
        onSubmit={handleBoothApplicationSubmit}
      />
    </>
  );
};

export default VendorDashboard;