// src/components/modals/CreatePostModal.tsx
import React, { useState } from "react";
import { ScrollView, Alert, TouchableOpacity, Text } from "react-native";
import { usePosts } from "../../features/posts/hooks/usePosts";
import { AbsoluteModal } from "./AbsoluteModal";
import { ModalHeader } from "../ui/common/ModalHeader";
import { CategorySelector } from "../ui/common/CategorySelector";
import { FormInput } from "../ui/common/FormInput";
import { ImageUploader } from "../ui/common/ImageUploader";
import { Category, PostType } from "../../shared/types/posts";
import { Spacing } from "../../shared/constants/theme";
import { useAuth } from "../../features/auth/hooks/useAuth";

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
}) => {
  const { createPost, isCreating } = usePosts();
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>(Category.GENERAL);
  const [images, setImages] = useState<string[]>([]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory(Category.GENERAL);
    setImages([]);
  };

  const handleClose = () => {
    if (title.trim() || content.trim() || images.length > 0) {
      Alert.alert("Discard Post?", "You have unsaved changes.", [
        { text: "Keep Editing", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            resetForm();
            onClose();
          },
        },
      ]);
    } else {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert(
        "Missing Information",
        "Please fill in both title and content."
      );
      return;
    }

    console.log("🚀 Starting post creation...");
    console.log("📝 Post data:", {
      title: title.trim(),
      content: content.trim(),
      category,
    });
    console.log("📸 Images to upload:", images.length);

    // Convert image URIs to File objects for upload
    const imageFiles: File[] = [];

    try {
      for (let i = 0; i < images.length; i++) {
        const uri = images[i];
        console.log(
          `📸 Processing image ${i + 1}/${images.length}:`,
          uri.substring(0, 50) + "..."
        );

        const response = await fetch(uri);
        console.log(
          `✅ Fetch response for image ${i + 1}:`,
          response.status,
          response.ok
        );

        const blob = await response.blob();
        console.log(
          `✅ Blob created for image ${i + 1}:`,
          blob.size,
          "bytes, type:",
          blob.type
        );

        const file = new File([blob], `image_${Date.now()}_${i}.jpg`, {
          type: "image/jpeg",
        });
        console.log(
          `✅ File created for image ${i + 1}:`,
          file.name,
          file.size,
          "bytes"
        );

        imageFiles.push(file);
      }

      console.log(
        "✅ All images processed successfully. Total files:",
        imageFiles.length
      );
    } catch (imageError) {
      console.error("❌ Image processing error:", imageError);
      Alert.alert("Image Error", "Failed to process images. Please try again.");
      return;
    }

    console.log("🚀 Calling createPost with:", {
      title: title.trim(),
      content: content.trim(),
      category,
      type: images.length > 0 ? PostType.IMAGE : PostType.TEXT,
      imageCount: imageFiles.length,
    });

    const result = await createPost({
      title: title.trim(),
      content: content.trim(),
      category,
      type: images.length > 0 ? PostType.IMAGE : PostType.TEXT,
      images: imageFiles,
    });

    console.log("📊 Create post result:", result);

    if (result.success) {
      resetForm();
      onClose();
      Alert.alert("Success", "Your post has been created!");
    } else {
      console.error("❌ Post creation failed:", result.error);
      Alert.alert("Error", result.error || "Failed to create post");
    }
  };

  const isFormValid = title.trim() && content.trim();

  const testImageUpload = async () => {
    if (images.length === 0) {
      Alert.alert("No Images", "Please select images first");
      return;
    }

    if (!token) {
      Alert.alert(
        "Not authenticated",
        "You must be signed in to upload images."
      );
      return;
    }

    console.log("🧪 Testing image upload only...");

    try {
      // Test the image upload endpoint directly
      const formData = new FormData();

      for (let i = 0; i < images.length; i++) {
        const uri = images[i];
        const response = await fetch(uri);
        const blob = await response.blob();

        // Create a proper FormData entry
        formData.append("images", {
          uri: uri,
          type: "image/jpeg",
          name: `image_${i}.jpg`,
        } as any);
      }

      console.log("📸 Uploading to /api/posts/upload-images...");

      const uploadResponse = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/posts/upload-images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Get token from useAuth
          },
          body: formData,
        }
      );

      const result = await uploadResponse.json();
      console.log("📊 Upload result:", result);

      if (result.success) {
        Alert.alert(
          "Success",
          `Images uploaded! URLs: ${result.data.imageUrls.join(", ")}`
        );
      } else {
        Alert.alert("Upload Failed", result.error || "Unknown error");
      }
    } catch (err: unknown) {
      console.error("❌ Upload test failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert("Error", msg);
    }
  };

  return (
    <AbsoluteModal visible={visible} onClose={handleClose}>
      <ModalHeader
        title="Create Post"
        onClose={handleClose}
        rightButton={{
          text: "Post",
          onPress: handleSubmit,
          disabled: !isFormValid,
          loading: isCreating,
        }}
      />

      <ScrollView style={{ flex: 1, paddingHorizontal: Spacing.xl }}>
        <CategorySelector selectedCategory={category} onSelect={setCategory} />
        <FormInput
          variant="title"
          placeholder="What's happening in your community?"
          value={title}
          onChangeText={setTitle}
          maxLength={200}
          multiline
        />
        <FormInput
          variant="content"
          placeholder="Share more details..."
          value={content}
          onChangeText={setContent}
          maxLength={5000}
          showCharacterCount
          multiline
        />
        <ImageUploader images={images} onImagesChange={setImages} />
        <TouchableOpacity
          style={{
            padding: 16,
            backgroundColor: "blue",
            borderRadius: 8,
            margin: 16,
          }}
          onPress={testImageUpload}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            🧪 Test Image Upload
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </AbsoluteModal>
  );
};
