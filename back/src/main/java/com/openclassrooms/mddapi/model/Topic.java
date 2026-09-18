package com.openclassrooms.mddapi.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

/**
 * Entité représentant un thème (topic) de discussion.
 */
@Entity
@Table(name = "topics")
@AttributeOverride(name = "id", column = @Column(name = "topic_id"))
@Getter
@NoArgsConstructor
public class Topic extends BaseEntity {

    /** Titre du topic, unique et non modifiable. */
    @Column(nullable = false, unique = true, updatable = false)
    private String title;

    /** Description du topic, non modifiable. */
    @Column(nullable = false, updatable = false)
    private String description;

    /**
     * Ensemble des posts publiés sur ce topic.
     * Suppression en cascade (CascadeType.ALL) : supprimer ce topic supprime
     * tous ses posts, et transitivement leurs commentaires.
     */
    @OneToMany(mappedBy = "topic", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Set<Post> posts = new HashSet<>();

    /**
     * Ensemble des utilisateurs abonnés à ce topic (table subscriptions).
     * Aucun cascade JPA configuré : supprimer ce topic ne supprime jamais les
     * utilisateurs. En revanche les lignes de la table subscriptions sont
     * supprimées automatiquement en base via ON DELETE CASCADE sur la
     * contrainte fk_subscription_topic (voir V8__subscriptions_on_delete_cascade.sql).
     */
    @ManyToMany(fetch = FetchType.LAZY, mappedBy = "topics")
    private Set<User> users = new HashSet<>();

    /**
     * Crée un nouveau topic. Titre et description sont figés à la création
     * (colonnes {@code updatable = false}).
     */
    public Topic(String title, String description) {
        this.title = title;
        this.description = description;
    }
}
