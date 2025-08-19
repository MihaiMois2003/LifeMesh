// src/screens/MapScreen.tsx (Using Expo MapView)
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Alert, Platform } from "react-native";
import MapView, { Region } from "react-native-maps";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";

import { Colors, Typography, Spacing } from "../shared/constants/theme";

// Define the initial region (this will be Romania/your area as default)
const INITIAL_REGION: Region = {
  latitude: 45.7489, // Hunedoara County, Romania (approximate)
  longitude: 22.9033,
  latitudeDelta: 0.05, // Zoom level (smaller = more zoomed in)
  longitudeDelta: 0.05,
};

export const MapScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  // Request location permission and get user's current location
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      // Request permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Permission",
          "Please enable location access to see your position on the map"
        );
        setLocationPermission(false);
        return;
      }

      setLocationPermission(true);

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(userCoords);

      // Update map region to center on user's location
      setRegion({
        ...userCoords,
        latitudeDelta: 0.01, // Zoom in closer to user
        longitudeDelta: 0.01,
      });

      console.log("📍 User location:", userCoords);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Could not get your location. Using default area.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Community Map</Text>
        <Text style={styles.headerSubtitle}>
          {locationPermission ? "📍 Your neighborhood" : "🗺️ Default area"}
        </Text>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={INITIAL_REGION}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={locationPermission} // Show blue dot if permission granted
        showsMyLocationButton={false} // We'll add custom controls later
        showsCompass={true}
        showsScale={false}
        showsBuildings={true}
        showsTraffic={false}
        showsIndoors={false}
        mapType="standard" // Can be: standard, satellite, hybrid, terrain
        // provider="google" // Commented out for now - works without API key
      />

      {/* Debug info (we'll remove this later) */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>Lat: {region.latitude.toFixed(4)}</Text>
        <Text style={styles.debugText}>Lng: {region.longitude.toFixed(4)}</Text>
        <Text style={styles.debugText}>
          Zoom: {(1 / region.latitudeDelta).toFixed(0)}x
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  // Header
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[100],
  },
  headerTitle: {
    fontSize: Typography.fontSizes["2xl"],
    fontWeight: Typography.fontWeights.bold as any,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
  },

  // Map
  map: {
    flex: 1,
  },

  // Debug info (temporary)
  debugInfo: {
    position: "absolute",
    top: 120,
    right: Spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: Spacing.sm,
    borderRadius: 8,
  },
  debugText: {
    color: Colors.white,
    fontSize: Typography.fontSizes.xs,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
});
