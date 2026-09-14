package com.openclassrooms.mddapi.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Force la génération du token CSRF sur chaque requête (y compris anonyme)
 * pour que le cookie {@code XSRF-TOKEN}, lisible en JavaScript, soit toujours
 * émis avant même le premier appel authentifié : {@link org.springframework.security.web.csrf.CsrfFilter}
 * n'écrit le cookie que si le {@link CsrfToken} est effectivement consulté
 * (chargement différé de {@code CookieCsrfTokenRepository}).
 */
public class CsrfCookieFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            csrfToken.getToken();
        }
        filterChain.doFilter(request, response);
    }
}
