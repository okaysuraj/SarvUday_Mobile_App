import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

// Sample card data
const assessOptions = [
  { id: "1", name: "PHQ-9", description: "Patient Health Questionnaire-9", image: require("../assets/chat.png"), route: "PHQ9" },
  { id: "2", name: "BDI", description: "Beck Depression Inventory", image: require("../assets/knowmore.png"), route: "BDI" },
  { id: "3", name: "HDRS", description: "Hamilton Depression Rating Scale", image: require("../assets/consult.png"), route: "HDRS" },
];

const Assessment = () => {
  const navigation = useNavigation();

  return (
    <LinearGradient colors={["#E6A8E0", "#C29CE2"]} style={styles.container}>
      <Text style={styles.header}>Choose any Quiz</Text>

      <FlatList
        data={assessOptions}
        keyExtractor={(item) => item.id}
        numColumns={1}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate(item.route)}>
            <ImageBackground source={item.image} style={styles.cardImage} imageStyle={{ borderRadius: 15 }}>
              <View style={styles.overlay} />
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>{item.description}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontSize: 22, fontWeight: "bold", padding: 10, textAlign: "center", color: "#0c1c17" },
  card: {
    flex: 1,
    margin: 10,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
  },
  cardImage: {
    width: "100%",
    height: 150,
    justifyContent: "flex-end",
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 15,
  },
  textContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "white", textAlign: "center" },
  cardSubtitle: { fontSize: 14, color: "#ddd", textAlign: "center", marginTop: 5 },
});

export default Assessment;
