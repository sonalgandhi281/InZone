import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const PrivacyPolicyScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Privacy Policy</Text>
      <ScrollView style={styles.scroll}>
        {/* Section 1: Introduction */}
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.text}>
          This Privacy Policy describes how Airports Authority of India collects, uses, and protects personal information when users access and interact with the Geofencing Attendance Application ("App"). By using the App, you consent to the data practices described in this policy.
        </Text>

        {/* Section 2: Purpose */}
        <Text style={styles.sectionTitle}>2. Purpose of Data Collection</Text>
        <Text style={styles.text}>
          The purpose of collecting location and usage data through this App is to enable secure and accurate attendance marking for authorized personnel within predefined geofenced office zones. This system ensures transparency and automation in attendance management.
        </Text>

        {/* Section 3: Data Collected */}
        <Text style={styles.sectionTitle}>3. Types of Data Collected</Text>
        <Text style={styles.text}>
          The App collects your real-time geographic location during official working hours to verify your presence within authorized zones. It may also collect device information such as model, OS version, and basic usage logs necessary for technical diagnostics.
        </Text>

        {/* Section 4: Data Usage */}
        <Text style={styles.sectionTitle}>4. How We Use Your Data</Text>
        <Text style={styles.text}>
          Your location data is used strictly for internal attendance tracking and audit purposes. It is accessed only by authorized HR and IT personnel within the Airports Authority of India. The data is never used for marketing or behavioral profiling.
        </Text>

        {/* Section 5: Data Storage and Retention */}
        <Text style={styles.sectionTitle}>5. Data Storage and Retention</Text>
        <Text style={styles.text}>
          All collected data is stored securely on servers maintained or approved by the Airports Authority of India. Location and usage data are retained only for the duration required by internal HR or compliance policies and are deleted or anonymized afterward.
        </Text>

        {/* Section 6: Data Sharing and Disclosure */}
        <Text style={styles.sectionTitle}>6. Data Sharing and Disclosure</Text>
        <Text style={styles.text}>
          We do not sell, trade, or rent your personal data. Data may only be disclosed to government authorities or regulatory bodies in cases where it is legally required or during audits. Third-party service providers, if involved, operate under strict data protection agreements.
        </Text>

        {/* Section 7: User Responsibilities */}
        <Text style={styles.sectionTitle}>7. User Responsibilities</Text>
        <Text style={styles.text}>
          Users are responsible for ensuring their device's location services are enabled during work hours. Any attempt to falsify, disable, or spoof location data will be considered a violation of organizational policy and may lead to disciplinary action.
        </Text>

        {/* Section 8: Data Security */}
        <Text style={styles.sectionTitle}>8. Data Security Measures</Text>
        <Text style={styles.text}>
          We implement administrative, technical, and physical safeguards to secure your data. This includes encryption protocols, access restrictions, and regular system audits to prevent unauthorized access, alteration, or data breaches.
        </Text>

        {/* Section 9: Your Rights */}
        <Text style={styles.sectionTitle}>9. Your Rights</Text>
        <Text style={styles.text}>
          You have the right to access, correct, or request deletion of your data where applicable. You may also withdraw your consent for location tracking; however, doing so may affect the core functionality of the App, including attendance logging.
        </Text>

        {/* Section 10: Policy Updates */}
        <Text style={styles.sectionTitle}>10. Changes to this Policy</Text>
        <Text style={styles.text}>
          This Privacy Policy may be updated periodically to reflect changes in technology, legal requirements, or internal policy. Notifications of significant changes will be provided through official channels. Continued use of the App implies acceptance of the updated policy.
        </Text>

        {/* Section 11: Contact Information */}
        <Text style={styles.sectionTitle}>11. Contact Information</Text>
        <Text style={styles.text}>
          If you have any questions or concerns regarding this Privacy Policy or your personal data, please contact:
          {'\n\n'}
          Data Protection Officer{'\n'}
          Airports Authority of India{'\n'}
          Email: privacy@aai.aero{'\n'}
          Phone: +91-XXXXXXXXXX
        </Text>

        {/* Section 12: Final Acknowledgment */}
        <Text style={styles.sectionTitle}>12. Final Acknowledgment</Text>
        <Text style={styles.text}>
          By continuing to use this App, you acknowledge that you have read, understood, and agreed to the practices described in this Privacy Policy.
        </Text>
      </ScrollView>
    </View>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#a9defc35',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  scroll: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#00316E',
  },
  text: {
    fontSize: 16,
    color: '#444',
    lineHeight: 26,
    textAlign: 'justify',
  },
});