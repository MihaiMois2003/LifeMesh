import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { store } from "./src/store/store";
import { WelcomeScreen } from "./src/screens/WelcomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";

type Screen = "welcome" | "login" | "register";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");

  const handleGetStarted = () => {
    setCurrentScreen("register");
  };

  const handleSignIn = () => {
    setCurrentScreen("login");
  };

  const handleBackToWelcome = () => {
    setCurrentScreen("welcome");
  };

  const handleGoToRegister = () => {
    setCurrentScreen("register");
  };

  const handleGoToLogin = () => {
    setCurrentScreen("login");
  };

  const renderScreen = () => {
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

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        {renderScreen()}
        <StatusBar style="auto" />
      </Provider>
    </SafeAreaProvider>
  );
}

export default App;
