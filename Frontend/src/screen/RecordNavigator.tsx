import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RecordLoadingScreen from './RecordLoadingScreen';
import RecordScreenUser from './RecordScreenUser';

const Stack = createNativeStackNavigator();

const RecordNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RecordLoading" component={RecordLoadingScreen} />
      <Stack.Screen name="RecordMain" component={RecordScreenUser} />
    </Stack.Navigator>
  );
};

export default RecordNavigator;