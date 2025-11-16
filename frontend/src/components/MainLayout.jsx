import React, { useEffect, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import NotesGrid from './NotesGrid';
import BlockfrostPlayground from './BlockfrostPlayground';
import ApiTest from './ApiTest';
import { noteUrl } from '../config/ApiConfig.jsx';
import { useWallet } from '../hooks/useWallet';
import {
  submitCreateNoteToBlockchain,
  submitUpdateNoteToBlockchain,
  submitDeleteNoteToBlockchain,
} from '../services/blockchainService';

const MainLayout = () => {
  const [currentView, setCurrentView] = useState('notes'); // 'notes' or 'blockfrost'
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotepad, setShowNotepad] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [blockchainLoading, setBlockchainLoading] = useState(false);
  
  // Initialize wallet hook
  const {
    wallets,
    walletApi,
    selectedWallet,
    walletAddress,
    isConnected,
    isConnecting,
    error: walletError,
    connectWallet,
    disconnectWallet,
  } = useWallet();
  
  // Initialize darkMode from localStorage, default to false if not found
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });

  // Save darkMode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Fetch notes from backend
  const fetchNotes = () => {
    setLoading(true);
    fetch(noteUrl())
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error fetching notes: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setNotes(data);
        setFilteredNotes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch notes:', err);
        setLoading(false);
      });
  };

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  // Filter notes whenever search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredNotes(notes);
    } else {
      const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNotes(filtered);
    }
  }, [searchTerm, notes]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleAddNote = () => {
    console.log('Add Note clicked');
    setNewNote({ title: '', content: '' });
    setShowNotepad(true);
  };

  const handleSaveNote = async () => {
    // Check if wallet is connected
    if (!isConnected || !walletApi) {
      alert('Please connect your wallet first to save notes to blockchain');
      setShowWalletModal(true);
      return;
    }

    // Validate note
    if (!newNote.title.trim() || !newNote.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    setBlockchainLoading(true);

    try {
      let blockchainData;

      if (editingNote) {
        // UPDATE operation
        console.log('Submitting UPDATE to blockchain...');
        blockchainData = await submitUpdateNoteToBlockchain(
          walletApi,
          walletAddress,
          editingNote.id,
          newNote.content
        );
        console.log('Blockchain UPDATE successful:', blockchainData);

        const noteToSend = {
          title: newNote.title,
          content: newNote.content,
          contentHash: blockchainData.contentHash,
          lastTxHash: blockchainData.txHash,
          ownerWallet: walletAddress,
        };

        const res = await fetch(noteUrl(editingNote.id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteToSend),
        });

        if (!res.ok) {
          throw new Error(`Error updating note: ${res.status}`);
        }

        const updatedNote = await res.json();
        console.log('Note updated in database:', updatedNote);
        
        const updatedNotes = notes.map((n) => (n.id === updatedNote.id ? updatedNote : n));
        setNotes(updatedNotes);
        setShowNotepad(false);
        setNewNote({ title: '', content: '' });
        setEditingNote(null);
        alert('Note updated successfully on blockchain!');
      } else {
        // CREATE operation - Two-phase approach
        // Phase 1: Save to database first to get the note ID
        console.log('Phase 1: Saving note to database to get ID...');
        const noteToSend = {
          title: newNote.title,
          content: newNote.content,
          ownerWallet: walletAddress,
          // No blockchain data yet
        };

        const res = await fetch(noteUrl(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteToSend),
        });

        if (!res.ok) {
          throw new Error(`Error saving note: ${res.status}`);
        }

        const savedNote = await res.json();
        console.log('Note saved in database with ID:', savedNote.id);

        // Phase 2: Submit to blockchain with the real note ID
        console.log('Phase 2: Submitting CREATE to blockchain with note ID:', savedNote.id);
        blockchainData = await submitCreateNoteToBlockchain(
          walletApi,
          walletAddress,
          newNote.content,
          newNote.title,
          savedNote.id // Pass the real note ID
        );
        console.log('Blockchain CREATE successful:', blockchainData);

        // Phase 3: Update the note with blockchain data
        console.log('Phase 3: Updating note with blockchain data...');
        const updateNoteWithBlockchain = {
          title: newNote.title,
          content: newNote.content,
          contentHash: blockchainData.contentHash,
          lastTxHash: blockchainData.txHash,
          ownerWallet: walletAddress,
        };

        const updateRes = await fetch(noteUrl(savedNote.id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateNoteWithBlockchain),
        });

        if (!updateRes.ok) {
          throw new Error(`Error updating note with blockchain data: ${updateRes.status}`);
        }

        const finalNote = await updateRes.json();
        console.log('Note updated with blockchain data:', finalNote);
        
        const updatedNotes = [finalNote, ...notes];
        setNotes(updatedNotes);
        setShowNotepad(false);
        setNewNote({ title: '', content: '' });
        alert('Note created successfully on blockchain!');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert(`Failed to save note: ${error.message}`);
    } finally {
      setBlockchainLoading(false);
    }
  };

  const handleEditNote = (note) => {
    console.log('Edit Note clicked:', note);
    setEditingNote(note);
    setNewNote({ title: note.title, content: note.content });
    setShowNotepad(true);
  };

  const handleDeleteNote = async (note) => {
    console.log('Delete Note clicked:', note);
    
    // Check if wallet is connected
    if (!isConnected || !walletApi) {
      alert('Please connect your wallet first to delete notes from blockchain');
      setShowWalletModal(true);
      return;
    }

    if (window.confirm('Are you sure you want to delete this note? This will be recorded on the blockchain.')) {
      setBlockchainLoading(true);
      
      try {
        // Submit DELETE to blockchain first
        console.log('Submitting DELETE to blockchain...');
        const blockchainData = await submitDeleteNoteToBlockchain(
          walletApi,
          walletAddress,
          note.id,
          note.content
        );
        console.log('Blockchain DELETE successful:', blockchainData);

        // Then delete from database
        const res = await fetch(noteUrl(note.id), {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error(`Error deleting note: ${res.status}`);
        }

        console.log('Note deleted successfully from database');
        const updatedNotes = notes.filter((n) => n.id !== note.id);
        setNotes(updatedNotes);
        alert('Note deleted successfully and recorded on blockchain!');
      } catch (error) {
        console.error('Failed to delete note:', error);
        alert(`Failed to delete note: ${error.message}`);
      } finally {
        setBlockchainLoading(false);
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-[#FDEBD0]'
    }`}>
      <Header 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Wallet Connection Banner */}
      <div className={`w-full py-2 px-4 flex items-center justify-between ${
        darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'
      }`}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            {isConnected ? (
              <>
                <span className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Connected: {selectedWallet}
                </span>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {walletAddress ? `(${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 6)})` : ''}
                </span>
              </>
            ) : (
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No wallet connected
              </span>
            )}
          </div>
          
          {isConnected ? (
            <button
              onClick={disconnectWallet}
              className="px-4 py-1.5 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={() => setShowWalletModal(true)}
              className="px-4 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Blockchain Loading Overlay */}
      {blockchainLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className={`p-6 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              <p className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Processing Blockchain Transaction...
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Please confirm in your wallet
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        <Sidebar 
          currentView={currentView}
          onNavigate={handleNavigate}
          darkMode={darkMode}
        />
        <main className="flex-1 min-h-[calc(100vh-64px)]">
          {currentView === 'notes' ? (
            <NotesGrid 
              notes={filteredNotes}
              loading={loading}
              onEditNote={handleEditNote}
              onDeleteNote={handleDeleteNote}
              onAddNote={handleAddNote}
              darkMode={darkMode}
            />
          ) : currentView === 'blockfrost' ? (
            <BlockfrostPlayground darkMode={darkMode} />
          ) : null}
        </main>
      </div>

      {/* Modal for Notepad */}
      {showNotepad && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className={`w-[500px] h-[500px] max-w-[50%] max-h-[50%] p-4 rounded shadow-lg flex flex-col ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <h2 className="text-xl font-bold mb-4">
              {editingNote ? 'Edit Note' : 'New Note'}
            </h2>

            <input
              type="text"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              placeholder="Title"
              className={`w-full border rounded px-2 py-1 mb-2 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />

            <textarea
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              placeholder="Write your note here..."
              className={`flex-1 w-full border rounded p-2 resize-none ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />

            <div className="flex justify-end mt-2 space-x-2">
              <button
                onClick={() => setShowNotepad(false)}
                className={`px-3 py-1 rounded ${
                  darkMode 
                    ? 'bg-gray-600 text-white hover:bg-gray-500' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={blockchainLoading}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {blockchainLoading ? 'Processing...' : (editingNote ? 'Update' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className={`w-[400px] p-6 rounded-lg shadow-xl ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Connect Wallet</h2>
              <button
                onClick={() => setShowWalletModal(false)}
                className={`p-1 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700' : ''}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className={`mb-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Connect your Cardano wallet to enable blockchain features for your notes.
            </p>

            {walletError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {walletError}
              </div>
            )}

            {wallets.length === 0 ? (
              <div className={`p-4 border rounded ${
                darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
              }`}>
                <p className="text-center">
                  No Cardano wallets detected. Please install a wallet extension like Lace, Eternl, or Nami.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Select Wallet:
                </label>
                {wallets.map((wallet) => (
                  <button
                    key={wallet}
                    onClick={() => {
                      connectWallet(wallet).then(() => {
                        setShowWalletModal(false);
                      }).catch((err) => {
                        console.error('Failed to connect:', err);
                      });
                    }}
                    disabled={isConnecting}
                    className={`w-full p-3 border rounded flex items-center justify-between transition-colors ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    } ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className="capitalize font-medium">{wallet}</span>
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowWalletModal(false)}
                className={`px-4 py-2 rounded ${
                  darkMode 
                    ? 'bg-gray-600 text-white hover:bg-gray-500' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;