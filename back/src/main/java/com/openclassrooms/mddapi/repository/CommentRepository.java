package com.openclassrooms.mddapi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.openclassrooms.mddapi.model.Comment;

/**
 * Repository Spring Data JPA pour l'entité {@link Comment}, fournit les
 * opérations CRUD standard.
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

}
