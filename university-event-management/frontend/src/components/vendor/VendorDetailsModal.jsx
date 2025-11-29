import React from 'react';
import { X, Calendar, MapPin, Clock, FileText, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const VendorDetailsModal = ({ isOpen, onClose, title, data, type }) => {
    if (!isOpen || !data) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            approved: 'bg-emerald-50 text-emerald-700',
            pending: 'bg-amber-50 text-amber-700',
            rejected: 'bg-red-50 text-red-700',
            completed: 'bg-blue-50 text-blue-700'
        };

        const icons = {
            approved: <CheckCircle size={14} />,
            pending: <Clock size={14} />,
            rejected: <XCircle size={14} />,
            completed: <CheckCircle size={14} />
        };

        const statusKey = status?.toLowerCase() || 'pending';

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${styles[statusKey] || styles.pending}`}>
                {icons[statusKey]}
                {status?.charAt(0).toUpperCase() + status?.slice(1)}
            </span>
        );
    };

    const renderDetailRow = (icon, label, value) => {
        if (!value) return null;
        const Icon = icon;
        return (
            <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                <div className="mt-0.5 text-gray-400">
                    <Icon size={18} />
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                    <p className="text-sm text-gray-900 mt-0.5">{value}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {/* Main Info */}
                    <div className="mb-6">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{data.name || data.title || data.bazaar?.name || "Event Details"}</h4>
                        {data.description && (
                            <p className="text-gray-600 leading-relaxed">{data.description}</p>
                        )}
                    </div>

                    {/* Status Section if applicable */}
                    {data.status && (
                        <div className="mb-6 bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Current Status</span>
                            {getStatusBadge(data.status)}
                        </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        {renderDetailRow(Calendar, "Start Date", formatDate(data.startDate || data.bazaar?.startDate))}
                        {renderDetailRow(Calendar, "End Date", formatDate(data.endDate || data.bazaar?.endDate))}
                        {renderDetailRow(MapPin, "Location", data.location || data.bazaar?.location)}
                        {renderDetailRow(DollarSign, "Price", data.price ? `${data.price} EGP` : null)}
                        {renderDetailRow(Clock, "Submission Date", data.createdAt ? formatDate(data.createdAt) : null)}
                        {renderDetailRow(FileText, "Application Type", type === 'booth' ? 'Booth Request' : 'Bazaar Application')}

                        {/* Additional Fields based on type */}
                        {data.boothSize && renderDetailRow(MapPin, "Booth Size", data.boothSize)}
                        {data.products && renderDetailRow(FileText, "Products", data.products)}
                        {data.requirements && renderDetailRow(AlertCircle, "Requirements", data.requirements)}
                    </div>

                    {/* Rejection Reason */}
                    {data.rejectionReason && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg">
                            <h5 className="text-sm font-medium text-red-800 mb-1">Rejection Reason</h5>
                            <p className="text-sm text-red-600">{data.rejectionReason}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorDetailsModal;
