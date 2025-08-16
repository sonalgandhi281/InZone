import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import BASE_URL from '../../config/apiConfig';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false); // Track if OTP is being sent
  const navigation = useNavigation<any>();

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (isSending) return; // Prevent multiple presses

    setIsSending(true); // Disable button while request is in progress

    try {
      const response = await axios.post(`${BASE_URL}/send-otp`, { email });

      if (response.data.status === 'ok') {
        Alert.alert('Success', 'OTP sent to your email');
        navigation.navigate('OTPVerification', { email });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setIsSending(false); // Optional: Keep disabled or re-enable after some delay
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.instructions}>
        Enter your registered email. We'll send you an OTP to reset your password.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#000"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Button
        title={isSending ? 'Sending...' : 'Send OTP'}
        onPress={handleSendOTP}
        disabled={isSending}
      />
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    color: '#000',
  },
});