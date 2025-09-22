package com.redmatrix.notesapp.controller;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.redmatrix.notesapp.entity.Note;
import com.redmatrix.notesapp.service.NoteService;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:3000")
public class NoteController {
    
    private static final Logger logger = LoggerFactory.getLogger(NoteController.class);
    
    @Autowired
    private NoteService noteService;
    
    // GET /api/notes - Get all notes
    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes() {
        List<Note> notes = noteService.getAllNotes();
        return ResponseEntity.ok(notes);
    }
    
    // GET /api/notes/{id} - Get note by ID
    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(@PathVariable Long id) {
        Optional<Note> note = noteService.getNoteById(id);
        
        if (note.isPresent()) {
            return ResponseEntity.ok(note.get());
        }
        
        return ResponseEntity.notFound().build();
    }
    
    // POST /api/notes - Create new note
    @PostMapping
    public ResponseEntity<Note> createNote(@RequestBody Note note) {
        try {
            logger.info("Creating new note with title: {}", note.getTitle());
            Note createdNote = noteService.createNote(note);
            logger.info("Successfully created note with ID: {}", createdNote.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdNote);
        } catch (Exception e) {
            logger.error("Error creating note: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // PUT /api/notes/{id} - Update note
    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable Long id, @RequestBody Note noteDetails) {
        try {
            Note updatedNote = noteService.updateNote(id, noteDetails);
            return ResponseEntity.ok(updatedNote);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // DELETE /api/notes/{id} - Delete note
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        try {
            noteService.deleteNote(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // GET /api/notes/search?q={keyword} - Search notes
    @GetMapping("/search")
    public ResponseEntity<List<Note>> searchNotes(@RequestParam("q") String keyword) {
        List<Note> notes = noteService.searchNotes(keyword);
        return ResponseEntity.ok(notes);
    }
}