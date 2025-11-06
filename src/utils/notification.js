// utils/notifications.js

/**
 * Send a notification to the backend
 * @param {Object} params
 * @param {number} params.userId - ID of the user who will receive the notification
 * @param {string} params.type - Type of notification ('reminder', 'grade', etc.)
 * @param {Object} params.context - Dynamic data for the notification
 * @returns {Promise<Object>} - Backend response
 */
export async function sendNotification({ userId, type, context }) {
    try {
      const res = await fetch("/createNotification/notifications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, type, context }),
      });
  
      if (!res.ok) throw new Error("Failed to send notification");
  
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Notification error:", err);
      return { success: false, error: err.message };
    }
  }
  