package iuh.fit.goat.dto.response.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageTranslationResponse {
    private String sourceText;
    private String translatedText;
    private String targetLang;
}

