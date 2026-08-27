package com.openclassrooms.mddapi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.openclassrooms.mddapi.model.Topic;

/**
 * Repository Spring Data JPA pour l'entité {@link Topic}, fournit les
 * opérations CRUD standard.
 */
@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {

}
