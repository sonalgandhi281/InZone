import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';

const RecordLoadingScreen = () => {
const navigation = useNavigation<any>();

useEffect(() => {
setTimeout(() => {
    navigation.replace('RecordMain'); 
}, 4000); 
}, []);

return (
<View style={styles.container}>
    <LottieView
    source={require('../assets/recordloader.json')}
    autoPlay
    loop
    style={styles.animation}
    />
</View>
);
};

export default RecordLoadingScreen;

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({

container: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
},

animation: {
width: width * 0.7,
height: width * 0.7,
},

});