import { useUser } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import {
  Text,
  Animated,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GoogleTextInput from "@/components/GoogleTextInput";
import Map from "@/components/Map";
import { icons } from "@/constants";
import { useLocationStore, useUserStore } from "@/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GoogleInputProps } from "@/types/type";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Home = ({

  handlePress,
}: GoogleInputProps) => {
  const { signOut } = useAuth();
  const { setUserLocation, setDestinationLocation } = useLocationStore();
  const [collapseAnim] = useState(new Animated.Value(0)); // Initialize the animation value for collapse

  const { user } = useUserStore();


  const handleSignOut = async () => {
    try {
      if (!signOut) {
        console.error("signOut function is not available");
        Alert.alert("Error", "Authentication service not available");
        return;
      }

      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
      Alert.alert(
        "Sign Out Failed",
        "There was an error signing out. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
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

  const handleDestinationPress = (location: { latitude: number; longitude: number; address: string }) => {
    setDestinationLocation(location);
    router.push("/(root)/find-ride");
  };

  const { width: screenWidth } = Dimensions.get("window");
  const getFirstLetter = (name: string | undefined) => {
    return name ? name.charAt(0).toUpperCase() : "";
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle menu visibility
    Animated.timing(collapseAnim, {
      toValue: isMenuOpen ? 0 : 1, // Animate to 0 (closed) or 1 (open)
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const menuAnimation = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenWidth * -0.6, 0], // Menu will slide in from the right
  });

  return (

    <View   className="flex-1 bg-white">


      <View className="flex flex-col items-center justify-center bg-transparent  w-full absolute top-[35] ">
        <GoogleTextInput
          icon={icons.search}
          containerStyle="bg-white shadow-md shadow-neutral-300 self-center"
          handlePress={handleDestinationPress}
        />

      </View>

      {/* Sliding Menu */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: screenWidth * 0.4, // Width of the menu
          height: "100%", // Full height
          backgroundColor: "#fff",
          borderLeftWidth: 1,
          borderLeftColor: "#ccc",
          transform: [{ translateX: menuAnimation }], // Animate sliding
          zIndex: 111,
        }}
      >
        <View className="flex flex-col items-start justify-start p-6 space-y-6">
          {/* Add additional menu items here */}
          <TouchableOpacity
            onPress={() => console.log("Go to Home")}
            style={{
              marginTop: 40,
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 6,
              backgroundColor: "#f0f0f0",
              marginBottom: 10,
              width: "100%",
            }}
          >
            <Text className="text-lg font-semibold text-gray-700">Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => console.log("Go to Settings")}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 6,
              backgroundColor: "#f0f0f0",
              marginBottom: 10,
              width: "100%",
            }}
          >
            <Text className="text-lg font-semibold text-gray-700">Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => console.log("Go to Profile")}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 6,
              backgroundColor: "#f0f0f0",
              marginBottom: 10,
              width: "100%",
            }}
          >
            <Text className="text-lg font-semibold text-gray-700">Profile</Text>
          </TouchableOpacity>

          {/* Sign out button */}
          <TouchableOpacity
            onPress={handleSignOut}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 20,
              backgroundColor: "white",
              marginBottom: 20,
            }}
          >
            <Image source={icons.out} style={{ width: 26, height: 26 }} />
            <Text className="text-lg font-semibold text-gray-700">Log Out</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Main Content */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleMenu}
        className="absolute top-10 right-8 z-50 bg-blue-500 p-2.5 px-4 rounded-full items-center justify-center"
      >
        <Text className="text-2xl text-white">{getFirstLetter(user?.userName)}</Text>
      </TouchableOpacity>

      <Map />

  
     
    </View>


  );
};

export default Home;
