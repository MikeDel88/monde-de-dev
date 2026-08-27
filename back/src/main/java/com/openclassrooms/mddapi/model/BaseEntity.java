package com.openclassrooms.mddapi.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/**
 * Classe de base fournissant l'identifiant technique et les dates d'audit
 * communes à toutes les entités du domaine.
 */
@MappedSuperclass
@NoArgsConstructor
@Getter
@Setter
public abstract class BaseEntity {

    /** Identifiant technique auto-généré. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(AccessLevel.PROTECTED)
    protected Long id;

    /** Date de création, renseignée automatiquement et non modifiable. */
    @Column(name = "created_at", updatable = false, nullable = false)
    @CreationTimestamp
    protected LocalDateTime createdAt;

    /** Date de dernière modification, renseignée automatiquement. */
    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    protected LocalDateTime updatedAt;
}
