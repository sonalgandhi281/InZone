import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import MapView, {
  Marker,
  Polygon,
  PROVIDER_GOOGLE,
  LatLng,
} from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { Dropdown } from 'react-native-element-dropdown';
import BASE_URL from '../../config/apiConfig';

interface GeofenceRegion {
  id: string;
  coordinates: LatLng[];
  department: string;
  color: string;
}

const colors = [
  'rgba(13,71,161,0.4)',
  'rgba(76,175,80,0.4)',
  'rgba(255,193,7,0.4)',
  'rgba(244,67,54,0.4)',
];

const departments = [
  { label: 'IT', value: 'IT' },
  { label: 'HR', value: 'HR' },
  { label: 'DATA ANALYTICS', value: 'Data Analytics' },
  { label: 'OPERATIONS', value: 'Operations' },
];

const defaultRegion = [
  { latitude: 28.589425, longitude: 77.19956 },
  { latitude: 28.58209, longitude: 77.200919 },
  { latitude: 28.580685, longitude: 77.211355 },
  { latitude: 28.587327, longitude: 77.212342 },
  { latitude: 28.587134, longitude: 77.203528 },
];

const GeofenceScreen: React.FC = () => {
  const [regions, setRegions] = useState<GeofenceRegion[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<LatLng[]>([]);
  const [deptName, setDeptName] = useState('');
  const [confirmPoint, setConfirmPoint] = useState<LatLng | null>(null);
  const [mode, setMode] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    fetchGeofences();
  }, []);

  const fetchGeofences = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/get-geofences`);
      setRegions(res.data.data || []);
    } catch (error) {
      console.log('Error fetching geofences:', error);
    }
  };

  const saveGeofenceToDB = async (region: GeofenceRegion) => {
    try {
      await axios.post(`${BASE_URL}/save-geofence`, {
        id: region.id,
        coordinates: region.coordinates,
        department: region.department,
        color: region.color,
      });
    } catch (err) {
      console.log('Save error:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const timeout = setTimeout(() => setMapReady(true), 200);
      return () => {
        clearTimeout(timeout);
        setMapReady(false);
      };
    }, [])
  );

  const handleMapPress = (e: { nativeEvent: { coordinate: LatLng } }) => {
    const tappedPoint = e.nativeEvent.coordinate;

    if (mode === 'add') {
      setConfirmPoint(tappedPoint);
    } else if (mode === 'edit' || mode === 'delete') {
      const tappedRegion = regions.find((region) =>
        region.coordinates.some(
          (p) =>
            Math.abs(p.latitude - tappedPoint.latitude) < 0.001 &&
            Math.abs(p.longitude - tappedPoint.longitude) < 0.001
        )
      );
      if (tappedRegion) {
        if (mode === 'edit') {
          setPolygonPoints(tappedRegion.coordinates);
          setSelectedRegionId(tappedRegion.id);
          setDeptName(tappedRegion.department);
          setMode('add');
        } else if (mode === 'delete') {
          Alert.alert('Delete Geofence?', 'Are you sure?', [
            { text: 'Cancel' },
            {
              text: 'Delete',
              onPress: () => {
                axios.post(`${BASE_URL}/delete-geofence`, {
                  id: tappedRegion.id,
                });
                setRegions(regions.filter((r) => r.id !== tappedRegion.id));
                setMode(null);
              },
              style: 'destructive',
            },
          ]);
        }
      }
    }
  };

  const confirmAddPoint = () => {
    if (confirmPoint) {
      setPolygonPoints([...polygonPoints, confirmPoint]);
      setConfirmPoint(null);
    }
  };

  const cancelAddPoint = () => {
    setConfirmPoint(null);
  };

  const undoLastPoint = () => {
    const updated = [...polygonPoints];
    updated.pop();
    setPolygonPoints(updated);
  };

  const handleSaveGeofence = () => {
    if (!deptName || polygonPoints.length < 3) return;

    const newRegion: GeofenceRegion = {
      id: selectedRegionId || Date.now().toString(),
      coordinates: polygonPoints,
      department: deptName,
      color: colors[regions.length % colors.length],
    };

    const updatedRegions = selectedRegionId
      ? regions.map((r) => (r.id === selectedRegionId ? newRegion : r))
      : [...regions, newRegion];

    setRegions(updatedRegions);
    saveGeofenceToDB(newRegion);
    setPolygonPoints([]);
    setDeptName('');
    setShowDeptModal(false);
    setSelectedRegionId(null);
    setMode(null);
  };

  return (
    <View style={styles.container}>
      {mapReady && (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: 28.5849,
            longitude: 77.2066,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
        >
          {(regions.length > 0 ? regions : [
            {
              id: 'default',
              coordinates: defaultRegion,
              department: 'DEFAULT',
              color: 'rgba(158,158,158,0.3)',
            },
          ]).map((region) => (
            <React.Fragment key={region.id}>
              <Polygon
                coordinates={region.coordinates}
                strokeColor="#0D47A1"
                fillColor={region.color}
                strokeWidth={2}
              />
              <Marker coordinate={region.coordinates[0]}>
                <View style={styles.labelContainer}>
                  <Text style={styles.labelText}>{region.department}</Text>
                </View>
              </Marker>
            </React.Fragment>
          ))}
          {polygonPoints.length >= 1 && (
            <Polygon
              coordinates={polygonPoints}
              strokeColor="#0D47A1"
              fillColor="rgba(13,71,161,0.3)"
            />
          )}
          {polygonPoints.map((pt, i) => (
            <Marker key={i} coordinate={pt} />
          ))}
        </MapView>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {mode === 'add' && (
          <>
            <Text style={styles.instructionText}>Mark 3 or more points</Text>
            {polygonPoints.length > 0 && (
              <View style={styles.rowButtonGroup}>
                <TouchableOpacity style={styles.undoBtn} onPress={undoLastPoint}>
                  <Text style={styles.undoText}>Undo</Text>
                </TouchableOpacity>
                {polygonPoints.length >= 3 && (
                  <TouchableOpacity
                    style={styles.addRegionBtn}
                    onPress={() => setShowDeptModal(true)}
                  >
                    <Text style={styles.addRegionText}>Add Region</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
        <View style={styles.actionPanelColumn}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              setPolygonPoints([]);
              setDeptName('');
              setMode('add');
            }}
          >
            <Text style={styles.actionText}>Add Geofence</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setMode('edit')}>
            <Text style={styles.actionText}>Edit Geofence</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setMode('delete')}>
            <Text style={styles.actionText}>Delete Geofence</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={!!confirmPoint} transparent animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text>Add this point?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={cancelAddPoint} style={styles.cancelBtn}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmAddPoint} style={styles.confirmBtn}>
                <Text>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showDeptModal} transparent>
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.label}>Add this region?</Text>
            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              data={departments}
              maxHeight={150}
              labelField="label"
              valueField="value"
              placeholder="Select Department"
              value={deptName}
              onChange={item => setDeptName(item.value)}
            />
            <TouchableOpacity
              onPress={handleSaveGeofence}
              disabled={!deptName}
              style={[styles.confirmBtn, !deptName && { opacity: 0.5 }]}
            >
              <Text style={styles.confirmText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GeofenceScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 20,
  },
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.65,
  },
  actionPanelColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  actionBtn: {
    backgroundColor: '#0D47A1',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginVertical: 6,
    width: '80%',
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
  },
  instructionText: {
    textAlign: 'center',
    marginVertical: 6,
    color: '#0D47A1',
    fontFamily: 'Montserrat-Medium',
  },
  undoBtn: {
    alignSelf: 'center',
    backgroundColor: '#ccc',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  undoText: {
    fontFamily: 'Montserrat-Medium',
    color: '#000',
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 12,
    borderRadius: 8,
    fontFamily: 'Montserrat-Regular',
  },
  label: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: '#0D47A1',
    marginBottom: 6,
  },
  confirmBtn: {
    backgroundColor: '#0D47A1',
    padding: 10,
    borderRadius: 8,
    marginTop: 0,
    width: '48%',
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
  },
  cancelBtn: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginTop: 0,
    width: '48%',
    alignItems: 'center',
  },
  cancelText: {
    color: '#000',
    fontFamily: 'Montserrat-Regular',
  },
  labelContainer: {
    backgroundColor: '#0D47A1',
    padding: 4,
    borderRadius: 6,
  },
  labelText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
  },
  rowButtonGroup: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 10,
  marginBottom: 8,
},
addRegionBtn: {
  // backgroundColor: '#0D47A1',
  // paddingVertical: 5,
  // paddingHorizontal: 12,
  // borderRadius: 6,

  alignSelf: 'center',
    backgroundColor: '#0D47A1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
},
addRegionText: {
  fontFamily: 'Montserrat-Bold',
  color: '#fff',
},
dropdown: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  dropdownContainer: {
    borderRadius: 8,
  },
});