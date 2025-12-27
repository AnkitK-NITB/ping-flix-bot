import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const TMDB_API = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.TMDB_API_KEY
  }
});
TMDB_API.interceptors.request.use(request => {
  console.log('API Request:', {
    url: request.url,
    params: request.params,
    headers: request.headers
  });
  return request;
});

export const searchTMDB = async (query) => {
  try {
    const response = await TMDB_API.get(
      `/search/multi`,
      {
        params: {
          query
        }
      }
    );
    console.log('TMDB search response:', response.data);
    
    if (!response.data.results) return [];
    return response.data.results
      .filter(item => ['movie', 'tv'].includes(item.media_type))
      .sort((a, b) => new Date(b.release_date || b.first_air_date) - new Date(a.release_date || a.first_air_date))
      .slice(0, 10)
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
    const { data } = await TMDB_API.get(`/tv/${seriesId}`);
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
    const { data } = await TMDB_API.get(`/tv/${seriesId}`);
    console.log('Next episode data:', data);

    if (!data?.next_episode_to_air) return null;
    if (data.next_episode_to_air >=  data.seasons.find(season => season.season_number === data.next_episode_to_air.season_number).episode_count)
      return null;
    const { season_number, episode_number } = data.next_episode_to_air;
    const episodeResponse = await TMDB_API.get(
      `/tv/${seriesId}/season/${season_number}/episode/${episode_number+1}`
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
    const { data } = await TMDB_API.get(`/movie/${movieId}`);
    
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