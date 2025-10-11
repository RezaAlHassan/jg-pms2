import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const DatabaseDiagnostic: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, success: boolean, message: string, data?: any) => {
    setResults(prev => [...prev, { test, success, message, data, timestamp: new Date().toISOString() }]);
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Test 1: Basic connection
      addResult('Connection Test', true, 'Supabase client initialized', {
        url: import.meta.env.VITE_SUPABASE_URL ? 'Present' : 'Missing',
        key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
      });

      // Test 2: Check if tables exist
      const tables = ['departments', 'roles', 'users', 'budgets', 'purchase_requests', 'invitations'];
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (error) {
            addResult(`Table: ${table}`, false, `Error: ${error.message}`, error);
          } else {
            addResult(`Table: ${table}`, true, `Table exists and accessible`, { rowCount: data?.length || 0 });
          }
        } catch (err) {
          addResult(`Table: ${table}`, false, `Exception: ${err}`, err);
        }
      }

      // Test 3: Check specific queries
      try {
        const { data: budgets, error: budgetError } = await supabase
          .from('budgets')
          .select('*');
        
        if (budgetError) {
          addResult('Budget Query', false, `Budget query failed: ${budgetError.message}`, budgetError);
        } else {
          addResult('Budget Query', true, `Found ${budgets?.length || 0} budgets`, budgets);
        }
      } catch (err) {
        addResult('Budget Query', false, `Budget query exception: ${err}`, err);
      }

      try {
        const { data: requests, error: requestError } = await supabase
          .from('purchase_requests')
          .select('*');
        
        if (requestError) {
          addResult('Purchase Request Query', false, `Purchase request query failed: ${requestError.message}`, requestError);
        } else {
          addResult('Purchase Request Query', true, `Found ${requests?.length || 0} purchase requests`, requests);
        }
      } catch (err) {
        addResult('Purchase Request Query', false, `Purchase request query exception: ${err}`, err);
      }

    } catch (err) {
      addResult('General Error', false, `Diagnostic failed: ${err}`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Database Diagnostic Tool
        </h2>
        
        <div className="mb-6">
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className={`font-medium py-2 px-4 rounded-lg transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Results:</h3>
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium ${
                      result.success
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      {result.test}
                    </h4>
                    <p className={`text-sm ${
                      result.success
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {result.message}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    result.success ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                </div>
                {result.data && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                      View Details
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Common Issues:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
            <li>Database schema not applied to Supabase</li>
            <li>Missing environment variables (.env file)</li>
            <li>Supabase project not running or accessible</li>
            <li>Row Level Security (RLS) policies blocking access</li>
            <li>Incorrect table or column names</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DatabaseDiagnostic;



