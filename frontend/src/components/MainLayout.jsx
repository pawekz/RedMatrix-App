import React, { useEffect, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import NotesGrid from './NotesGrid';

const MainLayout = () => {
  const [notes, setNotes] = useState([]);
  const [showNotepad, setShowNotepad] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  const handleAddNote = () => {
    console.log('Add Note clicked');
    setShowNotepad(true);
  };

  //Save new note to backend
  const handleSaveNote = () => {
      const noteToSend = {
        title: newNote.title,
        content: newNote.content,
      };
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
      
  };

  // Show all all ntoes from backend
  const handleViewAllNotes = () => {
    fetch('http://localhost:8080/api/notes', {
      method: 'GET', 
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error fetching notes: ${res.status}`);
        }
        return res.json();
      })
      .then((notes) => {
        console.log('Fetched notes:', notes);
        setNotes(notes);
      })
      .catch((err) => console.error(err));
  };


  const handleEditNote = (note) => {
    console.log('Edit Note clicked:', note);
  };

  const handleDeleteNote = (note) => {
    console.log('Delete Note clicked:', note);
    if (window.confirm('Are you sure you want to delete this note?')) {
    }
  };

 const handleViewNote = (note) => {
    console.log('View Note clicked:', note);
  }; 

  return (
    <div className="min-h-screen bg-[#FDEBD0]">
      <Header />

      <div className="flex">
        <Sidebar 
          onAddNote={handleAddNote}
          onViewAllNotes={handleViewAllNotes}
        />
        {/* Notes GRid, ari ang mga notes */}
        <main className="flex-1 min-h-[calc(100vh-64px)]">
          <NotesGrid 
            notes={notes}
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
            <h2 className="text-xl font-bold mb-4">New Note</h2>

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
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
