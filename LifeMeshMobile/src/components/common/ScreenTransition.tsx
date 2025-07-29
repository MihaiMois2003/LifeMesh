import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../shared/constants/theme";

const { width, height } = Dimensions.get("window");

interface ScreenTransitionProps {
  children: React.ReactNode;
  animationType?: "slideUp" | "slideRight" | "fade" | "scale";
}

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  children,
  animationType = "slideUp",
}) => {
  const translateY = useSharedValue(height);
  const translateX = useSharedValue(width);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    switch (animationType) {
      case "slideUp":
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 90,
        });
        opacity.value = withTiming(1, { duration: 300 });
        break;

      case "slideRight":
        translateX.value = withSpring(0, {
          damping: 15,
          stiffness: 100,
        });
        opacity.value = withTiming(1, { duration: 200 });
        break;

      case "fade":
        opacity.value = withTiming(1, {
          duration: 500,
          easing: Easing.out(Easing.quad),
        });
        break;

      case "scale":
        scale.value = withSpring(1, {
          damping: 12,
          stiffness: 150,
        });
        opacity.value = withTiming(1, { duration: 300 });
        break;
    }
  }, [animationType]);

  const animatedStyle = useAnimatedStyle(() => {
    switch (animationType) {
      case "slideUp":
        return {
          transform: [{ translateY: translateY.value }],
          opacity: opacity.value,
        };

      case "slideRight":
        return {
          transform: [{ translateX: translateX.value }],
          opacity: opacity.value,
        };

      case "fade":
        return {
          opacity: opacity.value,
        };

      case "scale":
        return {
          transform: [{ scale: scale.value }],
          opacity: opacity.value,
        };

      default:
        return {};
    }
  });

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={[Colors.primary[50], Colors.primary[100], Colors.white]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Animated Content */}
      <Animated.View style={[styles.content, animatedStyle]}>
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
});
