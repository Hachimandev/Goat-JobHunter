package fit.se.Goat_TimKiemViecLam;

import com.fasterxml.jackson.databind.ObjectMapper;
import iuh.fit.goat.controller.ChatRoomController;
import iuh.fit.goat.dto.response.chat.InviteLinkResponse;
import iuh.fit.goat.dto.response.chat.InviteTokenPreviewResponse;
import iuh.fit.goat.dto.response.chat.JoinByInviteResponse;
import iuh.fit.goat.entity.Applicant;
import iuh.fit.goat.enumeration.ChatRoomPrivacy;
import iuh.fit.goat.exception.GlobalExceptionHandler;
import iuh.fit.goat.exception.NotFoundException;
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

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ChatRoomControllerInviteEndpointsTests {

    private static final String CURRENT_EMAIL = "controller-user@mail.test";

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
        currentAccount.setAccountId(7L);
        currentAccount.setEmail(CURRENT_EMAIL);
        lenient().when(accountService.handleGetAccountByEmail(CURRENT_EMAIL)).thenReturn(currentAccount);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getInviteLink_shouldExposeRouteAndPayloadShape() throws Exception {
        InviteLinkResponse response = InviteLinkResponse.builder()
                .roomId(101L)
                .inviteToken("invite-token-101")
                .inviteLink("http://localhost:3000/invite/invite-token-101")
                .inviteEnabled(true)
                .inviteRotatedAt(Instant.parse("2026-04-28T12:00:00Z"))
                .privacy(ChatRoomPrivacy.PUBLIC)
                .build();
        when(chatRoomService.getInviteLink(any(), eq(101L))).thenReturn(response);

        mockMvc.perform(get("/api/v1/chatrooms/{roomId}/invite-link", 101L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomId").value(101L))
                .andExpect(jsonPath("$.inviteToken").value("invite-token-101"))
                .andExpect(jsonPath("$.inviteLink").value("http://localhost:3000/invite/invite-token-101"))
                .andExpect(jsonPath("$.inviteEnabled").value(true));

        verify(chatRoomService).getInviteLink(any(), eq(101L));
    }

    @Test
    void rotateInviteLink_shouldExposeRouteAndPayloadShape() throws Exception {
        InviteLinkResponse response = InviteLinkResponse.builder()
                .roomId(202L)
                .inviteToken("invite-token-202")
                .inviteLink("http://localhost:3000/invite/invite-token-202")
                .inviteEnabled(false)
                .inviteRotatedAt(Instant.parse("2026-04-28T13:00:00Z"))
                .privacy(ChatRoomPrivacy.PRIVATE)
                .build();
        when(chatRoomService.rotateInviteLink(any(), eq(202L))).thenReturn(response);

        mockMvc.perform(post("/api/v1/chatrooms/{roomId}/invite-link/rotate", 202L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomId").value(202L))
                .andExpect(jsonPath("$.inviteToken").value("invite-token-202"))
                .andExpect(jsonPath("$.inviteEnabled").value(false));

        verify(chatRoomService).rotateInviteLink(any(), eq(202L));
    }

    @Test
    void toggleInviteLink_shouldExposeRouteAndPayloadShape() throws Exception {
        InviteLinkResponse response = InviteLinkResponse.builder()
                .roomId(303L)
                .inviteToken("invite-token-303")
                .inviteLink("http://localhost:3000/invite/invite-token-303")
                .inviteEnabled(false)
                .inviteRotatedAt(Instant.parse("2026-04-28T14:00:00Z"))
                .privacy(ChatRoomPrivacy.PUBLIC)
                .build();
        when(chatRoomService.toggleInviteLink(any(), eq(303L), eq(false))).thenReturn(response);

        mockMvc.perform(post("/api/v1/chatrooms/{roomId}/invite-link/toggle", 303L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ToggleBody(false))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomId").value(303L))
                .andExpect(jsonPath("$.inviteToken").value("invite-token-303"))
                .andExpect(jsonPath("$.inviteEnabled").value(false));

        verify(chatRoomService).toggleInviteLink(any(), eq(303L), eq(false));
    }

    @Test
    void joinByInvite_shouldExposeRouteAndPayloadShape() throws Exception {
        JoinByInviteResponse response = new JoinByInviteResponse(404L, true);
        when(chatRoomService.joinByInvite(any(), eq("join-token-404"))).thenReturn(response);

        mockMvc.perform(post("/api/v1/chatrooms/join-by-invite")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new JoinBody("join-token-404"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomId").value(404L))
                .andExpect(jsonPath("$.joined").value(true));

        verify(chatRoomService).joinByInvite(any(), eq("join-token-404"));
    }

    @Test
    void getInvitePreview_shouldReturnRoomMetadataByToken() throws Exception {
        InviteTokenPreviewResponse response = InviteTokenPreviewResponse.builder()
                .roomId(505L)
                .roomName("Backend Team")
                .roomAvatar("https://cdn.test/rooms/backend.png")
                .inviteEnabled(true)
                .privacy(ChatRoomPrivacy.PRIVATE)
                .build();
        when(chatRoomService.getInvitePreview("invite-token-505")).thenReturn(response);

        mockMvc.perform(get("/api/v1/chatrooms/invite-preview/{token}", "invite-token-505"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomId").value(505L))
                .andExpect(jsonPath("$.roomName").value("Backend Team"))
                .andExpect(jsonPath("$.roomAvatar").value("https://cdn.test/rooms/backend.png"))
                .andExpect(jsonPath("$.inviteEnabled").value(true))
                .andExpect(jsonPath("$.privacy").value("PRIVATE"));

        verify(chatRoomService).getInvitePreview("invite-token-505");
    }

    @Test
    void getInvitePreview_shouldReturnNotFoundWhenInviteDisabled() throws Exception {
        when(chatRoomService.getInvitePreview("invite-token-disabled"))
                .thenThrow(new NotFoundException("Invite token not found"));

        mockMvc.perform(get("/api/v1/chatrooms/invite-preview/{token}", "invite-token-disabled"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.statusCode").value(404))
                .andExpect(jsonPath("$.message").value("Invite token not found"))
                .andExpect(jsonPath("$.error").value("Not Found"));

        verify(chatRoomService).getInvitePreview("invite-token-disabled");
    }

    @Test
    void getInvitePreview_shouldReturnNotFoundWhenInviteTokenDoesNotExist() throws Exception {
        when(chatRoomService.getInvitePreview("missing-token"))
                .thenThrow(new NotFoundException("Invite token not found"));

        mockMvc.perform(get("/api/v1/chatrooms/invite-preview/{token}", "missing-token"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.statusCode").value(404))
                .andExpect(jsonPath("$.message").value("Invite token not found"))
                .andExpect(jsonPath("$.error").value("Not Found"));

        verify(chatRoomService).getInvitePreview("missing-token");
    }

    private record ToggleBody(Boolean enabled) {}

    private record JoinBody(String inviteToken) {}
}
