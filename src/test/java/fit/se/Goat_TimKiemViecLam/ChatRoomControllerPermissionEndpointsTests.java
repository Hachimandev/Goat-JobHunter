package fit.se.Goat_TimKiemViecLam;

import com.fasterxml.jackson.databind.ObjectMapper;
import iuh.fit.goat.controller.ChatRoomController;
import iuh.fit.goat.dto.request.chat.UpdateChatRoomPermissionsRequest;
import iuh.fit.goat.dto.response.chat.ChatRoomPermissionResponse;
import iuh.fit.goat.entity.Applicant;
import iuh.fit.goat.exception.GlobalExceptionHandler;
import iuh.fit.goat.exception.InvalidException;
import iuh.fit.goat.service.AccountService;
import iuh.fit.goat.service.ChatRoomService;
import iuh.fit.goat.service.MessageService;
import iuh.fit.goat.service.PinnedMessageService;
import iuh.fit.goat.service.helper.MessageHelper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ChatRoomControllerPermissionEndpointsTests {

    private static final String CURRENT_EMAIL = "permissions-controller@mail.test";

    @Mock
    private ChatRoomService chatRoomService;

    @Mock
    private MessageService messageService;

    @Mock
    private AccountService accountService;

    @Mock
    private PinnedMessageService pinnedMessageService;

    @Mock
    private MessageHelper messageHelper;

    @InjectMocks
    private ChatRoomController chatRoomController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(chatRoomController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(CURRENT_EMAIL, "test-password"));

        Applicant currentAccount = new Applicant();
        currentAccount.setAccountId(91L);
        currentAccount.setEmail(CURRENT_EMAIL);
        lenient().when(accountService.handleGetAccountByEmail(CURRENT_EMAIL)).thenReturn(currentAccount);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getGroupPermissions_shouldExposeRouteAndPayloadShape() throws Exception {
        ChatRoomPermissionResponse response = ChatRoomPermissionResponse.builder()
                .roomId(101L)
                .allowMemberUpdate(true)
                .allowMemberPin(false)
                .allowMemberCreateVote(true)
                .allowMemberSendMessage(false)
                .allowModeratorSendMessage(true)
                .build();
        when(chatRoomService.getGroupPermissions(any(), eq(101L))).thenReturn(response);

        mockMvc.perform(get("/api/v1/chatrooms/group/{chatRoomId}/permissions", 101L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomId").value(101L))
                .andExpect(jsonPath("$.allowMemberUpdate").value(true))
                .andExpect(jsonPath("$.allowMemberPin").value(false))
                .andExpect(jsonPath("$.allowMemberCreateVote").value(true))
                .andExpect(jsonPath("$.allowMemberSendMessage").value(false))
                .andExpect(jsonPath("$.allowModeratorSendMessage").value(true));

        verify(chatRoomService).getGroupPermissions(any(), eq(101L));
    }

    @Test
    void updateGroupPermissions_shouldExposeRouteAndPayloadShape() throws Exception {
        UpdateChatRoomPermissionsRequest request = new UpdateChatRoomPermissionsRequest(
                false,
                false,
                true,
                true,
                false
        );
        ChatRoomPermissionResponse response = ChatRoomPermissionResponse.builder()
                .roomId(202L)
                .allowMemberUpdate(false)
                .allowMemberPin(false)
                .allowMemberCreateVote(true)
                .allowMemberSendMessage(true)
                .allowModeratorSendMessage(false)
                .build();
        when(chatRoomService.updateGroupPermissions(any(), eq(202L), any(UpdateChatRoomPermissionsRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/v1/chatrooms/group/{chatRoomId}/permissions", 202L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomId").value(202L))
                .andExpect(jsonPath("$.allowMemberUpdate").value(false))
                .andExpect(jsonPath("$.allowMemberPin").value(false))
                .andExpect(jsonPath("$.allowMemberCreateVote").value(true))
                .andExpect(jsonPath("$.allowMemberSendMessage").value(true))
                .andExpect(jsonPath("$.allowModeratorSendMessage").value(false));

        verify(chatRoomService).updateGroupPermissions(any(), eq(202L), any(UpdateChatRoomPermissionsRequest.class));
    }

    @Test
    void updateGroupPermissions_shouldReturnBadRequestWhenModeratorTouchesModeratorSendFlag() throws Exception {
        UpdateChatRoomPermissionsRequest request = new UpdateChatRoomPermissionsRequest(
                true,
                true,
                true,
                true,
                false
        );
        when(chatRoomService.updateGroupPermissions(any(), eq(303L), any(UpdateChatRoomPermissionsRequest.class)))
                .thenThrow(new InvalidException("Moderators cannot update moderator send message permission"));

        mockMvc.perform(put("/api/v1/chatrooms/group/{chatRoomId}/permissions", 303L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Moderators cannot update moderator send message permission"));

        verify(chatRoomService).updateGroupPermissions(any(), eq(303L), any(UpdateChatRoomPermissionsRequest.class));
    }

    @Test
    void updateGroupPermissions_shouldReturnBadRequestWhenMemberIsDenied() throws Exception {
        UpdateChatRoomPermissionsRequest request = new UpdateChatRoomPermissionsRequest(
                true,
                false,
                false,
                true,
                true
        );
        when(chatRoomService.updateGroupPermissions(any(), eq(404L), any(UpdateChatRoomPermissionsRequest.class)))
                .thenThrow(new InvalidException("Only owners and moderators can update group permissions"));

        mockMvc.perform(put("/api/v1/chatrooms/group/{chatRoomId}/permissions", 404L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only owners and moderators can update group permissions"));

        verify(chatRoomService).updateGroupPermissions(any(), eq(404L), any(UpdateChatRoomPermissionsRequest.class));
    }
}
