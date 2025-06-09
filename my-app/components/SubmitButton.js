import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'

const SubmitButton = ({onPress,handleSubmit, btnTitle, loading}) => {
  return (
    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.btnText}>{loading ? "Please Wait..." : btnTitle}</Text>
    </TouchableOpacity>
  )
}
const styles= StyleSheet.create({
    submitBtn: {
        height: 40,
        borderRadius: 55,
        backgroundColor: 'blue',
        justifyContent: 'center',
        marginHorizontal: 20,
    },
    btnText: {
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 22,
        fontWeight: "500",
    },
})
export default SubmitButton