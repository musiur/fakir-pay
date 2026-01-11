import { LucideIcon } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";

interface QuickTileProps {
  icon: LucideIcon;
  title: string;
  caption: string;
  color?: string;
  onPress: () => void;
}

export const QuickTile: React.FC<QuickTileProps> = ({
  icon: Icon,
  title,
  caption,
  color,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: color ? `${color}22` : "#ffffff10",
              borderColor: color || "#334155",
            },
          ]}
        >
          <Icon size={20} color={color || "#94a3b8"} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.caption}>{caption}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "99",
    padding: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.slate[100],
    fontSize: 14,
    fontWeight: "500",
  },
  caption: {
    color: Colors.slate[400],
    fontSize: 12,
    marginTop: 2,
  },
});
