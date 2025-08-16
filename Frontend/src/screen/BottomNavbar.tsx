import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import CheckInOut from './CheckInOut';
import ProfileScreen from './ProfileScreen';
import RecordNavigator from './RecordNavigator';

const Tab = createBottomTabNavigator();
const darkBlue = '#003366'; 

const BottomNavbar = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Record') iconName = 'calendar-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';

          return <Icon name={iconName!} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#ccc',
        tabBarStyle: {
          backgroundColor:'#235284',
          borderTopWidth: 0,
          justifyContent :'center',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={CheckInOut} />
      <Tab.Screen name="Record" component={RecordNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomNavbar;