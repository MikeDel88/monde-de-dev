package com.openclassrooms.mddapi.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entité représentant un commentaire laissé sur un post.
 */
@Entity
@Table(name = "comments")
@AttributeOverride(name = "id", column = @Column(name = "comment_id"))
@Getter
@Setter
public class Comment extends BaseEntity {

    /** Contenu du commentaire, non modifiable. */
    @Column(nullable = false, updatable = false)
    private String content;

    /** Date du commentaire, non modifiable. */
    @Column(nullable = false, updatable = false)
    private LocalDateTime date;

    /**
     * Post commenté.
     * Cascade limité à la persistance (CascadeType.PERSIST) : supprimer ce
     * commentaire n'entraîne jamais la suppression du post.
     */
    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "post_id", nullable = false, updatable = false)
    private Post post;

    /**
     * Auteur du commentaire.
     * Cascade limité à la persistance (CascadeType.PERSIST) : supprimer ce
     * commentaire n'entraîne jamais la suppression de l'utilisateur.
     */
    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "user_id", nullable = false, updatable = false)
    private User user;

}
