package com.openclassrooms.mddapi.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.openclassrooms.mddapi.model.Post;
import com.openclassrooms.mddapi.model.Topic;

import java.util.Collection;
import java.util.Optional;

/**
 * Repository Spring Data JPA pour l'entité {@link Post}, fournit les
 * opérations CRUD standard.
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    /**
     * Recherche paginée des posts appartenant à l'un des topics fournis.
     * Utilisé pour construire le fil d'actualité d'un utilisateur à partir
     * des topics auxquels il est abonné.
     * @param topics les topics dont on veut récupérer les posts.
     * @param pageable la pagination et le tri à appliquer.
     * @return Page&lt;Post&gt; la page de posts correspondante.
     */
    Page<Post> findByTopicIn(Collection<Topic> topics, Pageable pageable);

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
     * Identique à {@link #findByIdAndTopicIn(Long, Collection)}, avec les
     * commentaires du post chargés triés par {@code comment_id} décroissant
     * (donc du plus récent au plus ancien, les ids étant attribués dans
     * l'ordre de création), pour que le dernier commentaire posté apparaisse
     * en bas de la liste côté client.
     * @param id l'identifiant du post recherché.
     * @param topics les topics auxquels l'utilisateur est abonné.
     * @return Optional&lt;Post&gt; le post s'il existe et appartient à l'un des topics fournis.
     */
    Optional<Post> findByIdAndTopicInOrderByCommentsDesc(Long id, Collection<Topic> topics);
}
