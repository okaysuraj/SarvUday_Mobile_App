import { View, Text, StyleSheet, Alert } from "react-native";
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/authContext";
import InputBox from "../components/InputBox";
import SubmitButton from "../components/SubmitButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const Login = ({ navigation }) => {
  const [state, setState] = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!email || !password) {
        Alert.alert("Please fill all the fields");
        setLoading(false);
        return;
      }
      setLoading(false);
      const { data } = await axios.post("/auth/login", { email, password });
      setState(data);
      await AsyncStorage.setItem("@auth", JSON.stringify(data));
      await AsyncStorage.setItem("token", data.token);
      alert(data && data.message);
      navigation.navigate("Home");
      console.log("Login Data ==>", { email, password });
      const token = await AsyncStorage.getItem("token");
      console.log("Saved Token:", token);
    } catch (error) {
      alert(error.response.data.message);
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
            <Text style={styles.pageTitle}>User Login</Text>

      <Text style={styles.pageTitle}>Welcome Back 👋</Text>
      <View style={styles.glassContainer}>
        <View style={styles.inputContainer}>
          <InputBox
            inputTitle="Email"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            setValue={setEmail}
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
          btnTitle="Login"
          loading={loading}
          handleSubmit={handleSubmit}
        />
        <Text style={styles.oneText}>
          New User?{" "}
          <Text
            style={styles.linkText}
            onPress={() => navigation.navigate("Register")}
          >
            User Register
          </Text>
        </Text>
        <Text style={styles.oneText}>
          Looking for Doctor Portal?{" "}
          <Text
            style={styles.linkText}
            onPress={() => navigation.navigate("DoctorLogin")}
          >
            Doctor Login
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
    backgroundColor: "#7E57C2", // Purple-Pink Gradient Background
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

export default Login;
