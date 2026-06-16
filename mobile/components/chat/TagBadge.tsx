import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Tag } from "@/types/model";

interface TagBadgeProps {
  tag?: Tag;
  size?: "small" | "medium" | "large";
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  size = "small",
}) => {
  if (!tag) return null;

  const sizeStyles = {
    small: {
      padding: 4,
      paddingHorizontal: 8,
      fontSize: 11,
    },
    medium: {
      padding: 6,
      paddingHorizontal: 10,
      fontSize: 12,
    },
    large: {
      padding: 8,
      paddingHorizontal: 12,
      fontSize: 13,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: tag.color + "20",
          paddingVertical: currentSize.padding,
          paddingHorizontal: currentSize.paddingHorizontal,
        },
      ]}
    >
      <View
        style={[
          styles.colorDot,
          {
            backgroundColor: tag.color,
          },
        ]}
      />
      <Text
        style={[
          styles.text,
          {
            fontSize: currentSize.fontSize,
            color: tag.color,
          },
        ]}
        numberOfLines={1}
      >
        {tag.name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
  },
  colorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontWeight: "500",
  },
});
