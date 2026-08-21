package com.openclassrooms.mddapi.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@AttributeOverride(name = "id", column = @Column(name = "user_id", updatable = false, nullable = false))
@Data
public class User extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

}
