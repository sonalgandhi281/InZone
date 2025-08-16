import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Feather';
import BASE_URL from '../../config/apiConfig';

const ChangePasswordScreen = () => {
  const navigation = useNavigation<any>();
  const [employeeId, setEmployeeId] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useEffect(() => {
    getEmployeeId();
  }, []);

  const getEmployeeId = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.post(`${BASE_URL}/userdata`, { token });
      if (response.data.status === 'ok') {
        setEmployeeId(response.data.data.employeeId);
      }
    } catch (error) {
      console.error('Error fetching employee ID', error);
    }
  };

  const validatePassword = (pwd: string) => {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pwd);
  };

  const handleChangePassword = async () => {
    setErrors({ current: '', new: '', confirm: '' });
    let valid = true;

    if (!currentPassword) {
      setErrors((prev) => ({ ...prev, current: 'Current password is required' }));
      valid = false;
    }

    if (!newPassword) {
      setErrors((prev) => ({ ...prev, new: 'New password is required' }));
      valid = false;
    } else if (!validatePassword(newPassword)) {
      setErrors((prev) => ({
        ...prev,
        new:
          'Must contain 1 uppercase, 1 lowercase, 1 number, 1 special character & min 8 characters',
      }));
      valid = false;
    }

    if (!confirmPassword) {
      setErrors((prev) => ({ ...prev, confirm: 'Please confirm new password' }));
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirm: 'Passwords do not match' }));
      valid = false;
    }

    if (!valid) return;

    try {
      const response = await axios.post(`${BASE_URL}/change-password`, {
        employeeId,
        currentPassword,
        newPassword,
      });

      if (response.data.status === 'ok') {
        navigation.goBack();
      } else {
        setErrors((prev) => ({ ...prev, current: response.data.message || 'Error occurred' }));
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setErrors((prev) => ({ ...prev, current: 'Incorrect current password' }));
      } else {
        setErrors((prev) => ({ ...prev, current: 'Server error' }));
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Change Password</Text>

      {/* Current Password */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Current Password"
          placeholderTextColor="#000"
          secureTextEntry={!showCurrent}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
          <Icon name={showCurrent ? 'eye' : 'eye-off'} size={20} color="#333" />
        </TouchableOpacity>
      </View>
      {errors.current !== '' && <Text style={styles.error}>{errors.current}</Text>}

      {/* New Password */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#000"
          secureTextEntry={!showNew}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        {newPassword.length > 0 ? (
          <Icon
            name={validatePassword(newPassword) ? 'check-circle' : 'x-circle'}
            size={20}
            color={validatePassword(newPassword) ? 'green' : 'red'}
          />
        ) : (
          <TouchableOpacity onPress={() => setShowNew(!showNew)}>
            <Icon name={showNew ? 'eye' : 'eye-off'} size={20} color="#333" />
          </TouchableOpacity>
        )}
      </View>
      {errors.new !== '' && <Text style={styles.error}>{errors.new}</Text>}

      {/* Confirm Password */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          placeholderTextColor="#000"
          secureTextEntry={!showConfirm}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        {confirmPassword.length > 0 ? (
          <Icon
            name={
              confirmPassword === newPassword ? 'check-circle' : 'x-circle'
            }
            size={20}
            color={confirmPassword === newPassword ? 'green' : 'red'}
          />
        ) : (
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Icon name={showConfirm ? 'eye' : 'eye-off'} size={20} color="#333" />
          </TouchableOpacity>
        )}
      </View>
      {errors.confirm !== '' && <Text style={styles.error}>{errors.confirm}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#EAF3FB',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#003366',
  },
  error: {
    color: 'red',
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#003366',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
