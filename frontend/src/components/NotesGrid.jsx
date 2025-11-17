import React from 'react';

const NotesGrid = ({ notes, loading, onEditNote, onDeleteNote, onAddNote, darkMode }) => {
  const displayNotes = notes && notes.length > 0 ? notes : [];

  const manilaFormatter = React.useMemo(() => new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Manila',
  }), []);

  const formatDateTime = (dateValue) => {
    if (!dateValue) {
      return '—';
    }

    // Ensure we're working with a proper Date object from the UTC timestamp
    let date;
    if (typeof dateValue === 'string') {
      // If it's a string, parse it as UTC
      date = new Date(dateValue + (dateValue.includes('Z') ? '' : 'Z'));
    } else {
      date = new Date(dateValue);
    }
    
    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return manilaFormatter.format(date);
  };

  const getComparableTime = (value) => {
    if (!value) {
      return null;
    }
    
    // Use the same UTC parsing logic as formatDateTime
    let date;
    if (typeof value === 'string') {
      date = new Date(value + (value.includes('Z') ? '' : 'Z'));
    } else {
      date = new Date(value);
    }
    
    return Number.isNaN(date.getTime()) ? null : date.getTime();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center mt-20">
        <p className={darkMode ? "text-gray-400" : "text-gray-500"}>Loading notes...</p>
      </div>
    );
  }

  if (displayNotes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center mt-20">
        <div className="text-center">
          <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-gray-700' : 'bg-[#F7CAC9]'
          }`}>
            <svg
              className={`w-12 h-12 ${darkMode ? 'text-red-400' : 'text-[#DC143C]'}`}
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
          <h3 className={`text-xl font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-[#2D2D2D]'
          }`}>
            No Notes Yet
          </h3>
          <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-[#666666]'}`}>
            Start by creating your first note!
          </p>
          <button
            onClick={onAddNote}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
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
        <h2 className={`text-2xl font-bold mb-2 ${
          darkMode ? 'text-white' : 'text-[#2D2D2D]'
        }`}>
          Your Notes
        </h2>
        <p className={darkMode ? 'text-gray-400' : 'text-[#666666]'}>
          Manage and organize all your notes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayNotes.map((note) => {
          const createdStamp = getComparableTime(note.createdAt);
          const updatedStamp = getComparableTime(note.updatedAt);
          const showUpdated = createdStamp !== null && updatedStamp !== null && updatedStamp !== createdStamp;

          return (
            <div
              key={note.id}
              className={`group rounded-lg shadow-md border hover:shadow-lg transition-all duration-200 ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  : 'bg-white border-[#F7CAC9]'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className={`text-lg font-semibold truncate flex-1 mr-2 ${
                    darkMode ? 'text-white' : 'text-[#2D2D2D]'
                  }`}>
                    {note.title}
                  </h3>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => onEditNote && onEditNote(note)}
                      className={`p-1 transition-colors duration-200 ${
                        darkMode 
                          ? 'text-red-400 hover:text-red-300' 
                          : 'text-[#F75270] hover:text-[#DC143C]'
                      }`}
                      title="Edit Note"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => onDeleteNote && onDeleteNote(note)}
                      className={`p-1 transition-colors duration-200 ${
                        darkMode 
                          ? 'text-red-400 hover:text-red-300' 
                          : 'text-[#F75270] hover:text-[#DC143C]'
                      }`}
                      title="Delete Note"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <p className={`text-sm mb-4 line-clamp-3 ${
                  darkMode ? 'text-gray-300' : 'text-[#666666]'
                }`}>
                  {note.content}
                </p>

                <div className={`flex items-center justify-between text-xs ${
                  darkMode ? 'text-gray-500' : 'text-[#999999]'
                }`}>
                  <span>Created: {formatDateTime(note.createdAt)}</span>
                  {showUpdated && (
                    <span>Updated: {formatDateTime(note.updatedAt)}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotesGrid;