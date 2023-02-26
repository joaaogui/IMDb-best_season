import axios from "./index"

const getEpisode = (id, season, episode) => axios.get(`?i=${id}&Season=${season}&Episode=${episode}&apikey=${import.meta.env.VITE_API_KEY}`)
const getSeasons = (id, season) => axios.get(`?t=${id}&Season=${season}&apikey=${import.meta.env.VITE_API_KEY}`)

export {
  getEpisode,
  getSeasons
}