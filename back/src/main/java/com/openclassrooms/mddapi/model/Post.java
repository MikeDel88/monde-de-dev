package com.openclassrooms.mddapi.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Entité représentant un post publié dans un topic.
 */
@Entity
@Table(name = "posts")
@AttributeOverride(name = "id", column = @Column(name = "post_id"))
@Getter
@NoArgsConstructor
public class Post extends BaseEntity {

    /** Titre du post, non modifiable. */
    @Column(nullable = false, updatable = false)
    private String title;

    /** Contenu du post, non modifiable. */
    @Column(nullable = false, updatable = false)
    private String content;

	/**
	 * Topic auquel appartient le post.
	 */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "topic_id", nullable = false, updatable = false)
	private Topic topic;

    /**
     * Auteur du post.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, updatable = false)
    private User user;

    /**
     * Liste des commentaires associés au post.
     * Suppression en cascade (CascadeType.ALL) : supprimer ce post supprime
     * tous ses commentaires.
     */
    @OrderBy("createdAt DESC")
    @OneToMany(mappedBy = "post", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Comment> comments = new ArrayList<>();

    /**
     * Crée un nouveau post. Tous les champs sont figés à la création
     * (colonnes {@code updatable = false}).
     * @param title titre du post.
     * @param content contenu du post.
     * @param topic topic auquel le post est rattaché.
     * @param user auteur du post.
     */
    public Post(String title, String content, Topic topic, User user) {
        this.title = title;
        this.content = content;
        this.topic = topic;
        this.user = user;
    }

    /** Ajoute un commentaire déjà rattaché à ce post à la liste des commentaires. */
    public void addComment(Comment comment) {
        this.comments.add(comment);
    }
}
