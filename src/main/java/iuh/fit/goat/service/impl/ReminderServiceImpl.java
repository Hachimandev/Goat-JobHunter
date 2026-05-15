package iuh.fit.goat.service.impl;

import iuh.fit.goat.common.MessageEvent;
import iuh.fit.goat.dto.request.reminder.CreateReminderRequest;
import iuh.fit.goat.dto.request.reminder.ReminderRsvpRequest;
import iuh.fit.goat.dto.response.reminder.ReminderParticipantResponse;
import iuh.fit.goat.dto.response.reminder.ReminderRealtimeResponse;
import iuh.fit.goat.dto.response.reminder.ReminderResponse;
import iuh.fit.goat.entity.*;
import iuh.fit.goat.enumeration.*;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.repository.AccountRepository;
import iuh.fit.goat.repository.ReminderParticipantRepository;
import iuh.fit.goat.repository.ReminderRepository;
import iuh.fit.goat.service.MessageService;
import iuh.fit.goat.service.NotificationService;
import iuh.fit.goat.service.ReminderService;
import iuh.fit.goat.service.helper.MessageHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderServiceImpl implements ReminderService {
    private final NotificationService notificationService;
    private final MessageService messageService;

    private final ReminderRepository reminderRepository;
    private final ReminderParticipantRepository reminderParticipantRepository;
    private final AccountRepository accountRepository;

    private final MessageHelper messageHelper;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public List<ReminderResponse> getMyReminders(Account currentAccount) {
        List<ReminderParticipant> participants = this.reminderParticipantRepository
                .findByAccount_AccountIdAndDeletedAtIsNull(currentAccount.getAccountId());

        Map<Long, Reminder> reminderMap = new LinkedHashMap<>();
        for (ReminderParticipant participant : participants) {
            Reminder reminder = participant.getReminder();
            if (reminder.getDeletedAt() == null) {
                reminderMap.put(reminder.getReminderId(), reminder);
            }
        }

        return reminderMap.values().stream()
                .sorted(Comparator.comparing(Reminder::getNextTriggerTime, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::toReminderResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReminderResponse> getRemindersByChatRoom(Long chatRoomId, Account currentAccount, Pageable pageable) throws InvalidException {
        ChatRoom chatRoom = this.messageHelper.getChatRoom(chatRoomId);

        boolean isCurrentAccountMember = chatRoom.getMembers().stream()
                .anyMatch(member -> member.getDeletedAt() == null
                        && Objects.equals(member.getAccount().getAccountId(), currentAccount.getAccountId()));

        if (!isCurrentAccountMember) throw new InvalidException("Bạn không phải là thành viên của phòng chat này");

        List<Reminder> reminders = this.reminderRepository.findByChatRoomId(chatRoomId);
        List<Reminder> sortedReminders = reminders.stream().sorted(
                (p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt())
        ).toList();

        int pageNumber = pageable.getPageNumber();
        int pageSize = pageable.getPageSize();
        int startIndex = pageNumber * pageSize;
        int endIndex = Math.min(startIndex + pageSize, sortedReminders.size());

        if (startIndex >= sortedReminders.size()) return List.of();

        return sortedReminders.subList(startIndex, endIndex).stream()
                .map(this::toReminderResponse)
                .collect(Collectors.toList());
    }
    @Override
    @Transactional
    public ReminderResponse createReminder(Account currentAccount, Long chatRoomId, CreateReminderRequest request) throws InvalidException {
        Instant reminderTime = request.getReminderTime();
        if (reminderTime == null || !reminderTime.isAfter(Instant.now())) {
            throw new InvalidException("Thời gian nhắc phải ở tương lai");
        }

        ChatRoom chatRoom = validateChatRoomIfPresent(currentAccount, chatRoomId);
        List<Account> participants = resolveParticipants(currentAccount, chatRoom, request.getParticipantIds());

        Reminder reminder = new Reminder();
        reminder.setTitle(request.getTitle());
        reminder.setContent(request.getContent());
        reminder.setReminderTime(reminderTime);
        reminder.setNextTriggerTime(reminderTime);
        reminder.setRepeatType(request.getRepeatType());
        reminder.setAllowResponse(request.getAllowResponse());
        reminder.setCreator(currentAccount);
        reminder.setChatRoom(chatRoom);
        Reminder savedReminder = this.reminderRepository.save(reminder);

        List<ReminderParticipant> reminderParticipants = participants.stream()
                .map(account -> buildParticipant(savedReminder, currentAccount, account, request.getAllowResponse()))
                .collect(Collectors.toList());

        this.reminderParticipantRepository.saveAll(reminderParticipants);
        savedReminder.setParticipants(reminderParticipants);

        ReminderResponse reminderResponse = this.toReminderResponse(savedReminder);

        this.messageService.createAndSendReminderMessage(
                chatRoom.getRoomId(), MessageEvent.REMINDER_CREATED,
                currentAccount, reminderResponse
        );

        return reminderResponse;
    }

    @Override
    @Transactional
    public ReminderResponse respondToReminder(Account currentAccount, Long reminderId, ReminderRsvpRequest request) throws InvalidException {
        Reminder reminder = this.reminderRepository.findByReminderIdAndDeletedAtIsNull(reminderId)
                .orElseThrow(() -> new InvalidException("Nhắc hẹn không tồn tại"));

        if (!reminder.isAllowResponse()) throw new InvalidException("Bạn đã tham gia. Nhắc hẹn này là bắt buộc");

        if (!reminder.isActive()) throw new InvalidException("Lịch hẹn đã đến hạn");

        ReminderRsvpStatus status = request.getStatus();
        if (status == ReminderRsvpStatus.PENDING) throw new InvalidException("Trạng thái phản hồi không hợp lệ");

        ReminderParticipant participant = this.reminderParticipantRepository
                .findByReminder_ReminderIdAndAccount_AccountIdAndDeletedAtIsNull(reminderId, currentAccount.getAccountId())
                .orElseThrow(() -> new InvalidException("Bạn không có trong danh sách tham gia nhắc hẹn"));

        participant.setRsvpStatus(status);
        this.reminderParticipantRepository.save(participant);

        ReminderResponse reminderResponse = this.toReminderResponse(reminder);

        this.messageService.createAndSendReminderMessage(
                reminder.getChatRoom().getRoomId(),
                status == ReminderRsvpStatus.ACCEPTED ? MessageEvent.REMINDER_JOINED : MessageEvent.REMINDER_UNJOINED,
                currentAccount, reminderResponse
        );

        return reminderResponse;
    }

    @Override
    @Transactional
    public ReminderResponse declineReminder(Account currentAccount, Long reminderId) throws InvalidException {
        Reminder reminder = this.reminderRepository.findByReminderIdAndDeletedAtIsNull(reminderId)
                .orElseThrow(() -> new InvalidException("Nhắc hẹn không tồn tại"));

        boolean isCreator = Objects.equals(reminder.getCreator().getAccountId(), currentAccount.getAccountId());
        if (!isCreator) throw new InvalidException("Chỉ người tạo mới có thể hủy lịch nhắc");

        reminder.setActive(false);
        reminder.setNextTriggerTime(null);
        this.reminderRepository.save(reminder);

        ReminderResponse reminderResponse = this.toReminderResponse(reminder);

        this.messageService.createAndSendReminderMessage(
                reminder.getChatRoom().getRoomId(), MessageEvent.REMINDER_DECLINED,
                currentAccount, reminderResponse
        );

        return reminderResponse;
    }

    @Override
    @Transactional
    public void processReminderDispatch(Reminder reminder) {
        Instant triggerTime = reminder.getNextTriggerTime();
        if (triggerTime == null) return;

        List<ReminderParticipant> acceptedParticipants = this.reminderParticipantRepository
                .findByReminder_ReminderIdAndRsvpStatusAndDeletedAtIsNull(
                        reminder.getReminderId(),
                        ReminderRsvpStatus.ACCEPTED
                );

        for(ReminderParticipant participant : acceptedParticipants) {
            boolean shouldNotify = participant.getLastNotifiedAt() == null || participant.getLastNotifiedAt().isBefore(triggerTime);
            if (!shouldNotify) continue;

            try {
                this.sendReminderRealtime(participant, reminder, triggerTime);
                this.persistReminderNotification(reminder, participant.getAccount());
                participant.setLastNotifiedAt(triggerTime);
            } catch (Exception ex) {
                log.error("Failed to notify participant {} for reminder {}: {}",
                        participant.getAccount().getAccountId(), reminder.getReminderId(), ex.getMessage(), ex);
            }
        }

        reminder.setLastTriggeredAt(triggerTime);
        Instant nextTriggerTime = calculateNextTriggerTime(triggerTime, reminder.getRepeatType());
        if (nextTriggerTime == null) {
            reminder.setActive(false);
        } else {
            reminder.setNextTriggerTime(nextTriggerTime);
            reminder.setActive(true);
        }
        this.reminderRepository.save(reminder);

        this.messageService.createAndSendReminderMessage(
                reminder.getChatRoom().getRoomId(),
                MessageEvent.REMINDER_EXPIRED,
                reminder.getCreator(),
                this.toReminderResponse(reminder)
        );
    }

    private void sendReminderRealtime(ReminderParticipant participant, Reminder reminder, Instant triggerTime) {
        ReminderRealtimeResponse payload = ReminderRealtimeResponse.builder()
                .reminderId(reminder.getReminderId())
                .title(reminder.getTitle())
                .content(reminder.getContent())
                .triggerTime(triggerTime)
                .chatRoomId(reminder.getChatRoom() != null ? reminder.getChatRoom().getRoomId() : null)
                .creatorId(reminder.getCreator().getAccountId())
                .build();

        this.messagingTemplate.convertAndSendToUser(
                participant.getAccount().getEmail(),
                "/queue/reminders",
                payload
        );
    }

    private void persistReminderNotification(Reminder reminder, Account recipient) {
        Notification notification = new Notification();
        notification.setType(NotificationType.valueOf("REMINDER"));
        notification.setRecipient(recipient);
        notification.setActors(List.of(reminder.getCreator()));

        Notification saved = this.notificationService.createNotification(notification);
        this.notificationService.sendNotificationToUser(recipient, saved);
    }

    private Instant calculateNextTriggerTime(Instant currentTriggerTime, ReminderRepeatType repeatType) {
        return switch (repeatType) {
            case DAILY -> currentTriggerTime.plus(1, ChronoUnit.DAYS);
            case WEEKLY -> currentTriggerTime.plus(7, ChronoUnit.DAYS);
            case MONTHLY -> currentTriggerTime.plus(30, ChronoUnit.DAYS);
            case YEARLY -> currentTriggerTime.plus(365, ChronoUnit.DAYS);
            default -> null;
        };
    }

    private ChatRoom validateChatRoomIfPresent(Account currentAccount, Long chatRoomId) throws InvalidException {
        if (chatRoomId == null) return null;
        ChatRoom chatRoom = this.messageHelper.getChatRoom(chatRoomId);

        boolean isCurrentAccountMember = chatRoom.getMembers().stream()
                .anyMatch(member -> member.getDeletedAt() == null
                        && Objects.equals(member.getAccount().getAccountId(), currentAccount.getAccountId()));

        if (!isCurrentAccountMember) {
            throw new InvalidException("Bạn không phải là thành viên của phòng chat này");
        }

        return chatRoom;
    }

    private List<Account> resolveParticipants(Account currentAccount, ChatRoom chatRoom, List<Long> participantIds)
            throws InvalidException
    {
        Set<Long> requestedIds = new LinkedHashSet<>();
        if (participantIds != null) {
            requestedIds.addAll(participantIds);
        }
        requestedIds.add(currentAccount.getAccountId());

        List<Account> accounts = this.accountRepository.findAllByAccountIdInAndDeletedAtIsNull(new ArrayList<>(requestedIds));
        if (accounts.size() != requestedIds.size()) {
            throw new InvalidException("Danh sách người tham gia có tài khoản không tồn tại");
        }

        if (chatRoom != null) {
            Set<Long> chatMemberIds = chatRoom.getMembers().stream()
                    .filter(member -> member.getDeletedAt() == null)
                    .map(member -> member.getAccount().getAccountId())
                    .collect(Collectors.toSet());

            boolean allInChatRoom = accounts.stream()
                    .allMatch(account -> chatMemberIds.contains(account.getAccountId()));

            if (!allInChatRoom) {
                throw new InvalidException("Người tham gia phải thuộc cùng phòng chat");
            }
        }

        return accounts;
    }

    private ReminderParticipant buildParticipant(
            Reminder reminder, Account creator, Account account,
            boolean allowResponse
    ) {
        ReminderParticipant participant = new ReminderParticipant();
        participant.setReminder(reminder);
        participant.setAccount(account);

        boolean isCreator = Objects.equals(creator.getAccountId(), account.getAccountId());
        if (isCreator || !allowResponse) {
            participant.setRsvpStatus(ReminderRsvpStatus.ACCEPTED);
        } else {
            participant.setRsvpStatus(ReminderRsvpStatus.PENDING);
        }

        return participant;
    }

    private ReminderResponse toReminderResponse(Reminder reminder) {
        List<ReminderParticipant> participants = this.reminderParticipantRepository
                .findByReminder_ReminderIdAndDeletedAtIsNull(reminder.getReminderId());

        List<ReminderParticipantResponse> participantResponses = participants.stream()
                .map(participant -> ReminderParticipantResponse.builder()
                        .accountId(participant.getAccount().getAccountId())
                        .username(participant.getAccount().getUsername())
                        .avatar(participant.getAccount().getAvatar())
                        .status(participant.getRsvpStatus())
                        .respondedAt(participant.getUpdatedAt() != null ? participant.getUpdatedAt() : participant.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ReminderResponse.builder()
                .reminderId(reminder.getReminderId())
                .title(reminder.getTitle())
                .content(reminder.getContent())
                .reminderTime(reminder.getReminderTime())
                .nextTriggerTime(reminder.getNextTriggerTime())
                .lastTriggeredAt(reminder.getLastTriggeredAt())
                .repeatType(reminder.getRepeatType())
                .allowResponse(reminder.isAllowResponse())
                .active(reminder.isActive())
                .creatorId(reminder.getCreator().getAccountId())
                .chatRoomId(reminder.getChatRoom() != null ? reminder.getChatRoom().getRoomId() : null)
                .participants(participantResponses)
                .createdAt(reminder.getCreatedAt())
                .updatedAt(reminder.getUpdatedAt())
                .build();
    }
}


