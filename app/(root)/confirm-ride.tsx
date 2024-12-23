import { router } from "expo-router";
import { Alert, FlatList, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import RideLayout from "@/components/RideLayout";
import { useDriverStore, useLocationStore } from "@/store";
import { useEffect, useState } from "react";

const ConfirmRide = () => {
  const {
    userAddress,
    destinationAddress,
    userLongitude,
    userLatitude,
    destinationLongitude,
    destinationLatitude,
  } = useLocationStore();
  const {  selectedDriver, setSelectedDriver } = useDriverStore();
  
  
  const drivers = [
    {
      id: 1,
      latitude: 0, // Replace with actual latitude
      longitude: 0, // Replace with actual longitude
      title: "Driver 1", // Replace with actual title if needed
      first_name: "James",
      model: "Mazda Demio",
      color: "Silver",
      plate: "KDN 123N",
      last_name: "Wilson",
      profile_image_url:
      "https://ucarecdn.com/dae59f69-2c1f-48c3-a883-017bcf0f9950/-/preview/1000x666/",
      car_image_url:
      "https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/",
      car_seats: 4,
      rating: 4.8,
    },
    {
      id: 2,
      latitude: 0, // Replace with actual latitude
    longitude: 0, // Replace with actual longitude
    title: "Driver 2", // Replace with actual title if needed
    first_name: "David",
    model: "Mazda Demio",
    color: "Silver",
    plate: "KDN 123N",
    last_name: "Brown",
    profile_image_url:
      "https://ucarecdn.com/6ea6d83d-ef1a-483f-9106-837a3a5b3f67/-/preview/1000x666/",
      car_image_url:
      "https://ucarecdn.com/a3872f80-c094-409c-82f8-c9ff38429327/-/preview/930x932/",
      car_seats: 5,
      rating: 4.6,
    },

];
const orsAPIKey = "5b3ce3597851110001cf6248a7377a4f09044b5782559c2687a49270";

const [chargingAmount, setChargingAmount] = useState<number | null>(null);
const [loading, setLoading] = useState(false);

// Fetch route and calculate fare
const fetchRoute = async () => {
  if (!userLongitude || !userLatitude || !destinationLongitude || !destinationLatitude) return;

  setLoading(true);
  try {
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${orsAPIKey}&start=${userLongitude},${userLatitude}&end=${destinationLongitude},${destinationLatitude}&geometries=geojson`
    );

    const data = await response.json();

    const distanceInMeters = data.features[0].properties.segments[0].distance;
    const distanceInKilometers = distanceInMeters / 1000; // Convert to kilometers
    const fare = (distanceInKilometers * 40).toFixed(2); // Calculate fare at 40 KSh per km

    setChargingAmount(Number(fare));
  } catch (error) {
    console.error("Error fetching route:", error);
  } finally {
    setLoading(false);
  }
};

// Trigger fetchRoute on component mount
useEffect(() => {
  fetchRoute();
}, [userLongitude, userLatitude, destinationLongitude, destinationLatitude]);
return (
    <RideLayout title={"Choose a Rider"} snapPoints={["43%", "85%"]}>
          <Text className="text-xl font-JakartaSemiBold mb-3">
         Select Your Ride
        </Text>
      <FlatList
        data={drivers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <DriverCard
          item={item}
          selected={selectedDriver!}
          setSelected={() => setSelectedDriver(item.id!)}
          />
        )}
        ListFooterComponent={() => (
          <View className="mx-5 mt-10">
            <CustomButton
              title="Select Ride"
              onPress={() => router.push("/(root)/book-ride")}
            />
          </View>
        )}
      />
    </RideLayout>
  );
};

export default ConfirmRide;
