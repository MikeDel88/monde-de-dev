package com.openclassrooms.mddapi.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Set;

@Entity
@Table(name = "topics")
@AttributeOverride(name = "id", column = @Column(name = "topic_id"))
@Data
public class Topic extends BaseEntity {

	@Column(nullable = false, unique = true, updatable = false)
	private String title;

	@Column(nullable = false, updatable = false)
	private String description;

	@OneToMany(fetch =  FetchType.LAZY, cascade = CascadeType.ALL)
	private Set<Post> posts;
}
