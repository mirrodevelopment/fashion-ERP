package com.fashionerp.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Centralized File Storage Service (H-5)
 *
 * Resolves file storage paths through configurable app.storage.base-path,
 * preventing hardcoded relative paths and supporting external storage volumes.
 */
@Service
public class StorageService {

    private final Path basePath;

    public StorageService(@Value("${app.storage.base-path:front end/assets}") String basePath) {
        this.basePath = Paths.get(basePath).toAbsolutePath();
    }

    public Path getBasePath() {
        return basePath;
    }

    /**
     * Stores a file in a subfolder relative to basePath.
     *
     * @param subfolder e.g. "garments", "order-ref", "user uploads/user img"
     * @param filename  target file name
     * @param content   binary file bytes
     * @return browser-accessible relative URL path
     */
    public String store(String subfolder, String filename, byte[] content) throws IOException {
        Path targetDir = basePath.resolve(subfolder);
        Files.createDirectories(targetDir);
        Path targetFile = targetDir.resolve(filename);
        Files.write(targetFile, content);
        String normalizedSub = subfolder.replace('\\', '/');
        if (normalizedSub.startsWith("/")) {
            normalizedSub = normalizedSub.substring(1);
        }
        return "/front end/assets/" + normalizedSub + "/" + filename;
    }

    /**
     * Safely deletes an existing stored file if it exists.
     *
     * @param relativeUrl web URL or relative path
     */
    public void deleteIfExists(String relativeUrl) {
        if (relativeUrl == null || relativeUrl.isBlank()) {
            return;
        }
        try {
            String clean = relativeUrl.startsWith("/") ? relativeUrl.substring(1) : relativeUrl;
            if (clean.startsWith("front end/assets/")) {
                clean = clean.substring("front end/assets/".length());
            }
            Path resolved = basePath.resolve(clean);
            Files.deleteIfExists(resolved);
        } catch (Exception ignored) {
        }
    }
}
