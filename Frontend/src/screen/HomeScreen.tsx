import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, SafeAreaView } from 'react-native';
import React from 'react';
import { ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ImageBackground
      source={require('../assets/welcomebg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <Image
          source={require('../assets/aai-logo-removebg-preview.png')}
          style={styles.logo}
        />

        <Text style={styles.downText}>Welcome to AAI’s Trusted Attendance Portal !</Text>
        <Text style={styles.down2Text}>Accurate. Secure. Fast</Text>

        <TouchableOpacity style={styles.getStartedWrapper} onPress={handleLogin}>
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
 downText: {
  textAlign: 'center',
  fontWeight: '600',
  marginTop: height * 0.58,
  fontFamily: 'Montserrat-Regular',
  fontSize: 24,
},

  down2Text: {
    marginTop: 11,
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
  },
  getStartedWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    borderWidth: 2,
    width: width * 0.9, 
    height: height * 0.065, 
    backgroundColor: 'rgba(255, 255, 255, 0.53)',
    borderColor: '3DCE3F1',
    borderRadius: 50,
    elevation: 9,
    shadowColor: '#E0F2F1',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  getStartedText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 20,
    color: '#2F4156',
  },
  logo: {
    height: height * 0.17,
    width: height * 0.17,
    resizeMode: 'contain',
    position: 'absolute',
    top: height * 0.03, 
    right: width * 0.01, 
  },
});