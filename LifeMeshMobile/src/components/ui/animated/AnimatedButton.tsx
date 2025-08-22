import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../../shared/constants/theme";

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: string; // Emoji icon
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  icon,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const buttonStyle = [
    styles.base,
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
  ];

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? Colors.white : Colors.primary[600]}
        />
      ) : (
        <>
          {icon && <Text style={styles.iconText}>{icon}</Text>}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </>
  );

  if (variant === "primary") {
    return (
      <AnimatedTouchableOpacity
        style={[animatedStyle, buttonStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        <LinearGradient
          colors={
            disabled
              ? [Colors.secondary[300], Colors.secondary[400]]
              : [Colors.primary[500], Colors.primary[600]] // ✅ Simpler 2-color gradient for better visibility
          }
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }} // ✅ Horizontal gradient for even color distribution
        >
          {renderContent()}
        </LinearGradient>
      </AnimatedTouchableOpacity>
    );
  }

  return (
    <AnimatedTouchableOpacity
      style={[
        animatedStyle,
        buttonStyle,
        variant === "secondary" && styles.secondary,
        variant === "outline" && styles.outline,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      {renderContent()}
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 28, // ✅ Fixed rounded value instead of calculation
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    overflow: "hidden",
    ...Shadows.lg,
    // ✅ Add futuristic glow effect with green tint
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 28, // ✅ Match the container border radius exactly
  },
  // Variants
  secondary: {
    backgroundColor: Colors.secondary[100],
    borderWidth: 1,
    borderColor: Colors.secondary[200],
    borderRadius: BorderRadius["2xl"], // ✅ Match primary button roundness
  },
  outline: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary[600],
    borderRadius: BorderRadius["2xl"], // ✅ Match primary button roundness
  },
  // Sizes
  small: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 40,
  },
  medium: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2, // ✅ Increased padding
    minHeight: 56, // ✅ Increased height for better proportions
  },
  large: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 64, // ✅ Increased height
  },
  // States
  disabled: {
    opacity: 0.5,
  },
  // Text styles
  text: {
    fontWeight: Typography.fontWeights.semibold as any,
    textAlign: "center",
  },
  primaryText: {
    color: Colors.white, // ✅ Ensure white text is visible
    fontSize: Typography.fontSizes.lg, // ✅ Make text larger
    fontWeight: Typography.fontWeights.bold as any, // ✅ Make text bolder
  },
  secondaryText: {
    color: Colors.secondary[700],
    fontSize: Typography.fontSizes.base,
  },
  outlineText: {
    color: Colors.primary[600],
    fontSize: Typography.fontSizes.base,
  },
  smallText: {
    fontSize: Typography.fontSizes.sm,
  },
  mediumText: {
    fontSize: Typography.fontSizes.lg, // ✅ Increased from base to lg
    fontWeight: Typography.fontWeights.semibold as any,
  },
  largeText: {
    fontSize: Typography.fontSizes.lg,
  },
  disabledText: {
    opacity: 0.7,
  },
  iconText: {
    fontSize: 18,
    marginRight: Spacing.xs,
  },
});
