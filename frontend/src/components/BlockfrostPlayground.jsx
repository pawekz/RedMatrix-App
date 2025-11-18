import React, { useState } from 'react';
import { API_BASE_URL } from '../config/ApiConfig.jsx';

const BlockfrostPlayground = ({ darkMode }) => {
  const [txHash, setTxHash] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetadata = async () => {
    if (!txHash.trim()) {
      alert('Please enter a transaction hash');
      return;
    }

    setLoading(true);
    setError(null);
    setMetadata(null);

    try {
      // Use backend endpoint instead of direct Blockfrost API call
      const response = await fetch(
        `${API_BASE_URL}/api/blockfrost/txs/${txHash}/metadata`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Transaction not found. Make sure the transaction hash is correct and exists on Preview Testnet.');
        }
        if (response.status === 503) {
          throw new Error('Blockfrost Project ID not configured on the backend. Please set BLOCKFROST_PROJECT_ID environment variable.');
        }
        throw new Error(`Blockfrost API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setMetadata(data);
    } catch (err) {
      console.error('Error fetching metadata:', err);
      setError(err.message || 'Failed to fetch metadata');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchMetadata();
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${
          darkMode ? 'text-white' : 'text-[#2D2D2D]'
        }`}>
          Metadata Viewer
        </h2>
        <p className={darkMode ? 'text-gray-400' : 'text-[#666666]'}>
          View transaction metadata from Cardano Preview Testnet
        </p>
      </div>

      {/* Input Section */}
      <div className={`p-6 rounded-lg shadow-md mb-6 ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-[#F7CAC9]'
      }`}>
        <label className={`block text-sm font-medium mb-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Transaction Hash
        </label>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter transaction hash (e.g., 523d76570598f6e3...)"
            className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          <button
            onClick={fetchMetadata}
            disabled={loading}
            className={`px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              loading ? 'animate-pulse' : ''
            }`}
          >
            {loading ? 'Fetching...' : 'Fetch Metadata'}
          </button>
        </div>

        <p className={`mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Tip: You can copy transaction hashes from your notes (click "View TX" link)
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Metadata Display */}
      {metadata && (
        <div className={`rounded-lg shadow-md ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-[#F7CAC9]'
        }`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Transaction Metadata
            </h3>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Found {metadata.length} metadata label(s)
            </p>
          </div>

          <div className="p-4">
            {metadata.length === 0 ? (
              <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No metadata found for this transaction
              </p>
            ) : (
              <div className="space-y-4">
                {metadata.map((item, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Label: {item.label}
                      </span>
                      {item.label === '674' && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Notes App
                        </span>
                      )}
                    </div>
                    
                    <div className={`mt-2 p-3 rounded font-mono text-sm overflow-x-auto ${
                      darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'
                    }`}>
                      <pre className="whitespace-pre-wrap break-all">
                        {JSON.stringify(item.json_metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transaction Link */}
          <div className={`p-4 border-t ${
            darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
          }`}>
            <a
              href={`https://preview.cardanoscan.io/transaction/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View on Cardano Explorer
            </a>
          </div>
        </div>
      )}

      {/* Info Section */}
      {!metadata && !error && !loading && (
        <div className={`p-6 rounded-lg ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-blue-50 border border-blue-200'
        }`}>
          <h4 className={`font-semibold mb-2 ${
            darkMode ? 'text-blue-400' : 'text-blue-900'
          }`}>
            💡 How to use
          </h4>
          <ul className={`space-y-2 text-sm ${
            darkMode ? 'text-gray-300' : 'text-blue-800'
          }`}>
            <li>• Enter a transaction hash from Cardano Preview Testnet</li>
            <li>• Click "Fetch Metadata" or press Enter</li>
            <li>• View the metadata stored on-chain</li>
            <li>• For notes created in this app, look for label 674</li>
            <li>• Copy transaction hashes from your notes by clicking "View TX"</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default BlockfrostPlayground;

