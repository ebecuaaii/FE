import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AttendanceScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chấm công</Text>
            <Text style={styles.subtitle}>Để bắt đầu ca làm</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
    },
});
