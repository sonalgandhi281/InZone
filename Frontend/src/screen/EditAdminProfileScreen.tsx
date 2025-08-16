import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BASE_URL from '../../config/apiConfig';

const EditAdminProfileScreen = () => {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('Admin');
  const departments = ['IT', 'HR', 'DATA ANALYTICS', 'OPERATIONS'];


  useFocusEffect(
    useCallback(() => {
      const fetchAdminData = async () => {
        try {
          const storedToken = await AsyncStorage.getItem('token');
          if (!storedToken) {
            Alert.alert('Error', 'Token not found');
            return;
          }
          setToken(storedToken);
          const res = await axios.post(`${BASE_URL}/admindata`, { token: storedToken });
          const data = res.data.data;

          setFirstName(data.firstName);
          setLastName(data.lastName);
          setEmail(data.email);
          setContact(data.contact);
          setEmployeeId(data.employeeId.toString());
          setDepartment(data.department);
          setDesignation(data.role === 'admin' ? 'Admin' : 'User');
        } catch (err) {
          console.error(err);
          Alert.alert('Error', 'Failed to fetch profile');
        } finally {
          setLoading(false);
        }
      };
      fetchAdminData();
    }, [])
  );

  const handleSave = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/update-profile`, {
        employeeId,
        firstName,
        lastName,
        email,
        contact,
        department,
      });

      if (res.data.status === 'ok') {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', res.data.message || 'Update failed');
      }
    } catch (err) {
      console.error('Update Error:', err);
      Alert.alert('Error', 'Could not update profile');
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Admin Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={contact}
        onChangeText={setContact}
        keyboardType="phone-pad"
      />

      <TextInput
        style={[styles.input, { backgroundColor: '#eee' }]}
        placeholder="Employee ID"
        value={employeeId}
        editable={false}
      />

      <View style={styles.input}>
  <Text style={{ fontSize: 16, color: '#333', marginBottom: 4 }}>Department</Text>
  {departments.map(dep => (
    <TouchableOpacity
      key={dep}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: department === dep ? '#003366' : '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 5,
      }}
      onPress={() => setDepartment(dep)}
    >
      <Text style={{ color: department === dep ? '#fff' : '#333', fontSize: 15 }}>{dep}</Text>
    </TouchableOpacity>
  ))}
</View>


      <TextInput
        style={[styles.input, { backgroundColor: '#eee' }]}
        placeholder="Designation"
        value={designation}
        editable={false}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditAdminProfileScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#f4f8ff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    textAlign: 'center',
    marginBottom: 25,
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#003366',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});