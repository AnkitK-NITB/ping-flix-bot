import { createClient } from '@supabase/supabase-js';
import { getTVDetails, getNextEpisodeDate } from '../services/tmdb.js';
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
      media_type: media.media_type
    }]);
  
  if (error) throw error;
  return data;
};

export const getDueNotifications = async () => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('release_date', today);
  
  if (error) throw error;
  return data || [];
};

export const handleNotification = async (notification) => {
  const { id, media_type, media_id } = notification;
  
  try {
    if (media_type === 'movie') {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } else {
      const nextAirDate = await getNextEpisodeDate(media_id);
      if (nextAirDate) {
        const { error } = await supabase
          .from('notifications')
          .update({ release_date: nextAirDate })
          .eq('id', id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
      }
    }
  } catch (error) {
    console.error('Error handling notification:', error);
    throw error;
  }
};