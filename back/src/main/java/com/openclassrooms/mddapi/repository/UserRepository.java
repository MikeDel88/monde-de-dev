package com.openclassrooms.mddapi.repository;

import com.openclassrooms.mddapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository Spring Data JPA pour l'entité {@link User}, fournit les
 * opérations CRUD standard.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Recherche un utilisateur dont l'email ou le nom correspond à l'une des
     * valeurs fournies. Utilisé pour vérifier l'unicité de l'email et du nom
     * d'utilisateur lors de la connexion.
     * @param email l'adresse email recherchée.
     * @param name le nom d'utilisateur recherché.
     * @return Optional User; l'utilisateur trouvé, vide si aucun ne correspond.
     */
    Optional<User> findUsersByEmailOrName(String email, String name);
}
