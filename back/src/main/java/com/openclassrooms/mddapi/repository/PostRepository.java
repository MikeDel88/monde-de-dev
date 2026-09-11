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

    Optional<Post> findByIdAndTopicIn(Long id, Collection<Topic> topics);
}
