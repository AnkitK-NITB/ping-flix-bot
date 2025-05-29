import { searchTMDB, getMediaDetails } from '../services/tmdb.js';
import { storeNotification } from '../db/supabase.js';

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
  console.log(ctx.match);
  
  try {
    const media = await getMediaDetails(mediaId, mediaType);
    console.log('Selected media:', media);
    if (!media) {
      return ctx.reply('Could not retrieve details. Please try again.');
    }
    
    const releaseDate = media.release_date;
    if (!releaseDate) {
      return ctx.reply('Release date is not available for this title.');
    }
    
    const today = new Date().setHours(0, 0, 0, 0);
    const releaseDateTime = new Date(releaseDate).setHours(0, 0, 0, 0);

    if (releaseDateTime < today) {
      return ctx.reply(`${media.title} has already been released!`);
    }
    
    await storeNotification(ctx.chat.id, media);
    ctx.reply(`✅ I will notify you when ${media.title} releases on ${formatDate(releaseDate)}!`);
  } catch (error) {
    if(error.code=='23505') ctx.reply('You are already tracking this title.');
    else ctx.reply('Failed to process your request. Please try again.');
    console.error('Selection error:', error);
  }
};

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function getYear(dateString) {
  if (!dateString) return 'TBA';
  return new Date(dateString).getFullYear();
}