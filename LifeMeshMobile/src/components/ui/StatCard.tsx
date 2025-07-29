// src/components/ui/StatCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Typography, Spacing } from "../../shared/constants/theme";
import { Card } from "./Card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => (
  <Card style={styles.container} padding={16}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </Card>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  icon: {
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold as any,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  label: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.text.secondary,
    textAlign: "center",
  },
});
