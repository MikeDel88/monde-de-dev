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
     * Aucun cascade : le post doit déjà exister en base avant de persister
     * ce commentaire (vérifié explicitement dans PostServiceImpl), pour
     * éviter qu'un post transitoire ne soit inséré accidentellement.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false, updatable = false)
    private Post post;

    /**
     * Auteur du commentaire.
     * Aucun cascade : l'utilisateur doit déjà exister en base avant de
     * persister ce commentaire (vérifié explicitement dans
     * PostServiceImpl), pour éviter qu'un utilisateur transitoire ne soit
     * inséré accidentellement.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, updatable = false)
    private User user;

}
