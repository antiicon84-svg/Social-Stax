import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { onCall, HttpsError } from "firebase-functions/v2/https";

admin.initializeApp();
const db = admin.firestore();

/**
 * A scheduled Cloud Function that runs at 00:00 on the first day of every month.
 * It iterates through all users and resets their monthly usage counters.
 */
export const resetmonthlyusage = onSchedule("0 0 1 * *", async (event) => { // Production schedule
  logger.info("Starting monthly usage reset for all users.", { structuredData: true });

  const usersRef = db.collection("users");
  const snapshot = await usersRef.get();

  if (snapshot.empty) {
    logger.info("No users found to reset.", { structuredData: true });
    return;
  }

  // Use a batched write to update all users efficiently.
  // Firestore batches are limited to 500 operations.
  const batchArray: admin.firestore.WriteBatch[] = [];
  batchArray.push(db.batch());
  let operationCounter = 0;
  let batchIndex = 0;

  snapshot.forEach((doc) => {
    const userRef = doc.ref;
    const newUsage = {
      contentGenerations: 0,
      imageGenerations: 0,
      voiceAssistantMinutes: 0,
      apiCalls: 0,
      lastReset: new Date(), // Set reset time to now
    };

    batchArray[batchIndex].update(userRef, { usage: newUsage });
    operationCounter++;

    if (operationCounter === 499) {
      batchArray.push(db.batch());
      batchIndex++;
      operationCounter = 0;
    }
  });

  await Promise.all(batchArray.map((batch) => batch.commit()));

  logger.info(`Successfully reset usage for ${snapshot.size} users.`, { structuredData: true });
});

/**
 * A callable Cloud Function that allows an admin to manually trigger a usage reset for all users.
 * This is useful for testing and end-of-cycle corrections.
 */
export const manualusagereset = onCall(async (request) => {
  // 1. Authenticate the request
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  // 2. Verify the caller is an admin
  const adminUid = request.auth.uid;
  const adminUserDoc = await db.collection("users").doc(adminUid).get();
  if (adminUserDoc.data()?.role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can trigger a manual usage reset.");
  }

  logger.info(`Manual usage reset triggered by admin: ${adminUid}`, { structuredData: true });

  // 3. Perform the reset logic (same as the scheduled function)
  const usersRef = db.collection("users");
  const snapshot = await usersRef.get();

  if (snapshot.empty) {
    return { status: "success", message: "No users found to reset." };
  }

  const batchArray: admin.firestore.WriteBatch[] = [db.batch()];
  let operationCounter = 0;
  let batchIndex = 0;

  snapshot.forEach((doc) => {
    const newUsage = {
      contentGenerations: 0, imageGenerations: 0, voiceAssistantMinutes: 0, apiCalls: 0, lastReset: new Date(),
    };
    batchArray[batchIndex].update(doc.ref, { usage: newUsage });
    operationCounter++;

    if (operationCounter === 499) {
      batchArray.push(db.batch());
      batchIndex++;
      operationCounter = 0;
    }
  });

  await Promise.all(batchArray.map((batch) => batch.commit()));

  return { status: "success", message: `Successfully reset usage for ${snapshot.size} users.` };
});