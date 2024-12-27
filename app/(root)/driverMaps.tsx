import React, { useEffect, useState, useRef } from "react";
import { ActivityIndicator, Text, View, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import MapView,{ Marker, PROVIDER_DEFAULT, Polyline } from "react-native-maps"
import { icons } from "@/constants";


const orsAPIKey = "5b3ce3597851110001cf6248a7377a4f09044b5782559c2687a49270";

const MapScreen = () => {
  const router = useRouter();
  const [locationData, setLocationData] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const mapRef = useRef(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const data = await AsyncStorage.getItem("locationData");
        if (data) {
            setLocationData(JSON.parse(data));
            setTimeout(() => {
                fetchRoute();
            }, 1000);
        } else {
            console.log(data);
            
          console.error("No location data found");
        }
      } catch (error) {
        console.error("Error retrieving location data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchLocationData();

}, []);

 
    const fetchRoute = async () => {
      if (!locationData) return;

      const {
        driverLatitude,
        driverLongitude,
        customerLatitude,
        customerLongitude,
        destinationLatitude,
        destinationLongitude,
      } = locationData;  

      try {
        setLoadingRoute(true);

        // Fetch driver-to-customer route
        const driverToCustomerResponse = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${orsAPIKey}&start=${driverLongitude},${driverLatitude}&end=${customerLongitude},${customerLatitude}&geometries=geojson`
        );
        const driverToCustomerData = await driverToCustomerResponse.json();

        // Fetch customer-to-destination route
        const customerToDestinationResponse = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${orsAPIKey}&start=${customerLongitude},${customerLatitude}&end=${destinationLongitude},${destinationLatitude}&geometries=geojson`
        );
        const customerToDestinationData = await customerToDestinationResponse.json();

        // Merge route coordinates
        const driverToCustomer = driverToCustomerData.features[0].geometry.coordinates.map(
          ([longitude, latitude]) => ({ latitude, longitude })
        );
        const customerToDestination = customerToDestinationData.features[0].geometry.coordinates.map(
          ([longitude, latitude]) => ({ latitude, longitude })
        );

        setRouteCoordinates([...driverToCustomer, ...customerToDestination]);
      } catch (error) {
        console.error("Error fetching route:", error);
      } finally {
        setLoadingRoute(false);
      }
    };

   
 

  if (loadingData || loadingRoute||!routeCoordinates) {
    return (
      <View className="flex justify-center items-center w-full h-full">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!locationData) {
    return (
      <View className="flex justify-center items-center w-full h-full">
        <Text>No location data available</Text>
      </View>
    );
  }

  const {
    driverLatitude,
    driverLongitude,
    customerLatitude,
    customerLongitude,
    destinationLatitude,
    destinationLongitude,
  } = locationData;

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_DEFAULT}
      className="w-full h-full rounded-2xl"
      initialRegion={{
        latitude: parseFloat(driverLatitude),
        longitude: parseFloat(driverLongitude),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      showsUserLocation={true}
    >
      <Marker
        coordinate={{
          latitude: parseFloat(driverLatitude),
          longitude: parseFloat(driverLongitude),
        }}
        image={icons.marker}
        title="Driver"
      />
      <Marker
        coordinate={{   
          latitude: parseFloat(customerLatitude),
          longitude: parseFloat(customerLongitude),
        }}
        image={icons.person}
        title="Customer"
      />
      <Marker
        coordinate={{
          latitude: parseFloat(destinationLatitude),
          longitude: parseFloat(destinationLongitude),
        }}
        title="Destination"
      />
      {routeCoordinates.length > 0 && (
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="blue"
          strokeWidth={4}
        />
      )}
    </MapView>
  );
};

export default MapScreen;
