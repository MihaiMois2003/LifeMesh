// src/components/ui/common/ModalHeader.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../../../shared/constants/theme";

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  rightButton?: {
    text: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onClose,
  rightButton,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={24} color={Colors.text.primary} />
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      {rightButton ? (
        <TouchableOpacity
          style={[
            styles.actionButton,
            !rightButton.disabled && styles.actionButtonActive,
          ]}
          onPress={rightButton.onPress}
          disabled={rightButton.disabled || rightButton.loading}
        >
          <Text
            style={[
              styles.actionText,
              !rightButton.disabled && styles.actionTextActive,
            ]}
          >
            {rightButton.loading ? "Loading..." : rightButton.text}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary[100],
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold as any,
    color: Colors.text.primary,
  },
  actionButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondary[200],
  },
  actionButtonActive: { backgroundColor: Colors.primary[600] },
  actionText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold as any,
    color: Colors.text.tertiary,
  },
  actionTextActive: { color: Colors.white },
  spacer: { width: 40 },
});
