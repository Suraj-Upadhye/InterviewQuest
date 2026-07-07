package com.surajupadhye.interviewquestbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;

@Service
public class EncryptionService {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128; // in bits
    private static final int IV_LENGTH_BYTES = 12;

    @Value("${api.encryption.key:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef}")
    private String masterKeyHex;

    public static class EncryptionResult {
        private final byte[] cipherText;
        private final byte[] iv;

        public EncryptionResult(byte[] cipherText, byte[] iv) {
            this.cipherText = cipherText;
            this.iv = iv;
        }

        public byte[] getCipherText() {
            return cipherText;
        }

        public byte[] getIv() {
            return iv;
        }
    }

    private SecretKey getSecretKey() {
        if (masterKeyHex == null || masterKeyHex.length() != 64) {
            throw new IllegalStateException("AES master key must be a 64-character hex string (32 bytes).");
        }
        byte[] keyBytes = hexToBytes(masterKeyHex);
        return new SecretKeySpec(keyBytes, ALGORITHM);
    }

    public EncryptionResult encrypt(String plainText) {
        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, getSecretKey(), parameterSpec);

            byte[] cipherText = cipher.doFinal(plainText.getBytes("UTF-8"));
            return new EncryptionResult(cipherText, iv);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    public String decrypt(byte[] cipherText, byte[] iv) {
        try {
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, getSecretKey(), parameterSpec);

            byte[] plainTextBytes = cipher.doFinal(cipherText);
            return new String(plainTextBytes, "UTF-8");
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }

    private byte[] hexToBytes(String hex) {
        byte[] bytes = new byte[hex.length() / 2];
        for (int i = 0; i < bytes.length; i++) {
            bytes[i] = (byte) Integer.parseInt(hex.substring(i * 2, i * 2 + 2), 16);
        }
        return bytes;
    }
}
