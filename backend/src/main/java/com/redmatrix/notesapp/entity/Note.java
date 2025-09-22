package com.redmatrix.notesapp.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data // Lombok generates getters, setters, toString, etc.
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String content;
}
