import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Getstarted: undefined;
  Login: undefined;
  Signup: undefined;
  Bottomnavbar: undefined;
  Adminnavigator: undefined;
};

type ConfirmationScreenProp = NativeStackNavigationProp<RootStackParamList, 'Getstarted'>;

const Confirmation = () => {
  const navigation = useNavigation<ConfirmationScreenProp>();

  const handleNavigateToGetStarted = () => {
    navigation.navigate('Getstarted');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={[styles.container, { paddingVertical: height * 0.08 }]}>
        <Image
          source={require('../assets/image_3-removebg-preview.png')}
          style={[
            styles.image,
            {
              height: height * 0.35,
              width: width * 0.8,
              marginTop: 5,
              resizeMode: 'contain',
            },
          ]}
        />
        <Text style={styles.heading}>Waiting for Approval</Text>
        <Text style={styles.subText}>
          Thank you for signing up! Your registration request has been received
          and is currently under review by the administrator.{"\n\n"}You’ll
          receive a confirmation email once your account has been approved.
          This may take a little while — we appreciate your patience.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleNavigateToGetStarted}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Confirmation;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  image: {
    marginBottom: 25,
  },
  heading: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
    fontSize: width * 0.055,
  },
  subText: {
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: width * 0.04,
    marginBottom: 30,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#008080',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: width * 0.04,
    textAlign: 'center',
  },
});
