package com.nexashop.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.product-dir:products}")
    private String productDir;

    public String saveFile(MultipartFile file) throws IOException {
        return saveFile(file, null);
    }

    public String saveFile(MultipartFile file, String productName) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        // Create directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, productDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        } else {
            // Default extension if missing
            extension = ".jpg";
        }

        String filename;
        if (productName != null && !productName.trim().isEmpty()) {
            // Sanitize product name: lowercase, numbers and hyphens only
            String sanitized = productName.trim().toLowerCase().replaceAll("[^a-z0-9]", "-");
            // Remove multiple hyphens
            sanitized = sanitized.replaceAll("-+", "-");
            // Remove leading/trailing hyphens
            if (sanitized.startsWith("-")) sanitized = sanitized.substring(1);
            if (sanitized.endsWith("-")) sanitized = sanitized.substring(0, sanitized.length() - 1);
            
            if (sanitized.isEmpty()) {
                 filename = UUID.randomUUID().toString() + extension;
            } else {
                // Find unique suffix
                int counter = 1;
                while (true) {
                    String suffix = String.format("-%04d", counter);
                    filename = sanitized + suffix + extension;
                    Path attempt = uploadPath.resolve(filename);
                    if (!Files.exists(attempt)) {
                        break;
                    }
                    counter++;
                }
            }
        } else {
            filename = UUID.randomUUID().toString() + extension;
        }

        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Return filename only
        return filename;
    }

    public boolean deleteFile(String fileUrl) {
        try {
            // Extract filename from URL
            String filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadDir, productDir, filename);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                return true;
            }
            return false;
        } catch (IOException e) {
            return false;
        }
    }

    public String getFileUrl(String filename) {
        return "/uploads/" + productDir + "/" + filename;
    }
}

