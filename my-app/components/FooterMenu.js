import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { useNavigation , useRoute} from '@react-navigation/native'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const FooterMenu = () => {

    const navigation = useNavigation()
    const route = useRoute()

    return (
        <View style={styles.container} >
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                <FontAwesome5 name="home" style={styles.iconStyle} color={route.name ==="Home" && "orange"}/>
                <Text style={styles.iconText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('PastChats')}>
                <FontAwesome5 name="comments" style={styles.iconStyle} color={route.name ==="PastChats" && "orange"} />
                <Text style={styles.iconText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ConsultExperts')}>
                <FontAwesome5 name="plus" style={styles.iconStyle} color={route.name ==="ConsultExperts" && "orange"}/>
                <Text style={styles.iconText}>Consult</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('AppointmentHistory')}>
                <FontAwesome5 name="calendar-check" style={styles.iconStyle} color={route.name ==="AppointmentHistory" && "orange"}/>
                <Text style={styles.iconText}>Appts</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Account')}>
                <FontAwesome5 name="user" style={styles.iconStyle} color={route.name === "Account" && "orange"}/>
                <Text style={styles.iconText}>Profile</Text>
            </TouchableOpacity>
        </View>

    )
}
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: 'space-between',
        margin: 10,
    },
    iconStyle: {
        marginBottom: 5,
        fontSize: 20,
        alignSelf: "center",
    },
    iconText: {
        fontSize: 12,
        textAlign: 'center'
    }
})
export default FooterMenu