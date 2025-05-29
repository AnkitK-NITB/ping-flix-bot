import { searchTMDB } from '../services/tmdb.js';
import { storeNotification } from '../db/supabase.js';
import axios from 'axios';

export const handleStart = (ctx) => {
  ctx.reply('Welcome to PingFlix! 🎬\nSend me a movie, TV show, or anime title to track its release.');
};

export const handleText = async (ctx) => {
  const query = encodeURIComponent(ctx.message.text.trim());
  try {
    const results = await searchTMDB(query);
    
    if (!results || results.length === 0) {
      return ctx.reply('No results found. Try a different title.');
    }
    
    const options = results.map(item => [{
      text: `${item.title} (${getYear(item.release_date)})`,
      callback_data: `selected:${item.id}:${item.media_type}`
    }]);
    
    ctx.reply('Here are the top results:', {
      reply_markup: {
        inline_keyboard: options
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    ctx.reply('Error searching for titles. Please try again later.');
  }
};

export const handleSelection = async (ctx) => {
  const [mediaId, mediaType] = ctx.match.slice(1);
  
  try {
    const media = await getMediaDetails(mediaId, mediaType);
    
    if (!media) {
      return ctx.reply('Could not retrieve details. Please try again.');
    }
    
    const releaseDate = media.release_date || media.air_date;
    if (!releaseDate) {
      return ctx.reply('Release date is not available for this title.');
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (releaseDate <= today) {
      return ctx.reply(`${media.title} has already been released!`);
    }
    
    await storeNotification(ctx.chat.id, media);
    ctx.reply(`✅ I will notify you when ${media.title} releases on ${formatDate(releaseDate)}!`);
  } catch (error) {
    if (error.message === 'You are already tracking this title!') {
      ctx.reply(error.message);
    } else {
      console.error('Selection error:', error);
      ctx.reply('Failed to process your request. Please try again.');
    }
  }
};

// Helper functions
async function getMediaDetails(mediaId, mediaType) {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/${mediaType}/${mediaId}`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY
        }
      }
    );
    
    if (response.data.success === false) return null;
    
    return {
      id: response.data.id,
      title: response.data.title || response.data.name,
      release_date: mediaType === 'movie' ? 
        response.data.release_date : 
        (response.data.next_episode_to_air?.air_date || response.data.last_air_date),
      media_type: mediaType
    };
  } catch (error) {
    console.error('Media details error:', error.message);
    return null;
  }
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function getYear(dateString) {
  if (!dateString) return 'TBA';
  return new Date(dateString).getFullYear();
}