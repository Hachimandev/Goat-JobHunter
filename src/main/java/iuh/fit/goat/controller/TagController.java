package iuh.fit.goat.controller;

import iuh.fit.goat.dto.request.tag.AssignChatRoomTagRequest;
import iuh.fit.goat.dto.request.tag.CreateTagRequest;
import iuh.fit.goat.dto.request.tag.UpdateTagRequest;
import iuh.fit.goat.dto.response.ResultPaginationResponse;
import iuh.fit.goat.dto.response.tag.ChatRoomTagAssignmentResponse;
import iuh.fit.goat.dto.response.tag.TagResponse;
import iuh.fit.goat.entity.Account;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.service.AccountService;
import iuh.fit.goat.service.TagService;
import iuh.fit.goat.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;
    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<TagResponse> createTag(@Valid @RequestBody CreateTagRequest request) throws InvalidException {
        Account currentAccount = getCurrentAccount();
        return ResponseEntity.ok(this.tagService.createTag(currentAccount, request));
    }

    @PutMapping("/{tagId}")
    public ResponseEntity<TagResponse> updateTag(
            @PathVariable Long tagId, @Valid @RequestBody UpdateTagRequest request
    ) throws InvalidException
    {
        Account currentAccount = getCurrentAccount();
        return ResponseEntity.ok(this.tagService.updateTag(currentAccount, tagId, request));
    }

    @DeleteMapping("/{tagId}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long tagId) throws InvalidException {
        Account currentAccount = getCurrentAccount();
        this.tagService.deleteTag(currentAccount, tagId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<ResultPaginationResponse> getTags(Pageable pageable) throws InvalidException {
        Account currentAccount = getCurrentAccount();
        return ResponseEntity.ok(this.tagService.getTags(currentAccount, pageable));
    }

    @PutMapping("/assign")
    public ResponseEntity<List<ChatRoomTagAssignmentResponse>> assignTag(
            @Valid @RequestBody AssignChatRoomTagRequest request
    ) throws InvalidException {
        Account currentAccount = getCurrentAccount();
        return ResponseEntity.ok(this.tagService.assignTag(currentAccount, request));
    }

    @DeleteMapping("/{roomId}/assign")
    public ResponseEntity<Void> removeTag(@PathVariable Long roomId) throws InvalidException {
        Account currentAccount = getCurrentAccount();
        this.tagService.removeTag(currentAccount, roomId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{tagId}/rooms")
    public ResponseEntity<List<Long>> getRoomIdsByTag(@PathVariable Long tagId) throws InvalidException {
        Account currentAccount = getCurrentAccount();
        return ResponseEntity.ok(this.tagService.getRoomIdsByTag(currentAccount, tagId));
    }

    private Account getCurrentAccount() throws InvalidException {
        String email = SecurityUtil.getCurrentUserEmail();

        Account currentAccount = this.accountService.handleGetAccountByEmail(email);
        if (currentAccount == null) throw new InvalidException("User not found");

        return currentAccount;
    }
}
