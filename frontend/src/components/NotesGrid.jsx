import React, { useEffect, useState } from 'react';

const NotesGrid = ({ onEditNote, onDeleteNote, onViewNote, onAddNote }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch notes on component mount
  useEffect(() => {
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
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const displayNotes = notes && notes.length > 0 ? notes : [];

  // loading spinner
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center mt-20">
        <p className="text-gray-500">Loading notes...</p>
      </div>
    );
  }

  // No notes yet placeholder
  if (displayNotes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center mt-20">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-[#F7CAC9] rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-[#DC143C]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[#2D2D2D] mb-2">No Notes Yet</h3>
          <p className="text-[#666666] mb-4">Start by creating your first note!</p>
          <button
            onClick={onAddNote}
            className="px-6 py-2 bg-[#DC143C] text-white rounded-lg hover:bg-[#B91C3C] transition-colors duration-200"
          >
            Create Your First Note
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">Your Notes</h2>
        <p className="text-[#666666]">Manage and organize all your notes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayNotes.map((note) => (
          <div
            key={note.id}
            className="bg-white rounded-lg shadow-md border border-[#F7CAC9] hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
            onClick={() => onViewNote && onViewNote(note)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-[#2D2D2D] truncate flex-1 mr-2">
                  {note.title}
                </h3>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditNote && onEditNote(note);
                    }}
                    className="p-1 text-[#F75270] hover:text-[#DC143C] transition-colors duration-200"
                    title="Edit Note"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote && onDeleteNote(note);
                    }}
                    className="p-1 text-[#F75270] hover:text-[#DC143C] transition-colors duration-200"
                    title="Delete Note"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="text-[#666666] text-sm mb-4 line-clamp-3">{note.content}</p>

              {/* Timestamp */}
              <div className="flex items-center justify-between text-xs text-[#999999]">
                <span>Created: {note.createdAt}</span>
                {note.updatedAt !== note.createdAt && <span>Updated: {note.updatedAt}</span>}
              </div>
            </div>

            {/* Click to View Note highlight, tangtangon nlang ni? */}
            <div className="px-4 py-3 bg-[#FDEBD0] border-t border-[#F7CAC9] rounded-b-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#666666]">Click to view details</span>
                <svg
                  className="w-4 h-4 text-[#DC143C]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesGrid;
