// src/components/ui/common/FormInput.tsx
import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Colors, Typography, Spacing } from "../../../shared/constants/theme";

interface FormInputProps extends TextInputProps {
  label?: string;
  showCharacterCount?: boolean;
  maxLength?: number;
  error?: string;
  variant?: "title" | "content" | "regular";
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  showCharacterCount = false,
  maxLength,
  error,
  variant = "regular",
  value,
  style,
  ...props
}) => {
  const getInputStyle = () => {
    switch (variant) {
      case "title":
        return styles.titleInput;
      case "content":
        return styles.contentInput;
      default:
        return styles.regularInput;
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        style={[getInputStyle(), style]}
        placeholderTextColor={Colors.text.tertiary}
        value={value}
        maxLength={maxLength}
        {...props}
      />

      <View style={styles.footer}>
        {error && <Text style={styles.error}>{error}</Text>}
        {showCharacterCount && maxLength && (
          <Text style={styles.characterCount}>
            {(value || "").length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold as any,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  regularInput: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary[200],
    paddingVertical: Spacing.sm,
    minHeight: 40,
  },
  titleInput: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.semibold as any,
    color: Colors.text.primary,
    minHeight: 60,
    textAlignVertical: "top",
  },
  contentInput: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text.primary,
    minHeight: 120,
    lineHeight: Typography.lineHeights.base,
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  error: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.error,
  },
  characterCount: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.text.tertiary,
    marginLeft: "auto",
  },
});
