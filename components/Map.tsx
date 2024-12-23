import React, { useEffect, useState, useRef } from "react";
import { Platform } from "react-native";
import { ActivityIndicator, Text, View } from "react-native";
import { useLocationStore } from "@/store";
import { icons } from "@/constants";

// Conditional import for MapView
const MapView = Platform.select({
  android: () => require('react-native-maps').default,
  ios: () => require('react-native-maps').default,
  default: () => {
    // Fallback for web or other platforms
    return (props: any) => (
      <View className="flex justify-center items-center w-full h-full">
        <Text>Map not supported on this platform</Text>
      </View>
    );
  }
})();

const { Marker, PROVIDER_DEFAULT, Polyline } = Platform.select({
  android: () => require('react-native-maps'),
  ios: () => require('react-native-maps'),
  default: () => ({
    Marker: () => null,
    PROVIDER_DEFAULT: null,
    Polyline: () => null
  })
})();

// OpenRouteService API Key
const orsAPIKey = "5b3ce3597851110001cf6248a7377a4f09044b5782559c2687a49270";

const Map = () => {
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();
  
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const mapRef = useRef<any>(null); // Reference to the MapView

  // Fetch the route when destination is set
  useEffect(() => {
    if (userLatitude && userLongitude && destinationLatitude && destinationLongitude) {
      setLoadingRoute(true);

      const fetchRoute = async () => {
        try {
          const response = await fetch(
            `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${orsAPIKey}&start=${userLongitude},${userLatitude}&end=${destinationLongitude},${destinationLatitude}&geometries=geojson`
          );
      
          
          const data = await response.json();

          const distanceInMeters = data.features[0].properties.segments[0].distance;
          const distanceInKilometers = (distanceInMeters / 1000).toFixed(2); // Convert to kilometers
          console.log(`Route Distance: ${distanceInKilometers} km`);
          const coordinates = data.features[0].geometry.coordinates.map(
            ([longitude, latitude]) => ({ latitude, longitude })
          );
          setRouteCoordinates(coordinates);
      
        } catch (error) {
          console.error("Error fetching route:", error);
        } finally {
          setLoadingRoute(false);
        }
      };

      fetchRoute();
    }
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  // Show loading spinner if the route is being fetched or if location is not available
  if (loadingRoute || !userLatitude || !userLongitude) {
    return (
      <View className="flex justify-center items-center w-full h-full">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // Calculate the region for the map based on user location and destination availability
  const getRegion = () => {
    if (destinationLatitude && destinationLongitude) {
      // If destination is available, center the map to both user and destination
      const latitudeDelta = Math.abs( destinationLatitude) / 2;
      const longitudeDelta = Math.abs(destinationLongitude) / 2;
      const zoomLevel = 0.075; // 500 meters approx for zoom level
      
      return {
        latitude: destinationLatitude,
        longitude: destinationLongitude,
        latitudeDelta: zoomLevel,
        longitudeDelta: zoomLevel,
      };
    } else {
      // If destination is not available, zoom to a 500m radius around the user's location
      const zoomLevel = 0.0075; // 500 meters approx for zoom level
      return {
        latitude: userLatitude,
        longitude: userLongitude,
        latitudeDelta: zoomLevel,
        longitudeDelta: zoomLevel,
      };
    }
  };

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_DEFAULT}
      className="w-full h-full rounded-2xl"
      initialRegion={getRegion()}
      showsUserLocation={true}
      userInterfaceStyle="light"
    >
      {/* User Marker */}
      <Marker
        coordinate={{ latitude: userLatitude, longitude: userLongitude }}
        title="You are here"
        image={icons.person}
      />
      
      {/* Destination Marker */}
      {destinationLatitude && destinationLongitude && (
        <Marker
          coordinate={{
            latitude: destinationLatitude,
            longitude: destinationLongitude,
          }}
          title="Destination"
          image={icons.pin}
        />
      )}
      
      {/* Route Polyline */}
      {routeCoordinates.length > 0 && (
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="green"
          strokeWidth={4}
        />
      )}
    </MapView>
  );
};

export default Map;