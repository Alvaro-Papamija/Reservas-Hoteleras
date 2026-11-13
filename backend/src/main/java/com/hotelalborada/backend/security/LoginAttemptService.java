package com.hotelalborada.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Servicio de mitigación de ataques de fuerza bruta y credential stuffing (OWASP ASVS v4.0).
 * Bloquea temporalmente el acceso tras un número máximo de intentos fallidos.
 */
@Service
public class LoginAttemptService {

    private final int maxAttempts;
    private final long lockoutDurationMs;

    private static class AttemptData {
        int attempts;
        long lastAttemptTimestamp;
        long blockedUntilTimestamp;

        AttemptData(long now) {
            this.attempts = 1;
            this.lastAttemptTimestamp = now;
            this.blockedUntilTimestamp = 0;
        }
    }

    private final Map<String, AttemptData> attemptsCache = new ConcurrentHashMap<>();

    public LoginAttemptService(
            @Value("${app.security.rate-limit.max-attempts:5}") int maxAttempts,
            @Value("${app.security.rate-limit.lockout-duration-minutes:15}") int lockoutMinutes) {
        this.maxAttempts = maxAttempts;
        this.lockoutDurationMs = (long) lockoutMinutes * 60 * 1000;
    }

    /**
     * Registra un intento de login fallido. Si se alcanza el umbral, se activa el bloqueo.
     */
    public void loginFailed(String identifier) {
        long now = System.currentTimeMillis();
        attemptsCache.compute(identifier.toLowerCase().trim(), (key, data) -> {
            if (data == null) {
                return new AttemptData(now);
            }
            // Si el bloqueo previo ya expiró, reiniciar contador
            if (data.blockedUntilTimestamp > 0 && now > data.blockedUntilTimestamp) {
                data.attempts = 1;
                data.blockedUntilTimestamp = 0;
                data.lastAttemptTimestamp = now;
                return data;
            }

            data.attempts++;
            data.lastAttemptTimestamp = now;
            if (data.attempts >= maxAttempts) {
                data.blockedUntilTimestamp = now + lockoutDurationMs;
            }
            return data;
        });
    }

    /**
     * Limpia los intentos fallidos al completarse una autenticación exitosa.
     */
    public void loginSucceeded(String identifier) {
        attemptsCache.remove(identifier.toLowerCase().trim());
    }

    /**
     * Comprueba si el identificador (correo o IP) se encuentra actualmente bloqueado.
     */
    public boolean isBlocked(String identifier) {
        AttemptData data = attemptsCache.get(identifier.toLowerCase().trim());
        if (data == null) {
            return false;
        }

        long now = System.currentTimeMillis();
        if (data.blockedUntilTimestamp > 0) {
            if (now < data.blockedUntilTimestamp) {
                return true;
            } else {
                // El bloqueo expiró, limpiar
                attemptsCache.remove(identifier.toLowerCase().trim());
                return false;
            }
        }
        return false;
    }

    /**
     * Devuelve los segundos restantes de bloqueo.
     */
    public long getRemainingLockoutSeconds(String identifier) {
        AttemptData data = attemptsCache.get(identifier.toLowerCase().trim());
        if (data == null || data.blockedUntilTimestamp == 0) {
            return 0;
        }
        long diff = data.blockedUntilTimestamp - System.currentTimeMillis();
        return diff > 0 ? (diff / 1000) : 0;
    }

    /**
     * Devuelve el número de intentos fallidos registrados.
     */
    public int getFailedAttempts(String identifier) {
        AttemptData data = attemptsCache.get(identifier.toLowerCase().trim());
        return data != null ? data.attempts : 0;
    }

    /**
     * Resetea el cache (útil para pruebas).
     */
    public void reset() {
        attemptsCache.clear();
    }
}
