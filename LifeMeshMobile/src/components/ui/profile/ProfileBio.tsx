// src/components/ui/profile/ProfileBio.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../../shared/constants/theme";

interface ProfileBioProps {
  bio: string;
}

export const ProfileBio: React.FC<ProfileBioProps> = ({ bio }) => {
  return (
    <Animated.View entering={FadeInUp.springify()} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="person-outline"
            size={20}
            color={Colors.primary[600]}
          />
        </View>
        <Text style={styles.title}>About</Text>
      </View>

      <Text style={styles.bioText}>{bio}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold as any,
    color: Colors.text.primary,
  },
  bioText: {
    fontSize: Typography.fontSizes.base,
    lineHeight: Typography.lineHeights.base * 1.4,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeights.normal as any,
  },
});
