import React, { useEffect, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import NotesGrid from './NotesGrid';

const MainLayout = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotepad, setShowNotepad] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
    fetch('http://localhost:8080/api/notes')
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

  const handleAddNote = () => {
    console.log('Add Note clicked');
    setNewNote({ title: '', content: '' });
    setShowNotepad(true);
  };

  const handleSaveNote = () => {
    const noteToSend = {
      title: newNote.title,
      content: newNote.content,
    };

    if (editingNote) {
      fetch(`http://localhost:8080/api/notes/${editingNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteToSend),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error updating note: ${res.status}`);
          }
          return res.json();
        })
        .then((updatedNote) => {
          console.log('Note updated:', updatedNote);
          const updatedNotes = notes.map((n) => (n.id === updatedNote.id ? updatedNote : n));
          setNotes(updatedNotes);
          setShowNotepad(false);
          setNewNote({ title: '', content: '' });
          setEditingNote(null);
        })
        .catch((err) => console.error(err));
    } else {
      fetch('http://localhost:8080/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteToSend),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error saving note: ${res.status}`);
          }
          return res.json();
        })
        .then((savedNote) => {
          console.log('Note saved:', savedNote);
          const updatedNotes = [savedNote, ...notes];
          setNotes(updatedNotes);
          setShowNotepad(false);
          setNewNote({ title: '', content: '' });
        })
        .catch((err) => console.error(err));
    }
  };

  const handleEditNote = (note) => {
    console.log('Edit Note clicked:', note);
    setEditingNote(note);
    setNewNote({ title: note.title, content: note.content });
    setShowNotepad(true);
  };

  const handleDeleteNote = (note) => {
    console.log('Delete Note clicked:', note);
    if (window.confirm('Are you sure you want to delete this note?')) {
      fetch(`http://localhost:8080/api/notes/${note.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error deleting note: ${res.status}`);
          }
          console.log('Note deleted successfully');
          const updatedNotes = notes.filter((n) => n.id !== note.id);
          setNotes(updatedNotes);
        })
        .catch((err) => {
          console.error('Failed to delete note:', err);
          alert('Failed to delete note. Please try again.');
        });
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

      <div className="flex">
        <Sidebar 
          onAddNote={handleAddNote}
          darkMode={darkMode}
        />
        <main className="flex-1 min-h-[calc(100vh-64px)]">
          <NotesGrid 
            notes={filteredNotes}
            loading={loading}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
            onAddNote={handleAddNote}
            darkMode={darkMode}
          />
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
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {editingNote ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;