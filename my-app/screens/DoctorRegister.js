import { View, Text, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import React, { useState } from "react";
import InputBox from "../components/InputBox";
import SubmitButton from "../components/SubmitButton";
import axios from "axios";

const DoctorRegister = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!name || !email || !password || !city || !phone || !specialization || !experience) {
        Alert.alert("Please fill all the fields");
        setLoading(false);
        return;
      }
      const { data } = await axios.post("/doctor/register-doctor", {
        name,
        email,
        password,
        city,
        phone,
        specialization,
        experience,
      });
      Alert.alert("Success", data?.message || "Registration successful!");
      setLoading(false);
      navigation.navigate("DoctorLogin");
      console.log("Register Data ==>", { name, email, password, city, phone, specialization, experience });
    } catch (error) {
      console.error("Registration error:", error);
      
      // Detailed error logging
      if (error.response) {
        console.log("Error response data:", error.response.data);
        console.log("Error response status:", error.response.status);
        console.log("Error response headers:", error.response.headers);
        
        // Show specific error message from API if available
        const errorMsg = error.response.data?.message || "Registration failed";
        Alert.alert("Error", errorMsg);
      } else if (error.request) {
        // Request was made but no response received
        console.log("Error request:", error.request);
        Alert.alert("Network Error", "Unable to connect to the server. Please check your internet connection.");
      } else {
        // Something else caused the error
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
      
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>Doctor Register</Text>
        <Text style={styles.pageSubtitle}>Join Us 🚀</Text>

        <View style={styles.glassContainer}>
          <View style={styles.inputContainer}>
            <InputBox inputTitle="Name" value={name} setValue={setName} />
            <InputBox inputTitle="Email" keyboardType="email-address" autoComplete="email" value={email} setValue={setEmail} />
            <InputBox inputTitle="City" value={city} setValue={setCity} />
            <InputBox inputTitle="Phone" keyboardType="phone-pad" value={phone} setValue={setPhone} />
            <InputBox inputTitle="Specialization" value={specialization} setValue={setSpecialization} />
            <InputBox inputTitle="Experience in Years" keyboardType="numeric" value={experience} setValue={setExperience} />
            <InputBox inputTitle="Password" secureTextEntry={true} value={password} setValue={setPassword} />
          </View>

          <SubmitButton btnTitle="Register" loading={loading} handleSubmit={handleSubmit} />
          <Text style={styles.oneText}>
            Already have an account?{" "}
            <Text style={styles.linkText} onPress={() => navigation.navigate("DoctorLogin")}>
              Doctor Login
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7E57C2", // Purple-Pink Background
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 5,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 5,
  },
  pageSubtitle: {
    fontSize: 20,
    color: "#E1BEE7",
    textAlign: "center",
    marginBottom: 20,
  },
  glassContainer: {
    width: "100%",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  inputContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  linkText: {
    color: "#FFC107",
    fontWeight: "bold",
  },
  oneText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#fff",
  },
});

export default DoctorRegister;
