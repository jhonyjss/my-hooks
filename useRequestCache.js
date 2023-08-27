import localforage from 'localforage';
import { useContext } from 'react';

export const useRequest = () => {
  const { action, getState } = useContext(StoreContext);
  localforage.setDriver(localforage.INDEXEDDB);

  const actionCache = async (name, payload) => {
    const stringPayload = JSON.stringify(payload)
    const TTL = 60000 * 2
    try {
      const cacheKey = `url_${name}_${stringPayload}`;
      const cachedValue = await localforage.getItem(cacheKey);

      if (cachedValue) {
        // Check cache expiration
        const currentTime = new Date().getTime();
        if (cachedValue.timestamp + TTL > currentTime) { 
          return cachedValue.value;
        } else {
          await localforage.removeItem(cacheKey); // Expired, remove from cache
        }
      }

      const response = await action(name, payload); // replace by fetch or axios
      const cacheData = {
        value: response,
        timestamp: new Date().getTime(),
      };

      await localforage.setItem(cacheKey, cacheData);
      return response;
    } catch (err) {
      console.log(err);
      throw err; // Re-throw the error for higher-level error handling
    }
  };

  return { actionCache };
};
