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
    walletAddressBech32,
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
                  {walletAddressBech32 ? `(${walletAddressBech32.substring(0, 12)}...${walletAddressBech32.substring(walletAddressBech32.length - 8)})` : ''}
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50 p-4">
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden transform transition-all ${
            darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-gray-50'
          }`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  darkMode ? 'bg-red-600/20' : 'bg-red-100'
                }`}>
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {editingNote ? 'Edit Note' : 'Create New Note'}
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {editingNote ? 'Update your note details' : 'Write something amazing'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowNotepad(false)}
                className={`p-2 rounded-lg transition-all hover:rotate-90 duration-300 ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <div className="px-6 py-6 flex-1 space-y-5">
              {/* Title Input */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="Enter note title..."
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
                      darkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-red-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-red-500'
                    }`}
                  />
                  <div className={`absolute right-3 top-3 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Content Textarea */}
              <div className="space-y-2 flex-1 flex flex-col">
                <label className={`block text-sm font-semibold ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Content
                </label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Start writing your note here..."
                  rows="10"
                  className={`flex-1 w-full px-4 py-3 rounded-xl border-2 resize-none transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
                    darkMode 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-red-500' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-red-500'
                  }`}
                />
                <div className={`flex items-center justify-between text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <span>{newNote.content.length} characters</span>
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Saved to blockchain</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t flex items-center justify-between ${
              darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1.5 rounded-lg text-sm flex items-center space-x-2 ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600 border border-gray-200'
                }`}>
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="font-medium">Blockchain Enabled</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowNotepad(false);
                    setEditingNote(null);
                    setNewNote({ title: '', content: '' });
                  }}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 ${
                    darkMode 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={blockchainLoading || !newNote.title.trim() || !newNote.content.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-red-500/30 flex items-center space-x-2"
                >
                  {blockchainLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{editingNote ? 'Update Note' : 'Save Note'}</span>
                    </>
                  )}
                </button>
              </div>
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
                  No Cardano wallets detected. Please install a wallet extension like
                  <a
                    href="https://www.lace.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-500 underline mx-1"
                  >
                    Lace
                  </a>
                  and
                  <a
                    href="https://eternl.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-500 underline ml-1"
                  >
                    Eternl
                  </a>.
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

