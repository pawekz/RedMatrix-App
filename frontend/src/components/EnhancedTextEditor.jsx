import React, { useRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module';
import { imageUpload } from '../services/imageUploadService';

// Register image resize module
const Quill = typeof window !== 'undefined' ? require('quill') : null;
if (Quill) {
  Quill.register('modules/imageResize', ImageResize);
}

const EnhancedTextEditor = ({ value, onChange, darkMode }) => {
  const quillRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      // File validation
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        alert('Please upload only .jpg, .jpeg, .png, .gif, .webp, or .svg files');
        return;
      }
      
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      try {
        // Show loading
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        const placeholderId = 'img-' + Date.now();
        
        // Insert placeholder
        editor.insertEmbed(range.index, 'image', 'loading.gif');
        
        // Upload image
        const imageUrl = await imageUpload(file);
        
        // Replace placeholder with actual image
        editor.deleteText(range.index, 1);
        editor.insertEmbed(range.index, 'image', imageUrl);
        
      } catch (error) {
        console.error('Image upload failed:', error);
        alert('Failed to upload image. Please try again.');
      }
    };
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'font': [] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video', 'formula'],
        ['clean'],
        // Table controls
        [{ 'table': 'insert' }, { 'table': 'addRow' }, { 'table': 'addColumn' }],
      ],
      handlers: {
        image: imageHandler,
      }
    },
    imageResize: {
      parchment: Quill ? Quill.import('parchment') : null,
      modules: ['Resize', 'DisplaySize']
    },
    table: true,
  };

  const formats = [
    'font',
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'check',
    'script',
    'indent',
    'direction',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video', 'formula',
    'table',
  ];

  if (!mounted) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className={`text-editor-container ${darkMode ? 'dark-mode' : ''}`}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        style={{ 
          height: '300px',
          border: darkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
          borderRadius: '8px',
        }}
      />
      <style jsx>{`
        .text-editor-container :global(.ql-toolbar) {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          background: ${darkMode ? '#374151' : '#f9fafb'};
          border-color: ${darkMode ? '#4b5563' : '#d1d5db'};
        }
        
        .text-editor-container :global(.ql-container) {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          border-color: ${darkMode ? '#4b5563' : '#d1d5db'};
          background: ${darkMode ? '#1f2937' : '#fff'};
          color: ${darkMode ? '#e5e7eb' : '#374151'};
          font-family: inherit;
        }
        
        .text-editor-container :global(.ql-editor) {
          min-height: 250px;
          color: ${darkMode ? '#e5e7eb' : '#374151'};
        }
        
        .text-editor-container :global(.ql-snow .ql-picker) {
          color: ${darkMode ? '#e5e7eb' : '#374151'};
        }
        
        .text-editor-container :global(.ql-snow .ql-stroke) {
          stroke: ${darkMode ? '#e5e7eb' : '#374151'};
        }
        
        .text-editor-container :global(.ql-snow .ql-fill) {
          fill: ${darkMode ? '#e5e7eb' : '#374151'};
        }
        
        .text-editor-container :global(.ql-snow.ql-toolbar button:hover),
        .text-editor-container :global(.ql-snow .ql-toolbar button:hover),
        .text-editor-container :global(.ql-snow.ql-toolbar button:focus),
        .text-editor-container :global(.ql-snow .ql-toolbar button:focus),
        .text-editor-container :global(.ql-snow.ql-toolbar button.ql-active),
        .text-editor-container :global(.ql-snow .ql-toolbar button.ql-active) {
          background-color: ${darkMode ? '#4b5563' : '#e5e7eb'};
        }
        
        // Style for checklist
        .text-editor-container :global(.ql-list[value="check"])::before {
          content: '✓';
        }
      `}</style>
    </div>
  );
};

export default EnhancedTextEditor;