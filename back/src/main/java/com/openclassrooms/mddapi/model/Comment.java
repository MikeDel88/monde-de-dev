package com.openclassrooms.mddapi.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Entité représentant un commentaire laissé sur un post.
 */
@Entity
@Table(name = "comments")
@AttributeOverride(name = "id", column = @Column(name = "comment_id"))
@Getter
@NoArgsConstructor
public class Comment extends BaseEntity {

    /** Contenu du commentaire, non modifiable. */
    @Column(nullable = false, updatable = false)
    private String content;

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

    /**
     * Crée un nouveau commentaire, entièrement immuable après création
     * (colonnes {@code updatable = false}).
     * @param content contenu du commentaire.
     * @param post post commenté (doit déjà exister en base).
     * @param user auteur du commentaire (doit déjà exister en base).
     */
    public Comment(String content, Post post, User user) {
        this.content = content;
        this.post = post;
        this.user = user;
    }
}
