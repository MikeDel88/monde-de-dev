package com.openclassrooms.mddapi.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Entité représentant un post publié dans un topic.
 */
@Entity
@Table(name = "posts")
@AttributeOverride(name = "id", column = @Column(name = "post_id"))
@Getter
@Setter
public class Post extends BaseEntity {

    /** Titre du post, non modifiable. */
    @Column(nullable = false, updatable = false)
    private String title;

    /** Contenu du post, non modifiable. */
    @Column(nullable = false, updatable = false)
    private String content;

    /** Date de publication du post, non modifiable. */
    @Column(nullable = false, updatable = false)
    private LocalDateTime date;

	/**
	 * Topic auquel appartient le post.
	 * Cascade limité à la persistance (CascadeType.PERSIST) : supprimer ce post
	 * n'entraîne jamais la suppression du topic.
	 */
	@ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
	@JoinColumn(name = "topic_id", nullable = false, updatable = false)
	private Topic topic;

    /**
     * Auteur du post.
     * Cascade limité à la persistance (CascadeType.PERSIST) : supprimer ce post
     * n'entraîne jamais la suppression de l'utilisateur.
     */
    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "user_id", nullable = false, updatable = false)
    private User user;

    /**
     * Ensemble des commentaires associés au post.
     * Suppression en cascade (CascadeType.ALL) : supprimer ce post supprime
     * tous ses commentaires.
     */
    @OneToMany(mappedBy = "post", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Set<Comment> comments;
}
