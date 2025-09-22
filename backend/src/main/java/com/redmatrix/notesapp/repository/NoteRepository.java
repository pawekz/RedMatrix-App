package com.redmatrix.notesapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.redmatrix.notesapp.entity.Note;

public interface NoteRepository extends JpaRepository<Note, Long> {
    // Find notes by title containing keyword (case insensitive)
    List<Note> findByTitleContainingIgnoreCase(String title);
    
    // Find notes by content containing keyword (case insensitive)
    List<Note> findByContentContainingIgnoreCase(String content);
    
    // Custom query to search in both title and content
    @Query("SELECT n FROM Note n WHERE " +
           "LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Note> searchNotes(@Param("keyword") String keyword);
    
    // Find notes ordered by updated date (most recent first)
    List<Note> findAllByOrderByUpdatedAtDesc();
}
