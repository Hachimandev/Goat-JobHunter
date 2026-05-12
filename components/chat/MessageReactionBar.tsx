import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MessageReactionUsersModal } from './MessageReactionUsersModal';

interface ReactionGroup {
  emoji: string;
  count: number;
  users: {
    accountId: number;
    fullName: string;
    username: string;
    avatar: string;
    reactedAt: string;
  }[];
}

interface Props {
  reactions: ReactionGroup[];
  currentUserId?: number;
  onReactionClick: (emoji: string) => void;
}

export const MessageReactionBar = ({ reactions, currentUserId, onReactionClick }: Props) => {
  const [sel, setSel] = useState<string | null>(null);

  if (!reactions?.length) return null;

  const visible = reactions.slice(0, 5);

  return (
    <>
      <View style={styles.container}>
        {visible.map((group) => {
          const own = group.users.some((u) => u.accountId === currentUserId);
          return (
            <TouchableOpacity
              key={group.emoji}
              style={[styles.badge, own && styles.badgeActive]}
              onPress={() => (own ? onReactionClick(group.emoji) : setSel(group.emoji))}
            >
              <Text style={styles.emoji}>{group.emoji}</Text>
              <Text style={[styles.count, own && styles.countActive]}>{group.count}</Text>
            </TouchableOpacity>
          );
        })}
        {reactions.length > 5 && (
          <Text style={styles.overflow}>+{reactions.length - 5}</Text>
        )}
      </View>
      <MessageReactionUsersModal
        visible={sel !== null}
        onClose={() => setSel(null)}
        emoji={sel || ''}
        users={reactions.find((r) => r.emoji === sel)?.users || []}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  badgeActive: {
    backgroundColor: 'rgba(0,132,255,0.1)',
    borderColor: 'rgba(0,132,255,0.3)',
  },
  emoji: {
    fontSize: 14,
    marginRight: 4,
  },
  count: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  countActive: {
    color: '#0084FF',
  },
  overflow: {
    fontSize: 12,
    color: '#999',
  },
});
