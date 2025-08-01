// src/components/ui/common/Card.tsx
import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import {
  Colors,
  BorderRadius,
  Shadows,
  Spacing,
} from "../../../shared/constants/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  variant?: "default" | "elevated" | "outlined";
  backgroundColor?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = Spacing.xl,
  variant = "default",
  backgroundColor = Colors.white,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case "elevated":
        return { ...Shadows.lg };
      case "outlined":
        return {
          borderWidth: 1,
          borderColor: Colors.primary[200],
          ...Shadows.sm,
        };
      default:
        return { ...Shadows.md };
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          padding,
        },
        getVariantStyle(),
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
  },
});
