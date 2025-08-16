
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // or any icon library
import DashboardScreen from './DashboardScreen';
import MonthlyStatsScreen from './MonthlyStatsScreen';
import ManageEmployeesScreen from './ManageEmployeeScreen';
import GeofenceScreen from './GeofenceScreen';
import AdminProfileScreen from './AdminProfileScreen';


const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = '';

          if (route.name === 'Dashboard') iconName = 'home';
          else if (route.name === 'Logbook') iconName = 'calendar';
          else if (route.name === 'Approvals') iconName = 'pencil';
          else if (route.name === 'Geofence') iconName = 'location';
          else if (route.name === 'Profile') iconName = 'person';

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Logbook" component={MonthlyStatsScreen} />
      <Tab.Screen name="Approvals" component={ManageEmployeesScreen} />
      <Tab.Screen name="Geofence" component={GeofenceScreen} />
       {/* <Tab.Screen
    name="Geofence"
    component={GeofenceScreen}
    options={{ unmountOnBlur: true }} // ✅ Fix is here
  /> */}

      <Tab.Screen name="Profile" component={AdminProfileScreen} />
    </Tab.Navigator>
  );
}