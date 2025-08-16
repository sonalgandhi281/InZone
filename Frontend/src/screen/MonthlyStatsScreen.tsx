import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from './AdminStack';
import BASE_URL from '../../config/apiConfig';

const screenWidth = Dimensions.get('window').width;

const months = [
  { label: 'January', value: 'January' },
  { label: 'February', value: 'February' },
  { label: 'March', value: 'March' },
  { label: 'April', value: 'April' },
  { label: 'May', value: 'May' },
  { label: 'June', value: 'June' },
  { label: 'July', value: 'July' },
  { label: 'August', value: 'August' },
  { label: 'September', value: 'September' },
  { label: 'October', value: 'October' },
  { label: 'November', value: 'November' },
  { label: 'December', value: 'December' },
];

const years = [
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
];

const departments = [
  { label: 'All', value: 'All' },
  { label: 'HR', value: 'HR' },
  { label: 'IT', value: 'IT' },
  { label: 'Data Analytics', value: 'Data Analytics' },
  { label: 'Operations', value: 'Operations' },
];

interface Employee {
  employeeId: number;
  name: string;
  daysPresent: number;
  profilePic?: string;
}

type NavigationType = NativeStackNavigationProp<AdminStackParamList, 'RecordScreenWrapper'>;

const MonthlyStatsScreen = () => {
  const currentDate = new Date();
  const currentMonth = months[currentDate.getMonth()].value;
  const currentYear = currentDate.getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedDept, setSelectedDept] = useState('All');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationType>();

  useEffect(() => {
    fetchMonthlyStats();
  }, [selectedMonth, selectedYear, selectedDept]);

  const fetchMonthlyStats = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/monthly-stats`, {
        month: selectedMonth,
        year: selectedYear,
        department: selectedDept,
      });

      if (res.data.status === 'ok') {
        const { employeeStats, chart } = res.data.data;
        setEmployees(employeeStats);
        setChartData({
          labels: chart.labels,
          datasets: [{ data: chart.data }],
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Dropdowns */}
      <View style={styles.dropdownGroup}>
        <View style={styles.row}>
          <View style={styles.dropdownHalf}>
            <Text style={styles.dropdownLabel}>Month</Text>
            <Dropdown
              data={months}
              value={selectedMonth}
              labelField="label"
              valueField="value"
              style={styles.dropdownBox}
              placeholderStyle={styles.placeholderText}
              selectedTextStyle={styles.selectedText}
              itemTextStyle={styles.itemText}
              onChange={(item) => setSelectedMonth(item.value)}
            />
          </View>

          <View style={styles.dropdownHalf}>
            <Text style={styles.dropdownLabel}>Year</Text>
            <Dropdown
              data={years}
              value={selectedYear}
              labelField="label"
              valueField="value"
              style={styles.dropdownBox}
              placeholderStyle={styles.placeholderText}
              selectedTextStyle={styles.selectedText}
              itemTextStyle={styles.itemText}
              onChange={(item) => setSelectedYear(item.value)}
            />
          </View>
        </View>

        <View style={styles.fullWidthDropdown}>
          <Text style={styles.dropdownLabel}>Department</Text>
          <Dropdown
            data={departments}
            value={selectedDept}
            labelField="label"
            valueField="value"
            style={styles.dropdownBox}
            placeholderStyle={styles.placeholderText}
            selectedTextStyle={styles.selectedText}
            itemTextStyle={styles.itemText}
            onChange={(item) => setSelectedDept(item.value)}
          />
        </View>
      </View>

      {/* Chart */}
      <Text style={styles.sectionTitle}>Daily Attendance</Text>
      <Text style={styles.axisLabelY}>No. of Employees Present</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0D47A1" />
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={chartData}
              width={chartData.labels.length * 60 || screenWidth}
              height={280}
              fromZero
              yAxisLabel=""
              yAxisSuffix=""
              showValuesOnTopOfBars
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#f5f7fa',
                backgroundGradientTo: '#f5f7fa',
                decimalPlaces: 0,
                color: () => '#0D47A1',
                labelColor: () => '#0D47A1',
                propsForBackgroundLines: {
                  stroke: '#d0d0d0',
                },
              }}
              style={{
                borderRadius: 16,
                paddingRight: 10,
              }}
            />
          </ScrollView>

          <Text style={styles.axisLabelX}>Days</Text>

          {/* Employee List */}
          <Text style={styles.sectionTitle}>Employee Attendance</Text>
          <FlatList
            data={employees}
            keyExtractor={(item) => item.employeeId.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('RecordScreenWrapper', {
                    employeeId: item.employeeId,
                    month: selectedMonth,
                    year: selectedYear,
                  })
                }
              >
                <View style={styles.card}>
                  <Image
                    source={
                      item.profilePic
                        ? { uri: item.profilePic }
                        : require('../assets/placeholder.jpg')
                    }
                    style={styles.profilePic}
                  />
                  <View>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.daysPresent}>{item.daysPresent} days present</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </ScrollView>
  );
};

export default MonthlyStatsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    paddingBottom: 30,
  },
  dropdownGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dropdownHalf: {
    flex: 1,
    backgroundColor: '#e5f0fa',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  fullWidthDropdown: {
    marginTop: 10,
    backgroundColor: '#e5f0fa',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  dropdownLabel: {
    fontSize: 12,
    color: '#0D47A1',
    marginTop: 6,
    fontFamily: 'Montserrat-Medium',
  },
  dropdownBox: {
    height: 40,
    borderColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#e5f0fa',
  },
  placeholderText: {
    color: '#0D47A1',
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
  },
  selectedText: {
    color: '#0D47A1',
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
  },
  itemText: {
    fontFamily: 'Montserrat-Regular',
    color: '#0D47A1',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#0D47A1',
    fontFamily: 'Montserrat-Bold',
  },
  axisLabelX: {
    fontSize: 12,
    color: '#0D47A1',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginTop: 4,
  },
  axisLabelY: {
    fontSize: 12,
    color: '#0D47A1',
    fontFamily: 'Montserrat-Regular',
    marginBottom: 4,
    marginLeft: 6,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5f0fa',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
  },
  profilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D47A1',
    fontFamily: 'Montserrat-SemiBold',
  },
  daysPresent: {
    fontSize: 14,
    color: '#0D47A1',
    fontFamily: 'Montserrat-Regular',
  },
});
