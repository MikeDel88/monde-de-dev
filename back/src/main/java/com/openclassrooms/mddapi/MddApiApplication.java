package com.openclassrooms.mddapi;

import com.openclassrooms.mddapi.config.properties.AppConfigProperties;
import com.openclassrooms.mddapi.config.properties.RateLimitConfigProperties;
import com.openclassrooms.mddapi.config.properties.RsaConfigProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@EnableConfigurationProperties({RsaConfigProperties.class, AppConfigProperties.class, RateLimitConfigProperties.class})
@SpringBootApplication
public class MddApiApplication {

	static void main(String[] args) {
		SpringApplication.run(MddApiApplication.class, args);
	}

}
