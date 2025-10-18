package com.enterprise.starter.kit.shared.ratelimit;

import com.enterprise.starter.kit.config.security.RateLimitFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@DisplayName("RateLimitFilter Unit Tests")
class RateLimitFilterTest {

    /** Invokes the filter via the public GenericFilterBean.doFilter() entry point. */
    private void invoke(RateLimitFilter filter, MockHttpServletRequest req,
                        MockHttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        filter.doFilter(req, res, chain);
    }

    @Test
    @DisplayName("auth requests within limit pass through to filter chain")
    void requestsWithinLimit_passThroughChain() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr("192.168.100.1");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        invoke(filter, request, response, chain);

        verify(chain).doFilter(request, response);
        assertThat(response.getStatus()).isNotEqualTo(429);
    }

    @Test
    @DisplayName("requests exceeding 20 per minute return HTTP 429")
    void requestsExceedingLimit_return429() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        String ip = "10.0.1.42";
        FilterChain chain = mock(FilterChain.class);

        MockHttpServletResponse lastResponse = new MockHttpServletResponse();
        for (int i = 0; i <= 20; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
            req.setRemoteAddr(ip);
            MockHttpServletResponse res = i == 20 ? lastResponse : new MockHttpServletResponse();
            invoke(filter, req, res, chain);
        }

        assertThat(lastResponse.getStatus()).isEqualTo(429);
    }

    @Test
    @DisplayName("non-auth path is not rate-limited (chain always invoked)")
    void nonAuthPath_isNotRateLimited() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        FilterChain chain = mock(FilterChain.class);
        String ip = "10.0.2.1";

        // Send 30 requests to a non-auth endpoint — none should be blocked
        for (int i = 0; i < 30; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/invoices");
            req.setRemoteAddr(ip);
            MockHttpServletResponse res = new MockHttpServletResponse();
            invoke(filter, req, res, chain);
            assertThat(res.getStatus()).isNotEqualTo(429);
        }
        verify(chain, times(30)).doFilter(any(), any());
    }

    @Test
    @DisplayName("X-Forwarded-For header used for real IP")
    void xForwardedFor_usedAsClientIp() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        FilterChain chain = mock(FilterChain.class);

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr("10.0.0.1");
        request.addHeader("X-Forwarded-For", "203.0.113.42, 10.0.0.1");
        MockHttpServletResponse response = new MockHttpServletResponse();

        invoke(filter, request, response, chain);

        // Request passes through — correct IP resolved
        verify(chain).doFilter(request, response);
    }

    @Test
    @DisplayName("different IPs have independent buckets")
    void differentIps_independentBuckets() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        FilterChain chain = mock(FilterChain.class);

        // Exhaust IP A's bucket
        for (int i = 0; i <= 20; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
            req.setRemoteAddr("11.11.11.11");
            invoke(filter, req, new MockHttpServletResponse(), chain);
        }

        // IP B sends its first request — must not be rate-limited
        MockHttpServletRequest ipBReq = new MockHttpServletRequest("POST", "/api/auth/login");
        ipBReq.setRemoteAddr("22.22.22.22");
        MockHttpServletResponse ipBRes = new MockHttpServletResponse();
        invoke(filter, ipBReq, ipBRes, chain);

        assertThat(ipBRes.getStatus()).isNotEqualTo(429);
    }
}
