import React, { useState, useEffect } from 'react';
import { dbUtils } from '../lib/database';

const DatabaseSetup: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const connected = await dbUtils.testConnection();
      setIsConnected(connected);
      setMessage(connected ? 'Database connected successfully!' : 'Database connection failed');
    } catch (error) {
      setIsConnected(false);
      setMessage('Database connection error');
    }
  };

  const initializeData = async () => {
    try {
      setIsInitializing(true);
      setMessage('Initializing sample data...');
      await dbUtils.initializeSampleData();
      setMessage('Sample data initialized successfully!');
    } catch (error) {
      setMessage('Error initializing sample data');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Database Setup
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              isConnected === null ? 'bg-gray-400' : 
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-700 dark:text-gray-300">
              {isConnected === null ? 'Testing connection...' : 
               isConnected ? 'Connected' : 'Not connected'}
            </span>
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${
              isConnected ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' :
              'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={testConnection}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Test Connection
            </button>
            
            <button
              onClick={initializeData}
              disabled={isInitializing || !isConnected}
              className={`font-medium py-2 px-4 rounded-lg transition-colors ${
                isInitializing || !isConnected
                  ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isInitializing ? 'Initializing...' : 'Initialize Sample Data'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Setup Instructions:
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li>Make sure your Supabase project is running</li>
              <li>Run the SQL schema from <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">database_schema.sql</code> in your Supabase SQL editor</li>
              <li>Test the connection above</li>
              <li>Initialize sample data if needed</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetup;
