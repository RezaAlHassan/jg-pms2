import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { departmentService } from '../lib/database';

const CreateDepartment: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    departmentName: ''
  });
  const [errors, setErrors] = useState<{ departmentName?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { departmentName?: string } = {};

    if (!formData.departmentName.trim()) {
      newErrors.departmentName = 'Department name is required';
    } else if (formData.departmentName.trim().length < 2) {
      newErrors.departmentName = 'Department name must be at least 2 characters';
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
      const newDepartment = await departmentService.create({
        department_name: formData.departmentName.trim()
      });

      console.log('Department created successfully:', newDepartment);
      
      // Success - redirect to admin departments
      navigate('/admin');
    } catch (error) {
      console.error('Error creating department:', error);
      alert('Error creating department. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Department</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Add a new department to the organization
          </p>
        </div>
        <button
          onClick={handleCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Department Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Department Name *
            </label>
            <input
              type="text"
              name="departmentName"
              value={formData.departmentName}
              onChange={handleInputChange}
              placeholder="Enter department name"
              className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.departmentName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.departmentName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.departmentName}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDepartment;


