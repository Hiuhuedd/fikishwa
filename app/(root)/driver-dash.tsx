import { useEffect, useState } from "react";
import { ScrollView, Text, View, Switch, Button, Alert, Modal, Pressable,  RefreshControl} from "react-native";
import { useUserStore, DriverDetailsStore, useLocationStore } from "@/store";
import * as Location from "expo-location";
import { doc, getDoc, getFirestore, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../(auth)/firebase";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { data } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [rides, setRides] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [selectedRide, setSelectedRide] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useUserStore(); // Fetch user data
  const { driver, setDriver } = DriverDetailsStore(); // Fetch and set driver details
  const { userLongitude, userLatitude, userAddress, setUserLocation } = useLocationStore();

  const toggleOnlineStatus = () => setIsOnline((prev) => !prev);

  const fetchDriver = async () => {
    try {
      const driverDoc = await getDoc(doc(db, "driverDetails", user.uid));
      if (driverDoc.exists()) {
        const userData = driverDoc.data();
        setDriver({
          uid: user.uid,
          email: user.email,
          carModel: userData.carModel,
          phone: user.phone,
          plate: userData.plate,
        });
      }
    } catch (error) {
      console.error("Error fetching driver details:", error);
      Alert.alert("Error", "An error occurred while fetching driver details.");
    }
  };

  const fetchDriverRidesAndEarnings = async () => {
    try {
      const ridesDoc = await getDoc(doc(db, "driverRides", user.uid));
      if (ridesDoc.exists()) {
        const { rides, totalEarnings } = ridesDoc.data();
        setRides(rides || []);
        setEarnings(totalEarnings || 0);
      }
    } catch (error) {
      console.error("Error fetching rides and earnings:", error);
      Alert.alert("Error", "An error occurred while fetching rides and earnings.");
    }
  };

  const fetchUser = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setCustomerDetails(userDoc.data());
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const acceptRide = async () => {
    try {
      await updateDoc(doc(db, "driverNotifications", user.uid.toString()), {
        status: "accepted",
      });
      setModalVisible(false);
    } catch (error) {
      console.error("Error accepting ride:", error);
      Alert.alert("Error", "Could not accept the ride.");
    }
  
    const data = {
      driverLatitude: userLatitude,
      driverLongitude: userLongitude,
      customerLatitude: selectedRide.userLatitude,
      customerLongitude: selectedRide.userLongitude,
      destinationLatitude: selectedRide.destinationLatitude,
      destinationLongitude: selectedRide.destinationLongitude,
    };
  
    try {
      await AsyncStorage.setItem('locationData', JSON.stringify(data));
      console.log('Location data saved successfully');
  
      // Check if location data is saved and route to map
      const savedData = await AsyncStorage.getItem('locationData');
      if (savedData) {
        router.push({
          pathname: "/driverMaps",
        });
      } else {
        Alert.alert("Error", "Location data not found.");
      }
    } catch (error) {
      console.error('Error saving location data:', error);
      Alert.alert('Error', 'Could not save location data.');
    }
  };
  
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "driverNotifications", user.uid.toString()),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setSelectedRide(data);
          fetchUser(data.rideId);
          setModalVisible(true);
          console.log(data);
        }
        
      },
      (error) => {
        console.error("Error fetching driver notifications:", error);
      }
    );
    return () => unsubscribe();
  }, [refreshing]);

  useEffect(() => {
    fetchDriver();
    fetchDriverRidesAndEarnings();
  }, [user]);


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

  const onRefresh = async () => {
    setRefreshing(true);
   
  };
  return (
    <ScrollView className="flex-1 bg-gray-100 p-5"  refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
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
        <Text className="text-xl font-semibold text-gray-800 mb-2">Vehicle Information</Text>
        <Text className="text-gray-700">Car Model: {driver?.carModel || "N/A"}</Text>
        <Text className="text-gray-700">Plate: {driver?.plate || "N/A"}</Text>
        <Text className="text-gray-700">Email: {driver?.email || "N/A"}</Text>
        <Text className="text-gray-700">Phone: {driver?.phone || "N/A"}</Text>
      </View>

      {/* Location Information */}
      <View className="mb-8 bg-white p-5 rounded-lg shadow-md">
        <Text className="text-xl font-semibold text-gray-800 mb-2">Current Location</Text>
        <Text className="text-gray-700">{userAddress || "Fetching..."}</Text>
      </View>

      {/* Recent Rides */}
      <View className="mb-8 bg-white p-5 rounded-lg shadow-md">
        <Text className="text-xl font-semibold text-gray-800 mb-2">Recent Rides</Text>
        {rides.length > 0 ? (
          rides.map((ride, index) => (
            <Pressable
              key={index}
              onPress={() => {
                setSelectedRide(ride);
                setModalVisible(true);
              }}
              className="p-3 bg-gray-100 rounded-lg mb-2"
            >
              <Text className="text-gray-700">
                {ride.startLocation} ➡ {ride.destination} - {ride.status}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text className="text-gray-700">No rides available.</Text>
        )}
      </View>

      {/* Earnings */}
      <View className="mb-8 bg-white p-5 rounded-lg shadow-md">
        <Text className="text-xl font-semibold text-gray-800 mb-2">Total Earnings</Text>
        <Text className="text-green-600 text-lg font-bold">${earnings.toFixed(2)}</Text>
      </View>

      {/* Availability Switch */}
      <View className="mb-8 bg-white p-5 rounded-lg shadow-md">
        <Text className="text-xl font-semibold text-gray-800 mb-2">Availability Status</Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-700">{isOnline ? "Online" : "Offline"}</Text>
          <Switch value={isOnline} onValueChange={toggleOnlineStatus} />
        </View>  
      </View>
  
      {/* Logout Button */}
      <View className="mb-28">
        <Button title="Log Out" onPress={() =>  router.replace("/(auth)/sign-in")} color="#d9534f" />
      </View>

     {/* Ride Details Modal */}
     {selectedRide && customerDetails && (
   <Modal
   animationType="slide"
   transparent={true}
   visible={modalVisible}
   onRequestClose={() => setModalVisible(false)}
 >
   <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
     <View className="bg-white p-6 rounded-2xl w-11/12 shadow-lg">
       {/* Modal Header */}
       <View className="flex-row justify-between items-center mb-4 ph-5">
         <Text className="text-xl font-bold text-gray-800">Ride Details</Text>
         <Text className="text-xl font-bold text-gray-800">KES 240/=</Text>
       
       </View>
 
       {/* Ride Information */}
       <View className="space-y-4">
         <View className="flex-row items-center space-x-3">
           <FontAwesome name="map-marker" size={20} color="#4A90E2" />
           <Text className="text-gray-700">
             <Text className="font-semibold">Customer Location:</Text> {selectedRide.userAddress}
           </Text>
         </View>
         <View className="flex-row items-center space-x-3">
           <FontAwesome name="location-arrow" size={20} color="#4A90E2" />
           <Text className="text-gray-700">
             <Text className="font-semibold">Destination:</Text> {selectedRide.destinationAddress}
           </Text>
         </View>
         <View className="flex-row items-center space-x-3">
           <MaterialIcons name="phone" size={20} color="#34D399" />
           <Text className="text-gray-700">
             <Text className="font-semibold">Customer Phone:</Text> {customerDetails.phone}
           </Text>
         </View>
         <View className="flex-row items-center space-x-3">
           <MaterialIcons name="email" size={20} color="#F97316" />
           <Text className="text-gray-700">
             <Text className="font-semibold">Customer Email:</Text> {customerDetails.email}
           </Text>
         </View>
         <View className="flex-row items-center space-x-3">
           <FontAwesome name="user" size={20} color="#9CA3AF" />
           <Text className="text-gray-700">
             <Text className="font-semibold">Customer Username:</Text> {customerDetails.username}
           </Text>
         </View>
       </View>
 
       {/* Action Buttons */}
       <View className="flex-row justify-between mt-6">
         <Pressable
           onPress={()=>{acceptRide()}}
           className="flex-1 bg-green-500 p-3 rounded-lg mr-2 flex-row items-center justify-center"
         >
           <MaterialIcons name="check-circle" size={20} color="white" />
           <Text className="text-white text-center font-medium ml-2">Accept Ride</Text>
         </Pressable>
         <Pressable
           onPress={() => setModalVisible(false)}
           className="flex-1 bg-gray-200 p-3 rounded-lg flex-row items-center justify-center"
         >
           <MaterialIcons name="cancel" size={20} color="#6B7280" />
           <Text className="text-gray-700 text-center font-medium ml-2">Cancel</Text>
         </Pressable>
       </View>
     </View>
   </View>
 </Modal>
  
     
      )}
    </ScrollView>
  );
};

export default DriverDashboard;
