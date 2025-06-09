import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView } from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import DoctorFooterMenu from "../components/DoctorFooterMenu";
import DoctorHeader from "../components/DoctorHeader";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DoctorAppointments = ({ navigation }) => {
  const [state] = useContext(AuthContext);
  const doctor = state?.user;
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if we have a logged-in doctor
    if (state?.user && state?.token) {
      console.log("Doctor logged in, fetching appointments...");
      fetchAppointments();
    } else {
      console.log("No doctor logged in or missing token");
      setError("Please log in to view appointments");
      setLoading(false);
    }
  }, [state]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    
    try {
      console.log("Fetching doctor appointments with token:", state.token);
      
      // Log the current axios default headers
      console.log("Current axios headers:", axios.defaults.headers.common);
      
      // Make sure the Authorization header is set correctly
      axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
      
      // Make the API request
      const { data } = await axios.get("/appointments/doctor");
      
      console.log("Appointments API response:", data);
      
      if (data && data.success && data.data) {
        // Map the backend data to include userName for consistency
        const appointmentsWithUserNames = data.data.map(appointment => ({
          ...appointment,
          // If the backend doesn't provide userName, we'll need to fetch it separately
          // or use a placeholder
          userName: appointment.userName || "Patient"
        }));
        
        setAppointments(appointmentsWithUserNames);
      } else {
        // If no data or empty array, show empty state
        setAppointments([]);
      }
      setLoading(false);
    } catch (err) {
      console.log("Error fetching appointments:", err);
      
      // If API call failed, use mock appointments as fallback
      const mockAppointments = [
        {
          _id: "1",
          userId: "user123",
          userName: "John Smith",
          doctorId: doctor?._id || "doc123",
          doctorName: doctor?.name || "Dr. Example",
          appointmentDate: new Date().toISOString(),
          appointmentTime: "10:30 AM",
          consultationType: "General Consultation",
          status: "Confirmed",
          bookingId: "BK123456",
          notes: "First-time patient"
        },
        {
          _id: "2",
          userId: "user456",
          userName: "Sarah Johnson",
          doctorId: doctor?._id || "doc123",
          doctorName: doctor?.name || "Dr. Example",
          appointmentDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          appointmentTime: "2:00 PM",
          consultationType: "Follow-up",
          status: "Pending",
          bookingId: "BK789012",
          notes: "Follow-up for medication review"
        },
        {
          _id: "3",
          userId: "user789",
          userName: "Michael Brown",
          doctorId: doctor?._id || "doc123",
          doctorName: doctor?.name || "Dr. Example",
          appointmentDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          appointmentTime: "11:15 AM",
          consultationType: "Emergency",
          status: "Completed",
          bookingId: "BK345678",
          notes: "Patient reported severe symptoms"
        }
      ];
      
      // Set the mock appointments
      setAppointments(mockAppointments);
      setError("Error fetching appointments. Using demo data.");
      setLoading(false);
    }
  };

  const renderAppointmentItem = ({ item }) => {
    // Get patient name - in the backend it might be stored as userId reference
    const patientName = item.userName || "Patient";
    
    // Get appointment type
    const appointmentType = item.consultationType || "Consultation";
    
    // Default status if not provided
    const status = item.status || "Pending";
    
    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <Text style={styles.appointmentDate}>
            {new Date(item.appointmentDate).toLocaleDateString()} at {item.appointmentTime}
          </Text>
          <View style={[
            styles.appointmentStatus, 
            { backgroundColor: getStatusColor(status).bgColor }
          ]}>
            <Text style={[
              styles.appointmentStatusText, 
              { color: getStatusColor(status).textColor }
            ]}>
              {status}
            </Text>
          </View>
        </View>
        <View style={styles.appointmentDetails}>
          <FontAwesome5 name="user" size={24} color="#555" style={styles.appointmentIcon} />
          <View style={styles.appointmentPatient}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.appointmentType}>{appointmentType}</Text>
            {item.bookingId && (
              <Text style={styles.bookingId}>Booking ID: {item.bookingId}</Text>
            )}
          </View>
        </View>
        <View style={styles.appointmentActions}>
          {status === "Confirmed" && (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.rescheduleButton]}
                onPress={() => handleReschedule(item._id)}
              >
                <Text style={styles.actionButtonText}>Reschedule</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.startButton]}
                onPress={() => handleStartSession(item._id)}
              >
                <Text style={[styles.actionButtonText, styles.startButtonText]}>Start Session</Text>
              </TouchableOpacity>
            </>
          )}
          {status === "Pending" && (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleUpdateStatus(item._id, "Cancelled")}
              >
                <Text style={[styles.actionButtonText, styles.rejectButtonText]}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleUpdateStatus(item._id, "Confirmed")}
              >
                <Text style={[styles.actionButtonText, styles.acceptButtonText]}>Accept</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  // Handle updating appointment status (Accept/Decline)
  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      // First update locally for immediate UI feedback
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment._id === appointmentId 
            ? {...appointment, status: newStatus} 
            : appointment
        )
      );
      
      console.log(`Updating appointment ${appointmentId} to ${newStatus}`);
      console.log("Using token:", state.token);
      
      // Make sure the Authorization header is set correctly
      axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
      
      // Then update on the server using the global axios config
      const response = await axios.put(
        `/appointments/${appointmentId}/status`, 
        { status: newStatus }
      );
      
      console.log(`Successfully updated appointment ${appointmentId} to ${newStatus}`);
      console.log("Server response:", response.data);
      
      // Refresh appointments after successful update
      fetchAppointments();
    } catch (err) {
      console.log("Error updating appointment status:", err);
      alert(`Failed to ${newStatus === 'Confirmed' ? 'accept' : 'decline'} appointment. Please try again.`);
    }
  };

  // Handle starting a session with the patient
  const handleStartSession = (appointmentId) => {
    // Navigate to the chat or video call screen
    // This is a placeholder - implement based on your app's navigation
    alert("Starting session... This feature will be implemented soon.");
  };

  // Handle rescheduling an appointment
  const handleReschedule = (appointmentId) => {
    // Navigate to reschedule screen or show a modal
    // This is a placeholder - implement based on your app's requirements
    alert("Reschedule feature will be implemented soon.");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return { bgColor: "rgba(76, 175, 80, 0.1)", textColor: "#4CAF50" };
      case "Pending":
        return { bgColor: "rgba(255, 152, 0, 0.1)", textColor: "#FF9800" };
      case "Completed":
        return { bgColor: "rgba(33, 150, 243, 0.1)", textColor: "#2196F3" };
      case "Cancelled":
      case "cancelled":
        return { bgColor: "rgba(244, 67, 54, 0.1)", textColor: "#F44336" };
      default:
        return { bgColor: "rgba(158, 158, 158, 0.1)", textColor: "#9E9E9E" };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <DoctorHeader title="My Appointments" />
      
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7E57C2" />
            <Text style={styles.loadingText}>Loading appointments...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <FontAwesome5 name="exclamation-circle" size={50} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchAppointments}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="calendar-times" size={70} color="#9E9E9E" />
            <Text style={styles.emptyText}>No appointments available</Text>
            <Text style={styles.emptySubText}>
              You don't have any appointments scheduled at the moment.
            </Text>
          </View>
        ) : (
          <FlatList
            data={appointments}
            keyExtractor={(item) => item._id}
            renderItem={renderAppointmentItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      
      <DoctorFooterMenu />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    padding: 15,
  },
  listContainer: {
    paddingBottom: 80, // Space for footer menu
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#7E57C2",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  emptySubText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  appointmentCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  appointmentDate: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  appointmentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  appointmentStatusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  appointmentDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  appointmentIcon: {
    marginRight: 15,
  },
  appointmentPatient: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  appointmentType: {
    fontSize: 14,
    color: "#666",
  },
  bookingId: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  appointmentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  rescheduleButton: {
    backgroundColor: "rgba(126, 87, 194, 0.1)",
    marginRight: 10,
  },
  startButton: {
    backgroundColor: "#7E57C2",
  },
  rejectButton: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    marginRight: 10,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  actionButtonText: {
    fontWeight: "bold",
    color: "#7E57C2",
  },
  startButtonText: {
    color: "#FFF",
  },
  rejectButtonText: {
    color: "#F44336",
  },
  acceptButtonText: {
    color: "#FFF",
  },
});

export default DoctorAppointments;