package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.config.properties.AppConfigProperties;
import com.openclassrooms.mddapi.config.security.JwtClaimsConstants;
import com.openclassrooms.mddapi.model.Role;
import com.openclassrooms.mddapi.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;

import java.lang.reflect.Field;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtServiceImplTest {

    @Mock
    private JwtEncoder jwtEncoder;

    @Test
    void generateAccessToken_encodesExpectedClaims() throws Exception {
        AppConfigProperties appConfigProperties = new AppConfigProperties("http://localhost:4200", 3, true);
        JwtServiceImpl jwtService = new JwtServiceImpl(jwtEncoder, appConfigProperties);

        User user = new User("john", "john@mail.com", "hashed");
        Field idField = user.getClass().getSuperclass().getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(user, 7L);

        Jwt jwt = Jwt.withTokenValue("signed-token")
                .header("alg", "RS256")
                .claim("sub", "7")
                .build();
        when(jwtEncoder.encode(org.mockito.ArgumentMatchers.any())).thenReturn(jwt);

        String token = jwtService.generateAccessToken(user);

        assertThat(token).isEqualTo("signed-token");

        ArgumentCaptor<JwtEncoderParameters> captor = ArgumentCaptor.forClass(JwtEncoderParameters.class);
        org.mockito.Mockito.verify(jwtEncoder).encode(captor.capture());
        JwtEncoderParameters params = captor.getValue();

        assertThat(params.getClaims().getSubject()).isEqualTo("7");
        assertThat(params.getClaims().getClaimAsString("iss")).contains(JwtClaimsConstants.ISSUER);
        assertThat(params.getClaims().getAudience()).containsExactly(JwtClaimsConstants.AUDIENCE);
        assertThat(params.getClaims().<String>getClaim(JwtClaimsConstants.ROLE_CLAIM)).isEqualTo(Role.USER.name());
        assertThat(params.getClaims().getExpiresAt()).isAfter(Instant.now());
    }
}
