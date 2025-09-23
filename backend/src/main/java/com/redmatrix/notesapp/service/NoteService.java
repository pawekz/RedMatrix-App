package com.redmatrix.notesapp.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.redmatrix.notesapp.entity.Note;
import com.redmatrix.notesapp.repository.NoteRepository;

@Service    
public class NoteService {

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
        note.setCreatedAt(LocalDate.now());
        note.setUpdatedAt(LocalDate.now());
        return noteRepository.save(note);
    }
    
    // Update existing note
    public Note updateNote(Long id, Note noteDetails) {
        Optional<Note> optionalNote = noteRepository.findById(id);
        
        if (optionalNote.isPresent()) {
            Note note = optionalNote.get();
            note.setTitle(noteDetails.getTitle());
            note.setContent(noteDetails.getContent());
            note.setUpdatedAt(LocalDate.now());
            return noteRepository.save(note);
        }
        
        throw new RuntimeException("Note not found with id: " + id);
    }
    
    // Delete note
    public void deleteNote(Long id) {
        if (noteRepository.existsById(id)) {
            noteRepository.deleteById(id);
        } else {
            throw new RuntimeException("Note not found with id: " + id);
        }
    }
    
    // Search notes
    public List<Note> searchNotes(String keyword) {
        return noteRepository.searchNotes(keyword);
    }
}