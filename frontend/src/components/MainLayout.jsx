import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import NotesGrid from './NotesGrid';

const MainLayout = () => {
  const [notes, setNotes] = useState([]);

  const handleAddNote = () => {
    console.log('Add Note clicked');
  };

  const handleViewAllNotes = () => {
    console.log('View All Notes clicked');
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
        
        <main className="flex-1 min-h-[calc(100vh-64px)]">
          <NotesGrid 
            notes={notes}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
            onViewNote={handleViewNote}
          />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;