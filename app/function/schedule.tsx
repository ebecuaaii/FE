import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ScheduleScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lịch làm việc</Text>
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
    },
});
