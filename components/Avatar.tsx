import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface AvatarProps {
  name: string;
  color?: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  color = "#475569",
  size = 32,
}) => {
  const getInitials = (n: string) => {
    return n
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
  },
});
