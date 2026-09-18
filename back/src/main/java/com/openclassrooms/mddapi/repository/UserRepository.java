package com.openclassrooms.mddapi.repository;

import com.openclassrooms.mddapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

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

    /**
     * Récupère en une seule requête les ids des topics auxquels l'utilisateur
     * est abonné, sans charger l'entité {@link User} ni sa collection
     * {@code topics} (évite un aller-retour en base par topic lors du calcul
     * de l'état d'abonnement, voir {@code TopicMapper}).
     * @param userId l'id de l'utilisateur.
     * @return Set Long; les ids des topics auxquels l'utilisateur est abonné.
     */
    @Query("select t.id from User u join u.topics t where u.id = :userId")
    Set<Long> findSubscribedTopicIds(@Param("userId") Long userId);
}
