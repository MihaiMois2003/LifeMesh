// src/components/ui/PentagonAvatar.tsx
import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, {
  ClipPath,
  Polygon,
  Defs,
  Image as SvgImage,
} from "react-native-svg";
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
  // Calculate pentagon points for a perfect pentagon
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2.2; // Slightly smaller to add padding

  // Pentagon points (5 sides, starting from top) with more rounded corners
  const points = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2; // Start from top
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }

  const polygonPoints = points.join(" ");
  const cornerRadius = size * 0.15; // Much more rounded corners

  return (
    <AnimatedPressable onPress={onPress} style={{ width: size, height: size }}>
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} style={styles.svg}>
          <Defs>
            <ClipPath id="pentagonClip">
              <Polygon
                points={polygonPoints}
                rx={cornerRadius}
                ry={cornerRadius}
              />
            </ClipPath>
          </Defs>

          {imageUri ? (
            <SvgImage
              href={{ uri: imageUri }}
              width={size}
              height={size}
              clipPath="url(#pentagonClip)"
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <>
              {/* Background for placeholder */}
              <Polygon
                points={polygonPoints}
                fill={Colors.primary[50]}
                stroke={Colors.white}
                strokeWidth="4"
                rx={cornerRadius}
                ry={cornerRadius}
              />
            </>
          )}
        </Svg>

        {/* Placeholder icon if no image */}
        {!imageUri && (
          <View style={styles.iconContainer}>
            <Ionicons
              name="person"
              size={size * 0.4}
              color={Colors.primary[600]}
            />
          </View>
        )}

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
    ...Shadows.xl,
  },
  svg: {
    borderRadius: 30, // Much more rounded
    ...Shadows.lg,
  },
  iconContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
