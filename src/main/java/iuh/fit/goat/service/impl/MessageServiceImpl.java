package iuh.fit.goat.service.impl;

import iuh.fit.goat.common.MessageEvent;
import iuh.fit.goat.dto.request.message.ForwardMessageRequest;
import iuh.fit.goat.dto.request.message.MessageCreateRequest;
import iuh.fit.goat.dto.response.message.ForwardMessageFailureResponse;
import iuh.fit.goat.dto.response.message.ForwardMessageResponse;
import iuh.fit.goat.dto.response.message.ForwardMessageSuccessResponse;
import iuh.fit.goat.dto.response.message.MessageDeletedEventResponse;
import iuh.fit.goat.dto.response.message.MessageResponse;
import iuh.fit.goat.dto.response.message.MessageTranslationResponse;
import iuh.fit.goat.dto.response.ResultPaginationResponse;
import iuh.fit.goat.dto.response.StorageResponse;
import iuh.fit.goat.dto.response.poll.PollResponse;
import iuh.fit.goat.entity.Account;
import iuh.fit.goat.entity.ChatCallSession;
import iuh.fit.goat.entity.ChatMember;
import iuh.fit.goat.entity.ChatRoom;
import iuh.fit.goat.entity.Message;
import iuh.fit.goat.entity.User;
import iuh.fit.goat.entity.embeddable.MediaItem;
import iuh.fit.goat.entity.embeddable.SenderInfo;
import iuh.fit.goat.enumeration.MediaType;
import iuh.fit.goat.enumeration.MessageType;
import iuh.fit.goat.enumeration.ChatRoomPermissionAction;
import iuh.fit.goat.exception.BlockedInteractionException;
import iuh.fit.goat.exception.ConflictException;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.exception.NotFoundException;
import iuh.fit.goat.exception.PermissionException;
import iuh.fit.goat.repository.ChatRoomRepository;
import iuh.fit.goat.repository.MessageHiddenRepository;
import iuh.fit.goat.repository.MessageRepository;
import iuh.fit.goat.repository.UserRepository;
import iuh.fit.goat.service.AiService;
import iuh.fit.goat.service.MessageService;
import iuh.fit.goat.service.StorageService;
import iuh.fit.goat.service.cache.ChatRoomCacheService;
import iuh.fit.goat.service.helper.ChatRoomPermissionGuard;
import iuh.fit.goat.service.helper.MessageHelper;
import iuh.fit.goat.util.MessageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;

