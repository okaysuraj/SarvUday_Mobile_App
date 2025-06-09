import { View, Text } from 'react-native';
import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/Home';
import Register from '../screens/Register';
import Login from '../screens/Login';
import { AuthContext } from '../context/authContext';
import HeaderMenu from './HeaderMenu';
import SarvUday from '../screens/SarvUday';
import Account from '../screens/Account';
import PrivacyPolicy from '../screens/PrivacyPolicy';
import Assessment from '../screens/Assessment';
import PHQ9 from '../screens/PHQ9';
import BDI from '../screens/BDI';
import HDRS from '../screens/HDRS';
import SettingsMenu from '../screens/SettingsMenu';
import ConsultExperts from '../screens/ConsultExperts';
import KnowMore from '../screens/KnowMore';
import DoctorDetails from '../screens/DoctorDetails';
import AssessmentHistory from '../screens/AssessmentHistory';
import PastChats from '../screens/PastChats';
import DoctorHome from '../screens/DoctorHome';
import DoctorRegister from '../screens/DoctorRegister';
import DoctorLogin from '../screens/DoctorLogin';
import Interactions from '../screens/Interactions';
import DoctorAccount from '../screens/DoctorAccount';
import DoctorSettings from '../screens/DoctorSettings';
import PastQuizzesScreen from '../screens/PastQuizzesScreen';
import BookAppointment from '../screens/BookAppointment';
import AppointmentHistory from '../screens/AppointmentHistory';
import VideoCall from '../screens/VideoCall';
import AudioCall from '../screens/AudioCall';
import ChatScreen from '../screens/ChatScreen';
import DoctorAppointments from '../screens/DoctorAppointments';


const ScreenMenu = () => {
  const [state] = useContext(AuthContext);
  const authenticatedUser = (state?.user || state?.role === "doctor") && state?.token;
  const isDoctor = state?.role === 'doctor';

  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      initialRouteName={authenticatedUser ? (isDoctor ? 'DoctorHome' : 'Home') : 'Login'}
    >
      {authenticatedUser ? (
        isDoctor ? (
          <>
            <Stack.Screen
              name="DoctorHome"
              component={DoctorHome}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Interactions"
              component={Interactions}
              options={{ headerRight: () => <HeaderMenu /> }}
            />
            <Stack.Screen
              name="DoctorAccount"
              component={DoctorAccount}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DoctorSettings"
              component={DoctorSettings}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DoctorAppointments"
              component={DoctorAppointments}
              options={{ 
                headerShown: false
              }}
            />
            <Stack.Screen
              name="Appointments"
              component={AppointmentHistory}
              options={{ 
                title: 'My Appointments',
                headerRight: () => <HeaderMenu /> 
              }}
            />
            <Stack.Screen
              name="PatientHistory"
              component={AssessmentHistory}
              options={{ 
                title: 'Patient Records',
                headerRight: () => <HeaderMenu /> 
              }}
            />
            <Stack.Screen
              name="DoctorChat"
              component={PastChats}
              options={{ 
                title: 'Messages',
                headerRight: () => <HeaderMenu /> 
              }}
            />
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicy}
              options={{
                title: 'Privacy Policy',
                headerBackTitle: 'Back',
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="VideoCall"
              component={VideoCall}
              options={{
                title: 'Video Call',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="AudioCall"
              component={AudioCall}
              options={{
                title: 'Audio Call',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ChatScreen"
              component={ChatScreen}
              options={{
                title: 'Chat',
                headerShown: false,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={Home}
              options={{ title: 'Home', headerRight: () => <HeaderMenu /> }}
            />
            <Stack.Screen
              name="SarvUday"
              component={SarvUday}
              options={{
                title: 'SarvUday',
                headerBackTitle: 'Back',
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="Account"
              component={Account}
              options={{
                title: 'Profile',
                headerBackTitle: 'Back',
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="AssessYourself"
              component={Assessment}
              options={{
                title: 'AssessYourself',
                headerBackTitle: 'Back',
                headerRight: () => <HeaderMenu />,
              }}
            /><Stack.Screen
              name="PastQuizzesScreen"
              component={PastQuizzesScreen}
              options={{
                title: 'PastQuizzesScreen',
                headerBackTitle: 'Back',
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="AssessmentHistory"
              component={AssessmentHistory}
              options={{
                title: 'AssessmentHistory',
                headerBackTitle: 'Back',
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="PastChats"
              component={PastChats}
              options={{
                title: 'PastChats',
                headerBackTitle: 'Back',
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicy}
              options={{
                title: 'PrivacyPolicy',
                headerBackTitle: 'Back',
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="PHQ9"
              component={PHQ9}
              options={{
                title: 'PHQ9',
                headerBackTitle: 'Back',
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="BDI"
              component={BDI}
              options={{
                title: 'BDI',
                headerBackTitle: 'Back',
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="DoctorDetails"
              component={DoctorDetails}
              options={{
                title: 'DoctorDetails',
                headerBackTitle: 'Back',
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="HDRS"
              component={HDRS}
              options={{
                title: 'HDRS',
                headerBackTitle: 'Back',
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="SettingsMenu"
              component={SettingsMenu}
              options={{
                title: 'SettingsMenu',
                headerBackTitle: 'Back',
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="ConsultExperts"
              component={ConsultExperts}
              options={{
                title: 'ConsultExperts',
                headerBackTitle: 'Back',
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="KnowMore"
              component={KnowMore}
              options={{
                title: 'KnowMore',
                headerBackTitle: 'Back',
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="BookAppointment"
              component={BookAppointment}
              options={{
                title: 'Book Appointment',
                headerBackTitle: 'Back',
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="AppointmentHistory"
              component={AppointmentHistory}
              options={{
                title: 'My Appointments',
                headerBackTitle: 'Back',
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="VideoCall"
              component={VideoCall}
              options={{
                title: 'Video Call',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="AudioCall"
              component={AudioCall}
              options={{
                title: 'Audio Call',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ChatScreen"
              component={ChatScreen}
              options={{
                title: 'Chat',
                headerShown: false,
              }}
            />
          </>
        )
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={Register}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DoctorRegister"
            component={DoctorRegister}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DoctorLogin"
            component={DoctorLogin}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default ScreenMenu;
