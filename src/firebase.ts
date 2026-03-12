import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const dbId = (firebaseConfig as any).firestoreDatabaseId === '(default)' ? undefined : (firebaseConfig as any).firestoreDatabaseId;
export const db = getFirestore(app, dbId);
export const auth = getAuth(app);

async function testConnection() {
  try {
    // Intentamos leer un documento inexistente para probar la conexión
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firebase Error: The client is offline. Please check your Firebase configuration.");
    } else {
      console.log("Firebase connection test finished (expected error if 'test/connection' doesn't exist):", error);
    }
  }
}
testConnection();
