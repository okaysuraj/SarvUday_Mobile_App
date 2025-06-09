import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import questionsData from "../assets/bdi.json";

const BDI = () => {
  const navigation = useNavigation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(new Array(questionsData.length).fill(null));
  const [score, setScore] = useState(null);

  const handleAnswer = (selectedScore) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = selectedScore;
    setAnswers(updatedAnswers);

    if (currentQuestion < questionsData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult(updatedAnswers);
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = async (responses) => {
    const totalScore = responses.reduce((sum, val) => sum + (val ?? 0), 0);
    setScore(totalScore);

    // 👇 Getting the remark based on the score
    const remark = getRemark(totalScore);

    // 👇 Storing the result to MongoDB
    try {
      const token = await AsyncStorage.getItem('token');
 
      await axios.post('http://10.55.17.30:8080/api/quizzes/submit', {
        
        quizType: "BDI",
        score: totalScore,
        remark: remark
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Quiz result successfully saved!");
    } catch (error) {
      console.error("Error saving quiz result:", error.message);
    }
  };

  const getRemark = (score) => {
    if (score < 5) return "Minimal Depression";
    if (score < 10) return "Mild Depression";
    if (score < 15) return "Moderate Depression";
    if (score < 20) return "Moderately Severe Depression";
    return "Severe Depression";
  };

  return (
    <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.container}>
      {score === null ? (
        <>
          <Text style={styles.question}>{questionsData[currentQuestion].question}</Text>
          <FlatList
            data={questionsData[currentQuestion].options}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.option} onPress={() => handleAnswer(item.score)}>
                <Text style={styles.optionText}>{item.text}</Text>
              </TouchableOpacity>
            )}
          />
          <View style={styles.navButtons}>
            {currentQuestion > 0 && (
              <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Your Score: {score}</Text>
          <Text style={styles.remarkText}>{getRemark(score)}</Text>
          <TouchableOpacity
            style={styles.restartButton}
            onPress={() => {
              setCurrentQuestion(0);
              setScore(null);
              setAnswers(new Array(questionsData.length).fill(null));
            }}
          >
            <Text style={styles.restartText}>Restart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.homeButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  question: { fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#fff" },
  option: { backgroundColor: "rgba(255, 255, 255, 0.3)", padding: 15, borderRadius: 10, marginVertical: 10, alignItems: "center" },
  optionText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  navButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  backButton: { backgroundColor: "#FF9800", padding: 10, borderRadius: 10, alignSelf: "center" },
  backButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  resultContainer: { alignItems: "center" },
  resultText: { fontSize: 24, fontWeight: "bold", marginBottom: 10, color: "#fff" },
  remarkText: { fontSize: 18, color: "#ddd" },
  restartButton: { backgroundColor: "gray", padding: 12, borderRadius: 10, marginTop: 20 },
  restartText: { color: "white", fontSize: 16, fontWeight: "bold" },
  homeButton: { backgroundColor: "blue", padding: 12, borderRadius: 10, marginTop: 10 },
  homeButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default BDI;
