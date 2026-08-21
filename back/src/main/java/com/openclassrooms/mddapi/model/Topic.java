package com.openclassrooms.mddapi.model;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "topics")
@AttributeOverride(name = "id", column = @Column(name = "topic_id"))
@Data
public class Topic extends BaseEntity {

	@Column(nullable = false, unique = true)
	private String title;

	@Column(nullable = false)
	private String description;

}
