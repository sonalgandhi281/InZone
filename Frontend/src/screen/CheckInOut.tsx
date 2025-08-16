import React, { useEffect, useState, useCallback } from 'react';
import {
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import GetLocation from 'react-native-get-location';
import MapView, { Marker, Polygon, Region } from 'react-native-maps';
import { isPointInPolygon } from 'geolib';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkBlue, lightBlue, white } from '../Constants';
import BASE_URL from '../../config/apiConfig';

const { height, width } = Dimensions.get('window');

interface userData {
  employeeId: number;
  firstName: string;
  lastName: string;
  department: string;
}

export default function CheckInOut() {
  const [location, setLocation] = useState<Region | null>(null);
  const [isInsideGeofence, setIsInsideGeofence] = useState<boolean | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [lastCheckOutDate, setLastCheckOutDate] = useState<Date | null>(null);
  const [totalHours, setTotalHours] = useState<string | null>(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const [successText, setSuccessText] = useState('');
  const [polygonCoords, setPolygonCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [userData, setUserData] = useState<userData | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isWithinCheckInHours, setIsWithinCheckInHours] = useState(true); // ✅ NEW

  const defaultLocation = {
    latitude: 28.582126,
    longitude: 77.199493,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const defaultPolygon = [
    { latitude: 28.589425, longitude: 77.19956 },
    { latitude: 28.58209, longitude: 77.200919 },
    { latitude: 28.580685, longitude: 77.211355 },
    { latitude: 28.587327, longitude: 77.212342 },
    { latitude: 28.587134, longitude: 77.203528 },
  ];

  const today = new Date();
  const isSunday = today.getDay() === 6;

  const updateAttendanceState = (record: any) => {
    if (record) {
      if (record.checkInTime) {
        setCheckInTime(record.checkInTime);
        setCheckInDate(new Date(record.checkInDateTime || record.date));
      }

      if (record.checkOutTime) {
        setCheckOutTime(record.checkOutTime);
        setTotalHours(record.totalHours || null);
        setLastCheckOutDate(new Date(record.date));
      }

      const checkedIn = record.checkInTime && !record.checkOutTime;
      setHasCheckedIn(!!checkedIn);
    } else {
      setCheckInTime(null);
      setCheckOutTime(null);
      setTotalHours(null);
      setHasCheckedIn(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.post(`${BASE_URL}/userdata`, { token });
        const user = res.data.data;
        setUserData(user);

        const geoRes = await axios.post(`${BASE_URL}/get-dept-geofence`, {
          department: user.department,
        });

        if (geoRes.data.status === "ok" && geoRes.data.data?.coordinates) {
          setPolygonCoords(geoRes.data.data.coordinates);
        } else {
          setPolygonCoords(defaultPolygon);
        }

        const attendanceRes = await axios.post(`${BASE_URL}/get-today-attendance`, {
          employeeId: user.employeeId,
        });

        const normalizeDate = (dateStr: string | Date) =>
          new Date(dateStr).toISOString().split("T")[0];

        const todayStr = normalizeDate(new Date());

        const records = attendanceRes.data.data;
        const todayRecord = Array.isArray(records)
          ? records.find((r: any) => normalizeDate(r.date) === todayStr)
          : records && normalizeDate(records.date) === todayStr
            ? records
            : null;

        updateAttendanceState(todayRecord);

        const now = new Date();
        const hour = now.getHours();
        setIsWithinCheckInHours(hour >= 8 && hour < 20);

      } catch (err) {
        console.log("Error fetching data:", err);
        setPolygonCoords(defaultPolygon);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      setIsWithinCheckInHours(hour >= 8 && hour < 20);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const prepareLocation = async () => {
        const granted = await requestLocationPermission();
        if (granted && active) {
          await fetchLocation();
          setTimeout(() => setIsMapReady(true), 3000);
        }
      };

      prepareLocation();

      const fetchLatestAttendance = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (!token) return;
          const res = await axios.post(`${BASE_URL}/userdata`, { token });
          const user = res.data.data;
          setUserData(user);

          const attendanceRes = await axios.post(`${BASE_URL}/get-today-attendance`, {
            employeeId: user.employeeId,
          });

          const normalizeDate = (dateStr: string | Date) =>
            new Date(dateStr).toISOString().split("T")[0];
          const todayStr = normalizeDate(new Date());

          const todayRecord = Array.isArray(attendanceRes.data.data)
            ? attendanceRes.data.data.find((r: any) => normalizeDate(r.date) === todayStr)
            : attendanceRes.data.data;

          updateAttendanceState(todayRecord);
        } catch (err) {
          console.log("Error refreshing attendance on focus:", err);
        }
      };

      fetchLatestAttendance();

      return () => {
        active = false;
        setIsMapReady(false);
      };
    }, [polygonCoords])
  );

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const fetchLocation = async () => {
    try {
      const loc = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 60000,
      });

      const coords = { latitude: loc.latitude, longitude: loc.longitude };
      const inside = polygonCoords.length > 0 && isPointInPolygon(coords, polygonCoords);

      setIsInsideGeofence(inside);
      setLocation({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    } catch (error) {
      console.warn("Location error:", error);
    }
  };

  const handleCheckIn = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();

    if (lastCheckOutDate && now.toDateString() === lastCheckOutDate.toDateString()) {
      Alert.alert('Check-in Blocked', 'You already checked out today.');
      return;
    }

    if (!isInsideGeofence) {
      Alert.alert('Check In Failed', 'You are outside the geofenced area.');
      return;
    }

    setCheckInTime(timeStr);
    setCheckInDate(now);
    setHasCheckedIn(true);
    setSuccessText(`Checked In at ${timeStr}`);
    setShowSuccessAnim(true);
    setTimeout(() => setShowSuccessAnim(false), 3000);

    axios.post(`${BASE_URL}/mark-attendance`, {
      employeeId: userData?.employeeId,
      checkInTime: timeStr,
      checkInDateTime: now.toISOString(),
    }).catch(err => console.error("Check-in error", err));
  };

  const handleCheckOut = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();

    if (!isInsideGeofence) {
      Alert.alert('Check Out Failed', 'You are outside the geofenced area.');
      return;
    }

    let totalDuration = "---";

    if (checkInDate) {
      const diffMs = now.getTime() - checkInDate.getTime();
      const totalMinutes = Math.floor(diffMs / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      totalDuration = `${hours}hrs ${minutes}mins`;
      setTotalHours(totalDuration);
    }

    setCheckOutTime(timeStr);
    setLastCheckOutDate(now);
    setHasCheckedIn(false);
    setSuccessText(`Checked Out at ${timeStr}`);
    setShowSuccessAnim(true);
    setTimeout(() => setShowSuccessAnim(false), 3000);

    axios.post(`${BASE_URL}/mark-attendance`, {
      employeeId: userData?.employeeId,
      checkOutTime: timeStr,
      totalHours: totalDuration,
    }).catch(err => console.error("Check-out error", err));
  };

  if (!isMapReady) {
    return (
      <View style={styles.fullScreenCenter}>
        <LottieView
          source={require('../assets/plane.json')}
          autoPlay
          loop
          style={{ width: 250, height: 250 }}
        />
        <Text style={{ marginTop: 20, fontSize: 16, color: '#555' }}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        {userData ? `Hello, ${userData.firstName} ${userData.lastName}` : 'Hello'}
      </Text>

      <MapView
        style={styles.map}
        region={location || defaultLocation}
        showsUserLocation
      >
        {location && (
          <Marker
            coordinate={location}
            title="You"
            pinColor="green"
          />
        )}
        {polygonCoords.length > 0 && (
          <Polygon
            coordinates={polygonCoords}
            strokeColor="#3399FF"
            fillColor="rgba(51, 153, 255, 0.2)"
            strokeWidth={2}
          />
        )}
      </MapView>

      <View style={styles.infoCardContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.infoCardText}>Check In</Text>
          <Text style={styles.infoCardSub}>{checkInTime || '---'}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoCardText}>Check Out</Text>
          <Text style={styles.infoCardSub}>{checkOutTime || '---'}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoCardText}>Total Hours</Text>
          <Text style={styles.infoCardSub}>{totalHours || '---'}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={hasCheckedIn ? handleCheckOut : handleCheckIn}
        style={[styles.checkinwrapper, (isSunday || !isWithinCheckInHours) && { backgroundColor: '#aaa' }]}
        disabled={isSunday || !isWithinCheckInHours}
      >
        <Text style={styles.checkintext}>
          {isSunday
            ? 'Disabled'
            : !isWithinCheckInHours
              ? 'Disabled'
              : hasCheckedIn
                ? 'Check Out'
                : 'Check In'}
        </Text>
      </TouchableOpacity>

      {showSuccessAnim && (
        <View style={styles.successOverlay}>
          <LottieView
            source={require('../assets/checkoutloader.json')}
            autoPlay
            loop={false}
            style={styles.successAnimation}
          />
          <Text style={styles.successText}>{successText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  greeting: {
    alignSelf: 'flex-end',
    marginTop: 20,
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 20,
    color: '#2F4156',
  },
  map: {
    marginTop: 15,
    height: height * 0.4,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: lightBlue,
    width: '100%',
    paddingVertical: 20,
    marginTop: 20,
    borderRadius: 12,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  infoCard: {
    alignItems: 'center',
    flex: 1,
  },
  infoCardText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    color: '#004D40',
  },
  infoCardSub: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  checkinwrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    width: 100,
    height: 100,
    backgroundColor: darkBlue,
    borderWidth: 2,
    borderRadius: 50,
    elevation: 6,
    shadowColor: '#E0F2F1',
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  checkintext: {
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: white,
  },
  successOverlay: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingTop: 20,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  successAnimation: {
    width: 200,
    height: 200,
  },
  successText: {
    fontSize: 20,
    fontWeight: '400',
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Montserrat-Light',
  },
  fullScreenCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});