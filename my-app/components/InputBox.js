import { View, Text, TextInput, StyleSheet } from 'react-native'
import React from 'react'

const InputBox = ({inputTitle, autoComplete, keyboardType, secureTextEntry=false,value,setValue, ...props}) => {
  return (
    <View>
      <Text>{inputTitle}</Text>
      <TextInput style={styles.inputBox}
      autoCorrect={false}
      keyboardType={keyboardType}
      autoComplete={autoComplete}
      secureTextEntry={secureTextEntry}
      value={value}
      onChangeText={(text) => setValue(text)}
      {...props}
      />
    </View>
  )
}
const styles= StyleSheet.create({
   
    inputBox: {
        height: 40,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#f0f0f0',
        marginTop: 15,
    },
    })
export default InputBox