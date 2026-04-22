package iuh.fit.goat.dto.request.poll;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddPollOptionRequest {
    @NotBlank(message = "Poll ID is required")
    private String pollId;
    @NotEmpty(message = "Option texts must not be empty")
    private List<@NotNull(message = "Text cannot null") String> texts;
}

