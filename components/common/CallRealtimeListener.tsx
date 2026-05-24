import { useEffect, useRef } from "react";
import { useSubscribeCallEventsQuery } from "@/services/chatRoom/call/callRealtimeApi";
import { useUser } from "@/hooks/useUser";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { useAppSelector } from "@/lib/hooks";
import { selectIncomingCall } from "@/lib/features/callSlice";

export default function CallRealtimeListener() {
  const { isSignedIn, user } = useUser();
  const params = useGlobalSearchParams<{ id: string }>();
  const parsedChatRoomId = Number(params?.id);
  const hasValidChatRoomId = Number.isFinite(parsedChatRoomId) && parsedChatRoomId > 0;
  const skip = !isSignedIn || !user || !hasValidChatRoomId;

  useSubscribeCallEventsQuery(parsedChatRoomId, {
    skip,
  });

  const incomingCall = useAppSelector(selectIncomingCall);
  const router = useRouter();
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (incomingCall && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      router.push("/(call)/incoming-call");
    }

    if (!incomingCall) {
      hasNavigatedRef.current = false;
    }
  }, [incomingCall, router]);

  if (skip) {
    return null;
  }

  return null;
}
