import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminNavigator from './AdminNavigator';
import RecordScreenWrapper from './RecordScreenWrapper';

export type AdminStackParamList = {
  AdminTabs: undefined;
  RecordScreenWrapper: {
    employeeId: number;
    month: string;
    year: string;
  };
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminNavigator} />
      <Stack.Screen name="RecordScreenWrapper" component={RecordScreenWrapper} />
    </Stack.Navigator>
  );
}