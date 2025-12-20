import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { authService } from "../services/authService";

type Props = {};

const SignUpScreen = (props: Props) => {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullname, setFullname] = useState('');
    const [phone, setPhone] = useState('');
    const [branchCode, setBranchCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        if (!username || !email || !password || !confirmPassword || !fullname) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.signUp({
                username: username.trim(),
                password,
                confirmPassword,
                fullname,
                email,
                phone: phone || "",
                branchCode: branchCode.trim() || undefined,
            });

            // Debug: Log toàn bộ response để xem backend trả về gì
            console.log('SignUp Response:', JSON.stringify(response, null, 2));
            console.log('User data:', response?.user);

            Alert.alert('Success', 'Account created successfully');

            // Kiểm tra roleId từ response
            const user = response?.user;
            const roleIdRaw = user?.roleId || (user as any)?.RoleId || (user as any)?.role_id;
            const roleId = typeof roleIdRaw === 'string' ? parseInt(roleIdRaw) : roleIdRaw;

            // Kiểm tra nhiều variant của field names
            const userRole = (user?.roleName || user?.role || '')?.toLowerCase();
            const userPosition = (
                user?.positionTitle ||
                user?.position ||
                (user as any)?.PositionName ||
                ''
            )?.toLowerCase();
            const userDepartment = (
                user?.departmentName ||
                user?.department ||
                (user as any)?.DepartmentName ||
                ''
            )?.toLowerCase();

            console.log('SignUp - Checking user role:', {
                roleId,
                userRole,
                userPosition,
                userDepartment,
                fullUser: user
            });

            // Phân quyền theo roleId:
            // roleId = 1 → Admin
            // roleId = 2 → Manager
            // roleId = 3 hoặc khác → Employee

            const isAdmin = roleId === 1 || userRole === 'admin';
            const isManager = roleId === 2 ||
                (!isAdmin && (
                    userRole === 'manager' ||
                    userPosition?.includes('manager') ||
                    userPosition?.includes('quản lý') ||
                    userPosition?.includes('quản lý chi nhánh') ||
                    userDepartment?.includes('manager') ||
                    userDepartment?.includes('quản lý')
                ));

            console.log('SignUp - User type:', { roleId, isAdmin, isManager });

            if (isAdmin) {
                // Admin chuyển đến admin-task
                router.replace('/drawer/(tabs)/admin-task');
            } else if (isManager) {
                // Manager chuyển đến manager-home
                router.replace('/drawer/(tabs)/manager-home');
            } else {
                // Nhân viên thường chuyển đến home
                router.replace('/drawer/(tabs)/home');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Sign up failed';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        Alert.alert('Coming Soon', `${provider} sign up will be available soon`);
    };

    return (
        <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.container}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Sign up to get started</Text>

                {/* Form Inputs */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor="#9ca3af"
                        value={fullname}
                        onChangeText={setFullname}
                        editable={!loading}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        placeholderTextColor="#9ca3af"
                        value={username}
                        onChangeText={setUsername}
                        editable={!loading}
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#9ca3af"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        editable={!loading}
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Phone (Optional)"
                        placeholderTextColor="#9ca3af"
                        value={phone}
                        onChangeText={setPhone}
                        editable={!loading}
                        keyboardType="phone-pad"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Branch Code (Optional)"
                        placeholderTextColor="#9ca3af"
                        value={branchCode}
                        onChangeText={setBranchCode}
                        editable={!loading}
                        autoCapitalize="characters"
                    />
                    <Text style={styles.helperText}>
                        Nhập mã chi nhánh nếu bạn được mời làm việc
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#9ca3af"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!loading}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor="#9ca3af"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        editable={!loading}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSignUp}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Sign Up'}</Text>
                </TouchableOpacity>

                {/* Sign In Link */}
                <View style={styles.signinContainer}>
                    <Text style={styles.signinText}>Already have an account? </Text>
                    <Link href="/signin" asChild>
                        <TouchableOpacity>
                            <Text style={styles.signinLink}>Sign In</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: "#ffffff",
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        paddingTop: 40,
        paddingBottom: 40,
    },
    logoContainer: {
        marginBottom: 20,
        alignItems: "center",
    },
    logo: {
        width: 180,
        height: 70,
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
        marginBottom: 24,
    },
    inputContainer: {
        width: "100%",
        marginBottom: 8,
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        padding: 14,
        marginBottom: 12,
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
    socialIcon: {
        width: 28,
        height: 28,
    },
    signinContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    signinText: {
        color: "#6b7280",
        fontSize: 15,
    },
    signinLink: {
        color: "#0d9488",
        fontSize: 15,
        fontWeight: "bold",
    },
    helperText: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: -8,
        marginBottom: 12,
        fontStyle: "italic",
    },
});

export default SignUpScreen;