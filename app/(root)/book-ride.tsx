import { useUser } from "@clerk/clerk-expo";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Image, Text, View, BackHandler } from "react-native";

import Payment from "@/components/Payment";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { formatTime } from "@/lib/utils";
import { useDriverStore, useLocationStore, useUserStore} from "@/store";
import MpesaPayment from "@/components/Payment";
import CustomButton from "@/components/CustomButton";
import { useState, useEffect } from "react";
import { getFirestore, doc, updateDoc, setDoc } from "firebase/firestore";
import { Alert } from "react-native";
import React from "react";

const BookRide = () => {
  const {
    userAddress,
    destinationAddress,
    userLongitude,
    userLatitude,
    destinationLongitude,
    destinationLatitude,
  } = useLocationStore();
  const { user } = useUserStore();
  const { selectedDriver } = useDriverStore();
     
  const drivers = [
    {
      id: 1,
      latitude: 0, // Replace with actual latitude
      longitude: 0, // Replace with actual longitude
      title: "Driver 1", // Replace with actual title if needed
      first_name: "James",
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
      last_name: "Brown",
      profile_image_url:
      "https://ucarecdn.com/6ea6d83d-ef1a-483f-9106-837a3a5b3f67/-/preview/1000x666/",
      car_image_url:
      "https://ucarecdn.com/a3872f80-c094-409c-82f8-c9ff38429327/-/preview/930x932/",
      car_seats: 5,
      rating: 4.6,
    },
    {
      id: 3,
      latitude: 0, // Replace with actual latitude
      longitude: 0, // Replace with actual longitude
      title: "Driver 3", // Replace with actual title if needed
      first_name: "Michael",
      last_name: "Johnson",
      profile_image_url:
      "https://ucarecdn.com/0330d85c-232e-4c30-bd04-e5e4d0e3d688/-/preview/826x822/",
      car_image_url:
      "https://ucarecdn.com/289764fb-55b6-4427-b1d1-f655987b4a14/-/preview/930x932/",
      car_seats: 4,
      rating: 4.7,
    },
    {
      id: 4,
      latitude: 0, // Replace with actual latitude
      longitude: 0, // Replace with actual longitude
      title: "Driver 4", // Replace with actual title if needed
      first_name: "Robert",
      last_name: "Green",
      profile_image_url:
      "https://ucarecdn.com/fdfc54df-9d24-40f7-b7d3-6f391561c0db/-/preview/626x417/",
      car_image_url:
      "https://ucarecdn.com/b6fb3b55-7676-4ff3-8484-fb115e268d32/-/preview/930x932/",
      car_seats: 4,
      rating: 4.9,
    },
  ];
  const driverDetails = drivers?.filter(
    (driver) => +driver.id === selectedDriver,
  )[0];
  console.log(drivers, selectedDriver);
  const [paymentModal, setPaymentModal] = useState(false);


 

    const confirmRide = async () => {
      try {
        const db = getFirestore();
        const rideDocRef = doc(db, "driverNotifications", "gHNG45Pk6iecvOa87o9OgoOk0Xh2");
    
        // Update the ride confirmation status
        await setDoc(rideDocRef, {
          status: "confirmed",
          confirmedAt: new Date().toISOString(),
          rideId: user.uid,
          userAddress,
          destinationAddress,
          userLongitude,
          userLatitude,
          destinationLongitude,
          destinationLatitude,
       
        });
    
        // Notify the user
        Alert.alert("Success", "Ride has been confirmed!");
      } catch (error) {
        console.error("Error confirming ride:", error);
        Alert.alert("Error", "Failed to confirm the ride. Please try again.");
      }
    };
    
  
  


  // Handle back button press when payment modal is open
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress', 
      () => {
        if (paymentModal) {
          setPaymentModal(false);
          return true; // Prevent default back button behavior
        }
        return false; // Allow default back button behavior
      }
    );

    // Cleanup the event listener when component unmounts
    return () => backHandler.remove();
  }, [paymentModal]);
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
    <RideLayout title="Book Ride">
      <>
        <Text className="text-xl font-JakartaSemiBold mb-3">
          Ride Information
        </Text>

        <View className="flex flex-col w-full items-center justify-center mt-10">
          <Image
            source={{ uri: driverDetails?.car_image_url }}
            className="w-28 h-28 rounded-full"
          />

          <View className="flex flex-row items-center justify-center mt-5 space-x-2">
            <Text className="text-lg font-JakartaSemiBold">
              {driverDetails?.first_name}
            </Text>

            <View className="flex flex-row items-center space-x-0.5">
              <Image
                source={icons.star}
                className="w-5 h-5"
                resizeMode="contain"
              />
              <Text className="text-lg font-JakartaRegular">
                {driverDetails?.rating}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex flex-col w-full items-start justify-center py-3 px-5 rounded-3xl bg-general-600 mt-5">
          <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
            <Text className="text-lg font-JakartaRegular">Ride Price</Text>
            <Text className="text-lg font-JakartaRegular text-[#0CC25F]">
              Ksh  {Math.round(chargingAmount! / 10) * 10}
            </Text>
          </View>

          <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
            <Text className="text-lg font-JakartaRegular">Pickup Time</Text>
            <Text className="text-lg font-JakartaRegular">
            4 min
            </Text>
          </View>

          <View className="flex flex-row items-center justify-between w-full py-3">
            <Text className="text-lg font-JakartaRegular">Car Seats</Text>
            <Text className="text-lg font-JakartaRegular">
              {driverDetails?.car_seats}
            </Text>
          </View>
        </View>

        <View className="flex flex-col w-full items-start justify-center mt-5">
          <View className="flex flex-row items-center justify-start mt-3 border-t border-b border-general-700 w-full py-3">
            <Image source={icons.to} className="w-6 h-6" />
            <Text className="text-lg font-JakartaRegular ml-2">
              {userAddress}
            </Text>
          </View>

          <View className="flex flex-row items-center justify-start border-b border-general-700 w-full py-3">
            <Image source={icons.point} className="w-6 h-6" />
            <Text className="text-lg font-JakartaRegular ml-2">
              {destinationAddress}
            </Text>
          </View>
        </View>

        <CustomButton
  title="Confirm Ride"
  onPress={async () => {
    await confirmRide();
    // Additional code or navigation if needed
  }}
  className="mt-5"
/>
         
      </>
    </RideLayout>
  );
};

export default BookRide;