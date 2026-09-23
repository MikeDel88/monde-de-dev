package com.openclassrooms.mddapi.integration;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Vérifie que le contexte Spring complet démarre (datasource/JPA/Flyway
 * réels compris). Suffixe {@code *IT} : nécessite la base réelle du
 * docker-compose, exécuté par Failsafe (voir {@code mvn verify}), pas par
 * {@code mvn test}.
 */
@SpringBootTest
@ActiveProfiles("test")
class MddApiApplicationIT {

	@Test
	void contextLoads() {
	}

}
