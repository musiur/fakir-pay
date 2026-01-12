import React from "react";
import { Image, StyleSheet, View } from "react-native";

interface LogoProps {
  size?: "small" | "medium" | "large";
}

export const Logo: React.FC<LogoProps> = ({ size = "medium" }) => {
  const getImageStyle = () => {
    switch (size) {
      case "small":
        return styles.imageSmall;
      case "large":
        return styles.imageLarge;
      default:
        return styles.imageMedium;
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../app/(tabs)/logo.png")}
        style={getImageStyle()}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    justifyContent: "center",
  },
  imageSmall: {
    width: 80,
    height: 24,
  },
  imageMedium: {
    width: 120,
    height: 36,
  },
  imageLarge: {
    width: 200,
    height: 60,
  },
});