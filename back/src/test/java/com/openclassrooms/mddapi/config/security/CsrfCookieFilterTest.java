package com.openclassrooms.mddapi.config.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.DefaultCsrfToken;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class CsrfCookieFilterTest {

    private final CsrfCookieFilter filter = new CsrfCookieFilter();

    @Test
    void doFilterInternal_withCsrfTokenAttribute_forcesTokenGeneration() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        CsrfToken csrfToken = spy(new DefaultCsrfToken("X-CSRF-TOKEN", "_csrf", "token-value"));
        request.setAttribute(CsrfToken.class.getName(), csrfToken);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        verify(csrfToken, times(1)).getToken();
        assertChainInvoked(chain);
    }

    @Test
    void doFilterInternal_withoutCsrfTokenAttribute_doesNotFail() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertChainInvoked(chain);
    }

    private void assertChainInvoked(MockFilterChain chain) {
        assertThat(chain.getRequest()).isNotNull();
    }
}
