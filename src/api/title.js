import axios from "./index"

const getTitle = (title) => axios.get(`?t=${title}&apikey=${import.meta.env.VITE_API_KEY}`)

export {
  getTitle
}
