import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MessageActionsSheetProps {
  selectedMessage: any;
  onReply: () => void;
  onForward: () => void;
  onPin: () => void;
  onRevoke: () => void;
  onDelete: () => void;
  onCopy: () => void;
  isGroupDissolved?: boolean;
}

export const MessageActionsSheet = forwardRef<
  BottomSheet,
  MessageActionsSheetProps
>(
  (
    {
      selectedMessage,
      onReply,
      onForward,
      onPin,
      onRevoke,
      onDelete,
      onCopy,
      isGroupDissolved,
    },
    ref,
  ) => {
    const snapPoints = useMemo(() => {
      if (isGroupDissolved) {
        return ["20%"];
      }
      return ["38%"];
    }, [isGroupDissolved]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    if (!selectedMessage) return null;

    const isMedia =
      selectedMessage.mediaItems?.length > 0 || !!selectedMessage.mediaUrl;

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
      >
        <BottomSheetView style={styles.sheetContainer}>
          {!isGroupDissolved && (
            <>
              <TouchableOpacity style={styles.sheetItem} onPress={onReply}>
                <Ionicons name="arrow-undo-outline" size={22} color="#475569" />
                <Text style={styles.sheetTextNormal}>Trả lời</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sheetItem} onPress={onCopy}>
                <Ionicons name="copy-outline" size={22} color="#475569" />
                <Text style={styles.sheetTextNormal}>
                  {isMedia ? "Sao chép liên kết ảnh" : "Sao chép tin nhắn"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sheetItem} onPress={onForward}>
                <Ionicons name="arrow-redo-outline" size={22} color="#475569" />
                <Text style={styles.sheetTextNormal}>Chuyển tiếp</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sheetItem} onPress={onPin}>
                <Ionicons name="pin-outline" size={22} color="#475569" />
                <Text style={styles.sheetTextNormal}>Ghim tin nhắn</Text>
              </TouchableOpacity>

              <View style={styles.separator} />

              <TouchableOpacity style={styles.sheetItem} onPress={onRevoke}>
                <Ionicons name="return-up-back" size={22} color="#ef4444" />
                <Text style={styles.sheetTextDanger}>Thu hồi tin nhắn</Text>
              </TouchableOpacity>
            </>
          )}

          {isGroupDissolved && <View style={styles.separator} />}

          <TouchableOpacity style={styles.sheetItem} onPress={onDelete}>
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
            <Text style={styles.sheetTextDanger}>Xóa tin nhắn</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  sheetContainer: { paddingHorizontal: 20, paddingVertical: 10 },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  sheetTextNormal: {
    fontSize: 16,
    marginLeft: 12,
    color: "#1e293b",
    fontWeight: "500",
  },
  sheetTextDanger: {
    fontSize: 16,
    marginLeft: 12,
    color: "#ef4444",
    fontWeight: "500",
  },
  separator: { height: 1, backgroundColor: "#EEE", marginVertical: 8 },
});

MessageActionsSheet.displayName = "MessageActionsSheet";
