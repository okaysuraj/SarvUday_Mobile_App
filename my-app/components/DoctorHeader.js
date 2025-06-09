import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import React, { useContext } from 'react';
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from '../context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DoctorHeader = ({ title = "Doctor Dashboard" }) => {
  const navigation = useNavigation();
  const [state, setState] = useContext(AuthContext);

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

  return (
    <SafeAreaView style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.headerButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>{title}</Text>
      
      <TouchableOpacity 
        style={styles.headerButton} 
        onPress={handleLogout}
      >
        <FontAwesome5 name="sign-out-alt" size={24} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DoctorHeader;