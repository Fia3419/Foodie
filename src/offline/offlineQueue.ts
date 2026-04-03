import axios from "axios";
import { httpClient } from "../api/httpClient";
import {
  CreateMealLogEntryRequest,
  CreateWeightEntryRequest,
} from "../types/models";

type OfflineMutationKind = "create-food-log" | "create-weight-entry";

interface OfflineMutationMap {
  "create-food-log": CreateMealLogEntryRequest & { clientMutationId: string };
  "create-weight-entry": CreateWeightEntryRequest & {
    clientMutationId: string;
  };
}

export interface OfflineMutation<
  TKind extends OfflineMutationKind = OfflineMutationKind,
> {
  id: string;
  sessionEmail: string;
  kind: TKind;
  payload: OfflineMutationMap[TKind];
  createdAt: string;
}

const databaseName = "foodie-offline-db";
const storeName = "mutations";

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, 1);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(storeName)) {
        const store = database.createObjectStore(storeName, { keyPath: "id" });
        store.createIndex("sessionEmail", "sessionEmail", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const withStore = async <T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<T>,
): Promise<T> => {
  const database = await openDatabase();

  try {
    const transaction = database.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    return await callback(store);
  } finally {
    database.close();
  }
};

const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const shouldKeepQueuedMutation = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return true;
  }

  const status = error.response?.status;

  if (typeof status !== "number") {
    return true;
  }

  return (
    status === 401 ||
    status === 408 ||
    status === 425 ||
    status === 429 ||
    status >= 500
  );
};

export const enqueueOfflineMutation = async (mutation: OfflineMutation) => {
  await withStore("readwrite", async (store) => {
    await requestToPromise(store.put(mutation));
  });
};

export const deleteOfflineMutation = async (id: string) => {
  await withStore("readwrite", async (store) => {
    await requestToPromise(store.delete(id));
  });
};

export const getOfflineMutations = async (
  sessionEmail: string,
): Promise<OfflineMutation[]> =>
  withStore("readonly", async (store) => {
    const request = store.index("sessionEmail").getAll(sessionEmail);
    const results = await requestToPromise(request);
    return (results as OfflineMutation[]).sort((left, right) =>
      left.createdAt.localeCompare(right.createdAt),
    );
  });

export const getOfflineMutationCount = async (
  sessionEmail: string,
): Promise<number> => {
  return withStore("readonly", async (store) => {
    const request = store.index("sessionEmail").count(sessionEmail);
    return await requestToPromise(request);
  });
};

export const syncOfflineMutations = async (
  sessionEmail: string,
): Promise<number> => {
  const queuedMutations = await getOfflineMutations(sessionEmail);
  let syncedCount = 0;

  for (const mutation of queuedMutations) {
    try {
      if (mutation.kind === "create-food-log") {
        await httpClient.post("/food-log", mutation.payload);
      }

      if (mutation.kind === "create-weight-entry") {
        await httpClient.post("/progress/weight", mutation.payload);
      }

      await deleteOfflineMutation(mutation.id);
      syncedCount += 1;
    } catch (error) {
      if (!shouldKeepQueuedMutation(error)) {
        await deleteOfflineMutation(mutation.id);
        continue;
      }

      break;
    }
  }

  return syncedCount;
};
