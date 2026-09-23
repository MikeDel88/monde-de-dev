package com.openclassrooms.mddapi.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.openclassrooms.mddapi.config.properties.RateLimitConfigProperties;
import com.openclassrooms.mddapi.exception.RateLimitExceededException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Limite en mémoire (token-bucket via bucket4j, stocké dans des caches
 * Caffeine à expiration) le nombre de tentatives de connexion et
 * d'inscription, par adresse IP et par compte visé, afin de réduire les
 * risques de brute force et de spam. Cette limitation n'est pas partagée
 * entre plusieurs instances de l'application (pas de backend distribué type
 * Redis) : sur un déploiement multi-instances, chaque instance applique sa
 * propre limite.
 */
@Log4j2
@Service
public class RateLimiterService {

    private final Cache<String, Bucket> loginIpBuckets;
    private final Cache<String, Bucket> loginAccountBuckets;
    private final Cache<String, Bucket> registerIpBuckets;
    private final Cache<String, Bucket> registerAccountBuckets;
    private final RateLimitConfigProperties properties;

    public RateLimiterService(RateLimitConfigProperties properties) {
        this.properties = properties;
        this.loginIpBuckets = newCache();
        this.loginAccountBuckets = newCache();
        this.registerIpBuckets = newCache();
        this.registerAccountBuckets = newCache();
    }

    /**
     * Vérifie que la tentative de connexion respecte à la fois la limite par
     * IP et la limite par compte visé (email ou nom, normalisé).
     * @param ip l'adresse IP source de la requête.
     * @param account l'identifiant de compte visé (emailOrName), non normalisé.
     * @throws RateLimitExceededException si l'une des deux limites est dépassée.
     */
    public void checkLogin(String ip, String account) {
        consume(loginIpBuckets, ip, properties.login().ip());
        consume(loginAccountBuckets, normalize(account), properties.login().account());
    }

    /**
     * Vérifie que la tentative d'inscription respecte à la fois la limite par
     * IP et la limite par email visé (normalisé).
     * @param ip l'adresse IP source de la requête.
     * @param email l'email visé par l'inscription, non normalisé.
     * @throws RateLimitExceededException si l'une des deux limites est dépassée.
     */
    public void checkRegister(String ip, String email) {
        consume(registerIpBuckets, ip, properties.register().ip());
        consume(registerAccountBuckets, normalize(email), properties.register().account());
    }

    private void consume(Cache<String, Bucket> cache, String key, RateLimitConfigProperties.Limit limit) {
        Bucket bucket = cache.get(key, k -> newBucket(limit));
        if (!bucket.tryConsume(1)) {
            log.info("rate limit exceeded for key={}", key);
            throw new RateLimitExceededException();
        }
    }

    private Bucket newBucket(RateLimitConfigProperties.Limit limit) {
        Bandwidth bandwidth = Bandwidth.classic(
                limit.capacity(),
                Refill.greedy(limit.capacity(), Duration.ofMinutes(limit.durationMinutes()))
        );
        return Bucket.builder().addLimit(bandwidth).build();
    }

    private Cache<String, Bucket> newCache() {
        return Caffeine.newBuilder()
                .expireAfterAccess(Duration.ofHours(1))
                .maximumSize(100_000)
                .build();
    }

    private String normalize(String value) {
        return value.trim().toLowerCase();
    }
}
