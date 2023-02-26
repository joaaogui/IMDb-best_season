<template>
  <v-container fluid>
    <v-row v-if="show.imageUrl">
      <v-col cols="12" lg="2" md="4" sm="6" xs="12">
        <v-img :src="show.imageUrl" contain></v-img>
      </v-col>
      <v-col>
        <div style="font-size: 30px">{{ show.name }}</div>
        <span>{{ show.description }}</span>
      </v-col>
    </v-row>

    <div
      :class="index === 0 ? 'best-season' : ''"
      :key="season[0]"
      class="season"
      v-for="(season, index) in rankedSeasons"
    >
      <span class="position">{{ index + 1 }}</span>
      <div class="ml-8 mr-8" style="display: block">
        <div>Season: {{ season[0] }}</div>
        <div>Rating: {{ season[1].toFixed(2) }}</div>
      </div>
      <div style="text-align: right">
        <v-icon style="top: 25%" @click.stop="showEpisodes(season[0])"
          >mdi-information-outline</v-icon
        >
      </div>
    </div>

    <v-dialog v-model="dialog" max-width="250" style="text-align: center">
      <v-card class="align-center pa-5" style="text-align: center">
        <div v-for="(episode, index) in activeSeason" :key="index">
          <span>Episode {{ index + 1 }} - Rating {{ episode }}</span>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import { searchTitle } from "@/utils/rankSeasons.js";

export default {
  name: "Seasons",
  data: () => ({
    dialog: false,
    season: null,
  }),
  computed: {
    ...mapState(["input", "rankedSeasons", "seasonEpisodes", "show"]),
    activeSeason() {
      console.log(this.seasonEpisodes[this.season]);
      return this.seasonEpisodes[this.season];
    },
  },
  mounted() {
    if (!this.input && this.$route.params.title) {
      searchTitle(this.$route.params.title);
    }
  },
  methods: {
    showEpisodes(season) {
      this.season = season;
      this.dialog = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.season {
  border: 2px solid gray;
  border-radius: 10px;
  margin: 5px;
  padding: 5px;
  display: flex;
}

.best-season {
  border: 2px solid gold;
}

.position {
  font-size: 28px;
}
</style>
