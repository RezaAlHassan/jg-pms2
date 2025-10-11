import React, { useState, useEffect } from 'react';
import { purchaseRequestService, budgetService, userService, departmentService } from '../lib/database';
import type { PurchaseRequest, User, Department } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userDepartment, setUserDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load requests, budgets, and current user data in parallel
      const [requestsData, budgetsData, usersData] = await Promise.all([
        purchaseRequestService.getAll(),
        budgetService.getAll(),
        userService.getAll()
      ]);
      
      setRequests(requestsData);
      setBudgets(budgetsData);
      
      // For testing purposes, use the first user as current user
      // In a real app, this would come from authentication context
      const testUser = usersData[0];
      if (testUser) {
        setCurrentUser(testUser);
        
        // Load user's department
        if (testUser.department_id) {
          const department = await departmentService.getById(testUser.department_id);
          setUserDepartment(department);
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
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

  // Calculate statistics
  const myRequests = requests.filter(req => req.requester_id === (currentUser?.user_id || 1));
  const pendingRequests = requests.filter(req => req.status === 'Pending');
  const approvedRequests = requests.filter(req => req.status === 'Approved');
  const totalSpent = approvedRequests.reduce((sum, req) => sum + req.amount, 0);
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.total_amount, 0);
  const remainingBudget = budgets.reduce((sum, budget) => sum + budget.remaining_amount, 0);
  
  // Recent requests (last 5)
  const recentRequests = requests
    .sort((a, b) => new Date(b.request_date || '').getTime() - new Date(a.request_date || '').getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Overview of your procurement activities and system status
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Overview of your procurement activities and system status
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
                Error loading dashboard
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={loadData}
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Overview of your procurement activities and system status
        </p>
        {currentUser && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">Welcome, {currentUser.first_name} {currentUser.last_name}</span>
              {userDepartment && (
                <span> • Department: {userDepartment.department_name}</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">My Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{myRequests.length}</p>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
              {requests.length > 0 ? `${Math.round((myRequests.length / requests.length) * 100)}% of total` : '0%'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingRequests.length}</p>
            </div>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
              {pendingRequests.length > 0 ? 'Action needed' : 'All clear'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalBudget)}</p>
            </div>
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">
              All departments
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Remaining Budget</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(remainingBudget)}</p>
            </div>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
              Available
            </span>
          </div>
        </div>

      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Requests</h3>
          </div>
          <div className="p-6">
            {recentRequests.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400">
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">No requests found</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div key={request.request_id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {request.description || `Request #${request.request_id}`}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(request.amount)} • {formatDate(request.request_date)}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusBadgeColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <a
                href="/requests/new"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-left inline-block"
              >
                Create New Request
              </a>
              <a
                href="/requests"
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-left inline-block"
              >
                View All Requests
              </a>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-left">
                Generate Report
              </button>
              <a
                href="/suppliers"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-left inline-block"
              >
                Manage Suppliers
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;