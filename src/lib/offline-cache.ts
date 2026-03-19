/**
 * Lightweight IndexedDB cache for offline support.
 * Stores serialized data with TTL and provides a simple get/set/clear API.
 */

const DB_NAME = 'makefriends_offline';
const DB_VERSION = 1;
const STORE_NAME = 'cache';

interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  ttl: number; // seconds
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Store data in the offline cache.
 * @param key Cache key (e.g., 'events', 'profile:userId')
 * @param data Data to cache (must be serializable)
 * @param ttlSeconds Time-to-live in seconds (default: 1 hour)
 */
export async function cacheSet(key: string, data: any, ttlSeconds = 3600): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds,
    };

    store.put(entry);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('[OfflineCache] Set failed:', error);
  }
}

/**
 * Retrieve cached data. Returns null if not found or expired.
 */
export async function cacheGet<T = any>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const entry = request.result as CacheEntry | undefined;
        if (!entry) {
          resolve(null);
          return;
        }

        // Check TTL
        const age = (Date.now() - entry.timestamp) / 1000;
        if (age > entry.ttl) {
          // Expired — delete and return null
          const deleteTx = db.transaction(STORE_NAME, 'readwrite');
          deleteTx.objectStore(STORE_NAME).delete(key);
          resolve(null);
          return;
        }

        resolve(entry.data as T);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[OfflineCache] Get failed:', error);
    return null;
  }
}

/**
 * Remove a specific cache entry.
 */
export async function cacheRemove(key: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    await new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve();
    });
  } catch (error) {
    console.error('[OfflineCache] Remove failed:', error);
  }
}

/**
 * Clear all cached data.
 */
export async function cacheClear(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    await new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve();
    });
  } catch (error) {
    console.error('[OfflineCache] Clear failed:', error);
  }
}

/**
 * Get all cache keys (for debugging / sync management).
 */
export async function cacheKeys(): Promise<string[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAllKeys();
      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}
