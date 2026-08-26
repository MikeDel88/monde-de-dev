package com.openclassrooms.mddapi.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "topics")
@AttributeOverride(name = "id", column = @Column(name = "topic_id"))
@Getter
@Setter
public class Topic extends BaseEntity {

	@Column(nullable = false, unique = true, updatable = false)
	private String title;

	@Column(nullable = false, updatable = false)
	private String description;

	@OneToMany(mappedBy = "topic", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
	private Set<Post> posts;

	@ManyToMany(fetch = FetchType.LAZY)
	@JoinTable(
			name = "subscriptions",
			joinColumns = @JoinColumn(name = "topic_id"),
			inverseJoinColumns = @JoinColumn(name = "user_id"))
	private Set<User> users;
}
