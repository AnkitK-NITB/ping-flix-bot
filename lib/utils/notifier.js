import axios from 'axios'; 
import { getDueNotifications, handleNotification } from '../db/supabase.js';

export const notifyDueReleases = async () => {
  let notificationsProcessed = 0; 
  try {
    const notifications = await getDueNotifications();
    
    for (const notification of notifications) {
      await sendNotification(notification);
      await handleNotification(notification);
      notificationsProcessed++;
    }

  } catch (error) {
    console.error('Notification error:', error);
    throw error;
  }
  return notificationsProcessed;
};

async function sendNotification(notification) {
  try {
    await axios.post(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        chat_id: notification.chat_id,
        text: `🎉 Today is the day! ${notification.title} is now released.`
      }
    );
  } catch (error) {
    console.error(`Failed to send notification to chat ${notification.chat_id}:`, error.message);
    throw error;
  }
}