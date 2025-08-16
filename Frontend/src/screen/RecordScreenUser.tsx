import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';
import BASE_URL from '../../config/apiConfig';

const { width, height } = Dimensions.get('window');

const months = [
  { label: 'January', value: '01' }, { label: 'February', value: '02' },
  { label: 'March', value: '03' }, { label: 'April', value: '04' },
  { label: 'May', value: '05' }, { label: 'June', value: '06' },
  { label: 'July', value: '07' }, { label: 'August', value: '08' },
  { label: 'September', value: '09' }, { label: 'October', value: '10' },
  { label: 'November', value: '11' }, { label: 'December', value: '12' },
];

const years = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { label: year.toString(), value: year.toString() };
});

type RecordScreenProps = {
  employeeId?: number;
  fromAdmin?: boolean;
};

const RecordScreenUser: React.FC<RecordScreenProps> = ({ employeeId: propEmployeeId, fromAdmin }) => {
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const currentYear = new Date().getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const workingDays = presentCount;
  const leaves = absentCount;
  const totalDays = workingDays + leaves;
  const percentage = totalDays === 0 ? 0 : (workingDays / totalDays) * 100;

  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        let empId = propEmployeeId;

        if (!fromAdmin) {
          const resUser = await axios.post(`${BASE_URL}/userdata`, { token });
          empId = resUser.data.data.employeeId;
        }

        const [presentRes, absentRes] = await Promise.all([
          axios.post(`${BASE_URL}/get-attendance-by-status`, {
            employeeId: empId,
            status: "Present",
            month: selectedMonth,
            year: selectedYear,
          }),
          axios.post(`${BASE_URL}/get-attendance-by-status`, {
            employeeId: empId,
            status: "Absent",
            month: selectedMonth,
            year: selectedYear,
          }),
        ]);

        setPresentCount(presentRes.data.data.length);
        setAbsentCount(absentRes.data.data.length);
      } catch (error) {
        console.error("❌ Error fetching attendance summary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceSummary();
  }, [propEmployeeId, selectedMonth, selectedYear]);

  const fetchAttendanceDates = async (status: 'Present' | 'Absent') => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      let empId = propEmployeeId;

      if (!fromAdmin) {
        const resUser = await axios.post(`${BASE_URL}/userdata`, { token });
        empId = resUser.data.data.employeeId;
      }

      const res = await axios.post(`${BASE_URL}/get-attendance-by-status`, {
        employeeId: empId,
        status,
        month: selectedMonth,
        year: selectedYear,
      });

      setModalTitle(status === "Present" ? "Present Days" : "Absent Days");
      setModalData(res.data.data);
      setModalVisible(true);
    } catch (error) {
      console.error("❌ Error fetching attendance records:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dropdownWrapper}>
        <Dropdown
          style={styles.dropdown}
          data={months}
          labelField="label"
          valueField="value"
          placeholder="Select Month"
          value={selectedMonth}
          onChange={(item) => setSelectedMonth(item.value)}
        />
        <Dropdown
          style={styles.dropdown}
          data={years}
          labelField="label"
          valueField="value"
          placeholder="Select Year"
          value={selectedYear}
          onChange={(item) => setSelectedYear(item.value)}
        />
      </View>

      <View style={styles.centerWrapper}>
        {/* Top Section */}
        <View style={styles.topSection}>
          <TouchableOpacity style={styles.valueColumn} onPress={() => fetchAttendanceDates("Present")}>
            <Text style={styles.label}>WORKING DAYS</Text>
            <Text style={styles.value}>{workingDays}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.valueColumn} onPress={() => fetchAttendanceDates("Absent")}>
            <Text style={styles.label}>LEAVES</Text>
            <Text style={styles.value}>{leaves}</Text>
          </TouchableOpacity>
        </View>

        {/* Circular Progress Chart */}
        {!isLoading && (
          <View style={styles.chartSection}>
            <AnimatedCircularProgress
              size={width * 0.55}
              width={width * 0.035}
              fill={percentage}
              tintColor="#6EC6FF"
              backgroundColor="#E0F7FA"
              lineCap="round"
              rotation={0}
            >
              {() => (
                <View style={styles.centerText}>
                  <Text style={styles.totalDays}>{totalDays}</Text>
                  <Text style={styles.totalLabel}>TOTAL DAYS</Text>
                </View>
              )}
            </AnimatedCircularProgress>
          </View>
        )}

        {/* Bottom: Legend */}
        <View style={styles.legendSection}>
          <View style={styles.legendItem}>
            <View style={[styles.square, { backgroundColor: '#6EC6FF' }]} />
            <Text style={styles.legendLabel}>WORKING DAYS</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.square, { backgroundColor: '#E0F7FA' }]} />
            <Text style={styles.legendLabel}>LEAVES</Text>
          </View>
        </View>
      </View>

      {/* Attendance Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <FlatList
              data={modalData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.attendanceItem}>
                  <Text style={styles.dateText}>📅 {item.date}</Text>
                  <Text style={styles.timeText}>
                    ⏱️ Check-in: {item.checkInTime || "--"} | Check-out: {item.checkOutTime || "--"}
                  </Text>
                </View>
              )}
            />
            <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default RecordScreenUser;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dropdownWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    zIndex: 10,
  },
  dropdown: {
    width: '48%',
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: height * 0.035,
  },
  valueColumn: {
    alignItems: 'center',
  },
  label: {
    color: '#666',
    fontSize: width * 0.03,
  },
  value: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#333',
  },
  chartSection: {
    marginTop: height * 0.1,
    marginBottom: height * 0.15,
    alignItems: 'center',
  },
  centerText: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalDays: {
    fontSize: width * 0.09,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  totalLabel: {
    fontSize: width * 0.035,
    color: '#777',
  },
  legendSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  square: {
    width: width * 0.035,
    height: width * 0.035,
    marginRight: width * 0.02,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: width * 0.037,
    color: '#444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '80%',
    maxHeight: '70%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  attendanceItem: {
    paddingVertical: 8,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  closeBtn: {
    marginTop: 20,
    backgroundColor: '#6EC6FF',
    padding: 10,
    borderRadius: 6,
    alignSelf: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});