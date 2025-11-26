import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Logo Section */}
            <View style={styles.logoSection}>
                <Image
                    source={require('../assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>Welcome to CyberseHRM</Text>
                <Text style={styles.description}>
                    Manage your human resources with ease and efficiency
                </Text>
            </View>

            {/* Button Section */}
            <View style={styles.buttonSection}>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => router.push('/signup')}
                    activeOpacity={0.85}
                >
                    <Text style={styles.createButtonText}>Create an account</Text>
                </TouchableOpacity>

                <View style={styles.loginRow}>
                    <Text style={styles.loginPrompt}>Already have account? </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/signin')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.loginLink}>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 150,
        paddingHorizontal: 24,
    },
    logoSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    logo: {
        width: 300,
        height: 120,
        marginBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    buttonSection: {
        width: '100%',
        paddingBottom: 20,
        alignItems: 'center',
    },
    createButton: {
        backgroundColor: '#0d9488',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    createButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    loginRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loginPrompt: {
        fontSize: 14,
        color: '#6b7280',
    },
    loginLink: {
        fontSize: 14,
        color: '#0d9488',
        fontWeight: '600',
    },
});