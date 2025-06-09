import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";

const KnowMore = () => {
  const [disorders, setDisorders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://10.55.17.30:8080/api/know-more");
        setDisorders(res.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, []);

  return (
    <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.container}>
      <ScrollView>
        <Text style={styles.header}>Mental Health Disorders & Coping Strategies</Text>

        {disorders.map((disorder, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.title}>{disorder.name}</Text>
            <Text style={styles.description}>{disorder.description}</Text>
            <Text style={styles.subHeader}>Coping Strategies:</Text>
            {disorder.copingStrategies.map((strategy, i) => (
              <Text key={i} style={styles.strategy}>• {strategy}</Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#fff" },
  card: { backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 10, padding: 15, marginBottom: 15, elevation: 3 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 5, color: "#333" },
  description: { fontSize: 14, color: "#555", marginBottom: 10 },
  subHeader: { fontSize: 16, fontWeight: "bold", marginTop: 5, marginBottom: 5, color: "#333" },
  strategy: { fontSize: 14, color: "#333", marginBottom: 2 },
});

export default KnowMore;
