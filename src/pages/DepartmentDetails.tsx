import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { departmentService, budgetService, userService } from '../lib/database';
import type { Department, Budget, User } from '../lib/supabase';

const DepartmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [department, setDepartment] = useState<Department | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Form states
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [showAssignUser, setShowAssignUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');

  const tabs = [
    { id: 'users', label: 'Manage Users' },
    { id: 'budgets', label: 'Manage Budgets' }
  ];

  useEffect(() => {
    if (id) {
      loadDepartmentData();
    }
  }, [id]);

  const loadDepartmentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const departmentId = parseInt(id!);
      
      const [departmentData, budgetsData, usersData, allUsersData] = await Promise.all([
        departmentService.getById(departmentId),
        budgetService.getByDepartment(departmentId),
        userService.getByDepartment(departmentId),
        userService.getAll()
      ]);
      
      if (!departmentData) {
        setError('Department not found');
        return;
      }
      
      setDepartment(departmentData);
      setBudgets(budgetsData);
      setUsers(usersData);
      setAllUsers(allUsersData);
    } catch (err) {
      console.error('Error loading department data:', err);
      setError('Failed to load department data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (budgetData: { fiscal_year: number; total_amount: number }) => {
    try {
      // Check if budget already exists for this department and fiscal year
      const existingBudget = budgets.find(budget => budget.fiscal_year === budgetData.fiscal_year);
      if (existingBudget) {
        alert(`A budget for fiscal year ${budgetData.fiscal_year} already exists for this department.`);
        return;
      }

      await budgetService.create({
        department_id: department!.department_id,
        fiscal_year: budgetData.fiscal_year,
        total_amount: budgetData.total_amount,
        remaining_amount: budgetData.total_amount
      });
      
      await loadDepartmentData(); // Refresh data
      setShowCreateBudget(false);
    } catch (err: any) {
      console.error('Error creating budget:', err);
      
      // Handle specific database constraint error
      if (err.code === '23505' && err.message.includes('duplicate key')) {
        alert(`A budget for fiscal year ${budgetData.fiscal_year} already exists for this department.`);
      } else {
        alert('Failed to create budget. Please try again.');
      }
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUser) return;
    
    try {
      await userService.update(parseInt(selectedUser), {
        department_id: department!.department_id
      });
      
      await loadDepartmentData(); // Refresh data
      setShowAssignUser(false);
      setSelectedUser('');
    } catch (err) {
      console.error('Error assigning user:', err);
      alert('Failed to assign user. Please try again.');
    }
  };

  const handleRemoveUser = async (userId: number) => {
    if (!confirm('Are you sure you want to remove this user from the department?')) {
      return;
    }
    
    try {
      await userService.update(userId, {
        department_id: 0 // Set to 0 or null to unassign
      });
      
      await loadDepartmentData(); // Refresh data
    } catch (err) {
      console.error('Error removing user:', err);
      alert('Failed to remove user. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">Loading department...</span>
        </div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">{error || 'Department not found'}</p>
          <button 
            onClick={() => navigate('/admin')}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{department.department_name}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage users and budgets for this department
          </p>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Back to Admin
        </button>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
              Active: {users.filter(u => u.is_active).length}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${budgets.reduce((sum, budget) => sum + budget.total_amount, 0).toLocaleString()}
              </p>
            </div>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
              {budgets.length} budgets
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Remaining Budget</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${budgets.reduce((sum, budget) => sum + budget.remaining_amount, 0).toLocaleString()}
              </p>
            </div>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
              Available
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Department Users</h3>
                <button 
                  onClick={() => setShowAssignUser(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Assign User
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user) => (
                        <tr key={user.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {user.first_name} {user.last_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                              user.is_active 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => handleRemoveUser(user.user_id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'budgets' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Department Budgets</h3>
                <button 
                  onClick={() => setShowCreateBudget(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Create Budget
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Fiscal Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Total Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Remaining
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {budgets.map((budget) => (
                        <tr key={budget.budget_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {budget.fiscal_year}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ${budget.total_amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ${budget.remaining_amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Budget Modal */}
      {showCreateBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Budget</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleCreateBudget({
                fiscal_year: parseInt(formData.get('fiscal_year') as string),
                total_amount: parseFloat(formData.get('total_amount') as string)
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fiscal Year
                  </label>
                  <select
                    name="fiscal_year"
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select fiscal year</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      const exists = budgets.some(budget => budget.fiscal_year === year);
                      return (
                        <option key={year} value={year} disabled={exists}>
                          {year} {exists ? '(Already exists)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  {budgets.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Existing budgets: {budgets.map(b => b.fiscal_year).join(', ')}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    name="total_amount"
                    required
                    min="0"
                    step="0.01"
                    placeholder="Enter budget amount"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateBudget(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Create Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      {showAssignUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assign User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select User
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a user</option>
                  {allUsers.filter(user => user.department_id !== department.department_id).map(user => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowAssignUser(false);
                  setSelectedUser('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignUser}
                disabled={!selectedUser}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Assign User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDetails;
