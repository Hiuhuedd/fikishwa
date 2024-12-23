import { useEffect, useState } from "react";
import { ScrollView, Text, View, Switch, Button } from "react-native";
import { useUserStore, DriverDetailsStore, useLocationStore } from "@/store";

const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(true);
  const { user } = useUserStore(); // Fetch user data
  const { driver } = DriverDetailsStore(); // Fetch driver details
  const { userLongitude, userLatitude } = useLocationStore(); // Fetch location details

  const toggleOnlineStatus = () => setIsOnline((prev) => !prev);

  useEffect(() => {
    console.log(user, driver, userLongitude, userLatitude);
  }, [user, driver, userLongitude, userLatitude]);

  return (
    <ScrollView className="flex-1 bg-gray-100 p-5">
      {/* Header */}
      <View className="mb-8 mt-10">
        <Text className="text-3xl font-bold text-sky-600">
          Welcome, {user?.userName || "Driver"} 🚗
        </Text>
        <Text className="text-gray-600 text-lg">
          Your Dashboard | Status: {isOnline ? "Online" : "Offline"}
        </Text>
      </View>

      {/* Driver Details */}
      <View className="mb-8 bg-white p-5 rounded-lg shadow-md">
        <Text className="text-xl font-semibold text-gray-800 mb-2">
          Vehicle Information
        </Text>
        <Text className="text-gray-700">Car Model: {driver?.carModel || "N/A"}</Text>
        <Text className="text-gray-700">Plate: {driver?.plate || "N/A"}</Text>
        <Text className="text-gray-700">Email: {driver?.email || "N/A"}</Text>
        <Text className="text-gray-700">Phone: {driver?.phone || "N/A"}</Text>
      </View>

      {/* Location Information */}
      <View className="mb-8 bg-white p-5 rounded-lg shadow-md">
        <Text className="text-xl font-semibold text-gray-800 mb-2">
          Current Location
        </Text>
        <Text className="text-gray-700">
          Latitude: {userLatitude?.toFixed(6) || "Fetching..."}
        </Text>
        <Text className="text-gray-700">
          Longitude: {userLongitude?.toFixed(6) || "Fetching..."}
        </Text>
      </View>

      {/* Recent Rides */}
      <View className="mb-8 bg-white p-5 rounded-lg shadow-md">
        <Text className="text-xl font-semibold text-gray-800 mb-2">
          Recent Rides
        </Text>
        <View className="space-y-2">
          <Text className="text-gray-700">Ride 1: Downtown to Airport - Completed</Text>
          <Text className="text-gray-700">Ride 2: City Center to Mall - Completed</Text>
          <Text className="text-gray-700">Ride 3: Suburbs to Restaurant - Pending</Text>
        </View>
      </View>

      {/* Earnings */}
      <View className="mb-8 bg-white p-5 rounded-lg shadow-md">
        <Text className="text-xl font-semibold text-gray-800 mb-2">
          Total Earnings
        </Text>
        <Text className="text-green-600 text-lg font-bold">$200.00</Text>
      </View>

      {/* Availability Switch */}
      <View className="mb-8 bg-white p-5 rounded-lg shadow-md">
        <Text className="text-xl font-semibold text-gray-800 mb-2">
          Availability Status
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-700">{isOnline ? "Online" : "Offline"}</Text>
          <Switch value={isOnline} onValueChange={toggleOnlineStatus} />
        </View>
      </View>
      <View className="mb-28 ">
      <Button
        title="Log Out"
        onPress={() => console.log("Log Out Pressed")}
        color="#d9534f"
      />
      </View>

      {/* Logout Button */}
    
    </ScrollView>
  );
};

export default DriverDashboard;
