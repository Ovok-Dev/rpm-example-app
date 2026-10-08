import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { randomUUID } from "expo-crypto";

const CHUNK_SIZE = 1800;
const secureOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

// Keychain values are chunked; swapping the manifest last preserves the previous
// complete value if the app stops or storage fails during a write.
// ponytail: interrupted writes can leave orphan chunks; add a cleanup index if
// long-running deployments encounter keychain storage pressure.
export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    const raw = await SecureStore.getItemAsync(key, secureOptions);
    if (!raw) return null;
    const manifest = JSON.parse(raw) as { generation: string; count: number };
    const chunks = await Promise.all(
      Array.from({ length: manifest.count }, (_, index) =>
        SecureStore.getItemAsync(
          `${key}.${manifest.generation}.${index}`,
          secureOptions,
        ),
      ),
    );
    if (chunks.some((chunk) => chunk === null))
      throw new Error("Secure data is incomplete. Please contact support.");
    return chunks.join("");
  },
  async setItem(key: string, value: string): Promise<void> {
    const previous = await SecureStore.getItemAsync(key, secureOptions);
    const generation = randomUUID();
    const count = Math.max(1, Math.ceil(value.length / CHUNK_SIZE));
    await Promise.all(
      Array.from({ length: count }, (_, index) =>
        SecureStore.setItemAsync(
          `${key}.${generation}.${index}`,
          value.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
          secureOptions,
        ),
      ),
    );
    await SecureStore.setItemAsync(
      key,
      JSON.stringify({ generation, count }),
      secureOptions,
    );
    if (previous) {
      const old = JSON.parse(previous) as { generation: string; count: number };
      await Promise.allSettled(
        Array.from({ length: old.count }, (_, index) =>
          SecureStore.deleteItemAsync(
            `${key}.${old.generation}.${index}`,
            secureOptions,
          ),
        ),
      );
    }
  },
  async removeItem(key: string): Promise<void> {
    const raw = await SecureStore.getItemAsync(key, secureOptions);
    await SecureStore.deleteItemAsync(key, secureOptions);
    if (raw) {
      const old = JSON.parse(raw) as { generation: string; count: number };
      await Promise.allSettled(
        Array.from({ length: old.count }, (_, index) =>
          SecureStore.deleteItemAsync(
            `${key}.${old.generation}.${index}`,
            secureOptions,
          ),
        ),
      );
    }
  },
};

export { AsyncStorage as demoStorage };
