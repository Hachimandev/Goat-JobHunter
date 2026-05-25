import React, { useEffect } from "react";
import {
  Alert,
  BackHandler,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useCallRoomActions } from "@/hooks/useCallRoomActions";
import { useUser } from "@/hooks/useUser";
import { CallWindow } from "@/components/call/CallWindow";
import { ChatRoomType } from "@/types/enum";
import { useSubscribeCallEventsQuery } from "@/services/chatRoom/call/callRealtimeApi";

export default function ActiveCallScreen() {
  const { user } = useUser();
  const {
    currentCall,
    callError,
    rtcConnectionState,
    localAudioEnabled,
    localVideoEnabled,
    speakerEnabled,
    participantMediaStates,
    handleEndCall,
    handleLeaveCall,
    handleToggleLocalAudio,
    handleToggleLocalVideo,
    handleToggleSpeaker,
    handleSwitchCamera,
  } = useCallRoomActions();

  const currentUserId = user?.accountId;

  // Keep WebSocket connected during active call to receive CALL_ENDED
  useSubscribeCallEventsQuery(currentCall?.chatRoomId ?? 0, {
    skip: !currentCall?.chatRoomId,
  });

  // Redirect if no active call
  useEffect(() => {
    if (!currentCall || !currentUserId) {
      if (router.canGoBack()) router.back();
      else router.replace("/(tabs)/chat");
    }
  }, [currentCall, currentUserId]);

  // Android back button
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (!currentCall) return false;
        const canEnd =
          currentCall.chatRoomType !== ChatRoomType.GROUP ||
          currentCall.initiatorAccountId === currentUserId;
        Alert.alert(
          "Thoát cuộc gọi?",
          canEnd
            ? "Bạn muốn rời hay kết thúc cuộc gọi?"
            : "Bạn muốn rời cuộc gọi?",
          [
            { text: "Hủy", style: "cancel" },
            {
              text: canEnd ? "Kết thúc" : "Rời",
              style: "destructive",
              onPress: () => {
                if (canEnd) void handleEndCall();
                else void handleLeaveCall();
              },
            },
          ],
        );
        return true;
      },
    );
    return () => subscription.remove();
  }, [currentCall, currentUserId, handleEndCall, handleLeaveCall]);

  if (!currentCall || !currentUserId) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  const isGroupCall = currentCall.chatRoomType === ChatRoomType.GROUP;
  const canEndCall =
    !isGroupCall || currentCall.initiatorAccountId === currentUserId;

  return (
    <SafeAreaView style={styles.container}>
      <CallWindow
        currentCall={currentCall}
        currentUserId={currentUserId}
        callError={callError}
        rtcConnectionState={rtcConnectionState}
        localAudioEnabled={localAudioEnabled}
        localVideoEnabled={localVideoEnabled}
        speakerEnabled={speakerEnabled}
        participantMediaStates={participantMediaStates}
        isEndingCall={false}
        isLeavingCall={false}
        canEndCall={canEndCall}
        handleEndCall={handleEndCall}
        handleLeaveCall={handleLeaveCall}
        handleToggleLocalAudio={handleToggleLocalAudio}
        handleToggleLocalVideo={handleToggleLocalVideo}
        handleToggleSpeaker={handleToggleSpeaker}
        handleSwitchCamera={handleSwitchCamera}
        onMinimize={() => {
          if (router.canGoBack()) router.back();
          else router.replace("/(tabs)/chat");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#08101B" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#08101B" },
  loadingText: { color: "#C3D5F6", fontSize: 16 },
});
