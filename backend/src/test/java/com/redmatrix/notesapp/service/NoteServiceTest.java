package com.redmatrix.notesapp.service;

import com.redmatrix.notesapp.entity.Note;
import com.redmatrix.notesapp.repository.NoteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class NoteServiceTest {

    @Mock
    private NoteRepository noteRepository;

    @InjectMocks
    private NoteService noteService;

    @Test
    void createNote_validNote_savesAndReturns() {
        Note input = new Note();
        input.setTitle("Title");
        input.setContent("Content");

        Note saved = new Note();
        saved.setId(1L);
        saved.setTitle("Title");
        saved.setContent("Content");

        when(noteRepository.save(any(Note.class))).thenReturn(saved);

        Note result = noteService.createNote(input);

        ArgumentCaptor<Note> captor = ArgumentCaptor.forClass(Note.class);
        verify(noteRepository).save(captor.capture());
        Note passed = captor.getValue();

        assertEquals("Title", passed.getTitle());
        assertEquals("Content", passed.getContent());

        assertEquals(1L, result.getId());
        assertEquals("Title", result.getTitle());
        assertEquals("Content", result.getContent());
    }

    @Test
    void createNote_nullNote_throwsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> noteService.createNote(null));
        verifyNoInteractions(noteRepository);
    }

    @Test
    void createNote_emptyTitle_throwsIllegalArgumentException() {
        Note input = new Note();
        input.setTitle("   ");
        input.setContent("content");

        assertThrows(IllegalArgumentException.class, () -> noteService.createNote(input));
        verifyNoInteractions(noteRepository);
    }

    @Test
    void createNote_emptyContent_throwsIllegalArgumentException() {
        Note input = new Note();
        input.setTitle("title");
        input.setContent("   ");

        assertThrows(IllegalArgumentException.class, () -> noteService.createNote(input));
        verifyNoInteractions(noteRepository);
    }

    @Test
    void updateNote_existing_updatesFieldsAndBlockchainFields() {
        Long id = 1L;

        Note existing = new Note();
        existing.setId(id);
        existing.setTitle("Old");
        existing.setContent("Old content");
        existing.setContentHash("oldHash");
        existing.setLastTxHash("oldTx");
        existing.setOwnerWallet("oldWallet");

        Note details = new Note();
        details.setTitle("New");
        details.setContent("New content");
        details.setContentHash("newHash");
        details.setLastTxHash("newTx");
        details.setOwnerWallet("newWallet");

        when(noteRepository.findById(id)).thenReturn(Optional.of(existing));
        when(noteRepository.save(any(Note.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Note result = noteService.updateNote(id, details);

        verify(noteRepository).findById(id);
        verify(noteRepository).save(existing);

        assertEquals("New", result.getTitle());
        assertEquals("New content", result.getContent());
        assertEquals("newHash", result.getContentHash());
        assertEquals("newTx", result.getLastTxHash());
        assertEquals("newWallet", result.getOwnerWallet());
    }

    @Test
    void updateNote_missing_throwsRuntimeException() {
        Long id = 1L;
        Note details = new Note();
        details.setTitle("New");
        details.setContent("New content");

        when(noteRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> noteService.updateNote(id, details));
        verify(noteRepository).findById(id);
        verify(noteRepository, never()).save(any());
    }

    @Test
    void deleteNote_existing_deletes() {
        Long id = 1L;

        when(noteRepository.existsById(id)).thenReturn(true);

        noteService.deleteNote(id);

        verify(noteRepository).existsById(id);
        verify(noteRepository).deleteById(id);
    }

    @Test
    void deleteNote_missing_throwsRuntimeException() {
        Long id = 1L;

        when(noteRepository.existsById(id)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> noteService.deleteNote(id));
        verify(noteRepository).existsById(id);
        verify(noteRepository, never()).deleteById(any());
    }

    @Test
    void searchNotes_emptyKeyword_returnsAllNotes() {
        List<Note> all = Collections.singletonList(new Note());
        when(noteRepository.findAllByOrderByUpdatedAtDesc()).thenReturn(all);

        List<Note> result = noteService.searchNotes("   ");

        assertEquals(1, result.size());
        verify(noteRepository).findAllByOrderByUpdatedAtDesc();
        verify(noteRepository, never()).searchNotes(anyString());
    }

    @Test
    void searchNotes_withKeyword_usesRepositorySearch() {
        List<Note> found = Collections.singletonList(new Note());
        when(noteRepository.searchNotes("test")).thenReturn(found);

        List<Note> result = noteService.searchNotes("test");

        assertEquals(1, result.size());
        verify(noteRepository).searchNotes("test");
        verify(noteRepository, never()).findAllByOrderByUpdatedAtDesc();
    }
}
