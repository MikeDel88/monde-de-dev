package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.request.RegisterRequest;
import com.openclassrooms.mddapi.dto.response.ProfileResponse;
import com.openclassrooms.mddapi.dto.response.TopicResponse;
import com.openclassrooms.mddapi.model.User;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Locale;

/**
 * Mapper MapStruct qui construit l'entité {@link User} à partir de la requête
 * d'inscription.
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    /**
     * Convertit la requête d'inscription en entité User, en hachant le mot de
     * passe via l'encodeur fourni en contexte. Implémentation manuelle (pas
     * de génération MapStruct) : {@link User} n'expose pas de setters, la
     * construction passe donc par son constructeur dédié.
     * @param registerRequest la requête d'inscription contenant les données saisies.
     * @param passwordEncoder l'encodeur utilisé pour hacher le mot de passe en clair.
     * @return User l'entité utilisateur mappée.
     */
    default User toUser(RegisterRequest registerRequest, @Context PasswordEncoder passwordEncoder) {
        return new User(
                registerRequest.name().trim(),
                registerRequest.email().trim().toLowerCase(Locale.ROOT),
                passwordEncoder.encode(registerRequest.password())
        );
    }

    /**
     * Construit le DTO de profil à partir de l'entité User et des thèmes déjà mappés.
     * @param user l'entité utilisateur.
     * @param topicsResponses la liste des thèmes déjà mappée (via {@link TopicMapper}).
     * @return ProfilResponse le profil mappé pour envoyer au client.
     */
    @Mapping(target = "topics", source = "topicsResponses")
    ProfileResponse toProfilResponse(User user, List<TopicResponse> topicsResponses);
}
