package com.hotelalborada.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Servicio criptográfico para emisión, firma y validación de tokens JWT (HS256).
 * Implementado sin dependencias externas frágiles, usando javax.crypto y Jackson.
 * Protege contra ataques de sincronización (timing attacks) mediante MessageDigest.isEqual.
 */
@Service
public class JwtService {

    private final byte[] secretKeyBytes;
    private final long expirationMs;
    private final ObjectMapper objectMapper;
    private final TokenRevocationService tokenRevocationService;

    public JwtService(
            @Value("${app.jwt.secret:HotelAlboradaSuperSecureSecretKey2026WithSufficientEntropyAndLengthForHMACSHA256}") String secretKey,
            @Value("${app.jwt.expiration-ms:3600000}") long expirationMs,
            TokenRevocationService tokenRevocationService) {
        this.secretKeyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        this.expirationMs = expirationMs;
        this.objectMapper = new ObjectMapper();
        this.tokenRevocationService = tokenRevocationService;
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    /**
     * Genera un token JWT compacto firmado con HMAC-SHA256.
     */
    public String generateToken(Long idUsuario, String correo, String rol) {
        try {
            long now = System.currentTimeMillis();
            long exp = now + expirationMs;

            // 1. Header
            Map<String, Object> header = new HashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");
            String headerJson = objectMapper.writeValueAsString(header);
            String headerBase64 = base64UrlEncode(headerJson.getBytes(StandardCharsets.UTF_8));

            // 2. Payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("sub", correo);
            payload.put("id", idUsuario);
            payload.put("rol", rol);
            payload.put("iat", now / 1000);
            payload.put("exp", exp / 1000);
            String payloadJson = objectMapper.writeValueAsString(payload);
            String payloadBase64 = base64UrlEncode(payloadJson.getBytes(StandardCharsets.UTF_8));

            // 3. Signature
            String contentToSign = headerBase64 + "." + payloadBase64;
            byte[] signatureBytes = computeHmacSha256(contentToSign.getBytes(StandardCharsets.UTF_8));
            String signatureBase64 = base64UrlEncode(signatureBytes);

            return headerBase64 + "." + payloadBase64 + "." + signatureBase64;
        } catch (Exception e) {
            throw new RuntimeException("Error al generar token JWT de autenticación", e);
        }
    }

    /**
     * Valida la firma criptográfica, la no-revocación y la expiración del token.
     */
    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        // Si el token fue explícitamente revocado en logout, no es válido
        if (tokenRevocationService.isRevoked(token)) {
            return false;
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return false;
        }

        try {
            String headerBase64 = parts[0];
            String payloadBase64 = parts[1];
            String signatureBase64 = parts[2];

            // 1. Verificar firma en tiempo constante
            String contentToSign = headerBase64 + "." + payloadBase64;
            byte[] expectedSignature = computeHmacSha256(contentToSign.getBytes(StandardCharsets.UTF_8));
            byte[] actualSignature = base64UrlDecode(signatureBase64);

            if (!MessageDigest.isEqual(expectedSignature, actualSignature)) {
                return false;
            }

            // 2. Verificar expiración
            byte[] payloadBytes = base64UrlDecode(payloadBase64);
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = objectMapper.readValue(payloadBytes, Map.class);
            Number expNumber = (Number) payload.get("exp");
            if (expNumber == null) {
                return false;
            }

            long expSeconds = expNumber.longValue();
            long nowSeconds = System.currentTimeMillis() / 1000;
            return expSeconds > nowSeconds;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extrae el correo (subject) del token JWT.
     */
    public String extractCorreo(String token) {
        Map<String, Object> payload = extractPayload(token);
        return (String) payload.get("sub");
    }

    /**
     * Extrae el rol del token JWT.
     */
    public String extractRol(String token) {
        Map<String, Object> payload = extractPayload(token);
        return (String) payload.get("rol");
    }

    /**
     * Extrae la fecha de expiración en milisegundos.
     */
    public long extractExpirationMs(String token) {
        Map<String, Object> payload = extractPayload(token);
        Number exp = (Number) payload.get("exp");
        return exp != null ? exp.longValue() * 1000 : 0L;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractPayload(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Formato de token inválido");
            }
            byte[] payloadBytes = base64UrlDecode(parts[1]);
            return objectMapper.readValue(payloadBytes, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Error al extraer claims del token", e);
        }
    }

    private byte[] computeHmacSha256(byte[] data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKeyBytes, "HmacSHA256");
        mac.init(secretKeySpec);
        return mac.doFinal(data);
    }

    private String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private byte[] base64UrlDecode(String str) {
        return Base64.getUrlDecoder().decode(str);
    }
}

