// App.tsx - Updated to include navigation
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { store } from "./src/store/store";
import { useAuth } from "./src/features/auth/hooks/useAuth";

// Import screens
import { WelcomeScreen } from "./src/screens/WelcomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { TabNavigator } from "./src/navigation/TabNavigator";

type Screen = "welcome" | "login" | "register";

// Auth Navigator Component
const AuthNavigator = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");

  const handleGetStarted = () => setCurrentScreen("register");
  const handleSignIn = () => setCurrentScreen("login");
  const handleBackToWelcome = () => setCurrentScreen("welcome");
  const handleGoToRegister = () => setCurrentScreen("register");
  const handleGoToLogin = () => setCurrentScreen("login");

  switch (currentScreen) {
    case "welcome":
      return (
        <WelcomeScreen
          onGetStarted={handleGetStarted}
          onSignIn={handleSignIn}
        />
      );
    case "login":
      return (
        <LoginScreen
          onBackToWelcome={handleBackToWelcome}
          onGoToRegister={handleGoToRegister}
        />
      );
    case "register":
      return (
        <RegisterScreen
          onBackToWelcome={handleBackToWelcome}
          onGoToLogin={handleGoToLogin}
        />
      );
    default:
      return null;
  }
};

// Main App Component
const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      {isAuthenticated ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

// Root App Component
function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppContent />
        <StatusBar style="auto" />
      </Provider>
    </SafeAreaProvider>
  );
}

export default App;
