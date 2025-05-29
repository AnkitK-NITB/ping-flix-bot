import axios from 'axios';

export const searchTMDB = async (query) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/multi`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          query
        }
      }
    );
    
    if (!response.data.results) return [];
    
    return response.data.results
      .filter(item => ['movie', 'tv'].includes(item.media_type))
      .slice(0, 5)
      .map(item => ({
        id: item.id,
        title: item.title || item.name,
        type: item.media_type === 'movie' ? 'Movie' : 
              item.media_type === 'tv' ? 'TV' : 'Other',
        media_type: item.media_type,
        release_date: item.release_date,
        first_air_date: item.first_air_date
      }));
  } catch (error) {
    console.error('TMDB search error:', error.message);
    return [];
  }
};