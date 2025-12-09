import React, { useState } from 'react';

const NotesGrid = ({ notes, loading, onEditNote, onDeleteNote, onAddNote, darkMode }) => {
  const displayNotes = notes && notes.length > 0 ? notes : [];
  const [copiedTxHash, setCopiedTxHash] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);

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

  const copyTxHash = (txHash) => {
    navigator.clipboard.writeText(txHash).then(() => {
      setCopiedTxHash(txHash);
      setTimeout(() => setCopiedTxHash(null), 2000); // Clear after 2 seconds
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  // Function to safely render HTML content
  const NoteContent = ({ content, darkMode }) => {
    const createMarkup = () => {
      // Basic sanitization - remove script tags
      const sanitizedContent = content ?
        content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') : '';
      return { __html: sanitizedContent };
    };

    return (
      <div
        className={`note-content ${darkMode ? 'dark-note-content' : ''}`}
        dangerouslySetInnerHTML={createMarkup()}
      />
    );
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
          <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-[#F7CAC9]'
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
          <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-[#2D2D2D]'
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-[#2D2D2D]'
            }`}>
            Your Notes
          </h2>
          <p className={darkMode ? 'text-gray-400' : 'text-[#666666]'}>
            Manage and organize all your notes
          </p>
        </div>

        <button
          onClick={onAddNote}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 font-medium shadow-sm ${darkMode
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-[#DC143C] hover:bg-[#B91C3C] text-white'
            }`}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Note
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayNotes.map((note) => {
          const createdStamp = getComparableTime(note.createdAt);
          const updatedStamp = getComparableTime(note.updatedAt);
          const showUpdated = createdStamp !== null && updatedStamp !== null && updatedStamp !== createdStamp;

          return (
            <div
              key={note.id}
              onClick={() => setViewingNote(note)}
              className={`group relative rounded-xl shadow-md border transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-2 ${darkMode
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/20'
                  : 'bg-white border-[#F7CAC9] hover:border-red-400 hover:shadow-2xl hover:shadow-red-300/30'
                }`}
            >
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${darkMode
                  ? 'bg-gradient-to-br from-red-600/10 to-transparent'
                  : 'bg-gradient-to-br from-red-100/50 to-transparent'
                }`}></div>

              {/* Content */}
              <div className="relative p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className={`text-lg font-semibold truncate flex-1 mr-2 transition-colors duration-200 ${darkMode ? 'text-white group-hover:text-red-400' : 'text-[#2D2D2D] group-hover:text-red-600'
                    }`}>
                    {note.title}
                  </h3>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditNote && onEditNote(note);
                      }}
                      className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${darkMode
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20'
                          : 'text-[#F75270] hover:text-white hover:bg-red-500'
                        }`}
                      title="Edit Note"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote && onDeleteNote(note);
                      }}
                      className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${darkMode
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20'
                          : 'text-[#F75270] hover:text-white hover:bg-red-500'
                        }`}
                      title="Delete Note"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Note Content - Now supports HTML */}
                <div className={`text-sm mb-4 line-clamp-3 transition-colors duration-200 ${darkMode ? 'text-gray-300 group-hover:text-gray-200' : 'text-[#666666] group-hover:text-gray-700'
                  }`}>
                  {note.content && note.content.includes('<') ? (
                    <NoteContent content={note.content} darkMode={darkMode} />
                  ) : (
                    <p>{note.content || ''}</p>
                  )}
                </div>

                {/* Show icons if note contains rich content */}
                {note.content && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {note.content.includes('<b>') || note.content.includes('<strong>') && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>Bold</span>
                    )}
                    {note.content.includes('<i>') || note.content.includes('<em>') && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>Italic</span>
                    )}
                    {note.content.includes('<u>') && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>Underline</span>
                    )}
                    {note.content.includes('<table') && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'
                        }`}>Table</span>
                    )}
                    {note.content.includes('<img') && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-600'
                        }`}>Image</span>
                    )}
                    {note.content.includes('<ul') || note.content.includes('<ol') && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-600'
                        }`}>List</span>
                    )}
                  </div>
                )}

                <div className={`flex flex-col space-y-1 text-xs ${darkMode ? 'text-gray-500' : 'text-[#999999]'
                  }`}>
                  <div className="flex items-center justify-between">
                    <span>Created: {formatDateTime(note.createdAt)}</span>
                    {showUpdated && (
                      <span>Updated: {formatDateTime(note.updatedAt)}</span>
                    )}
                  </div>

                  {/* Blockchain Info */}
                  {note.lastTxHash && (
                    <div className="flex items-center space-x-1 mt-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className={`text-xs font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        On-chain
                      </span>
                      <a
                        href={`https://preview.cardanoscan.io/transaction/${note.lastTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`text-xs underline hover:no-underline font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'
                          }`}
                        title={note.lastTxHash}
                      >
                        View TX
                      </a>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyTxHash(note.lastTxHash);
                          }}
                          className={`p-1 rounded transition-all duration-200 hover:scale-125 ${darkMode
                              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                            }`}
                          title="Copy transaction hash"
                        >
                          {copiedTxHash === note.lastTxHash ? (
                            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                        {copiedTxHash === note.lastTxHash && (
                          <span className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs rounded whitespace-nowrap shadow-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'
                            }`}>
                            Copied!
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CSS for note content styling */}
              <style>{`
                .note-content {
                  line-height: 1.6;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  display: -webkit-box;
                  -webkit-line-clamp: 3;
                  -webkit-box-orient: vertical;
                }
                
                .note-content :global(p) {
                  margin-bottom: 0.5rem;
                }
                
                .note-content :global(ul), .note-content :global(ol) {
                  margin-left: 1.5rem;
                  margin-bottom: 0.5rem;
                }
                
                .note-content :global(li) {
                  margin-bottom: 0.25rem;
                }
                
                .note-content :global(img) {
                  max-width: 100%;
                  max-height: 100px;
                  height: auto;
                  border-radius: 4px;
                  margin: 0.25rem 0;
                  display: inline-block;
                }
                
                .note-content :global(table) {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 0.25rem 0;
                  font-size: 0.875rem;
                }
                
                .note-content :global(th), .note-content :global(td) {
                  border: 1px solid ${darkMode ? '#4b5563' : '#d1d5db'};
                  padding: 4px;
                  max-width: 150px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
                
                .note-content :global(blockquote) {
                  border-left: 3px solid ${darkMode ? '#4b5563' : '#d1d5db'};
                  padding-left: 0.75rem;
                  margin-left: 0;
                  font-style: italic;
                  color: ${darkMode ? '#9ca3af' : '#6b7280'};
                  margin: 0.25rem 0;
                }
                
                .note-content :global(b), .note-content :global(strong) {
                  font-weight: 600;
                }
                
                .note-content :global(i), .note-content :global(em) {
                  font-style: italic;
                }
                
                .note-content :global(u) {
                  text-decoration: underline;
                }
                
                .note-content :global(s) {
                  text-decoration: line-through;
                }
                
                .note-content :global(h1) {
                  font-size: 1.5rem;
                  font-weight: 600;
                  margin: 0.25rem 0;
                }
                
                .note-content :global(h2) {
                  font-size: 1.25rem;
                  font-weight: 600;
                  margin: 0.25rem 0;
                }
                
                .note-content :global(h3) {
                  font-size: 1.125rem;
                  font-weight: 600;
                  margin: 0.25rem 0;
                }
              `}</style>
            </div>
          );
        })}
      </div>

      {/* View Note Modal */}
      {viewingNote && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50 p-4"
          onClick={() => setViewingNote(null)}
        >
          <div 
            className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#2D2D2D]'}`}>
                {viewingNote.title}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setViewingNote(null);
                    onEditNote && onEditNote(viewingNote);
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${darkMode
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-[#DC143C] hover:bg-[#B91C3C] text-white'
                    }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setViewingNote(null)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${darkMode
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Note Content */}
              <div className={`mb-6 ${darkMode ? 'text-gray-200' : 'text-[#666666]'}`}>
                {viewingNote.content && viewingNote.content.includes('<') ? (
                  <div
                    className={`note-view-content ${darkMode ? 'dark-note-content' : ''}`}
                    dangerouslySetInnerHTML={{
                      __html: viewingNote.content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{viewingNote.content || ''}</p>
                )}
              </div>

              {/* Metadata */}
              <div className={`border-t pt-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`flex flex-col space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-[#999999]'}`}>
                  <div className="flex items-center justify-between">
                    <span>Created: {formatDateTime(viewingNote.createdAt)}</span>
                    {getComparableTime(viewingNote.createdAt) !== null && 
                     getComparableTime(viewingNote.updatedAt) !== null && 
                     getComparableTime(viewingNote.updatedAt) !== getComparableTime(viewingNote.createdAt) && (
                      <span>Updated: {formatDateTime(viewingNote.updatedAt)}</span>
                    )}
                  </div>

                  {/* Blockchain Info */}
                  {viewingNote.lastTxHash && (
                    <div className={`flex items-center space-x-2 mt-2 p-3 rounded-lg ${darkMode ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        On-chain
                      </span>
                      <a
                        href={`https://preview.cardanoscan.io/transaction/${viewingNote.lastTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm underline hover:no-underline font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                      >
                        View TX
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for note view content styling */}
      <style>{`
        .note-view-content {
          line-height: 1.8;
        }
        
        .note-view-content p {
          margin-bottom: 1rem;
        }
        
        .note-view-content ul, .note-view-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .note-view-content li {
          margin-bottom: 0.5rem;
        }
        
        .note-view-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
        }
        
        .note-view-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        
        .note-view-content th, .note-view-content td {
          border: 1px solid ${darkMode ? '#4b5563' : '#d1d5db'};
          padding: 8px;
        }
        
        .note-view-content blockquote {
          border-left: 4px solid ${darkMode ? '#4b5563' : '#d1d5db'};
          padding-left: 1rem;
          margin-left: 0;
          font-style: italic;
          color: ${darkMode ? '#9ca3af' : '#6b7280'};
          margin: 1rem 0;
        }
        
        .note-view-content b, .note-view-content strong {
          font-weight: 600;
        }
        
        .note-view-content i, .note-view-content em {
          font-style: italic;
        }
        
        .note-view-content u {
          text-decoration: underline;
        }
        
        .note-view-content s {
          text-decoration: line-through;
        }
        
        .note-view-content h1 {
          font-size: 2rem;
          font-weight: 600;
          margin: 1.5rem 0 1rem 0;
        }
        
        .note-view-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem 0;
        }
        
        .note-view-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
        }
      `}</style>
    </div>
  );
};

export default NotesGrid;