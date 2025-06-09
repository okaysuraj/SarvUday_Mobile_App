import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ImageBackground,
  Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import FooterMenu from "../components/FooterMenu";

// Default images for different specializations
const specializationImages = {
  "Psychiatrist": require("../assets/assess.png"),
  "Clinical Psychologist": require("../assets/knowmore.png"),
  "Neurologist": require("../assets/chat.png"),
  "default": require("../assets/chat.png") // Default image
};

const DoctorDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { doctor } = route.params || {};

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

  // Get the appropriate image based on specialization
  const doctorImage = doctor.image || specializationImages[doctor.specialization] || specializationImages.default;

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
          <Text style={styles.headerTitle}>Doctor Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Doctor Profile Image */}
        <ImageBackground 
          source={doctorImage}
          style={styles.profileImage}
          imageStyle={{ borderRadius: 100 }}
          defaultSource={specializationImages.default}
        >
          <View style={styles.imageOverlay} />
        </ImageBackground>

        {/* Doctor Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <View style={styles.specializationContainer}>
            <Text style={styles.specialization}>{doctor.specialization}</Text>
          </View>
          <Text style={styles.location}>{doctor.location}</Text>
          
          {doctor.experience && (
            <View style={styles.experienceContainer}>
              <Ionicons name="time-outline" size={18} color="#555" />
              <Text style={styles.experienceText}>
                {doctor.experience} years of experience
              </Text>
            </View>
          )}
        </View>

        {/* About Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            {doctor.about || `Dr. ${doctor.name ? (doctor.name.split(' ').length > 1 ? doctor.name.split(' ')[1] : doctor.name) : 'The doctor'} is a highly qualified ${doctor.specialization} with ${doctor.experience || 'several'} years of experience in treating patients with various mental health conditions. They specialize in providing compassionate care and evidence-based treatments.`}
          </Text>
        </View>



        {/* Book Appointment Button */}
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => {
            // Log the doctor object before navigation
            console.log('Doctor object being passed to BookAppointment:', doctor);
            
            // Make sure doctor has either an _id or id property before navigating
            if (!doctor) {
              console.error('Doctor object is missing:', doctor);
              Alert.alert('Error', 'Doctor information is missing. Please try again later.');
              return;
            }
            
            // Create a copy of the doctor object with _id if it only has id
            const doctorWithId = {...doctor};
            if (!doctorWithId._id && doctorWithId.id) {
              doctorWithId._id = doctorWithId.id;
              console.log('Added _id property to doctor object:', doctorWithId);
            }
            
            if (!doctorWithId._id) {
              console.error('Doctor object has no ID:', doctorWithId);
              Alert.alert('Error', 'Doctor ID is missing. Please try again later.');
              return;
            }
            
            navigation.navigate('BookAppointment', { doctor: doctorWithId });
          }}
        >
          <Text style={styles.bookButtonText}>Book Appointment</Text>
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
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 100,
    alignSelf: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 100,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  specializationContainer: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  specialization: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  location: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  experienceText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 6,
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
  aboutText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  consultOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  bookButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  bookButtonText: {
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

export default DoctorDetails;