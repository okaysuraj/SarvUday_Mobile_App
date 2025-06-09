import React, { useState } from "react";
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DoctorFooterMenu from "../components/DoctorFooterMenu";
import DoctorHeader from "../components/DoctorHeader";
import { LinearGradient } from "expo-linear-gradient";

const DoctorSettings = () => {
  const navigation = useNavigation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [availableForConsultation, setAvailableForConsultation] = useState(true);
  const [autoAcceptAppointments, setAutoAcceptAppointments] = useState(false);

  return (
    <LinearGradient colors={["#7E57C2", "#5E35B1", "#4527A0"]} style={styles.gradient}>
      {/* Use the reusable DoctorHeader component */}
      <DoctorHeader title="Settings" />

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Dark Mode</Text>
            <Switch 
              value={isDarkMode} 
              onValueChange={setIsDarkMode}
              trackColor={{ false: "#D1C4E9", true: "#7E57C2" }}
              thumbColor={isDarkMode ? "#5E35B1" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Enable Notifications</Text>
            <Switch 
              value={notificationsEnabled} 
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#D1C4E9", true: "#7E57C2" }}
              thumbColor={notificationsEnabled ? "#5E35B1" : "#f4f3f4"}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Appointment Reminders</Text>
            <Switch 
              value={notificationsEnabled} 
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#D1C4E9", true: "#7E57C2" }}
              thumbColor={notificationsEnabled ? "#5E35B1" : "#f4f3f4"}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>New Message Alerts</Text>
            <Switch 
              value={notificationsEnabled} 
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#D1C4E9", true: "#7E57C2" }}
              thumbColor={notificationsEnabled ? "#5E35B1" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Available for Consultation</Text>
            <Switch 
              value={availableForConsultation} 
              onValueChange={setAvailableForConsultation}
              trackColor={{ false: "#D1C4E9", true: "#7E57C2" }}
              thumbColor={availableForConsultation ? "#5E35B1" : "#f4f3f4"}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Auto-Accept Appointments</Text>
            <Switch 
              value={autoAcceptAppointments} 
              onValueChange={setAutoAcceptAppointments}
              trackColor={{ false: "#D1C4E9", true: "#7E57C2" }}
              thumbColor={autoAcceptAppointments ? "#5E35B1" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal & Support</Text>
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("PrivacyPolicy")}> 
            <Text style={styles.optionText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("TermsOfService")}> 
            <Text style={styles.optionText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("Support")}> 
            <Text style={styles.optionText}>Contact Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.option, styles.dangerOption]} 
            onPress={() => alert("This feature is not available yet")}
          > 
            <Text style={styles.optionText}>Delete Account</Text>
            <Ionicons name="trash-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>App Version: 1.0.0</Text>
        </View>
      </ScrollView>
      
      <DoctorFooterMenu />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { 
    flex: 1
  },
  // Header styles are now in the DoctorHeader component
  scrollView: {
    flex: 1,
    paddingBottom: 80, // Space for footer
  },
  section: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  settingItem: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  settingText: { 
    fontSize: 16,
    color: "#FFFFFF",
  },
  option: { 
    backgroundColor: "#7E57C2", 
    padding: 15, 
    borderRadius: 8, 
    marginVertical: 8, 
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dangerOption: {
    backgroundColor: "#F44336",
  },
  optionText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "500" 
  },
  versionContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  versionText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
  }
});

export default DoctorSettings;