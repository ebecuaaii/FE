import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SidebarLayout from '../../../components/SidebarLayout';

export default function NotificationScreen() {
  return (
    <SidebarLayout title="Thông báo" activeKey="notification">
      <View style={styles.container}>
        <Text style={styles.title}>Notification Screen</Text>
      </View>
    </SidebarLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
