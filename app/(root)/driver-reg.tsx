import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View, ActivityIndicator } from "react-native";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../(auth)/firebase";
import { DriverDetailsStore, useLocationStore, useUserStore } from "@/store";
import * as Location from "expo-location";

const DriverRegistration = () => {

  const { setUserLocation, setDestinationLocation } = useLocationStore();

  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage menu visibility

  const [suggestions, setSuggestions] = useState([]);



  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasPermission(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
      });

      setUserLocation({
        latitude: location.coords?.latitude,
        longitude: location.coords?.longitude,
        address: `${address[0].name}, ${address[0].region}`,
      });
    })();
  }, []);



  const [form, setForm] = useState({
    carModel: "",
    registrationNumber: "",
  });
  const { setDriver } = DriverDetailsStore(); // Get the setUser function from Zustand store

  const [loading, setLoading] = useState(false); // Loading state
  
  const { user } = useUserStore(); // Get the user data from Zustand store
  const onRegisterPress = async () => {
    console.log(user);
    
    if (!form.carModel || !form.registrationNumber) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true); // Start loading
    try {
      // Save the driver details to Firestore
      await setDoc(doc(db, "driverDetails", user.uid), {
        username: user.userName,
        carModel: form.carModel,
        plate: form.registrationNumber,
        phone: user.phone,
      });
     setDriver({
        uid: user.uid,
        email: user.email,
        carModel:form.carModel,
        phone:user.phone,
        plate:form.registrationNumber
      });
      // Navigate to driver dashboard
      router.replace("/driver-dash");
    } catch (error) {
      console.error("Error saving driver details:", error);
      Alert.alert("Error", "An error occurred while registering. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-5 mt-10">
        <Text className="text-2xl text-black font-JakartaSemiBold">
          Vehicle Information 🚗
        </Text>

        {/* Car Model */}
        <InputField
          label="Car Model"
          placeholder="Mazda Demio"
          value={form.carModel}
          onChangeText={(value) => setForm({ ...form, carModel: value })}
        />

        {/* Car Registration Number */}
        <InputField
          label="Plate/Registration Number"
          placeholder="KDD123F"
          value={form.registrationNumber}
          onChangeText={(value) => setForm({ ...form, registrationNumber: value })}
          className="uppercase"
        />

        {/* Register Button */}
        <CustomButton

          title={loading ? "Registering..." : "Register"} // Show loading text
          onPress={onRegisterPress}
          className="mt-6"
          disabled={loading} // Disable button during loading
        />

        {/* Loading Indicator */}
        {loading && (
          <View className="flex justify-center items-center mt-4">
            <ActivityIndicator size="large" color="#000" />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default DriverRegistration;
function setUserLocation(arg0: { latitude: number; longitude: number; address: string; }) {
  throw new Error("Function not implemented.");
}

