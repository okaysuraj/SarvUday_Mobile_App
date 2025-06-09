import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PrivacyPolicy = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        
        <Text style={styles.title}>Privacy Policy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.sectionText}>
          Welcome to SarvUday! This Privacy Policy describes how we collect, use, and protect your personal information when you use our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.sectionText}>
          - Personal Information: Name, email address, phone number, and city provided during registration.
          {'\n'}- Usage Data: Information about how you use the app.
        </Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.sectionText}>
          - To provide and maintain our services.
          {'\n'}- To improve user experience and develop new features.
          {'\n'}- To contact you with important updates or offers.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.sectionText}>
          We implement industry-standard security measures to protect your data from unauthorized access. However, no method of transmission over the internet is 100% secure.
        </Text>

        <Text style={styles.sectionTitle}>5. Sharing Your Information</Text>
        <Text style={styles.sectionText}>
          We do not share your personal information with third parties except:
          {'\n'}- When required by law.
          {'\n'}- With your explicit consent.
        </Text>

        <Text style={styles.sectionTitle}>6. Your Rights</Text>
        <Text style={styles.sectionText}>
          You have the right to access, update, or delete your personal data. If you have any concerns, please contact us at support@sarvuday.com.
        </Text>

        <Text style={styles.sectionTitle}>7. Changes to This Policy</Text>
        <Text style={styles.sectionText}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
        </Text>

        <Text style={styles.sectionTitle}>8. Contact Us</Text>
        <Text style={styles.sectionText}>
          If you have any questions about this Privacy Policy, please contact us at:
          {'\n'}Email: support@sarvuday.com
        </Text>
      </ScrollView>
    </View>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  backText: {
    color: '#FFF',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
  },
  sectionText: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
    lineHeight: 20,
  },
});
