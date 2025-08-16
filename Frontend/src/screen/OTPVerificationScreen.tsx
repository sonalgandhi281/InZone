import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import BASE_URL from '../../config/apiConfig';

const OTPVerificationScreen = () => {
  const [otp, setOTP] = useState('');
  const [resendTimer, setResendTimer] = useState(30); // 30 sec timer
  const inputRef = useRef<TextInput>(null);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { email } = route.params;

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Focus input on box click
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit OTP');
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/verify-otp`, { email, otp });
      if (res.data.status === 'ok') {
        navigation.navigate('Resetpassword', { email });
      } else {
        Alert.alert('Invalid OTP', res.data.message);
      }
    } catch (err) {
      Alert.alert('Invalid OTP', 'The OTP you entered is not valid. Please enter correct OTP.');
    }
  };

  const handleResendOTP = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/send-otp`, { email });
      if (res.data.status === 'ok') {
        setResendTimer(30);
        Alert.alert('OTP Sent', 'A new OTP has been sent to your email');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  const renderBoxes = () => {
    const digits = otp.split('');
    const boxes = [];

    for (let i = 0; i < 6; i++) {
      const isCurrent = i === otp.length; // current focus box
      const isFocused = otp.length < 6;

      boxes.push(
        <TouchableOpacity key={i} onPress={focusInput}>
          <View style={styles.box}>
            <Text style={styles.digit}>
              {digits[i] ? digits[i] : isCurrent && isFocused ? '|' : ''}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return boxes;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.instructions}>
          Enter the 6-digit code sent to {email}
        </Text>

        {/* Hidden input field */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={otp}
          onChangeText={text => {
            if (/^\d*$/.test(text) && text.length <= 6) setOTP(text);
          }}
          keyboardType="numeric"
          autoFocus
        />

        <View style={styles.boxContainer}>{renderBoxes()}</View>

        <View style={styles.button}>
          <Button title="Verify" onPress={handleVerifyOTP} />
        </View>

        <TouchableOpacity
          onPress={handleResendOTP}
          disabled={resendTimer > 0}
          style={styles.resendContainer}
        >
          <Text style={[styles.resendText, { color: resendTimer > 0 ? '#aaa' : '#003366' }]}>
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default OTPVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f7f9fc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#003366',
  },
  instructions: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#555',
  },
  boxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  box: {
    width: 45,
    height: 50,
    borderWidth: 1.5,
    borderColor: '#003366',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  digit: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  button: {
    marginHorizontal: 50,
    marginTop: 10,
  },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    fontWeight: '500',
  },
});