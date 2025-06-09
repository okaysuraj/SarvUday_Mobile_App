import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const VideoCall = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { appointmentId, doctorName } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [callConnected, setCallConnected] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  
  // Simulate connecting to a call
  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setLoading(false);
      setCallConnected(true);
      Alert.alert('Connected', `You are now connected with Dr. ${doctorName}`);
    }, 3000);
    
    return () => clearTimeout(connectTimer);
  }, [doctorName]);
  
  // Call timer
  useEffect(() => {
    let interval;
    if (callConnected) {
      interval = setInterval(() => {
        setCallTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callConnected]);
  
  // Format call time as mm:ss
  const formatCallTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this call?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: () => {
            // In a real app, you would disconnect from the video call service here
            navigation.goBack();
          }
        }
      ]
    );
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const toggleCamera = () => {
    setIsCameraOff(!isCameraOff);
  };
  
  return (
    <View style={styles.container}>
      {/* Doctor's video (simulated) */}
      <View style={styles.remoteVideoContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Connecting to Dr. {doctorName}...</Text>
          </View>
        ) : (
          <>
            <Image 
              source={require('../assets/knowmore.png')} 
              style={styles.remoteVideo}
              resizeMode="cover"
            />
            <View style={styles.doctorInfoOverlay}>
              <Text style={styles.doctorName}>Dr. {doctorName}</Text>
              {callConnected && <Text style={styles.callTimeText}>{formatCallTime(callTime)}</Text>}
            </View>
          </>
        )}
      </View>
      
      {/* Local video (simulated) */}
      <View style={styles.localVideoContainer}>
        {!isCameraOff ? (
          <Image 
            source={require('../assets/consult.png')} 
            style={styles.localVideo}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.cameraOffContainer}>
            <Ionicons name="videocam-off" size={24} color="#fff" />
          </View>
        )}
      </View>
      
      {/* Call controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={toggleMute}
        >
          <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.endCallButton}
          onPress={handleEndCall}
        >
          <Ionicons name="call" size={30} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, isCameraOff && styles.controlButtonActive]}
          onPress={toggleCamera}
        >
          <Ionicons name={isCameraOff ? "videocam-off" : "videocam"} size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  remoteVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
  },
  localVideoContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 100,
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  cameraOffContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#FF3B30',
  },
  endCallButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
  },
  doctorInfoOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
  },
  doctorName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  callTimeText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
  },
});

export default VideoCall;