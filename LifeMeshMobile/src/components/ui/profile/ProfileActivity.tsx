// src/components/ui/profile/ProfileActivity.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../../shared/constants/theme";

interface Activity {
  id: string;
  type: string;
  title: string;
  time: string;
  icon: string;
  color: string;
}

interface ProfileActivityProps {
  activities: Activity[];
}

export const ProfileActivity: React.FC<ProfileActivityProps> = ({
  activities,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="pulse-outline"
            size={20}
            color={Colors.primary[600]}
          />
        </View>
        <Text style={styles.title}>Recent Activity</Text>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activitiesList}>
        {activities.map((activity, index) => (
          <Animated.View
            key={activity.id}
            entering={FadeInUp.delay(index * 100).springify()}
            style={[
              styles.activityItem,
              index < activities.length - 1 && styles.activityItemBorder,
            ]}
          >
            <View style={styles.activityLeft}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: activity.color + "20" },
                ]}
              >
                <Ionicons
                  name={activity.icon as any}
                  size={18}
                  color={activity.color}
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={Colors.text.tertiary}
            />
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold as any,
    color: Colors.text.primary,
    flex: 1,
  },
  seeAllButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  seeAllText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeights.medium as any,
  },
  activitiesList: {
    gap: 0,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[50],
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium as any,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
  },
});
