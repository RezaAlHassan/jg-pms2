import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { departmentService, budgetService, supplierService, purchaseRequestService, userService } from '../lib/database';
import type { Department, Budget, Supplier, User } from '../lib/supabase';

interface FormData {
  description: string;
  justification: string;
  amount: string;
  fundingSource: string;
  departmentId: string;
  budgetId: string;
  supplierId: string;
  approverId: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  expectedDeliveryDate: string;
  category: string;
}


const AddRequest: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    description: '',
    justification: '',
    amount: '',
    fundingSource: '',
    departmentId: '',
    budgetId: '',
    supplierId: '',
    approverId: '',
    priority: 'Normal',
    expectedDeliveryDate: '',
    category: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State for data from Supabase
  const [departments, setDepartments] = useState<Department[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Load data from Supabase on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [departmentsData, suppliersData, usersData] = await Promise.all([
          departmentService.getAll(),
          supplierService.getApproved(),
          userService.getAll()
        ]);
        
        setDepartments(departmentsData);
        setSuppliers(suppliersData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading data:', error);
        // You could show a toast notification here
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load budgets when department changes
  useEffect(() => {
    const loadBudgets = async () => {
      if (formData.departmentId) {
        try {
          const budgetsData = await budgetService.getByDepartment(parseInt(formData.departmentId));
          setBudgets(budgetsData);
        } catch (error) {
          console.error('Error loading budgets:', error);
        }
      } else {
        setBudgets([]);
      }
    };

    loadBudgets();
  }, [formData.departmentId]);

  const categories = [
    'IT Equipment',
    'Office Supplies',
    'Software Licenses',
    'Furniture',
    'Services',
    'Maintenance',
    'Research Equipment',
    'Other'
  ];

  const fundingSources = [
    'General Fund',
    'Research Grant',
    'Capital Improvement',
    'Emergency Fund',
    'Department Budget',
    'External Funding'
  ];

  // Filter budgets based on selected department (now handled by useEffect)
  const availableBudgets = budgets;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.justification.trim()) {
      newErrors.justification = 'Justification is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }

    if (!formData.budgetId) {
      newErrors.budgetId = 'Budget is required';
    }

    // Approver is optional - no validation needed

    if (!formData.fundingSource) {
      newErrors.fundingSource = 'Funding source is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.expectedDeliveryDate) {
      newErrors.expectedDeliveryDate = 'Expected delivery date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create purchase request using Supabase
      const requestData = {
        requester_id: 1, // In real app, this would come from auth context
        description: formData.description,
        justification: formData.justification,
        amount: parseFloat(formData.amount),
        funding_source: formData.fundingSource,
        budget_id: parseInt(formData.budgetId),
        department_id: parseInt(formData.departmentId),
        status: 'Pending' as const
      };

      console.log('Submitting request:', requestData);
      
      // Submit to Supabase
      const newRequest = await purchaseRequestService.create(requestData);
      
      console.log('Request created successfully:', newRequest);
      
      // Success - redirect to requests page
      navigate('/requests');
    } catch (error) {
      console.error('Error submitting request:', error);
      // Handle error (show toast, etc.)
      alert('Error submitting request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBudget = formData.budgetId ? budgets.find(budget => budget.budget_id === parseInt(formData.budgetId)) : null;
  const isAmountExceedingBudget = selectedBudget && parseFloat(formData.amount) > selectedBudget.remaining_amount;

  // Filter users based on selected department (for approvers)
  const filteredUsers = users.filter(user => 
    user.department_id === parseInt(formData.departmentId) && user.is_active
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Purchase Request</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Loading form data...
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Purchase Request</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Submit a new purchase request for approval
          </p>
        </div>
        <button
          onClick={() => navigate('/requests')}
          className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request Details</h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Describe what you need to purchase..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
              )}
            </div>

            {/* Justification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Justification *
              </label>
              <textarea
                name="justification"
                value={formData.justification}
                onChange={handleInputChange}
                rows={3}
                className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.justification ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Explain why this purchase is necessary..."
              />
              {errors.justification && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.justification}</p>
              )}
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Information</h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount ($) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.amount || isAmountExceedingBudget ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
              )}
              {isAmountExceedingBudget && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  Amount exceeds remaining budget (${selectedBudget?.remaining_amount.toLocaleString()})
                </p>
              )}
            </div>

            {/* Department and Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department *
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.departmentId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.departmentId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget *
                </label>
                <select
                  name="budgetId"
                  value={formData.budgetId}
                  onChange={handleInputChange}
                  disabled={!formData.departmentId}
                  className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    !formData.departmentId ? 'opacity-50 cursor-not-allowed' : errors.budgetId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select budget</option>
                  {availableBudgets.map(budget => (
                    <option key={budget.budget_id} value={budget.budget_id}>
                      FY {budget.fiscal_year} - ${budget.remaining_amount.toLocaleString()} remaining
                    </option>
                  ))}
                </select>
                {errors.budgetId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.budgetId}</p>
                )}
                {!formData.departmentId && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Select a department first to choose a budget
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Approver
                </label>
                <select
                  name="approverId"
                  value={formData.approverId}
                  onChange={handleInputChange}
                  disabled={!formData.departmentId}
                  className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    !formData.departmentId ? 'opacity-50 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select approver</option>
                  {filteredUsers.map(user => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </option>
                  ))}
                </select>
                {!formData.departmentId && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Select a department first to choose an approver
                  </p>
                )}
              </div>
            </div>

            {/* Funding Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Funding Source *
              </label>
              <select
                name="fundingSource"
                value={formData.fundingSource}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.fundingSource ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select funding source</option>
                {fundingSources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
              {errors.fundingSource && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fundingSource}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Information</h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Supplier (Optional)
              </label>
              <select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">No preference</option>
                {suppliers.map(supplier => (
                  <option key={supplier.supplier_id} value={supplier.supplier_id}>
                    {supplier.supplier_name} ({supplier.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Expected Delivery Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expected Delivery Date *
              </label>
              <input
                type="date"
                name="expectedDeliveryDate"
                value={formData.expectedDeliveryDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.expectedDeliveryDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.expectedDeliveryDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.expectedDeliveryDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Budget Summary */}
        {selectedBudget ? (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">Budget Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Total Budget</p>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  ${selectedBudget.total_amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Remaining</p>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  ${selectedBudget.remaining_amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Request Amount</p>
                <p className={`text-lg font-semibold ${
                  isAmountExceedingBudget 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-blue-900 dark:text-blue-100'
                }`}>
                  ${formData.amount ? parseFloat(formData.amount).toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Budget Information</h4>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 dark:text-gray-300">ℹ️</span>
              <p className="text-gray-600 dark:text-gray-300">
                No budget selected. This request will be processed without budget constraints.
              </p>
            </div>
            {formData.amount && (
              <div className="mt-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">Request Amount</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${parseFloat(formData.amount).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/requests')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !!isAmountExceedingBudget}
            className={`font-medium py-2 px-6 rounded-lg transition-colors ${
              isSubmitting || isAmountExceedingBudget
                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRequest;
