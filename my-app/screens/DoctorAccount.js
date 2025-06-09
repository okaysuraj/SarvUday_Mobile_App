import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, SafeAreaView } from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/authContext";
import DoctorFooterMenu from "../components/DoctorFooterMenu";
import DoctorHeader from "../components/DoctorHeader";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

const DoctorAccount = () => {
  const [state, setState] = useContext(AuthContext) || [{}, () => {}];
  const navigation = useNavigation();

  // State for doctor data
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");
  const [originalData, setOriginalData] = useState({});
  const [dataChanged, setDataChanged] = useState(false);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      setState({ token: '', user: null, role: '' });
      await AsyncStorage.removeItem('@auth');
      Alert.alert("Success", "Logout successful");
      navigation.replace("DoctorLogin");
    } catch (error) {
      console.log("Logout error:", error);
      Alert.alert("Error", "Logout failed");
    }
  };

  // Initialize data from AuthContext or fetch from API
  useEffect(() => {
    const initializeData = async () => {
      try {
        setFetchingData(true);
        
        console.log("AuthContext state:", state);
        
        if (state && state.user) {
          // If user data is in context, use it
          const doctorData = state.user;
          console.log("Doctor data from context:", doctorData);
          
          // Set state with data from context
          setName(doctorData.name || "");
          setSpecialization(doctorData.specialization || "");
          setExperience(doctorData.experience ? doctorData.experience.toString() : "");
          setPhone(doctorData.phone || "");
          setEmail(doctorData.email || "");
          
          // Store original data to check for changes
          setOriginalData({
            name: doctorData.name,
            specialization: doctorData.specialization,
            experience: doctorData.experience,
            phone: doctorData.phone,
            email: doctorData.email
          });
        } else if (state && state.token) {
          // If we have a token but no user data, fetch from the server
          console.log("Fetching doctor data using token...");
          
          try {
            // Use the new profile endpoint to get doctor data
            const { data } = await axios.get("/doctor/profile");
            
            if (data && data.success && data.doctor) {
              const doctorData = data.doctor;
              console.log("Doctor data from API:", doctorData);
              
              // Set state with data from API
              setName(doctorData.name || "");
              setSpecialization(doctorData.specialization || "");
              setExperience(doctorData.experience ? doctorData.experience.toString() : "");
              setPhone(doctorData.phone || "");
              setEmail(doctorData.email || "");
              
              // Store original data to check for changes
              setOriginalData({
                name: doctorData.name,
                specialization: doctorData.specialization,
                experience: doctorData.experience,
                phone: doctorData.phone,
                email: doctorData.email
              });
              
              // Update context with the doctor data
              const updatedAuth = {
                ...state,
                user: doctorData
              };
              
              setState(updatedAuth);
              await AsyncStorage.setItem('@auth', JSON.stringify(updatedAuth));
              
              console.log("Updated auth state with doctor data from API");
            } else {
              throw new Error("Failed to fetch doctor profile");
            }
          } catch (apiError) {
            console.log("Error fetching doctor profile:", apiError);
            
            // If API call fails, try to get data from AsyncStorage
            const asyncData = await AsyncStorage.getItem('@auth');
            
            if (asyncData) {
              const parsedData = JSON.parse(asyncData);
              
              if (parsedData && parsedData.user) {
                const doctorData = parsedData.user;
                
                // Set state with data from AsyncStorage
                setName(doctorData.name || "");
                setSpecialization(doctorData.specialization || "");
                setExperience(doctorData.experience ? doctorData.experience.toString() : "");
                setPhone(doctorData.phone || "");
                setEmail(doctorData.email || "");
                
                // Store original data to check for changes
                setOriginalData({
                  name: doctorData.name,
                  specialization: doctorData.specialization,
                  experience: doctorData.experience,
                  phone: doctorData.phone,
                  email: doctorData.email
                });
                
                console.log("Using doctor data from AsyncStorage");
              } else {
                setError("No user data found. Please log in again.");
              }
            } else {
              setError("No user data found. Please log in again.");
            }
          }
        } else {
          console.log("No token or user data in context:", state);
          
          // Try to get data directly from AsyncStorage as a fallback
          const asyncData = await AsyncStorage.getItem('@auth');
          console.log("AsyncStorage data:", asyncData);
          
          if (asyncData) {
            const parsedData = JSON.parse(asyncData);
            console.log("Parsed AsyncStorage data:", parsedData);
            
            if (parsedData && parsedData.user) {
              const doctorData = parsedData.user;
              
              // Set state with data from AsyncStorage
              setName(doctorData.name || "");
              setSpecialization(doctorData.specialization || "");
              setExperience(doctorData.experience ? doctorData.experience.toString() : "");
              setPhone(doctorData.phone || "");
              setEmail(doctorData.email || "");
              
              // Store original data to check for changes
              setOriginalData({
                name: doctorData.name,
                specialization: doctorData.specialization,
                experience: doctorData.experience,
                phone: doctorData.phone,
                email: doctorData.email
              });
              
              // Update context with data from AsyncStorage
              setState(parsedData);
            } else if (parsedData && parsedData.token) {
              // If we have a token in AsyncStorage but no user data, redirect to fetch data
              console.log("Token found in AsyncStorage, updating state and reloading");
              setState(parsedData);
              // The component will re-render and try to fetch data with the token
            } else {
              setError("No user data found. Please log in again.");
            }
          } else {
            setError("No user data found. Please log in again.");
          }
        }
      } catch (error) {
        console.log("Error initializing doctor data:", error);
        setError("Error loading your profile data. Please try again.");
      } finally {
        setFetchingData(false);
      }
    };

    initializeData();
  }, [state.token]);

  // Check if data has changed from original
  useEffect(() => {
    if (originalData.name) {
      const hasChanged = 
        name !== originalData.name ||
        specialization !== originalData.specialization ||
        experience !== originalData.experience?.toString() ||
        phone !== originalData.phone;
      
      setDataChanged(hasChanged);
    }
  }, [name, specialization, experience, phone, originalData]);

  const handleUpdate = async () => {
    // Validate password is provided
    if (!password) {
      Alert.alert("Password Required", "Please enter your password to update your profile");
      return;
    }

    // Validate experience is a number
    if (experience && isNaN(parseInt(experience))) {
      Alert.alert("Invalid Input", "Experience must be a number");
      return;
    }

    try {
      setLoading(true);
      console.log("Updating profile with data:", { 
        name, 
        specialization, 
        experience: experience ? parseInt(experience) : 0, 
        phone,
        email 
      });
      
      // Update on the server
      const { data } = await axios.post("/doctor/update-doctor", { 
        name, 
        password, 
        specialization, 
        experience: experience ? parseInt(experience) : 0, 
        phone,
        email 
      });
      
      console.log("Update response:", data);
      
      if (data && data.success) {
        // Get the updated doctor data
        const updatedDoctor = data.updatedUser || {
          ...state.user,
          name,
          specialization,
          experience: experience ? parseInt(experience) : 0,
          phone,
          email
        };
        
        console.log("Updated doctor data:", updatedDoctor);
        
        // Update local storage and context
        const updatedAuth = {
          ...state,
          user: updatedDoctor
        };
        
        console.log("Updated auth state:", updatedAuth);
        setState(updatedAuth);
        await AsyncStorage.setItem('@auth', JSON.stringify(updatedAuth));
        
        // Update original data
        setOriginalData({
          name: updatedDoctor.name,
          specialization: updatedDoctor.specialization,
          experience: updatedDoctor.experience,
          phone: updatedDoctor.phone,
          email: updatedDoctor.email
        });
        
        // Clear password field
        setPassword("");
        setDataChanged(false);
        
        Alert.alert("Success", "Profile updated successfully");
        
        // Refresh the profile data
        try {
          const { data: profileData } = await axios.get("/doctor/profile");
          if (profileData && profileData.success && profileData.doctor) {
            const refreshedDoctor = profileData.doctor;
            
            // Update context with refreshed data
            const refreshedAuth = {
              ...state,
              user: refreshedDoctor
            };
            
            setState(refreshedAuth);
            await AsyncStorage.setItem('@auth', JSON.stringify(refreshedAuth));
            
            // Update UI with refreshed data
            setName(refreshedDoctor.name || "");
            setSpecialization(refreshedDoctor.specialization || "");
            setExperience(refreshedDoctor.experience ? refreshedDoctor.experience.toString() : "");
            setPhone(refreshedDoctor.phone || "");
            setEmail(refreshedDoctor.email || "");
            
            console.log("Profile refreshed after update");
          }
        } catch (refreshError) {
          console.log("Error refreshing profile after update:", refreshError);
          // Continue with the already updated data
        }
      } else {
        Alert.alert("Update Failed", data?.message || "Failed to update profile");
      }
    } catch (error) {
      console.log("Error updating profile:", error);
      console.log("Error details:", error.response?.data);
      
      Alert.alert(
        "Error", 
        error.response?.data?.message || "Update failed. Please check your password and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // The handleLogout function is already defined above

  return (
    <LinearGradient colors={["#7E57C2", "#5E35B1", "#4527A0"]} style={styles.gradient}>
      {/* Use the reusable DoctorHeader component */}
      <DoctorHeader title="Doctor Profile" />
      
      {fetchingData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.container}>
            {/* Error message if any */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => navigation.replace("DoctorAccount")}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Profile Image */}
                <View style={styles.profileContainer}>
                  <View style={styles.profileImageContainer}>
                    <FontAwesome5 name="user-md" size={50} color="#FFF" style={styles.profileIcon} />
                  </View>
                  <Text style={styles.username}>Dr. {name}</Text>
                  <Text style={styles.subtitle}>
                    {specialization} {experience ? `• ${experience} years experience` : ''}
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputText}>Name:</Text>
                  <TextInput 
                    style={styles.inputBox} 
                    value={name} 
                    onChangeText={(text) => setName(text)} 
                    placeholder="Your name"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputText}>Email:</Text>
                  <TextInput 
                    style={[styles.inputBox, styles.disabledInput]} 
                    value={email} 
                    editable={false} 
                    placeholder="Your email"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputText}>Phone:</Text>
                  <TextInput 
                    style={styles.inputBox} 
                    value={phone} 
                    onChangeText={(text) => setPhone(text)}
                    placeholder="Your phone number"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputText}>Specialty:</Text>
                  <TextInput 
                    style={styles.inputBox} 
                    value={specialization} 
                    onChangeText={(text) => setSpecialization(text)}
                    placeholder="Your specialization"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputText}>Experience:</Text>
                  <TextInput 
                    style={styles.inputBox} 
                    value={experience} 
                    onChangeText={(text) => setExperience(text)}
                    placeholder="Years of experience"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="numeric"
                  />
                </View>

                {dataChanged && (
                  <View style={styles.passwordNote}>
                    <Ionicons name="information-circle" size={20} color="#FFF" style={styles.infoIcon} />
                    <Text style={styles.passwordNoteText}>
                      Enter your password below to save changes
                    </Text>
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Text style={styles.inputText}>Password:</Text>
                  <TextInput
                    style={styles.inputBox}
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                    secureTextEntry={true}
                    placeholder="Enter password to update profile"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={[styles.button, (!dataChanged && !password) && styles.disabledButton]} 
                    onPress={handleUpdate}
                    disabled={!dataChanged && !password}
                  >
                    {loading ? (
                      <View style={styles.loadingButton}>
                        <ActivityIndicator size="small" color="#FFF" />
                        <Text style={styles.buttonText}>Updating...</Text>
                      </View>
                    ) : (
                      <Text style={styles.buttonText}>Update Profile</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.button]} onPress={() => navigation.navigate("DoctorChat")}>
                    <Text style={styles.buttonText}>Message History</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.button]} onPress={() => navigation.navigate("Appointments")}>
                    <Text style={styles.buttonText}>Appointment History</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.button]} onPress={() => navigation.navigate("PatientHistory")}>
                    <Text style={styles.buttonText}>Patient Records</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={handleLogout}>
                    <Text style={styles.buttonText}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
          
          <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("DoctorSettings")}>
            <Ionicons name="settings" size={30} color="white" />
          </TouchableOpacity>
        </>
      )}
      
      <DoctorFooterMenu />
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
    paddingBottom: 100, // Space for footer menu
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFF",
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
    width: "100%",
  },
  errorText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#7E57C2",
    fontWeight: "bold",
  },
  profileContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImageContainer: {
    height: 120,
    width: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileIcon: {
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 5,
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
    width: 90,
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
  passwordNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: "#FFF",
  },
  infoIcon: {
    marginRight: 10,
  },
  passwordNoteText: {
    color: "#FFF",
    fontSize: 14,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 20,
    width: "100%",
  },
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
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
  disabledButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    opacity: 0.7,
  },
  loadingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  signOutButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 80, // Adjusted to stay above FooterMenu
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
});

export default DoctorAccount;