import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
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
import { AnimatedInput } from "../components/ui/AnimatedInput";
import { AnimatedButton } from "../components/ui/AnimatedButton";
import { useAuth } from "../features/auth/hooks/useAuth";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../shared/constants/theme";

const { height } = Dimensions.get("window");

interface RegisterScreenProps {
  onBackToWelcome: () => void;
  onGoToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onBackToWelcome,
  onGoToLogin,
}) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { register, isLoading, error, clearAuthError } = useAuth();
  const insets = useSafeAreaInsets();

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
  }, [email, username, displayName, password, confirmPassword]);

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

  const handleRegister = async () => {
    // Validation
    if (!email.trim() || !username.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    const result = await register({
      email: email.trim(),
      username: username.trim(),
      password,
      displayName: displayName.trim() || undefined,
    });

    if (result.success) {
      Alert.alert(
        "Success",
        "Account created successfully! Welcome to LifeMesh!"
      );
      // Navigate to main app (we'll implement this later)
    } else {
      Alert.alert("Registration Failed", result.error);
    }
  };

  const isFormValid =
    email.trim().length > 0 &&
    username.trim().length > 0 &&
    password.length >= 6 &&
    password === confirmPassword;

  return (
    <ScreenTransition animationType="slideUp">
      <StatusBar style="dark" backgroundColor={Colors.primary[50]} />

      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + Spacing.xs,
            paddingBottom: insets.bottom + Spacing.md,
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

          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🌱</Text>
            </View>

            <Text style={styles.title}>Join LifeMesh</Text>
            <Text style={styles.subtitle}>
              Create your account and start connecting with your community
            </Text>
          </View>
        </Animated.View>

        {/* Form */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
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
              label="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoComplete="username"
              icon="👤"
            />

            <AnimatedInput
              label="Display Name (Optional)"
              value={displayName}
              onChangeText={setDisplayName}
              autoComplete="name"
              icon="✨"
            />

            <AnimatedInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoComplete="new-password"
              icon="🔒"
            />

            <AnimatedInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              autoComplete="new-password"
              icon="🔐"
              error={
                confirmPassword.length > 0 && password !== confirmPassword
                  ? "Passwords do not match"
                  : undefined
              }
            />

            {/* Register Button */}
            <AnimatedButton
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              disabled={!isFormValid}
              icon="🚀"
              style={styles.registerButton}
            />

            {/* Terms Text */}
            <Text style={styles.termsText}>
              By creating an account, you agree to our{" "}
              <Text style={styles.linkText}>Terms of Service</Text> and{" "}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </Animated.View>
        </ScrollView>

        {/* Footer */}
        <Animated.View style={[styles.footer, footerAnimatedStyle]}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={onGoToLogin} activeOpacity={0.7}>
            <Text style={styles.signInText}>Sign In</Text>
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

  // Header styles
  header: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  headerContent: {
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: Spacing.sm,
  },
  backButtonText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeights.medium as any,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: Spacing.md,
  },
  logoEmoji: {
    fontSize: 30,
  },
  title: {
    fontSize: Typography.fontSizes["2xl"],
    fontWeight: Typography.fontWeights.bold as any,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: Typography.lineHeights.sm * 1.3,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },

  // Form styles
  scrollView: {
    flex: 1,
    marginBottom: Spacing.md,
  },
  form: {
    paddingBottom: Spacing.lg,
  },
  registerButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  termsText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.text.tertiary,
    textAlign: "center",
    lineHeight: Typography.lineHeights.xs * 1.4,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
  },
  linkText: {
    color: Colors.primary[600],
    fontWeight: Typography.fontWeights.medium as any,
  },

  // Footer styles
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.primary[100],
  },
  footerText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    marginRight: Spacing.xs,
  },
  signInText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeights.semibold as any,
  },
});
