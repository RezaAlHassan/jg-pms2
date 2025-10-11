import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { invitationService, userService, roleService } from '../lib/database';
import type { Invitation, Role } from '../lib/supabase';

interface RegistrationFormData {
  password: string;
  confirmPassword: string;
}

interface InvitationWithDetails extends Omit<Invitation, 'department_id' | 'invited_by'> {
  department_id: {
    department_id: number;
    department_name: string;
  };
  invited_by: {
    user_id: number;
    first_name: string;
    last_name: string;
  };
}

const UserRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<InvitationWithDetails | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<RegistrationFormData>({
    password: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState<Partial<RegistrationFormData>>({});

  useEffect(() => {
    if (token) {
      loadInvitationData();
    } else {
      setError('Invalid invitation link. No token provided.');
      setLoading(false);
    }
  }, [token]);

  const loadInvitationData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [invitationData, rolesData] = await Promise.all([
        invitationService.getByToken(token!),
        roleService.getAll()
      ]);

      if (!invitationData) {
        setError('Invalid or expired invitation. Please contact your administrator.');
        return;
      }

      // Check if invitation is expired
      if (new Date(invitationData.expires_at) < new Date()) {
        setError('This invitation has expired. Please contact your administrator for a new invitation.');
        return;
      }

      setInvitation(invitationData as unknown as InvitationWithDetails);
      setRoles(rolesData);
    } catch (err) {
      console.error('Error loading invitation data:', err);
      setError('Failed to load invitation data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (formErrors[name as keyof RegistrationFormData]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegistrationFormData> = {};

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !invitation) return;

    try {
      setSubmitting(true);
      setError(null);

      // Create user account
      const newUser = await userService.create({
        first_name: invitation.first_name,
        last_name: invitation.last_name,
        email: invitation.email,
        password_hash: formData.password, // In production, this should be hashed
        department_id: invitation.department_id.department_id,
        is_active: true
      });

      // Assign roles to the user
      for (const roleId of invitation.role_ids) {
        await userService.assignRole(newUser.user_id, roleId);
      }

      // Update invitation status
      await invitationService.updateStatus(token!, 'Accepted');

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error('Error creating user account:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleNames = (): string[] => {
    if (!invitation || !roles.length) return [];
    return invitation.role_ids
      .map(roleId => roles.find(role => role.role_id === roleId)?.role_name)
      .filter(Boolean) as string[];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Loading Invitation
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Please wait while we verify your invitation...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Invitation Error
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error}
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-green-600 dark:text-green-400 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Account Created Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your account has been created and you can now access the University Procurement System.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              Complete Your Registration
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Welcome to the University Procurement System
            </p>
          </div>
        </div>

        {/* Invitation Details */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Your Assignment Details
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Name:</span>
              <span className="ml-2 text-blue-700 dark:text-blue-300">
                {invitation.first_name} {invitation.last_name}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Email:</span>
              <span className="ml-2 text-blue-700 dark:text-blue-300">{invitation.email}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Department:</span>
              <span className="ml-2 text-blue-700 dark:text-blue-300">
                {invitation.department_id?.department_name || 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Roles:</span>
              <span className="ml-2 text-blue-700 dark:text-blue-300">
                {getRoleNames().join(', ')}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Invited by:</span>
              <span className="ml-2 text-blue-700 dark:text-blue-300">
                {invitation.invited_by?.first_name} {invitation.invited_by?.last_name}
              </span>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                  formErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter your password"
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                  formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Confirm your password"
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={submitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                submitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistration;
