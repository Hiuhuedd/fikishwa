import { useState } from "react";
import { Alert, Text, View, ScrollView, KeyboardAvoidingView, Platform, Image } from "react-native";
import {  createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { db,auth } from './firebase';  // Firebase config import
import { collection, doc, setDoc } from "firebase/firestore";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";
import { Link } from "expo-router";

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
  });

  const validateForm = () => {
    if (!form.username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return false;
    }
    if (!form.email.trim()) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }
    if (!form.password.trim()) {
      Alert.alert("Error", "Please enter a password");
      return false;
    }
    if (form.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const onSignUpPress = async () => {
    if (isLoading) return;
    if (!validateForm()) return;

    try {
      setIsLoading(true);
       // Get Firebase Auth instance

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);

      // Update the user's profile
      await updateProfile(userCredential.user, {
        displayName: form.username,
      });

      // Optionally, send email verification
      await sendEmailVerification(userCredential.user);

      // Determine user type based on email prefix (e.g., 'driver_' for drivers)
      const userType =  "user";

      // Save the user data to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        username: form.username,
        email: form.email,
        phone: form.phone,
        userType: userType,  // Store userType as part of the document
      });

      Alert.alert(
        "Success",
        "Account created successfully! Please verify your email before logging in."
      );
    } catch (err) {
      console.error("SignUp error:", err);
      Alert.alert("Error", err.message || "An error occurred during signup.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 bg-white">
          <View className="relative w-full h-[250px]">
            <Image source={images.signUpCar} className="z-0 w-full h-[250px]" resizeMode="cover" />
            <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
              Create Your Account
            </Text>
          </View>

          <View className="p-5">
            <InputField
              label="Username"
              placeholder="Choose a username"
              icon={icons.person}
              value={form.username}
              onChangeText={(value) => setForm((prev) => ({ ...prev, username: value.toLowerCase().replace(/\s+/g, "_") }))}
              autoCapitalize="none"
            />
            <InputField
              label="Email"
              placeholder="Enter your email"
              icon={icons.email}
              value={form.email}
              onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))} 
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
            />
            <InputField
              label="Phone"
              placeholder="Enter your phone number"
              value={form.phone}
              onChangeText={(value) => setForm((prev) => ({ ...prev, phone: value }))} 
              keyboardType="phone-pad"
              autoCapitalize="none"
              textContentType="telephoneNumber"
            />
            <InputField
              label="Password"
              placeholder="Create password"
              icon={icons.lock}
              value={form.password}
              onChangeText={(value) => setForm((prev) => ({ ...prev, password: value }))} 
              secureTextEntry
              textContentType="newPassword"
            />
            <CustomButton
              title={isLoading ? "Creating Account..." : "Sign Up"}
              onPress={onSignUpPress}
              disabled={isLoading}
              className="mt-6"
            />
          </View>
          <Link
            href="/sign-in"
            className="text-lg text-center text-general-200 mt-10"
          >
            already have an account?{" "}
            <Text className="text-primary-500">Sign In</Text>
          </Link>
          <Link
            href="/driver"
            className="text-lg text-center text-general-200 mt-2"
          >
            Sign up as Rider?{" "}
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;
