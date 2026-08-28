package com.openclassrooms.mddapi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.openclassrooms.mddapi.model.Post;

/**
 * Repository Spring Data JPA pour l'entité {@link Post}, fournit les
 * opérations CRUD standard.
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long>{

}
