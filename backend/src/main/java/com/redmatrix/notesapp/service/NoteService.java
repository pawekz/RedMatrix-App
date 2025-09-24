package com.redmatrix.notesapp.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.redmatrix.notesapp.entity.Note;
import com.redmatrix.notesapp.repository.NoteRepository;

@Service    
public class NoteService {
    private static final Logger logger = LoggerFactory.getLogger(NoteService.class);
  
    @Autowired
    private NoteRepository noteRepository;
    
    // Get all notes
    public List<Note> getAllNotes() {
        return noteRepository.findAllByOrderByUpdatedAtDesc();
    }
    
    // Get note by ID
    public Optional<Note> getNoteById(Long id) {
        return noteRepository.findById(id);
    }
    
    // Create new note
    public Note createNote(Note note) {
        validateNote(note);
        logger.info("Creating note with title: {}", note.getTitle());
        
        LocalDateTime now = LocalDateTime.now();
        note.setCreatedAt(now);
        note.setUpdatedAt(now);
        
        Note savedNote = noteRepository.save(note);
        logger.info("Created note with ID: {}", savedNote.getId());
        return savedNote;
    }
    
    // Update existing note
    public Note updateNote(Long id, Note noteDetails) {
        validateNote(noteDetails);
        logger.info("Updating note with ID: {}", id);
        
        Optional<Note> optionalNote = noteRepository.findById(id);
        
        if (optionalNote.isPresent()) {
            Note note = optionalNote.get();
            note.setTitle(noteDetails.getTitle());
            note.setContent(noteDetails.getContent());
            note.setUpdatedAt(LocalDateTime.now());
            
            Note savedNote = noteRepository.save(note);
            logger.info("Successfully updated note with ID: {}", id);
            return savedNote;
        }
        
        logger.error("Note not found with ID: {}", id);
        throw new RuntimeException("Note not found with id: " + id);
    }
    
    // Delete note
    public void deleteNote(Long id) {
        logger.info("Deleting note with ID: {}", id);
        
        if (noteRepository.existsById(id)) {
            noteRepository.deleteById(id);
            logger.info("Successfully deleted note with ID: {}", id);
        } else {
            logger.error("Note not found for deletion with ID: {}", id);
            throw new RuntimeException("Note not found with id: " + id);
        }
    }
    
    // Search notes
    public List<Note> searchNotes(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            logger.warn("Search attempted with empty keyword");
            return getAllNotes();
        }
        
        logger.info("Searching notes with keyword: {}", keyword);
        return noteRepository.searchNotes(keyword);
    }
    
    // Private helper method for validation
    private void validateNote(Note note) {
        if (note == null) {
            throw new IllegalArgumentException("Note cannot be null");
        }
        if (!StringUtils.hasText(note.getTitle())) {
            throw new IllegalArgumentException("Note title cannot be empty");
        }
        if (!StringUtils.hasText(note.getContent())) {
            throw new IllegalArgumentException("Note content cannot be empty");
        }
    }
}
