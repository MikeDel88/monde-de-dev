package com.openclassrooms.mddapi.config.security;

import com.openclassrooms.mddapi.config.properties.RsaConfigProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtValidationException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class KeyConfigTest {

    private static final String PRIVATE_KEY = "MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCjgyU8kDDxC6fGldxM2et6UKRTd41J6KOsj1Yju/dIN9rDu/vWcV0NU8D2FrqtDrOeRjw3z3+ibbBGQK2eQldec4ekx4eoooAUo5fycPMB9fRFfL8G8yPVoqZIA73Mua4LcG2kAa9Cd8ZmAAxpPIJoUzDmBcumNIZv5j50l3MJ+GuXf7Bf9FTTjIdJC8oGubP9NmpDKN01oVhS/QdkSTucbGHysOQ+YQnoRkv55teX1FfIYv4BZvHI+hU2iCozOzU1k7AlMeclayVCXN6q0F2zBYpacK/e7Hwn4nzInHf8+cXSGrP0K/2kOO3U9RDHcJcoopXEqZbyO1p6vsoNCGvlAgMBAAECggEACBVrudrHEKOq37547bO4WIu0FAxNB+JgdR+A+rNIPmHEhvi8MpXYK9iAKapmADhB2QlP4NJ5VOZnWJHKA5D0EM9VXWgf5M5j1qFf2bSLzwUB1o2cRBOxKdaosda9g2mKmTYttXX/3CFfxZsrAejj6ZRzTmvq7YSbQNz5KXpzTYLOT8QP0hzCAdKovlnbHM9hxUz/FTR/MJ37E8Iw+aWKJjBROm5LDvc9QBtx7DSCsc28gRkm8jaNfyyp3gBaXwhQ4Lko+2MgeAfjNchXo6MZAVLaBor/u+eajJAA3va2CQH9Ttu+SjaHwVS6fF6G7ppa3mzpWL2F8gxaBvfzAxDrAQKBgQDVINMfjxeVudU8fW0qAX7KUXdGNHc2wBPjPbE0ytgLVPICloaDhdIp6DM4rKMD5LgrVajdlBx7juhvi5osxg4LZ69GjA4YfQrA/cAERpSNsuxEWGKTQMex9CTIQiqyfEPN/0rujCAYdXwtIC1V8qfYtQqtKwJ2/kjUuZl9HXD3/QKBgQDEZ1Dxq9a7a4UnUWtPN5nW+FP4RMWHtuHd38iaq+PuPxDbqpVmoFtXhMKjcq69E8mAm/+nbh7es+Svkho1GYbtrDrgEs9u9hi1XFoN6MIVLpG9XU/8d6NU70XPJ6miIKE962FhEG+cgI5O13cxQqrrRNXfTePo/oLzejHJOJrECQKBgF1ZeD+NbDYfZB+PjF3ms8Mn9YchecnYTZ2tqs1Fv2UPOsUZayd2WLwUQUMkkm4lIumQJluPAP65dGNPESNlSEeEjYfn1lCxjCFFw3Hb/DsoUEYLNHns2Mq/9dBk8tCkjwpONGLRq0krRE17l3/avdu0SE3a1cSK0hmihXEAkTd9AoGANNrtEKzDFBsicWta6q227ABWcLjpQ9W2wUQpM17Q71vviH5GyKCdFFd5Hg2N8vpxPvg8e+2Jxzs4bvttrB6bjjjMe2L0ihMWoTAiWB3spVCsDf8fuHzl6sSdz9sHrscDPaurwDhxIPgD1DnuLMaZQsl6mSbYD+r2iNm4rkNaeykCgYB4HKQLdcXOKRvofG4PNaTvYxse8ec5ujaN4cyzkNbZstIBXemKHrmigOU8Eho1JvxP9hJgRwWXZvqltlkwrDcPpjkB+njYOnagG8zQrVC0GEAtCpDC9nR7pDBhghI+fohrEo/F8qwCG09IHgcC4qCyx4lfqiECOqPg34Nca+HDXg==";
    private static final String PUBLIC_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAo4MlPJAw8QunxpXcTNnrelCkU3eNSeijrI9WI7v3SDfaw7v71nFdDVPA9ha6rQ6znkY8N89/om2wRkCtnkJXXnOHpMeHqKKAFKOX8nDzAfX0RXy/BvMj1aKmSAO9zLmuC3BtpAGvQnfGZgAMaTyCaFMw5gXLpjSGb+Y+dJdzCfhrl3+wX/RU04yHSQvKBrmz/TZqQyjdNaFYUv0HZEk7nGxh8rDkPmEJ6EZL+ebXl9RXyGL+AWbxyPoVNogqMzs1NZOwJTHnJWslQlzeqtBdswWKWnCv3ux8J+J8yJx3/PnF0hqz9Cv9pDjt1PUQx3CXKKKVxKmW8jtaer7KDQhr5QIDAQAB";

    private KeyConfig keyConfig;
    private RSAPublicKey publicKey;
    private RSAPrivateKey privateKey;

    @BeforeEach
    void setUp() throws Exception {
        keyConfig = new KeyConfig(new RsaConfigProperties(PRIVATE_KEY, PUBLIC_KEY));
        publicKey = keyConfig.publicKey();
        privateKey = keyConfig.privateKey();
    }

    @Test
    void keys_areLoadedFromBase64() {
        assertThat(publicKey).isNotNull();
        assertThat(privateKey).isNotNull();
        assertThat(publicKey.getAlgorithm()).isEqualTo("RSA");
        assertThat(privateKey.getAlgorithm()).isEqualTo("RSA");
    }

    @Test
    void jwtEncoderAndDecoder_roundTripValidToken() {
        JwtEncoder encoder = keyConfig.jwtEncoder(publicKey, privateKey);
        JwtDecoder decoder = keyConfig.jwtDecoder(publicKey);

        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject("1")
                .issuer(JwtClaimsConstants.ISSUER)
                .audience(List.of(JwtClaimsConstants.AUDIENCE))
                .issuedAt(now)
                .expiresAt(now.plus(1, ChronoUnit.DAYS))
                .claim(JwtClaimsConstants.ROLE_CLAIM, "USER")
                .build();
        String token = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(SignatureAlgorithm.RS256).build(), claims))
                .getTokenValue();

        Jwt decoded = decoder.decode(token);

        assertThat(decoded.getSubject()).isEqualTo("1");
        assertThat(decoded.getClaimAsString(JwtClaimsConstants.ROLE_CLAIM)).isEqualTo("USER");
    }

    @Test
    void jwtDecoder_rejectsTokenWithWrongAudience() {
        JwtEncoder encoder = keyConfig.jwtEncoder(publicKey, privateKey);
        JwtDecoder decoder = keyConfig.jwtDecoder(publicKey);

        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject("1")
                .issuer(JwtClaimsConstants.ISSUER)
                .audience(List.of("other-audience"))
                .issuedAt(now)
                .expiresAt(now.plus(1, ChronoUnit.DAYS))
                .build();
        String token = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(SignatureAlgorithm.RS256).build(), claims))
                .getTokenValue();

        assertThatThrownBy(() -> decoder.decode(token)).isInstanceOf(JwtValidationException.class);
    }

    @Test
    void jwtAuthenticationConverter_prefixesRoleWithRolePrefix() {
        JwtAuthenticationConverter converter = keyConfig.jwtAuthenticationConverter();

        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "RS256")
                .claim("sub", "1")
                .claim(JwtClaimsConstants.ROLE_CLAIM, "USER")
                .build();

        assertThat(converter.convert(jwt).getAuthorities())
                .extracting(Object::toString)
                .contains("ROLE_USER");
    }
}
