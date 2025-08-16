import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BASE_URL from '../../config/apiConfig';

const ResetPasswordScreen = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { email } = route.params;

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  };

  useEffect(() => {
    if (newPassword.length > 0) {
      if (!validatePassword(newPassword)) {
        setErrors((prev) => ({
          ...prev,
          newPassword: 'Min 8 chars, include uppercase, lowercase, number & special char.',
        }));
      } else {
        setErrors((prev) => ({ ...prev, newPassword: undefined }));
      }
    } else {
      setErrors((prev) => ({ ...prev, newPassword: 'Please enter a new password' }));
    }
  }, [newPassword]);

  useEffect(() => {
    if (confirmPassword.length > 0) {
      if (confirmPassword !== newPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
      }
    } else {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Please confirm your password' }));
    }
  }, [confirmPassword, newPassword]);

  const handleResetPassword = async () => {
    if (errors.newPassword || errors.confirmPassword) return;

    try {
      const res = await axios.post(`${BASE_URL}/reset-password`, {
        email,
        newPassword,
      });

      if (res.data.status === 'ok') {
        // ✅ Show success alert
        Alert.alert('Success', 'Password was successfully reset.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]);
      } else {
        setErrors({ confirmPassword: res.data.message || 'Reset failed' });
      }
    } catch (err) {
      setErrors({ confirmPassword: 'Something went wrong' });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#000"
          secureTextEntry={!showPassword}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'eye' : 'eye-off'} size={24} color="#555" />
        </TouchableOpacity>
      </View>
      {errors.newPassword ? <Text style={styles.errorText}>{errors.newPassword}</Text> : null}

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#000"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Icon name={showConfirmPassword ? 'eye' : 'eye-off'} size={24} color="#555" />
        </TouchableOpacity>
      </View>
      {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

      {/* ✅ Custom Blue Button */}
      <TouchableOpacity
        style={[
          styles.resetButton,
          (!newPassword || !confirmPassword || errors.newPassword || errors.confirmPassword) && styles.disabledButton,
        ]}
        onPress={handleResetPassword}
        disabled={
          !newPassword || !confirmPassword || errors.newPassword !== undefined || errors.confirmPassword !== undefined
        }
      >
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    color: '#000',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    marginLeft: 5,
  },
  resetButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#a0c4ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
