package iuh.fit.goat.controller;

import iuh.fit.goat.dto.request.reminder.CreateReminderRequest;
import iuh.fit.goat.dto.request.reminder.ReminderRsvpRequest;
import iuh.fit.goat.dto.request.reminder.UpdateReminderRequest;
import iuh.fit.goat.dto.response.reminder.ReminderResponse;
import iuh.fit.goat.entity.Account;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.service.AccountService;
import iuh.fit.goat.service.ReminderService;
import iuh.fit.goat.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chatrooms/{chatRoomId}/reminders")
@RequiredArgsConstructor
public class ReminderController {

	private final ReminderService reminderService;
	private final AccountService accountService;

//	@GetMapping("/me")
//	public ResponseEntity<List<ReminderResponse>> getMyReminders() throws InvalidException {
//		String email = SecurityUtil.getCurrentUserLogin().orElseThrow(() -> new InvalidException("User not authenticated"));
//		Account account = accountService.handleGetAccountByEmail(email);
//		return ResponseEntity.ok(reminderService.getMyReminders(account));
//	}

	@GetMapping
	public ResponseEntity<List<ReminderResponse>> getRemindersByChatRoom(
			@PathVariable Long chatRoomId, Pageable pageable
	) throws InvalidException {
		String email = SecurityUtil.getCurrentUserLogin().orElseThrow(() -> new InvalidException("User not authenticated"));
		Account account = accountService.handleGetAccountByEmail(email);
		return ResponseEntity.ok(reminderService.getRemindersByChatRoom(chatRoomId, account, pageable));
	}

	@PostMapping
	public ResponseEntity<ReminderResponse> createReminder(
			@PathVariable Long chatRoomId,
			@Valid @RequestBody CreateReminderRequest request
	) throws InvalidException {
		String email = SecurityUtil.getCurrentUserLogin().orElseThrow(() -> new InvalidException("User not authenticated"));
		Account account = accountService.handleGetAccountByEmail(email);
		return ResponseEntity.ok(reminderService.createReminder(account, chatRoomId, request));
	}

	@PutMapping("/{reminderId}")
	public ResponseEntity<ReminderResponse> updateReminder(
			@PathVariable("chatRoomId") Long chatRoomId,
			@PathVariable("reminderId") Long reminderId,
			@Valid @RequestBody UpdateReminderRequest request
	) throws InvalidException {
		String email = SecurityUtil.getCurrentUserLogin().orElseThrow(() -> new InvalidException("User not authenticated"));
		Account account = accountService.handleGetAccountByEmail(email);
		return ResponseEntity.ok(reminderService.updateReminder(account, reminderId, request));
	}

	@PutMapping("/{reminderId}/rsvp")
	public ResponseEntity<ReminderResponse> respondToReminder(
			@PathVariable("chatRoomId") Long chatRoomId,
			@PathVariable("reminderId") Long reminderId,
			@Valid @RequestBody ReminderRsvpRequest request
	) throws InvalidException {
		String email = SecurityUtil.getCurrentUserLogin().orElseThrow(() -> new InvalidException("User not authenticated"));
		Account account = accountService.handleGetAccountByEmail(email);
		return ResponseEntity.ok(reminderService.respondToReminder(account, reminderId, request));
	}

	@PutMapping("/{reminderId}/decline")
	public ResponseEntity<ReminderResponse> declineReminder(
			@PathVariable("chatRoomId") Long chatRoomId,
			@PathVariable("reminderId") Long reminderId
	) throws InvalidException {
		String email = SecurityUtil.getCurrentUserLogin().orElseThrow(() -> new InvalidException("User not authenticated"));
		Account account = accountService.handleGetAccountByEmail(email);
		return ResponseEntity.ok(reminderService.declineReminder(account, reminderId));
	}
}


