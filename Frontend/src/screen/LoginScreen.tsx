import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../config/apiConfig';

const { width, height } = Dimensions.get('window');
const darkBlue = '#003366';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  Forgotpassword: undefined;
  Checkinout: undefined;
  Bottomnavbar: undefined;
  Adminnavigator: undefined;
};

const LoginScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [employeeVerify, setEmployeeVerify] = useState<boolean | null>(null);
  const [emailVerify, setEmailVerify] = useState<boolean | null>(null);
  const [passwordVerify, setPasswordVerify] = useState<boolean | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit() {
  if (!employeeVerify) {
    Alert.alert('Validation', 'Please enter a valid Employee ID');
    return;
  }
  if (!emailVerify) {
    Alert.alert('Validation', 'Please enter a valid email');
    return;
  }
  if (!passwordVerify) {
    Alert.alert(
      'Validation',
      'Password must contain:\n• At least 1 uppercase\n• 1 lowercase\n• 1 number\n• 1 special character'
    );
    return;
  }

  const userData = {
    employeeId,
    email,
    password,
    role: 'user', // 👈 added role explicitly
  };

   try {
    const res = await axios.post(`${BASE_URL}/login-user`, userData);

    if (res.data.status === 'ok') {
      await AsyncStorage.setItem('token', res.data.data);
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('role', 'user');
      navigation.replace('Bottomnavbar');
    } else {
      Alert.alert('Login Failed', res.data.data || 'Unknown error');
    }
  } catch (err: any) {
    console.log('❌ Axios Error:', err.message);
    Alert.alert('Error', 'Could not reach the server');
  }
}
async function handleAdminLogin() {
  if (!employeeVerify) {
    Alert.alert('Validation', 'Please enter a valid Employee ID');
    return;
  }
  if (!emailVerify) {
    Alert.alert('Validation', 'Please enter a valid email');
    return;
  }
  if (!passwordVerify) {
    Alert.alert(
      'Validation',
      'Password must contain:\n• At least 1 uppercase\n• 1 lowercase\n• 1 number\n• 1 special character'
    );
    return;
  }

  const adminData = {
    employeeId,
    email,
    password,
    role: 'admin',
  };

  try {
    const res = await axios.post(`${BASE_URL}/login-user`, adminData);

    if (res.data.status === 'ok') {
      await AsyncStorage.setItem('token', res.data.data);
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('role', 'admin');
      navigation.replace('Adminnavigator');
    } else {
      Alert.alert('Admin Login Failed', res.data.data || 'Unknown error');
    }
  } catch (err: any) {
    console.log('❌ Admin Axios Error:', err.message);
    Alert.alert('Error', 'Could not reach the server');
  }
}


  const handleEmployeeId = (text: string) => {
    setEmployeeId(text);
    const isValid = /^[0-9]+$/.test(text);
    setEmployeeVerify(text.length > 0 && isValid);
  };

  const handleEmail = (text: string) => {
    setEmail(text);
    const regex = /^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/;
    setEmailVerify(regex.test(text));
  };

  const handlePassword = (text: string) => {
    setPassword(text);
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,}$/;
    setPasswordVerify(regex.test(text));
  };

  const handleLogin = () => {
    if (!employeeVerify) {
      Alert.alert('Validation', 'Please enter a valid Employee ID');
      return;
    }
    if (!emailVerify) {
      Alert.alert('Validation', 'Please enter a valid email');
      return;
    }
    if (!passwordVerify) {
      Alert.alert(
        'Validation',
        'Password must contain:\n• At least 1 uppercase\n• 1 lowercase\n• 1 number\n• 1 special character',
      );
      return;
    }
    navigation.navigate('Bottomnavbar');
  };

  return (
    <ImageBackground
      source={require('../assets/login2.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlayContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Login</Text>

          <Text style={styles.subtitle}>Welcome Back</Text>
          <Text style={styles.subtext}>Login to your account</Text>

          {/* Employee ID */}
          <View
            style={[
              styles.inputWrapper,
              employeeVerify === false &&
                employeeId !== '' &&
                styles.invalidBorder,
              employeeVerify === true && styles.validBorder,
            ]}
          >
            <TextInput
              placeholder="Employee ID"
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor={'#333'}
              value={employeeId}
              onChangeText={handleEmployeeId}
            />
            {employeeId !== '' && (
              <Icon
                name={employeeVerify ? 'check-circle' : 'cancel'}
                size={20}
                color={employeeVerify ? 'green' : 'red'}
              />
            )}
          </View>
          {employeeVerify === false && (
            <Text style={styles.errorText}>
              Enter a valid numeric Employee ID
            </Text>
          )}

          {/* Email */}
          <View
            style={[
              styles.inputWrapper,
              emailVerify === false && email !== '' && styles.invalidBorder,
              emailVerify === true && styles.validBorder,
            ]}
          >
            <TextInput
              placeholder="Email / Username"
              keyboardType="email-address"
              style={styles.input}
              placeholderTextColor={'#333'}
              value={email}
              onChangeText={handleEmail}
              autoCapitalize="none"
            />
            {email !== '' && (
              <Icon
                name={emailVerify ? 'check-circle' : 'cancel'}
                size={20}
                color={emailVerify ? 'green' : 'red'}
              />
            )}
          </View>
          {emailVerify === false && (
            <Text style={styles.errorText}>Enter a valid email address</Text>
          )}

          {/* Password */}
          <View
            style={[
              styles.inputWrapper,
              passwordVerify === false &&
                password !== '' &&
                styles.invalidBorder,
              passwordVerify === true && styles.validBorder,
            ]}
          >
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              style={styles.input}
              placeholderTextColor={'#333'}
              value={password}
              onChangeText={handlePassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {passwordVerify === false && (
            <Text style={styles.errorText}>
              Must include 1 uppercase, 1 lowercase, 1 number, 1 special
              character
            </Text>
          )}

          <TouchableOpacity
            onPress={() => navigation.navigate('Forgotpassword')}
            style={styles.forgotContainer}
          >
            <Text style={styles.forgotText}>Forgot Password ?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSubmit} style={styles.button}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            onPress={handleAdminLogin}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Login as Admin</Text>
          </TouchableOpacity>

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.linkAction}>Signup</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    marginHorizontal: width * 0.05,
    marginTop: height * 0.08,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: width * 0.06,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.14)',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: height * 0.05,
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: width * 0.12,
    fontWeight: 'bold',
    color: darkBlue,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: width * 0.06,
    fontWeight: '600',
    marginTop: height * 0.01,
    color: '#222',
  },
  subtext: {
    fontSize: width * 0.035,
    color: '#666',
    marginBottom: height * 0.025,
  },
  inputWrapper: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: width * 0.035,
    paddingVertical: height * 0.015,
    borderRadius: 10,
    marginVertical: height * 0.015,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    fontSize: width * 0.04,
    color: '#000',
  },
  validBorder: {
    borderColor: 'green',
  },
  invalidBorder: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: width * 0.03,
    alignSelf: 'flex-start',
    marginBottom: -10,
    marginTop: -10,
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: height * 0.025,
  },
  forgotText: {
    color: darkBlue,
    fontWeight: '500',
    fontSize: width * 0.035,
  },
  button: {
    backgroundColor: darkBlue,
    paddingVertical: height * 0.015,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginVertical: height * 0.015,
  },
  buttonText: {
    color: 'white',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: height * 0.015,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  dividerText: {
    marginHorizontal: width * 0.025,
    color: '#666',
    fontSize: width * 0.035,
  },
  linkContainer: {
    flexDirection: 'row',
    marginTop: height * 0.015,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  linkText: {
    color: '#444',
    fontSize: width * 0.035,
  },
  linkAction: {
    color: darkBlue,
    fontWeight: 'bold',
    fontSize: width * 0.035,
  },
});