import { View, Text, StyleSheet, Alert } from "react-native";
import React, { useState } from "react";
import InputBox from "../components/InputBox";
import SubmitButton from "../components/SubmitButton";
import axios from "axios";

const Register = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!name || !email || !password || !city || !phone) {
        Alert.alert("Please fill all the fields");
        setLoading(false);
        return;
      }
      setLoading(false);
      const { data } = await axios.post("/auth/register", {
        name,
        email,
        
        password,
        city,
        phone,
      });
      alert(data && data.message);
      navigation.navigate("Login");
      console.log("Register Data ==>", { name, email, password,city,phone });
    } catch (error) {
      alert(error.response.data.message);
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
            <Text style={styles.pageTitle}>User Registration</Text>

      <Text style={styles.pageTitle}>Join Us 🚀</Text>
      <View style={styles.glassContainer}>
        <View style={styles.inputContainer}>
          <InputBox 
            inputTitle="Name" 
            value={name} 
            setValue={setName} 
            />
          <InputBox
            inputTitle="Email"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            setValue={setEmail}
          />
          <InputBox
            inputTitle="City"
            keyboardType="city"
            autoComplete="city"
            value={city}
            setValue={setCity}
          />
          <InputBox
            inputTitle="Phone"
            keyboardType="phone"
            autoComplete="phone"
            value={phone}
            setValue={setPhone}
          />
          <InputBox
            inputTitle="Password"
            secureTextEntry={true}
            autoComplete="password"
            value={password}
            setValue={setPassword}
          />
        </View>
        <SubmitButton
          btnTitle="Register"
          loading={loading}
          handleSubmit={handleSubmit}
        />
        <Text style={styles.oneText}>
          Already have an account?{" "}
          <Text
            style={styles.linkText}
            onPress={() => navigation.navigate("Login")}
          >
            User Login
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7E57C2", // Purple-Pink Background
    paddingHorizontal: 20,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 5,
  },
  glassContainer: {
    width: "100%",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    
    backdropFilter: "blur(15px)",
  },
  inputContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
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

export default Register;
