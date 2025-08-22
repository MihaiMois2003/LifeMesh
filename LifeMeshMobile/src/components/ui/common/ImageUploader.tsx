// src/components/ui/common/ImageUploader.tsx
import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeIn } from "react-native-reanimated";
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
} from "../../../shared/constants/theme";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
}) => {
  const handleImagePicker = async () => {
    if (images.length >= maxImages) {
      Alert.alert(
        "Limit Reached",
        `You can only add up to ${maxImages} images.`
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: maxImages - images.length,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      onImagesChange([...images, ...newImages]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  return (
    <View style={styles.container}>
      {/* Add Photos Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleImagePicker}
        activeOpacity={0.7}
      >
        <Ionicons name="camera" size={24} color={Colors.primary[600]} />
        <Text style={styles.addButtonText}>
          {images.length === 0
            ? "Add Photos"
            : `Add More (${images.length}/${maxImages})`}
        </Text>
      </TouchableOpacity>

      {/* Selected Images */}
      {images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesList}
        >
          {images.map((uri, index) => (
            <Animated.View
              key={index}
              entering={FadeIn.delay(index * 100)}
              style={styles.imageWrapper}
            >
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveImage(index)}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={16} color={Colors.white} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.primary[300],
    borderStyle: "dashed",
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    gap: Spacing.sm,
  },
  addButtonText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeights.medium as any,
  },
  imagesList: {
    marginTop: Spacing.md,
  },
  imageWrapper: {
    marginRight: Spacing.md,
    position: "relative",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
});
