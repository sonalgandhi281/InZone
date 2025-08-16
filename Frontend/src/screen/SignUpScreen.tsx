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
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { Dropdown } from 'react-native-element-dropdown';
import DropDownPicker from 'react-native-dropdown-picker';
import BASE_URL from '../../config/apiConfig';

const { width, height } = Dimensions.get('window');
const darkBlue = '#003366';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  Approval: undefined;
  Termsandcondn: undefined;
  Privacypolicy: undefined;
};

const SignUpScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [employeeId, setEmployeeId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [employeeVerify, setEmployeeVerify] = useState<boolean | null>(null);
  const [emailVerify, setEmailVerify] = useState<boolean | null>(null);
  const [contactVerify, setContactVerify] = useState<boolean | null>(null);
  const [firstNameVerify, setFirstNameVerify] = useState<boolean | null>(null);
  const [lastNameVerify, setLastNameVerify] = useState<boolean | null>(null);
  const [departmentVerify, setDepartmentVerify] = useState<boolean | null>(null);
  const [passwordVerify, setPasswordVerify] = useState<boolean | null>(null);
  const [confirmPasswordVerify, setConfirmPasswordVerify] = useState<boolean | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [post, setPost] = useState('');
const [postOpen, setPostOpen] = useState(false);
const [postItems, setPostItems] = useState([
  { label: 'App Coordinator', value: 'App Coordinator' },
  { label: 'Manager', value: 'Manager' },
  { label: 'Director', value: 'Director' },
  { label: 'Analyst', value: 'Analyst' },
  { label: 'Intern', value: 'Intern' },
]);

   function handleSubmit(){
    const userData ={
      employeeId : employeeId ,
      firstName,
      lastName,
      department ,
      post,
      email,
      contact,
      password ,
      confirmPassword,
    }
    if (employeeVerify && emailVerify && contactVerify && firstNameVerify && lastNameVerify && departmentVerify && passwordVerify && confirmPasswordVerify)
    {
      axios.post(`${BASE_URL}/register`,userData)
    .then (res => {
      console.log(res.data);
    if(res.data.status=='ok'){navigation.navigate('Approval');}
    else{
      Alert.alert("Registration Failed", JSON.stringify(res.data));
    }
    })
    .catch (e=>{console.log(e)});
    }
    else{
      Alert.alert("Validation Error", "Please fill all mandatory fields correctly.");
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
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,}$/;
    setPasswordVerify(regex.test(text));
    setConfirmPasswordVerify(text === confirmPassword);
  };

  const handleConfirmPassword = (text: string) => {
    setConfirmPassword(text);
    setConfirmPasswordVerify(text === password);
  };

  const handleContact = (text: string) => {
    setContact(text);
    const isValid = /^\d{10}$/.test(text);
    setContactVerify(isValid);
  };

  const handleFirstName = (text: string) => {
    setFirstName(text);
    const isValid = /^[A-Za-z]+$/.test(text);
    setFirstNameVerify(text.trim().length > 0 && isValid);
  };

  const handleLastName = (text: string) => {
    setLastName(text);
    const isValid = /^[A-Za-z]+$/.test(text);
    setLastNameVerify(text.trim().length > 0 && isValid);
  };

  const handleDepartment = (text: string) => {
    setDepartment(text);
    setDepartmentVerify(text.trim().length > 0);
  };

  const handleSignUp = () => {
    if (!employeeVerify || !emailVerify || !passwordVerify || !confirmPasswordVerify || !firstNameVerify || !lastNameVerify || !departmentVerify || !contactVerify) return;
    navigation.navigate('Approval');
  };

  const renderInput = (label: string, value: string, onChangeText: (text: string) => void, isValid: boolean | null, secure?: boolean, toggleSecure?: () => void) => (
    <View style={{ width: '100%' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          placeholder={label}
          value={value}
          onChangeText={onChangeText}
          style={[styles.input, isValid === false ? styles.invalidBorder : isValid === true ? styles.validBorder : {}]}
          placeholderTextColor={'#333'}
          secureTextEntry={secure && !showPassword}
        />
        {secure !== undefined && (
          <TouchableOpacity onPress={toggleSecure} style={{ position: 'absolute', right: 10 }}>
            <Icon name={secure && !showPassword ? 'visibility-off' : 'visibility'} size={20} color="#333" />
          </TouchableOpacity>
        )}
        {isValid === true && (
          <Icon name="check-circle" size={20} color="green" style={{ position: 'absolute', right: secure ? 35 : 10 }} />
        )}
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require('../assets/login2.jpg')}
      style={styles.background}
      resizeMode="cover">
      <View style={styles.overlayContainer}>
       <ScrollView
  contentContainerStyle={styles.scrollContainer}
  keyboardShouldPersistTaps="handled"
  nestedScrollEnabled={true}
>

          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subtitle}>Create a new account</Text>

          {renderInput('Employee ID', employeeId, handleEmployeeId, employeeVerify)}
          {renderInput('First Name', firstName, handleFirstName, firstNameVerify)}
          {renderInput('Last Name', lastName, handleLastName, lastNameVerify)}
          <View style={{ width: '100%', marginBottom: 12 }}>
  <Text style={{ marginBottom: 5, fontSize: 16, color: '#000' }}>Department</Text>
  <Dropdown
    style={[
      styles.input,
      departmentVerify === false ? styles.invalidBorder : departmentVerify === true ? styles.validBorder : {},
    ]}
    placeholderStyle={{ color: '#333' }}
    selectedTextStyle={{ color: '#000', fontSize: 16 }}
    data={[
      { label: 'IT', value: 'IT' },
      { label: 'HR', value: 'HR' },
      { label: 'Data Analytics', value: 'Data Analytics' },
      { label: 'Operations', value: 'Operations' },
    ]}
    maxHeight={200}
    labelField="label"
    valueField="value"
    placeholder="Select Department"
    value={department}
    onChange={(item) => {
      setDepartment(item.value);
      setDepartmentVerify(true);
    }}
  />
</View>
<View style={{ width: '100%', marginBottom: 12 }}>
  <Text style={{ marginBottom: 5, fontSize: 16, color: '#000' }}>Post</Text>
  <Dropdown
    style={[
      styles.input,
      post ? styles.validBorder : {},
    ]}
    placeholderStyle={{ color: '#333' }}
    selectedTextStyle={{ color: '#000', fontSize: 16 }}
    data={[
      { label: 'App Coordinator', value: 'App Coordinator' },
      { label: 'Manager', value: 'Manager' },
      { label: 'Director', value: 'Director' },
      { label: 'Analyst', value: 'Analyst' },
      { label: 'Intern', value: 'Intern' },
    ]}
    maxHeight={200}
    labelField="label"
    valueField="value"
    placeholder="Select Post"
    value={post}
    onChange={(item) => {
      setPost(item.value);
    }}
  />
</View>



      <View style={[styles.inputWrapper, styles.radioGroup]}>
  <Text style={styles.radioLabel}>Select Role</Text>

  <View style={styles.radioRowHorizontal}>
    <TouchableOpacity
      style={styles.radioRowItem}
      onPress={() => setRole('user')}>
      <View style={[styles.radioCircle, role === 'user' && styles.radioSelected]} />
      <Text style={styles.radioText}>User</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.radioRowItem}
      onPress={() => setRole('admin')}>
      <View style={[styles.radioCircle, role === 'admin' && styles.radioSelected]} />
      <Text style={styles.radioText}>Admin</Text>
    </TouchableOpacity>
  </View>
</View>
          {renderInput('Email / Username', email, handleEmail, emailVerify)}
          {renderInput('Contact Number', contact, handleContact, contactVerify)}
          {renderInput('Password', password, handlePassword, passwordVerify, true, () => setShowPassword(!showPassword))}
          {renderInput('Confirm Password', confirmPassword, handleConfirmPassword, confirmPasswordVerify, true, () => setShowConfirmPassword(!showConfirmPassword))}

          <View style={styles.agreementContainer}>
            <Text style={styles.agreementText}>By signing in, you agree to our </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Termsandcondn')}>
              <Text style={styles.agreementLink}>Terms & Conditions </Text>
            </TouchableOpacity>
            <Text style={styles.agreementText}>and </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Privacypolicy')}>
              <Text style={styles.agreementLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.button}>
            <Text style={styles.buttonText}>Signup</Text>
          </TouchableOpacity>

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkAction}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  inputWrapper: {
  width: '100%',
  backgroundColor: 'rgba(255,255,255,0.4)',
  paddingHorizontal: 12,
  paddingVertical: 10,
  borderRadius: 10,
  marginVertical: 10,
  borderWidth: 1,
  borderColor: 'rgba(0, 0, 0, 0.3)',
},
  radioGroup: {
  backgroundColor: 'rgba(255,255,255,0.4)',
  borderRadius: 10,
  borderWidth: 1,
  borderColor: 'rgba(0,0,0,0.14)',
  padding: 12,
  marginVertical: 10,
},

