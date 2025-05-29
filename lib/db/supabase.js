import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export const storeNotification = async (chatId, media) => {
  const { data, error } = await supabase
    .from('notifications')
    .upsert({
      chat_id: chatId,
      media_id: media.id,
      title: media.title,
      release_date: media.release_date
    }, {
      onConflict: 'chat_id,media_id',
      ignoreDuplicates: false
    });
  
  if (error) {
    if (error.code === '23505') { // Unique violation code
      throw new Error('You are already tracking this title!');
    }
    throw error;
  }
  return data;
};

export const getDueNotifications = async () => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('release_date', today);
  
  if (error) throw error;
  return data;
};

export const removeNotification = async (id) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};