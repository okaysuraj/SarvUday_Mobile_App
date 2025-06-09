import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const DoctorFooterMenu = () => {
    const navigation = useNavigation()
    const route = useRoute()

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.navigate('DoctorHome')}>
                <FontAwesome5 
                    name="home" 
                    style={styles.iconStyle} 
                    color={route.name === "DoctorHome" ? "#7E57C2" : "#555"}
                />
                <Text style={[styles.iconText, route.name === "DoctorHome" && styles.activeText]}>Home</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('DoctorAppointments')}>
                <FontAwesome5 
                    name="calendar-check" 
                    style={styles.iconStyle} 
                    color={route.name === "DoctorAppointments" ? "#7E57C2" : "#555"}
                />
                <Text style={[styles.iconText, route.name === "DoctorAppointments" && styles.activeText]}>Appts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('DoctorChat')}>
                <FontAwesome5 
                    name="comments" 
                    style={styles.iconStyle} 
                    color={route.name === "DoctorChat" ? "#7E57C2" : "#555"}
                />
                <Text style={[styles.iconText, route.name === "DoctorChat" && styles.activeText]}>Messages</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('PatientHistory')}>
                <FontAwesome5 
                    name="file-medical-alt" 
                    style={styles.iconStyle} 
                    color={route.name === "PatientHistory" ? "#7E57C2" : "#555"}
                />
                <Text style={[styles.iconText, route.name === "PatientHistory" && styles.activeText]}>Patients</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('DoctorAccount')}>
                <FontAwesome5 
                    name="user-md" 
                    style={styles.iconStyle} 
                    color={route.name === "DoctorAccount" ? "#7E57C2" : "#555"}
                />
                <Text style={[styles.iconText, route.name === "DoctorAccount" && styles.activeText]}>Profile</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    iconStyle: {
        marginBottom: 5,
        fontSize: 22,
        alignSelf: "center",
    },
    iconText: {
        fontSize: 12,
        textAlign: 'center',
        color: '#555'
    },
    activeText: {
        color: '#7E57C2',
        fontWeight: 'bold'
    }
})

export default DoctorFooterMenu