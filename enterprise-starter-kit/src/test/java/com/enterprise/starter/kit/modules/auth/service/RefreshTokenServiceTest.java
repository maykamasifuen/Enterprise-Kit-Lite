package com.enterprise.starter.kit.modules.auth.service;

import com.enterprise.starter.kit.modules.auth.entity.RefreshToken;
import com.enterprise.starter.kit.modules.auth.repository.RefreshTokenRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RefreshTokenService Unit Tests")
class RefreshTokenServiceTest {

    @Mock private RefreshTokenRepository repository;
    @InjectMocks private RefreshTokenService service;

    @Test
    @DisplayName("createRefreshToken: deletes old tokens then saves new one")
    void createRefreshToken_deletesOldThenSaves() {
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        service.createRefreshToken("alice");
        verify(repository).deleteByUsername("alice");
        ArgumentCaptor<RefreshToken> cap = ArgumentCaptor.forClass(RefreshToken.class);
        verify(repository).save(cap.capture());
        assertThat(cap.getValue().getUsername()).isEqualTo("alice");
        assertThat(cap.getValue().getExpiresAt()).isAfter(LocalDateTime.now().plusDays(6));
    }

    @Test
    @DisplayName("createRefreshToken: returns unique UUID token string each call")
    void createRefreshToken_returnsUniqueToken() {
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        String t1 = service.createRefreshToken("bob");
        String t2 = service.createRefreshToken("bob");
        assertThat(t1).isNotBlank();
        assertThat(t1).isNotEqualTo(t2);
    }

    @Test
    @DisplayName("validateRefreshToken: valid token → returns entity")
    void validateRefreshToken_valid_returnsEntity() {
        RefreshToken rt = new RefreshToken("tok", "carol", LocalDateTime.now().plusDays(5));
        when(repository.findByToken("tok")).thenReturn(Optional.of(rt));
        assertThat(service.validateRefreshToken("tok").getUsername()).isEqualTo("carol");
    }

    @Test
    @DisplayName("validateRefreshToken: unknown token → throws")
    void validateRefreshToken_unknown_throws() {
        when(repository.findByToken("bad")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.validateRefreshToken("bad"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid");
    }

    @Test
    @DisplayName("validateRefreshToken: expired token → deletes and throws")
    void validateRefreshToken_expired_deletesAndThrows() {
        RefreshToken exp = new RefreshToken("exp", "dave", LocalDateTime.now().minusDays(1));
        when(repository.findByToken("exp")).thenReturn(Optional.of(exp));
        assertThatThrownBy(() -> service.validateRefreshToken("exp"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("expired");
        verify(repository).delete(exp);
    }

    @Test
    @DisplayName("revokeByUsername: delegates to repository deleteByUsername")
    void revokeByUsername_delegates() {
        service.revokeByUsername("eve");
        verify(repository).deleteByUsername("eve");
    }

    @Test
    @DisplayName("purgeExpiredTokens: calls deleteExpiredTokens with a timestamp")
    void purgeExpiredTokens_callsRepository() {
        service.purgeExpiredTokens();
        verify(repository).deleteExpiredTokens(any(LocalDateTime.class));
    }
}

