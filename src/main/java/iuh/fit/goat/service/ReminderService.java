package iuh.fit.goat.service;

import iuh.fit.goat.dto.request.reminder.CreateReminderRequest;
import iuh.fit.goat.dto.request.reminder.ReminderRsvpRequest;
import iuh.fit.goat.dto.request.reminder.UpdateReminderRequest;
import iuh.fit.goat.dto.response.reminder.ReminderResponse;
import iuh.fit.goat.entity.Account;
import iuh.fit.goat.entity.Reminder;
import iuh.fit.goat.exception.InvalidException;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReminderService {
    ReminderResponse createReminder(Account currentAccount, Long chatRoomId, CreateReminderRequest request) throws InvalidException;

    ReminderResponse respondToReminder(Account currentAccount, Long reminderId, ReminderRsvpRequest request) throws InvalidException;

    ReminderResponse declineReminder(Account currentAccount, Long reminderId) throws InvalidException;

    List<ReminderResponse> getMyReminders(Account currentAccount);

    List<ReminderResponse> getRemindersByChatRoom(Long chatRoomId, Account currentAccount, Pageable pageable) throws InvalidException;

    void processReminderDispatch(Reminder reminder);

    ReminderResponse updateReminder(Account currentAccount, Long reminderId, UpdateReminderRequest request) throws InvalidException;
}

