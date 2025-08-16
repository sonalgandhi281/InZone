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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
import BASE_URL from '../../config/apiConfig';

const { width, height } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState({
    workingDays: 0,
    leaves: 0,
    avgHours: 0,
  });

  useFocusEffect(
  React.useCallback(() => {
    fetchUserData();
  }, [])
);


  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

      const response = await axios.post(`${BASE_URL}/userdata`, { token });
      if (response.data.status === 'ok') {
        setUserData(response.data.data);
        fetchAttendanceStats(response.data.data.employeeId);
      } else {
        Alert.alert('Error', 'Failed to load user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Something went wrong while fetching user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStats = async (employeeId: string) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();

    const presentRes = await axios.post(`${BASE_URL}/get-attendance-by-status`, {
      employeeId,
      status: 'Present',
      month: currentMonthName,
      year: currentYear,
    });

    const absentRes = await axios.post(`${BASE_URL}/get-attendance-by-status`, {
      employeeId,
      status: 'Absent',
      month: currentMonthName,
      year: currentYear,
    });

    const presentAll = presentRes.data.data;
    const absentAll = absentRes.data.data;

    const presentRecords = presentAll.filter((record: any) => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getMonth() === currentMonth &&
        recordDate.getFullYear() === currentYear
      );
    });

    const absentRecords = absentAll.filter((record: any) => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getMonth() === currentMonth &&
        recordDate.getFullYear() === currentYear
      );
    });

    let totalHours = 0;
    for (const record of presentRecords) {
      const timeStr = record.totalHours || '';
      const hrsMatch = timeStr.match(/(\d+)\s*hrs/);
      const minsMatch = timeStr.match(/(\d+)\s*mins/);
      const hrs = hrsMatch ? parseInt(hrsMatch[1], 10) : 0;
      const mins = minsMatch ? parseInt(minsMatch[1], 10) : 0;
      totalHours += hrs + mins / 60;
    }

    const avgHours = presentRecords.length > 0
      ? parseFloat((totalHours / presentRecords.length).toFixed(1))
      : 0;

    setAttendanceData({
      workingDays: presentRecords.length,
      leaves: absentRecords.length,
      avgHours,
    });
  } catch (err) {
    console.error('Error fetching attendance stats:', err);
  }
};

const handleImagePick = async () => {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    includeBase64: true,
  });

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
      fetchUserData(); // refresh UI
    } else {
      Alert.alert('Error', 'Failed to update picture');
    }
  } catch (error) {
    console.error('Upload error:', error);
    Alert.alert('Error', 'Something went wrong');
  }
};
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.setItem('isLoggedIn', 'false');
      Alert.alert('Logged Out', 'You have been logged out successfully.');
      setTimeout(() => {
        navigation.replace('Getstarted');
      }, 1500);
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Something went wrong during logout.');
    }
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
          {/* <Image
            source={require('../assets/avatar.webp')}
            style={styles.profileImage}
          /> */}

          <TouchableOpacity onPress={handleImagePick}>
  <Image
    source={
      userData?.profilePic
        ? { uri: userData.profilePic }
        : require('../assets/person.jpg')
    }
    style={styles.profileImage}
  />
</TouchableOpacity>
<Text style={{ fontSize: 12, color: '#666' }}>Tap image to update</Text>

          <Text style={styles.name}>
            {userData ? `${userData.firstName} ${userData.lastName}` : 'Name'}
          </Text>
          <Text style={styles.subText}>ID: {userData?.employeeId}</Text>
          <Text style={styles.subText}>
                {userData?.post || 'Post'}, {userData?.department}
          </Text>


          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.detail}>📧 {userData?.email}</Text>
            <Text style={styles.detail}>📞 {userData?.contact}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Attendance Stats (This Month)
            </Text>
            <Text style={styles.detail}>
              📅 Working Days: {attendanceData.workingDays}
            </Text>
            <Text style={styles.detail}>
              ❌ Leaves Taken: {attendanceData.leaves}
            </Text>
            <Text style={styles.detail}>
              ⏱ Avg. Daily Hours: {attendanceData.avgHours}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#003366' }]}
            onPress={() => navigation.navigate('Editprofile')}
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

export default ProfileScreen;

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