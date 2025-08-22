import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../../shared/constants/theme";

interface AnimatedInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
  icon?: string; // Emoji icon
}

export const AnimatedInput: React.FC<AnimatedInputProps> = ({
  label,
  error,
  containerStyle,
  isPassword = false,
  icon,
  value,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Animation values
  const labelPosition = useSharedValue(0);
  const labelScale = useSharedValue(1);
  const borderColor = useSharedValue(0);
  const iconScale = useSharedValue(0);

  // Update animations based on focus and value
  useEffect(() => {
    const shouldFloatLabel = isFocused || (value && value.length > 0);

    labelPosition.value = withSpring(shouldFloatLabel ? -25 : 0, {
      damping: 15,
      stiffness: 150,
    });

    labelScale.value = withSpring(shouldFloatLabel ? 0.8 : 1, {
      damping: 15,
      stiffness: 150,
    });

    borderColor.value = withTiming(isFocused ? 1 : 0, { duration: 200 });

    // Icon animation
    iconScale.value = withSpring(isFocused ? 1.1 : 1, {
      damping: 10,
      stiffness: 200,
    });
  }, [isFocused, value]);

  // Animated styles
  const labelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: labelPosition.value },
      { scale: labelScale.value },
    ],
  }));

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: Colors.primary[600],
    borderWidth: borderColor.value * 2 + 1,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.inputContainer, borderAnimatedStyle]}>
        {/* Icon */}
        {icon && (
          <Animated.Text style={[styles.icon, iconAnimatedStyle]}>
            {icon}
          </Animated.Text>
        )}

        {/* Input */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={isPassword && !isPasswordVisible}
            placeholderTextColor="transparent"
            {...props}
          />

          {/* Floating Label */}
          <Animated.Text style={[styles.label, labelAnimatedStyle]}>
            {label}
          </Animated.Text>
        </View>

        {/* Password Toggle */}
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeIcon}>
              {isPasswordVisible ? "🙈" : "👁️"}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Error Message */}
      {error && (
        <Animated.Text style={styles.errorText} entering={FadeIn.duration(300)}>
          ⚠️ {error}
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg, // ✅ Built-in spacing between inputs
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: BorderRadius["2xl"], // ✅ Much more rounded
    paddingHorizontal: Spacing.lg, // ✅ Increased padding
    minHeight: 64, // ✅ Increased height for futuristic look
    ...Shadows.md, // ✅ Better shadow
    borderWidth: 1,
    borderColor: Colors.primary[100], // ✅ Subtle border
  },
  icon: {
    fontSize: 22, // ✅ Larger icon
    marginRight: Spacing.md, // ✅ More spacing
  },
  inputWrapper: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
  },
  input: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text.primary,
    paddingVertical: Spacing.md,
    paddingTop: Spacing.lg, // Space for floating label
  },
  label: {
    position: "absolute",
    left: 0,
    top: Spacing.md + 4,
    fontSize: Typography.fontSizes.base,
    color: Colors.text.secondary,
    backgroundColor: Colors.white,
    paddingHorizontal: 4,
  },
  eyeButton: {
    padding: Spacing.sm,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.error,
    marginTop: Spacing.xs,
    marginLeft: Spacing.sm,
  },
});
