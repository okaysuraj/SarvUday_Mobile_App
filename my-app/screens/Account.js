import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView } from "react-native";
import React, { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/authContext";
import FooterMenu from "../components/FooterMenu";
import { Ionicons } from "@expo/vector-icons";

import axios from "axios";

const Account = () => {
  const [state, setState] = useContext(AuthContext) || [{}];
  const navigation = useNavigation();

  const user = state?.user || {};
  const token = state?.token || "";
  const [name, setName] = useState(user?.name);
  const [city] = useState(user?.city);
  const [phone] = useState(user?.phone);
  const [role] = useState(user?.role);
  const [password, setPassword] = useState(user?.password);
  const [email] = useState(user?.email);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put("/auth/update-user", { name, password, role, email });
      setLoading(false);
      let UD = JSON.stringify(data);
      setState({ ...state, user: UD?.updatedUser });
      alert(data && data.message);
    } catch (error) {
      alert(error.response.data.message);
      setLoading(false);
      console.log(error);
    }
  };

  const handleLogout = async () => {
    setState({token:'', user: null})
    await AsyncStorage.removeItem('@auth')
    alert('logout successful')
}

  return (
    <LinearGradient colors={["#045903", "#3b5998", "#045903"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Image */}
        <View style={styles.profileContainer}>
          <Image
            source={{
              uri: "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o=",
            }}
            style={styles.profileImage}
          />
          <Text style={styles.username}>{user?.name}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Name:</Text>
          <TextInput style={styles.inputBox} value={name} onChangeText={(text) => setName(text)} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Email:</Text>
          <TextInput style={[styles.inputBox, styles.disabledInput]} value={email} editable={false} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Phone:</Text>
          <TextInput style={[styles.inputBox]} value={phone} />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>City:</Text>
          <TextInput style={[styles.inputBox]} value={city} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Role:</Text>
          <TextInput style={[styles.inputBox, styles.disabledInput]} value={role} editable={false} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Password:</Text>
          <TextInput
            style={styles.inputBox}
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
          />
        </View>

       
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>{loading ? "Please Wait..." : "Update Profile"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.button]} onPress={() => navigation.navigate("PastChats")}>
            <Text style={styles.buttonText}>Past Chats</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.button]} onPress={() => navigation.navigate("PastQuizzesScreen")}>
            <Text style={styles.buttonText}>Past Quizzes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.button]} onPress={() => navigation.navigate("AssessmentHistory")}>
            <Text style={styles.buttonText}>Assessment History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={handleLogout}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("SettingsMenu")}>
        <Ionicons name="settings" size={30} color="white" />
      </TouchableOpacity>
      
      <FooterMenu />
    </LinearGradient>
  );
};

// Styles
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 15,
    alignItems: "center",
  },
  profileContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImage: {
    height: 120,
    width: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#fff",
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  warningText: {
    color: "#ffcc00",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 12,
    paddingVertical: 10,
    width: "100%",
  },
  inputText: {
    fontWeight: "bold",
    color: "#fff",
    width: 80,
  },
  inputBox: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    paddingVertical: 5,
  },
  disabledInput: {
    color: "rgba(255,255,255,0.7)",
  },
  buttonContainer: {
    marginTop: 20,
    width: "100%",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  
  signOutButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 80, // Adjusted to stay above FooterMenu
    backgroundColor: "black",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
});

export default Account;
