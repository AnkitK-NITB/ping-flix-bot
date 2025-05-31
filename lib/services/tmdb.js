import axios from 'axios';

const TMDB_API = axios.create({
  baseURL: 'https://api.themoviedb.org/3'
});

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
    console.log('TMDB search response:', response.data);
    
    if (!response.data.results) return [];
    
    return response.data.results
      .filter(item => ['movie', 'tv'].includes(item.media_type))
      .sort((a, b) => new Date(b.release_date || b.first_air_date) - new Date(a.release_date || a.first_air_date))
      .slice(0, 5)
      .map(item => ({
        id: item.id,
        title: item.title || item.name,
        media_type: item.media_type,
        release_date: item.media_type=='tv'? item.first_air_date :  item.release_date,
      }));
  } catch (error) {
    console.error('TMDB search error:', error.message);
    return [];
  }
};

export const getTVDetails = async (seriesId) => {
  try {
    const { data } = await TMDB_API.get(`/tv/${seriesId}`, {
      params: {
        api_key: process.env.TMDB_API_KEY
      }
    });
    
    if (!data || data.success === false) return null;
    
    return {
      id: data.id,
      title: data.name,
      release_date: data.next_episode_to_air?.air_date || data.last_air_date,
      media_type: 'tv'
    };
  } catch (error) {
    console.error('TV details error:', error.message);
    return null;
  }
};

export const getNextEpisodeDate = async (seriesId) => {
  try {
    const { data } = await TMDB_API.get(`/tv/${seriesId}`, {
      params: {
        api_key: process.env.TMDB_API_KEY
      }
    });
    console.log('Next episode data:', data);

    if (!data?.next_episode_to_air) return null;
    if (data.next_episode_to_air >=  data.seasons.find(season => season.season_number === data.next_episode_to_air.season_number).episode_count)
      return null;
    const { season_number, episode_number } = data.next_episode_to_air;
    const episodeResponse = await TMDB_API.get(
      `/tv/${seriesId}/season/${season_number}/episode/${episode_number+1}`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY
        }
      }
    );
    console.log('Next episode response:', episodeResponse.data);

    return episodeResponse.data?.air_date || null;
  } catch (error) {
    console.error('Next episode check error:', error.message);
    return null;
  }
};

export const getMovieDetails = async (movieId) => {
  try {
    const { data } = await TMDB_API.get(`/movie/${movieId}`, {
      params: {
        api_key: process.env.TMDB_API_KEY
      }
    });
    
    if (!data || data.success === false) return null;
    return {
      id: data.id,
      title: data.title,
      release_date: data.release_date,
      media_type: 'movie'
    };
  } catch (error) {
    console.error('Movie details error:', error.message);
    return null;
  }
};

export const getMediaDetails = async (mediaId, mediaType) => {
  return mediaType === 'movie' 
    ? getMovieDetails(mediaId) 
    : getTVDetails(mediaId);
};