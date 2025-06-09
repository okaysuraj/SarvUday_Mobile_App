import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Image, SafeAreaView } from "react-native";
import React, { useContext } from "react";
import { AuthContext } from "../context/authContext";
import DoctorFooterMenu from "../components/DoctorFooterMenu";
import DoctorHeader from "../components/DoctorHeader";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const DoctorHome = ({ navigation }) => {
  const [state] = useContext(AuthContext);
  const doctor = state?.user;

  const quickActions = [
    { 
      id: "1", 
      title: "Appointments", 
      screen: "DoctorAppointments", 
      icon: "calendar-check",
      color: "#4CAF50",
      description: "View and manage your appointments"
    },
    { 
      id: "2", 
      title: "Messages", 
      screen: "DoctorChat", 
      icon: "comments",
      color: "#2196F3",
      description: "Chat with your patients"
    },
    { 
      id: "3", 
      title: "Patient Records", 
      screen: "PatientHistory", 
      icon: "file-medical-alt",
      color: "#FF9800",
      description: "Access patient medical records"
    },
    { 
      id: "4", 
      title: "My Profile", 
      screen: "DoctorAccount", 
      icon: "user-md",
      color: "#9C27B0",
      description: "Update your profile information"
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#7E57C2', '#5E35B1']}
        style={styles.headerGradient}
      >
        {/* Add the DoctorHeader component */}
        <DoctorHeader title="Doctor Dashboard" />
        
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <FontAwesome5 name="user-md" size={35} color="#FFF" style={styles.profileIcon} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.doctorName}>Dr. {doctor?.name}</Text>
              <Text style={styles.doctorSpecialty}>{doctor?.specialization} • {doctor?.experience} yrs exp</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionContainer}>
          <View style={styles.cardsContainer}>
            {quickActions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.actionCard, { borderLeftColor: item.color }]}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View>
                  <View style={styles.cardContent}>
                    <FontAwesome5 name={item.icon} size={24} color={item.color} />
                    <Text style={styles.cardTitle}>{item.title}</Text>
                  </View>
                  <Text style={styles.cardDescription}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
      
      <DoctorFooterMenu />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  profileImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#FFF",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileIcon: {
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  profileInfo: {
    marginLeft: 15,
  },
  welcomeText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  doctorName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
  },
  sectionContainer: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  cardsContainer: {
    paddingTop: 10,
  },
  actionCard: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    width: "100%",
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    height: 100,
    justifyContent: "space-between",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 15,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    marginLeft: 39, // Icon width (24) + left margin (15)
  },
  bottomPadding: {
    height: 80, // Space for the footer menu
  },
});

export default DoctorHome;