import static iuh.fit.goat.constant.MessageConstant.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {
    private final StorageService storageService;
    private final AiService aiService;

    private final MessageHiddenRepository messageHiddenRepository;
    private final MessageRepository messageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;

    private final ChatRoomCacheService chatRoomCache;
    private final MessageHelper messageHelper;
    private final ChatRoomPermissionGuard chatRoomPermissionGuard;

    @Override
    public Message getLastMessageByChatRoom(Long chatRoomId) throws InvalidException {
        this.messageHelper.validateChatRoom(chatRoomId);

        Optional<Message> lastMessage = this.messageRepository
                .findLastMessageByConversation(chatRoomId.toString());

        if (lastMessage.isEmpty()) log.warn("No messages found for chatRoom: {}", chatRoomId);

        return lastMessage.orElse(null);
    }

    @Override
    public ResultPaginationResponse getMessagesByChatRoom(
            Long chatRoomId, Pageable pageable, Account currentAccount
    ) throws InvalidException
    {
        return this.messageHelper.getPaginatedMessagesByChatRoom(
                chatRoomId, pageable, currentAccount,
                true, null, true
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ResultPaginationResponse searchMessagesByChatRoom(
            Long chatRoomId, String searchTerm,
            Pageable pageable, Account currentAccount
    ) throws InvalidException
    {
        if (currentAccount == null) throw new InvalidException("Current account is invalid");
        ChatRoom chatRoom = this.chatRoomCache.getCached(chatRoomId);
        if (chatRoom == null) {
            chatRoom = this.chatRoomRepository.findByRoomId(chatRoomId).orElseThrow(() -> new InvalidException("Chat Room not found"));
            this.chatRoomCache.cache(chatRoom);
        }

        int pageNumber = pageable != null ? Math.max(pageable.getPageNumber(), 0) : 0;
        int requestedPageSize = pageable != null ? pageable.getPageSize() : DEFAULT_SEARCH_PAGE_SIZE;
        int pageSize = this.messageHelper.resolveSearchPageSize(requestedPageSize);

        String normalizedSearchTerm = this.messageHelper.normalizeSearchTerm(searchTerm);
        if (normalizedSearchTerm == null) {
            return this.messageHelper.buildPaginationResponse(Collections.emptyList(), pageNumber, pageSize, 0);
        }

        MessageRepository.MessageSearchResult searchResult = this.messageRepository.searchMessagesByChatRoom(
                chatRoomId.toString(),
                normalizedSearchTerm,
                pageNumber,
                pageSize,
                SEARCH_SCAN_LIMIT
        );

        if (searchResult.scanLimitReached()) {
            log.warn("Message search reached scan limit: chatRoomId={}, page={}, pageSize={}, scanLimit={}",
                    chatRoomId,
                    pageNumber + 1,
                    pageSize,
                    SEARCH_SCAN_LIMIT);
        }

        List<Message> visibleMessages = new ArrayList<>(
                this.messageHelper.filterHiddenMessagesForUser(searchResult.messages(), currentAccount.getAccountId())
        );

        int nextPage = pageNumber + 1;
        int topUpRound = 0;
        while (visibleMessages.size() < pageSize
                && topUpRound < MAX_SEARCH_TOP_UP_ROUNDS
                && searchResult.messages().size() >= pageSize) {
            MessageRepository.MessageSearchResult nextPageResult = this.messageRepository.searchMessagesByChatRoom(
                    chatRoomId.toString(),
                    normalizedSearchTerm,
                    nextPage,
                    pageSize,
                    SEARCH_SCAN_LIMIT
            );

            if (nextPageResult.messages().isEmpty()) {
                break;
            }

            visibleMessages.addAll(this.messageHelper.filterHiddenMessagesForUser(nextPageResult.messages(), currentAccount.getAccountId()));

            if (nextPageResult.messages().size() < pageSize) {
                break;
            }

            nextPage++;
            topUpRound++;
        }

        List<Message> pageMessages = visibleMessages.size() > pageSize
                ? new ArrayList<>(visibleMessages.subList(0, pageSize))
                : visibleMessages;

        List<MessageResponse> result = this.messageHelper.toMessageResponses(pageMessages);
        return this.messageHelper.buildPaginationResponse(result, pageNumber, pageSize, searchResult.matchedCount());
    }

    @Override
    public Message sendMessage(Long chatRoomId, MessageCreateRequest request, Account currentAccount) throws InvalidException
    {
        this.messageHelper.validateChatRoom(chatRoomId);
        ChatRoom chatRoom = this.messageHelper.getChatRoom(chatRoomId);
        ChatMember currentMember = this.chatRoomPermissionGuard.getCurrentMember(chatRoom, currentAccount.getAccountId());
        this.chatRoomPermissionGuard.assertCanPerformAction(
                chatRoom,
                currentMember,
                ChatRoomPermissionAction.SEND_MESSAGE
        );
        this.messageHelper.validateNoBlockedDirectInteractionOptimized(chatRoom, chatRoom.getMembers(), currentAccount.getAccountId());

        String replyToMessageId = this.messageHelper.normalizeReplyToMessageId(request != null ? request.getReplyToMessageId() : null);

        this.messageHelper.validateReplyTarget(chatRoomId.toString(), replyToMessageId);

        String messageId = this.messageHelper.generateMessageId();
        Instant now = Instant.now();
        long timestamp = now.toEpochMilli();
        String messageSk = Message.buildMessageSk(timestamp, messageId);
        SenderInfo senderInfo = this.messageHelper.buildSenderInfo(currentAccount);

        Message message = Message.builder()
                .messageSk(messageSk)
                .chatRoomId(chatRoomId.toString())
                .messageId(messageId)
                .sender(senderInfo)
                .content(Objects.requireNonNull(request).getContent())
                .messageType(MessageType.TEXT)
                .replyTo(replyToMessageId)
                .isHidden(false)
                .isForwarded(false)
                .originalMessageId(null)
                .createdAt(now)
                .updatedAt(now)
                .build();

        return this.messageHelper.saveAndDispatchMessageOptimized(chatRoomId, message, currentAccount);
    }

    @Override
    @Transactional
    public List<Message> sendMessagesWithFiles(
            Long chatRoomId, MessageCreateRequest request, List<MultipartFile> files, Account currentAccount
    ) throws InvalidException
    {
        ChatRoom chatRoom = this.messageHelper.getChatRoom(chatRoomId);
        ChatMember currentMember = this.chatRoomPermissionGuard.getCurrentMember(chatRoom, currentAccount.getAccountId());
        this.chatRoomPermissionGuard.assertCanPerformAction(
                chatRoom,
                currentMember,
                ChatRoomPermissionAction.SEND_MESSAGE
        );
        this.messageHelper.validateNoBlockedDirectInteractionOptimized(chatRoom, chatRoom.getMembers(), currentAccount.getAccountId());

        String replyToMessageId = this.messageHelper.normalizeReplyToMessageId(request != null ? request.getReplyToMessageId() : null);
        this.messageHelper.validateReplyTarget(chatRoomId.toString(), replyToMessageId);

        String normalizedContent = this.messageHelper.normalizeMessageContent(request != null ? request.getContent() : null);

        List<Message> createdMessages = new ArrayList<>();
        boolean mediaMessageCreated = false;

        try {
            if (files != null && !files.isEmpty()) {
                List<MultipartFile> mediaFiles = new ArrayList<>();
                List<MultipartFile> nonMediaFiles = new ArrayList<>();

                for (MultipartFile file : files) {
                    this.messageHelper.validateFile(file);

                    MediaType mediaType = this.messageHelper.determineMediaType(file.getContentType());

                    if (mediaType != null) {
                        mediaFiles.add(file);
                    } else {
                        nonMediaFiles.add(file);
                    }
                }

                if (!mediaFiles.isEmpty()) {
                    this.messageHelper.validateMediaBatchConstraints(mediaFiles);

                    if (mediaFiles.size() >= 2) {
                        List<CompletableFuture<StorageResponse>> futures = new ArrayList<>();
                        List<MediaType> mediaTypes = new ArrayList<>();

                        for (MultipartFile mediaFile : mediaFiles) {
                            String mimeType = mediaFile.getContentType();
                            MediaType mediaType = this.messageHelper.determineMediaType(mimeType);

                            if (mediaType == null) continue;
                            mediaTypes.add(mediaType);

                            String folder = this.messageHelper.getFolderByMediaType(mediaType);

                            futures.add(this.storageService.handleUploadFile(mediaFile, folder));
                        }

                        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

                        List<StorageResponse> responses =
                                futures.stream()
                                        .map(CompletableFuture::join)
                                        .toList();

                        List<MediaItem> mediaItems = new ArrayList<>();
                        int displayOrder = 0;
                        for (int i = 0; i < responses.size(); i++) {
                            MultipartFile mediaFile = mediaFiles.get(i);
                            StorageResponse response = responses.get(i);

                            mediaItems.add(
                                    MediaItem.builder()
                                            .url(response.getUrl())
                                            .mediaType(mediaTypes.get(i))
                                            .mimeType(mediaFile.getContentType())
                                            .sizeBytes(mediaFile.getSize())
                                            .displayOrder(displayOrder++)
                                            .build()
                            );
                        }

                        if (!mediaItems.isEmpty()) {
                            Message mediaMessage = this.messageHelper.createMediaMessage(
                                    chatRoomId.toString(),
                                    mediaItems,
                                    normalizedContent,
                                    replyToMessageId,
                                    currentAccount
                            );

                            this.messageHelper.saveAndDispatchMessageOptimized(chatRoomId, mediaMessage, currentAccount);
                            createdMessages.add(mediaMessage);
                            mediaMessageCreated = true;
                        }

                    }
                    else {
                        MultipartFile mediaFile = mediaFiles.getFirst();
                        MessageType messageType = this.messageHelper.determineLegacyMediaMessageType(mediaFile.getContentType());
                        String folder = this.messageHelper.getFolderByMessageType(messageType);

                        StorageResponse response = this.storageService.handleUploadFile(
                                                mediaFile,
                                                folder
                        ).join();

                        Message message = this.messageHelper.createFileMessage(
                                    chatRoomId.toString(),
                                    response.getUrl(),
                                    messageType,
                                    replyToMessageId,
                                    currentAccount
                        );
                        this.messageHelper.saveAndDispatchMessageOptimized(chatRoomId, message, currentAccount);
                        createdMessages.add(message);
                    }
                }

                if (!nonMediaFiles.isEmpty()) {
                    List<CompletableFuture<Message>> futures = nonMediaFiles.stream()
                        .map(file -> {
                            MessageType messageType = this.messageHelper.determineMessageType(file.getContentType());
                            String folder = this.messageHelper.getFolderByMessageType(messageType);

                            return this.storageService.handleUploadFile(file, folder)
                                .thenApply(response -> {
                                    Message message = this.messageHelper.createFileMessage(
                                            chatRoomId.toString(),
                                            response.getUrl(),
                                            messageType,
                                            replyToMessageId,
                                            currentAccount
                                    );

                                    this.messageHelper.saveAndDispatchMessageOptimized(chatRoomId, message, currentAccount);

                                    return message;

                                });
                        })
                        .toList();

                    CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

                    createdMessages.addAll(
                            futures.stream().map(CompletableFuture::join).toList()
                    );
                }
            }

            if (!mediaMessageCreated && normalizedContent != null) {
                MessageCreateRequest textRequest = new MessageCreateRequest(
                            normalizedContent,
                            replyToMessageId
                );

                Message textMessage = sendMessage(
                            chatRoomId,
                            textRequest,
                            currentAccount
                );

                createdMessages.add(textMessage);
            }

            if (createdMessages.isEmpty()) throw new InvalidException("At least one file or text content is required");

            return createdMessages;
        } catch (BlockedInteractionException e) {
            throw new InvalidException("Cannot send message due to blocked interaction: " + e.getMessage());
        } catch (Exception e) {
            throw new InvalidException("Failed to create messages: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public List<Message> sendContactCardMessages(
            Long chatRoomId, List<Long> userIds, Account currentAccount
    ) throws InvalidException
    {
        if (chatRoomId == null) throw new InvalidException("Chat room ID cannot be null");
        if (currentAccount == null) throw new InvalidException("Current account is invalid");

        ChatRoom chatRoom = this.messageHelper.getChatRoom(chatRoomId);
        ChatMember currentMember = this.chatRoomPermissionGuard.getCurrentMember(chatRoom, currentAccount.getAccountId());
        this.chatRoomPermissionGuard.assertCanPerformAction(
                chatRoom,
                currentMember,
                ChatRoomPermissionAction.SEND_MESSAGE
        );
        this.messageHelper.validateNoBlockedDirectInteraction(chatRoom, currentAccount.getAccountId());

        List<Long> normalizedUserIds = this.messageHelper.normalizeContactCardUserIds(userIds);
        if (normalizedUserIds.isEmpty()) throw new InvalidException("At least one valid user ID is required");

        List<Message> createdMessages = new ArrayList<>();
        for (Long userId : normalizedUserIds) {
            if (Objects.equals(userId, currentAccount.getAccountId())) continue;

            Optional<User> referencedUser = this.userRepository.findByAccountIdAndDeletedAtIsNull(userId);
            if (referencedUser.isEmpty()) continue;

            if (!this.messageHelper.isFriendWithCurrentUser(currentAccount.getAccountId(), userId)) continue;

            Message contactCardMessage = this.messageHelper.createContactCardMessage(chatRoomId.toString(), userId, currentAccount);
            this.messageHelper.saveAndDispatchMessageOptimized(chatRoomId, contactCardMessage, currentAccount);
            createdMessages.add(contactCardMessage);
        }

        if (createdMessages.isEmpty())  throw new InvalidException("No eligible contacts to send");
        return createdMessages;
    }

    @Override
    public ResultPaginationResponse getMediaMessagesByChatRoom(
            Long chatRoomId, Pageable pageable, Account currentAccount
    ) throws InvalidException
    {
        return this.messageHelper.getPaginatedMessagesByChatRoom(
                chatRoomId, pageable, currentAccount,
                false,
                message -> message != null && this.messageHelper.isMediaType(message.getMessageType()),
                false
        );
    }

    @Override
    public ResultPaginationResponse getFileMessagesByChatRoom(
            Long chatRoomId, Pageable pageable, Account currentAccount
    ) throws InvalidException
    {
        return this.messageHelper.getPaginatedMessagesByChatRoom(
                chatRoomId, pageable, currentAccount,
                false,
                message -> message != null && message.getMessageType() == MessageType.FILE,
                false
        );
    }

    @Override
    public void hideMessageForMe(
            Long chatRoomId, String messageId, Account currentAccount
    ) throws InvalidException, NotFoundException, PermissionException
    {
        if (chatRoomId == null) throw new InvalidException("Chat room ID cannot be null");
        if (messageId == null || messageId.isBlank())throw new InvalidException("Message ID cannot be blank");
        if (currentAccount == null)throw new InvalidException("Current account is invalid");

        this.messageHelper.validateChatRoom(chatRoomId);

        if (!this.messageHelper.isUserInChatRoom(chatRoomId, currentAccount.getAccountId())) {
            throw new PermissionException("Current user is not a member of this chat room");
        }

        Message message = this.messageRepository
                .findByChatRoomIdAndMessageId(chatRoomId.toString(), messageId)
                .orElseThrow(() -> new NotFoundException("Message not found"));

        this.messageHiddenRepository.hideMessageForUser(
                message.getMessageId(),
                currentAccount.getAccountId(),
                Instant.now()
        );
    }

    @Override
    public Message revokeMessage(
            Long chatRoomId, String messageId, Account currentAccount
    ) throws InvalidException, NotFoundException, ConflictException, PermissionException
    {
        if (chatRoomId == null) throw new InvalidException("Chat room ID cannot be null");
        if (messageId == null || messageId.isBlank()) throw new InvalidException("Message ID cannot be blank");
        if (currentAccount == null) throw new InvalidException("Current account is invalid");

        this.messageHelper.validateChatRoom(chatRoomId);

        Message message = this.messageRepository
                .findByChatRoomIdAndMessageId(chatRoomId.toString(), messageId)
                .orElseThrow(() -> new NotFoundException("Message not found"));

        if (Boolean.TRUE.equals(message.getIsHidden())) throw new ConflictException("Message has already been revoked");

        Long senderAccountId = this.messageHelper.extractSenderAccountId(message);
        if (senderAccountId == null) throw new InvalidException("Message sender information is missing");

        if (!Objects.equals(senderAccountId, currentAccount.getAccountId())) {
            throw new PermissionException("Only sender can revoke this message");
        }

        List<Message> cascadeMessages = this.messageHelper.collectCascadeRecallMessages(message);

        List<Message> recalledMessages;
        try {
            recalledMessages = this.messageHelper.applyRecallState(cascadeMessages);
        } catch (RuntimeException e) {
            log.error("Failed to cascade revoke messageId={} in chatRoomId={}", messageId, chatRoomId, e);
            throw new InvalidException("Failed to revoke message");
        }

        LinkedHashSet<String> affectedChatRoomIds = new LinkedHashSet<>();
        for (Message recalledMessage : recalledMessages) {
            if (recalledMessage.getChatRoomId() != null && !recalledMessage.getChatRoomId().isBlank()) {
                affectedChatRoomIds.add(recalledMessage.getChatRoomId());
            }

            this.messageHelper.sendMessageToUsers(recalledMessage.getChatRoomId(), recalledMessage);
        }

        Message revokedMessage = recalledMessages.stream()
                .filter(recalledMessage -> messageId.equals(recalledMessage.getMessageId()))
                .findFirst()
                .orElse(message);

        this.messageHelper.refreshChatRoomSummaries(affectedChatRoomIds);

        return revokedMessage;
    }

    @Override
    public ForwardMessageResponse forwardMessage(
            Long sourceChatRoomId, String messageId,
            ForwardMessageRequest request, Account currentAccount
    ) throws InvalidException, NotFoundException, PermissionException
    {
        if (sourceChatRoomId == null) throw new InvalidException("Source chat room ID cannot be null");
        if (messageId == null || messageId.isBlank()) throw new InvalidException("Message ID cannot be blank");
        if (currentAccount == null) throw new InvalidException("Current account is invalid");

        List<Long> targetChatRoomIds = this.messageHelper.normalizeTargetChatRoomIds(request);

        this.chatRoomRepository.findById(sourceChatRoomId)
                .orElseThrow(() -> new NotFoundException("Source chat room not found"));

        if (!this.messageHelper.isUserInChatRoom(sourceChatRoomId, currentAccount.getAccountId())) {
            throw new PermissionException("Current user is not a member of source chat room");
        }

        Message sourceMessage = this.messageRepository
                .findByChatRoomIdAndMessageId(sourceChatRoomId.toString(), messageId)
                .orElseThrow(() -> new NotFoundException("Source message not found"));

        this.messageHelper.validateForwardableSourceMessage(sourceMessage);

        List<ForwardMessageSuccessResponse> successes = new ArrayList<>();
        List<ForwardMessageFailureResponse> failures = new ArrayList<>();

        for (Long targetChatRoomId : targetChatRoomIds) {
            if (Objects.equals(targetChatRoomId, sourceChatRoomId)) {
                failures.add(this.messageHelper.buildForwardFailure(
                        targetChatRoomId,
                        "TARGET_EQUALS_SOURCE",
                        "Cannot forward message to source chat room"
                ));
                continue;
            }

            if (this.chatRoomRepository.findById(targetChatRoomId).isEmpty()) {
                failures.add(this.messageHelper.buildForwardFailure(
                        targetChatRoomId,
                        "TARGET_NOT_FOUND",
                        "Target chat room not found"
                ));
                continue;
            }

            if (!this.messageHelper.isUserInChatRoom(targetChatRoomId, currentAccount.getAccountId())) {
                failures.add(this.messageHelper.buildForwardFailure(
                        targetChatRoomId,
                        "TARGET_FORBIDDEN",
                        "Current user is not a member of target chat room"
                ));
                continue;
            }

            try {
                Message forwardedMessage = this.messageHelper.createForwardedMessage(sourceMessage, targetChatRoomId, currentAccount);
                this.messageHelper.saveAndDispatchMessageOptimized(targetChatRoomId, forwardedMessage, currentAccount);

                successes.add(ForwardMessageSuccessResponse.builder()
                        .targetChatRoomId(targetChatRoomId)
                        .message(this.messageHelper.toMessageResponse(forwardedMessage))
                        .build());
            } catch (RuntimeException e) {
                log.error("Failed to forward messageId={} to chatRoomId={}", messageId, targetChatRoomId, e);
                failures.add(this.messageHelper.buildForwardFailure(
                        targetChatRoomId,
                        "FORWARD_FAILED",
                        "Failed to forward message"
                ));
            }
        }

        return ForwardMessageResponse.builder()
                .sourceChatRoomId(sourceChatRoomId)
                .sourceMessageId(messageId)
                .totalTargets(targetChatRoomIds.size())
                .successCount(successes.size())
                .failedCount(failures.size())
                .successes(successes)
                .failures(failures)
                .build();
    }

    @Override
    @Transactional
    public MessageDeletedEventResponse deleteMessagePermanently(
            Long chatRoomId, String messageId, Account currentAccount
    ) throws InvalidException, NotFoundException, PermissionException
    {
        if (chatRoomId == null) throw new InvalidException("Chat room ID cannot be null");
        if (messageId == null || messageId.isBlank()) throw new InvalidException("Message ID cannot be blank");
        if (currentAccount == null) throw new InvalidException("Current account is invalid");

        this.messageHelper.validateChatRoom(chatRoomId);

        Message message = this.messageRepository
                .findByChatRoomIdAndMessageId(chatRoomId.toString(), messageId)
                .orElseThrow(() -> new NotFoundException("Message not found or already permanently deleted"));

        Long senderAccountId = this.messageHelper.extractSenderAccountId(message);
        boolean canDeleteAsAdmin = this.messageHelper.isSuperAdmin(currentAccount);
        boolean canDeleteAsSender = senderAccountId != null && Objects.equals(senderAccountId, currentAccount.getAccountId());

        if (!canDeleteAsAdmin && !canDeleteAsSender) {
            throw new PermissionException("Only sender or super admin can permanently delete this message");
        }

        List<MessageHelper.CascadeDeleteTarget> deleteTargets = this.messageHelper.collectCascadeDeleteTargets(message);
        List<MessageDeletedEventResponse> emittedEvents = new ArrayList<>();

        for (MessageHelper.CascadeDeleteTarget target : deleteTargets) {
            Message targetMessage = target.message();

            try {
                this.messageHelper.deleteSingleMessagePermanently(targetMessage);
            } catch (InvalidException e) {
                log.error("Cascade permanent delete failed: rootMessageId={}, rootChatRoomId={}, failedMessageId={}, failedChatRoomId={}, totalCandidates={}, totalDeleted={}",
                        messageId,
                        chatRoomId,
                        targetMessage != null ? targetMessage.getMessageId() : null,
                        targetMessage != null ? targetMessage.getChatRoomId() : null,
                        deleteTargets.size(),
                        emittedEvents.size(),
                        e);
                throw new InvalidException("Failed to permanently delete message");
            }

            MessageDeletedEventResponse event = this.messageHelper.buildMessageDeletedEvent(
                    targetMessage,
                    target.deleteType(),
                    currentAccount.getAccountId(),
                    Instant.now()
            );

            this.messageHelper.sendMessageDeletedEvent(targetMessage.getChatRoomId(), event);
            emittedEvents.add(event);
        }

        MessageDeletedEventResponse rootEvent = emittedEvents.stream()
                .filter(event -> messageId.equals(event.getMessageId()))
                .findFirst()
                .orElseThrow(() -> new InvalidException("Failed to permanently delete message"));

        LinkedHashSet<String> affectedChatRoomIds = new LinkedHashSet<>();
        for (MessageDeletedEventResponse event : emittedEvents) {
            if (event.getChatRoomId() != null && !event.getChatRoomId().isBlank()) {
                affectedChatRoomIds.add(event.getChatRoomId());
            }
        }

        this.messageHelper.refreshChatRoomSummaries(affectedChatRoomIds);

        return rootEvent;
    }

    @Override
    public void createAndSendSystemMessage(
            Long chatRoomId, MessageEvent type,
            Account actor, Object... params
    ) {
        String content = MessageUtil.generateSystemMessage(type, actor, params);
        String messageId = this.messageHelper.generateMessageId();
        Instant now = Instant.now();
        long timestamp = now.toEpochMilli();

        String messageSk = Message.buildMessageSk(timestamp, messageId);

        SenderInfo senderInfo = this.messageHelper.buildSenderInfo(actor);

        Message systemMessage = Message.builder()
                .messageSk(messageSk)
                .chatRoomId(chatRoomId.toString())
                .messageId(messageId)
                .sender(senderInfo)
                .content(content)
                .messageType(MessageType.SYSTEM)
                .isHidden(false)
                .isForwarded(false)
                .originalMessageId(null)
                .createdAt(now)
                .updatedAt(now)
                .build();

        this.messageHelper.saveAndDispatchMessageOptimized(chatRoomId, systemMessage, actor);
    }

    @Override
    public void createAndSendPollMessage(Long chatRoomId, MessageEvent type, Account actor, PollResponse poll) {
        String content = MessageUtil.generateSystemMessage(type, actor, poll);
        Instant now = Instant.now();
        long timestamp = now.toEpochMilli();

        String messageId = type == MessageEvent.POLL_CREATED ? poll.getMessageId() : this.messageHelper.generateMessageId();
        String messageSk = Message.buildMessageSk(timestamp, poll.getMessageId());
        SenderInfo senderInfo = this.messageHelper.buildSenderInfo(actor);

        Message message = Message.builder()
                .messageId(messageId)
                .messageSk(messageSk)
                .chatRoomId(chatRoomId.toString())
                .sender(senderInfo)
                .content(content)
                .messageType(MessageType.POLL)
                .isHidden(false)
                .isForwarded(false)
                .originalMessageId(null)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        Message savedMessage = messageRepository.saveMessage(message);
        if(poll.getPinned() != null && poll.getPinned()) {
            this.messageRepository.pinMessage(
                    chatRoomId.toString(), poll.getMessageId(),
                    this.messageHelper.resolveAccountDisplayName(actor)
            );
        }

        this.messageHelper.sendMessageToUsers(chatRoomId, savedMessage);
    }

    @Override
    public void createAndSendCallMessage(Long chatRoomId, Account actor, ChatCallSession session) {
        if (chatRoomId == null || actor == null || session == null || session.getCallSessionId() == null) {
            return;
        }

        Instant endedAt = session.getEndedAt() != null ? session.getEndedAt() : Instant.now();
        Instant startedAt = session.getStartedAt();
        String messageId = this.messageHelper.generateMessageId();

        Message callMessage = Message.builder()
                .messageSk(Message.buildMessageSk(endedAt.toEpochMilli(), messageId))
                .chatRoomId(chatRoomId.toString())
                .messageId(messageId)
                .sender(this.messageHelper.buildSenderInfo(actor))
                .content("[Cuộc gọi]")
                .mediaItems(null)
                .callSummary(this.messageHelper.buildCallSummary(session, startedAt, endedAt))
                .messageType(MessageType.CALL)
                .replyTo(null)
                .isHidden(false)
                .isForwarded(false)
                .originalMessageId(null)
                .createdAt(endedAt)
                .updatedAt(endedAt)
                .build();

        this.messageHelper.saveAndDispatchMessageOptimized(chatRoomId, callMessage, actor);
    }

    @Override
    public MessageTranslationResponse translateMessage(String content, String targetLang) throws InvalidException {
        String sourceText = this.messageHelper.normalizeMessageContent(content);
        if (sourceText == null || sourceText.isBlank()) {
            throw new InvalidException("Message content is empty");
        }

        String translatedText = this.aiService.translateText(sourceText, targetLang);

        return MessageTranslationResponse.builder()
                .sourceText(sourceText)
                .translatedText(translatedText)
                .targetLang(targetLang != null ? targetLang.trim() : null)
                .build();
    }
}
