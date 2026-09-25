import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_KEY = 't2_courier_session_token';
const USER_KEY = 't2_courier_user_data';

const memoryStorage: Record<string, string> = {};

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return memoryStorage[key] || null;
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return memoryStorage[key] || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        memoryStorage[key] = value;
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch {
      memoryStorage[key] = value;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        delete memoryStorage[key];
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch {
      delete memoryStorage[key];
    }
  },

  keys: {
    SESSION_KEY,
    USER_KEY,
  },
};
