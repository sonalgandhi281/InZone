import React, { useEffect, useState } from 'react';
import {
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from 'react-native';
import GetLocation from 'react-native-get-location';
import MapView, { Marker } from 'react-native-maps';
import { Region } from 'react-native-maps';
import { darkBlue } from '../Constants';
import { Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export default function CurrentLocation() {
  const [location, setLocation] = useState<Region | null>(null);
  const [permissionGranter, setPermissionGranter] = useState(false);

  const defaultLocation = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('granted');
          setPermissionGranter(true);
          _getCurrentLocation();
        } else {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to show your current location on the map.',
          );
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };
  function _getCurrentLocation (){
     GetLocation.getCurrentPosition({
      enableHighAccuracy : true ,
      timeout :60000,
     })
     .then (location=>{
      console.log('My Current Location is  =>' , location)
      setLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
     })
     .catch (error =>{
      const {code , message} = error ;
      console.warn (code ,message)
     })
  }

  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <ImageBackground
              source={require('../assets/checkin4.jpg')}  
              style={styles.background}
              resizeMode="cover" 
    >
      <View style={styles.container}>
        <Text style = {styles.greeting}>Hello, UserName</Text>
        <MapView
         style={styles.map}
          region={location || defaultLocation}
          onRegionChangeComplete={data => console.log(data)}
          showsUserLocation ={true}
        >
        {location && (
          <Marker
            coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title={'You are here'}
          />
        )}
        </MapView>
        <View style={styles.infoCardContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardText}>Check in</Text>
              <Text style={styles.infoCardSub}>---</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardText}>Check Out</Text>
              <Text style={styles.infoCardSub}>---</Text>
            </View>
           <View style={styles.infoCard}>
              <Text style={styles.infoCardText}>Total Hours</Text>
              <Text style={styles.infoCardSub}>---</Text>
            </View>
         </View>
        <TouchableOpacity
          //  onPress={handleLogin}
          style={styles.checkinwrapper}>
          <Text style={styles.checkintext}>Check In</Text>
         </TouchableOpacity>
    </View>
    
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background :{
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    alignItems :'center',
    justifyContent :'center',
    // backgroundColor: '#fff',
  },
  greeting :{
    // flex :1,
    textAlign :'right',
    marginRight :15,
    marginTop : 15,
    fontFamily : 'Montserrat-Light',
    fontSize :22,
  },
  map: {
    marginTop : 15,
    height: height * 0.45, // Map takes upper half
    width: '100%',
    // borderRadius : '10%',
  },
  infoCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#d9f1f1',
    paddingVertical: 15,
  },
  infoCard: {
    alignItems: 'center',
  },
  infoCardText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCardSub: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  checkinwrapper :{ 
    alignItems :'center',
    justifyContent:'center',
      marginTop : 30,
      // marginLeft : 40,
      borderWidth :2 ,
      // borderColor : '#2F4156',
      width :  '45%',
      // height : height * 0.2
      height : 50,
      // borderRadius : 100,
      // backgroundColor : '#B2EBF2',
      backgroundColor: 'rgba(255, 255, 255, 0.53)',
      borderColor: '3DCE3F1',
      // color: '#FFFFFF',           // White text
      borderRadius: 50,           // For pill shape
      elevation: 9,                  // subtle shadow (Android)
      shadowColor: '#E0F2F1',           // iOS shadow
      shadowOpacity: 0.1,
      shadowRadius: 4,

    },
  checkintext :{
      fontFamily: 'Montserrat-SemiBold',
      fontSize :20,
      color :'#2F4156'
    },
});
