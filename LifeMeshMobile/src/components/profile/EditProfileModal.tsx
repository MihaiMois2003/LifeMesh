// src/components/profile/EditProfileModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../shared/constants/theme";
import { AnimatedPressable } from "../ui/AnimatedPressable";
import { AnimatedInput } from "../ui/AnimatedInput";
import { AnimatedButton } from "../ui/AnimatedButton";

const { width, height } = Dimensions.get("window");

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  address: string | null;
}

interface EditProfileModalProps {
  isVisible: boolean;
  user: User;
  onClose: () => void;
  onSave: (userData: Partial<User>) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isVisible,
  user,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [bio, setBio] = useState(user.bio || "");
  const [address, setAddress] = useState(user.address || "");

  // Animation values
  const slideAnimation = useSharedValue(0);
  const overlayAnimation = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      overlayAnimation.value = withTiming(1, { duration: 300 });
      slideAnimation.value = withSpring(1, { damping: 15 });
    } else {
      slideAnimation.value = withTiming(0, { duration: 300 });
      overlayAnimation.value = withTiming(0, { duration: 300 });
    }
  }, [isVisible]);

  useEffect(() => {
    // Reset form when user changes
    setDisplayName(user.displayName || "");
    setBio(user.bio || "");
    setAddress(user.address || "");
  }, [user]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayAnimation.value,
    pointerEvents: isVisible ? "auto" : "none",
  }));

  const slideStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      slideAnimation.value,
      [0, 1],
      [height, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  const handleSave = async () => {
    try {
      setIsLoading(true);

      const updatedData = {
        displayName: displayName.trim() || null,
        bio: bio.trim() || null,
        address: address.trim() || null,
      };

      await onSave(updatedData);
      Alert.alert("Success", "Profile updated successfully!");
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges =
    displayName !== (user.displayName || "") ||
    bio !== (user.bio || "") ||
    address !== (user.address || "");

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <StatusBar style="dark" backgroundColor="rgba(0,0,0,0.5)" />

      <Animated.View style={[styles.container, slideStyle]}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Header */}
          <View
            style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}
          >
            <AnimatedPressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </AnimatedPressable>
            <Text style={styles.title}>Edit Profile</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.form}>
              {/* Email (Read-only) */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Email</Text>
                <View style={styles.readOnlyField}>
                  <Text style={styles.readOnlyText}>{user.email}</Text>
                  <Ionicons
                    name="lock-closed"
                    size={16}
                    color={Colors.text.tertiary}
                  />
                </View>
              </View>

              {/* Username (Read-only) */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Username</Text>
                <View style={styles.readOnlyField}>
                  <Text style={styles.readOnlyText}>@{user.username}</Text>
                  <Ionicons
                    name="lock-closed"
                    size={16}
                    color={Colors.text.tertiary}
                  />
                </View>
              </View>

              {/* Display Name */}
              <AnimatedInput
                label="Display Name"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your display name"
                icon="✨"
                maxLength={50}
              />

              {/* Bio */}
              <AnimatedInput
                label="Bio"
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                multiline
                numberOfLines={4}
                maxLength={200}
                icon="📝"
              />

              {/* Address */}
              <AnimatedInput
                label="Location"
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your location"
                icon="📍"
                maxLength={100}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View
            style={[
              styles.footer,
              { paddingBottom: insets.bottom + Spacing.lg },
            ]}
          >
            <AnimatedButton
              title="Save Changes"
              onPress={handleSave}
              loading={isLoading}
              disabled={!hasChanges}
              icon="💾"
              style={styles.saveButton}
            />
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
    marginTop: 50,
    ...Shadows.xl,
  },
  keyboardView: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[100],
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: Typography.fontSizes["2xl"],
    fontWeight: Typography.fontWeights.bold as any,
    color: Colors.text.primary,
  },
  placeholder: {
    width: 40,
  },

  // Content
  content: {
    flex: 1,
  },
  form: {
    padding: Spacing.xl,
  },
  fieldContainer: {
    marginBottom: Spacing.xl,
  },
  fieldLabel: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium as any,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  readOnlyField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  readOnlyText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text.secondary,
  },
  textAreaContainer: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary[200],
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  textAreaEmoji: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  textAreaContent: {
    flex: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.text.tertiary,
    textAlign: "right",
    marginTop: Spacing.sm,
  },

  // Footer
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.primary[100],
  },
  saveButton: {
    marginBottom: 0,
  },
});
