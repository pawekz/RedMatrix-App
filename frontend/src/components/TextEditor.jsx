import React, { useState, useRef, useEffect } from 'react';

const TextEditor = ({ value, onChange, darkMode }) => {
  const editorRef = useRef(null);
  const toolbarRef = useRef(null);
  const [content, setContent] = useState('');
  const [fontSize, setFontSize] = useState('15px');
  const [selectedFontSize, setSelectedFontSize] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize editor content ONLY once when component mounts or value changes significantly
  useEffect(() => {
    console.log('TextEditor value received:', value ? `Length: ${value.length}, Preview: ${value.substring(0, 100)}` : 'empty');
    
    if (editorRef.current && !isInitialized) {
      // Set initial content once
      editorRef.current.innerHTML = value || '';
      setContent(value || '');
      setIsInitialized(true);
    }
  }, [value]); // Run when value changes

  // Update content when value prop changes externally (e.g., when switching notes)
  useEffect(() => {
    if (isInitialized && editorRef.current && value !== undefined) {
      // Only update if the content is significantly different
      const currentHTML = editorRef.current.innerHTML;
      const normalizedCurrent = currentHTML.replace(/<br\s*\/?>/gi, '').replace(/&nbsp;/g, ' ').trim();
      const normalizedValue = (value || '').replace(/<br\s*\/?>/gi, '').replace(/&nbsp;/g, ' ').trim();
      
      if (normalizedValue !== normalizedCurrent) {
        console.log('External update detected, updating editor');
        
        // Save selection/cursor position
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        const hasFocus = document.activeElement === editorRef.current;
        
        // Update content
        editorRef.current.innerHTML = value || '';
        setContent(value || '');
        
        // Try to restore focus and cursor
        if (hasFocus && range) {
          editorRef.current.focus();
          try {
            // Try to restore selection
            selection.removeAllRanges();
            selection.addRange(range);
          } catch (e) {
            // If can't restore, place cursor at end
            const range = document.createRange();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
    }
  }, [value, isInitialized]);

  // Update selected font size when selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      if (!editorRef.current) return;
      
      const selection = window.getSelection();
      if (selection.rangeCount === 0 || !selection.toString()) {
        // No selection or empty selection
        setSelectedFontSize(null);
        return;
      }
      
      const range = selection.getRangeAt(0);
      if (range.collapsed) {
        // Cursor position only - check parent element's font size
        let node = range.startContainer;
        if (node.nodeType === 3) { // Text node
          node = node.parentNode;
        }
        
        // Find the closest element with explicit font size
        while (node && node !== editorRef.current) {
          if (node.style && node.style.fontSize && node.style.fontSize !== '') {
            setSelectedFontSize(node.style.fontSize);
            return;
          }
          node = node.parentNode;
        }
        setSelectedFontSize(null);
      } else {
        // Text is selected - check all text nodes in the range
        const walker = document.createTreeWalker(
          range.commonAncestorContainer,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        
        const fontSizes = new Set();
        let currentNode = walker.currentNode;
        
        // Collect all font sizes from parent elements of text nodes in range
        while (currentNode) {
          if (range.intersectsNode(currentNode)) {
            let parent = currentNode.parentNode;
            while (parent && parent !== editorRef.current) {
              if (parent.style && parent.style.fontSize && parent.style.fontSize !== '') {
                fontSizes.add(parent.style.fontSize);
                break;
              }
              parent = parent.parentNode;
            }
          }
          currentNode = walker.nextNode();
        }
        
        if (fontSizes.size === 1) {
          setSelectedFontSize(Array.from(fontSizes)[0]);
        } else {
          setSelectedFontSize(null); // Mixed selection
        }
      }
    };
    
    // Check selection more frequently for better accuracy
    const interval = setInterval(() => {
      handleSelectionChange();
    }, 100);
    
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  // Handle input changes
  const handleInput = () => {
    if (!editorRef.current || isTyping) return;
    
    setIsTyping(true);
    const newContent = editorRef.current.innerHTML;
    
    // Only update state and call onChange if content actually changed
    if (newContent !== content) {
      setContent(newContent);
      
      if (onChange) {
        onChange(newContent);
      }
    }
    
    setTimeout(() => {
      setIsTyping(false);
    }, 100); // Increased throttle time
  };

  // Simple command execution
  const execCommand = (command, value = null) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    try {
      document.execCommand(command, false, value);
      
      // Manually trigger input after command
      setTimeout(() => {
        handleInput();
      }, 10);
    } catch (err) {
      console.error(`Command ${command} failed:`, err);
    }
  };

  const insertHTML = (html) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    try {
      document.execCommand('insertHTML', false, html);
      handleInput();
    } catch (err) {
      console.error('Insert HTML failed:', err);
      // Fallback
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const fragment = document.createDocumentFragment();
      
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      
      range.insertNode(fragment);
      range.setStartAfter(fragment.lastChild);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      handleInput();
    }
  };

  const insertTable = () => {
    const tableHTML = `
      <div class="table-container" style="margin: 10px 0;">
        <table style="border-collapse: collapse; width: 100%; border: 1px solid ${darkMode ? '#4b5563' : '#d1d5db'};">
          <tbody>
            <tr>
              <td style="border: 1px solid ${darkMode ? '#4b5563' : '#d1d5db'}; padding: 8px; min-width: 100px; min-height: 30px;" contenteditable="true">&nbsp;</td>
              <td style="border: 1px solid ${darkMode ? '#4b5563' : '#d1d5db'}; padding: 8px; min-width: 100px; min-height: 30px;" contenteditable="true">&nbsp;</td>
            </tr>
            <tr>
              <td style="border: 1px solid ${darkMode ? '#4b5563' : '#d1d5db'}; padding: 8px; min-width: 100px; min-height: 30px;" contenteditable="true">&nbsp;</td>
              <td style="border: 1px solid ${darkMode ? '#4b5563' : '#d1d5db'}; padding: 8px; min-width: 100px; min-height: 30px;" contenteditable="true">&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    
    insertHTML(tableHTML);
  };

  const addTableRow = () => {
    const selection = window.getSelection();
    const node = selection.anchorNode;
    let table = node;
    while (table && table.nodeName !== 'TABLE') {
      table = table.parentNode;
    }
    
    if (!table) {
      alert('Please click inside a table cell first');
      return;
    }
    
    const tbody = table.querySelector('tbody') || table;
    const rows = tbody.querySelectorAll('tr');
    if (rows.length === 0) return;
    
    // Get the first row to determine number of columns
    const firstRow = rows[0];
    const colCount = firstRow.children.length;
    
    // Create new row with empty cells
    const newRow = document.createElement('tr');
    
    for (let i = 0; i < colCount; i++) {
      const newCell = document.createElement('td');
      newCell.style.border = `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`;
      newCell.style.padding = '8px';
      newCell.style.minWidth = '100px';
      newCell.style.minHeight = '30px';
      newCell.setAttribute('contenteditable', 'true');
      newCell.innerHTML = '&nbsp;';
      newRow.appendChild(newCell);
    }
    
    // Insert after the current row if possible, otherwise at the end
    let currentRow = node;
    while (currentRow && currentRow.nodeName !== 'TR') {
      currentRow = currentRow.parentNode;
    }
    
    if (currentRow && currentRow.parentNode === tbody) {
      // Insert after current row
      tbody.insertBefore(newRow, currentRow.nextSibling);
    } else {
      // Append to end
      tbody.appendChild(newRow);
    }
    
    handleInput();
  };

  const addTableColumn = () => {
    const selection = window.getSelection();
    const node = selection.anchorNode;
    let table = node;
    while (table && table.nodeName !== 'TABLE') {
      table = table.parentNode;
    }
    
    if (!table) {
      alert('Please click inside a table cell first');
      return;
    }
    
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
      const lastCell = row.lastElementChild;
      if (!lastCell) return;
      
      const newCell = lastCell.cloneNode(true);
      newCell.innerHTML = '&nbsp;';
      row.appendChild(newCell);
    });
    handleInput();
  };

  const deleteTableRow = () => {
    const selection = window.getSelection();
    const node = selection.anchorNode;
    let cell = node;
    while (cell && !(cell.nodeName === 'TD' || cell.nodeName === 'TH')) {
      cell = cell.parentNode;
    }
    
    if (!cell) {
      alert('Please click inside a table cell first');
      return;
    }
    
    const row = cell.parentNode;
    const table = row.closest('table');
    
    if (table.querySelectorAll('tr').length <= 1) {
      alert('Cannot delete the last row');
      return;
    }
    
    row.remove();
    handleInput();
  };

  const deleteTableColumn = () => {
    const selection = window.getSelection();
    const node = selection.anchorNode;
    let cell = node;
    while (cell && !(cell.nodeName === 'TD' || cell.nodeName === 'TH')) {
      cell = cell.parentNode;
    }
    
    if (!cell) {
      alert('Please click inside a table cell first');
      return;
    }
    
    const row = cell.parentNode;
    const cellIndex = Array.from(row.children).indexOf(cell);
    const table = row.closest('table');
    
    if (row.children.length <= 1) {
      alert('Cannot delete the last column');
      return;
    }
    
    table.querySelectorAll('tr').forEach(row => {
      if (row.children[cellIndex]) {
        row.children[cellIndex].remove();
      }
    });
    handleInput();
  };

  const insertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload only .jpg, .jpeg, .png, .gif, or .webp files');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imgHTML = `<img src="${e.target.result}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px;" alt="Uploaded image" />`;
        insertHTML(imgHTML);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const changeTextColor = () => {
    const color = prompt('Enter hex color (e.g., #ff0000 for red):', '#000000');
    if (color) {
      execCommand('foreColor', color);
    }
  };

  const changeBackgroundColor = () => {
    const color = prompt('Enter hex color for background (e.g., #ffff00 for yellow):', '#ffffff');
    if (color) {
      execCommand('backColor', color);
    }
  };

  const changeFontSize = (size) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    const selection = window.getSelection();
    
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    // Check if we're inside a table cell
    let isInTableCell = false;
    let node = range.startContainer;
    while (node && node !== editorRef.current) {
      if (node.nodeName === 'TD' || node.nodeName === 'TH') {
        isInTableCell = true;
        break;
      }
      node = node.parentNode;
    }
    
    if (!range.collapsed && selection.toString().length > 0) {
      // There's a text selection
      const selectedText = range.toString();
      
      // Create a document fragment to hold our formatted text
      const fragment = document.createDocumentFragment();
      
      // Create a span with the new font size
      const span = document.createElement('span');
      span.style.fontSize = size;
      span.style.display = 'inline';
      span.style.lineHeight = '1.6'; // Match editor line-height
      span.style.verticalAlign = 'baseline'; // Prevent vertical shifting
      
      // If in table cell, ensure text stays within
      if (isInTableCell) {
        span.style.wordBreak = 'break-word';
        span.style.overflowWrap = 'break-word';
        span.style.maxWidth = '100%';
      }
      
      span.textContent = selectedText;
      
      fragment.appendChild(span);
      
      // Delete the selected content
      range.deleteContents();
      
      // Insert the formatted text
      range.insertNode(fragment);
      
      // Collapse range to end of inserted content
      range.setStartAfter(span);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      handleInput();
    } else {
      // No text selected - apply to cursor position for new text
      setFontSize(size);
      
      // Insert a zero-width space with the font size
      const span = document.createElement('span');
      span.style.fontSize = size;
      span.style.display = 'inline';
      span.style.lineHeight = '1.6';
      span.style.verticalAlign = 'baseline';
      
      // If in table cell, ensure text stays within
      if (isInTableCell) {
        span.style.wordBreak = 'break-word';
        span.style.overflowWrap = 'break-word';
        span.style.maxWidth = '100%';
      }
      
      span.innerHTML = '&#8203;';
      
      try {
        document.execCommand('insertHTML', false, span.outerHTML);
        // Move cursor after the span
        const newRange = document.createRange();
        const insertedSpan = editorRef.current.querySelector('span[style*="font-size"]:last-child');
        if (insertedSpan) {
          newRange.setStartAfter(insertedSpan);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } catch (err) {
        console.error('Failed to insert font size:', err);
      }
      
      handleInput();
    }
  };

  const handleKeyDown = (e) => {
    // Let browser handle most keys naturally
    if (e.key === 'Tab') {
      // Your existing Tab handling for tables
      const selection = window.getSelection();
      const node = selection.anchorNode;
      
      let cell = node;
      while (cell && !(cell.nodeName === 'TD' || cell.nodeName === 'TH')) {
        cell = cell.parentNode;
      }
      
      if (cell) {
        e.preventDefault();
        const row = cell.parentNode;
        const cellIndex = Array.from(row.children).indexOf(cell);
        const table = row.closest('table');
        const rows = Array.from(table.querySelectorAll('tr'));
        const rowIndex = rows.indexOf(row);
        
        if (e.shiftKey) {
          if (cellIndex > 0) {
            row.children[cellIndex - 1].focus();
          } else if (rowIndex > 0) {
            const prevRow = rows[rowIndex - 1];
            prevRow.lastChild.focus();
          }
        } else {
          if (cellIndex < row.children.length - 1) {
            row.children[cellIndex + 1].focus();
          } else if (rowIndex < rows.length - 1) {
            const nextRow = rows[rowIndex + 1];
            nextRow.firstChild.focus();
          }
        }
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    
    if (editorRef.current) {
      document.execCommand('insertText', false, text);
      // Trigger input after paste
      setTimeout(() => {
        handleInput();
      }, 10);
    }
  };

  return (
    <div className="text-editor-wrapper">
      {/* Single-line toolbar with horizontal scroll */}
      <div 
        ref={toolbarRef}
        className={`toolbar ${darkMode ? 'dark-toolbar' : 'light-toolbar'}`}
      >
        <div className="toolbar-content">
          {/* Formatting Group */}
          <div className="toolbar-group">
            <button 
              type="button" 
              onClick={() => execCommand('bold')} 
              title="Bold (Ctrl+B)"
              className="toolbar-btn"
            >
              <strong>B</strong>
            </button>
            <button 
              type="button" 
              onClick={() => execCommand('italic')} 
              title="Italic (Ctrl+I)"
              className="toolbar-btn"
            >
              <em>I</em>
            </button>
            <button 
              type="button" 
              onClick={() => execCommand('underline')} 
              title="Underline (Ctrl+U)"
              className="toolbar-btn"
            >
              <u>U</u>
            </button>
          </div>
          
          {/* Font Size Group */}
          <div className="toolbar-group">
            <select 
              value={selectedFontSize || fontSize}
              onChange={(e) => changeFontSize(e.target.value)}
              title="Font Size"
              className="font-size-select"
              style={{
                padding: '4px 8px',
                border: `1px solid ${darkMode ? '#4b5563' : '#cbd5e1'}`,
                borderRadius: '4px',
                background: darkMode ? '#334155' : 'white',
                color: darkMode ? '#e2e8f0' : '#475569',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="" disabled={!selectedFontSize}>
                {selectedFontSize ? selectedFontSize.replace('px', '') : 'Size'}
              </option>
              <option value="12px">12</option>
              <option value="15px">15</option>
              <option value="18px">18</option>
              <option value="24px">24</option>
              <option value="32px">32</option>
            </select>
          </div>
          
          {/* Color Group */}
          <div className="toolbar-group">
            <button 
              type="button" 
              onClick={changeTextColor}
              title="Text Color"
              className="toolbar-btn"
            >
              <span style={{ color: '#ff0000' }}>A</span>
            </button>
            <button 
              type="button" 
              onClick={changeBackgroundColor}
              title="Background Color"
              className="toolbar-btn"
            >
              <span style={{ backgroundColor: '#ffff00', color: '#000', padding: '0 2px' }}>BG</span>
            </button>
          </div>

          {/* Insert Group */}
          <div className="toolbar-group">
            <button 
              type="button" 
              onClick={insertTable}
              title="Insert Table"
              className="toolbar-btn"
            >
              Table
            </button>
            <button 
              type="button" 
              onClick={insertImage}
              title="Insert Image"
              className="toolbar-btn"
            >
              Image
            </button>
          </div>
          
          {/* Table Controls Group */}
          <div className="toolbar-group">
            <button 
              type="button" 
              onClick={addTableRow}
              title="Add Row"
              className="toolbar-btn"
            >
              +Row
            </button>
            <button 
              type="button" 
              onClick={addTableColumn}
              title="Add Column"
              className="toolbar-btn"
            >
              +Col
            </button>
            <button 
              type="button" 
              onClick={deleteTableRow}
              title="Delete Row"
              className="toolbar-btn"
              style={{ color: '#ef4444' }}
            >
              -Row
            </button>
            <button 
              type="button" 
              onClick={deleteTableColumn}
              title="Delete Column"
              className="toolbar-btn"
              style={{ color: '#ef4444' }}
            >
              -Col
            </button>
          </div>
        </div>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className={`editor ${darkMode ? 'dark-editor' : 'light-editor'}`}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder="Start typing your note here..."
        style={{ 
          minHeight: '200px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}
        suppressContentEditableWarning
      />
      
      <style jsx>{`
        .text-editor-wrapper {
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid ${darkMode ? '#4b5563' : '#d1d5db'};
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .toolbar {
          flex-shrink: 0;
          border-bottom: 1px solid ${darkMode ? '#4b5563' : '#d1d5db'};
          overflow-x: auto;
          overflow-y: hidden;
          white-space: nowrap;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: ${darkMode ? '#4b5563 #1e293b' : '#cbd5e1 #f1f5f9'};
          padding: 10px 0;
        }
        
        .toolbar-content {
          display: flex;
          gap: 8px;
          padding: 0 10px;
          min-width: min-content;
        }
        
        .light-toolbar {
          background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
        }
        
        .dark-toolbar {
          background: linear-gradient(to bottom, #1e293b, #0f172a);
        }
        
        .toolbar-group {
          display: flex;
          gap: 4px;
          padding-right: 12px;
          border-right: 1px solid ${darkMode ? '#4b5563' : '#cbd5e1'};
          align-items: center;
          flex-shrink: 0;
        }
        
        .toolbar-group:last-child {
          border-right: none;
          padding-right: 0;
        }
        
        .toolbar-btn {
          padding: 6px 10px;
          border: 1px solid ${darkMode ? '#4b5563' : '#cbd5e1'};
          border-radius: 4px;
          background: ${darkMode ? '#334155' : 'white'};
          color: ${darkMode ? '#e2e8f0' : '#475569'};
          cursor: pointer;
          font-size: 14px;
          min-width: 36px;
          transition: all 0.2s;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          flex-shrink: 0;
        }
        
        .toolbar-btn:hover:not(:disabled) {
          background: ${darkMode ? '#475569' : '#f1f5f9'};
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .toolbar-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .editor {
          flex: 1;
          min-height: 200px;
          max-height: 250px;
          overflow-y: auto;
          padding: 16px;
          outline: none;
          line-height: 1.6;
          font-size: 15px;
          scrollbar-width: thin;
          scrollbar-color: ${darkMode ? '#4b5563 #0f172a' : '#cbd5e1 white'};
        }
        
        .light-editor {
          background: white;
          color: #1e293b;
        }
        
        .dark-editor {
          background: #0f172a;
          color: #e2e8f0;
        }
        
        .editor:empty:before {
          content: attr(placeholder);
          color: ${darkMode ? '#64748b' : '#94a3b8'};
          font-style: italic;
        }
        
        .editor img {
          max-width: 100%;
          height: auto;
          margin: 10px 0;
          border-radius: 6px;
          border: 1px solid ${darkMode ? '#4b5563' : '#e2e8f0'};
        }
        
        .editor table {
          border-collapse: collapse;
          width: 100%;
          margin: 12px 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .editor th, .editor td {
          border: 1px solid ${darkMode ? '#4b5563' : '#cbd5e1'};
          padding: 10px;
          vertical-align: top;
        }
        
        .editor th {
          background: ${darkMode ? '#334155' : '#f8fafc'};
          font-weight: 600;
        }
        
        .editor b, .editor strong {
          font-weight: 700;
        }
        
        .editor i, .editor em {
          font-style: italic;
        }
        
        .editor u {
          text-decoration: underline;
        }
        
        /* Fix for table editing */
        .editor td[contenteditable="true"]:focus,
        .editor th[contenteditable="true"]:focus {
          outline: 2px solid ${darkMode ? '#3b82f6' : '#2563eb'} !important;
          outline-offset: -1px !important;
        }
        
        /* Prevent content from expanding beyond editor */
        .editor * {
          max-width: 100% !important;
          word-wrap: break-word !important;
        }
        
        /* Custom scrollbar for toolbar */
        .toolbar::-webkit-scrollbar {
          height: 8px;
        }
        
        .toolbar::-webkit-scrollbar-track {
          background: ${darkMode ? '#1e293b' : '#f1f5f9'};
          border-radius: 4px;
        }
        
        .toolbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#4b5563' : '#cbd5e1'};
          border-radius: 4px;
        }
        
        .toolbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#64748b' : '#94a3b8'};
        }
        
        /* Custom scrollbar for editor (matches toolbar width) */
        .editor::-webkit-scrollbar {
          width: 8px;
        }
        
        .editor::-webkit-scrollbar-track {
          background: ${darkMode ? '#0f172a' : 'white'};
          border-radius: 4px;
        }
        
        .editor::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#4b5563' : '#cbd5e1'};
          border-radius: 4px;
        }
        
        .editor::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#64748b' : '#94a3b8'};
        }
        
        /* Font size select styling */
        .font-size-select {
          padding: 4px 8px;
          border: 1px solid ${darkMode ? '#4b5563' : '#cbd5e1'};
          border-radius: 4px;
          background: ${darkMode ? '#334155' : 'white'};
          color: ${darkMode ? '#e2e8f0' : '#475569'};
          font-size: 14px;
          cursor: pointer;
          outline: none;
          min-width: 60px;
          flex-shrink: 0;
        }
        
        .font-size-select:focus {
          border-color: ${darkMode ? '#3b82f6' : '#2563eb'};
          box-shadow: 0 0 0 2px ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(37, 99, 235, 0.2)'};
        }
        
        /* Fix for formatted text spans */
        .editor span[style*="font-size"] {
          display: inline;
          line-height: inherit;
          vertical-align: baseline;
        }
        
        .editor font[size] {
          font-size: inherit !important;
        }
        
        .editor font[size] span {
          font-size: inherit !important;
        }
      `}</style>
    </div>
  );
};

export default TextEditor;