radioLabel: {
  fontSize: 16,
  fontWeight: '400',
  color: '#000000d3',
  marginBottom: 8,
},

radioRowHorizontal: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},

radioRowItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginRight: 20,
},

radioCircle: {
  height: 20,
  width: 20,
  borderRadius: 10,
  borderWidth: 2,
  borderColor: '#003366',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 8,
},

radioSelected: {
  backgroundColor: '#053f7ab7',
},

radioText: {
  fontSize: 15,
  color: '#000',
},
  roleContainer: {
  width: '100%',
  marginVertical: 12,
},
roleLabel: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#003366',
  // color:'#000000',
  marginBottom: 6,
},
roleOptions: {
  flexDirection: 'row',
  justifyContent: 'flex-start',
},
radioOption: {
  flexDirection: 'row',
  alignItems: 'center',
  marginRight: 20,
},

  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    margin: 20,
    marginTop: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.14)',
  },
  scrollContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 40,
    fontWeight: 'bold',
    color: darkBlue,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 10,
    color: '#222',
  },
  // input: {
  //   width: '100%',
  //   backgroundColor: 'rgba(255,255,255,0.4)',
  //   padding: 12,
  //   borderRadius: 10,
  //   marginVertical: 10,
  //   fontSize: 16,
  //   borderColor: 'rgba(0, 0, 0, 0.14)',
  //   borderWidth: 1,
  // },
 input: {
  width: '100%',
  backgroundColor: 'rgba(255,255,255,0.4)',
  padding: 12,
  borderRadius: 10,
  marginVertical: 10,
  fontSize: 16,
  borderColor: 'rgba(0, 0, 0, 0.14)',
  borderWidth: 1,
  minHeight: 50,
},
  validBorder: {
    borderColor: 'green',
  },
  invalidBorder: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    alignSelf: 'flex-start',
    marginTop: -5,
    marginBottom: 8,
    marginLeft: 4,
  },
  agreementContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  agreementText: {
    color: '#000',
    fontSize: 14,
  },
  agreementLink: {
    color: darkBlue,
    fontWeight: 'bold',
    fontSize: 14,
  },
  button: {
    backgroundColor: darkBlue,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  linkText: {
    color: '#000',
  },
  linkAction: {
    color: darkBlue,
    fontWeight: 'bold',
  },
});