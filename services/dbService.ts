import { Bill } from '../types';

const DB_NAME = 'SnapDocsDB';
const DB_VERSION = 1;
const STORE_NAME = 'bills';

let db: IDBDatabase;

/**
 * Initializes the IndexedDB database.
 * This function sets up the database and creates the object store if it doesn't exist.
 * @returns A promise that resolves with the database instance.
 */
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // If db is already initialized, return it
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    // This event is only fired when the version changes.
    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      // Create an object store for bills if it doesn't already exist.
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        // Use 'id' as the primary key.
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Adds a new bill to the database.
 * @param bill The bill object to add.
 * @returns A promise that resolves with the added bill.
 */
export const addBill = async (bill: Bill): Promise<Bill> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    // Use a 'readwrite' transaction to allow adding data.
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(bill);

    transaction.oncomplete = () => {
      resolve(bill);
    };

    transaction.onerror = () => {
      console.error('Error adding bill:', transaction.error);
      reject('Could not add bill to the database.');
    };
  });
};

/**
 * Retrieves all bills from the database.
 * @returns A promise that resolves with an array of all bills, sorted by bill date descending.
 */
export const getAllBills = async (): Promise<Bill[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    // Use a 'readonly' transaction for retrieving data.
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      // Sort by billDate descending to show the most recent bills first.
      const sortedBills = request.result.sort((a, b) => 
        new Date(b.billDate).getTime() - new Date(a.billDate).getTime()
      );
      resolve(sortedBills);
    };

    request.onerror = () => {
      console.error('Error getting bills:', request.error);
      reject('Could not retrieve bills from the database.');
    };
  });
};
