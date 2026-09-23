package com.openclassrooms.mddapi.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.openclassrooms.mddapi.model.Post;
import com.openclassrooms.mddapi.model.Topic;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Repository Spring Data JPA pour l'entité {@link Post}, fournit les
 * opérations CRUD standard.
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    /**
     * Recherche un post par id, en le restreignant à l'un des topics fournis.
     * Utilisé pour vérifier que l'utilisateur est bien abonné au topic du post
     * avant de l'exposer (un post introuvable et un post hors abonnement
     * produisent le même résultat vide, volontairement, pour ne pas fuiter
     * l'existence d'un post à un utilisateur non abonné).
     * @param id l'identifiant du post recherché.
     * @param topics les topics auxquels l'utilisateur est abonné.
     * @return Optional&lt;Post&gt; le post s'il existe et appartient à l'un des topics fournis.
     */
    Optional<Post> findByIdAndTopicIn(Long id, Collection<Topic> topics);

    /**
     * Récupère la page suivante de posts (du plus récent au plus ancien) parmi
     * les topics fournis, en keyset pagination sur l'id.
     * @param topics les topics dont on veut récupérer les posts.
     * @param cursor l'id du dernier post reçu par le client, {@code null} pour la première page.
     * @param pageable la taille de page à appliquer.
     * @return List&lt;Post&gt; la page de posts correspondante, triée par id décroissant.
     */
    @Query("SELECT p FROM Post p WHERE p.topic IN :topics AND (:cursor IS NULL OR p.id < :cursor) ORDER BY p.id DESC")
    List<Post> fetchNextPageDesc(@Param("topics") Collection<Topic> topics, @Param("cursor") Long cursor, Pageable pageable);

    /**
     * Récupère la page suivante de posts (du plus ancien au plus récent) parmi
     * les topics fournis, en keyset pagination sur l'id.
     * @param topics les topics dont on veut récupérer les posts.
     * @param cursor l'id du dernier post reçu par le client, {@code null} pour la première page.
     * @param pageable la taille de page à appliquer.
     * @return List&lt;Post&gt; la page de posts correspondante, triée par id croissant.
     */
    @Query("SELECT p FROM Post p WHERE p.topic IN :topics AND (:cursor IS NULL OR p.id > :cursor) ORDER BY p.id ASC")
    List<Post> fetchNextPageAsc(@Param("topics") Collection<Topic> topics, @Param("cursor") Long cursor, Pageable pageable);
}
