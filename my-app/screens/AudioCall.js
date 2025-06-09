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

const AudioCall = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { appointmentId, doctorName } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [callConnected, setCallConnected] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  
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
            // In a real app, you would disconnect from the audio call service here
            navigation.goBack();
          }
        }
      ]
    );
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.callInfoContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Connecting to Dr. {doctorName}...</Text>
          </View>
        ) : (
          <>
            <Image 
              source={require('../assets/consult.png')} 
              style={styles.doctorImage}
              resizeMode="cover"
            />
            <Text style={styles.doctorName}>Dr. {doctorName}</Text>
            <Text style={styles.callStatus}>
              {callConnected ? 'Call in progress' : 'Connecting...'}
            </Text>
            {callConnected && <Text style={styles.callTimeText}>{formatCallTime(callTime)}</Text>}
            
            <View style={styles.audioWaveContainer}>
              <View style={[styles.audioWave, styles.wave1]} />
              <View style={[styles.audioWave, styles.wave2]} />
              <View style={[styles.audioWave, styles.wave3]} />
              <View style={[styles.audioWave, styles.wave4]} />
              <View style={[styles.audioWave, styles.wave5]} />
            </View>
          </>
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
          style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
          onPress={toggleSpeaker}
        >
          <Ionicons name={isSpeakerOn ? "volume-high" : "volume-medium"} size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efc6f5',
    justifyContent: 'space-between',
  },
  callInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  doctorImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  callTimeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
  },
  audioWaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    marginTop: 20,
  },
  audioWave: {
    width: 4,
    marginHorizontal: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  wave1: {
    height: 15,
    animationName: 'wave',
    animationDuration: '1.2s',
    animationIterationCount: 'infinite',
  },
  wave2: {
    height: 30,
    animationName: 'wave',
    animationDuration: '0.9s',
    animationIterationCount: 'infinite',
  },
  wave3: {
    height: 45,
    animationName: 'wave',
    animationDuration: '0.6s',
    animationIterationCount: 'infinite',
  },
  wave4: {
    height: 30,
    animationName: 'wave',
    animationDuration: '1.1s',
    animationIterationCount: 'infinite',
  },
  wave5: {
    height: 15,
    animationName: 'wave',
    animationDuration: '0.8s',
    animationIterationCount: 'infinite',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
    backgroundColor: '#007AFF',
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
});

export default AudioCall;