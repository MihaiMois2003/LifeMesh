import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenTransition } from "../components/common/ScreenTransition";
import { AnimatedInput } from "../components/ui/animated/AnimatedInput";
import { AnimatedButton } from "../components/ui/animated/AnimatedButton";
import { useAuth } from "../features/auth/hooks/useAuth";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../shared/constants/theme";

const { height } = Dimensions.get("window");

interface LoginScreenProps {
  onBackToWelcome: () => void;
  onGoToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onBackToWelcome,
  onGoToRegister,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoading, error, clearAuthError } = useAuth();
  const insets = useSafeAreaInsets(); // ✅ Get safe area insets

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(30);
  const footerOpacity = useSharedValue(0);

  useEffect(() => {
    // Staggered animations
    headerOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    headerTranslateY.value = withDelay(200, withSpring(0, { damping: 15 }));

    formOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    formTranslateY.value = withDelay(400, withSpring(0, { damping: 15 }));

    footerOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
  }, []);

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      clearAuthError();
    }
  }, [email, password]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const footerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const result = await login({ email: email.trim(), password });

    if (result.success) {
      Alert.alert("Success", "Welcome back!");
      // Navigate to main app (we'll implement this later)
    } else {
      Alert.alert("Login Failed", result.error);
    }
  };

  const isFormValid = email.trim().length > 0 && password.length > 0;

  return (
    <ScreenTransition animationType="slideUp">
      <StatusBar style="dark" backgroundColor={Colors.primary[50]} />

      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + Spacing.md, // ✅ Safe area + extra padding
            paddingBottom: insets.bottom + Spacing.lg,
            paddingLeft: insets.left + Spacing.xl,
            paddingRight: insets.right + Spacing.xl,
          },
        ]}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackToWelcome}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🌍</Text>
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue connecting with your community
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View style={[styles.form, formAnimatedStyle]}>
          <AnimatedInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            icon="📧"
          />

          <AnimatedInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            isPassword
            autoComplete="password"
            icon="🔒"
          />

          {/* Login Button */}
          <AnimatedButton
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            disabled={!isFormValid}
            icon="🚀"
            style={styles.loginButton}
          />

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footer, footerAnimatedStyle]}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={onGoToRegister} activeOpacity={0.7}>
            <Text style={styles.signUpText}>Create Account</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScreenTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["2xl"],
  },

  // Header styles
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backButtonText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeights.medium as any,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: Typography.fontSizes["3xl"],
    fontWeight: Typography.fontWeights.bold as any,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: Typography.lineHeights.base * 1.2,
    paddingHorizontal: Spacing.md,
  },

  // Form styles
  form: {
    flex: 1,
    marginBottom: Spacing.xl,
  },
  loginButton: {
    marginTop: Spacing.xl, // ✅ Increased spacing from lg to xl
    marginBottom: Spacing.lg, // ✅ Increased spacing
  },
  forgotPasswordButton: {
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  forgotPasswordText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeights.medium as any,
  },

  // Footer styles
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text.secondary,
    marginRight: Spacing.xs,
  },
  signUpText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeights.semibold as any,
  },
});
