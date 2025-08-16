
import React, { useEffect, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './src/screen/HomeScreen';
import LoginScreen from './src/screen/LoginScreen';
import SignUpScreen from './src/screen/SignUpScreen';
import CurrentLocation from './src/screen/CurrentLocation';
import Confirmation from './src/screen/Confirmation';
import ForgotPasswordScreen from './src/screen/ForgotPasswordScreen';
import OTPVerificationScreen from './src/screen/OTPVerificationScreen';
import ResetPasswordScreen from './src/screen/ResetPasswordScreen';
import TermsAndConditions from './src/screen/TermsAndConditionScreen';
import PrivacyPolicyScreen from './src/screen/PrivacyPolicyScreen';
import CheckIn from './src/screen/CheckInOut';
import CheckInOut from './src/screen/CheckInOut';
import RecordScreen from './src/screen/RecordScreen';
import BottomNavbar from './src/screen/BottomNavbar';
import LoadingScreen from './src/screen/LoadingScreen';
import RecordLoadingScreen from './src/screen/RecordLoadingScreen';
import AdminNavigator from './src/screen/AdminNavigator';
import ProfileScreen from './src/screen/ProfileScreen';
import EditProfileScreen from './src/screen/EditProfileScreen';
import ChangePasswordScreen from './src/screen/ChangePasswordScreen';
import EditAdminProfileScreen from './src/screen/EditAdminProfileScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminStack from './src/screen/AdminStack';
import RecordScreenWrapper from './src/screen/RecordScreenWrapper';

const Stack = createNativeStackNavigator();

const App = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      const role = await AsyncStorage.getItem('role');

      if (isLoggedIn === 'true') {
        if (role === 'admin') {
          setInitialRoute('Adminnavigator');
        } else {
          setInitialRoute('Bottomnavbar');
        }
      } else {
        setInitialRoute('Loader');
      }
    };
    checkLoginStatus();
  }, []);

  if (!initialRoute) return null; // Prevents flicker


  return (
    <NavigationContainer>
      <Stack.Navigator 
       initialRouteName={initialRoute}
      screenOptions={{
        headerShown : false
      }}>
        <Stack.Screen name = 'Loader' component={LoadingScreen}></Stack.Screen>
        <Stack.Screen name='Getstarted' component={HomeScreen}></Stack.Screen> 
        <Stack.Screen name ='Login' component={LoginScreen}></Stack.Screen>
        <Stack.Screen name='Signup' component={SignUpScreen}></Stack.Screen> 
        <Stack.Screen name='Termsandcondn' component={TermsAndConditions}></Stack.Screen>
        <Stack.Screen name ='Privacypolicy' component={PrivacyPolicyScreen}></Stack.Screen>  
        <Stack.Screen name='Forgotpassword' component={ForgotPasswordScreen}></Stack.Screen>
        <Stack.Screen name = 'OTPVerification' component={OTPVerificationScreen}></Stack.Screen>
        <Stack.Screen name = 'Resetpassword' component = {ResetPasswordScreen}></Stack.Screen> 
        <Stack.Screen name = 'Approval' component={Confirmation}></Stack.Screen> 

        <Stack.Screen name="Bottomnavbar" component={BottomNavbar}></Stack.Screen>
        <Stack.Screen name='Editprofile' component={EditProfileScreen}></Stack.Screen>
        <Stack.Screen name='Changepassword' component={ChangePasswordScreen}></Stack.Screen>
        {/* <Stack.Screen name='Profile' component={ProfileScreen}></Stack.Screen> */}
        {/* <Stack.Screen name='Checkinout' component={CheckInOut}></Stack.Screen>
         <Stack.Screen name='Record' component={RecordScreen}></Stack.Screen> 
        <Stack.Screen name = 'Reacordloader' component={RecordLoadingScreen}></Stack.Screen>
        <Stack.Screen name = 'Checkin' component={CurrentLocation}></Stack.Screen>*/}

        {/* <Stack.Screen name='Adminnavigator'component={AdminNavigator}></Stack.Screen> */}
        <Stack.Screen name ='Admineditprofile' component={EditAdminProfileScreen}></Stack.Screen>
        <Stack.Screen name='Adminnavigator'component={AdminStack}></Stack.Screen>
        <Stack.Screen name="RecordScreenWrapper" component={RecordScreenWrapper} ></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App;