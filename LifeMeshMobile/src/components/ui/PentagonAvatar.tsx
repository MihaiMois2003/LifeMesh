// src/components/ui/PentagonAvatar.tsx
import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Shadows } from "../../shared/constants/theme";
import { AnimatedPressable } from "./AnimatedPressable";

interface PentagonAvatarProps {
  imageUri?: string | null;
  size?: number;
  onPress?: () => void;
}

export const PentagonAvatar: React.FC<PentagonAvatarProps> = ({
  imageUri,
  size = 120,
  onPress,
}) => {
  return (
    <AnimatedPressable onPress={onPress} style={{ width: size, height: size }}>
      <View style={[styles.container, { width: size, height: size }]}>
        {/* Pentagon shape using CSS transforms and rotation */}
        <View
          style={[
            styles.pentagonShape,
            {
              width: size * 0.9,
              height: size * 0.9,
              borderRadius: size * 0.2, // Much more rounded
            },
          ]}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={[
                styles.image,
                {
                  width: size * 0.9,
                  height: size * 0.9,
                  borderRadius: size * 0.2,
                },
              ]}
            />
          ) : (
            <View
              style={[
                styles.placeholder,
                {
                  width: size * 0.9,
                  height: size * 0.9,
                  borderRadius: size * 0.2,
                },
              ]}
            >
              <Ionicons
                name="person"
                size={size * 0.4}
                color={Colors.primary[600]}
              />
            </View>
          )}
        </View>

        {/* Camera icon */}
        <View
          style={[
            styles.cameraIcon,
            {
              bottom: size * 0.05,
              right: size * 0.05,
              width: size * 0.25,
              height: size * 0.25,
              borderRadius: size * 0.125,
            },
          ]}
        >
          <Ionicons name="camera" size={size * 0.12} color={Colors.white} />
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  pentagonShape: {
    backgroundColor: Colors.white,
    // Create pentagon-like shape using clip-path alternative
    transform: [{ rotate: "0deg" }],
    borderWidth: 4,
    borderColor: Colors.white,
    ...Shadows.xl,
    // Custom pentagon styling
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  image: {
    backgroundColor: Colors.primary[50],
  },
  placeholder: {
    backgroundColor: Colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  cameraIcon: {
    position: "absolute",
    backgroundColor: Colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadows.md,
  },
});
