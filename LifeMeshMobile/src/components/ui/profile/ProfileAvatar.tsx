// src/components/ui/profile/ProfileAvatar.tsx (Updated)
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../../shared/constants/theme";

interface ProfileAvatarProps {
  imageUri?: string | null;
  size?: number;
  showOnlineStatus?: boolean;
  showEditButton?: boolean;
  onAvatarUpdate?: (newAvatarUrl: string) => void; // 🆕 Callback for avatar updates
  authToken?: string; // 🆕 JWT token for API calls
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  imageUri,
  size = 100,
  showOnlineStatus = false,
  showEditButton = true,
  onAvatarUpdate,
  authToken,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const scale = useSharedValue(1);
  const pulseAnimation = useSharedValue(1);

  // 🔄 Pulse animation for online status
  React.useEffect(() => {
    if (showOnlineStatus) {
      pulseAnimation.value = withRepeat(
        withTiming(1.2, { duration: 1500 }),
        -1,
        true
      );
    }
  }, [showOnlineStatus]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleAvatarPress = async () => {
    console.log("🖼️ Avatar pressed!"); // Debug log
    console.log("🔧 showEditButton:", showEditButton);
    console.log("🔑 authToken:", authToken ? "exists" : "missing");
    if (!showEditButton || !authToken) {
      console.log(
        "❌ Avatar press blocked - showEditButton:",
        showEditButton,
        "authToken:",
        !!authToken
      );
      return;
    }

    try {
      // 1. 📱 Request permissions
      console.log("📱 Requesting permissions...");
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("📱 Permission status:", status);
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant photo library access to change your avatar"
        );
        return;
      }
      console.log("🖼️ Opening image picker...");
      // 2. 🖼️ Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 0.8, // Compress image
      });

      console.log("📸 Image picker result:", result);
      if (!result.canceled && result.assets[0]) {
        console.log("📸 Image selected:", result.assets[0].uri);
        await uploadAvatar(result.assets[0].uri);
      } else {
        console.log("❌ Image selection canceled or failed");
        Alert.alert("No Image Selected", "Please select an image to upload.");
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to open image picker");
    }
  };

  const uploadAvatar = async (imageUri: string) => {
    try {
      setIsUploading(true);

      // 3. 📁 Create form data
      const formData = new FormData();
      formData.append("avatar", {
        uri: imageUri,
        type: "image/jpeg",
        name: "avatar.jpg",
      } as any);

      // 4. 🌐 Upload to backend
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/avatar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        // 5. ✅ Success - update local state
        Alert.alert("Success", "Avatar updated successfully!");
        if (onAvatarUpdate) {
          onAvatarUpdate(result.data.avatarUrl);
        }
      } else {
        // 6. ❌ Handle API errors
        Alert.alert("Upload Failed", result.error || "Failed to update avatar");
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      Alert.alert("Error", "Failed to upload avatar. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const avatarRadius = size / 2;
  const editButtonSize = size * 0.25;
  const statusSize = size * 0.2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleAvatarPress}
        activeOpacity={0.9}
        disabled={isUploading}
      >
        <Animated.View style={[styles.avatarWrapper, animatedStyle]}>
          {/* Avatar Ring */}
          <View
            style={[
              styles.avatarRing,
              {
                width: size + 8,
                height: size + 8,
                borderRadius: avatarRadius + 4,
              },
            ]}
          />

          {/* Avatar */}
          <View
            style={[
              styles.avatar,
              {
                width: size,
                height: size,
                borderRadius: avatarRadius,
              },
            ]}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={[
                  styles.avatarImage,
                  {
                    width: size,
                    height: size,
                    borderRadius: avatarRadius,
                  },
                ]}
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  {
                    width: size,
                    height: size,
                    borderRadius: avatarRadius,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.avatarPlaceholderText,
                    { fontSize: size * 0.4 },
                  ]}
                >
                  👤
                </Text>
              </View>
            )}

            {/* 🔄 Loading overlay */}
            {isUploading && (
              <View
                style={[styles.loadingOverlay, { borderRadius: avatarRadius }]}
              >
                <Text style={styles.loadingText}>⏳</Text>
              </View>
            )}
          </View>

          {/* Online Status */}
          {showOnlineStatus && (
            <Animated.View
              style={[
                styles.onlineStatus,
                pulseStyle,
                {
                  width: statusSize,
                  height: statusSize,
                  borderRadius: statusSize / 2,
                  bottom: size * 0.1,
                  right: size * 0.1,
                },
              ]}
            />
          )}

          {/* Edit Button */}
          {showEditButton && !isUploading && (
            <View
              style={[
                styles.editButton,
                {
                  width: editButtonSize,
                  height: editButtonSize,
                  borderRadius: editButtonSize / 2,
                  bottom: size * 0.05,
                  right: size * 0.05,
                },
              ]}
            >
              <Ionicons
                name="camera"
                size={editButtonSize * 0.5}
                color={Colors.white}
              />
            </View>
          )}

          {/* Upload progress indicator */}
          {isUploading && (
            <View
              style={[
                styles.editButton,
                {
                  width: editButtonSize,
                  height: editButtonSize,
                  borderRadius: editButtonSize / 2,
                  bottom: size * 0.05,
                  right: size * 0.05,
                  backgroundColor: Colors.accent[500],
                },
              ]}
            >
              <Ionicons
                name="cloud-upload"
                size={editButtonSize * 0.5}
                color={Colors.white}
              />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRing: {
    position: "absolute",
    backgroundColor: Colors.white,
    ...Shadows.lg,
  },
  avatar: {
    backgroundColor: Colors.primary[100],
    overflow: "hidden",
    position: "relative",
  },
  avatarImage: {
    resizeMode: "cover",
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primary[200],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    color: Colors.primary[600],
  },
  onlineStatus: {
    position: "absolute",
    backgroundColor: Colors.success,
    borderWidth: 3,
    borderColor: Colors.white,
    ...Shadows.md,
  },
  editButton: {
    position: "absolute",
    backgroundColor: Colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.white,
    ...Shadows.lg,
  },
  // 🆕 NEW: Loading states
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 24,
    color: Colors.white,
  },
});
