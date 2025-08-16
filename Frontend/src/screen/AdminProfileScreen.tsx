import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
import BASE_URL from '../../config/apiConfig';

const { width, height } = Dimensions.get('window');

const AdminProfileScreen = () => {
  const navigation = useNavigation<any>();
  const [adminData, setAdminData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchAdminData();
    }, [])
  );

  const fetchAdminData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert('Error', 'Token not found');

      const res = await axios.post(`${BASE_URL}/admindata`, { token });

      if (res.data.status === 'ok') {
        setAdminData(res.data.data);
        fetchAdminStats(res.data.data.employeeId);
      } else {
        Alert.alert('Error', 'Failed to load admin data');
      }
    } catch (error) {
      console.error('Fetch admin error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminStats = async (adminId: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/get-admin-stats`, { adminId });
      if (res.data.status === 'ok') {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('Admin stats error:', error);
    }
  };

  const handleImagePick = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', includeBase64: true });
    if (result.didCancel || !result.assets || result.assets.length === 0) return;

    const base64Image = `data:${result.assets[0].type};base64,${result.assets[0].base64}`;

    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.post(`${BASE_URL}/update-profile-pic`, {
        token,
        profilePic: base64Image,
      });

      if (res.data.status === 'ok') {
        Alert.alert('Success', 'Profile picture updated!');
        fetchAdminData(); // refresh
      } else {
        Alert.alert('Error', 'Failed to update picture');
      }
    } catch (err) {
      console.error('Upload error:', err);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.setItem('isLoggedIn', 'false');
    Alert.alert('Logged Out', 'You have been logged out successfully.');
    setTimeout(() => navigation.replace('Getstarted'), 1500);
  };

  const handleChangePassword = () => {
    navigation.navigate('Changepassword');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/profile2.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.overlay}>
          <TouchableOpacity onPress={handleImagePick}>
            <Image
              source={
                adminData?.profilePic
                  ? { uri: adminData.profilePic }
                  : require('../assets/person.jpg')
              }
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <Text style={{ fontSize: 12, color: '#666' }}>Tap image to update</Text>

          <Text style={styles.name}>{adminData?.firstName} {adminData?.lastName}</Text>
          <Text style={styles.subText}>ID: {adminData?.employeeId}</Text>
          <Text style={styles.subText}>{adminData?.designation || 'Admin'}, {adminData?.department}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.detail}>📧 {adminData?.email}</Text>
            <Text style={styles.detail}>📞 {adminData?.contact}</Text>
          </View>

          <View style={styles.section}>
  <Text style={styles.sectionTitle}>Admin Stats (This Month)</Text>
  <Text style={styles.detail}>👥 Employees Managed: {stats?.managedEmployees || 0}</Text>
  {/* <Text style={styles.detail}>📊 Attendance Monitored: {stats?.totalCheckInsMonth || 0}</Text> */}
  <Text style={styles.detail}>✅ Approvals: {stats?.approvalsHandled || 0}</Text>
  <Text style={styles.detail}>❌ Declines: {stats?.declinesHandled || 0}</Text>
</View>


          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#003366' }]}
            onPress={() => navigation.navigate('Admineditprofile')}
          >
            <Text style={styles.buttonText}>Edit Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#003366' }]}
            onPress={handleChangePassword}
          >
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FF3B30' }]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default AdminProfileScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#e6e6e6',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginVertical: 2,
  },
  section: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#003366',
  },
  detail: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
  },
  button: {
    width: '100%',
    marginTop: 15,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});