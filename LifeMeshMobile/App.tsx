import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button, Alert } from "react-native";
import { Provider } from "react-redux";
import { store } from "./src/store/store";
import { useAuth } from "./src/features/auth/hooks/useAuth";

function AuthTest() {
  const { user, isLoading, error, isAuthenticated, login, logout } = useAuth();

  const testLogin = async () => {
    const result = await login({
      email: "admin@lifemesh.com",
      password: "$10$zgqt8sPOGQfeEKA1.8YdWOX8/AfyDVJfcbYKWI9C1LAfSQts0r5jG", // This should fail
    });

    if (!result.success) {
      Alert.alert("Login Failed", result.error);
    }
  };

  const testLogout = async () => {
    await logout();
    Alert.alert("Success", "Logged out!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌍 LifeMesh</Text>
      <Text style={styles.subtitle}>Auth Test</Text>

      {/* Show current state */}
      <Text style={styles.status}>
        Status: {isAuthenticated ? "Logged In" : "Logged Out"}
      </Text>

      {isLoading && <Text style={styles.loading}>Loading...</Text>}

      {error && <Text style={styles.error}>Error: {error}</Text>}

      {user && (
        <Text style={styles.user}>
          Welcome: {user.username} ({user.email})
        </Text>
      )}

      {/* Test buttons */}
      <View style={styles.buttons}>
        <Button title="Test Login" onPress={testLogin} />
        <Button title="Test Logout" onPress={testLogout} />
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthTest />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 20,
  },
  status: {
    fontSize: 14,
    color: "#059669",
    marginBottom: 10,
  },
  loading: {
    fontSize: 14,
    color: "#3b82f6",
    marginBottom: 10,
  },
  error: {
    fontSize: 14,
    color: "#dc2626",
    marginBottom: 10,
    textAlign: "center",
  },
  user: {
    fontSize: 14,
    color: "#059669",
    marginBottom: 20,
    textAlign: "center",
  },
  buttons: {
    gap: 10,
  },
});
