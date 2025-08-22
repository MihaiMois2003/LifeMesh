// src/components/ui/AnimatedPressable.tsx
import React from "react";
import { Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  EntryAnimationsValues,
  AnimatedProps,
} from "react-native-reanimated";

interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  scaleValue?: number;
  entering?: any; // Add this line
}

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  children,
  onPress,
  style,
  scaleValue = 0.95,
  entering, // Add this parameter
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(scaleValue);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View
        style={[animatedStyle, style]}
        entering={entering} // Add this line
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};
