import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { icons } from "@/constants";
import { router } from "expo-router";

const DriverRegistration = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    carModel: "",
    registrationNumber: "",
  });

  const onRegisterPress = async () => {
    router.replace("/driver-dash");
    // Add your validation logic here
    if (!form.fullName || !form.email || !form.carModel || !form.registrationNumber) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    // Registration logic (for example, save the data to your backend)
    // After successful registration, navigate to the driver home screen
;
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-5 mt-10">
            <Text className="text-2xl text-black font-JakartaSemiBold  ">
            Vehicle Information 🚗
          </Text>
        {/* Full Name */}
       
        {/* Car Model */}
        <InputField
          label="Car Model"
          placeholder="Mazda Demio"
        //   icon={icons.car}
          value={form.carModel}
          onChangeText={(value) => setForm({ ...form, carModel: value })}
        />

        {/* Car Registration Number */}
        <InputField
          label="Plate/Registration Number"
          placeholder="KDD123F"
        //   icon={icons.registration}
          value={form.registrationNumber}
          onChangeText={(value) => setForm({ ...form, registrationNumber: value })}
        />

        {/* Register Button */}
        <CustomButton title="Register" onPress={onRegisterPress} className="mt-6" />
      </View>
    </ScrollView>
  );
};

export default DriverRegistration;
