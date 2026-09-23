package com.openclassrooms.mddapi.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

/**
 * Entité représentant un utilisateur de l'application.
 */
@Entity
@Table(name = "users")
@AttributeOverride(name = "id", column = @Column(name = "user_id"))
@Getter
@NoArgsConstructor
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

    /** Rôle applicatif de l'utilisateur, propagé dans les claims du JWT. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

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
    private Set<Topic> topics = new HashSet<>();

    /**
     * Crée un nouvel utilisateur.
     * @param name nom d'utilisateur.
     * @param email adresse email.
     * @param password mot de passe déjà haché par l'appelant.
     */
    public User(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = Role.USER;
    }

    /** Change le nom d'utilisateur. */
    public void changeName(String newName) {
        this.name = newName;
    }

    /** Change l'adresse email. */
    public void changeEmail(String newEmail) {
        this.email = newEmail;
    }

    /** @param encodedPassword le mot de passe déjà haché par l'appelant. */
    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    /**
     * Abonne l'utilisateur au topic, en synchronisant les deux faces de la
     * relation many-to-many (subscriptions).
     */
    public void subscribeTo(Topic topic) {
        this.topics.add(topic);
        topic.getUsers().add(this);
    }

    /**
     * Désabonne l'utilisateur du topic, en synchronisant les deux faces de
     * la relation many-to-many (subscriptions).
     */
    public void unsubscribeFrom(Topic topic) {
        this.topics.remove(topic);
        topic.getUsers().remove(this);
    }
}
