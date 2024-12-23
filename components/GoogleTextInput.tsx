import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import axios from "axios";

import { icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";

const MapboxTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (text: string) => {
    if (!text) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get("https://api.foursquare.com/v3/places/search", {
        headers: {
          Authorization: "fsq3NokxPk5MsWoHKVuOvb+M0ZwCvu81xVw42nT5wpWXRhg=",
          Accept: "application/json",
        },
        params: {
          query: text,
          near: "kenya",
          limit: 5,
        },
      });
      setSuggestions(response.data.results || []);
    } catch (error) {
      console.error("Error fetching Foursquare suggestions:", error.response?.data || error.message);
    }
  };

  const handleSelect = async (item: any) => {
    const { geocodes, name, location } = item;

    const locationData = {
      latitude: geocodes.main.latitude,
      longitude: geocodes.main.longitude,
      address: `${name}, ${location.address || "No address provided"}`,
    };

    try {
      // Get existing locations from AsyncStorage
      const existingLocations = await AsyncStorage.getItem("locations");
      const locationsArray = existingLocations ? JSON.parse(existingLocations) : [];

      // Add the new location
      const updatedLocations = [...locationsArray, locationData];

      // Save back to AsyncStorage
      await AsyncStorage.setItem("locations", JSON.stringify(updatedLocations));

      console.log("Location saved successfully:", locationData);

      // Pass the selected location to handlePress
      handlePress(locationData);
    } catch (error) {
      console.error("Error saving location data:", error);
    }

    setSuggestions([]); // Clear suggestions
  };

  return (
    <View
      className={`flex flex-row items-center relative z-50 ${containerStyle}`}
      style={{
        width: "90%",
        alignSelf: "center",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        paddingHorizontal: 12,
        paddingVertical: 20,
        backgroundColor: "#fff",
      }}
    >
      <View style={{ marginRight: 10 }}>
        <Image
          source={icon || icons.search}
          style={{
            width: 20,
            height: 20,
            tintColor: "#121212",
          }}
          resizeMode="contain"
        />
      </View>
      <TextInput
        style={{
          flex: 1,
          fontSize: 16,
          color: "#333",
          padding: 0,
        }}
        placeholder={initialLocation || "Where are you going?"}
        placeholderTextColor="#121212"
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          fetchSuggestions(text);
        }}
      />
      {suggestions.length > 0 && (
        <FlatList
          style={{
            position: "absolute",
            top: 70,
            left: 0,
            right: 0,
            marginHorizontal: 12,
            borderRadius: 12,
            backgroundColor: "#fff",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 6,
            elevation: 4,
          }}
          data={suggestions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 20,
                paddingHorizontal: 16,
                borderBottomWidth:
                  item !== suggestions[suggestions.length - 1] ? 1 : 0,
                borderBottomColor: "#f0f0f0",
              }}
            >
              <Image
                source={icons.pin}
                style={{
                  width: 19,
                  height: 19,
                  tintColor: "blue-500",
                  marginRight: 8,
                }}
                resizeMode="contain"
              />
              <Text className="text-bold" style={{ fontSize: 15, color: "#333" }}>
                {item.name}, {item.location?.address || "No address provided"}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Your styles here
});

export default MapboxTextInput;
