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
    imageCount: images.length,
  });

  // ==========================================
  // 🔧 FIXED: Upload images FIRST using the same method as your test
  // ==========================================
  let uploadedImageUrls: string[] = [];

  if (images.length > 0) {
    try {
      console.log("📸 Uploading images first...");

      // Use the SAME FormData approach as your working test
      const formData = new FormData();

      for (let i = 0; i < images.length; i++) {
        const uri = images[i];
        console.log(`📸 Adding image ${i + 1}/${images.length}`);

        // ✅ Use the exact same format as your working test
        formData.append("images", {
          uri: uri,
          type: "image/jpeg",
          name: `image_${Date.now()}_${i}.jpg`,
        } as any);
      }

      console.log("🚀 Making upload request...");

      const uploadResponse = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/posts/upload-images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type - let FormData handle it
          },
          body: formData,
        }
      );

      const uploadResult = await uploadResponse.json();
      console.log("📊 Upload result:", uploadResult);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Image upload failed");
      }

      uploadedImageUrls = uploadResult.data.imageUrls;
      console.log("✅ Images uploaded successfully:", uploadedImageUrls);

    } catch (imageError: any) {
      console.error("❌ Image upload failed:", imageError);
      Alert.alert("Image Error", imageError.message || "Failed to upload images");
      return;
    }
  }

  // ==========================================
  // 📝 Create post with uploaded image URLs (NOT File objects)
  // ==========================================
  console.log("📝 Creating post with image URLs...");

  const result = await createPost({
    title: title.trim(),
    content: content.trim(),
    category,
    type: images.length > 0 ? PostType.IMAGE : PostType.TEXT,
    imageUrls: uploadedImageUrls, // ✅ Pass URLs, not File objects
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
      </ScrollView>
    </AbsoluteModal>
  );
};
