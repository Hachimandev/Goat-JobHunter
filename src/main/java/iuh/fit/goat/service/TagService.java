package iuh.fit.goat.service;

import iuh.fit.goat.dto.request.tag.AssignChatRoomTagRequest;
import iuh.fit.goat.dto.request.tag.CreateTagRequest;
import iuh.fit.goat.dto.request.tag.UpdateTagRequest;
import iuh.fit.goat.dto.response.ResultPaginationResponse;
import iuh.fit.goat.dto.response.tag.ChatRoomTagAssignmentResponse;
import iuh.fit.goat.dto.response.tag.TagResponse;
import iuh.fit.goat.entity.Account;
import iuh.fit.goat.exception.InvalidException;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TagService {
    TagResponse createTag(Account currentAccount, CreateTagRequest request) throws InvalidException;

    TagResponse updateTag(Account currentAccount, Long tagId, UpdateTagRequest request) throws InvalidException;

    void deleteTag(Account currentAccount, Long tagId) throws InvalidException;

    List<ChatRoomTagAssignmentResponse> assignTag(
            Account currentAccount, AssignChatRoomTagRequest request
    ) throws InvalidException;

    void removeTag(Account currentAccount, Long roomId) throws InvalidException;

    List<Long> getRoomIdsByTag(Account currentAccount, Long tagId) throws InvalidException;

    ResultPaginationResponse getTags(Account currentAccount, Pageable pageable) throws InvalidException;
}
