import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import apiClient from './api';

export interface AppNotification {
  _id: string;
  type: 'event' | 'promotion';
  shopId: string;
  shopName: string;
  // event
  eventName?: string;
  eventDescription?: string;
  eventDate?: string;
  // promotion
  promotionDescription?: string;
  promotionValue?: string;
  promotionStartDate?: string;
  promotionEndDate?: string;
  sentAt: string;
  read: boolean;
}

export async function getNotifications(): Promise<AppNotification[]> {
  const res = await apiClient.get('/users/notifications');
  return res.data.data;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiClient.patch(`/users/notifications/${notificationId}/read`);
}

export async function registerForPushNotifications(): Promise<void> {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });

    if (!Device.isDevice) return;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') return;

    try {
        const projectId =
            Constants.expoConfig?.extra?.eas?.projectId ??
            (Constants as any).easConfig?.projectId;

        const tokenData = projectId
            ? await Notifications.getExpoPushTokenAsync({ projectId })
            : await Notifications.getExpoPushTokenAsync();

        await apiClient.patch('/users/pushToken', { pushToken: tokenData.data });
    } catch (err) {
        console.error('Failed to register push token:', err);
    }
}
