import React, { useState, useEffect, useContext } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground, 
  ActivityIndicator,
  Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import FooterMenu from "../components/FooterMenu";
import axios from "axios";
import { AuthContext } from "../context/authContext";

// Default images for different specializations
const specializationImages = {
  "Psychiatrist": require("../assets/assess.png"),
  "Clinical Psychologist": require("../assets/knowmore.png"),
  "Neurologist": require("../assets/chat.png"),
  "default": require("../assets/chat.png") // Default image
};

const ConsultExperts = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [state] = useContext(AuthContext);
  const navigation = useNavigation();
  
  useEffect(() => {
    fetchDoctors();
  }, []);
  
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      
      // First try the API endpoint
      try {
        const response = await axios.get("http://10.55.17.30:8080/api/v1/doctor/get-all-doctors");
        
        if (response.data && response.data.success) {
          // Transform the data to match our component's expected format
          const formattedDoctors = response.data.doctors.map(doctor => ({
            id: doctor._id || doctor.doctorId,
            name: doctor.name,
            specialization: doctor.specialization,
            location: `${doctor.city}, India`,
            // Select image based on specialization or use default
            image: specializationImages[doctor.specialization] || specializationImages.default,
            // Include additional data that might be useful
            experience: doctor.experience,
            profilePic: doctor.profilePic
          }));
          
          setDoctors(formattedDoctors);
          setError(null);
          return; // Exit early if API call succeeds
        }
      } catch (apiError) {
        console.error("API error:", apiError);
        // Continue to fallback if API fails
      }
      
      // Fallback to hardcoded data if API fails
      console.log("Falling back to hardcoded doctor data");
      const fallbackDoctors = [
        { 
          id: "1", 
          name: "Dr. Ananya Sharma", 
          specialization: "Psychiatrist", 
          location: "Mumbai, India", 
          image: specializationImages["Psychiatrist"],
          experience: 8
        },
        { 
          id: "2", 
          name: "Dr. Rajesh Verma", 
          specialization: "Clinical Psychologist", 
          location: "Delhi, India", 
          image: specializationImages["Clinical Psychologist"],
          experience: 12
        },
        { 
          id: "3", 
          name: "Dr. Priya Mehta", 
          specialization: "Neurologist", 
          location: "Bangalore, India", 
          image: specializationImages["Neurologist"],
          experience: 10
        },
      ];
      
      setDoctors(fallbackDoctors);
      setError(null);
      
    } catch (error) {
      console.error("Error in fetchDoctors:", error);
      setError("Failed to load doctors information");
      Alert.alert("Error", "Could not load doctors. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Consult Experts</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchDoctors}
          disabled={loading}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loaderText}>Loading experts...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDoctors}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : doctors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No experts available at the moment.</Text>
          <Text style={styles.emptySubtext}>Please check back later or contact support.</Text>
        </View>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id}
          numColumns={1}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => navigation.navigate("DoctorDetails", { doctor: item })}
            >
              <ImageBackground 
                source={item.image} 
                style={styles.cardImage} 
                imageStyle={{ borderRadius: 15 }}
                defaultSource={specializationImages.default} // Fallback image if the main one fails
              >
                <View style={styles.overlay} />
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSubtitle}>{item.specialization}</Text>
                  <Text style={styles.cardSubtitle}>{item.location}</Text>
                  {item.experience && (
                    <Text style={styles.cardExperience}>{item.experience} years experience</Text>
                  )}
                </View>
              </ImageBackground>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Footer Menu */}
      <FooterMenu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#efc6f5", 
    padding: 10, 
    justifyContent: "space-between" 
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  header: { 
    fontSize: 22, 
    fontWeight: "bold", 
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 10,
  },
  card: {
    flex: 1,
    margin: 10,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: "100%",
    height: 160,
    justifyContent: "flex-end",
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Darker overlay for better text visibility
    borderRadius: 15,
  },
  textContainer: {
    position: "absolute",
    bottom: 15,
    left: 15,
    right: 15,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "white", 
    textAlign: "center" 
  },
  cardSubtitle: { 
    fontSize: 14, 
    color: "#ddd", 
    textAlign: "center", 
    marginTop: 5 
  },
  cardExperience: {
    fontSize: 13,
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
    backgroundColor: "rgba(0, 122, 255, 0.7)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignSelf: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#555',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ConsultExperts;
