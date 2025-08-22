// src/components/ui/profile/ProfileActions.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "../animated/AnimatedPressable";
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../../shared/constants/theme";

interface ProfileActionsProps {
  onEdit: () => void;
  onSettings: () => void;
  variant?: "header" | "compact";
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  onEdit,
  onSettings,
  variant = "header",
}) => {
  const isCompact = variant === "compact";
  const buttonSize = isCompact ? 32 : 40;
  const iconSize = isCompact ? 16 : 20;

  return (
    <View style={[styles.container, isCompact && styles.compactContainer]}>
      <AnimatedPressable
        onPress={onEdit}
        style={[
          styles.actionButton,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
          },
          isCompact ? styles.compactButton : styles.headerButton,
        ]}
      >
        <Ionicons
          name="create-outline"
          size={iconSize}
          color={isCompact ? Colors.primary[600] : Colors.white}
        />
      </AnimatedPressable>

      <AnimatedPressable
        onPress={onSettings}
        style={[
          styles.actionButton,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
          },
          isCompact ? styles.compactButton : styles.headerButton,
        ]}
      >
        <Ionicons
          name="settings-outline"
          size={iconSize}
          color={isCompact ? Colors.primary[600] : Colors.white}
        />
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  compactContainer: {
    gap: Spacing.xs,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    ...Shadows.sm,
  },
  compactButton: {
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
});
