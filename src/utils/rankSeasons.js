import {getTitle} from "@/api/title.js";
import {getSeasons} from "@/api/season.js";
import store from "@/store/index"

export const searchTitle = async (seriesName) => {
    store.commit("setInput", seriesName)
    store.commit("setShow", {})
    store.commit("setRankedSeasons", {})
    try {
        const title = await getTitle(seriesName)
        store.commit("setShow", title.data)
        await getSeasonsEpisodes(title.data.imdbID, Number(title.data.totalSeasons))
    } catch (e) {
        throw new Error(e)
    }
}

async function getSeasonsEpisodes(titleId, seasons) {
    let seasonsNotes = {}
    for (let seasonNumber of [...Array(seasons).keys()]) {
        const season = await getSeasons(titleId, seasonNumber + 1)
        seasonsNotes[seasonNumber + 1] = getSeasonNote(season.data.Episodes, seasonNumber + 1)
    }

    rankSeasons(seasonsNotes)
}
let episodesNotes = {}
function getSeasonNote(episodes, seasonNumber) {
    let seasonRating = 0

    for (let [index, episode] of episodes.entries()) {
        if (!episodesNotes[seasonNumber]) {
            episodesNotes[seasonNumber] = []
        }
        episodesNotes[seasonNumber].push(episode.imdbRating)
        seasonRating += Number(episode.imdbRating)
        if (index === episodes.length - 1) {
            store.commit("setSeasonEpisodes", episodesNotes)
            return seasonRating / episodes.length
        }
    }
}

function rankSeasons(seasonsNotes) {
    let entries = Object.entries(seasonsNotes)
    let sorted = entries.sort((a, b) => b[1] - a[1])
    store.commit("setRankedSeasons", sorted)
}
