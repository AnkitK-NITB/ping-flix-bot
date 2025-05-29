import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export const storeNotification = async (chatId, media) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert([{
      chat_id: chatId,
      media_id: media.id,
      title: media.title,
      release_date: media.release_date,
    }]);
  
  if (error) throw error;
  return data;
};

export const getDueNotifications = async () => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('release_date', today)
    .eq('notified', false);
  
  if (error) throw error;
  return data;
};

export const markAsNotified = async (id) => {
  const { error } = await supabase
    .from('notifications')
    .update({ notified: true })
    .eq('id', id);
  
  if (error) throw error;
};