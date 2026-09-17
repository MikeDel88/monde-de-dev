package com.openclassrooms.mddapi.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.Hibernate;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Classe de base fournissant l'identifiant technique et les dates d'audit
 * communes à toutes les entités du domaine.
 */
@MappedSuperclass
@NoArgsConstructor
@Getter
public abstract class BaseEntity {

    /** Identifiant technique auto-généré. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(AccessLevel.PROTECTED)
    protected Long id;

    /**
     * Date de création, renseignée automatiquement et non modifiable.
     * Générée côté serveur applicatif (horloge JVM via {@link CreationTimestamp}),
     * pas par le SGBD : si serveur et base de données sont sur des fuseaux
     * horaires différents, c'est celui du serveur qui prévaut. Le
     * {@code DEFAULT now()} SQL de la colonne n'est qu'un filet de sécurité,
     * jamais déclenché en usage normal puisque Hibernate fournit toujours
     * la valeur explicitement.
     */
    @Column(name = "created_at", updatable = false, nullable = false)
    @CreationTimestamp
    protected LocalDateTime createdAt;

    /**
     * Date de dernière modification, renseignée automatiquement.
     * Même origine que {@link #createdAt} : horloge du serveur applicatif
     * (via {@link UpdateTimestamp}), pas celle du SGBD. Ici, contrairement à
     * {@code created_at}, le {@code DEFAULT now()} SQL de la colonne n'est
     * pas un filet de sécurité : un {@code DEFAULT} ne se déclenche qu'à
     * l'INSERT, jamais sur UPDATE. L'ORM est donc la seule source de vérité
     * pour cette colonne ; toute écriture SQL directe hors Hibernate (script,
     * autre service, migration) laisse {@code updated_at} périmé sans erreur.
     */
    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    protected LocalDateTime updatedAt;

    /**
     * Égalité basée sur l'identifiant technique, sûre vis-à-vis des proxies
     * Hibernate (comparaison de classe via {@link Hibernate#getClass}) et des
     * entités transitoires (id {@code null}, jamais égales entre elles).
     */
    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        if (Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        BaseEntity other = (BaseEntity) o;
        return id != null && Objects.equals(id, other.getId());
    }

    /**
     * Constante par classe réelle, indépendante de l'id : reste stable pour
     * une entité déjà insérée dans un {@code Set} avant sa persistance
     * (id passant de {@code null} à une valeur générée).
     */
    @Override
    public final int hashCode() {
        return Hibernate.getClass(this).hashCode();
    }
}
