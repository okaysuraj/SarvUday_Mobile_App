import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FooterMenu from "../components/FooterMenu";

const AppointmentHistory = () => {
  const navigation = useNavigation();
  const [state] = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // Get token from state or AsyncStorage
      let token = state?.token || await AsyncStorage.getItem('@auth');
      
      if (!token) {
        Alert.alert('Authentication Error', 'Please login to view appointments');
        navigation.navigate('Login');
        return;
      }
      
      // Check if token is a JSON string and parse it if needed
      if (typeof token === 'string' && token.startsWith('{')) {
        try {
          const parsedToken = JSON.parse(token);
          token = parsedToken.token || token;
        } catch (e) {
          console.log('Token parsing error:', e);
          // Continue with the original token if parsing fails
        }
      }
      
      console.log('Fetching appointments with token:', token.substring(0, 20) + '...');

      // Make API call to get user appointments
      const response = await axios.get(
        'http://10.55.17.30:8080/api/v1/appointments/user',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      console.log('Appointments response:', response.data);

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setAppointments(response.data.data);
      } else {
        console.error('Invalid appointments data format:', response.data);
        setAppointments([]);
        Alert.alert('Error', 'Received invalid appointment data format');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      
      // Log more detailed error information
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        if (error.response.status === 401) {
          Alert.alert('Authentication Error', 'Your session has expired. Please login again.');
          navigation.navigate('Login');
          return;
        }
      }
      
      Alert.alert('Error', 'Failed to load appointments. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return '#007AFF';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      case 'no-show':
        return '#FF9800';
      default:
        return '#333';
    }
  };

  const handleCancelAppointment = async (id) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              setLoading(true);
              // Get token from state or AsyncStorage
              const token = state?.token || await AsyncStorage.getItem('@auth');
              
              if (!token) {
                Alert.alert('Authentication Error', 'Please login to cancel appointment');
                navigation.navigate('Login');
                return;
              }

              // Make API call to cancel appointment
              await axios.put(
                `http://10.55.17.30:8080/api/v1/appointments/${id}/cancel`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );

              Alert.alert('Success', 'Appointment cancelled successfully');
              fetchAppointments();
            } catch (error) {
              console.error('Error cancelling appointment:', error);
              Alert.alert('Error', 'Failed to cancel appointment');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderAppointmentItem = ({ item }) => {
    // Calculate if the appointment is in the past
    const appointmentDate = new Date(item.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    
    const isPastAppointment = appointmentDate < today;
    const isToday = appointmentDate.toDateString() === today.toDateString();
    const canCancel = item.status === 'scheduled' && !isPastAppointment;
    
    // Get the appropriate icon for the consultation type
    const getConsultationIcon = (type) => {
      switch (type) {
        case 'video':
          return 'videocam-outline';
        case 'audio':
          return 'call-outline';
        case 'chat':
          return 'chatbubbles-outline';
        default:
          return 'medical-outline';
      }
    };
    
    // Format the doctor name
    const doctorName = item.doctorName || 'Specialist';
    const formattedDoctorName = doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`;

    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <Text style={styles.doctorName}>{formattedDoctorName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
          </View>
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color="#555" />
            <Text style={[
              styles.detailText, 
              isToday && { fontWeight: 'bold', color: '#007AFF' }
            ]}>
              {isToday ? 'Today' : formatDate(item.appointmentDate)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={18} color="#555" />
            <Text style={[
              styles.detailText,
              isToday && { fontWeight: 'bold', color: '#007AFF' }
            ]}>
              {item.appointmentTime}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="medical-outline" size={18} color="#555" />
            <Text style={styles.detailText}>{item.specialization || 'Medical Consultation'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name={getConsultationIcon(item.consultationType)} size={18} color="#555" />
            <Text style={styles.detailText}>
              {item.consultationType ? 
                (item.consultationType.charAt(0).toUpperCase() + item.consultationType.slice(1) + ' Consultation') : 
                'Consultation'
              }
            </Text>
          </View>
        </View>

        <View style={styles.paymentInfo}>
          <Text style={styles.paymentLabel}>Payment:</Text>
          <Text style={[
            styles.paymentStatus,
            { color: item.paymentStatus === 'paid' ? '#4CAF50' : '#FF9800' }
          ]}>
            {item.paymentStatus ? 
              (item.paymentStatus.charAt(0).toUpperCase() + item.paymentStatus.slice(1)) : 
              'Pending'
            }
          </Text>
          <Text style={styles.paymentAmount}>₹{item.totalAmount || item.fee || '550'}</Text>
        </View>

        <View style={styles.bookingInfo}>
          <Text style={styles.bookingId}>Booking ID: {item.bookingId || item._id}</Text>
        </View>

        <View style={styles.actionButtonsContainer}>
          {/* Show interaction buttons for scheduled appointments that are today or in the future */}
          {item.status === 'scheduled' && !isPastAppointment && (
            <View style={styles.interactionButtons}>
              {item.consultationType === 'video' && (
                <TouchableOpacity 
                  style={[styles.interactionButton, { backgroundColor: '#4CAF50' }]}
                  onPress={() => navigation.navigate('VideoCall', { appointmentId: item._id, doctorName: item.doctorName })}
                >
                  <Ionicons name="videocam" size={20} color="#fff" />
                  <Text style={styles.interactionButtonText}>Start Video</Text>
                </TouchableOpacity>
              )}
              
              {item.consultationType === 'audio' && (
                <TouchableOpacity 
                  style={[styles.interactionButton, { backgroundColor: '#2196F3' }]}
                  onPress={() => navigation.navigate('AudioCall', { appointmentId: item._id, doctorName: item.doctorName })}
                >
                  <Ionicons name="call" size={20} color="#fff" />
                  <Text style={styles.interactionButtonText}>Start Audio</Text>
                </TouchableOpacity>
              )}
              
              {item.consultationType === 'chat' && (
                <TouchableOpacity 
                  style={[styles.interactionButton, { backgroundColor: '#9C27B0' }]}
                  onPress={() => navigation.navigate('ChatScreen', { appointmentId: item._id, doctorName: item.doctorName })}
                >
                  <Ionicons name="chatbubbles" size={20} color="#fff" />
                  <Text style={styles.interactionButtonText}>Start Chat</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {canCancel && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => handleCancelAppointment(item._id)}
            >
              <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <View style={{ width: 24 }} />
      </View>

      {appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No appointments found</Text>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => navigation.navigate('ConsultExperts')}
          >
            <Text style={styles.bookButtonText}>Book an Appointment</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointmentItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#007AFF"]}
            />
          }
        />
      )}

      <FooterMenu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efc6f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 4,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#555',
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 'auto',
  },
  bookingInfo: {
    marginTop: 8,
  },
  bookingId: {
    fontSize: 12,
    color: '#777',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionButtonsContainer: {
    marginTop: 12,
  },
  interactionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  interactionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#efc6f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
    marginTop: 16,
    marginBottom: 24,
  },
  bookButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    width: '80%',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AppointmentHistory;