import React, { useState } from 'react';
import { noteUrl } from '../config/ApiConfig.jsx';

const ApiTest = () => {
  const [testResult, setTestResult] = useState('');
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setTestResult('Testing connection...');

    try {
      // Test GET /api/notes endpoint
      const response = await fetch(noteUrl());
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTestResult(`✅ Connection successful! Found ${data.length} notes.`);
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setTestResult('❌ Backend not running or CORS issue. Make sure Spring Boot is running on port 8080.');
      } else {
        setTestResult(`❌ Error: ${error.message}`);
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2">API Connection Test</h3>
      <button
        onClick={testConnection}
        disabled={testing}
        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
      >
        {testing ? 'Testing...' : 'Test Connection'}
      </button>
      {testResult && (
        <div className="mt-2 text-sm">
          <div className={`p-2 rounded ${
            testResult.includes('✅') ? 'bg-green-100 text-green-800' : 
            testResult.includes('❌') ? 'bg-red-100 text-red-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {testResult}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiTest;
