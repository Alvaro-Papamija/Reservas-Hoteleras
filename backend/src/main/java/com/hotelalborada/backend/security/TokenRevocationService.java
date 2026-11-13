package com.hotelalborada.backend.security;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Servicio de revocación de tokens para invalidar sesiones al hacer logout en el servidor.
 * Mantiene los tokens invalidados en memoria hasta que expire su vigencia natural.
 */
@Service
public class TokenRevocationService {

    // Token -> Fecha de expiración en epoch milisegundos
    private final Map<String, Long> revokedTokens = new ConcurrentHashMap<>();

    /**
     * Revoca un token hasta su fecha de expiración esperada.
     */
    public void revokeToken(String token, long expirationTimestampMs) {
        if (token != null && !token.isBlank()) {
            revokedTokens.put(token, expirationTimestampMs);
        }
    }

    /**
     * Comprueba si un token ha sido revocado.
     */
    public boolean isRevoked(String token) {
        if (token == null) {
            return false;
        }
        Long exp = revokedTokens.get(token);
        if (exp == null) {
            return false;
        }
        // Si ya expiró su vigencia natural, lo podemos limpiar
        if (System.currentTimeMillis() > exp) {
            revokedTokens.remove(token);
            return false;
        }
        return true;
    }

    /**
     * Limpieza periódica de tokens cuya expiración ya pasó.
     */
    public void cleanupExpiredTokens() {
        long now = System.currentTimeMillis();
        revokedTokens.entrySet().removeIf(entry -> entry.getValue() < now);
    }
}
