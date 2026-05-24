// Goat-JobHunter-Mobile-FE/components/call/CallWindow.tsx
import React, { useMemo } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { RenderModeType, RtcSurfaceView } from "react-native-agora";
import { CallParticipantTile } from "./CallParticipantTile";
import { CallTypeEnum, ChatRoomType } from "@/types/enum";
import type { CallSession } from "@/types/model";
import { computeAgoraUid } from "@/services/callRtc/agoraUid";

const { width } = Dimensions.get("window");

interface CallWindowProps {
  currentCall: CallSession;
  currentUserId: number;
  callError: string | null;
  rtcConnectionState: string;
  localAudioEnabled: boolean;
  localVideoEnabled: boolean;
  speakerEnabled: boolean;
  participantMediaStates: Record<number, { audioActive: boolean; videoActive: boolean }>;
  isEndingCall: boolean;
  isLeavingCall: boolean;
  canEndCall: boolean;
  handleEndCall: () => void;
  handleLeaveCall: () => void;
  handleToggleLocalAudio: () => void;
  handleToggleLocalVideo: () => void;
  handleToggleSpeaker: () => void;
  handleSwitchCamera: () => void;
  onMinimize: () => void;
}

export const CallWindow = React.memo(function CallWindow({
  currentCall,
  currentUserId,
  callError,
  rtcConnectionState,
  localAudioEnabled,
  localVideoEnabled,
  speakerEnabled,
  participantMediaStates,
  isEndingCall,
  isLeavingCall,
  canEndCall,
  handleEndCall,
  handleLeaveCall,
  handleToggleLocalAudio,
  handleToggleLocalVideo,
  handleToggleSpeaker,
  handleSwitchCamera,
  onMinimize,
}: CallWindowProps) {
  const joinedParticipants = useMemo(() => {
    return currentCall.participants.filter((p) => !p.leftAt);
  }, [currentCall.participants]);

  const sortedParticipants = useMemo(() => {
    return [...joinedParticipants].sort((a, b) => {
      if (a.account.accountId === currentUserId) return -1;
      if (b.account.accountId === currentUserId) return 1;
      return (a.account.fullName || a.account.username).localeCompare(
        b.account.fullName || b.account.username,
      );
    });
  }, [currentUserId, joinedParticipants]);

  const isGroupCall = currentCall.chatRoomType === ChatRoomType.GROUP;
  const showVideo = currentCall.callType === CallTypeEnum.VIDEO;
  const channelName = currentCall.rtc?.channelName ?? currentCall.agoraChannelName;

  const remoteParticipant = sortedParticipants.find(
    (p) => p.account.accountId !== currentUserId,
  );
  const remoteUid = remoteParticipant
    ? computeAgoraUid(remoteParticipant.account.accountId, currentCall.sessionId, channelName)
    : null;
  const remoteMediaState = remoteParticipant
    ? (participantMediaStates[remoteParticipant.account.accountId] ?? { audioActive: false, videoActive: false })
    : { audioActive: false, videoActive: false };

  const connectionLabel =
    rtcConnectionState === "connected"
      ? "Đã kết nối"
      : rtcConnectionState === "connecting"
        ? "Đang kết nối"
        : rtcConnectionState === "reconnecting"
          ? "Đang kết nối lại"
          : rtcConnectionState;

  const renderGroupGrid = () => (
    <ScrollView style={styles.groupScroll} contentContainerStyle={styles.groupGrid}>
      {sortedParticipants.map((participant) => {
        const isMe = participant.account.accountId === currentUserId;
        const mediaState = isMe
          ? { audioActive: localAudioEnabled, videoActive: localVideoEnabled }
          : (participantMediaStates[participant.account.accountId] ?? { audioActive: false, videoActive: false });
        const uid = isMe
          ? 0
          : computeAgoraUid(participant.account.accountId, currentCall.sessionId, channelName);
        return (
          <CallParticipantTile
            key={participant.account.accountId}
            accountId={participant.account.accountId}
            fullName={participant.account.fullName}
            avatar={participant.account.avatar}
            isCurrentUser={isMe}
            audioActive={mediaState.audioActive}
            videoActive={mediaState.videoActive}
            agoraUid={uid}
            showVideo={showVideo}
            style={styles.groupTile}
          />
        );
      })}
    </ScrollView>
  );

  const renderDirectVideo = () => (
    <View style={styles.directVideoStage}>
      <View style={styles.remoteStage}>
        {remoteUid !== null && remoteMediaState.videoActive ? (
          <RtcSurfaceView
            style={styles.remoteVideo}
            canvas={{ uid: remoteUid, renderMode: RenderModeType.RenderModeHidden }}
          />
        ) : (
          <View style={styles.remoteFallback}>
            <Image
              source={{ uri: remoteParticipant?.account.avatar || currentCall.chatRoomAvatar || "https://via.placeholder.com/160" }}
              style={styles.remoteFallbackAvatar}
            />
            <Text style={styles.remoteFallbackName}>
              {remoteParticipant?.account.fullName || currentCall.chatRoomName || "Đối phương"}
            </Text>
            <Text style={styles.remoteFallbackCaption}>Đối phương chưa bật camera</Text>
          </View>
        )}
      </View>

      <View style={styles.localPreview}>
        {localVideoEnabled ? (
          <RtcSurfaceView
            style={styles.localVideo}
            canvas={{ uid: 0, renderMode: RenderModeType.RenderModeHidden }}
          />
        ) : (
          <View style={styles.localPreviewFallback}>
            <Ionicons name="videocam-off" size={24} color="#D7E4FF" />
            <Text style={styles.localPreviewText}>Camera tắt</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderVoiceLayout = () => (
    <View style={styles.voiceBody}>
      {sortedParticipants.map((participant) => {
        const isMe = participant.account.accountId === currentUserId;
        const mediaState = isMe
          ? { audioActive: localAudioEnabled, videoActive: false }
          : (participantMediaStates[participant.account.accountId] ?? { audioActive: false, videoActive: false });
        return (
          <View key={participant.account.accountId} style={styles.voiceCard}>
            <Image
              source={{ uri: participant.account.avatar || "https://via.placeholder.com/160" }}
              style={styles.voiceAvatar}
            />
            <Text style={styles.voiceName}>
              {isMe ? "Bạn" : participant.account.fullName}
            </Text>
            <Text style={styles.voiceSubtitle}>
              {mediaState.audioActive ? "Mic đang bật" : "Mic đang tắt"}
            </Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topLabel}>
            {showVideo ? "Cuộc gọi video" : "Cuộc gọi thoại"}
          </Text>
          <Text style={styles.topTitle} numberOfLines={1}>
            {currentCall.chatRoomName || "Phòng chat"}
          </Text>
          <Text style={styles.topStatus}>{connectionLabel}</Text>
        </View>
        <Pressable style={styles.closeChip} onPress={onMinimize}>
          <Ionicons name="chevron-down" size={20} color="#E5EEFF" />
        </Pressable>
      </View>

      {/* Main content */}
      {showVideo
        ? isGroupCall
          ? renderGroupGrid()
          : renderDirectVideo()
        : renderVoiceLayout()}

      {/* Error banner */}
      {callError || rtcConnectionState === "failed" ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{callError || "Kết nối thất bại"}</Text>
        </View>
      ) : null}

      {/* Control bar */}
      <View style={styles.controls}>
        <Pressable
          style={[styles.controlButton, !localAudioEnabled && styles.controlButtonMuted]}
          onPress={handleToggleLocalAudio}
        >
          <Ionicons name={localAudioEnabled ? "mic" : "mic-off"} size={22} color="#FFFFFF" />
        </Pressable>

        <Pressable style={styles.controlButton} onPress={handleToggleSpeaker}>
          <Ionicons name={speakerEnabled ? "volume-high" : "volume-low"} size={22} color="#FFFFFF" />
        </Pressable>

        {showVideo && (
          <>
            <Pressable
              style={[styles.controlButton, !localVideoEnabled && styles.controlButtonMuted]}
              onPress={handleToggleLocalVideo}
            >
              <Ionicons name={localVideoEnabled ? "videocam" : "videocam-off"} size={22} color="#FFFFFF" />
            </Pressable>
            <Pressable style={styles.controlButton} onPress={handleSwitchCamera}>
              <Ionicons name="camera-reverse" size={22} color="#FFFFFF" />
            </Pressable>
          </>
        )}

        {isGroupCall && (
          <Pressable
            style={[styles.controlButton, styles.leaveButton]}
            onPress={handleLeaveCall}
          >
            <Ionicons name="exit-outline" size={22} color="#FFFFFF" />
          </Pressable>
        )}

        <Pressable
          style={[styles.controlButton, styles.endButton]}
          onPress={canEndCall ? handleEndCall : handleLeaveCall}
        >
          <Ionicons name="call" size={22} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#08101B" },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topLabel: { fontSize: 12, textTransform: "uppercase", letterSpacing: 1.1, color: "#7FB1FF", fontWeight: "700" },
  topTitle: { marginTop: 8, fontSize: 24, fontWeight: "800", color: "#FFFFFF", maxWidth: width - 100 },
  topStatus: { marginTop: 6, fontSize: 14, color: "#C3D5F6" },
  closeChip: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  groupScroll: { flex: 1, marginTop: 18 },
  groupGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 16, paddingBottom: 24 },
  groupTile: { width: (width - 44) / 2, height: 220 },
  directVideoStage: { flex: 1, marginTop: 18, paddingHorizontal: 16, paddingBottom: 24 },
  remoteStage: { flex: 1, borderRadius: 28, overflow: "hidden", backgroundColor: "#101826" },
  remoteVideo: { flex: 1 },
  remoteFallback: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#101826" },
  remoteFallbackAvatar: { width: 124, height: 124, borderRadius: 62 },
  remoteFallbackName: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },
  remoteFallbackCaption: { color: "#B3C4E1", fontSize: 14 },
  localPreview: { position: "absolute", right: 30, bottom: 42, width: 128, height: 186, borderRadius: 22, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", backgroundColor: "#0F1724" },
  localVideo: { flex: 1 },
  localPreviewFallback: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  localPreviewText: { color: "#D7E4FF", fontSize: 12, fontWeight: "600" },
  voiceBody: { flex: 1, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 18, paddingHorizontal: 16 },
  voiceCard: { width: (width - 52) / 2, borderRadius: 28, backgroundColor: "#101826", paddingVertical: 26, paddingHorizontal: 16, alignItems: "center" },
  voiceAvatar: { width: 120, height: 120, borderRadius: 60 },
  voiceName: { marginTop: 16, color: "#FFFFFF", fontSize: 18, fontWeight: "700", textAlign: "center" },
  voiceSubtitle: { marginTop: 8, color: "#B3C4E1", fontSize: 13 },
  errorBanner: { marginHorizontal: 16, marginBottom: 14, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, backgroundColor: "rgba(220,38,38,0.18)", borderWidth: 1, borderColor: "rgba(248,113,113,0.28)" },
  errorText: { color: "#FECACA", fontSize: 13, textAlign: "center" },
  controls: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingBottom: 18 },
  controlButton: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center", backgroundColor: "#1B2A40" },
  controlButtonMuted: { backgroundColor: "#7C2D12" },
  leaveButton: { backgroundColor: "#374151" },
  endButton: { backgroundColor: "#DC2626" },
});
