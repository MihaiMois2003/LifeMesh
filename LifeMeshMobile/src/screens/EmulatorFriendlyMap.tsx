// src/screens/EmulatorFriendlyMap.tsx
import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Alert } from "react-native";
import MapView, { Region, Marker } from "react-native-maps";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../shared/constants/theme";

// Define a few test locations
const TEST_LOCATIONS = {
  romania: {
    latitude: 45.7489,
    longitude: 22.9033,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
  bucharest: {
    latitude: 44.4268,
    longitude: 26.1025,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
  newyork: {
    latitude: 40.7128,
    longitude: -74.006,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
};

export const EmulatorFriendlyMap: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [region, setRegion] = useState<Region>(TEST_LOCATIONS.romania);
  const [currentLocation, setCurrentLocation] = useState<string>("romania");

  // Function to jump to different test locations
  const jumpToLocation = (locationKey: keyof typeof TEST_LOCATIONS) => {
    const newRegion = TEST_LOCATIONS[locationKey];
    setRegion(newRegion);
    setCurrentLocation(locationKey);

    Alert.alert(
      "Location Changed",
      `Jumped to ${locationKey.charAt(0).toUpperCase() + locationKey.slice(1)}!`
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Community Map</Text>
        <Text style={styles.headerSubtitle}>
          📍{" "}
          {currentLocation.charAt(0).toUpperCase() + currentLocation.slice(1)}
        </Text>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        mapType="standard"
        showsUserLocation={false} // Disable for now to avoid permission issues
        showsMyLocationButton={false}
        showsCompass={true}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
      >
        {/* Add a test marker */}
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
          title="Test Location"
          description={`You are viewing ${currentLocation}`}
          pinColor={Colors.primary[600]}
        />
      </MapView>

      {/* Location Test Buttons */}
      <View style={styles.testControls}>
        <Text style={styles.testTitle}>🧪 Test Locations:</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.testButton,
              currentLocation === "romania" && styles.activeButton,
            ]}
            onPress={() => jumpToLocation("romania")}
          >
            <Text style={styles.buttonText}>🇷🇴 Romania</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.testButton,
              currentLocation === "bucharest" && styles.activeButton,
            ]}
            onPress={() => jumpToLocation("bucharest")}
          >
            <Text style={styles.buttonText}>🏛️ Bucharest</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.testButton,
              currentLocation === "newyork" && styles.activeButton,
            ]}
            onPress={() => jumpToLocation("newyork")}
          >
            <Text style={styles.buttonText}>🗽 NYC</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Debug info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>Lat: {region.latitude.toFixed(4)}</Text>
        <Text style={styles.debugText}>Lng: {region.longitude.toFixed(4)}</Text>
        <Text style={styles.debugText}>
          Zoom: {(1 / region.latitudeDelta).toFixed(0)}x
        </Text>
        <View style={styles.statusIndicator}>
          <Ionicons name="wifi" size={12} color={Colors.success} />
          <Text style={styles.statusText}>Map Loaded</Text>
        </View>
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

  // Test Controls
  testControls: {
    position: "absolute",
    bottom: 100,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  testTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold as any,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.xs,
  },
  testButton: {
    flex: 1,
    backgroundColor: Colors.primary[100],
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: Colors.primary[600],
  },
  buttonText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.medium as any,
    color: Colors.text.primary,
  },

  // Debug info
  debugInfo: {
    position: "absolute",
    top: 120,
    right: Spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 120,
  },
  debugText: {
    color: Colors.white,
    fontSize: Typography.fontSizes.xs,
    marginBottom: 2,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
  },
  statusText: {
    color: Colors.success,
    fontSize: Typography.fontSizes.xs,
    marginLeft: 4,
    fontWeight: Typography.fontWeights.medium as any,
  },
});
