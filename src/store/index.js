import { createStore } from 'vuex'

export default createStore({
  state: {
    input: "",
    rankedSeasons: [],
    seasonEpisodes: {},
    show: {
      imageUrl: null,
      name: null,
      description: null
    }
  },
  mutations: {
    setRankedSeasons(state, rankedSeasons) {
      state.rankedSeasons = rankedSeasons
    },
    setSeasonEpisodes(state, seasonEpisodes) {
      state.seasonEpisodes = seasonEpisodes
    },
    setInput(state, input) {
      state.input = input
    },
    setShow(state, show) {
      state.show.imageUrl = show.Poster
      state.show.name = show.Title
      state.show.description = show.Plot
    }
  },
  getters: {
    showAppBar: state => {
      return !!state.input
    }
  },
  actions: {},
  modules: {}
})
