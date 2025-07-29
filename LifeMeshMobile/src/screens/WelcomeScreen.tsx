import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../shared/constants/theme";

const { width, height } = Dimensions.get("window");

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  // Animation values
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(50);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(30);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(40);
  const floatingElement1 = useSharedValue(0);
  const floatingElement2 = useSharedValue(0);
  const floatingElement3 = useSharedValue(0);

  // Start animations when component mounts
  useEffect(() => {
    // Logo animation
    logoScale.value = withSpring(1, { damping: 8, stiffness: 100 });
    logoRotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );

    // Text animations with delays
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    titleTranslateY.value = withDelay(300, withSpring(0, { damping: 10 }));

    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    subtitleTranslateY.value = withDelay(600, withSpring(0, { damping: 10 }));

    // Button animations
    buttonOpacity.value = withDelay(900, withTiming(1, { duration: 800 }));
    buttonTranslateY.value = withDelay(900, withSpring(0, { damping: 10 }));

    // Floating elements
    floatingElement1.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    floatingElement2.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    floatingElement3.value = withRepeat(
      withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const floatingElement1Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatingElement1.value * 20 },
      { translateX: floatingElement1.value * 10 },
    ],
  }));

  const floatingElement2Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatingElement2.value * -15 },
      { translateX: floatingElement2.value * -8 },
    ],
  }));

  const floatingElement3Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatingElement3.value * 25 },
      { translateX: floatingElement3.value * 12 },
    ],
  }));

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primary[800]}
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={[
          Colors.primary[600],
          Colors.primary[800],
          Colors.secondary[900],
        ]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating Background Elements */}
      <Animated.View style={[styles.floatingElement1, floatingElement1Style]} />
      <Animated.View style={[styles.floatingElement2, floatingElement2Style]} />
      <Animated.View style={[styles.floatingElement3, floatingElement3Style]} />

      {/* Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoInner}>
            <Text style={styles.logoEmoji}>🌍</Text>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.Text style={[styles.title, titleAnimatedStyle]}>
          LifeMesh
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
          Connect with your local community.{"\n"}
          Share, help, and grow together.
        </Animated.Text>

        {/* Buttons */}
        <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onGetStarted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.accent[400], Colors.accent[600]]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onSignIn}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>
              Already have an account?{" "}
              <Text style={styles.signInText}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary[800],
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing["3xl"],
  },

  // Logo styles
  logoContainer: {
    marginBottom: Spacing["2xl"],
  },
  logoInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.xl,
  },
  logoEmoji: {
    fontSize: 60,
  },

  // Text styles
  title: {
    fontSize: Typography.fontSizes["5xl"],
    fontWeight: Typography.fontWeights.bold as any, // ✅ Cast to any for RN compatibility
    color: Colors.white,
    textAlign: "center",
    marginBottom: Spacing.md,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.normal as any, // ✅ Cast to any for RN compatibility
    color: Colors.primary[100],
    textAlign: "center",
    lineHeight: Typography.lineHeights.lg,
    marginBottom: Spacing["3xl"],
    opacity: 0.9,
  },

  // Button styles
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  primaryButton: {
    width: "100%",
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    ...Shadows.lg,
  },
  buttonGradient: {
    paddingVertical: Spacing.md + 4,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold as any, // ✅ Cast to any for RN compatibility
    color: Colors.white,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  secondaryButtonText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.primary[200],
    textAlign: "center",
  },
  signInText: {
    color: Colors.accent[400],
    fontWeight: Typography.fontWeights.semibold as any, // ✅ Cast to any for RN compatibility
  },

  // Floating elements
  floatingElement1: {
    position: "absolute",
    top: height * 0.15,
    left: width * 0.1,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent[400],
    opacity: 0.1,
  },
  floatingElement2: {
    position: "absolute",
    top: height * 0.25,
    right: width * 0.15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[300],
    opacity: 0.15,
  },
  floatingElement3: {
    position: "absolute",
    bottom: height * 0.3,
    left: width * 0.08,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent[300],
    opacity: 0.08,
  },
});
