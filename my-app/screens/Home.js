import React, { useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/authContext";
import FooterMenu from "../components/FooterMenu";


// Class Data with Navigation Routes
const classData = [
  { id: "1", name: "Assess Yourself", teacher: "Self Evaluation with Standard Quizzes", image: require("../assets/assess.png"), route: "AssessYourself" },
  { id: "2", name: "Chat with SarvUday", teacher: "AI Assistant", image: require("../assets/chat.png"), route: "PastChats" },
  { id: "3", name: "Consult with Experts", teacher: "Professional Help", image: require("../assets/consult.png"), route: "ConsultExperts" },
  { id: "4", name: "Know More", teacher: "Explore More about Mental Disorders", image: require("../assets/knowmore.png"), route: "KnowMore" },
];

const Home = () => {
  const [state] = useContext(AuthContext);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      
      <Text style={styles.header}>Welcome to SarvUday</Text>

      <FlatList
        data={classData}
        keyExtractor={(item) => item.id}
        numColumns={1} // Grid layout
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate(item.route)}>
            <ImageBackground source={item.image} style={styles.cardImage} imageStyle={{ borderRadius: 15 }}>
              <View style={styles.overlay} />
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>{item.teacher}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}
      />

     
      <FooterMenu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#efc6f5", padding: 10, justifyContent: "space-between" },
  header: { fontSize: 22, fontWeight: "bold", padding: 10 },
  card: {
    flex: 1,
    margin: 10,
    borderRadius: 15,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 150,
    justifyContent: "flex-end",
    
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Dark overlay for better text visibility
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
  fab: {
    position: "absolute",
    right: 20,
    bottom: 80, // Adjusted to stay above FooterMenu
    backgroundColor: "#007bff",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
});

export default Home;
