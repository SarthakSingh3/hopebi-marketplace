package com.hopebi.marketplace.upload;

import com.hopebi.marketplace.common.BadRequestException;
import com.hopebi.marketplace.upload.dto.FileUploadResponse;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private Path fileStorageLocation;
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"
    );

    public FileStorageService(@Value("${app.upload.dir:./uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            try {
                Path fallback = Paths.get(System.getProperty("java.io.tmpdir"), "hopebi_uploads").toAbsolutePath().normalize();
                Files.createDirectories(fallback);
                this.fileStorageLocation = fallback;
            } catch (Exception fallbackEx) {
                throw new RuntimeException("Could not create directory for storing uploaded files.", ex);
            }
        }
    }

    public FileUploadResponse storeImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to upload empty image file.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid file type. Only JPEG, PNG, WEBP, and GIF images are permitted.");
        }

        // 10 MB limit
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("Image file size exceeds maximum permitted limit of 10MB.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg");
        String extension = "";
        int extIndex = originalFilename.lastIndexOf('.');
        if (extIndex > 0) {
            extension = originalFilename.substring(extIndex);
        } else {
            extension = ".jpg";
        }

        String newFilename = "prod_" + UUID.randomUUID().toString() + extension;

        try {
            if (newFilename.contains("..")) {
                throw new BadRequestException("Filename contains invalid path sequence: " + newFilename);
            }

            Path targetLocation = this.fileStorageLocation.resolve(newFilename);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            String fileUrl = "/uploads/" + newFilename;
            return new FileUploadResponse(newFilename, fileUrl, contentType, file.getSize());
        } catch (IOException ex) {
            throw new RuntimeException("Could not store image " + newFilename + ". Please try again.", ex);
        }
    }
}
