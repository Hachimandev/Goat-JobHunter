package iuh.fit.goat.service.impl;

import iuh.fit.goat.dto.request.tag.AssignChatRoomTagRequest;
import iuh.fit.goat.dto.request.tag.CreateTagRequest;
import iuh.fit.goat.dto.request.tag.UpdateTagRequest;
import iuh.fit.goat.dto.response.ResultPaginationResponse;
import iuh.fit.goat.dto.response.tag.ChatRoomTagAssignmentResponse;
import iuh.fit.goat.dto.response.tag.TagResponse;
import iuh.fit.goat.entity.Account;
import iuh.fit.goat.entity.ChatRoom;
import iuh.fit.goat.entity.ChatRoomTagAssignment;
import iuh.fit.goat.entity.Tag;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.repository.AccountRepository;
import iuh.fit.goat.repository.ChatRoomRepository;
import iuh.fit.goat.repository.ChatRoomTagAssignmentRepository;
import iuh.fit.goat.repository.TagRepository;
import iuh.fit.goat.service.ChatRoomService;
import iuh.fit.goat.service.TagService;
import iuh.fit.goat.service.helper.MessageHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {
    private final ChatRoomService chatRoomService;

    private final TagRepository tagRepository;
    private final ChatRoomTagAssignmentRepository chatRoomTagAssignmentRepository;
    private final AccountRepository accountRepository;
    private final ChatRoomRepository chatRoomRepository;

    private final MessageHelper messageHelper;

    private static final int MAX_TAGS_PER_USER = 20;
    private static final String DEFAULT_COLOR = "#808080";
    private static final String TAG_COLOR_PATTERN = "^#[0-9A-Fa-f]{6}$";

    @Override
    @Transactional
    public TagResponse createTag(Account currentAccount, CreateTagRequest request) throws InvalidException {
        Account lockedAccount = lockCurrentAccount(currentAccount);
        String normalizedName = normalizeName(request != null ? request.getName() : null);
        String normalizedColor = normalizeColor(request != null ? request.getColor() : null);

        long tagCount = this.tagRepository.countByOwner_AccountIdAndSystemTagIsFalse(lockedAccount.getAccountId());
        if (tagCount >= MAX_TAGS_PER_USER) throw new InvalidException("Maximum tag limit reached for this user");

        if (this.tagRepository.existsByOwner_AccountIdAndNameIgnoreCaseAndSystemTagIsFalse(lockedAccount.getAccountId(), normalizedName)) {
            throw new InvalidException("Tag name already exists for this user");
        }

        Tag tag = new Tag();
        tag.setName(normalizedName);
        tag.setColor(normalizedColor);
        tag.setSystemTag(false);
        tag.setOwner(lockedAccount);

        try {
            return toResponse(this.tagRepository.save(tag));
        } catch (DataIntegrityViolationException ex) {
            throw new InvalidException("Tag name already exists for this user");
        }
    }

    @Override
    @Transactional
    public TagResponse updateTag(Account currentAccount, Long tagId, UpdateTagRequest request) throws InvalidException {
        if (tagId == null)  throw new InvalidException("Tag not found");

        Account lockedAccount = lockCurrentAccount(currentAccount);
        Tag tag = this.tagRepository.findByTagIdForUpdate(tagId).orElseThrow(() -> new InvalidException("Tag not found"));

        String updatedName = request != null ? normalizeNameOrNull(request.getName()) : null;
        String updatedColor = request != null ? normalizeColorOrNull(request.getColor()) : null;
        boolean ownerTag = this.tagRepository
                .existsByOwner_AccountIdAndNameIgnoreCaseAndSystemTagIsFalse(lockedAccount.getAccountId(), updatedName);

        if (updatedName != null && !Objects.equals(tag.getName(), updatedName) && ownerTag) {
            throw new InvalidException("Tag name already exists for this user");
        }

        if (updatedName != null) tag.setName(updatedName);
        if (updatedColor != null) tag.setColor(updatedColor);

        try {
            return toResponse(this.tagRepository.save(tag));
        } catch (DataIntegrityViolationException ex) {
            throw new InvalidException("Tag name already exists for this user");
        }
    }

    @Override
    @Transactional
    public void deleteTag(Account currentAccount, Long tagId) throws InvalidException {
        if (tagId == null) throw new InvalidException("Tag not found");

        Account lockedAccount = lockCurrentAccount(currentAccount);
        Tag tag = this.tagRepository.findByTagIdForUpdate(tagId)
                .orElseThrow(() -> new InvalidException("Tag not found"));

        validateOwnershipForMutableTag(tag, lockedAccount.getAccountId());

        this.chatRoomTagAssignmentRepository.deleteByTagId(tag.getTagId());
        this.tagRepository.delete(tag);
    }

    @Override
    @Transactional
    public List<ChatRoomTagAssignmentResponse> assignTag(Account currentAccount, AssignChatRoomTagRequest request) throws InvalidException {
        if (currentAccount == null) throw new InvalidException("User not found");

        Long currentAccountId = currentAccount.getAccountId();
        Account lockedAccount = this.accountRepository.findByAccountIdAndDeletedAtIsNullForUpdate(currentAccountId)
                .orElseThrow(() -> new InvalidException("User not found"));

        Tag tag = this.tagRepository.findAccessibleTag(request.getTagId(), currentAccountId)
                .orElseThrow(() -> new InvalidException("Tag not found"));

        List<Long> roomIds = request.getRoomIds().stream().filter(Objects::nonNull).distinct().toList();
        List<ChatRoom> rooms = this.chatRoomRepository.findAllById(roomIds);

        List<Long> validRoomIds = this.chatRoomRepository.findRoomIdsAccountBelongTo(
                currentAccountId,
                rooms.stream().map(ChatRoom::getRoomId).toList()
        );

        List<ChatRoomTagAssignment> existingAssignments = this.chatRoomTagAssignmentRepository.findByAccountIdForUpdate(
                currentAccountId
        );

        Map<Long, ChatRoomTagAssignment> assignmentMap = existingAssignments.stream()
                .collect(Collectors.toMap(
                        a -> a.getRoom().getRoomId(),
                        Function.identity()
                )
        );

        List<ChatRoomTagAssignment> toSave = new ArrayList<>();
        for (ChatRoom room : rooms) {
            if (!validRoomIds.contains(room.getRoomId()))  continue;

            ChatRoomTagAssignment assignment = assignmentMap.get(room.getRoomId());
            if (assignment == null) {
                assignment = new ChatRoomTagAssignment();
                assignment.setRoom(room);
                assignment.setAccount(lockedAccount);
            }
            assignment.setTag(tag);

            toSave.add(assignment);
        }

        List<ChatRoomTagAssignment> toDelete = existingAssignments.stream()
                .filter(a ->
                        !validRoomIds.contains(a.getRoom().getRoomId()) && a.getTag().equals(tag)
                ).toList();
        if (!toDelete.isEmpty()) {
            this.chatRoomTagAssignmentRepository.deleteAll(toDelete);
        }

        List<ChatRoomTagAssignment> saved = this.chatRoomTagAssignmentRepository.saveAll(toSave);

        return saved.stream().map(this::toResponse).toList();
    }

    @Override
    public void removeTag(Account currentAccount, Long roomId) throws InvalidException {
        if (currentAccount == null) throw new InvalidException("User not found");
        if (roomId == null) throw new InvalidException("Chat room not found");

        Long currentAccountId = currentAccount.getAccountId();

        if (!this.chatRoomService.isUserInChatRoom(roomId, currentAccountId)) {
            throw new InvalidException("User is not belong to this chat room");
        }

        this.chatRoomTagAssignmentRepository.findByRoomIdAndAccountIdForUpdate(roomId, currentAccountId)
                .ifPresent(this.chatRoomTagAssignmentRepository::delete);
    }

    @Override
    public List<Long> getRoomIdsByTag(Account currentAccount, Long tagId) throws InvalidException {
        if (currentAccount == null) throw new InvalidException("User not found");
        return this.chatRoomTagAssignmentRepository.findByTagIdAndAccountId(tagId, currentAccount.getAccountId());
    }

    @Override
    @Transactional(readOnly = true)
    public ResultPaginationResponse getTags(Account currentAccount, Pageable pageable) {
        Pageable resolvedPageable = resolvePageable(pageable);
        Page<Tag> tags = this.tagRepository.findVisibleTagsForOwner(currentAccount.getAccountId(), resolvedPageable);
        return buildPaginationResponse(tags);
    }

    private Account lockCurrentAccount(Account currentAccount) throws InvalidException {
        if (currentAccount == null)  throw new InvalidException("Account not found");
        return this.accountRepository.findByAccountIdAndDeletedAtIsNullForUpdate(currentAccount.getAccountId())
                .orElseThrow(() -> new InvalidException("Account not found"));
    }

    private void validateOwnershipForMutableTag(Tag tag, Long currentAccountId) throws InvalidException {
        if (tag == null) throw new InvalidException("Tag not found");

        if (tag.isSystemTag()) throw new InvalidException("System tag cannot be modified");

        if (tag.getOwner() == null || !Objects.equals(tag.getOwner().getAccountId(), currentAccountId)) {
            throw new InvalidException("Tag not found");
        }
    }

    private String normalizeName(String name) throws InvalidException {
        String normalized = normalizeNameOrNull(name);
        if (normalized == null)throw new InvalidException("Tag name is required");
        return normalized;
    }

    private String normalizeNameOrNull(String name) {
        if (name == null) return null;
        String normalized = name.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizeColor(String color) throws InvalidException {
        String normalized = normalizeColorOrNull(color);
        return normalized != null ? normalized : DEFAULT_COLOR;
    }

    private String normalizeColorOrNull(String color) throws InvalidException {
        if (color == null || color.isBlank()) return null;
        String normalized = color.trim().toUpperCase();
        if (!normalized.matches(TAG_COLOR_PATTERN))throw new InvalidException("Color must be a valid hex value like #RRGGBB");
        return normalized;
    }

    private Pageable resolvePageable(Pageable pageable) {
        if (pageable == null || pageable.isUnpaged() || pageable.getPageSize() <= 0) {
            return PageRequest.of(0, 20);
        }
        return pageable;
    }

    private ResultPaginationResponse buildPaginationResponse(Page<Tag> tags) {
        ResultPaginationResponse.Meta meta = new ResultPaginationResponse.Meta();
        meta.setPage(tags.getNumber() + 1);
        meta.setPageSize(tags.getSize());
        meta.setPages(tags.getTotalPages());
        meta.setTotal(tags.getTotalElements());

        return new ResultPaginationResponse(meta, tags.getContent().stream().map(this::toResponse).toList());
    }

    private TagResponse toResponse(Tag tag) {
        return TagResponse.builder()
                .tagId(tag.getTagId())
                .name(tag.getName())
                .color(tag.getColor())
                .systemTag(tag.isSystemTag())
                .build();
    }

    private ChatRoomTagAssignmentResponse toResponse(ChatRoomTagAssignment assignment) {
        Tag tag = assignment != null ? assignment.getTag() : null;
        return ChatRoomTagAssignmentResponse.builder()
                .assignmentId(assignment.getAssignmentId())
                .roomId(assignment.getRoom() != null ? assignment.getRoom().getRoomId() : null)
                .accountId(assignment.getAccount() != null ? assignment.getAccount().getAccountId() : null)
                .tagId(tag != null ? tag.getTagId() : null)
                .tagName(tag != null ? tag.getName() : null)
                .tagColor(tag != null ? tag.getColor() : null)
                .systemTag(tag != null ? tag.isSystemTag() : null)
                .build();
    }
}




