// src/components/ui/common/CategorySelector.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category, CATEGORY_INFO } from "../../../shared/types/posts";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../../../shared/constants/theme";

interface CategorySelectorProps {
  selectedCategory: Category;
  onSelect: (category: Category) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedInfo = CATEGORY_INFO[selectedCategory];

  const handleSelect = (category: Category) => {
    onSelect(category);
    setIsExpanded(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.selected}>
          <View
            style={[
              styles.icon,
              { backgroundColor: selectedInfo.color + "20" },
            ]}
          >
            <Ionicons
              name={selectedInfo.icon as any}
              size={20}
              color={selectedInfo.color}
            />
          </View>
          <Text style={styles.label}>{selectedInfo.label}</Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={Colors.text.secondary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.options}>
          {Object.values(Category).map((cat) => {
            const info = CATEGORY_INFO[cat];
            const isSelected = selectedCategory === cat;

            return (
              <TouchableOpacity
                key={cat}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => handleSelect(cat)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.optionIcon,
                    { backgroundColor: info.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={info.icon as any}
                    size={18}
                    color={info.color}
                  />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>{info.label}</Text>
                  <Text style={styles.optionDesc}>{info.description}</Text>
                </View>
                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.primary[600]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary[100],
  },
  selected: { flexDirection: "row", alignItems: "center" },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold as any,
    color: Colors.text.primary,
  },
  options: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  optionSelected: { backgroundColor: Colors.primary[50] },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  optionText: { flex: 1 },
  optionLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold as any,
    color: Colors.text.primary,
  },
  optionDesc: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});
