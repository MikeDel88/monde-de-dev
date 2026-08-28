package com.openclassrooms.mddapi.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

/**
 * Entité représentant un utilisateur de l'application.
 */
@Entity
@Table(name = "users")
@AttributeOverride(name = "id", column = @Column(name = "user_id"))
@Getter
@Setter
public class User extends BaseEntity {

    /** Nom d'utilisateur, unique. */
    @Column(nullable = false, unique = true)
    private String name;

    /** Adresse email, unique. */
    @Column(nullable = false, unique = true)
    private String email;

    /** Mot de passe haché. */
    @Column(nullable = false)
    private String password;

    /**
     * Ensemble des topics auxquels l'utilisateur est abonné (table subscriptions).
     * Aucun cascade JPA configuré : supprimer cet utilisateur ne supprime
     * jamais les topics. En revanche les lignes de la table subscriptions sont
     * supprimées automatiquement en base via ON DELETE CASCADE sur la
     * contrainte fk_subscription_user (voir V8__subscriptions_on_delete_cascade.sql).
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "subscriptions",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "topic_id"))
    private Set<Topic> topics;
}
