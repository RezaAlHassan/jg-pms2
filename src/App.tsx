import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import AddRequest from './pages/AddRequest';
import Admin from './pages/Admin';
import CreateDepartment from './pages/CreateDepartment';
import DepartmentDetails from './pages/DepartmentDetails';
import UserRegistration from './pages/UserRegistration';
import Approvals from './pages/Approvals';
import Suppliers from './pages/Suppliers';
import DatabaseSetup from './pages/DatabaseSetup';
import DatabaseDiagnostic from './pages/DatabaseDiagnostic';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Navigation */}
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Shifty
                  </h1>
                </div>
                <div className="hidden md:flex space-x-6">
                  <a
                    href="/dashboard"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/requests"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Requests
                  </a>
                  <a
                    href="/approvals"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Approvals
                  </a>
                  <a
                    href="/admin"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Admin
                  </a>
                  <a
                    href="/suppliers"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Suppliers
                  </a>
                  <a
                    href="/diagnostic"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Diagnostic
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">JD</span>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">John Doe</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/requests/new" element={<AddRequest />} />
            <Route path="/register" element={<UserRegistration />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/departments/create" element={<CreateDepartment />} />
            <Route path="/admin/departments/:id" element={<DepartmentDetails />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/setup" element={<DatabaseSetup />} />
            <Route path="/diagnostic" element={<DatabaseDiagnostic />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
