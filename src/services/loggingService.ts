import { db, handleFirestoreError, OperationType, doc, setDoc, increment, serverTimestamp } from '../lib/localDb';
import { auth } from '../lib/localAuth';

export async function logApiCall(userId?: string) {
  const today = new Date().toISOString().split('T')[0];
  const statRef = doc(db, 'usage_stats', today);
  const uid = userId || auth.currentUser?.uid;
  
  try {
    // 1. Log Global Stats
    await setDoc(statRef, {
      date: today,
      apiCalls: increment(1),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // 2. Log User-specific Stats (if uid available)
    if (uid) {
      const userStatRef = doc(db, 'user_stats', uid);
      await setDoc(userStatRef, {
        userId: uid,
        totalApiCalls: increment(1),
        lastUsedAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `usage_stats/${today}`, false);
  }
}
