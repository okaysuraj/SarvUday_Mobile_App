import { View, Text, TouchableOpacity,StyleSheet } from 'react-native'
import React,{useContext} from 'react'
import { AuthContext } from '../context/authContext'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AsyncStorage from '@react-native-async-storage/async-storage'

const HeaderMenu = () => {
    const [state,setState] = useContext(AuthContext)
    const handleLogout = async () => {
        setState({token:'', user: null})
        await AsyncStorage.removeItem('@auth')
        alert('logout successful')
    }
  return (
    <View>
        <TouchableOpacity onPress={handleLogout}>
            <FontAwesome5 name="sign-out-alt" color={"red"} style={StyleSheet.iconStyle}/>
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
    }
})
export default HeaderMenu