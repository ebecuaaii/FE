import { Alert, Platform } from 'react-native';

export const showAlert = (title: string, message?: string) => {
    if (Platform.OS === 'web') {
        // Trên web dùng alert của browser
        if (message) {
            alert(`${title}\n\n${message}`);
        } else {
            alert(title);
        }
    } else {
        // Trên mobile dùng Alert của React Native
        Alert.alert(title, message);
    }
};

export const showConfirm = (title: string, message?: string): Promise<boolean> => {
    return new Promise((resolve) => {
        if (Platform.OS === 'web') {
            // Trên web dùng confirm của browser
            const result = confirm(message ? `${title}\n\n${message}` : title);
            resolve(result);
        } else {
            // Trên mobile dùng Alert với buttons
            Alert.alert(
                title,
                message,
                [
                    {
                        text: 'Hủy',
                        style: 'cancel',
                        onPress: () => resolve(false),
                    },
                    {
                        text: 'OK',
                        onPress: () => resolve(true),
                    },
                ]
            );
        }
    });
};

export const showConfirmDestructive = (
    title: string,
    message?: string,
    confirmText: string = 'Xóa'
): Promise<boolean> => {
    return new Promise((resolve) => {
        if (Platform.OS === 'web') {
            const result = confirm(message ? `${title}\n\n${message}` : title);
            resolve(result);
        } else {
            Alert.alert(
                title,
                message,
                [
                    {
                        text: 'Hủy',
                        style: 'cancel',
                        onPress: () => resolve(false),
                    },
                    {
                        text: confirmText,
                        style: 'destructive',
                        onPress: () => resolve(true),
                    },
                ]
            );
        }
    });
};