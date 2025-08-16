import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import RecordScreen from './RecordScreen'; 

type RootStackParamList = {
  RecordScreenWrapper: {
    employeeId: number;
    month: string;
    year: string;
  };
};

type RecordRouteProp = RouteProp<RootStackParamList, 'RecordScreenWrapper'>;

const RecordScreenWrapper = () => {
  const route = useRoute<RecordRouteProp>();
  const { employeeId, month, year } = route.params;
  
  return (
    <RecordScreen
      employeeId={employeeId}
      month={month}
      year={year}
      fromAdmin={true}
    />
  );
};

export default RecordScreenWrapper;