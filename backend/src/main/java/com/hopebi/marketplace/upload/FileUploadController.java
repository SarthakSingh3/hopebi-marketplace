package com.hopebi.marketplace.upload;

import com.hopebi.marketplace.common.ApiResponse;
import com.hopebi.marketplace.upload.dto.FileUploadResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/uploads")
@Tag(name = "File Uploads", description = "Device media and product image upload endpoints")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    public FileUploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload a photo from device", description = "Allows authenticated users to upload photos directly from local device storage.")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadImage(@RequestParam("file") MultipartFile file) {
        FileUploadResponse response = fileStorageService.storeImage(file);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully from device", response));
    }

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload multiple photos from device", description = "Allows uploading multiple photos simultaneously.")
    public ResponseEntity<ApiResponse<List<FileUploadResponse>>> uploadMultipleImages(@RequestParam("files") List<MultipartFile> files) {
        List<FileUploadResponse> responses = files.stream()
                .map(fileStorageService::storeImage)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Images uploaded successfully from device", responses));
    }
}
