package com.redmatrix.notesapp.controller;

import java.util.List;
import java.util.Optional;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
import org.springframework.web.multipart.MultipartFile;

import com.redmatrix.notesapp.entity.Note;
import com.redmatrix.notesapp.service.NoteService;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:5173")
public class NoteController {

    private static final Logger logger = LoggerFactory.getLogger(NoteController.class);

    @Autowired
    private NoteService noteService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

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
        } catch (IllegalArgumentException e) {
            logger.error("Invalid note data: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            logger.error("Error creating note: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // PUT /api/notes/{id} - Update note
    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable Long id, @RequestBody Note noteDetails) {
        try {
            logger.info("Updating note with ID: {}", id);
            Note updatedNote = noteService.updateNote(id, noteDetails);
            logger.info("Successfully updated note with ID: {}", id);
            return ResponseEntity.ok(updatedNote);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid note data for update: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (RuntimeException e) {
            logger.error("Note not found for update with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating note with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // DELETE /api/notes/{id} - Delete note
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        try {
            logger.info("Deleting note with ID: {}", id);
            noteService.deleteNote(id);
            logger.info("Successfully deleted note with ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("Note not found for deletion with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error deleting note with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET /api/notes/search?q={keyword} - Search notes
    @GetMapping("/search")
    public ResponseEntity<List<Note>> searchNotes(@RequestParam("q") String keyword) {
        try {
            logger.info("Searching notes with keyword: {}", keyword);
            List<Note> notes = noteService.searchNotes(keyword);
            logger.info("Found {} notes matching keyword: {}", notes.size(), keyword);
            return ResponseEntity.ok(notes);
        } catch (Exception e) {
            logger.error("Error searching notes with keyword '{}': {}", keyword, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // POST /api/notes/upload - Upload image for notes
    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("image") MultipartFile file) {
        try {
            logger.info("Uploading image file: {}", file.getOriginalFilename());

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !isValidImageType(contentType)) {
                logger.error("Invalid file type: {}", contentType);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.");
            }

            // Validate file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                logger.error("File too large: {} bytes", file.getSize());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("File size must be less than 5MB");
            }

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                logger.info("Created upload directory: {}", uploadPath.toAbsolutePath());
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(uniqueFilename);

            // Save the file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            logger.info("Image saved to: {}", filePath.toAbsolutePath());

            // Return the URL for the uploaded file
            String fileUrl = "/uploads/" + uniqueFilename;
            return ResponseEntity.ok(new UploadResponse(fileUrl, uniqueFilename, file.getSize()));

        } catch (Exception e) {
            logger.error("Error uploading image: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading image: " + e.getMessage());
        }
    }

    // Helper method to validate image types
    private boolean isValidImageType(String contentType) {
        return Arrays.asList(
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/gif",
                "image/webp",
                "image/svg+xml").contains(contentType.toLowerCase());
    }

    // Response class for upload endpoint
    private static class UploadResponse {
        private String url;
        private String filename;
        private long size;

        public UploadResponse(String url, String filename, long size) {
            this.url = url;
            this.filename = filename;
            this.size = size;
        }

        public String getUrl() {
            return url;
        }

        public String getFilename() {
            return filename;
        }

        public long getSize() {
            return size;
        }
    }
}