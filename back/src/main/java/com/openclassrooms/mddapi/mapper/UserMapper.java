package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.request.RegisterRequest;
import com.openclassrooms.mddapi.model.User;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Mapper MapStruct qui construit l'entité {@link User} à partir de la requête
 * d'inscription.
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    /**
     * Convertit la requête d'inscription en entité User, en hachant le mot de
     * passe via l'encodeur fourni en contexte. Les champs createdAt/updatedAt
     * sont ignorés (gérés ailleurs, ex. auditing JPA).
     * @param registerRequest la requête d'inscription contenant les données saisies.
     * @param passwordEncoder l'encodeur utilisé pour hacher le mot de passe en clair.
     * @return User l'entité utilisateur mappée.
     */
    @Mapping(target = "password", expression = "java(passwordEncoder.encode(registerRequest.password()))")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toUser(RegisterRequest registerRequest, @Context PasswordEncoder passwordEncoder);

}
