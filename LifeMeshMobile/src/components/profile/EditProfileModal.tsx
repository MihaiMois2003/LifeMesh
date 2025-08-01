// src/components/profile/EditProfileModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
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
  FadeIn,
  SlideInRight,
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

  useEffect(() => {
    if (isVisible) {
      slideAnimation.value = withSpring(1, { damping: 15 });
    } else {
      slideAnimation.value = withTiming(0, { duration: 300 });
    }
  }, [isVisible]);

  useEffect(() => {
    // Reset form when user changes
    setDisplayName(user.displayName || "");
    setBio(user.bio || "");
    setAddress(user.address || "");
  }, [user]);

  const slideStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: slideAnimation.value === 1 ? 0 : 1000,
        },
      ],
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
    <View style={styles.fullScreenOverlay}>
      <StatusBar style="dark" backgroundColor={Colors.background.primary} />

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
              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors.text.primary}
              />
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
            <Animated.View entering={FadeIn.delay(200)} style={styles.form}>
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
              <Animated.View entering={SlideInRight.delay(300)}>
                <AnimatedInput
                  label="Display Name"
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter your display name"
                  icon="✨"
                  maxLength={50}
                />
              </Animated.View>

              {/* Bio */}
              <Animated.View entering={SlideInRight.delay(400)}>
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
              </Animated.View>

              {/* Address */}
              <Animated.View entering={SlideInRight.delay(500)}>
                <AnimatedInput
                  label="Location"
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter your location"
                  icon="📍"
                  maxLength={100}
                />
              </Animated.View>
            </Animated.View>
          </ScrollView>

          {/* Footer */}
          <Animated.View
            entering={FadeIn.delay(600)}
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
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background.primary,
    zIndex: 1000,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
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
    backgroundColor: Colors.background.primary,
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

  // Footer
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.primary[100],
  },
  saveButton: {
    marginBottom: 0,
  },
});
