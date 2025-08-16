import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BASE_URL from '../../config/apiConfig';



type Employee = {
  _id?: string;
  employeeId: string;
  name: string;
  department: string;
  post: string;
  email: string;
  image?: any;
  profilePic?: string;
};



const BACKEND_URL = BASE_URL;

const ManageEmployeeScreen = () => {
  const [selectedRequest, setSelectedRequest] = useState<Employee | null>(null);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showExisting, setShowExisting] = useState(false);
  const [deptFilter, setDeptFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  const [existingProfiles, setExistingProfiles] = useState<Employee[]>([]);
  const [signupRequests, setSignupRequests] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentOptions, setDepartmentOptions] = useState([{ label: 'All', value: 'All' }]);
  const [roleOptions, setRoleOptions] = useState([{ label: 'All', value: 'All' }]);
  const [searchQuery, setSearchQuery] = useState('');



  useEffect(() => {
    fetchData();
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/departments-posts`);
      const departments = res.data.departments || [];
      const roles = res.data.posts || [];

      setDepartmentOptions([{ label: 'All', value: 'All' }, ...departments.map((d: string) => ({ label: d, value: d }))]);
      setRoleOptions([{ label: 'All', value: 'All' }, ...roles.map((r: string) => ({ label: r, value: r }))]);
    } catch (err) {
      console.error('Failed to fetch department/role options', err);
      Alert.alert('Error', 'Could not load dropdown options');
    }
  };
  const fetchData = async () => {
    try {
      setLoading(true);

      const [pendingRes, approvedRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/pending-requests`),
        axios.get(`${BACKEND_URL}/approved-users`),
      ]);

      const formattedPending = pendingRes.data.data.map((user: any) => ({
        employeeId: user.employeeId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        department: user.department,
        post: user.post, // updated
        profilePic: user.profilePic,
      }));

      const formattedApproved = approvedRes.data.data.map((user: any) => ({
        employeeId: user.employeeId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        department: user.department,
        post: user.post, // updated
        profilePic: user.profilePic,
      }));


      setSignupRequests(formattedPending);
      setExistingProfiles(formattedApproved);
    } catch (err) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (employeeId: string, action: 'approve' | 'decline') => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert('Error', 'Token not found');

      const decoded: any = jwtDecode(token);
      const adminId = decoded.employeeId;

      const res = await axios.post(`${BACKEND_URL}/handle-request`, {
        employeeId,
        action,
        adminId,
      });

      if (res.data.status === 'ok') {
        Alert.alert('Success', `User ${action}d`);
        fetchData();
        setSelectedRequest(null);
      } else {
        Alert.alert('Error', res.data.message || 'Failed to update request');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const deleteProfile = async (employeeId: string) => {
    Alert.alert('Confirm Delete', 'Delete this profile?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await axios.post(`${BACKEND_URL}/delete-user`, { employeeId });
            if (res.data.status === 'ok') {
              setExistingProfiles(prev => prev.filter(p => p.employeeId !== employeeId));
              Alert.alert('Deleted', 'Profile removed');
            } else {
              Alert.alert('Error', res.data.message || 'Could not delete profile');
            }
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Something went wrong while deleting');
          }
        },
      },
    ]);
  };


  const saveEdit = async () => {
    if (!editEmployee) return;

    try {
      const res = await axios.post(`${BACKEND_URL}/update-employee`, {
        employeeId: editEmployee.employeeId,
        department: editEmployee.department,
        post: editEmployee.post,
      });

      if (res.data.status === 'ok') {
        setExistingProfiles(prev =>
          prev.map(emp =>
            emp.employeeId === editEmployee.employeeId ? { ...emp, department: editEmployee.department, post: editEmployee.post } : emp
          )
        );
        Alert.alert('Saved', `${editEmployee.name}'s profile updated`);
        setEditModalVisible(false);
        setEditEmployee(null);
      } else {
        Alert.alert('Error', res.data.message || 'Failed to save changes');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong while saving');
    }
  };


  const filteredProfiles = existingProfiles
    .filter(emp =>
      (deptFilter === 'All' || emp.department === deptFilter) &&
      (roleFilter === 'All' || emp.post === roleFilter) &&
      emp.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aIndex = a.name.toLowerCase().indexOf(searchQuery.toLowerCase());
      const bIndex = b.name.toLowerCase().indexOf(searchQuery.toLowerCase());
      return aIndex - bIndex;
    });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0D47A1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Pending Signup Requests</Text>

      {signupRequests.length > 0 ? (
        signupRequests.map(req => (
          <TouchableOpacity key={req.employeeId} style={styles.card} onPress={() => setSelectedRequest(req)}>
            <Image
              source={req.profilePic ? { uri: req.profilePic } : require('../assets/placeholder.jpg')}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.name}>{req.name}</Text>
              <Text style={styles.email}>{req.email}</Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Image
            source={require('../assets/nopendingbox-removebg-preview.png')}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyText}>No pending signup requests</Text>
        </View>
      )}

      <Modal visible={!!selectedRequest} transparent animationType="fade">
        <View style={styles.centerModal}>
          <View style={styles.modalContent}>
            {selectedRequest && (
              <>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedRequest(null)}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>

                <View style={styles.avatarCenter}>
                  <Image
                    source={selectedRequest.profilePic ? { uri: selectedRequest.profilePic } : require('../assets/placeholder.jpg')}
                    style={styles.largeAvatar}
                  />
                </View>
                <Text style={styles.detailsTitle}>{selectedRequest.name}</Text>
                <Text>{selectedRequest.email}</Text>
                <Text>Dept: {selectedRequest.department}</Text>
                <Text>Post: {selectedRequest.post}</Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => handleRequest(selectedRequest.employeeId, 'approve')}>
                    <Text style={styles.btnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineBtn} onPress={() => handleRequest(selectedRequest.employeeId, 'decline')}>
                    <Text style={styles.btnText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.toggleBtn} onPress={() => setShowExisting(!showExisting)}>
        <Text style={styles.toggleBtnText}>
          {showExisting ? 'Hide Profiles' : 'View Existing Profiles'}
        </Text>
      </TouchableOpacity>

      {showExisting && (
        <>
          <Text style={styles.header}>Existing Employees</Text>


          <Text style={styles.subHeader}>Filters</Text>

          <View style={styles.dropdownRow}>
            <View style={styles.dropdownColumn}>
              <Text style={styles.label}>Department</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholder}
                selectedTextStyle={styles.selectedText}
                data={departmentOptions}
                search
                maxHeight={200}
                labelField="label"
                valueField="value"
                placeholder="Department"
                value={deptFilter}
                onChange={item => setDeptFilter(item.value)}
              />
            </View>
            <View style={styles.dropdownColumn}>
              <Text style={styles.label}>Post</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholder}
                selectedTextStyle={styles.selectedText}
                data={roleOptions}
                search
                maxHeight={200}
                labelField="label"
                valueField="value"
                placeholder="Post"
                value={roleFilter}
                onChange={item => setRoleFilter(item.value)}
              />
            </View>
          </View>
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchBar}
              placeholder="Search by name"
              value={searchQuery}
              onChangeText={text => setSearchQuery(text)}
              placeholderTextColor="#888"
            />
          </View>

          <FlatList
            data={filteredProfiles}
            keyExtractor={item => item.employeeId}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image
                  source={item.profilePic ? { uri: item.profilePic } : require('../assets/placeholder.jpg')}
                  style={styles.avatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                  <Text style={styles.subInfo}>
                    Dept: {item.department} | Post: {item.post}
                  </Text>

                </View>
                <TouchableOpacity onPress={() => { setEditEmployee({ ...item }); setEditModalVisible(true); }}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteProfile(item.employeeId)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      )}

      <View style={{ height: 40 }} />

      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.centerModal}>
          <View style={styles.modalContent}>
            {editEmployee && (
              <>
                <Text style={styles.detailsTitle}>Edit Profile</Text>
                <Text>{editEmployee.name}</Text>
                <Text>{editEmployee.email}</Text>

                <Text style={styles.label}>Department</Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholder}
                  selectedTextStyle={styles.selectedText}
                  data={departmentOptions.slice(1)}
                  search
                  maxHeight={200}
                  labelField="label"
                  valueField="value"
                  placeholder="Department"
                  value={editEmployee.department}
                  onChange={item => setEditEmployee({ ...editEmployee, department: item.value })}
                />

                <Text style={styles.label}>Post</Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholder}
                  selectedTextStyle={styles.selectedText}
                  data={roleOptions.slice(1)}
                  search
                  maxHeight={200}
                  labelField="label"
                  valueField="value"
                  placeholder="Post"
                  value={editEmployee.post}
                  onChange={item => setEditEmployee({ ...editEmployee, post: item.value })}
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.approveBtn} onPress={saveEdit}>
                    <Text style={styles.btnText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineBtn} onPress={() => setEditModalVisible(false)}>
                    <Text style={styles.btnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ManageEmployeeScreen;


const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f0f6fc' },
  header: { fontSize: 20, fontWeight: 'bold', color: '#0D47A1' },
  subHeader: { fontSize: 16, fontWeight: '600', color: '#0D47A1', marginVertical: 10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 10, marginVertical: 6, borderRadius: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: '#ccc' },
  largeAvatar: { width: 80, height: 80, borderRadius: 40 },
  avatarCenter: { alignItems: 'center', marginBottom: 10 },
  name: { fontSize: 16, color: '#0D47A1', fontWeight: '600' },
  email: { fontSize: 14, color: '#333' },
  subInfo: { fontSize: 13, color: '#555' },
  toggleBtn: { backgroundColor: '#7098c5', padding: 12, marginVertical: 16, borderRadius: 8, alignItems: 'center' },
  toggleBtnText: { color: '#fff', fontWeight: 'bold' },
  editText: { color: '#1976D2', marginHorizontal: 8 },
  deleteText: { color: '#f44336', marginHorizontal: 8 },
  buttonRow: { flexDirection: 'row', marginTop: 12, gap: 12 },
  approveBtn: { flex: 1, backgroundColor: '#4caf50', padding: 10, borderRadius: 6, alignItems: 'center' },
  declineBtn: { flex: 1, backgroundColor: '#f44336', padding: 10, borderRadius: 6, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  centerModal: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#fff', borderRadius: 10, padding: 20, position: 'relative' },
  detailsTitle: { fontSize: 16, fontWeight: 'bold', color: '#0D47A1', textAlign: 'center', marginBottom: 8 },
  dropdownRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  dropdownColumn: { flex: 1 },
  dropdown: { marginTop: 4, paddingHorizontal: 8, borderColor: '#7098c5', borderWidth: 1, borderRadius: 8, backgroundColor: '#FFF' },
  placeholder: { fontSize: 14, color: '#666' },
  selectedText: { fontSize: 14, color: '#0D47A1' },
  label: { fontSize: 14, color: '#0D47A1', marginBottom: 2, fontWeight: '500' },
  closeBtn: { position: 'absolute', top: 10, right: 10, zIndex: 10 },
  closeBtnText: { fontSize: 22, color: '#444' },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyImage: { width: 180, height: 180, resizeMode: 'contain', opacity: 0.6, marginBottom: 10 },
  emptyText: { fontSize: 16, color: '#888', fontFamily: 'Montserrat-Medium' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#7098c5',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
  },

  searchIcon: {
    marginRight: 6,
  },

  searchBar: {
    flex: 1,
    height: 40,
    color: '#0D47A1',
  },

});
