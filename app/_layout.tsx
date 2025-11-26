import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="signin" options={{ presentation: 'modal' }} />
        <Stack.Screen name="signup" options={{ presentation: 'modal' }} />
        <Stack.Screen name="drawer" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="function" />
        <Stack.Screen name="adminfunction" />
      </Stack>
    </AuthProvider>
  );

}
