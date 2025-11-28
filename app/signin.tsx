import { Link, useRouter } from "expo-router";
import React, { useState, useContext } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../context/AuthContext";

type Props = {};

const SignInScreen = (props: Props) => {
    const router = useRouter();
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        if (!username || !password) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setLoading(true);
        try {
            await login(username, password);
            router.replace('/drawer/(tabs)/home');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        Alert.alert('Coming Soon', `${provider} login will be available soon`);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Logo */}
            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                editable={!loading}
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
            />

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignIn}
                disabled={loading}
            >
                <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialContainer}>
                <TouchableOpacity
                    style={[styles.socialButton, styles.googleButton]}
                    onPress={() => handleSocialLogin('Google')}
                >
                    <Image
                        source={require('../assets/images/gmail_5968534.png')}
                        style={styles.socialIcon}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.socialButton, styles.facebookButton]}
                    onPress={() => handleSocialLogin('Facebook')}
                >
                    <Image
                        source={{ uri: 'https://simpleicons.org/icons/facebook.svg' }}
                        style={[styles.socialIcon, { tintColor: '#1877F2' }]}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.socialButton, styles.appleButton]}
                    onPress={() => handleSocialLogin('Apple')}
                >
                    <Image
                        source={{ uri: 'https://simpleicons.org/icons/apple.svg' }}
                        style={[styles.socialIcon, { tintColor: '#000000' }]}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <Link href="/signup" asChild>
                    <TouchableOpacity>
                        <Text style={styles.signupLink}>Sign Up</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#ffffff",
    },
    logoContainer: {
        marginBottom: 30,
        alignItems: "center",
    },
    logo: {
        width: 200,
        height: 80,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#1f2937",
    },
    subtitle: {
        fontSize: 16,
        color: "#6b7280",
        marginBottom: 32,
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        padding: 14,
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: "#f9fafb",
        fontSize: 16,
    },
    button: {
        padding: 16,
        backgroundColor: "#0d9488",
        borderRadius: 12,
        marginTop: 8,
        width: "100%",
        alignItems: "center",
        shadowColor: "#0d9488",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: "#94a3b8",
        shadowOpacity: 0,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 24,
        width: "100%",
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#e5e7eb",
    },
    dividerText: {
        marginHorizontal: 16,
        color: "#9ca3af",
        fontSize: 14,
        fontWeight: "500",
    },
    socialContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 16,
        marginBottom: 24,
    },
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#f9fafb",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    googleButton: {
        backgroundColor: "#F5F5F5",
        borderColor: "#D14836",
    },
    facebookButton: {
        backgroundColor: "#E7F3FF",
        borderColor: "#1877F2",
    },
    appleButton: {
        backgroundColor: "#F5F5F5",
        borderColor: "#000000",
    },
    socialIcon: {
        width: 28,
        height: 28,
    },
    backButton: {
        padding: 12,
        marginTop: 8,
        width: "100%",
        alignItems: "center",
    },
    backButtonText: {
        color: "#6b7280",
        fontWeight: "500",
        fontSize: 15,
    },
    signupContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
    },
    signupText: {
        color: "#6b7280",
        fontSize: 15,
    },
    signupLink: {
        color: "#0d9488",
        fontSize: 15,
        fontWeight: "bold",
    },
});

export default SignInScreen;