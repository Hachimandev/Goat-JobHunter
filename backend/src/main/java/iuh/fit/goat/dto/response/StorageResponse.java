package iuh.fit.goat.dto.response;

import lombok.*;

@Data
@AllArgsConstructor
@Builder
public class StorageResponse {
    private String publicId;
    private String url;
}
