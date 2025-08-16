import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const TermsAndConditions = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Terms & Conditions</Text>
      <ScrollView style={styles.scroll}>
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.text}>
          Welcome to the official Geofencing Attendance Application (“App”) developed and maintained by Airports Authority of India (AAI). These Terms and Conditions (“Terms”) govern your access and usage of the App. By accessing or using the App, you agree to be bound by these Terms. If you do not agree to these Terms, you must discontinue using the App immediately.
        </Text>

        <Text style={styles.sectionTitle}>2. Purpose of the App</Text>
        <Text style={styles.text}>
          The primary purpose of this App is to facilitate location-based attendance marking for employees and authorized personnel. The App uses geofencing technology to determine whether a user is within a predefined geographic boundary (such as an office or worksite) and records attendance based on this information.
        </Text>

        <Text style={styles.sectionTitle}>3. Scope of Use</Text>
        <Text style={styles.text}>
          This App is intended for use solely by employees or individuals who have been granted access by Airports Authority of India (AAI). Any unauthorized access, duplication, or distribution of the App is strictly prohibited. Users must ensure their use of the App aligns with the organization’s code of conduct, policies, and applicable legal regulations.
        </Text>

        <Text style={styles.sectionTitle}>4. Location Data Usage</Text>
        <Text style={styles.text}>
          By installing and using this App, you consent to the collection, storage, and processing of your location data. Location data is only accessed while you are using the App during designated working hours and is strictly used to determine your presence within the defined geofence for attendance logging. Your location data is not used for tracking personal movement outside of official working requirements.
        </Text>

        <Text style={styles.sectionTitle}>5. Data Privacy and Security</Text>
        <Text style={styles.text}>
          All location and user data collected through this App is treated as confidential. We adhere to industry-standard security practices to protect your data from unauthorized access, misuse, or loss. Data is stored securely and is accessible only to authorized personnel for attendance verification, audit trails, and reporting purposes. The organization does not sell, lease, or share your personal data with third parties, unless required by law or with your explicit consent.
        </Text>

        <Text style={styles.sectionTitle}>6. User Responsibilities</Text>
        <Text style={styles.text}>
          As a user of this App, you are responsible for ensuring that:
          {'\n'}- Your device’s GPS/location services are turned on during working hours.
          {'\n'}- The App is kept up-to-date from authorized app stores or internal deployment sources.
          {'\n'}- You do not attempt to manipulate or falsify your location using spoofing tools, VPNs, or third-party software.
          {'\n'}- You report any technical issues or suspicious behavior to the IT department or administrator immediately.
        </Text>

        <Text style={styles.sectionTitle}>7. Limitations and Disclaimers</Text>
        <Text style={styles.text}>
          While the App is designed to function reliably across supported devices, geolocation accuracy may vary due to hardware limitations, environmental conditions, and network connectivity. Airports Authority of India (AAI) is not responsible for location discrepancies caused by device malfunctions or service interruptions. The App is provided "as is" without any express or implied warranties regarding its accuracy or performance.
        </Text>

        <Text style={styles.sectionTitle}>8. Modifications to Terms and App Updates</Text>
        <Text style={styles.text}>
          These Terms may be updated periodically without prior notice. Any material changes will be communicated via internal communication channels or in-app notices. Your continued use of the App following the posting of revised Terms constitutes your acceptance of those changes. The App itself may also receive updates to improve functionality or address security concerns.
        </Text>

        <Text style={styles.sectionTitle}>9. Termination of Access</Text>
        <Text style={styles.text}>
          Access to the App may be revoked at any time due to termination of employment, violation of these Terms, misuse of the system, or as part of administrative decisions. Upon termination, you are required to uninstall the App from your device and cease any further access or attempts to use it.
        </Text>

        <Text style={styles.sectionTitle}>10. Liability Limitation</Text>
        <Text style={styles.text}>
          Airports Authority of India (AAI) shall not be liable for any indirect, incidental, or consequential damages resulting from your use or inability to use the App, including but not limited to data loss, missed attendance logs, or technical disruptions.
        </Text>

        <Text style={styles.sectionTitle}>11. Contact Information</Text>
        <Text style={styles.text}>
          If you have any questions, feedback, or require technical support regarding the App, please contact:
          {'\n'}Support Team – Airports Authority of India (AAI)
          {'\n'}Email: support@yourorganization.com
          {'\n'}Phone: +91-XXXXXXXXXX
        </Text>

        <Text style={[styles.text, { marginTop: 20 }]}>
          By continuing to use this App, you acknowledge that you have read, understood, and agreed to abide by these Terms and Conditions.
        </Text>
      </ScrollView>
    </View>
  );
};

export default TermsAndConditions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#a9defc35',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#00316E',
    marginTop: 15,
    marginBottom: 5,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
});