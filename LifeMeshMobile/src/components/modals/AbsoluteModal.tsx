// src/components/modals/AbsoluteModal.tsx
import React, { useEffect, ReactNode } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Colors, BorderRadius, Shadows } from "../../shared/constants/theme";

const { height } = Dimensions.get("window");

interface AbsoluteModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: number;
  dismissible?: boolean;
}

export const AbsoluteModal: React.FC<AbsoluteModalProps> = ({
  visible,
  onClose,
  children,
  maxHeight = height * 0.9,
  dismissible = true,
}) => {
  const overlayOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(height);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 300 });
      modalTranslateY.value = withSpring(0, { damping: 20, stiffness: 90 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 200 });
      modalTranslateY.value = withTiming(height, { duration: 300 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: modalTranslateY.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <TouchableOpacity
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={dismissible ? onClose : undefined}
        />

        <Animated.View
          style={[styles.modalContainer, modalStyle, { maxHeight }]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            {children}
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  overlayTouch: { flex: 1 },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
    minHeight: height * 0.6,
    ...Shadows.xl,
  },
  keyboardView: { flex: 1 },
});
