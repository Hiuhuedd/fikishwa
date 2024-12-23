import { useState } from "react";
import { ScrollView, Text, View, Switch, Button } from "react-native";
import { icons } from "@/constants";

const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(true);

  const toggleOnlineStatus = () => setIsOnline((prev) => !prev);

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <Text className="mt-10 text-2xl text-black font-JakartaSemiBold mb-5">
        Driver Dashboard 🚗
      </Text>

      {/* Recent Rides */}
      <View className="mb-6">
        <Text className="text-xl text-black">Recent Rides</Text>
        {/* You can replace the static data with dynamic data */}
        <View className="mt-3">
          <Text>Ride 1: From Downtown to Airport - Completed</Text>
          <Text>Ride 2: From City Center to Mall - Completed</Text>
          <Text>Ride 3: From Suburbs to Restaurant - Pending</Text>
        </View>
      </View>

      {/* Total Earnings */}
      <View className="mb-6">
        <Text className="text-xl text-black">Total Earnings</Text>
        <Text className="text-lg text-primary-500">$200.00</Text>
      </View>

      {/* Online/Offline Switch */}
      <View className="mb-6">
        <Text className="text-xl text-black">Availability Status</Text>
        <View className="flex-row items-center mt-3">
          <Text className="mr-3">{isOnline ? "Online" : "Offline"}</Text>
          <Switch value={isOnline} onValueChange={toggleOnlineStatus} />
        </View>
      </View>

      {/* Additional Actions */}
      <Button title="Log Out" onPress={() => {}} />
    </ScrollView>
  );
};

export default DriverDashboard;
