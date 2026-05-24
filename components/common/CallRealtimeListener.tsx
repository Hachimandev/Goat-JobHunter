import { useSubscribeCallEventsQuery } from "@/services/chatRoom/call/callRealtimeApi";
import { useUser } from "@/hooks/useUser";
import { useLocalSearchParams } from "expo-router";

export default function CallRealtimeListener() {
  const { isSignedIn, user } = useUser();
  const params = useLocalSearchParams<{ id: string }>();
  const parsedChatRoomId = Number(params?.id);
  const hasValidChatRoomId = Number.isFinite(parsedChatRoomId) && parsedChatRoomId > 0;
  const skip = !isSignedIn || !user || !hasValidChatRoomId;

  useSubscribeCallEventsQuery(parsedChatRoomId, {
    skip,
  });

  if (skip) {
    return null;
  }

  return null;
}
