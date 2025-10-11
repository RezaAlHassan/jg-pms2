import React, { useState, useEffect } from 'react';
import { departmentService, budgetService, userService } from '../lib/database';
import type { Department, Budget, User } from '../lib/supabase';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [departments, setDepartments] = useState<Department[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Form states
  const [showCreateDepartment, setShowCreateDepartment] = useState(false);
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [showAssignUser, setShowAssignUser] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const tabs = [
    { id: 'departments', label: 'Departments' },
    { id: 'users', label: 'User Management' },
    { id: 'settings', label: 'System Settings' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [departmentsData, budgetsData, usersData] = await Promise.all([
        departmentService.getAll(),
        budgetService.getAll(),
        userService.getAll()
      ]);
      
      setDepartments(departmentsData);
      setBudgets(budgetsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Administration</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage system settings, users, and view system reports
          </p>
        </div>

        {/* Tab Navigation */}
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Loading...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
              <button 
                onClick={loadData}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'departments' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Department Management</h2>
                    <button 
                      onClick={() => {
                        window.location.href = '/admin/departments/create';
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Create Department
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map((dept) => {
                      const deptUsers = users.filter(user => user.department_id === dept.department_id);
                      const deptBudgets = budgets.filter(budget => budget.department_id === dept.department_id);
                      const totalBudget = deptBudgets.reduce((sum, budget) => sum + budget.total_amount, 0);
                      const remainingBudget = deptBudgets.reduce((sum, budget) => sum + budget.remaining_amount, 0);
                      
                      return (
                        <div key={dept.department_id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{dept.department_name}</h3>
                          <div className="space-y-2 text-sm">
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Users:</span> {deptUsers.length}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Total Budget:</span> ${totalBudget.toLocaleString()}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Remaining:</span> ${remainingBudget.toLocaleString()}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Approvers:</span> {deptUsers.filter(user => user.is_active).length}
                            </p>
                          </div>
                          <div className="mt-4 flex space-x-2">
                            <button 
                              onClick={() => {
                                // Navigate to department details page
                                window.location.href = `/admin/departments/${dept.department_id}`;
                              }}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                            >
                              Manage Department
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}


              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h2>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      Add User
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
                              Department
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
                          {users.map((user) => {
                            const dept = departments.find(d => d.department_id === user.department_id);
                            return (
                              <tr key={user.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                  {user.first_name} {user.last_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {dept?.department_name || 'Unassigned'}
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
                                  <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4">
                                    Edit
                                  </button>
                                  <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                    Deactivate
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Settings</h2>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      System configuration settings will be available here.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
