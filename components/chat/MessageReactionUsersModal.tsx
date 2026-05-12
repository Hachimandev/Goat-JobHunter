import React from 'react';
import { Modal, View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface UserReactionInfo {
  accountId: number;
  fullName: string;
  username: string;
  avatar: string;
  reactedAt: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  emoji: string;
  users: UserReactionInfo[];
}

export const MessageReactionUsersModal = ({ visible, onClose, emoji, users }: Props) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
      <View style={styles.content} onStartShouldSetResponder={() => true}>
        <View style={styles.header}>
          <Text style={styles.emojiIcon}>{emoji}</Text>
          <Text style={styles.title}>People who reacted</Text>
        </View>
        <FlatList
          data={users}
          keyExtractor={(item) => item.accountId.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Image
                source={{ uri: item.avatar || 'https://via.placeholder.com/32' }}
                style={styles.avatar}
              />
              <View style={styles.info}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.username}>@{item.username}</Text>
              </View>
              <Text style={styles.time}>
                {formatDistanceToNow(new Date(item.reactedAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </Text>
            </View>
          )}
        />
      </View>
    </TouchableOpacity>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  emojiIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
  },
  username: {
    fontSize: 13,
    color: '#888',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
});
