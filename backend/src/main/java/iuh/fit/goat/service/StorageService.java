package iuh.fit.goat.service;

import com.amazonaws.services.s3.model.S3ObjectInputStream;
import iuh.fit.goat.dto.response.StorageResponse;
import iuh.fit.goat.exception.InvalidException;
import org.springframework.web.multipart.MultipartFile;

import java.util.concurrent.CompletableFuture;

public interface StorageService {
    CompletableFuture<StorageResponse> handleUploadFile(MultipartFile file, String folder);

    S3ObjectInputStream handleDownloadFile(String key);

    void handleDeleteFile(String key);
}
