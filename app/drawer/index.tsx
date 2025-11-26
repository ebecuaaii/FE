import { Redirect } from 'expo-router';

export default function DrawerIndex() {
    // Redirect to home screen in tabs
    return <Redirect href="/drawer/(tabs)/home" />;
}
