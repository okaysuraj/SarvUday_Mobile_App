import { View, Text, StyleSheet, Alert } from "react-native";
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import InputBox from "../components/InputBox";
import SubmitButton from "../components/SubmitButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const DoctorLogin = ({ navigation }) => {
  const [state, setState] = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate inputs
      if (!email || !password) {
        Alert.alert("Error", "Please fill all fields");
        setLoading(false);
        return;
      }

      // API call
      const { data } = await axios.post("/doctor/login-doctor", {
        email,
        password
      });

      if (data?.success) {
        console.log("Login successful, doctor data:", data.doctor);
        
        // Prepare auth data
        const authData = {
          user: data.doctor,
          token: data.token,
          role: 'doctor'
        };

        // Save to AsyncStorage
        await AsyncStorage.setItem('@auth', JSON.stringify(authData));
        
        // Update context
        setState(authData);

        Alert.alert("Success", "Login successful!");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Detailed error logging
      if (error.response) {
        console.log("Error response data:", error.response.data);
        console.log("Error response status:", error.response.status);
        console.log("Error response headers:", error.response.headers);
        
        // Show specific error message from API if available
        const errorMsg = error.response.data?.message || "Login failed";
        Alert.alert("Error", errorMsg);
      } else if (error.request) {
        // Request was made but no response received
        console.log("Error request:", error.request);
        Alert.alert("Network Error", "Unable to connect to the server. Please check your internet connection.");
      } else {
        // Something else caused the error
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Optional: Auto-navigation when auth state changes
  useEffect(() => {
    if (state?.user && state?.token && state?.role === 'doctor') {
      navigation.navigate('DoctorHome');
    }
  }, [state]);

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Doctor Login</Text>
      <Text style={styles.subTitle}>Welcome Back 👋</Text>
      
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

        <Text style={styles.linkContainer}>
          New User?{' '}
          <Text 
            style={styles.linkText}
            onPress={() => navigation.navigate('DoctorRegister')}
          >
            Register Here
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7E57C2',
    paddingHorizontal: 20,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 20,
    color: '#FFF',
    marginBottom: 30,
  },
  glassContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputContainer: {
    marginBottom: 20,
  },
  linkContainer: {
    textAlign: 'center',
    marginTop: 20,
    color: '#FFF',
  },
  linkText: {
    color: '#FFC107',
    fontWeight: 'bold',
  },
});

export default DoctorLogin;