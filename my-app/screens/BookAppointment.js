import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import FooterMenu from "../components/FooterMenu";
import axios from 'axios';
import { AuthContext } from '../context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import the DateTimePicker component
import DateTimePicker from '@react-native-community/datetimepicker';

const BookAppointment = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  // Log the route params to see what's being received
  console.log('BookAppointment route params:', route.params);
  
  const { doctor } = route.params || {};
  
  // Log the doctor object to see its structure
  console.log('Doctor object in BookAppointment:', doctor);
  
  // Ensure doctor has _id property if it only has id
  if (doctor && !doctor._id && doctor.id) {
    doctor._id = doctor.id;
    console.log('Added _id property to doctor object in BookAppointment:', doctor);
  }
  
  const [state] = useContext(AuthContext);
  
  // Set initial date to tomorrow to ensure we start with a future date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [selectedTime, setSelectedTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [consultationType, setConsultationType] = useState('video');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  
  // Available time slots
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '2:00 PM', '3:00 PM', 
    '4:00 PM', '5:00 PM'
  ];

  // Payment methods
  const paymentMethods = [
    'Credit Card', 'Debit Card', 'UPI', 'Net Banking'
  ];

  const onDateChange = (event, selectedDate) => {
    // Always hide the date picker after selection
    setShowDatePicker(false);
    
    // If the user cancels, don't update the date
    if (event.type === 'dismissed') {
      return;
    }
    
    // Make sure we have a valid date
    if (selectedDate) {
      // Ensure the selected date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
      
      if (selectedDate >= today) {
        setSelectedDate(selectedDate);
      } else {
        // If somehow a past date was selected, default to today
        Alert.alert('Invalid Date', 'Please select a future date.');
        setSelectedDate(today);
      }
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBookAppointment = async () => {
    // Check if doctor object exists
    if (!doctor) {
      console.error('Doctor object is missing entirely');
      Alert.alert('Error', 'Doctor information is missing. Please go back and try again.');
      return;
    }
    
    // Check if doctor has either _id or id property
    if (!doctor._id && !doctor.id) {
      console.error('Doctor object exists but both _id and id are missing:', doctor);
      Alert.alert('Error', 'Doctor ID is missing. Please go back and try again.');
      return;
    }
    
    if (!selectedTime) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }
    
    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setLoading(true);

    try {
      // Get the doctor ID from either _id or id property
      const doctorId = doctor?._id || doctor?.id;
      
      if (!doctorId) {
        console.error('No doctor ID available for appointment:', doctor);
        Alert.alert('Error', 'Doctor ID is missing. Please go back and try again.');
        setLoading(false);
        return;
      }
      
      console.log('Using doctor ID for appointment:', doctorId);
      
      // Create appointment object with all details
      const appointmentData = {
        doctorId: doctorId,
        appointmentDate: selectedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        appointmentTime: selectedTime,
        consultationType: consultationType,
        notes: notes || "No additional notes", // Provide default if empty
        paymentMethod: paymentMethod,
        fee: 550 // Include the fee shown in the UI
      };

      // Get token from state or AsyncStorage
      let token = state?.token || await AsyncStorage.getItem('@auth');
      
      if (!token) {
        Alert.alert('Authentication Error', 'Please login to book an appointment');
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

      // Log the data being sent (for debugging)
      console.log('Sending appointment data:', JSON.stringify(appointmentData));
      console.log('Using token:', token.substring(0, 20) + '...');
      
      // Make API call to save appointment
      const response = await axios.post(
        'http://10.55.17.30:8080/api/v1/appointments',
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      // Get booking details from response
      const { data } = response.data;
      setBookingId(data.bookingId);

      // Show success message
      Alert.alert(
        'Appointment Booked Successfully',
        `Your appointment with Dr. ${doctor?.name || 'Specialist'} has been scheduled for ${formatDate(selectedDate)} at ${selectedTime}.\n\nBooking ID: ${data.bookingId}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    } catch (error) {
      console.error('Error booking appointment:', error);
      
      // Log more detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      
      const errorMessage = error.response?.data?.message || 'There was an error booking your appointment. Please try again.';
      Alert.alert('Booking Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Doctor information not available</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Doctor Info Summary */}
        <View style={styles.doctorSummary}>
          <Text style={styles.doctorName}>Dr. {doctor?.name || 'Specialist'}</Text>
          <Text style={styles.doctorSpecialty}>{doctor?.specialization || 'Medical Professional'}</Text>
        </View>

        {/* Date Selection - Shows a calendar for the next month, prevents past dates */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity 
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={24} color="#007AFF" />
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={onDateChange}
              minimumDate={new Date()} // Prevents selection of past dates
              maximumDate={new Date(new Date().setMonth(new Date().getMonth() + 1))} // Allows selection up to 1 month in the future
            />
          )}
        </View>

        {/* Time Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.timeSlotContainer}>
            {timeSlots.map((time, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.selectedTimeSlot
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text 
                  style={[
                    styles.timeSlotText,
                    selectedTime === time && styles.selectedTimeSlotText
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Consultation Type */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Consultation Type</Text>
          <View style={styles.consultationTypeContainer}>
            <TouchableOpacity
              style={[
                styles.consultationType,
                consultationType === 'video' && styles.selectedConsultationType
              ]}
              onPress={() => setConsultationType('video')}
            >
              <Ionicons 
                name="videocam" 
                size={24} 
                color={consultationType === 'video' ? "#fff" : "#007AFF"} 
              />
              <Text 
                style={[
                  styles.consultationTypeText,
                  consultationType === 'video' && styles.selectedConsultationTypeText
                ]}
              >
                Video
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.consultationType,
                consultationType === 'audio' && styles.selectedConsultationType
              ]}
              onPress={() => setConsultationType('audio')}
            >
              <Ionicons 
                name="call" 
                size={24} 
                color={consultationType === 'audio' ? "#fff" : "#4CAF50"} 
              />
              <Text 
                style={[
                  styles.consultationTypeText,
                  consultationType === 'audio' && styles.selectedConsultationTypeText
                ]}
              >
                Audio
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.consultationType,
                consultationType === 'chat' && styles.selectedConsultationType
              ]}
              onPress={() => setConsultationType('chat')}
            >
              <Ionicons 
                name="chatbubbles" 
                size={24} 
                color={consultationType === 'chat' ? "#fff" : "#9C27B0"} 
              />
              <Text 
                style={[
                  styles.consultationTypeText,
                  consultationType === 'chat' && styles.selectedConsultationTypeText
                ]}
              >
                Chat
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any notes for the doctor (optional)"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethodContainer}>
            {paymentMethods.map((method, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.paymentMethod,
                  paymentMethod === method && styles.selectedPaymentMethod
                ]}
                onPress={() => setPaymentMethod(method)}
              >
                <Text 
                  style={[
                    styles.paymentMethodText,
                    paymentMethod === method && styles.selectedPaymentMethodText
                  ]}
                >
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fee Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Consultation Fee</Text>
          <View style={styles.feeContainer}>
            <Text style={styles.feeLabel}>Consultation Fee:</Text>
            <Text style={styles.feeAmount}>₹500</Text>
          </View>
          <View style={styles.feeContainer}>
            <Text style={styles.feeLabel}>Platform Fee:</Text>
            <Text style={styles.feeAmount}>₹50</Text>
          </View>
          <View style={[styles.feeContainer, styles.totalFeeContainer]}>
            <Text style={styles.totalFeeLabel}>Total:</Text>
            <Text style={styles.totalFeeAmount}>₹550</Text>
          </View>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity 
          style={[styles.confirmButton, loading && styles.disabledButton]}
          onPress={handleBookAppointment}
          disabled={loading}
        >
          <Text style={styles.confirmButtonText}>
            {loading ? 'Processing...' : 'Confirm & Pay'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      <FooterMenu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efc6f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  doctorSummary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 16,
    color: '#555',
  },
  sectionContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '48%',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#007AFF',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#333',
  },
  selectedTimeSlotText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  consultationTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  consultationType: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  selectedConsultationType: {
    backgroundColor: '#007AFF',
  },
  consultationTypeText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
  },
  selectedConsultationTypeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  notesInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  paymentMethod: {
    width: '48%',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedPaymentMethod: {
    backgroundColor: '#007AFF',
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#333',
  },
  selectedPaymentMethodText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  feeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 16,
    color: '#555',
  },
  feeAmount: {
    fontSize: 16,
    color: '#333',
  },
  totalFeeContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    marginTop: 8,
  },
  totalFeeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalFeeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#7fb5e6',
    opacity: 0.7,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#efc6f5',
  },
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BookAppointment;