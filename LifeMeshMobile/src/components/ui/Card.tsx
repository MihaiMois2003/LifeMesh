// src/components/ui/Card.tsx
import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Colors, BorderRadius, Shadows } from "../../shared/constants/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 20,
}) => <View style={[styles.card, { padding }, style]}>{children}</View>;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    ...Shadows.md,
  },
});
