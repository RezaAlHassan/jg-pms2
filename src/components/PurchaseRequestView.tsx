import React from 'react';
import { purchaseRequestService, departmentService, budgetService, userService } from '../lib/database';
import type { PurchaseRequest, Department, Budget, Supplier, User } from '../lib/supabase';

interface PurchaseRequestViewProps {
  requestId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

interface RequestDetails extends PurchaseRequest {
  requester?: User;
  department?: Department;
  budget?: Budget;
  supplier?: Supplier;
}

const PurchaseRequestView: React.FC<PurchaseRequestViewProps> = ({ requestId, isOpen, onClose }) => {
  const [requestDetails, setRequestDetails] = React.useState<RequestDetails | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && requestId) {
      loadRequestDetails();
    }
  }, [isOpen, requestId]);

  const loadRequestDetails = async () => {
    if (!requestId) return;

    try {
      setLoading(true);
      setError(null);

      // Load the main request data
      const request = await purchaseRequestService.getById(requestId);
      if (!request) {
        setError('Request not found');
        return;
      }

      // Load related data in parallel
      const [department, supplier] = await Promise.all([
        request.budget?.department_id ? departmentService.getById(request.budget.department_id) : null,
        null // We don't have supplier_id in the current schema, but keeping for future use
      ]);

      setRequestDetails({
        ...request,
        requester: request.requester || undefined,
        department: department || undefined,
        budget: request.budget || undefined,
        supplier: supplier || undefined
      });
    } catch (err) {
      console.error('Error loading request details:', err);
      setError('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Completed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Purchase Request Details
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Request #{requestId?.toString().padStart(3, '0')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-3 text-gray-600 dark:text-gray-300">Loading request details...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="text-red-600 dark:text-red-400 mb-4">
                  <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Request</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
                <button
                  onClick={loadRequestDetails}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : requestDetails ? (
              <div className="p-6 space-y-6">
                {/* Status and Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h3>
                    <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${getStatusBadgeColor(requestDetails.status)}`}>
                      {requestDetails.status}
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(requestDetails.amount)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Request Date</h3>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(requestDetails.request_date)}
                    </p>
                  </div>
                </div>

                {/* Request Details */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Request Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {requestDetails.description || 'No description provided'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Justification
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {requestDetails.justification || 'No justification provided'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Funding Source
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {requestDetails.funding_source || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Requester Information */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Requester Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {requestDetails.requester 
                          ? `${requestDetails.requester.first_name} ${requestDetails.requester.last_name}`
                          : `User #${requestDetails.requester_id}`
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {requestDetails.requester?.email || 'Not available'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Department
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {requestDetails.department?.department_name || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        User ID
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        #{requestDetails.requester_id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Budget Information */}
                {requestDetails.budget && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Fiscal Year
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          FY {requestDetails.budget.fiscal_year}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Total Budget
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {formatCurrency(requestDetails.budget.total_amount)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Remaining Amount
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {formatCurrency(requestDetails.budget.remaining_amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timestamps</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Created At
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(requestDetails.created_at)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Updated
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(requestDetails.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequestView;
