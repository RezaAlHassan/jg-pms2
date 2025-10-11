import React, { useState, useEffect } from 'react';
import { purchaseRequestService } from '../lib/database';
import PurchaseRequestView from '../components/PurchaseRequestView';
import type { PurchaseRequest } from '../lib/supabase';

const Approvals: React.FC = () => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allRequests = await purchaseRequestService.getAll();
      const pendingRequests = allRequests.filter(req => req.status === 'Pending');
      
      setRequests(pendingRequests);
    } catch (err) {
      console.error('Error loading pending requests:', err);
      setError('Failed to load pending requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    try {
      await purchaseRequestService.update(requestId, { status: 'Approved' });
      await loadPendingRequests(); // Refresh the list
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Failed to approve request. Please try again.');
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await purchaseRequestService.update(requestId, { status: 'Rejected' });
      await loadPendingRequests(); // Refresh the list
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Failed to reject request. Please try again.');
    }
  };

  const handleViewRequest = (requestId: number) => {
    setSelectedRequestId(requestId);
    setIsViewOpen(true);
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setSelectedRequestId(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const approvedRequests = requests.filter(req => req.status === 'Approved');
  const pendingCount = requests.length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Approvals</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Review and approve pending purchase requests
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">Loading pending requests...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Approvals</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Review and approve pending purchase requests
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-red-600 dark:text-red-400">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error loading requests
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={loadPendingRequests}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Approvals</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Review and approve pending purchase requests
        </p>
      </div>

      {/* Approval Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
            </div>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
              {pendingCount > 0 ? 'Action needed' : 'All clear'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{requests.length}</p>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
              All statuses
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(requests.reduce((sum, req) => sum + req.amount, 0))}
              </p>
            </div>
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">
              Pending
            </span>
          </div>
        </div>
      </div>

      {/* Approval Queue */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Pending Approvals ({pendingCount})
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {pendingCount === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500 dark:text-gray-400">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending approvals</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  All purchase requests have been reviewed. Check back later for new requests.
                </p>
              </div>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.request_id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        #{request.request_id?.toString().padStart(3, '0')} - {request.description || 'Purchase Request'}
                      </h4>
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Requested by: {request.requester 
                        ? `${request.requester.first_name} ${request.requester.last_name}`
                        : `User #${request.requester_id}`
                      } • Amount: {formatCurrency(request.amount)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {request.justification || 'No justification provided'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Submitted: {formatDate(request.request_date)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleApprove(request.request_id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleReject(request.request_id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleViewRequest(request.request_id)}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Purchase Request View Overlay */}
      <PurchaseRequestView
        requestId={selectedRequestId}
        isOpen={isViewOpen}
        onClose={handleCloseView}
      />
    </div>
  );
};

export default Approvals;
