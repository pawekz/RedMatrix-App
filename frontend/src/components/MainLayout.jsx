import React, { useEffect, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import NotesGrid from './NotesGrid';
import ApiTest from './ApiTest';

const MainLayout = () => {
  const [notes, setNotes] = useState([]);
  const [showNotepad, setShowNotepad] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(true);

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


  const handleAddNote = () => {
    console.log('Add Note clicked');
    setNewNote({ title: '', content: '' });
    setShowNotepad(true);
  };

    // Save new note OR update existing note to backend
  const handleSaveNote = () => {
    const noteToSend = {
      title: newNote.title,
      content: newNote.content,
    };

    //update note
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
          setNotes(notes.map((n) => (n.id === updatedNote.id ? updatedNote : n)));
          setShowNotepad(false);
          setNewNote({ title: '', content: '' });
          setEditingNote(null);
        })
        .catch((err) => console.error(err));
    } else {
      // Crreate note
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
          setNotes([savedNote, ...notes]);
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
          // Remove the deleted note from the state
          setNotes(notes.filter((n) => n.id !== note.id));
        })
        .catch((err) => {
          console.error('Failed to delete note:', err);
          alert('Failed to delete note. Please try again.');
        });
    }
  };

 const handleViewNote = (note) => {
    console.log('View Note clicked:', note);
  }; 

  return (
    <div className="min-h-screen bg-[#FDEBD0]">
      <Header />
      <ApiTest />

      <div className="flex">
        <Sidebar 
          onAddNote={handleAddNote}
        />
        {/* Notes GRid, ari ang mga notes */}
        <main className="flex-1 min-h-[calc(100vh-64px)]">
          <NotesGrid 
            notes={notes}
            loading={loading}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
            onAddNote={handleAddNote}
          />
        </main>
      </div>

      {/* Modal for Notepad */}
      {showNotepad && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-50">
          <div className="bg-white w-[500px] h-[500px] max-w-[50%] max-h-[50%] p-4 rounded shadow-lg flex flex-col">
            <h2 className="text-xl font-bold mb-4">
              {editingNote ? 'Edit Note' : 'New Note'}
            </h2>

            <input
              type="text"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              placeholder="Title"
              className="w-full border rounded px-2 py-1 mb-2"
            />

            <textarea
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              placeholder="Write your note here..."
              className="flex-1 w-full border rounded p-2 resize-none"
            />

            <div className="flex justify-end mt-2 space-x-2">
              <button
                onClick={() => setShowNotepad(false)}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-3 py-1 bg-red-600 text-white rounded"
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
