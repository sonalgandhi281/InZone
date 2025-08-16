import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { PieChart } from 'react-native-chart-kit';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import BASE_URL from '../../config/apiConfig';


const screenWidth = Dimensions.get('window').width;

type AttendanceRecord = {
  _id: string;
  employeeId: string;
  checkInTime: string;
  checkOutTime?: string;
  totalHours?: string;
  status: 'Present' | 'Absent';
  name: string;
  profilePic?: string;
};

const DashboardScreen = () => {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [showPresentList, setShowPresentList] = useState(false);
  const [showAbsentList, setShowAbsentList] = useState(false);
  const [presentEmployees, setPresentEmployees] = useState<AttendanceRecord[]>([]);
  const [absentEmployees, setAbsentEmployees] = useState<AttendanceRecord[]>([]);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const [editRecordId, setEditRecordId] = useState<string | null>(null);

const [editModalVisible, setEditModalVisible] = useState(false);
const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
const [editedCheckIn, setEditedCheckIn] = useState('');
const [editedCheckOut, setEditedCheckOut] = useState('');
const [showCheckInPicker, setShowCheckInPicker] = useState(false);
const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);



  const toggleCalendar = () => {
    const toValue = calendarExpanded ? 60 : 350;
    Animated.timing(animatedHeight, {
      toValue,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(() => setCalendarExpanded(!calendarExpanded));
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/get-attendance-for-date`, {
        date: selectedDate,
      });

      if (response.data.status === 'ok') {
        const records: AttendanceRecord[] = response.data.data;
        const present = records.filter((rec) => rec.status === 'Present');
        const absent = records.filter((rec) => rec.status === 'Absent');

        setPresentEmployees(present);
        setAbsentEmployees(absent);
      } else {
        console.warn('❌ Backend error:', response.data.data);
      }
    } catch (error: any) {
      console.error('❌ Axios error:', error.message);
    }
  };

  const total = presentEmployees.length + absentEmployees.length;

  const pieData = [
    {
      name: 'Present',
      population: presentEmployees.length,
      color: '#7098c5',
      legendFontColor: '#0D47A1',
      legendFontSize: 14,
    },
    {
      name: 'Absent',
      population: absentEmployees.length,
      color: '#e5e0d9',
      legendFontColor: '#0D47A1',
      legendFontSize: 14,
    },
  ];

  function getToday(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.calendarToggle}>
        <Text style={styles.dateText}>📅 {formatDate(selectedDate)}</Text>
        <TouchableOpacity onPress={toggleCalendar}>
          <Ionicons
            name={calendarExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#0D47A1"
          />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ height: animatedHeight, overflow: 'hidden' }}>
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: '#7098c5' },
          }}
          hideExtraDays={false}
          firstDay={1}
          enableSwipeMonths={true}
          style={styles.calendar}
          theme={{
            arrowColor: '#7098c5',
            monthTextColor: '#0D47A1',
            textMonthFontWeight: 'bold',
            textSectionTitleColor: '#0D47A1',
            todayTextColor: '#1976D2',
            selectedDayBackgroundColor: '#1976D2',
            selectedDayTextColor: '#fff',
            dayTextColor: '#0D47A1',
          }}
        />
      </Animated.View>

      <View style={styles.centerContent}>
        <Text style={styles.title}>Today's Stats</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={180}
          chartConfig={{
            color: () => '#0D47A1',
            labelColor: () => '#0D47A1',
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[0, 0]}
          absolute
        />
        <Text style={styles.totalEmployees}>Total {total} Employees</Text>
      </View>

      <TouchableOpacity
        onPress={() => setShowPresentList(!showPresentList)}
        style={[styles.card, { borderColor: '#000', borderWidth: 1 }]}
      >
        <View style={styles.labelRow}>
          <View style={[styles.colorDot, { backgroundColor: '#7098c5' }]} />
          <Text style={[styles.labelText, { color: '#0D47A1' }]}>Present</Text>
        </View>
        <Text style={[styles.countText, { color: '#0D47A1' }]}>{presentEmployees.length}</Text>
      </TouchableOpacity>

      {showPresentList && (
        <View style={styles.listContainer}>
          {presentEmployees.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#0D47A1' }}>
              No one is present today
            </Text>
          ) : (
            <FlatList
              data={presentEmployees}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.employeeCard}>
                  <Image
                    source={
                      item.profilePic
                        ? { uri: item.profilePic }
                        : require('../assets/placeholder.jpg')
                    }
                    style={styles.avatar}
                  />
                  <View style={styles.employeeInfo}>
                    {/* <Text style={styles.employeeName}>{item.name}</Text> */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
  <Text style={styles.employeeName}>{item.name}</Text>
  <TouchableOpacity
    onPress={() => {
      setSelectedEmployee(item);
      setEditedCheckIn(item.checkInTime ?? '');
      setEditedCheckOut(item.checkOutTime ?? '');
      setEditModalVisible(true);
    }}
  >
    <Ionicons name="create-outline" size={18} color="#0D47A1" />
  </TouchableOpacity>
</View>


                    <Text style={styles.employeeTime}>
                      {item.checkInTime} - {item.checkOutTime || 'N/A'}
                    </Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}

      <TouchableOpacity
        onPress={() => setShowAbsentList(!showAbsentList)}
        style={[styles.card, { borderColor: '#000', borderWidth: 1 }]}
      >
        <View style={styles.labelRow}>
          <View style={[styles.colorDot, { backgroundColor: '#e5e0d9' }]} />
          <Text style={[styles.labelText, { color: '#0D47A1' }]}>Absent</Text>
        </View>
        <Text style={[styles.countText, { color: '#0D47A1' }]}>{absentEmployees.length}</Text>
      </TouchableOpacity>

      {showAbsentList && (
        <View style={styles.listContainer}>
          {absentEmployees.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#0D47A1' }}>
              No one is absent today
            </Text>
          ) : (
            <FlatList
              data={absentEmployees}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.employeeCard}>
                  <Image
                    source={
                      item.profilePic
                        ? { uri: item.profilePic }
                        : require('../assets/placeholder.jpg')
                    }
                    style={styles.avatar}
                  />
                  <View style={styles.employeeInfo}>
                    {/* <Text style={styles.employeeName}>{item.name}</Text> */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
  <Text style={styles.employeeName}>{item.name}</Text>
  <TouchableOpacity
    onPress={() => {
      setSelectedEmployee(item);
      setEditedCheckIn(item.checkInTime ?? '');
      setEditedCheckOut(item.checkOutTime ?? '');
      setEditModalVisible(true);
    }}
  >
    <Ionicons name="create-outline" size={18} color="#0D47A1" />
  </TouchableOpacity>
</View>


                    <Text style={styles.employeeTime}>Absent</Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}
      <Modal visible={editModalVisible} transparent animationType="slide">
  <View style={{
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'
  }}>
    <View style={{
      backgroundColor: '#fff', borderRadius: 10, padding: 20, width: '85%'
    }}>
      <Text style={{ fontSize: 16, fontFamily: 'Montserrat-Bold', marginBottom: 10 }}>
        Edit Attendance
      </Text>
      <Text style={{ fontFamily: 'Montserrat-SemiBold' }}>Check-in Time:</Text>
<TouchableOpacity
  onPress={() => setShowCheckInPicker(true)}
  style={{
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  }}
>
  <Text>{editedCheckIn || 'Select Time'}</Text>
</TouchableOpacity>

<Text style={{ fontFamily: 'Montserrat-SemiBold' }}>Check-out Time:</Text>
<TouchableOpacity
  onPress={() => setShowCheckOutPicker(true)}
  style={{
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  }}
>
  <Text>{editedCheckOut || 'Select Time'}</Text>
</TouchableOpacity>

      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity
          onPress={() => setEditModalVisible(false)}
          style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5 }}
        >
          <Text style={{ fontFamily: 'Montserrat-SemiBold' }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            try {
              const response = await fetch(`${BASE_URL}/update-attendance-time`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  employeeId: selectedEmployee.employeeId,
                  date: selectedDate,
                  checkInTime: editedCheckIn,
                  checkOutTime: editedCheckOut,
                }),
              });

              const result = await response.json();
              if (result.message) {
                Alert.alert('Success', 'Attendance updated successfully.');
                // Update local state:
                const updateList = (list: any[]) =>
                  list.map(emp => emp.employeeId === selectedEmployee.employeeId
                    ? { ...emp, checkInTime: editedCheckIn, checkOutTime: editedCheckOut }
                    : emp);

                setPresentEmployees(prev => updateList(prev));
                setAbsentEmployees(prev => updateList(prev));
              }

              setEditModalVisible(false);
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to update attendance.');
            }
          }}
          style={{ padding: 10, backgroundColor: '#0D47A1', borderRadius: 5 }}
        >
          <Text style={{ color: '#fff', fontFamily: 'Montserrat-SemiBold' }}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
{showCheckInPicker && (
  <DateTimePicker
    value={new Date()}
    mode="time"
    is24Hour={false}
    display="default"
    onChange={(event, selectedDate) => {
      setShowCheckInPicker(false);
      if (selectedDate) {
        const hours = selectedDate.getHours();
        const minutes = selectedDate.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formatted = `${String(((hours + 11) % 12 + 1)).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00 ${ampm}`;
        setEditedCheckIn(formatted);
      }
    }}
  />
)}

{showCheckOutPicker && (
  <DateTimePicker
    value={new Date()}
    mode="time"
    is24Hour={false}
    display="default"
    onChange={(event, selectedDate) => {
      setShowCheckOutPicker(false);
      if (selectedDate) {
        const hours = selectedDate.getHours();
        const minutes = selectedDate.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formatted = `${String(((hours + 11) % 12 + 1)).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00 ${ampm}`;
        setEditedCheckOut(formatted);
      }
    }}
  />
)}

    </ScrollView>
  );
};


export default DashboardScreen;

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  employeeInfo: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    paddingBottom: 6,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D47A1',
  },
  employeeTime: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  calendarToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '500',
    color: '#0D47A1',
  },
  calendar: {
    marginBottom: 10,
  },
  centerContent: {
    alignItems: 'center',
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#0D47A1',
  },
  totalEmployees: {
    marginTop: 5,
    fontSize: 14,
    color: '#0D47A1',
  },
  card: {
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  labelText: {
    fontSize: 16,
  },
  countText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    marginHorizontal: 20,
    marginTop: 5,
  },
});