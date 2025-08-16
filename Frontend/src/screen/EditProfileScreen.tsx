import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BASE_URL from '../../config/apiConfig';

const EditProfileScreen = () => {
  const navigation = useNavigation<any>();

  const [employeeId, setEmployeeId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

      const response = await axios.post(`${BASE_URL}/userdata`, { token });
      if (response.data.status === 'ok') {
        const user = response.data.data;
        setEmployeeId(user.employeeId);
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.email);
        setPhone(user.contact);
      } else {
        Alert.alert('Error', 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong while loading data');
    }
  };

  const validate = () => {
    let valid = true;
    const newErrors = { firstName: '', lastName: '', email: '', phone: '' };

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      valid = false;
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Invalid email format';
      valid = false;
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
      valid = false;
    } else if (phoneDigits.length !== 10) {
      newErrors.phone = 'Phone number must be 10 digits';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const response = await axios.post(`${BASE_URL}/update-profile`, {
        employeeId,
        firstName,
        lastName,
        email,
        contact: phone,
      });

      if (response.data.status === 'ok') {
        Alert.alert('Success', 'Your profile has been updated.');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Something went wrong while updating profile');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={(text) => {
          setFirstName(text);
          setErrors({ ...errors, firstName: '' });
        }}
      />
      {errors.firstName ? <Text style={styles.error}>{errors.firstName}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={(text) => {
          setLastName(text);
          setErrors({ ...errors, lastName: '' });
        }}
      />
      {errors.lastName ? <Text style={styles.error}>{errors.lastName}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrors({ ...errors, email: '' });
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={(text) => {
          setPhone(text);
          setErrors({ ...errors, phone: '' });
        }}
        keyboardType="phone-pad"
      />
      {errors.phone ? <Text style={styles.error}>{errors.phone}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#ffffffcc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
  },
});




